# dev

- install flyctl
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
fly deploy -c fly.server.toml -a $APP
```

## queue

```sh
APP=brainshare-pelican-backend-worker
fly apps create $APP # first time
cat .env.production | fly secrets import -a $APP
fly deploy -c fly.worker.toml -a $APP
```

## enclave

```sh
APP=brainshare-pelican-backend-enclave
fly apps create $APP # first time
# NEVER deploy secrets to the enclave
fly deploy -c fly.enclave.toml -a $APP
# scale down
fly scale count 1 -a $APP
# stop the remaining VM; we'll clone it later
fly machine list -a $APP --json | jq -cr '.[].id' |  xargs -I _ fly machine stop _
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
