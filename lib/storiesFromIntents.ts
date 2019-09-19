import { EOL } from "os";
import { IntentMap } from "./file"
import * as Assets from "./types";

interface ConversionConfig {
  intentMap: IntentMap;
  intents: Assets.Intent[];
  messageCollector: Function;
  messages: Assets.Message[];
}

type Stories = { [intent: string]: string[] };

const convertToStories = ({ intentMap, intents, messageCollector, messages }: ConversionConfig): Stories => {
  const getMessage = (id: string): Assets.Message | void => (
    messages.find(message => message.message_id === id)
  );
  return Array.from(intentMap).reduce(
    (acc, [messageId, intentIds]) => ({
      ...acc,
      ...intentIds.reduce((accu, id: string) => {
        const message: Assets.Message = getMessage(messageId);
        const intent: Assets.Intent = intents.find(intent => intent.id === id);
        if (typeof intent !== "undefined") {
          return {
            [intent.name]: [
              message,
              ...messageCollector(message.next_message_ids).map(getMessage)
            ]
              .map(message => message.payload.nodeName.toLowerCase())
              .map(str => str.replace(/\s/g, "_"))
          };
        } else {
          return accu;
        }
      }, {})
    }),
    {}
  );
};

const generateStoryArray = (projectName: string, stories: Stories): string[] => {
  const generateUtterances = (story, stories) =>
    stories[story].map(utterance => generateUtterance(utterance)).join(EOL);
  const generateUtterance = utterance => `  - utter_${utterance}`;
  return Object.keys(stories).map(
    story =>
      `## ${projectName} | ${story.replace(
        /_/g,
        " "
      )}${EOL}* ${story}${EOL}${generateUtterances(story, stories)}`
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
  const stories: Stories = convertToStories(storyData);
  const storyStrings = generateStoryArray(projectName, stories).join(EOL);
  const timestamp = new Date();
  return `<!-- start | ${timestamp} -->${EOL}${storyStrings}${EOL}<!-- end | ${timestamp} -->${EOL}`;
}
