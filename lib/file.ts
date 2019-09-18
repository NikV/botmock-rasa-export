import * as utils from "@botmock-api/utils";
import { writeFile } from "fs-extra";
import { stringify as toYAML } from "yaml";
import { EventEmitter } from "events";
import { join } from "path";
// import { EOL } from "os";
import * as Assets from "./types";
// import { genIntents } from "./nlu";
// import { genStoriesFromIntents } from "./storiesFromIntents";

type Templates = { [key: string]: any };
type IntentMap = Map<string, string[]>;
type Message = any;

interface Config {
  outputDir: string;
  projectData: Assets.CollectedResponses
}

export default class FileWriter extends EventEmitter {
  private init: string;
  private outputDir: string;
  private intentMap: IntentMap;
  private nodeCollector: Function;
  private projectData: Assets.CollectedResponses;
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
    this.intentMap = utils.createIntentMap(this.projectData.board.board.messages);
    this.nodeCollector = utils.createNodeCollector(this.intentMap, this.getMessage);
  }
  /**
   * Gets message within the board from its id
   * @param id unique id of the message
   * @returns Message
   */
  private getMessage(id: string): Message {
    return this.projectData.board.board.messages.find(message => message.message_id === id);
  }
  /**
   * Creates yml-consumable object from intent map
   * @returns Templates
   */
  private createTemplates(): Templates {
    return Array.from(this.intentMap).reduce(
      (acc, [messageId, intentIds]) => {
        const message = this.getMessage(messageId);
        const collectedMessages = this.nodeCollector(message.next_message_ids).map(this.getMessage);
        // Grab this message's response name; if this name has been seen already, append its id to it
        let { nodeName } = message.payload;
        nodeName = nodeName.replace(/\s/g, '_').toLowerCase();
        if (Object.keys(acc).includes(nodeName)) {
          nodeName = `${nodeName}-${messageId}`;
        }
        // Map messages to those appropriate for Rasa yaml; i.e. group certain types to carry the same payload
        return {
          ...acc,
          [nodeName]: [message, ...collectedMessages].reduce((acc_, m: Message) => {
            let type, payload: any;
            switch (m.message_type) {
              case 'image':
                type = 'image';
                payload = m.payload.image_url;
                break;
              // case 'generic':
              // case 'list':
              case 'button':
              case 'quick_replies':
                type = 'buttons';
                payload = (m.payload[m.message_type] || []).map(
                  ({ title, payload }) => ({
                    title,
                    payload
                  })
                );
                break;
            }
            return {
              ...acc_,
              [type || m.message_type]:
                payload ||
                `${
                m.payload[m.message_type]
                  ? m.payload[m.message_type].replace(/\n/g, '\\n')
                  : m.payload[m.message_type]
                }`
            };
          }, {})
        };
      },
      {}
    )
  }
  /**
   * Writes yml file within outputDir
   * @returns Promise<void>
   */
  public async createYml(): Promise<void> {
    const outputFilePath = join(this.outputDir, "domain.yml");
    const templates = this.createTemplates();
    return writeFile(
      outputFilePath,
      `# generated ${this.init}
${toYAML({
        intents: this.projectData.intents.map(intent => intent.name),
        entities: this.projectData.entities.map(entity => entity.name),
        actions: Object.keys(templates),
        templates
      })}`
    )
  }
  /**
   * Writes yml file within outputDir
   * @returns Promise<void>
   */
  public async createMd(): Promise<void> {}
}
