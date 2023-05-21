import json
import os

from celery import Celery
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from storage3 import create_client as create_storage_client

from backend.auth import decode_access_token
from backend.models import Step

url = os.environ.get("SUPABASE_API_URL")
key = os.environ.get("SUPABASE_ANON_KEY")
if not url:
    raise Exception("SUPABASE_API_URL environment variable not set")
if not key:
    raise Exception("SUPABASE_ANON_KEY environment variable not set")

redis_connection_string = os.environ.get("REDIS_CONNECTION_STRING")
if redis_connection_string is None:
    raise Exception("REDIS_CONNECTION_STRING environment variable not set")

connection_string = os.environ.get("POSTGRESQL_CONNECTION_STRING")
if connection_string is None:
    raise Exception("POSTGRESQL_CONNECTION_STRING environment variable not set")

app = Celery("tasks", broker=redis_connection_string, backend=redis_connection_string)

engine = create_engine(connection_string)
Session = sessionmaker(bind=engine)


@app.task
def get_categories(bucket: str, name: str, access_token: str) -> None:
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {access_token}",
    }
    storage_client = create_storage_client(f"{url}/storage/v1", headers, is_async=False)
    file: bytes = storage_client.from_(bucket).download(name)
    data = json.loads(file.decode("utf-8"))
    categories = str(data.keys())
    user_id = decode_access_token(access_token)
    with Session() as session:
        step = Step(
            description=f"Categories: {categories}",
            bucket=bucket,
            object_name=name,
            user_id=user_id,
        )
        session.add(step)
        session.commit()
