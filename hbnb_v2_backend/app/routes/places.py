# ROUTES/PLACES.PY
from flask import request, url_for, current_app
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app.models import Place, Amenity, Review, PlaceImage, db
from app.schemas.review import ReviewSchema  # MARSHMALLOW
from app.utils import save_file
from flask_cors import cross_origin
import os

# ---------------- CONFIG UPLOAD ----------------
UPLOAD_FOLDER = "uploads/places"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------------- NAMESPACE ----------------
api = Namespace("places", description="ENDPOINTS POUR LA GESTION DES LIEUX")

# ---------------- MODELS RESTX ----------------
AMENITY_MODEL = api.model("Amenity", {
    "id": fields.Integer(readOnly=True),
    "name": fields.String(required=True)
})

IMAGE_OUTPUT_MODEL = api.model("Image", {
    "id": fields.Integer(readOnly=True),
    "url": fields.String(required=True)
})

REVIEW_OUTPUT_MODEL = api.model("Review", {
    "id": fields.Integer(readOnly=True),
    "comment": fields.String(required=True),
    "rating": fields.Integer(required=True),
    "user_id": fields.Integer(required=True),
    "user_name": fields.String,
    "user_photo": fields.String,
    "place_id": fields.Integer(required=True),
    "created_at": fields.String
})

PLACE_MODEL = api.model("Place", {
    "id": fields.Integer(readOnly=True),
    "name": fields.String(required=True),
    "description": fields.String,
    "price_by_night": fields.Integer(required=True),
    "location": fields.String,
    "country": fields.String,
    "town": fields.String,
    "latitude": fields.Float,
    "longitude": fields.Float,
    "owner_id": fields.Integer,
    "amenities": fields.List(fields.Nested(AMENITY_MODEL)),
    "reviews": fields.List(fields.Nested(REVIEW_OUTPUT_MODEL)),
    "images": fields.List(fields.Nested(IMAGE_OUTPUT_MODEL))
})

PLACE_INPUT_MODEL = api.model("PlaceInput", {
    "name": fields.String(required=True),
    "description": fields.String,
    "price_by_night": fields.Integer(required=True),
    "location": fields.String,
    "country": fields.String,
    "town": fields.String,
    "latitude": fields.Float,
    "longitude": fields.Float,
    "amenity_ids": fields.List(fields.Integer)
})

# ---------------- SCHEMAS ----------------
REVIEW_SCHEMA = ReviewSchema()
REVIEWS_SCHEMA = ReviewSchema(many=True)

# ---------------- TEST UPLOAD ----------------
@api.route("/test-upload")
class TestUpload(Resource):
    @jwt_required()
    def post(self):
        """TEST RAPIDE DE L’UPLOAD D’UNE IMAGE"""
        user_id = get_jwt_identity()
        print(f"[DEBUG] Utilisateur JWT : {user_id}")

        if "file" not in request.files:
            return {"error": "No file in request"}, 400

        file = request.files["file"]
        print(f"[DEBUG] Fichier reçu : {file.filename}")

        try:
            # Sauvegarde du fichier dans /uploads/test
            public_url = save_file(file, subfolder="test")
            print(f"[DEBUG] URL publique générée : {public_url}")

            return {"url": public_url}, 201

        except Exception as e:
            print(f"[ERROR] {e}")
            return {"error": str(e)}, 500

    def get(self):
        """Simple check pour voir si la route fonctionne"""
        return {"message": "Route test-upload OK"}, 200

# ---------------- IMAGES ----------------
@api.route("/<int:place_id>/images")
class PlaceImages(Resource):
    @jwt_required()
    def post(self, place_id):
        """AJOUTE UNE IMAGE À UN PLACE (FICHIER OU URL)"""
        place = Place.query.get(place_id)
        if not place:
            return {"message": "PLACE NOT FOUND"}, 404

        # UPLOAD VIA FICHIER
        if "file" in request.files:
            file = request.files["file"]
            public_url = save_file(file, subfolder="places")
            img = PlaceImage(url=public_url, place_id=place_id)
            db.session.add(img)
            db.session.commit()
            return {"id": img.id, "url": img.url}, 201

        # AJOUT VIA URL JSON
        data = request.get_json()
        if data and "url" in data:
            img = PlaceImage(url=data["url"], place_id=place_id)
            db.session.add(img)
            db.session.commit()
            return {"id": img.id, "url": img.url}, 201

        return {"message": "NO IMAGE PROVIDED"}, 400

    @api.marshal_with(IMAGE_OUTPUT_MODEL)
    def get(self, place_id):
        """LISTE TOUTES LES IMAGES D’UN PLACE"""
        place = Place.query.get(place_id)
        if not place:
            return {"message": "PLACE NOT FOUND"}, 404
        return [{"id": img.id, "url": img.url} for img in place.images], 200


