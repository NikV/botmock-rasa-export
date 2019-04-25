# Botmock Rasa Export

> requires node.js >= 10.15.x

Build Rasa bots from [Botmock](https://botmock.com) projects.

### Guide

- clone this repo and create `/.env` with the following content:

```
BOTMOCK_TEAM_ID="@TEAM-ID"
BOTMOCK_PROJECT_ID="@PROJECT-ID"
BOTMOCK_BOARD_ID="@BOARD-ID"
BOTMOCK_TOKEN="@TOKEN"
```

- run `npm install`

- run `npm start` to produce `/output`; containing your project's `Domain` and `Story` collection

#### Output

<!-- **output/**
|── domain.yml
└── **project_name/**
----└── story.md -->

`output/domain.yml`

```yml
# generated 4/25/2019, 8:34:26 AM
intents:
  - nothing
  - something
  - welcome
entities:
  - name
actions:
  - bot_says
  - bot_says-6f9354ab-c1e3-4342-a1b1-192a514a0388
  - bot_says-4ca10d38-e3af-4b33-a3af-4aabc6a1fe1d
templates:
  bot_says:
    text: What to do next?
  bot_says-6f9354ab-c1e3-4342-a1b1-192a514a0388:
    text: Perfect!
    buttons:
      - title: Good
        payload: GOOD
      - title: Bad
        payload: BAD
  bot_says-4ca10d38-e3af-4b33-a3af-4aabc6a1fe1d:
    text: How sad to hear!
    image: https://botmock.s3.amazonaws.com/1556038198.png
```

`output/project_name/story.md`

```md
<!-- generated 4/25/2019, 8:34:26 AM -->

## fm

- welcome
  - welcome!
  - what_to_do_next?
- something
  - perfect!
- nothing
  - how_sad_to_hear!
```
