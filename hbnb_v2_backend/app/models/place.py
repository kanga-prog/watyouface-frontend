# models/place.py
from app.extensions import db
from .associations import place_amenities

class Place(db.Model):
    """Lieu proposé à la location (maison, appartement, etc.)"""
    __tablename__ = "places"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    price_by_night = db.Column(db.Integer, nullable=False, index=True)
    location = db.Column(db.String(128))
    country = db.Column(db.String(64))
    town = db.Column(db.String(128))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)

    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # Relations
    owner = db.relationship("User", backref="places")
    amenities = db.relationship(
        "Amenity",
        secondary=place_amenities,
        back_populates="places"
    )
    images = db.relationship("PlaceImage", backref="place", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Place id={self.id} name={self.name}>"

class PlaceImage(db.Model):
    """Images liées à une place"""
    __tablename__ = "place_images"

    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(255), nullable=False)  # URL de l'image
    place_id = db.Column(db.Integer, db.ForeignKey("places.id"), nullable=False)

    def __repr__(self):
        return f"<PlaceImage id={self.id} url={self.url}>"
