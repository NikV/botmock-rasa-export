(await import('dotenv')).config();
import * as utils from '@botmock-api/utils';
import { stringify as toYAML } from 'yaml';
import chalk from 'chalk';
import fs from 'fs';
import { toMd } from './lib/nlp';
import SDKWrapper from './lib/SDKWrapper';
import { OUTPUT_PATH } from './constants';

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

// Output the following directory hierarchy:
// output/
//   |── domain.yml
//   └── project_name/
//       └── story.md
try {
  // TODO: heuristic for markdown file splitting
  // TODO: config file for which utterances should be prefixed with slot_ / utter_ ?
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
      // Grab this message's response name; if this name has been seen already,
      // append its id to it
      let { nodeName } = message.payload;
      nodeName = nodeName.replace(/\s/g, '_').toLowerCase();
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
    `# generated ${new Date().toLocaleString()}
${toYAML({
  intents: intents.map(intent => intent.name),
  entities: entities.map(entity => entity.name),
  actions: Object.keys(templates),
  templates
})}`
  );
  // Write story file (see https://rasa.com/docs/core/stories/#format)
  await fs.promises.writeFile(
    `${STORIES_PATH}/story.md`,
    `<!-- generated ${new Date().toLocaleString()} -->
${toMd({
  name: projectName,
  intents: Array.from(intentMap).reduce(
    (acc, [messageId, intentIds]) => ({
      ...acc,
      ...intentIds.reduce((acc_, id) => {
        const { name: intentName } = intents.find(i => i.id === id);
        const message = getMessage(messageId);
        return {
          [intentName]: [
            message,
            ...nodeCollector(message.next_message_ids).map(getMessage)
          ]
            // TODO: rm this restriction
            .filter(m => m.message_type === 'text')
            .map(m => m.payload[m.message_type].toLowerCase())
            .map(str => str.replace(/\s/g, '_'))
        };
      }, {})
    }),
    {}
  )
})}`
  );
  console.log(chalk.bold('done'));
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
