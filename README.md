# Botmock Rasa Export

Build Rasa bots from [Botmock](https://botmock.com) projects.

- Tutorial Video (Coming Soon)
- Documentation (Coming Soon)
- [Support Email](mailto:help@botmock.com)

## Prerequisites

- [Node.js](https://nodejs.org/en/)

### Guide

- clone this repo and create `/.env` with the following content:

```
BOTMOCK_TEAM_ID="@TEAM-ID"
BOTMOCK_PROJECT_ID="@PROJECT-ID"
BOTMOCK_BOARD_ID="@BOARD-ID"
BOTMOCK_TOKEN="@TOKEN"
```

#### Local installation

- run `npm install`

- run `npm start` to produce `/output`; containing your project's `Domain` and `Story` collection

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
