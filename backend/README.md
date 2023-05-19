# dev

- `poetry install`
- in VSCode, run all tasks
- in VSCode, `Python: select interpreter`, choose poetry
- in VSCode, Run and Debug

# deploy

```sh
fly redis create
```

```sh
cd deploy/worker # or server
cat ../../.env.production | fly secrets import
fly deploy
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
