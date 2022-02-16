from flask import Flask, render_template, send_from_directory
import time

app = Flask('app')
simlag = 0


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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=False)
