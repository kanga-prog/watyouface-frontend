from app.models import Amenity, Place
from app.extensions import db


class AmenityFacade:
    @staticmethod
    def create_amenity(name, owner_id):
        if not name:
            raise ValueError("Amenity name must not be empty")
        amenity = Amenity(name=name, owner_id=owner_id)
        db.session.add(amenity)
        db.session.commit()
        return amenity

    @staticmethod
    def get_all_amenities_by_owner(owner_id):
        return Amenity.query.filter_by(owner_id=owner_id).all()

    @staticmethod
    def get_amenity_by_id_and_owner(amenity_id, owner_id):
        return Amenity.query.filter_by(id=amenity_id, owner_id=owner_id).first()

    @staticmethod
    def update_amenity(amenity, name):
        if not name:
            raise ValueError("Amenity name must not be empty")
        amenity.name = name
        db.session.commit()
        return amenity

    @staticmethod
    def delete_amenity(amenity):
        db.session.delete(amenity)
        db.session.commit()

    @staticmethod
    def link_amenity_to_place(amenity_id, place_id, owner_id):
        place = Place.query.filter_by(id=place_id, owner_id=owner_id).first()
        if not place:
            return None, "Place not found or not owned by you"

        amenity = Amenity.query.filter_by(id=amenity_id, owner_id=owner_id).first()
        if not amenity:
            return None, "Amenity not found or not owned by you"

        if amenity in place.amenities:
            return None, "Amenity already linked to this place"

        place.amenities.append(amenity)
        db.session.commit()
        return amenity, None

    @staticmethod
    def unlink_amenity_from_place(amenity_id, place_id, owner_id):
        place = Place.query.filter_by(id=place_id, owner_id=owner_id).first()
        if not place:
            return None, "Place not found or not owned by you"

        amenity = Amenity.query.filter_by(id=amenity_id, owner_id=owner_id).first()
        if not amenity:
            return None, "Amenity not found or not owned by you"

        if amenity not in place.amenities:
            return None, "Amenity not linked to this place"

        place.amenities.remove(amenity)
        db.session.commit()
        return amenity, None

    @staticmethod
    def get_amenities_by_place_id(place_id):
        place = Place.query.get(place_id)
        return place.amenities if place else None
