from marshmallow import Schema, fields, validate, EXCLUDE

class BookLogsSchema(Schema):
    class Meta:
        unknown = EXCLUDE
    
    username = fields.Str(required=True, validate=validate.Length(min=1))
    bookLog = fields.List(fields.Str(), default=[])
    readLater = fields.List(fields.Str(), default=[])
