import json
import os

from celery import Celery
from storage3 import create_client as create_storage_client

url = os.environ.get("SUPABASE_API_URL")
key = os.environ.get("SUPABASE_ANON_KEY")
if not url:
    raise Exception("SUPABASE_API_URL environment variable not set")
if not key:
    raise Exception("SUPABASE_ANON_KEY environment variable not set")

broker = os.environ.get("REDIS_CONNECTION_STRING")
if broker is None:
    raise Exception("REDIS_CONNECTION_STRING environment variable not set")
app = Celery("tasks", broker=broker)


@app.task
def get_categories(bucket: str, name: str, access_token: str):
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {access_token}",
    }
    storage_client = create_storage_client(f"{url}/storage/v1", headers, is_async=False)
    file: bytes = storage_client.from_(bucket).download(name)
    data = json.loads(file.decode("utf-8"))
    categories = data.keys()
    print(categories)
    return categories
