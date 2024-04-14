import flask
from flask import request, jsonify

app = flask.Flask(__name__)

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Hello, World!"})