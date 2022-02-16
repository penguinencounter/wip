from flask import Flask, render_template, send_file
app = Flask('app')

@app.route('/')
def hello_world():
    return render_template('main.html')

@app.route('/js/p5.min.js')
def p5js():
    return send_file('p5.min.js')

@app.route('/js/game.js')
def gamejs():
    return send_file('game.js')

@app.route('/js/game.css')
def gamecss():
    return send_file('game.css')
app.run(host='0.0.0.0', port=8080, debug=True)