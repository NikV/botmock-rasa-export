# Botmock Rasa Export

> requires node.js >= 10.15.x

Build Rasa bots from [Botmock](https://botmock.com) projects.

#### Guide

- clone this repo and create `/.env` with the following content:

```
BOTMOCK_TEAM_ID="@TEAM-ID"
BOTMOCK_PROJECT_ID="@PROJECT-ID"
BOTMOCK_BOARD_ID="@BOARD-ID"
BOTMOCK_TOKEN="@TOKEN-ID"
```

- run `npm start` to produce `/output/domain.yml` and `/output/stories.md`

- from the current directory, run `python -m rasa_core.train -d output/domain.yml -s output/stories.md -o models/dialogue`
