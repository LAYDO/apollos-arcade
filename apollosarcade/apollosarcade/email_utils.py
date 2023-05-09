from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from email.mime.text import MIMEText
import base64, os

def send_email(sender, to, subject, body):
    try:
        service = build('gmail', 'v1', credentials=os.environ.get('GMAIL_API_CREDS', None))  # 'creds' is the authenticated Google API credentials object
        message = MIMEText(body)
        message['to'] = to
        message['subject'] = subject
        message['from'] = sender
        create_message = {'raw': base64.urlsafe_b64encode(message.as_bytes()).decode()}
        send_message = (service.users().messages().send(userId="me", body=create_message).execute())
        print(F'sent message to {to} Message Id: {send_message["id"]}')
    except HttpError as error:
        print(F'An error occurred: {error}')
        send_message = None
    return send_message
