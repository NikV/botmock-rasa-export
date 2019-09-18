import { join } from "path";
import { remove, mkdirp } from "fs-extra";
import { default as FileWriter } from "../lib/file";

const outputDir = join(__dirname, "output");

beforeEach(async () => {
  await remove(outputDir);
  await mkdirp(outputDir);
});

afterAll(async () => {
  await remove(outputDir);
});

test.todo("create yml method creates yml file in output");
test.todo("create md method creates md file in output");
