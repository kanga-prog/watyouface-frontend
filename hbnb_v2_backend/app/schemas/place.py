# schemas/place.py

from marshmallow import Schema, fields
from .amenity import AmenitySchema
from .review import ReviewSchema
from .user import PublicUserSchema

class PlaceSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    description = fields.Str()
    price_by_night = fields.Int(required=True)
    location = fields.Str()
    country = fields.Str()
    latitude = fields.Float()
    longitude = fields.Float()
    
    owner = fields.Nested(PublicUserSchema)
    amenities = fields.List(fields.Nested(AmenitySchema), dump_only=True)
    reviews = fields.List(fields.Nested(ReviewSchema), dump_only=True)