@api.route("/<int:place_id>/images/<int:image_id>")
class PlaceImageResource(Resource):
    @jwt_required()
    def delete(self, place_id, image_id):
        """SUPPRIME UNE IMAGE"""
        img = PlaceImage.query.filter_by(id=image_id, place_id=place_id).first()
        if not img:
            return {"message": "IMAGE NOT FOUND"}, 404
        db.session.delete(img)
        db.session.commit()
        return {"message": "IMAGE DELETED", "id": image_id}, 200

    @jwt_required()
    def put(self, place_id, image_id):
        """MODIFIE UNE IMAGE EXISTANTE OU CRÉE UNE NOUVELLE SI NON EXISTANTE"""
        place = Place.query.get(place_id)
        if not place:
            return {"message": "PLACE NOT FOUND"}, 404

        img = PlaceImage.query.filter_by(id=image_id, place_id=place_id).first()
        if img:
            if "file" in request.files:
                file = request.files["file"]
                img.url = save_file(file, subfolder="places")
            else:
                data = request.get_json()
                if not data or "url" not in data:
                    return {"message": "NO IMAGE PROVIDED"}, 400
                img.url = data["url"]
            db.session.commit()
            return {"id": img.id, "url": img.url}, 200

        # CAS : IMAGE N’EXISTE PAS → CRÉATION
        if "file" in request.files:
            file = request.files["file"]
            public_url = save_file(file, subfolder="places")
            img = PlaceImage(url=public_url, place_id=place_id)
        else:
            data = request.get_json()
            if not data or "url" not in data:
                return {"message": "NO IMAGE PROVIDED"}, 400
            img = PlaceImage(url=data["url"], place_id=place_id)

        db.session.add(img)
        db.session.commit()
        return {"id": img.id, "url": img.url}, 201

# ---------------- AMENITIES ----------------
@api.route("/<int:place_id>/amenities", strict_slashes=False)
class PlaceAmenities(Resource):
    @api.marshal_list_with(AMENITY_MODEL)
    def get(self, place_id):
        """Lister les amenities d'une place (PUBLIC)"""
        place = Place.query.get(place_id)
        if not place:
            return {"message": "Place not found"}, 404
        return place.amenities, 200

    @jwt_required()
    def post(self, place_id):
        user_id = get_jwt_identity()
        place = Place.query.get(place_id)
        if not place:
            api.abort(404, "Place not found")
        if place.owner_id != user_id:
            api.abort(403, "Unauthorized")

        data = api.payload
        amenity_id = data.get('amenity_id')
        if not amenity_id:
            api.abort(400, "amenity_id is required")

        amenity = Amenity.query.get(amenity_id)
        if not amenity:
            api.abort(404, "Amenity not found")

        if amenity in place.amenities:
            api.abort(409, "Amenity already linked to place")

        place.amenities.append(amenity)
        db.session.commit()

        return {"id": amenity.id, "name": amenity.name}, 201



# ---------------- REVIEWS ----------------
@api.route("/<int:place_id>/reviews")
class PlaceReviews(Resource):
    def get(self, place_id):
        place = Place.query.get(place_id)
        if not place:
            return {"message": "PLACE NOT FOUND"}, 404
        return REVIEWS_SCHEMA.dump(place.reviews), 200

    @jwt_required()
    def post(self, place_id):
        user_id = int(get_jwt_identity())
        place = Place.query.get(place_id)
        if not place:
            return {"message": "PLACE NOT FOUND"}, 404

        data = request.get_json()
        review = Review(
            comment=data["comment"],
            rating=data["rating"],
            user_id=user_id,
            place_id=place_id
        )
        db.session.add(review)
        db.session.commit()
        return REVIEW_SCHEMA.dump(review), 201


