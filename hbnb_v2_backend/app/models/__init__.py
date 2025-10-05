# Importer seulement les modèles et la même instance de db
from app.extensions import db  # ⚡ utiliser l'unique instance de SQLAlchemy

from .user import User
from .place import Place, PlaceImage
from .amenity import Amenity
from .reservation import Reservation
from .review import Review
from .associations import place_amenities

__all__ = [
    "db",
    "User",
    "Place",
    "PlaceImage",
    "Amenity",
    "Reservation",
    "Review",
    "place_amenities"
]
