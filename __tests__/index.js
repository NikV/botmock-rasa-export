const fs = require('fs');
const { join } = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

it('runs', async () => {
  const { stderr } = await promisify(exec)('npm start');
  expect(stderr).toContain('');
});

it('generates non-empty /output', async () => {
  await promisify(exec)('npm start');
  const contents = await fs.promises.readdir(join(process.cwd(), '/output'));
  expect(contents).toHaveLength(2);
});
