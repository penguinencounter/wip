from flask import Flask, render_template, send_from_directory, jsonify, request
from datastructures import ServerMeta, users, dump_users, load_users
import time
from json import load as jload, dump as jdump
import os
import re
import hashlib

app = Flask('app')
simlag = 0


SERVERS = [
    ServerMeta(-1, "CelestiaDev"),
    ServerMeta(1, "ProdTest")
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
    return re.search(rx, name) is not None and name not in users


@app.route('/login', methods=('GET', 'POST'))
def login():
    if request.method == 'GET':
        return render_template('login.html', message='')
    if request.method == 'POST':
        if request.form['submit'] == 'Login':
            return 'login'
        if request.form['submit'] == 'Register':
            name = request.form['name']
            passwd = request.form['pass']
            hash = hashlib.sha256(bytes(passwd, encoding='utf-8')).hexdigest()
            valid = validate_username(name)
            if valid:
                users[name] = hash
                print(f'registering {name} with {hash}')
                dump_users()
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


if __name__ == '__main__':
    load_users()
    app.run(host='0.0.0.0', port=8080, debug=True)
