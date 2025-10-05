# models/reservation.py
from datetime import datetime
from app.extensions import db

class Reservation(db.Model):
    """Réservation d’un utilisateur pour un lieu sur une période donnée"""
    __tablename__ = "reservations"

    id = db.Column(db.Integer, primary_key=True)
    place_id = db.Column(db.Integer, db.ForeignKey("places.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    start_datetime = db.Column(db.DateTime, nullable=False, index=True)
    end_datetime = db.Column(db.DateTime, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    # Relations
    user = db.relationship("User", backref="reservations")
    place = db.relationship("Place", backref="reservations")

    def __repr__(self):
        return f"<Reservation id={self.id} from={self.start_datetime} to={self.end_datetime}>"
