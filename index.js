(await import('dotenv')).config();
import * as utils from '@botmock-api/utils';
import { stringify as toYAML } from 'yaml';
import chalk from 'chalk';
import fs from 'fs';
import SDKWrapper from './lib/SDKWrapper';
// import { trainDialogModel } from './lib/nlp';
// import { generateUtterances } from './lib/api';
import { OUTPUT_PATH } from './constants';

try {
  await fs.promises.access(OUTPUT_PATH, fs.constants.R_OK);
} catch (_) {
  // Create output directory if it doesn't exist
  fs.mkdirSync(OUTPUT_PATH);
}

// TODO: see https://rasa.com/docs/core/domains/#images-and-buttons
// TODO: talk to microservice and recieve generated intents
// TODO: create error if rasa_core absent on local machine
// TODO: fix assumption of explicit welcome intent
try {
  const client = new SDKWrapper();
  const { messages, intents, entities } = await client.init();
  const getMessage = id => messages.find(m => m.message_id === id);
  // Define map of messages that follow from intents
  const intentMap = utils.createIntentMap(messages);
  const nodeCollector = utils.createNodeCollector(intentMap, getMessage);
  const templates = Array.from(intentMap).reduce(
    (acc, [messageId, intentIds]) => {
      const message = getMessage(messageId);
      const collectedMessages = nodeCollector(message.next_message_ids).map(
        getMessage
      );
      return {
        ...acc,
        [messageId]: [message, ...collectedMessages].reduce(
          (acc_, v) => ({
            ...acc_,
            [v.message_type]: v.payload[v.message_type]
          }),
          {}
        )
      };
    },
    {}
  );
  await fs.promises.writeFile(
    `${OUTPUT_PATH}/domain.yml`,
    toYAML({
      intents: intents.map(intent => intent.name),
      entities: entities.map(entity => entity.name),
      actions: Object.keys(templates),
      templates
    })
  );
  // await trainDialogModel();
  console.log(chalk.bold('done'));
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
