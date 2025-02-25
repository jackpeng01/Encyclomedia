from marshmallow import Schema, fields, validate, EXCLUDE

class MovieLogsSchema(Schema):
    class Meta:
        unknown = EXCLUDE
    
    username = fields.Str(required=True, validate=validate.Length(min=1))
    movieLog = fields.List(fields.Str(), default=[])
    watchLater = fields.List(fields.Str(), default=[])