@api.route("/<int:place_id>/reviews/<int:review_id>")
class ReviewResource(Resource):
    def get(self, place_id, review_id):
        review = Review.query.filter_by(id=review_id, place_id=place_id).first()
        if not review:
            return {"message": "REVIEW NOT FOUND"}, 404
        return REVIEW_SCHEMA.dump(review), 200

    @jwt_required()
    def put(self, place_id, review_id):
        user_id = int(get_jwt_identity())
        review = Review.query.filter_by(id=review_id, place_id=place_id).first()
        if not review:
            return {"message": "REVIEW NOT FOUND"}, 404
        if review.user_id != user_id:
            return {"message": "UNAUTHORIZED"}, 403

        data = request.get_json()
        review.comment = data.get("comment", review.comment)
        review.rating = data.get("rating", review.rating)
        db.session.commit()
        return REVIEW_SCHEMA.dump(review), 200

    @jwt_required()
    def delete(self, place_id, review_id):
        user_id = int(get_jwt_identity())
        review = Review.query.filter_by(id=review_id, place_id=place_id).first()
        if not review:
            return {"message": "REVIEW NOT FOUND"}, 404
        if review.user_id != user_id:
            return {"message": "UNAUTHORIZED"}, 403

        db.session.delete(review)
        db.session.commit()
        return {"message": "REVIEW DELETED", "id": review_id}, 200

# ---------------- PLACES ----------------
@api.route("/", strict_slashes=False)
class PlaceList(Resource):
    @api.marshal_list_with(PLACE_MODEL)
    def get(self):
        places = Place.query.all()
        serialized_places = []
        for place in places:
            serialized_places.append({
                **place.__dict__,
                "amenities": [{"id": a.id, "name": a.name} for a in place.amenities],
                "images": [{"id": img.id, "url": img.url} for img in place.images],
                "reviews": [REVIEW_SCHEMA.dump(r) for r in place.reviews]
            })
        return serialized_places, 200

    @api.expect(PLACE_INPUT_MODEL, validate=True)
    @api.marshal_with(PLACE_MODEL, code=201)
    @jwt_required()
    def post(self):
        data = request.get_json()
        user_id = int(get_jwt_identity())

        new_place = Place(
            name=data["name"],
            description=data.get("description"),
            price_by_night=data["price_by_night"],
            location=data.get("location"),
            country=data.get("country"),
            town=data.get("town"),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
            owner_id=user_id
        )

        # AJOUT AMENITIES PAR ID
        if "amenity_ids" in data and isinstance(data["amenity_ids"], list):
            new_place.amenities = Amenity.query.filter(
                Amenity.id.in_(data["amenity_ids"])
            ).all()

        db.session.add(new_place)
        db.session.commit()
        return new_place, 201


@api.route("/<string:identifier>", strict_slashes=False)
class PlaceResource(Resource):
    @api.marshal_with(PLACE_MODEL)
    def get(self, identifier):
        try:
            place_id = int(identifier)
        except ValueError:
            return {"message": "INVALID IDENTIFIER"}, 400

        place = Place.query.get(place_id)
        if not place:
            return {"message": "PLACE NOT FOUND"}, 404

        serialized_place = {
            **place.__dict__,
            "amenities": [{"id": a.id, "name": a.name} for a in place.amenities],
            "images": [{"id": img.id, "url": img.url} for img in place.images],
            "reviews": [REVIEW_SCHEMA.dump(r) for r in place.reviews]
        }
        return serialized_place, 200

    @api.expect(PLACE_INPUT_MODEL)
    @api.marshal_with(PLACE_MODEL)
    @jwt_required()
    def put(self, identifier):
        try:
            place_id = int(identifier)
        except ValueError:
            return {"message": "INVALID IDENTIFIER"}, 400

        place = Place.query.get(place_id)
        if not place:
            return {"message": "PLACE NOT FOUND"}, 404

        user_id = int(get_jwt_identity())
        if place.owner_id != user_id:
            return {"message": "UNAUTHORIZED"}, 403

        data = request.get_json()
        for field in ["name", "description", "price_by_night", "location",
                      "country", "town", "latitude", "longitude"]:
            if field in data:
                setattr(place, field, data[field])

        if "amenity_ids" in data and isinstance(data["amenity_ids"], list):
            place.amenities = Amenity.query.filter(
                Amenity.id.in_(data["amenity_ids"])
            ).all()

        db.session.commit()
        serialized_place = {
            **place.__dict__,
            "amenities": [{"id": a.id, "name": a.name} for a in place.amenities],
            "images": [{"id": img.id, "url": img.url} for img in place.images],
            "reviews": [REVIEW_SCHEMA.dump(r) for r in place.reviews]
        }
        return serialized_place, 200

    @jwt_required()
    def delete(self, identifier):
        try:
            place_id = int(identifier)
        except ValueError:
            return {"message": "INVALID IDENTIFIER"}, 400

        place = Place.query.get(place_id)
        if not place:
            return {"message": "PLACE NOT FOUND"}, 404

        user_id = int(get_jwt_identity())
        if place.owner_id != user_id:
            return {"message": "UNAUTHORIZED"}, 403

        db.session.delete(place)
        db.session.commit()
        return {"message": "PLACE DELETED"}, 200
