const convertToStories = ({ intentMap, intents, nodeCollector, messages }) => {
  const getMessage = id => messages.find(m => m.message_id === id);
  // returns array of stories with form:
  // intent -> utterances
  return Array.from(intentMap).reduce(
    (acc, [messageId, intentIds]) => ({
      ...acc,
      // generates a single story
      ...intentIds.reduce((acc_, id) => {
        // find the intent and gets its name
        const { name: intentName } = intents.find(i => i.id === id);
        // gets a message object
        const message = getMessage(messageId);
        return {
          [intentName]: [
            message,
            ...nodeCollector(message.next_message_ids).map(getMessage)
          ]
            // TODO: rm this restriction
            .filter(m => m.message_type === 'text')
            // prints the utterance text as a response -- not desired behavior
            // .map(m => m.payload[m.message_type].toLowerCase())
            .map(m => m.payload.nodeName.toLowerCase())
            .map(str => str.replace(/\s/g, '_'))
        };
      }, {})
    }),
    {}
  );
};

const generateStoryArray = (projectName, stories) => {
  const generateUtterances = (story, stories) =>
    stories[story].map(utterance => generateUtterance(utterance)).join('\n');

  const generateUtterance = utterance => `  - utter_${utterance}`;

  return Object.keys(stories).map(
    story =>
      `## ${projectName} | ${story.replace(
        /_/g,
        ' '
      )}\n* ${story}\n${generateUtterances(story, stories)}`
  );
};

export function genStoriesFromIntents({ projectName, storyData }) {
  const stories = convertToStories(storyData);
  const storyStrings = generateStoryArray(projectName, stories).join('\n\n');
  const timestamp = new Date();
  return `<!-- start | ${timestamp} -->\n${storyStrings}\n<!-- end | ${timestamp} -->`;
}