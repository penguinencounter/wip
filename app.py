from flask import Flask, render_template
import os

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
