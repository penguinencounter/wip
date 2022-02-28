from flask import Flask, render_template, send_from_directory, jsonify, request
from datastructures import ServerMeta
import time
from json import load as jload, dump as jdump
import os

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


@app.route('/login')
def login():
    return render_template('login.html')


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
    app.run(host='0.0.0.0', port=8080, debug=True)
