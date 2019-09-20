import * as utils from "@botmock-api/utils";
import { writeFile, mkdirp } from "fs-extra";
import { stringify as toYAML } from "yaml";
import { EventEmitter } from "events";
import { join } from "path";
import { EOL } from "os";
import * as Assets from "./types";
import { genIntents } from "./nlu";
import {
  genStoriesFromIntents,
  convertIntentStructureToStories
} from "./storiesFromIntents";

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
  readonly outputDir: string;
  readonly projectData: Assets.CollectedResponses
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
   * Gets the unique action names for the template
   * @returns string[]
   */
  private getUniqueActionNames(): string[] {
    const storyData = {
      intents: this.projectData.intents,
      intentMap: this.intentMap,
      messageCollector: this.messageCollector,
      messages: this.projectData.board.board.messages
    };
    return Object.keys(
      Object.values(convertIntentStructureToStories(storyData))
        .reduce((acc, values: string[]) => {
          return {
            ...acc,
            ...values.reduce((accu, value) => ({
              ...accu,
              [value]: {}
            }), {})
          }
        }, {}))
      .map(action => `utter_${action}`);
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
        const templateName = message.payload.nodeName.toLowerCase().replace(/\s/g, "_");
        return {
          ...acc,
          [`utter_${templateName}`]: [message, ...collectedMessages].reduce((accu, message: Message) => {
            let type: string;
            let payload: any;
            switch (message.message_type) {
              case "jump":
                const { label } = JSON.parse(message.payload.selectedResult)
                type = "text";
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
    return await writeFile(
      outputFilePath,
      `# generated ${this.init}
${toYAML({
        intents: this.projectData.intents.map(intent => intent.name),
        entities: this.projectData.entities.map(entity => entity.name),
        actions: this.getUniqueActionNames(),
        templates: this.createTemplates()
      })}`
    );
  }
/**
 * Write intent markdown file
 * @returns Promise<void>
 */
  private async writeIntentFile(): Promise<void> {
    const { intents, entities } = this.projectData;
    const outputFilePath = join(this.outputDir, "data", "nlu.md");
    await mkdirp(join(this.outputDir, "data"));
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
    const outputFilePath = join(this.outputDir, "data", "stories.md");
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
