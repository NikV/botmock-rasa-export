(await import('dotenv')).config();
import * as utils from '@botmock-api/utils';
import { stringify as toYAML } from 'yaml';
import chalk from 'chalk';
import fs from 'fs';
import SDKWrapper from './lib/SDKWrapper';
import { OUTPUT_PATH } from './constants';
import { toMd } from './lib/nlp';

try {
  await fs.promises.access(OUTPUT_PATH, fs.constants.R_OK);
} catch (_) {
  // Create output directory if it doesn't exist
  fs.mkdirSync(OUTPUT_PATH);
}

try {
  const client = new SDKWrapper();
  const { messages, intents, entities } = await client.init();
  const getMessage = id => messages.find(m => m.message_id === id);
  // Define map of messages that follow from intents
  const intentMap = utils.createIntentMap(messages);
  const nodeCollector = utils.createNodeCollector(intentMap, getMessage);
  // Create yaml-consumable object from intent map
  const templates = Array.from(intentMap).reduce(
    (acc, [messageId, intentIds]) => {
      const message = getMessage(messageId);
      const collectedMessages = nodeCollector(message.next_message_ids).map(
        getMessage
      );
      // Map our node types to those appropriate for Rasa yaml
      return {
        ...acc,
        [messageId]: [message, ...collectedMessages].reduce((acc_, m) => {
          let type, payload;
          switch (m.message_type) {
            case 'button':
            case 'quick_replies':
              type = 'buttons';
              payload = m.payload[m.message_type].map(({ title, payload }) => ({
                title,
                payload
              }));
          }
          return {
            ...acc_,
            [type || m.message_type]: payload || m.payload[m.message_type]
          };
        }, {})
      };
    },
    {}
  );
  // Write domain file (see https://rasa.com/docs/core/domains/#domain-format)
  await fs.promises.writeFile(
    `${OUTPUT_PATH}/domain.yml`,
    toYAML({
      intents: intents.map(intent => intent.name),
      entities: entities.map(entity => entity.name),
      actions: Object.keys(templates),
      templates
    })
  );
  // TODO: Write stories (see https://rasa.com/docs/core/stories/#format)
  await fs.promises.writeFile(`${OUTPUT_PATH}/stories.md`, '');
  console.log(chalk.bold('done'));
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
