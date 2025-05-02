from marshmallow import Schema, fields, validate, EXCLUDE


class UserSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    username = fields.String(required=True, validate=validate.Length(min=1))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=12))
    profilePicture = fields.String(
        missing="https://res.cloudinary.com/dby0q8y9z/image/upload/v1739815199/default-profile_crftml.png"
    )
    bio = fields.String(missing="")
    followers = fields.List(fields.String(), missing=list)
    following = fields.List(fields.String(), missing=list)
    blocked = fields.List(fields.String(), missing=list)
    genrePreferences = fields.List(fields.String(), missing=list)
    followed_lists = fields.List(fields.String(), missing=list)
    favorites = fields.List(fields.Str(), default=[])
