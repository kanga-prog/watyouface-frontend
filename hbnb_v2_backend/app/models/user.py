# models/user.py
from datetime import datetime, timedelta
import secrets
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db

class User(db.Model):
    """Modèle utilisateur du projet HBnB"""
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(256), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    phone_number = db.Column(db.String(20), unique=True, nullable=True)
    country = db.Column(db.String(30), nullable=False)
    town = db.Column(db.String(30), nullable=False)
    avatar = db.Column(db.String(256), nullable=True) 
    reset_password_token = db.Column(db.String(128), nullable=True)
    reset_token_expiration = db.Column(db.DateTime, nullable=True)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)

    def set_password(self, password):
        """Hash et définit le mot de passe"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Vérifie le mot de passe"""
        return check_password_hash(self.password_hash, password)

    def generate_reset_token(self, expires_in=3600):
        """Génère un token de réinitialisation avec expiration"""
        self.reset_password_token = secrets.token_urlsafe(32)
        self.reset_token_expiration = datetime.utcnow() + timedelta(seconds=expires_in)
        return self.reset_password_token

    def verify_reset_token(self, token):
        """Vérifie si le token est valide et non expiré"""
        if self.reset_password_token != token:
            return False
        if not self.reset_token_expiration or datetime.utcnow() > self.reset_token_expiration:
            return False
        return True
