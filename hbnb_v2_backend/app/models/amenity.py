# models/amenity.py
from app.extensions import db

class Amenity(db.Model):
    """Équipements disponibles pour les lieux (Wi-Fi, piscine, etc.)"""
    __tablename__ = "amenities"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True, index=True)

    # Relation avec Place via la table d’association
    places = db.relationship(
        "Place",
        secondary="place_amenities",
        back_populates="amenities"
    )

    def __repr__(self):
        return f"<Amenity id={self.id} name={self.name}>"
