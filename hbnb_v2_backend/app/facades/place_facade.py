# facades/place_facade.py
from app.models.place import Place
from app.models.amenity import Amenity
from app.extensions import db

class PlaceFacade:

    @staticmethod
    def get_all_places():
        return Place.query.all()

    @staticmethod
    def get_place_by_id(place_id):
        return Place.query.get(place_id)

    @staticmethod
    def _get_place(identifier, owner_id):
        """Helper pour chercher une place par ID ou par nom"""
        if isinstance(identifier, int):
            return Place.query.filter_by(id=identifier, owner_id=owner_id).first()
        return Place.query.filter_by(name=identifier, owner_id=owner_id).first()

    @staticmethod
    def create_place(data, owner_id):
        try:
            # Validation des champs obligatoires
            name = data.get('name')
            price_by_night = data.get('price_by_night')

            if not name:
                raise ValueError("Place name must not be empty")
            if price_by_night is None or price_by_night <= 0:
                raise ValueError("Price by night must be a positive value")

            # Vérification unicité
            existing = Place.query.filter_by(
                owner_id=owner_id,
                name=name,
                latitude=data.get('latitude'),
                longitude=data.get('longitude')
            ).first()
            if existing:
                raise ValueError("You already have a place with this name at this location.")

            # Création de la place
            place = Place(
                name=name,
                description=data.get('description', ''),
                price_by_night=price_by_night,
                location=data.get('location', ''),
                country=data.get('country', ''),
                town=data.get('town', ''),
                latitude=data.get('latitude'),
                longitude=data.get('longitude'),
                owner_id=owner_id
            )
            db.session.add(place)
            db.session.commit()  # commit pour avoir l'id

            # --- GESTION DES AMENITIES ---
            amenities_data = data.get('amenities', [])
            for amenity_name in amenities_data:
                capitalized_name = amenity_name.strip().capitalize()
                amenity = Amenity.query.filter_by(name=capitalized_name).first()
                if not amenity:
                    amenity = Amenity(name=capitalized_name)
                    db.session.add(amenity)
                    db.session.commit()
                if amenity not in place.amenities:
                    place.amenities.append(amenity)

            db.session.commit()
            return place
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def update_place(identifier, data, owner_id):
        try:
            place = PlaceFacade._get_place(identifier, owner_id)
            if not place:
                return None

            allowed_fields = ['name', 'description', 'price_by_night', 'location',
                              'country', 'town', 'latitude', 'longitude']
            for field in allowed_fields:
                if field in data:
                    if field == 'price_by_night' and (data[field] is None or data[field] <= 0):
                        raise ValueError("Price by night must be a positive value")
                    setattr(place, field, data[field])

            # Mise à jour des amenities si fournis
            if "amenities" in data:
                place.amenities.clear()
                for amenity_name in data["amenities"]:
                    capitalized_name = amenity_name.strip().capitalize()
                    amenity = Amenity.query.filter_by(name=capitalized_name).first()
                    if not amenity:
                        amenity = Amenity(name=capitalized_name)
                        db.session.add(amenity)
                        db.session.commit()
                    place.amenities.append(amenity)

            db.session.commit()
            return place
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def delete_place(identifier, owner_id):
        try:
            place = PlaceFacade._get_place(identifier, owner_id)
            if not place:
                return False

            db.session.delete(place)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise e
