from marshmallow import Schema, fields, validate


class UserSchema(Schema):
    class Meta:
        unknown = "exclude"

    username = fields.String(required=True, validate=validate.Length(min=1))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=12))
