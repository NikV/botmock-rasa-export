const fs = require('fs');
const { join } = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const OUTPUT_PATH = join(process.cwd(), 'output');

describe('initialization', () => {
  test('writes to stdout', async () => {
    const { stdout, stderr } = await promisify(exec)('npm start');
    expect(stderr).toBeFalsy();
    expect(stdout).toBeTruthy();
  });
});

describe.skip('generation', () => {
  beforeEach(async () => {
    try {
      await fs.promises.access(OUTPUT_PATH, fs.constants.R_OK);
    } catch (_) {
      fs.mkdirSync(OUTPUT_PATH);
    }
  });
  test('generates non-empty output directory', async () => {
    await promisify(exec)('npm start');
    const contents = await fs.promises.readdir(join(process.cwd(), '/output'));
    expect(contents).toHaveLength(3);
  });
});
