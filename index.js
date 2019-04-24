(await import('dotenv')).config();
import * as utils from '@botmock-api/utils';
import { stringify as toYAML } from 'yaml';
import chalk from 'chalk';
import uuid from 'uuid/v4';
import fs from 'fs';
import SDKWrapper from './lib/SDKWrapper';
import { OUTPUT_PATH } from './constants';
// import { generateUtterances } from './lib/api';

const client = new SDKWrapper();
const { projectName, messages, intents, entities } = await client.init();
const getMessage = id => messages.find(m => m.message_id === id);

const STORIES_PATH = `${OUTPUT_PATH}/${projectName}`;

try {
  await fs.promises.access(OUTPUT_PATH, fs.constants.R_OK);
  await fs.promises.access(STORIES_PATH, fs.constants.R_OK);
} catch (_) {
  // Create output directories if inexistant
  fs.mkdirSync(OUTPUT_PATH);
  fs.mkdirSync(STORIES_PATH);
}

// TODO: https://rasa.com/docs/core/api/slots_api/
try {
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
      let { nodeName } = message.payload;
      if (Object.keys(acc).includes(nodeName)) {
        nodeName = `${nodeName}-${messageId}`;
      }
      // Map our node types to those appropriate for Rasa yaml; i.e. group
      // certain types of ours to carry the same payload
      return {
        ...acc,
        [nodeName]: [message, ...collectedMessages].reduce((acc_, m) => {
          let type, payload;
          switch (m.message_type) {
            // case 'carousel':
            case 'image':
              type = 'image';
              payload = m.payload.image_url;
              break;
            case 'button':
            case 'quick_replies':
              type = 'buttons';
              payload = m.payload[m.message_type].map(({ title, payload }) => ({
                title,
                payload
              }));
              break;
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
  // TODO: heuristic for splitting files
  await fs.promises.writeFile(
    `${STORIES_PATH}/story.md`,
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
