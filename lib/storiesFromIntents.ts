import { EOL } from "os";
import { IntentMap } from "./file"
import * as Assets from "./types";

interface IntentObj {
  intentMap: IntentMap;
  messageCollector: Function;
  readonly intents: Assets.Intent[];
  readonly messages: Assets.Message[];
}

type Stories = { [intent: string]: string[] };

/**
 * Creates object associating intent names with the titles of blocks that flow from them
 * @param intentObj Intent object that describes relation between messages and intents
 * @returns Stories
 */
export function convertIntentStructureToStories(intentObj: IntentObj): Stories {
  const { messages, intents, intentMap, messageCollector } = intentObj;
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
}

const generateStoryArray = (projectName: string, stories: Stories): string[] => {
  const generateUtterance = (utterance: string): string => `  - utter_${utterance}`;
  const generateUtterances = (story, stories): string[] => (
    stories[story].map((utterance, i: number) => {
      return generateUtterance(utterance);
    }).join(EOL)
  );
  return Object.keys(stories).map(
    (story: string, i: number) => (
      `${i !== 0 ? EOL : ""}## ${projectName} | ${story.replace(
        /_/g,
        " "
      )}${EOL}* ${story}${EOL}${generateUtterances(story, stories)}`
    )
  );
};

interface Config {
  readonly projectName: string;
  readonly storyData: {
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
  const stories: Stories = convertIntentStructureToStories(storyData);
  const storyStrings = generateStoryArray(projectName, stories).join(EOL);
  const timestamp = new Date();
  return `<!-- start | ${timestamp} -->${EOL}${storyStrings}${EOL}<!-- end | ${timestamp} -->${EOL}`;
}
