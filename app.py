from flask import Flask, render_template, send_file, send_from_directory
import time

app = Flask('app')


@app.route('/')
def main():
    return render_template('main.html')


@app.route('/js/p5.min.js')
def p5js():
    return send_file('p5.min.js')


@app.route('/js/game.js')
def game_js():
    return send_file('game.js')


@app.route('/js/game.css')
def game_css():
    return send_file('game.css')


@app.route('/assets/images/<path:path>')
def img(path):
    return send_from_directory('images', path)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
