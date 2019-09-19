import { join } from "path";
import { remove, mkdirp, readFile, readdir } from "fs-extra";
import { default as FileWriter } from "../lib/file";
import * as Assets from "../lib/types";

let projectData: Assets.CollectedResponses;
const outputDir = join(__dirname, "output");

beforeEach(async () => {
  await remove(outputDir);
  await mkdirp(outputDir);
  projectData = {
    project: {
      id: "",
      name: "name",
      type: "",
      platform: "",
      created_at: {
        date: new Date().toLocaleString(),
        timezone_type: 3,
        timezone: ""
      },
      updated_at: {
        date: new Date().toLocaleString(),
        timezone_type: 3,
        timezone: ""
      }
    },
    intents: [],
    entities: [],
    variables: [],
    board: {
      board: {
        root_messages: [], messages: [{
          message_id: "",
          message_type: "",
          next_message_ids: [],
          previous_message_ids: [],
          is_root: false,
          payload: {
            nodeName: "",
            context: [],
            text: "",
            workflow_index: 1
          }
        }]
      },
      slots: {},
      variables: [],
      created_at: {
        date: new Date().toLocaleString(),
        timezone_type: 3,
        timezone: ""
      },
      updated_at: {
        date: new Date().toLocaleString(),
        timezone_type: 3,
        timezone: ""
      }
    }
  }
});

afterAll(async () => {
  await remove(outputDir);
});

test("create yml method creates yml file in output", async () => {
  const OPENING_CHARACTERS = "# generated";
  await new FileWriter({ outputDir, projectData }).createYml();
  expect(
    (await readFile(join(outputDir, "domain.yml"))).toString().startsWith(OPENING_CHARACTERS)
  ).toBe(true);
});

test("create md method creates md files in output", async () => {
  const OPENING_CHARACTERS = "<!--";
  await new FileWriter({ outputDir, projectData }).createMd();
  expect((await readdir(join(outputDir, "data")))).toHaveLength(2);
  expect((await readFile(join(outputDir, "data", "stories.md"))).toString().startsWith(OPENING_CHARACTERS)).toBe(true);
  // expect((await readFile(join(outputDir, "nlu.md"))).toString().startsWith(OPENING_CHARACTERS)).toBe(true);
});
