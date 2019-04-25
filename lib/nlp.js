// import fetch from 'node-fetch';
// import { UTTERANCE_SERVICE_URL } from '../constants';

// export async function generateUtterances(intent) {
//   try {
//     const json = await (await fetch(UTTERANCE_SERVICE_URL, {
//       method: 'POST',
//       body: JSON.stringify(intent),
//       headers: { 'Content-Type': 'application/json' }
//     })).json();
//     return json;
//   } catch (_) {
//     throw new Error('failed to generate actions from intent');
//   }
// }

// Create template literal from object
export function toMd({ name: storyName, intents }) {
  return `<!-- generated ${new Date().toLocaleString()} -->
## ${storyName}
${Object.keys(intents)
  .map(
    intent =>
      `* ${intent}\n${intents[intent]
        .map(utterance => `\t- ${utterance}`)
        .join('\n')}`
  )
  .join('\n')}\n`;
}
