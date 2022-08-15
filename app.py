import random
import re
import subprocess

import flask
from flask import Flask, render_template, send_from_directory
import os
import sys
import shlex
import shutil
import time

lag = 0


def argparser(argv: list):
    PARAMS = {'staticbuild': ('s',), 'pages': ('p',)}
    provided = []

    def find_long_from_short(short):
        for key, values in PARAMS.items():
            if short in values:
                return key

    for arg in argv[1:]:
        if arg.startswith('-') and not arg.startswith('--'):
            # parse short
            provided.append(find_long_from_short(arg[1:]))
        elif arg.startswith('--'):
            provided.append(arg[2:])
    return provided


def run_args(args: list):
    if 'staticbuild' in args:
        # side effects only
        # noinspection PyUnresolvedReferences
        import lightbuild
        sys.exit(0)


args = argparser(sys.argv)
if len(args) > 0:
    print(args)
    run_args(args)

app = Flask('app')
if 'secret' in os.environ.keys():
    app.secret_key = os.environ['secret']
else:
    print('!!! DEFAULT SECRET KEY IN USE !!!')
    app.secret_key = 'default_please_dont_use_this_in_prod'
simlag = 0


@app.route('/')
def main():
    return render_template('main.html')


@app.route(app.static_url_path + '/' + '<path:path>' + '.js')
def js_mime_type(path):
    return flask.send_from_directory(
        directory=app.static_folder,
        filename=path + '.js',
        mimetype='text/javascript'
    )


@app.route(app.static_url_path + '/' + '<path:path>' + '.mjs')
def mjs_mime_type(path):
    return flask.send_from_directory(
        directory=app.static_folder,
        filename=path + '.mjs',
        mimetype='text/javascript'
    )


@app.after_request
def after(res: flask.Response):
    time.sleep(random.randint(0, lag * 1000) / 1000)
    return res


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
