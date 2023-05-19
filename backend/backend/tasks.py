import json
import os

from celery import Celery
from supabase import Client, create_client

url = os.environ.get("SUPABASE_API_URL")
key = os.environ.get("SUPABASE_ANON_KEY")
if not url:
    raise Exception("SUPABASE_API_URL environment variable not set")
if not key:
    raise Exception("SUPABASE_ANON_KEY environment variable not set")
supabase: Client = create_client(url, key)

broker = os.environ.get("REDIS_CONNECTION_STRING")
if broker is None:
    raise Exception("REDIS_CONNECTION_STRING environment variable not set")
app = Celery("tasks", broker=broker)


@app.task
def get_categories(bucket: str, name: str):
    # should fail on auth
    file: bytes = supabase.storage.from_(bucket).download(name)
    data = json.loads(file.decode("utf-8"))
    categories = data.keys()
    return categories
