from sqlmodel import SQLModel


class RunGetCategoriesRequest(SQLModel):
    bucket: str
    name: str
