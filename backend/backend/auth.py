import os

import jwt
from fastapi import HTTPException, Request

try:
    supabase_jwt_secret = os.environ["SUPABASE_JWT_SECRET"]
except KeyError:
    raise Exception("SUPABASE_JWT_SECRET environment variable not set")


def check_session(request: Request) -> str:
    if not "Authorization" in request.headers:
        raise HTTPException(status_code=401, detail="Missing header Authorization")

    access_token = request.headers["Authorization"].replace("Bearer ", "")

    # authorize by validating the JWT without a round-trip to Supabase
    try:
        jwt.decode(
            access_token, supabase_jwt_secret, audience="authenticated", algorithms=["HS256"]
        )
    except jwt.ExpiredSignatureError as e:
        print(e)
        raise HTTPException(status_code=401, detail="Session is expired. Please log in again.")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=401, detail="Could not authenticate")

    return access_token
