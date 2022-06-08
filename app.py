from flask import Flask, render_template
import os
import sys


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


args = argparser(sys.argv)
print(args)

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
