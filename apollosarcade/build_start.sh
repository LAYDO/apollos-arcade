#!/bin/bash
npm run build && python3 manage.py collectstatic --noinput && python3 manage.py runserver