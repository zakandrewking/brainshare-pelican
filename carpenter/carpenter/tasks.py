import os

from celery import Celery

broker = os.environ.get("REDIS_CONNECTION_STRING")
if broker is None:
    raise Exception("REDIS_CONNECTION_STRING environment variable not set")
app = Celery("tasks", broker=broker)


@app.task
def add(x, y):
    return x + y
