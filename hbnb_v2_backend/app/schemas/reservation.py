# schemas/reservation.py

from marshmallow import Schema, fields
from .user import PublicUserSchema

class ReservationSchema(Schema):
    id = fields.Int(dump_only=True)
    start_datetime = fields.DateTime(required=True)
    end_datetime = fields.DateTime(required=True)
    created_at = fields.DateTime(dump_only=True)

    user = fields.Nested(PublicUserSchema, dump_only=True)
