(await import('dotenv')).config();
import * as utils from '@botmock-api/utils';
import { stringify as toYAML } from 'yaml';
import chalk from 'chalk';
import uuid from 'uuid/v4';
import fs from 'fs';
import { join } from 'path';
import SDKWrapper from './lib/SDKWrapper';
import { genStoriesFromIntents } from './lib/storiesFromIntents';
import { genIntents } from './lib/nlu';
import { OUTPUT_PATH } from './constants';

try {
  await utils.checkEnvVars();
} catch (_) {
  console.error('too few variables in .env');
  process.exit(1);
}

const client = new SDKWrapper();
const { projectName, messages, intents, entities } = await client.init();
const STORIES_PATH = join(OUTPUT_PATH, projectName);

try {
  await fs.promises.access(OUTPUT_PATH, fs.constants.R_OK);
  await fs.promises.access(STORIES_PATH, fs.constants.R_OK);
} catch (_) {
  // Create output directories if inexistant
  fs.mkdirSync(OUTPUT_PATH);
  fs.mkdirSync(STORIES_PATH);
}

const getMessage = id => messages.find(m => m.message_id === id);
// TODO: heuristic for markdown file splitting
// TODO(?): config file for which utterances should be prefixed with slot_ / utter_
// Output the following directory hierarchy:
// output/
//   |── domain.yml
//   |── nlu.md
//   └── PROJECT_NAME/
//       |── fromIntents.md
//       └── story.md
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
            case 'image':
              type = 'image';
              payload = m.payload.image_url;
              break;
            // case 'generic':
            // case 'list':
            case 'button':
            case 'quick_replies':
              type = 'buttons';
              payload = (m.payload[m.message_type] || []).map(
                ({ title, payload }) => ({
                  title,
                  payload
                })
              );
              break;
          }
          return {
            ...acc_,
            [type || m.message_type]:
              payload ||
              `${
                m.payload[m.message_type]
                  ? m.payload[m.message_type].replace(/\n/g, '\\n')
                  : m.payload[m.message_type]
              }`
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
  // Write intent file (see https://rasa.com/docs/nlu/dataformat/)
  await fs.promises.writeFile(`${OUTPUT_PATH}/nlu.md`, genIntents(intents));

  // Write stories.md file based on intents
  const storyData = { intentMap, intents, nodeCollector, messages };
  await fs.promises.writeFile(
    join(STORIES_PATH, 'fromIntents.md'),
    genStoriesFromIntents({ projectName, storyData })
  );

  // Write story file (see https://rasa.com/docs/core/stories/#format) containing
  // stories for each journey (i.e. possible path) in the project
  // TODO: use `genStories` util to create this markdown
//   await fs.promises.writeFile(
//     `${STORIES_PATH}/story.md`,
//     `<!-- generated ${new Date().toLocaleString()} -->
// ${Array.from(utils.enumeratePaths(messages))
//   .map(messageIds => ({
//     name: `story_${uuid()}`,
//     intents: Array.from(intentMap)
//       .filter(([id]) => messageIds.includes(id))
//       .reduce((acc, [, intents]) => [...acc, ...intents], [])
//   }))
//   .reduce((acc, obj) => {
//     return `${acc}## ${obj.name}
// ${obj.intents
//   .map(id => `* ${intents.find(i => i.id === id).name}\n`)
//   .join('')}\n`;
//   }, ``)}`
//   );
  console.log(chalk.bold('done'));
} catch (err) {
  console.error(err);
  process.exit(1);
}
