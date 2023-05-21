from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.auth import check_session

from backend.tasks import get_categories
from backend.schemas import (
    RunGetCategoriesRequest,
)

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


@app.post("/run/get_categories")
def post_run_get_categories(
    data: RunGetCategoriesRequest, access_token=Depends(check_session)
) -> None:
    task = get_categories.delay(data.bucket, data.name, access_token)
    # TODO switch to logging
    print(f"Task created, id: {task.task_id}")
