#!/bin/bash

cd "$(dirname "$0")"

cd ../backend \
    && poetry run sqlacodegen postgresql://postgres:postgres@localhost:54332/postgres > backend/models.py \
    && poetry run black backend/models.py
