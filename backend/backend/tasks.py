import json
import re
import subprocess
import os

from celery import Celery
from celery.schedules import crontab
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

engine = create_engine(connection_string)
Session = sessionmaker(bind=engine)

app = Celery("tasks", broker=redis_connection_string, backend=redis_connection_string)
app.conf.timezone = "America/Los_Angeles"


@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # TODO no need to run this locally during normal dev
    # TODO what's the local equivalent of fly machines?
    sender.add_periodic_task(
        crontab(hour=15, minute=0),
        scale_down_one_day.s(app="brainshare-pelican-backend-enclave"),
    )


@app.task
def get_categories(bucket: str, name: str, access_token: str) -> None:
    print("Starting")
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {access_token}",
    }
    print("downloading")
    storage_client = create_storage_client(f"{url}/storage/v1", headers, is_async=False)
    file: bytes = storage_client.from_(bucket).download(name)
    data = json.loads(file.decode("utf-8"))
    categories = str(data.keys())
    user_id = decode_access_token(access_token)
    print("saving")
    with Session() as session:
        step = Step(
            description=f"Categories: {categories}",
            bucket=bucket,
            object_name=name,
            user_id=user_id,
        )
        session.add(step)
        session.commit()
    print("Added step to database")


@app.task
def scale_down_one_day(app: str) -> None:
    # destroy all but one machine created more than 24 hours ago
    subprocess.run(
        f"""
        fly machine list -a {app} --json | \
            TZ=UTC jq -cr 'map(select(.created_at | fromdateiso8601 < (now - (24 * 3600))))[1:] | .[].id' | \
            xargs -I _ fly machine destroy _
    """,
        shell=True,
        check=True,
    )
    # stop that last machine
    subprocess.run(
        f"""
        fly machine list -a {app} --json | \
            TZ=UTC jq -cr 'map(select(.created_at | fromdateiso8601 < (now - (24 * 3600))))[1:] | .[].id' | \
            xargs -I _ fly machine stop _
    """,
        shell=True,
        check=True,
    )


@app.task
def scale_down(app: str) -> None:
    # destroy all but one machine
    subprocess.run(f"fly scale count 1 -a {app} -y", shell=True, check=True)
    # stop that last machine
    subprocess.run(
        f"""
        fly machine list -a {app} --json | \
            jq -cr '.[].id' | \
            xargs -I _ fly machine stop _
    """,
        shell=True,
        check=True,
    )


@app.task
def start_vm(app: str) -> None:
    # Clone & start any existing machine
    # get the output and parse it to get the machine id
    result = output = subprocess.run(
        f"""
        fly machine list -a {app} --json | \
            TZ=UTC jq -cr '.[0].id' | \
            xargs -I _ fly machine clone _ -a {app}
    """,
        shell=True,
        capture_output=True,
    )
    if result.returncode != 0:
        print(result.stderr.decode("utf-8"))
        raise Exception("Could not clone machine")
    stdout = output.stdout.decode("utf-8")
    print(stdout)
    match = re.search(r"Machine ([a-zA-Z0-9]+) has been created", stdout)
    if not match:
        raise Exception("Could not parse output of fly machine clone")
    machine_id = match.group(1)
    result = subprocess.run(
        f"""
        fly machine start {machine_id} -a {app}
    """,
        shell=True,
        check=True,
        capture_output=True,
    )
    if result.returncode != 0:
        print(result.stderr.decode("utf-8"))
        raise Exception("Could not start machine")
    print(result.stdout.decode("utf-8"))


# @app.task
# def run_unsafe_code(
#     code_block: str, input_object: str, output_object: str, access_token: str
# ) -> None:
#     print("Starting")
#     headers = {
#         "apikey": key,
#         "Authorization": f"Bearer {access_token}",
#     }
#     print("Downloading")
#     storage_client = create_storage_client(f"{url}/storage/v1", headers, is_async=False)
#     file: bytes = storage_client.from_(input_object.bucket).download(input_object.object_name)

#     print("Starting fly.io vm")

#     user_id = decode_access_token(access_token)
#     print("saving")
#     with Session() as session:
#         step = Step(
#             description=f"Categories: {categories}",
#             bucket=bucket,
#             object_name=name,
#             user_id=user_id,
#         )
#         session.add(step)
#         session.commit()
#     print("Added step to database")
