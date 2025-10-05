from datetime import datetime

from app.models import Review
from app.extensions import db


class ReviewFacade:
    @staticmethod
    def create_review(user_id, place_id, rating, comment):
        if not (1 <= rating <= 5):
            raise ValueError("Rating must be between 1 and 5")

        review = Review(
            user_id=user_id,
            place_id=place_id,
            rating=rating,
            comment=comment or "",
            created_at=datetime.utcnow()
        )
        db.session.add(review)
        db.session.commit()
        return review

    @staticmethod
    def get_reviews_by_place(place_id):
        return Review.query.filter_by(place_id=place_id).order_by(Review.created_at.desc()).all()

    @staticmethod
    def get_reviews_by_user(user_id):
        return Review.query.filter_by(user_id=user_id).order_by(Review.created_at.desc()).all()

    @staticmethod
    def delete_review(review_id):
        review = Review.query.get(review_id)
        if not review:
            return False
        db.session.delete(review)
        db.session.commit()
        return True

    @staticmethod
    def update_review(review_id, rating=None, comment=None):
        review = Review.query.get(review_id)
        if not review:
            return None

        if rating is not None:
            if not (1 <= rating <= 5):
                raise ValueError("Rating must be between 1 and 5")
            review.rating = rating

        if comment is not None:
            review.comment = comment

        db.session.commit()
        return review
