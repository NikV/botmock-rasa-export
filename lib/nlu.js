export function genIntents(intents) {
  const genExample = ({ text, variables }) => {
    if (variables) {
      let output = text;
      variables.forEach(({ name }) => {
        // side-effect: replaces Botmock var with Rasa entity
        output = output.replace(name, `{${name.slice(1, name.length - 1)}}`);
      });
      return `- ${output}`;
    } else {
      return `- ${text}`;
    }
  };

  // for each intent, create comment with id an timestamp
  const genIntent = ({ id, name, utterances: examples, updated_at: { date : timestamp } }) => {
    return `
<!-- ${timestamp} | ${id} -->
## intent:${name}
${examples.map(example => genExample(example)).join('\n')}
`;
  };
  
  return `${intents.map(intent => genIntent(intent)).join('\n')}`;
}
