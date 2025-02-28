# app.py
from flask import Flask, jsonify
from flask_cors import CORS  # Import CORS
import subprocess
import threading
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variable to store logs
logs = []

def run_agent():
    global logs
    process = subprocess.Popen(['python', '/home/dharshan/dev/conflux-ai/models/agent.py'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    while True:
        output = process.stdout.readline()
        if output == b"" and process.poll() is not None:
            break
        if output:
            logs.append(output.decode().strip())
            print("Log added:", output.decode().strip())  # Print to confirm log addition

@app.route('/logs', methods=['GET'])
def get_logs():
    return jsonify(logs)

@app.route('/start-trade', methods=['POST'])
def start_trade():
    # Start the trading agent in a separate thread
    threading.Thread(target=run_agent).start()
    return jsonify({"message": "Trade execution started."}), 200

if __name__ == '__main__':
    app.run(port=5000)  # Run Flask on port 5000