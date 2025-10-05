# schemas/amenity.py

from marshmallow import Schema, fields
from .user import PublicUserSchema

class AmenitySchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    owner = fields.Nested(PublicUserSchema)
