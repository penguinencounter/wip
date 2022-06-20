import re
import subprocess
from flask import Flask, render_template
import os
import sys
import shlex
import shutil
import time


def argparser(argv: list):
    PARAMS = {'staticbuild': ('s',)}
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


def safe_to_switch():
    runner = subprocess.run(shlex.split('git status --porcelain'), capture_output=True)
    if runner.returncode != 0:
        print('git status failed - not a git repo or other problem')
        return False
    if runner.stdout.strip() != b'':
        print('git status not clean - not safe to switch')
        return False
    return True


def run_args(args: list):
    if 'staticbuild' in args:
        base = input("base for URLs? ")
        print('Building static files...', flush=True)
        if os.path.exists('out'):
            print('Clearing out old files...', flush=True)
            shutil.rmtree('out')
        os.mkdir('out')
        print('Copying files...', flush=True)
        shutil.copyfile("templates/main.html", "out/index.html")
        shutil.copytree("static", "out/static")
        print('Patching URLs with "{}"...'.format(base), flush=True)
        files = {}
        for cwd, _, f in os.walk('out'):
            for fp in f:
                if fp.endswith('.html') or fp.endswith('.mjs'):
                    print(f'Patching {fp} in {cwd}')
                    with open(os.path.join(cwd, fp), 'r') as f:
                        content = f.read()
                    oldsize = len(content)
                    content = re.sub(r"(['\"])(/static/.*)\1", fr"\1{base}\2\1", content)
                    print(f'{fp}: {oldsize} -> {len(content)} char, +{len(content)/oldsize-1:.2%}')
                    with open(os.path.join(cwd, fp), 'w') as f:
                        f.write(content)
                    files[os.path.join(cwd, fp)] = content
        if safe_to_switch():
            print('Checking out publishing branch `pages-static-build`...')
            subprocess.run(shlex.split('git checkout pages-static-build'))
            print('Beginning write.')
            
            for fp, content in files.items():
                fp2 = fp.replace('out' + os.path.sep, '')
                print(fp2)
                input()
                print(f'write {len(content)} char to {fp2}')
                os.makedirs(os.sep.join(os.path.split(fp2)[:-1]), exist_ok=True)
                with open(fp2, 'w') as f:
                    f.write(content)
            input('?= ')
            print('Committing...')
            subprocess.run(shlex.split('git add .'))
            subprocess.run(shlex.split('git commit -m "Publish static files: {}"'.format(time.asctime())))
            print('Pushing...')
            subprocess.run(shlex.split('git push'))
            print('Returning to previous branch...')
            subprocess.run(shlex.split('git checkout -'))
        print('Build complete')
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
