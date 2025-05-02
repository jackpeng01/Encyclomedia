from marshmallow import Schema, fields, validate, EXCLUDE

class MusicLogsSchema(Schema):
    class Meta:
        unknown = EXCLUDE
    
    username = fields.Str(required=True, validate=validate.Length(min=1))
    musicLog = fields.List(fields.Str(), default=[])
    listenLater = fields.List(fields.Str(), default=[])