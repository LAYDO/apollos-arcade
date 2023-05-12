#!/bin/bash
python3 manage.py collectstatic --noinput && npm run build && python3 manage.py runserver