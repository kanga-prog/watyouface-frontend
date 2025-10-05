# models/review.py
from datetime import datetime
from app.extensions import db
from sqlalchemy import CheckConstraint

class Review(db.Model):
    """Avis et note laissés par un utilisateur sur un lieu"""
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    place_id = db.Column(db.Integer, db.ForeignKey("places.id"), nullable=False)

    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_range"),
    )

    # Relations
    user = db.relationship("User", backref="reviews")
    place = db.relationship("Place", backref="reviews")

    def __repr__(self):
        return f"<Review id={self.id} rating={self.rating} place_id={self.place_id}>"
