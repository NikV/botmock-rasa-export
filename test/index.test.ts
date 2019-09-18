import { join } from "path";
import { remove, mkdirp, readFile } from "fs-extra";
import { default as FileWriter } from "../lib/file";
import * as Assets from "../lib/types";

let projectData: void | Assets.Project;
const outputDir = join(__dirname, "output");

beforeEach(async () => {
  // projectData = {};
  await remove(outputDir);
  await mkdirp(outputDir);
});

afterAll(async () => {
  await remove(outputDir);
});

test("create yml method creates yml file in output", async () => {
  // await new FileWriter({ outputDir, projectData }).createYml();
  // expect((await readFile(join(outputDir, "domain.yml"))).toString()).toBe("");
});

test.todo("create md method creates md file in output");
