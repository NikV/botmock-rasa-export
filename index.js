(await import('dotenv')).config();
import * as utils from '@botmock-api/utils';
import { stringify as toYAML } from 'yaml';
import chalk from 'chalk';
import uuid from 'uuid/v4';
import fs from 'fs';
import SDKWrapper from './lib/SDKWrapper';
import { OUTPUT_PATH } from './constants';

try {
  await fs.promises.access(OUTPUT_PATH, fs.constants.R_OK);
} catch (_) {
  // Create output directory if it doesn't exist
  fs.mkdirSync(OUTPUT_PATH);
}

// TODO: https://rasa.com/docs/core/api/slots_api/
try {
  const client = new SDKWrapper();
  const { messages, intents, entities } = await client.init();
  const getMessage = id => messages.find(m => m.message_id === id);
  // Define map of messages -> intents connected to them
  const intentMap = utils.createIntentMap(messages);
  const nodeCollector = utils.createNodeCollector(intentMap, getMessage);
  // Create yaml-consumable object from the intent map
  const templates = Array.from(intentMap).reduce(
    (acc, [messageId, intentIds]) => {
      const message = getMessage(messageId);
      const collectedMessages = nodeCollector(message.next_message_ids).map(
        getMessage
      );
      // Map our node types to those appropriate for Rasa yaml; i.e. group
      // certain types of ours to carry the same payload
      return {
        ...acc,
        [messageId]: [message, ...collectedMessages].reduce((acc_, m) => {
          let type, payload;
          switch (m.message_type) {
            // TODO: ..
            // case 'carousel':
            // case 'image':
            //   break;
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
  // Create stories for each combination of message -> intent connected to it
  // (see https://rasa.com/docs/core/stories/#format)
  const stories = Array.from(intentMap).reduce(
    (acc, [messageId, connectedIntents]) => {
      const message = getMessage(messageId);
      return {
        ...acc,
        ...connectedIntents.reduce((acc_, intent) => {
          const storyId = uuid();
          const actions = nodeCollector(message.next_message_ids);
          // const entities = {};
          return {
            ...acc_,
            [`story_${storyId}`]: { intents: connectedIntents, actions }
          };
        }, {})
      };
    },
    {}
  );
  // Write the stories markdown file from the stories object
  await fs.promises.writeFile(
    `${OUTPUT_PATH}/stories.md`,
    Object.keys(stories)
      .map(storyId => {
        const intentsForStory = stories[storyId].intents.map(intent => {
          return `* ${intent}\n${stories[storyId].actions.map(
            a => `\t- ${a}`
          )}\n`;
        });
        return `## ${storyId}\n${intentsForStory}`;
      })
      .join('\n')
  );
  console.log(chalk.bold('done'));
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
