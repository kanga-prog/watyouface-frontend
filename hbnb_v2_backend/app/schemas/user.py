# schemas/user.py

from marshmallow import Schema, fields

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    username = fields.Str(required=True)
    email = fields.Email(required=True)
    is_admin = fields.Bool()

# Variante pour public view (par exemple dans Review/Place)
class PublicUserSchema(Schema):
    id = fields.Int()
    username = fields.Str()
