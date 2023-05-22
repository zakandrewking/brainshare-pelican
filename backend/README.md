# dev

- `poetry install`
- in VSCode, run all tasks
- in VSCode, `Python: select interpreter`, choose poetry
- in VSCode, Run and Debug

# deploy

## redis

```sh
fly redis create
```

## server

```sh
APP=brainshare-pelican-backend-server
fly apps create $APP # first time
cat .env.production | fly secrets import -a $APP
fly deploy --config fly.server.toml -a $APP
```

## queue

```sh
APP=brainshare-pelican-backend-worker
fly apps create $APP # first time
cat .env.production | fly secrets import -a $APP
fly deploy --config fly.worker.toml -a $APP
```

# test

with vscode, or:

```
poetry install
poetry self add poetry-dotenv-plugin
poetry run pytest
```

# tricks

ssh into the fly container:

```
cd deploy/worker # or server
fly ssh issue --agent
fly ssh console
```
