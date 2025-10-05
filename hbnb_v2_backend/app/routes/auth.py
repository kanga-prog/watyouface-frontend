import random
from datetime import datetime, timedelta

from flask import request, jsonify
from app.facades.user_facade import UserFacade
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash
from app.models.user import User
from app.extensions import db,mail
from flask_mail import Message

api = Namespace('auth', description='Authentication operations')

# Temp store (à remplacer par Redis ou DB en prod)
two_factor_store = {}
password_reset_store = {}

# === UTILITY ===
def send_2fa_code(email, code):
    msg = Message(
        subject="Your 2FA Code",
        recipients=[email],
        body=f"Votre code de vérification 2FA est : {code}"
    )
    mail.send(msg)

def send_reset_code(email, code):
    msg = Message(
        subject="Réinitialisation de votre mot de passe",
        recipients=[email],
        body=f"Votre code pour réinitialiser le mot de passe est : {code}"
    )
    mail.send(msg)

# === MODELS ===
register_model = api.model('Register', {
    'username': fields.String(required=True),
    'email': fields.String(required=True),
    'password': fields.String(required=True),
    'phone_number': fields.String(required=True),
    'country': fields.String(required=True),
    'town': fields.String(required=True),
})

login_model = api.model('Login', {
    'email': fields.String(required=True),
    'password': fields.String(required=True)
})

verify_model = api.model('Verify2FA', {
    'email': fields.String(required=True),
    'code': fields.String(required=True)
})

reset_request_model = api.model("PasswordResetRequest", {
    "email": fields.String(required=True)
})

reset_password_model = api.model("ResetPassword", {
    "email": fields.String(required=True),
    "code": fields.String(required=True),
    "new_password": fields.String(required=True)
})

# === ROUTES ===
@api.route('/register')
class Register(Resource):
    @api.expect(register_model)
    def post(self):
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        phone_number = data.get('phone_number')
        country = data.get('country')
        town = data.get('town')

        missing_fields = [f for f in ['username', 'email', 'password', 'phone_number', 'country', 'town'] if not data.get(f)]
        if missing_fields:
            return {'message': f'Missing fields: {", ".join(missing_fields)}'}, 400

        if User.query.filter_by(email=email).first():
            return {'message': 'Email already registered'}, 409

        if User.query.filter_by(phone_number=phone_number).first():
            return {'message': 'Phone number already registered'}, 409    

        new_user = User(
            username=username,
            email=email,
            phone_number=phone_number,
            country=country,
            town=town
        )
        new_user.set_password(password)

        try:
            db.session.add(new_user)
            db.session.commit()
            return {'message': 'User registered successfully'}, 201
        except Exception as e:
            db.session.rollback()
            return {'message': 'Internal server error', 'error': str(e)}, 500

@api.route('/login')
class Login(Resource):
    @api.expect(login_model)
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password_hash, password):
            return {'message': 'Invalid credentials'}, 401

        code = str(random.randint(100000, 999999))
        expires = datetime.utcnow() + timedelta(minutes=10)

        two_factor_store[email] = {
            'code': code,
            'expires': expires,
            'user_id': user.id
        }

        try:
            send_2fa_code(email, code)
        except Exception as e:
            return {'message': f'Failed to send code: {str(e)}'}, 500

        return {'message': '2FA code sent to your email'}, 200

@api.route('/verify-2fa')
class Verify2FA(Resource):
    @api.expect(verify_model)
    def post(self):
        data = request.get_json()
        email = data.get('email')
        code = data.get('code')

        record = two_factor_store.get(email)
        if not record:
            return {'message': 'No code found. Please login again.'}, 404

        if datetime.utcnow() > record['expires']:
            return {'message': 'Code expired. Please login again.'}, 400

        if code != record['code']:
            return {'message': 'Invalid code'}, 401

        user = User.query.get(record['user_id'])
        if not user:
            return {"message": "User not found"}, 404

        # ✅ JWT avec seulement l’essentiel
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={
                "username": user.username,
                "is_admin": user.is_admin
            }
        )

        del two_factor_store[email]

        return {"access_token": access_token}, 200

@api.route("/forgot_password")
class ForgotPassword(Resource):
    @api.expect(reset_request_model)
    def post(self):
        """Envoie un code de réinitialisation à l'email de l'utilisateur"""
        data = request.get_json()
        email = data.get("email")
        if not email:
            return {"msg": "Email required"}, 400

        user = UserFacade.get_user_by_email(email)
        if not user:
            return {"msg": "User not found"}, 404

        # Génération du code temporaire
        code = str(random.randint(100000, 999999))
        expires = datetime.utcnow() + timedelta(minutes=10)

        password_reset_store[email] = {"code": code, "expires": expires, "user_id": user.id}

        try:
            send_reset_code(email, code)
        except Exception as e:
            return {"msg": f"Failed to send code: {str(e)}"}, 500

        return {"msg": "Reset code sent to email"}, 200

@api.route("/reset_password")
class ResetPassword(Resource):
    @api.expect(reset_password_model)
    def post(self):
        """Réinitialise le mot de passe si le code est correct"""
        data = request.get_json()
        email = data.get("email")
        code = data.get("code")
        new_password = data.get("new_password")

        if not email or not code or not new_password:
            return {"msg": "Email, code and new password required"}, 400

        record = password_reset_store.get(email)
        if not record:
            return {"msg": "No reset request found"}, 404
        if datetime.utcnow() > record["expires"]:
            return {"msg": "Reset code expired"}, 400
        if code != record["code"]:
            return {"msg": "Invalid code"}, 401

        # Mise à jour du mot de passe
        UserFacade.update_user(record["user_id"], password=new_password)
        del password_reset_store[email]

        # Optionnel : générer JWT pour connexion immédiate
        access_token = create_access_token(identity=str(record["user_id"]))

        return {"msg": "Password reset successfully", "access_token": access_token}, 200
