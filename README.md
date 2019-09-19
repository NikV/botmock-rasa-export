# Botmock Rasa Export

> Build [Rasa](https://rasa.com) bots from [Botmock](https://botmock.com) projects

This script generates Rasa [training data](https://rasa.com/docs/rasa/nlu/training-data-format/#training-data-format), [stories](https://rasa.com/docs/rasa/core/stories/#stories), and [domain](https://rasa.com/docs/rasa/core/domains/) from a given Botmock project.

<!-- ## Sample Output -->

## Prerequisites

- [Node.js](https://nodejs.org/en/)

- [Rasa](https://rasa.com/docs/rasa/user-guide/installation/#quick-installation)

## Guide

### installation

- clone this repo, cd into it, and create `.env`:

```shell
git clone git@github.com:Botmock/botmock-rasa-export.git

cd botmock-rasa-export

touch .env
```

- edit `.env` to contain the following (with your own values filled in):

```shell
BOTMOCK_TEAM_ID=@TEAM-ID
BOTMOCK_PROJECT_ID=@PROJECT-ID
BOTMOCK_BOARD_ID=@BOARD-ID
BOTMOCK_TOKEN=@TOKEN
```

- run `npm install`

- run `npm start` to produce `/output`, containing your project's training data, stories, and domain files.

## Want to help?

Found bugs or have some ideas to improve this integration? We'd love to to hear from you! You can start by submitting an issue at the [Issues](https://github.com/Botmock/botmock-rasa-export/issues) tab. If you want, feel free to submit a pull request and propose a change as well!

### Submitting a Pull Request

1. Start with creating an issue if possible, the more information, the better!
2. Fork the Repository
3. Make a new change under a branch based on master. Ideally, the branch should be based on the issue you made such as "issue-530"
4. Send the Pull Request, followed by a brief description of the changes you've made. Reference the issue.

_NOTE: Make sure to leave any sensitive information out of an issue when reporting a bug with imagery or copying and pasting error data. We want to make sure all your info is safe!_

## License

Botmock Rasa Export is copyright © 2019 Botmock. It is free software, and may be redistributed under the terms specified in the LICENSE file.
