import json
import logging
import asyncio
import os

from flask import Flask, jsonify, request
from remote_llm.client import ClientLLM

app = Flask(__name__)
logger = logging.getLogger(__name__)

LLM_HOST = os.environ.get('LLM_HOST', 'localhost')
LLM_PORT = os.environ.get('LLM_PORT', 50055)
LLM_API_KEY = os.environ.get('LLM_API_KEY', 'eeb420b9-2832-473c-b560-64b12523d718')

# Initialize the LLM client.
client = ClientLLM(host=LLM_HOST, port=LLM_PORT, api_key=LLM_API_KEY)


@app.route('/', methods=['GET'])
def index():
    return jsonify({'message': 'Hello, World!'})


@app.route('/llm_name', methods=['GET'])
def get_llm_name():
    # Get the name of the running LLM.
    result = asyncio.run(client.llm_name())
    return jsonify({'llm_name': result})


@app.route('/generate_text', methods=['POST'])
def generate_text():
    # Generate text given a prompt.
    prompt = request.json['prompt']
    result = asyncio.run(client.generate_text([prompt]))
    return jsonify({'generated_text': result})


@app.route('/generational_guts', methods=['POST'])
def get_generational_guts():
    # Get the generational guts for a prompt.
    prompt = request.json['prompt']
    response_type = request.json.get('response_type', 'json')
    if response_type == 'json':
        guts = asyncio.run(client.generational_guts(prompt, response_type="json"))
        guts_dict = json.loads(guts)
        return jsonify({'generational_guts': guts_dict})
    else:
        guts = asyncio.run(client.generational_guts(prompt, response_type="text"))
        return str(guts)


if __name__ == "__main__":
    app.run()
