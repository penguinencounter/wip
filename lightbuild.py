import os
import shutil
import shlex
import subprocess
import sys
import time
import re


class ParserError(Exception):
    pass


FILE_COMMENT_MARKERS = {
    '.html': ('<!--', '-->'),
    '.js': ('/*', '*/'),
    '.mjs': ('/*', '*/'),
    '.json': (ParserError('JSON isn\'t supported!'), '')
}


def magic(file_contents: str, filetype: str):
    flag = re.MULTILINE
    if filetype not in FILE_COMMENT_MARKERS.keys():
        return file_contents
    start = FILE_COMMENT_MARKERS[filetype][0]
    end = FILE_COMMENT_MARKERS[filetype][1]
    re1 = r"\[NORELEASE\][\w\W]*?\[END NORELEASE\]"
    su1 = r"[norelease redacted]"
    re2 = r"\[RELEASEONLY\](.*)$"
    su2 = rf"[release]\1 {end}"
    re3 = r"\[END RELEASEONLY\]"
    su3 = rf"{start} [end release]"

    # sub
    file_contents = re.sub(re1, su1, file_contents, flags=flag)
    file_contents = re.sub(re2, su2, file_contents, flags=flag)
    file_contents = re.sub(re3, su3, file_contents, flags=flag)
    return file_contents


def safe_to_switch():
    runner = subprocess.run(shlex.split('git status --porcelain'), capture_output=True)
    if runner.returncode != 0:
        print('git status failed - not a git repo or other problem')
        return False
    if runner.stdout.strip() != b'':
        print('git status not clean - not safe to switch')
        return False
    return True


base = '/wip'
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
        final_ext = os.path.splitext(fp)[1]
        ext = '.' + '.'.join(final_ext.split('.')[1:])
        if fp.endswith('.html') or fp.endswith('.mjs') or fp.endswith('.json'):
            print(f'Patching {fp} in {cwd}... ', flush=True, end='')
            with open(os.path.join(cwd, fp), 'r') as file_obj:
                content = file_obj.read()
            oldsize = len(content)
            content = magic(content, final_ext)
            content = re.sub(r"(['\"])(/static/.*)\1", fr"\1{base}\2\1", content)
            print(f'{oldsize} -> {len(content)} char, {len(content) / oldsize - 1:+.2%}... ', flush=True, end='')
            with open(os.path.join(cwd, fp), 'w') as file_obj:
                file_obj.write(content)
        else:
            print(f'Reading {fp} (in {cwd})... ', end='', flush=True)
            with open(os.path.join(cwd, fp), 'rb') as file_obj:
                content = file_obj.read()
            if ext in []:  # add additional extensions here
                oldsize = len(content)
                content = magic(content.decode('utf-8'), final_ext)
                print(f'{oldsize} -> {len(content)} char, +{len(content) / oldsize - 1:+.2%}... ', flush=True, end='')
        files[os.path.join(cwd, fp)] = content
        print(' done.', flush=True)
if safe_to_switch():
    print('Checking out publishing branch `pages-static-build`...')
    subprocess.run(shlex.split('git checkout pages-static-build'))
    print('Beginning write.')

    for fp, content in files.items():
        fp2 = fp.replace('out' + os.path.sep, '')
        print(fp2)
        print(f'write {len(content)} char to {fp2}')
        if os.sep in fp2:
            os.makedirs(os.sep.join(os.path.split(fp2)[:-1]), exist_ok=True)
        if type(content) == bytes:
            with open(fp2, 'wb') as file_obj:
                file_obj.write(content)
        else:
            with open(fp2, 'w') as file_obj:
                file_obj.write(content)
    print('Committing...')
    subprocess.run(shlex.split('git add .'))
    subprocess.run(shlex.split('git commit -m "Publish static files: {}"'.format(time.asctime())))
    print('Pushing...')
    subprocess.run(shlex.split('git push'))
    print('Returning to previous branch...')
    subprocess.run(shlex.split('git checkout -'))
print('Build complete')
