import { join } from "path";
import { remove, mkdirp } from "fs-extra";

const outputDir = join(__dirname, "output");

beforeEach(async () => {
  await remove(outputDir);
  await mkdirp(outputDir);
});

afterAll(async () => {
  await remove(outputDir);
});

test.todo("");
