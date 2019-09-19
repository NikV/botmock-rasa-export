import * as utils from "@botmock-api/utils";
import { writeFile } from "fs-extra";
import { stringify as toYAML } from "yaml";
import { EventEmitter } from "events";
import { join } from "path";
import { EOL } from "os";
import * as Assets from "./types";
import { genIntents } from "./nlu";
import { genStoriesFromIntents } from "./storiesFromIntents";

export type IntentMap = Map<string, string[]>;
type Templates = { [key: string]: any };
type Message = Partial<{
  message_type: string;
  payload: {
    selectedResult: any;
    image_url: string;
  };
}>;

interface Config {
  outputDir: string;
  projectData: Assets.CollectedResponses
}

export default class FileWriter extends EventEmitter {
  private outputDir: string;
  private projectData: Assets.CollectedResponses;
  private intentMap: IntentMap;
  private messageCollector: Function;
  private getMessage: Function;
  private init: string;
  /**
   * Creates instance of FileWriter
   * @param config configuration object containing an outputDir to hold generated
   * files, and projectData for the original botmock flow project
   */
  constructor(config: Config) {
    super();
    this.init = new Date().toLocaleString();
    this.outputDir = config.outputDir;
    this.projectData = config.projectData;
    this.getMessage = (id: string): Message => (
      this.projectData.board.board.messages.find(message => message.message_id === id)
    );
    this.intentMap = utils.createIntentMap(this.projectData.board.board.messages, this.projectData.intents);
    this.messageCollector = utils.createMessageCollector(this.intentMap, this.getMessage);
  }
  /**
   * Creates yml-consumable object from intent map
   * @returns Templates
   */
  private createTemplates(): Templates {
    return Array.from(this.intentMap).reduce(
      (acc, [messageId]) => {
        const message = this.getMessage(messageId);
        const collectedMessages = this.messageCollector(message.next_message_ids).map(this.getMessage);
        // Grab this message's response name; if this name has been seen already, append its id to it
        let { nodeName } = message.payload;
        nodeName = nodeName.replace(/\s/g, "_").toLowerCase();
        if (Object.keys(acc).includes(nodeName)) {
          nodeName = `${nodeName}-${messageId}`;
        }
        // Map messages to those appropriate for Rasa yaml; i.e. group certain types to carry the same payload
        return {
          ...acc,
          [nodeName]: [message, ...collectedMessages].reduce((accu, message: Message) => {
            let type: string;
            let payload: any;
            switch (message.message_type) {
              case "jump":
                const { label } = JSON.parse(message.payload.selectedResult)
                type = "jump";
                payload = `jumped to ${label}`;
                break;
              case "image":
                type = "image";
                payload = message.payload.image_url;
                break;
              // case "generic":
              // case "list":
              case "button":
              case "quick_replies":
                type = "buttons";
                payload = (message.payload[message.message_type] || []).map(({ title, payload }) => ({
                  title,
                  payload
                }));
                break;
            }
            let value = payload ||
                `${message.payload[message.message_type]
                  ? message.payload[message.message_type].replace(/\n/g, EOL)
                  : message.payload[message.message_type]
                }`;
            if (typeof value === "string") {
              value = utils.symmetricWrap(value, { l: "{", r: "}" });
            }
            return {
              ...accu,
              [type || message.message_type]: value
            };
          }, {})
        };
      },
      {}
    );
  }
  /**
   * Writes yml file within outputDir
   * @returns Promise<void>
   */
  public async createYml(): Promise<void> {
    const outputFilePath = join(this.outputDir, "domain.yml");
    const templates = this.createTemplates();
    return await writeFile(
      outputFilePath,
      `# generated ${this.init}
${toYAML({
        intents: this.projectData.intents.map(intent => intent.name),
        entities: this.projectData.entities.map(entity => entity.name),
        actions: Object.keys(templates),
        templates
      })}`
    );
  }
/**
 * Write intent markdown file
 * @returns Promise<void>
 */
  private async writeIntentFile(): Promise<void> {
    const { intents, entities } = this.projectData;
    const outputFilePath = join(this.outputDir, "nlu.md");
    await writeFile(
      outputFilePath,
      genIntents({ intents, entities })
    );
  }
  /**
   * Write stories markdown file
   * @returns Promise<void>
   */
  private async writeStoriesFile(): Promise<void> {
    const { project: { name: projectName }, board, intents } = this.projectData;
    const outputFilePath = join(this.outputDir, "stories.md");
    const storyData = {
      intents,
      intentMap: this.intentMap,
      messageCollector: this.messageCollector,
      messages: board.board.messages
    };
    await writeFile(
      outputFilePath,
      genStoriesFromIntents({ projectName, storyData })
    )
  }
  /**
   * Writes markdown files within outputDir
   * @returns Promise<void>
   */
  public async createMd(): Promise<void> {
    await this.writeIntentFile();
    await this.writeStoriesFile();
  }
}
