import "dotenv/config";
import * as Sentry from "@sentry/node";
import { RewriteFrames } from "@sentry/integrations";
// import * as utils from "@botmock-api/utils";
// import { stringify as toYAML } from "yaml";
import { remove, mkdirp } from "fs-extra";
// import uuid from "uuid/v4";
import { join } from "path";
// @ts-ignore
import pkg from "./package.json";
import { default as APIWrapper } from "./lib/project";
// import { default as FileWriter } from "./lib/file";
// import { genStoriesFromIntents } from "./lib/storiesFromIntents";
// import { genIntents } from "./lib/nlu";
import { SENTRY_DSN } from "./lib/constants";
import { log } from "./lib/log";
import * as Assets from "./lib/types";

declare global {
  namespace NodeJS {
    interface Global {
      __rootdir__: string;
    }
  }
}

global.__rootdir__ = __dirname || process.cwd();

Sentry.init({
  dsn: SENTRY_DSN,
  release: `${pkg.name}@${pkg.version}`,
  integrations: [new RewriteFrames({
    root: global.__rootdir__
  })]
});

async function main(args: string[]): Promise<void> {
  // Sentry.captureMessage("entered main");
  try {
    log("recreating output directory");
    const outputDir = join(__dirname, "output");
    await remove(outputDir);
    await mkdirp(outputDir);
    const apiWrapper = new APIWrapper({
      token: process.env.BOTMOCK_TOKEN,
      teamId: process.env.BOTMOCK_TEAM_ID,
      projectId: process.env.BOTMOCK_PROJECT_ID,
      boardId: process.env.BOTMOCK_BOARD_ID,
    });
    apiWrapper.on("asset-fetched", (assetName: string) => {
      log(`fetched ${assetName}`);
    });
    apiWrapper.on("error", (err: Error) => {
      throw err;
    });
    log("fetching botmock assets");
    const projectData: Assets.CollectedResponses = await apiWrapper.fetch();
    // const writer = new FileWriter({ outputDir, projectData });
    // await writer.createYml();
    // await writer.createMd();
  } catch (err) {
    throw err;
  }
  log("done");
}

main(process.argv).catch(err => {
  if (!process.env.SHOULD_OPT_OUT_OF_ERROR_REPORTING) {
    Sentry.captureException(err);
  }
  process.exit(1);
})

// const client = new SDKWrapper();
// const { projectName, messages, intents, entities } = await client.init();
// const STORIES_PATH = join(OUTPUT_PATH, projectName);

// try {
//   await fs.promises.access(OUTPUT_PATH, fs.constants.R_OK);
//   await fs.promises.access(STORIES_PATH, fs.constants.R_OK);
// } catch (_) {
//   // Create output directories if inexistant
//   fs.mkdirSync(OUTPUT_PATH);
//   fs.mkdirSync(STORIES_PATH);
// }

// const getMessage = id => messages.find(m => m.message_id === id);
// // Output the following directory hierarchy:
// // output/
// //   |── domain.yml
// //   |── nlu.md
// //   └── PROJECT_NAME/
// //       |── fromIntents.md
// //       └── story.md
// try {
//   // Define map of messages -> intents connected to them
//   const intentMap = utils.createIntentMap(messages);
//   const nodeCollector = utils.createNodeCollector(intentMap, getMessage);
//   // Create yaml-consumable object from the intent map
//   const templates = Array.from(intentMap).reduce(
//     (acc, [messageId, intentIds]) => {
//       const message = getMessage(messageId);
//       const collectedMessages = nodeCollector(message.next_message_ids).map(
//         getMessage
//       );
//       // Grab this message's response name; if this name has been seen already,
//       // append its id to it
//       let { nodeName } = message.payload;
//       nodeName = nodeName.replace(/\s/g, '_').toLowerCase();
//       if (Object.keys(acc).includes(nodeName)) {
//         nodeName = `${nodeName}-${messageId}`;
//       }
//       // Map our node types to those appropriate for Rasa yaml; i.e. group
//       // certain types of ours to carry the same payload
//       return {
//         ...acc,
//         [nodeName]: [message, ...collectedMessages].reduce((acc_, m) => {
//           let type, payload;
//           switch (m.message_type) {
//             case 'image':
//               type = 'image';
//               payload = m.payload.image_url;
//               break;
//             // case 'generic':
//             // case 'list':
//             case 'button':
//             case 'quick_replies':
//               type = 'buttons';
//               payload = (m.payload[m.message_type] || []).map(
//                 ({ title, payload }) => ({
//                   title,
//                   payload
//                 })
//               );
//               break;
//           }
//           return {
//             ...acc_,
//             [type || m.message_type]:
//               payload ||
//               `${
//                 m.payload[m.message_type]
//                   ? m.payload[m.message_type].replace(/\n/g, '\\n')
//                   : m.payload[m.message_type]
//               }`
//           };
//         }, {})
//       };
//     },
//     {}
//   );
//   // Write domain file (see https://rasa.com/docs/core/domains/#domain-format)
//   await fs.promises.writeFile(
//     join(OUTPUT_PATH, 'domain.yml'),
//     `# generated ${new Date().toLocaleString()}
// ${toYAML({
//   intents: intents.map(intent => intent.name),
//   entities: entities.map(entity => entity.name),
//   actions: Object.keys(templates),
//   templates
// })}`
//   );
//   // Write intent file (see https://rasa.com/docs/nlu/dataformat/)
//   await fs.promises.writeFile(
//     join(OUTPUT_PATH, 'nlu.md'),
//     genIntents(intents, entities)
//   );

//   // Write stories.md file based on intents
//   const storyData = { intentMap, intents, nodeCollector, messages };
//   await fs.promises.writeFile(
//     join(STORIES_PATH, 'fromIntents.md'),
//     genStoriesFromIntents({ projectName, storyData })
//   );
//   console.log('done');
// } catch (err) {
//   console.error(err);
//   process.exit(1);
// }
