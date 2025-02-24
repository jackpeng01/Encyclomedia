from marshmallow import Schema, fields, validate, EXCLUDE


class UserSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    username = fields.String(required=True, validate=validate.Length(min=1))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=12))
    profilePicture = fields.String(
        missing="https://res.cloudinary.com/dby0q8y9z/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1739815199/default-profile_crftml.png "
    )
