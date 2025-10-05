# facades/user_facade.py
from flask import abort
from werkzeug.security import generate_password_hash
from app.extensions import db
from app.models import User
from sqlalchemy import or_

class UserFacade:
    @staticmethod
    def get_all_users():
        return User.query.all()

    @staticmethod
    def get_user_by_id(user_id):
        return User.query.get(user_id)

    @staticmethod
    def get_user_or_404(user_id):
        user = User.query.get(user_id)
        if not user:
            abort(404, "User not found")
        return user

    @staticmethod
    def create_user(username, email, password, phone_number=None, country="Unknown", town="Unknown", is_admin=False):
        # Vérifie unicité username, email et phone_number
        if User.query.filter_by(username=username).first():
            raise ValueError(f"Username '{username}' already exists.")
        if User.query.filter(or_(User.email == email, User.phone_number == phone_number)).first():
            raise ValueError(f"User with email '{email}' or phone '{phone_number}' already exists.")
        if not password or len(password) < 6:
            raise ValueError("Password must be at least 6 characters long.")

        hashed_password = generate_password_hash(password)
        new_user = User(
            username=username,
            email=email,
            phone_number=phone_number,
            country=country,
            town=town,
            password_hash=hashed_password,
            is_admin=is_admin
        )
        db.session.add(new_user)
        db.session.commit()
        return new_user

    @staticmethod
    def update_user(user_id, **kwargs):
        user = User.query.get(user_id)
        if not user:
            return None

        # Eviter changement en doublon
        if 'username' in kwargs:
            username = kwargs['username']
            if username != user.username and User.query.filter_by(username=username).first():
                raise ValueError("Username already taken")
            user.username = username

        if 'email' in kwargs:
            email = kwargs['email']
            if email != user.email and User.query.filter_by(email=email).first():
                raise ValueError("Email already taken")
            user.email = email

        if 'phone_number' in kwargs:
            phone_number = kwargs['phone_number']
            if phone_number != user.phone_number and User.query.filter_by(phone_number=phone_number).first():
                raise ValueError("Phone number already taken")
            user.phone_number = phone_number

        if 'country' in kwargs:
            user.country = kwargs['country']

        if 'town' in kwargs:
            user.town = kwargs['town']

        if 'password' in kwargs:
            password = kwargs['password']
            if not password or len(password) < 6:
                raise ValueError("Password must be at least 6 characters long.")
            user.set_password(password)

        if 'is_admin' in kwargs:
            user.is_admin = kwargs['is_admin']

        db.session.commit()
        return user

    @staticmethod
    def delete_user(user_id):
        user = User.query.get(user_id)
        if not user:
            abort(404, "User not found")
        db.session.delete(user)
        db.session.commit()
        return True

    @staticmethod
    def get_user_by_email(email):
        return User.query.filter_by(email=email).first()

    @staticmethod
    def get_user_by_reset_token(token):
        user = User.query.filter_by(reset_password_token=token).first()
        if user and user.verify_reset_token(token):
            return user
        return None

    @staticmethod
    def save(user):
        db.session.add(user)
        db.session.commit()
