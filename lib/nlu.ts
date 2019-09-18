export function genIntents({ intents, entities }) {
  // for each example, input the appropriate entity values mapped to entities (if any)
  const generateExample = ({ text, variables }, entityList) => {
    if (variables) {
      let output = text;
      variables.forEach(({ name, entity: variableId }) => {
        // side effect: replaces Botmock variable with Rasa entity
        // likely good place to refactor using more FP
        let search = new RegExp(name, 'gi');
        const formattedName = name
          .replace(/%/g, '')
          .replace(/ /g, '_')
          .toLowerCase();

        output = output.replace(search, `[${formattedName}](${formattedName})`);
        search = new RegExp(`\\[(${formattedName})\\]`, 'gi');
        // good place to have NLG domain specific language like Chatito or Chatette take over
        output = (entityList
          // find matching entity, get array of data values it can take on
          .find(({ id: entityId }) => entityId === variableId) || { data:[] })
          .data.map(({ value: entityVal, synonyms }) => {
            //create a copy of the current example for each entity value
            const singleExample = output.replace(
              search,
              `[${entityVal.trim()}]`
            );
            if (synonyms.length > 0) {
              // create examples for each synonym (required by rasa for detection)
              const multipleExamples = [
                singleExample,
                ...synonyms.map(synonym =>
                  output.replace(search, `[${synonym.trim()}]`)
                )
              ].join('\n- ');
              return multipleExamples;
            }
            return singleExample;
          });
      });
      return `- ${output}`;
    } else {
      return `- ${text}`;
    }
  };

  // for each intent, create comment with id an timestamp
  const generateIntent = (
    { id, name, utterances: examples, updated_at: { date: timestamp } },
    entities
  ) => {
    return `
<!-- ${timestamp} | ${id} -->
## intent:${name.toLowerCase()}
${examples.map(example => generateExample(example, entities)).join('\n')}
`;
  };

  const genEntity = ({
    id,
    name,
    data: values,
    updated_at: { date: timestamp }
  }) => {
    const synonym_variance = values.reduce(
      (count, { synonyms }) => count + synonyms.length,
      0
    );
    // if there are less synonyms than values, create a lookup table
    if (synonym_variance < values.length) {
      const lookupArr = values.map(({ value, synonyms }) =>
        synonyms.length ? `- ${value}\n- ${synonyms.join('\n-')}` : `- ${value}`
      );
      return `
<!-- ${timestamp} | ${id} -->
## lookup:${name.replace(/ |-/g, '_').toLowerCase()}
${lookupArr.join('\n')}
`;
    } else {
      // else, there are enough synonyms
      const synonymsArray = values.map(
        ({ value, synonyms }) =>
          `
<!-- ${timestamp} | entity : ${name} | ${id} -->
## synonym:${value.replace(/ |-/g, '_').toLowerCase()}
- ${
            synonyms.length
              ? synonyms.join('\n-')
              : '<!-- need to generate value synonyms here -->'
          }
`
      );
      return synonymsArray.join('\n');
    }
  };

  // return the file to be written as a string
  return `${intents.map(intent => generateIntent(intent, entities)).join('\n')}
${entities.map(entity => genEntity(entity)).join('\n')}`;
}
