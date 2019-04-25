# Botmock Rasa Export

> requires node.js >= 10.15.x

Build Rasa bots from [Botmock](https://botmock.com) projects.

#### Guide

- clone this repo and create `/.env` with the following content:

```
BOTMOCK_TEAM_ID="@TEAM-ID"
BOTMOCK_PROJECT_ID="@PROJECT-ID"
BOTMOCK_BOARD_ID="@BOARD-ID"
BOTMOCK_TOKEN="@TOKEN"
```

- run `npm install`

- run `npm start` to produce `/output`; containing your project's `Domain` and `Story` collection
