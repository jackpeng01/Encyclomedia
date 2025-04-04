from marshmallow import Schema, fields, validate, EXCLUDE

class ReviewSchema(Schema):
    class Meta:
        unknown = EXCLUDE
    
    media_id = fields.String(required=True)
    media_type = fields.String(required=True)
    media_title = fields.String(required=True)
    user_id = fields.String(required=True)
    title = fields.String(required=True)
    content = fields.String(required=True)
    formatted_content = fields.Dict(missing=dict)
    rating = fields.Integer(required=True, validate=validate.Range(min=1, max=5))
    created_at = fields.DateTime(missing=lambda: datetime.datetime.utcnow())
    updated_at = fields.DateTime(missing=lambda: datetime.datetime.utcnow())
    comments = fields.List(fields.Nested(lambda: CommentSchema()), missing=list)

class CommentSchema(Schema):
    class Meta:
        unknown = EXCLUDE
    
    user_id = fields.String(required=True)
    content = fields.String(required=True)
    created_at = fields.DateTime(missing=lambda: datetime.datetime.utcnow())