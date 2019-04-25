// export async function createUtteranceVariations(initialUtterance) {}

// Create template literal from object
export function toMd({ name: storyName, intents }) {
  return `## ${storyName}
${Object.keys(intents)
  .map(
    intent =>
      `* ${intent}\n${intents[intent]
        .map(utterance => `\t- ${utterance}`)
        .join('\n')}`
  )
  .join('\n')}\n`;
}
