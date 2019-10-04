# Botmock Rasa Export

> Creates [Rasa](https://rasa.com) domain, nlu, and stories from a [Botmock](https://botmock.com) project.

This script generates Rasa [training data](https://rasa.com/docs/rasa/nlu/training-data-format/#training-data-format), [stories](https://rasa.com/docs/rasa/core/stories/#stories), and [domain](https://rasa.com/docs/rasa/core/domains/) from a given Botmock project.

## Prerequisites

- [Node JS](https://nodejs.org/en/) version 12.x

```bash
#determine nodejs version
node --version
```

- [Rasa](https://rasa.com/docs/rasa/user-guide/installation/#quick-installation) installation

## Guide

To start, you will have to clone the repository, go into the directory,  and install the required dependencies for this script.

git clone git@github.com:Botmock/botmock-botframework-export.git

cd botmock-botframework-export

npm i
The next step is to go into folder and create a file called /.env , which will host your Botmock-based information. 

This file will contain some important information that will help the script extract the correct project from our API and run the export on it. Open the the .env file in your editor of choice.

You will need to setup the following variables in the file:

BOTMOCK_TOKEN="@YOUR-BOTMOCK-TOKEN"
BOTMOCK_TEAM_ID="@YOUR-BOTMOCK-TEAM-ID"
BOTMOCK_BOARD_ID="@YOUR-BOTMOCK-BOARD-ID"
BOTMOCK_PROJECT_ID="@YOUR-BOTMOCK-PROJECT-ID"

OUTPUT_DIR=optional/directory/for/output
To get your Botmock team ID you will need to visit http://app.botmock.com and login. Once logged in click on the "Teams" dropdown in the top bar and click on "Team Profile". 

- run `git clone git@github.com:Botmock/botmock-rasa-export.git`
- run `cd botmock-rasa-export`
- create `.env`
- edit `.env` to contain the following (with your own values filled in):
```bash
BOTMOCK_TEAM_ID=your-team-id
BOTMOCK_PROJECT_ID=your-project-id
BOTMOCK_BOARD_ID=your-board-id
BOTMOCK_TOKEN=your-token

```
- run `npm install`
- run `npm start`
- move `domain.yml` and `data/nlu.md` and `data/stories.md` to your Rasa project directory
- run `rasa train`
- run `rasa shell`

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
