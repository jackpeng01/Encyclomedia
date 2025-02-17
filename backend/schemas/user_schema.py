from marshmallow import Schema, fields, validate, EXCLUDE


class UserSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    username = fields.String(required=True, validate=validate.Length(min=1))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=12))
    profilePicture=fields.String(missing="http://127.0.0.1:5000/static/uploads/default-profile.png")
