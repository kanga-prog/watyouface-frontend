# routes/reviews.py
from flask_restx import Namespace, Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta

from app.models import Review, Reservation
from app.extensions import db
from app.schemas.review import ReviewSchema

api = Namespace('reviews', description='Endpoints related to reviews')

# Marshmallow schemas
review_schema = ReviewSchema()
reviews_schema = ReviewSchema(many=True)

# ========================
# /api/places/<place_id>/reviews
# ========================
@api.route('/places/<int:place_id>/reviews', strict_slashes=False)
@api.doc(params={'place_id': 'ID of the place'})
class PlaceReviews(Resource):
    def get(self, place_id):
        """List all reviews for a given place"""
        reviews = Review.query.filter_by(place_id=place_id).all()
        return reviews_schema.dump(reviews), 200

    @jwt_required()
    def post(self, place_id):
        """Create a new review for a place"""
        user_id = get_jwt_identity()
        data = request.get_json()

        rating = data.get('rating')
        comment = data.get('comment')

        if rating is None or not (1 <= rating <= 5):
            return {"message": "Rating must be between 1 and 5."}, 400

        # Un seul review par user & place
        existing = Review.query.filter_by(user_id=user_id, place_id=place_id).first()
        if existing:
            return {"message": "You have already reviewed this place."}, 400

        # Vérif réservation terminée depuis 15 min
        now = datetime.utcnow()
        fifteen_minutes_ago = now - timedelta(minutes=15)
        reservation = Reservation.query.filter_by(user_id=user_id, place_id=place_id) \
            .filter(Reservation.end_datetime <= fifteen_minutes_ago).first()

        if not reservation:
            return {"message": "You must complete a reservation before reviewing."}, 403

        review = Review(
            user_id=user_id,
            place_id=place_id,
            rating=rating,
            comment=comment
        )
        db.session.add(review)
        db.session.commit()
        return review_schema.dump(review), 201

# ========================
# /api/reviews/<id>
# ========================
@api.route('/<int:id>', strict_slashes=False)
@api.response(404, 'Review not found')
class ReviewDetail(Resource):
    def get(self, id):
        """Get a review by ID"""
        review = Review.query.get_or_404(id)
        return review_schema.dump(review), 200

    @jwt_required()
    def put(self, id):
        """Update a review (only by the author)"""
        review = Review.query.get_or_404(id)
        user_id = get_jwt_identity()

        if review.user_id != user_id:
            return {"message": "You are not authorized to update this review."}, 403

        data = request.get_json()
        comment = data.get('comment', review.comment)
        rating = data.get('rating', review.rating)

        if rating is not None and not (1 <= rating <= 5):
            return {"message": "Rating must be between 1 and 5."}, 400

        review.comment = comment
        review.rating = rating
        db.session.commit()
        return review_schema.dump(review), 200

    @jwt_required()
    def delete(self, id):
        """Delete a review (only by the author)"""
        review = Review.query.get_or_404(id)
        user_id = get_jwt_identity()

        if review.user_id != user_id:
            return {"message": "You are not authorized to delete this review."}, 403

        db.session.delete(review)
        db.session.commit()
        return '', 204

# ========================
# /api/reviews/user/<user_id>
# ========================
@api.route('/user/<int:user_id>', strict_slashes=False)
class ReviewsByUser(Resource):
    def get(self, user_id):
        """Get all reviews made by a specific user"""
        reviews = Review.query.filter_by(user_id=user_id).all()
        return reviews_schema.dump(reviews), 200
