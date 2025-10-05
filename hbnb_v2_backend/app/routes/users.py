# routes/user.py
from flask_restx import Namespace, Resource, fields
from flask import request, current_app
from app.facades.user_facade import UserFacade
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app.extensions import db
from datetime import datetime
from app.models import User,Place,Reservation
import os

api = Namespace('users', description='Endpoints related to users')

# === MODELS ===
user_model = api.model('User', {
    'id': fields.Integer(readOnly=True),
    'username': fields.String(required=True),
    'email': fields.String(required=True),
    'phone_number': fields.String(required=True),
    'country': fields.String(),
    'town': fields.String(),
    'avatar': fields.String(),  # ✅ pour photo de profil
    'is_admin': fields.Boolean()
})

user_post_model = api.model('UserInput', {
    'username': fields.String(required=True),
    'email': fields.String(required=True),
    'password': fields.String(required=True),
    'phone_number': fields.String(required=True),
    'country': fields.String(),
    'town': fields.String(),
    'is_admin': fields.Boolean()
})

user_update_model = api.model('UserUpdate', {
    'username': fields.String(),
    'email': fields.String(),
    'phone_number': fields.String(),
    'country': fields.String(),
    'town': fields.String(),
    'avatar': fields.String()
})

# === ROUTES ===

@api.route('/')
class UserList(Resource):
    @jwt_required()
    @api.marshal_list_with(user_model)
    def get(self):
        current_user_id = get_jwt_identity()
        current_user = UserFacade.get_user_or_404(current_user_id)
        if not current_user.is_admin:
            return {"message": "Admins only"}, 403
        return UserFacade.get_all_users()

    @api.expect(user_post_model)
    @api.marshal_with(user_model, code=201)
    def post(self):
        data = api.payload
        user = UserFacade.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            phone_number=data['phone_number'],
            country=data.get('country'),
            town=data.get('town'),
            is_admin=data.get('is_admin', False)
        )
        return user, 201


@api.route('/me')
class UserMe(Resource):
    @jwt_required()
    @api.marshal_with(user_model)
    def get(self):
        user_id = get_jwt_identity()
        return UserFacade.get_user_or_404(user_id)

    @jwt_required()
    @api.expect(user_update_model)  # ✅ on n’exige plus password
    @api.marshal_with(user_model)
    def put(self):
        user_id = get_jwt_identity()
        return UserFacade.update_user(user_id, **api.payload)


@api.route('/<int:id>')
@api.response(404, 'User not found')
class UserDetail(Resource):
    @jwt_required()
    @api.marshal_with(user_model)
    def get(self, id):
        current_user_id = get_jwt_identity()
        current_user = UserFacade.get_user_or_404(current_user_id)
        if not current_user.is_admin:
            return {"message": "Admins only"}, 403
        return UserFacade.get_user_or_404(id)  # ✅ corrigé


@api.route("/<int:user_id>/avatar")
class UserAvatar(Resource):
    @jwt_required()
    def post(self, user_id):
        # Vérifier l’utilisateur
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404

        current_user_id = int(get_jwt_identity())
        current_user = UserFacade.get_user_or_404(current_user_id)

        # ✅ empêcher de modifier un autre utilisateur sauf si admin
        if current_user_id != user.id and not current_user.is_admin:
            return {"message": "Unauthorized"}, 403

        # Vérifier le fichier
        if 'avatar' not in request.files:
            return {"message": "No file uploaded"}, 400

        file = request.files['avatar']
        if file.filename == '':
            return {"message": "No selected file"}, 400

        # Sauvegarder le fichier
        filename = secure_filename(file.filename)
        upload_folder = os.path.join(current_app.root_path, "uploads", "avatars")
        os.makedirs(upload_folder, exist_ok=True)
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)

        # Mettre à jour le modèle
        user.avatar = f"/uploads/avatars/{filename}"
        db.session.commit()

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "avatar": user.avatar,
            "is_admin": user.is_admin
        }, 201

@api.route("/<int:user_id>/places")
class UserPlaces(Resource):
    @jwt_required()
    def get(self, user_id):
        """Liste des lieux créés par un utilisateur"""
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404

        current_user_id = int(get_jwt_identity())
        current_user = UserFacade.get_user_or_404(current_user_id)

        # ✅ Un utilisateur ne peut voir que ses propres places sauf si admin
        if current_user_id != user.id and not current_user.is_admin:
            return {"message": "Unauthorized"}, 403

        places = Place.query.filter_by(owner_id=user.id).all()
        results = []
        for place in places:
            results.append({
                "id": place.id,
                "name": place.name,
                "description": place.description,
                "price_by_night": place.price_by_night,
                "location": place.location,
                "country": place.country,
                "town": place.town,
                "latitude": place.latitude,
                "longitude": place.longitude,
                "amenities": [{"id": a.id, "name": a.name} for a in place.amenities],
                "images": [{"id": img.id, "url": img.url} for img in place.images]
            })

        return results, 200

@api.route('/me/places')
class UserPlaces(Resource):
    @jwt_required()
    def get(self):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404

        places = [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "price_by_night": p.price_by_night,
                "location": p.location,
                "country": p.country,
                "town": p.town,
                "latitude": p.latitude,
                "longitude": p.longitude,
                "amenities": [{"id": a.id, "name": a.name} for a in p.amenities],
                "images": [{"id": img.id, "url": img.url} for img in p.images]
            }
            for p in user.places
        ]
        return places, 200

    @jwt_required()
    def delete(self):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404

        now = datetime.utcnow()

        # Sous-requête pour trouver les places avec réservation en cours
        ongoing_place_ids = db.session.query(Reservation.place_id).filter(
            Reservation.start_datetime <= now,
            Reservation.end_datetime >= now
        ).subquery()

        # Supprimer toutes les places du user qui ne sont pas dans ongoing_place_ids
        deleted_count = Place.query.filter(
            Place.owner_id == user.id,
            ~Place.id.in_(ongoing_place_ids)
        ).delete(synchronize_session=False)

        db.session.commit()

        return {
            "message": f"{deleted_count} place(s) deleted. "
                       "Places with ongoing reservations were not deleted."
        }, 200
