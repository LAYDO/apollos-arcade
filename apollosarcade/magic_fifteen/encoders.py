# encoders.py

import json
from django_quill.fields import FieldQuill

class QuillFieldEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, FieldQuill):
            # Serialize FieldQuill object as needed
            return obj.html
        return super(QuillFieldEncoder, self).default(obj)
