from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.auth import check_session

from backend.tasks import get_categories, scale_down, start_vm
from backend.schemas import RunGetCategoriesRequest, RunStartVmRequest

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def get_health() -> None:
    return


# TODO auth
@app.post("/run/get_categories")
def post_run_get_categories(
    data: RunGetCategoriesRequest, access_token=Depends(check_session)
) -> None:
    task = get_categories.delay(data.bucket, data.name, access_token)
    # TODO switch to logging
    print(f"Task created, id: {task.task_id}")


# TODO auth
@app.post("/run/scale_down")
def post_run_scale_down(data: RunStartVmRequest) -> None:
    task = scale_down.delay(data.app)
    print(f"Task created, id: {task.task_id}")


# TODO auth
@app.post("/run/start_vm")
def post_run_start_vm(data: RunStartVmRequest) -> None:
    task = start_vm.delay(data.app)
    print(f"Task created, id: {task.task_id}")
