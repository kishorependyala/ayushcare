from flask import Flask, request, jsonify
import random
import time
import uuid

app = Flask(__name__)

otp_store = {}
session_store = {}

def generate_otp_code():
    return str(random.randint(100000, 999999))

def set_otp_for_phone(phone, code):
    expiry = time.time() + 5 * 60  # 5 minutes
    otp_store[phone] = {'code': code, 'expiry': expiry}

def get_otp_for_phone(phone):
    entry = otp_store.get(phone)
    if not entry or time.time() > entry['expiry']:
        return None
    return entry

def remove_otp_for_phone(phone):
    otp_store.pop(phone, None)

def create_session_token(phone):
    token = str(uuid.uuid4())
    session_store[token] = {'phone': phone, 'created_at': time.time()}
    return token

def get_session_phone(token):
    entry = session_store.get(token)
    return entry['phone'] if entry else None

def is_valid_phone(phone):
    import re
    return bool(re.match(r'^\+?\d{10,15}$', phone))

@app.route('/api/sendOtp', methods=['POST'])
def send_otp():
    data = request.get_json()
    phone = data.get('phone')
    if not phone or not is_valid_phone(phone):
        return jsonify({'error': 'Invalid phone number'}), 400
    
    code = generate_otp_code()
    set_otp_for_phone(phone, code)
    # For mock, return the OTP
    return jsonify({'otp': code}), 200

@app.route('/api/verifyOtp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    phone = data.get('phone')
    code = data.get('code')
    if not phone or not code or not is_valid_phone(phone):
        return jsonify({'error': 'Invalid input'}), 400
    
    entry = get_otp_for_phone(phone)
    if not entry or entry['code'] != code:
        return jsonify({'error': 'Invalid OTP'}), 400
    
    remove_otp_for_phone(phone)
    token = create_session_token(phone)
    return jsonify({'token': token}), 200

if __name__ == '__main__':
    app.run(debug=True, port=7071)