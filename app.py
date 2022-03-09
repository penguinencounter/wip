from flask import Flask, render_template, send_from_directory, jsonify, request, session, redirect
import datastructures
import time
from json import load as jload, dump as jdump
import os
import re
import hashlib

app = Flask('app')
app.secret_key = os.environ['secret']
simlag = 0


SERVERS = [
    datastructures.ServerMeta(-1, "CelestiaDev"),
    datastructures.ServerMeta(1, "ProdTest")
]


@app.route('/')
def main():
    return render_template('main.html')


@app.route('/assets/web/<path:path>')
def wast(path):
    time.sleep(simlag)
    return send_from_directory('webassets', path)


@app.route('/assets/images/<path:path>')
def img(path):
    time.sleep(simlag)
    return send_from_directory('images', path)


@app.route('/servers')
def get_servers():
    return jsonify(list(map(lambda x: x.__dict__, SERVERS)))


def validate_username(name):
    rx = r'^[\w-]{3,18}$'
    return re.search(rx, name) is not None and name not in datastructures.users


def validate_token(token):
    print(f'Validate token {token[:8]}...')
    for user in datastructures.users.values():
        if token in user.tokens:
            print(f'Valid token for {user.name}')
            return user.name
    print('Invalid token')
    return None


@app.route('/validate_me')
def validateme():
    if 'token' not in session.keys():
        return {
            'result': False,
            'reason': 'No token'
        }
    result = validate_token(session['token'])
    if result:
        return {
            'result': True,
            'user': result
        }
    else:
        return {
            'result': False,
            'reason': 'Invalid token'
        }
    return {
        'result': False,
        'reason': 'Something went wrong!!'
    }


@app.route('/login', methods=('GET', 'POST'))
def login():
    print(f'{len(datastructures.users)} users')
    if request.method == 'GET':
        return render_template('login.html', message='')
    if request.method == 'POST':
        if request.form['submit'] == 'Login':
            name = request.form['name']
            passwd = request.form['pass']
            hash = hashlib.sha256(bytes(passwd, encoding='utf-8')).hexdigest()
            if name not in datastructures.users.keys():
                print(f'Login failed: user {name} not found')
                return render_template('login.html', message='Invalid username or password')
            if datastructures.users[name].hash != hash:
                print(f'Login failed: Incorrect password for {name}')
                return render_template('login.html', message='Invalid username or password')
            print(f'Successful login for {name} ({hash[:8]})')
            # Success login
            new_token = datastructures.users[name].gen_token()
            session['token'] = new_token
            print(session)
            return redirect('/#SelectProfile')
        if request.form['submit'] == 'Register':
            name = request.form['name']
            passwd = request.form['pass']
            hash = hashlib.sha256(bytes(passwd, encoding='utf-8')).hexdigest()
            valid = validate_username(name)
            if valid:
                datastructures.users[name] = datastructures.User(name, hash)
                print(f'registering {name} with {hash[:8]}...')
                datastructures.dump_users()
                return render_template('login.html', message='Success! You can now log in.')
            else:
                return render_template('login.html', message='Failed: bad username')


@app.route('/report_err', methods=("POST",))
def errorReport():
    msg = request.form['msg']
    if os.path.exists('error_reports.json'):
        with open('error_reports.json') as f:
            d = jload(f)
    else:
        d = {}
    if msg not in d.keys():
        d[msg] = 1
    else:
        d[msg] += 1
    print(f'Error report: {msg}, new count: {d[msg]}')
    with open('error_reports.json', 'w') as f:
        jdump(d, f, indent=4)
    return str(d[msg])


@app.before_first_request
def preload():
    print('preload: Loading users')
    datastructures.load_users()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
