#!/usr/bin/env bash
# Render build script (also usable locally from backend/)
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
# Migrations run in render.yaml preDeployCommand (build cannot reach internal DB hostnames).
