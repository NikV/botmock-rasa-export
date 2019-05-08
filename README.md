# Botmock Rasa Export

> requires node.js >= 10.15.x

Build Rasa bots from [Botmock](https://botmock.com) projects.

### Example

![project](https://botmock.s3.amazonaws.com/1556284636.png)

For example, running `npm start` on the above project will produce the following files

`domain.yml`

```yaml
# generated 4/26/2019, 9:20:24 AM
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
    text: Oh no!
    image: https://botmock.s3.amazonaws.com/1556284636.png
```

`fromIntents.md`

```md
<!-- start | Tue May 07 2019 16:19:18 GMT-0700 (Pacific Daylight Time) -->
## PROJECT_NAME | welcome
* welcome
 - utter_bot_says # welcome
 - utter_what_next # what to do next?

## PROJECT_NAME | nothing
* nothing
 - utter_bot_says # Oh no!
 - utter_image # link to img

## PROJECT_NAME | something
* something
 - utter_bot_says # Perfect!
 - utter_quick_replies # Rate this bot (Good|Bad)
<!-- end | Tue May 07 2019 16:19:18 GMT-0700 (Pacific Daylight Time) -->
```

`nlu.md`

```md
<!-- 2019-04-18 15:03:32.000000 | 6f9354ab-c1e3-4342-a1b1-192a514a0388 -->
## intent:something
- [thing](thing)
- I want to do [thing](thing)
- Can I do [thing](thing)?
- Let me do [thing](thing)?
```

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

## Want to help?

Found bugs or have some ideas to improve this plugin? We'd love to to hear from you! You can start by submitting an issue at the [Issues](https://github.com/Botmock/botmock-dialogflow-export/issues) tab. If you want, feel free to submit a pull request and propose a change as well!

### Submitting a Pull Request
1. Start with creating an issue if possible -- the more information, the better!
2. Fork the Repository
3. Make a new change under a branch based on master. Ideally, the branch should be based on the issue you made such as issue-530
4. Send the Pull Request, followed by a brief description of the changes you've made. Reference the issue.

*NOTE: Make sure to leave any sensitive information out of an issue when reporting a bug with imagery or copying and pasting error data. We want to make sure all your info is safe!*

## License
Botmock Dialogflow Export is copyright © 2019 Botmock. It is free software, and may be redistributed under the terms specified in the LICENSE file.
