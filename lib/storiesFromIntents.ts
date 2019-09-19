import { EOL } from "os";
import { IntentMap } from "./file"
import * as Assets from "./types";

interface ConversionConfig {
  intentMap: IntentMap;
  intents: Assets.Intent[];
  messageCollector: Function;
  messages: Assets.Message[];
}

const convertToStories = ({ intentMap, intents, messageCollector, messages }: ConversionConfig) => {
  const getMessage = id => messages.find(m => m.message_id === id);
  return Array.from(intentMap).reduce(
    (acc, [messageId, intentIds]) => ({
      ...acc,
      // generates a single story
      ...intentIds.reduce((acc_, id) => {
        // find the intent and gets its name
        const { name: intentName }: any = intents.find(i => i.id === id) || {};
        // gets a message object
        const message = getMessage(messageId);
        return {
          [intentName]: [
            message,
            ...messageCollector(message.next_message_ids).map(getMessage)
          ]
            .map(m => m.payload.nodeName.toLowerCase())
            .map(str => str.replace(/\s/g, "_"))
        };
      }, {})
    }),
    {}
  );
};

const generateStoryArray = (projectName: string, stories: Object): string[] => {
  const generateUtterances = (story, stories) =>
    stories[story].map(utterance => generateUtterance(utterance)).join(EOL);
  const generateUtterance = utterance => `  - utter_${utterance}`;
  return Object.keys(stories).map(
    story =>
      `## ${projectName} | ${story.replace(
        /_/g,
        " "
      )}\n* ${story}\n${generateUtterances(story, stories)}`
  );
};

interface Config {
  projectName: string;
  storyData: {
    intents: Assets.Intent[];
    intentMap: IntentMap;
    messageCollector: Function;
    messages: Assets.Message[];
  };
}

/**
 * Generates markdown from project data
 * @param config Object containing projectName and storyData
 * @returns string
 */
export function genStoriesFromIntents({ projectName, storyData }: Config): string {
  const stories: Object = convertToStories(storyData);
  const storyStrings = generateStoryArray(projectName, stories).join(EOL);
  const timestamp = new Date();
  return `<!-- start | ${timestamp} -->${EOL}${storyStrings}${EOL}<!-- end | ${timestamp} -->${EOL}`;
}
