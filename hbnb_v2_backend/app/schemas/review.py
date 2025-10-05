# schemas/review.py

from marshmallow import Schema, fields
from .user import PublicUserSchema

class ReviewSchema(Schema):
    id = fields.Int(dump_only=True)
    rating = fields.Int(required=True)
    comment = fields.Str()
    created_at = fields.DateTime(dump_only=True)

    user = fields.Nested(PublicUserSchema, dump_only=True)
