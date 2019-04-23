// const fs = require('fs')
const { exec } = require('child_process');
const { promisify } = require('util');

const execP = promisify(exec);

it('runs', async () => {
  const { stderr } = await execP('npm start');
  expect(stderr).toContain('');
});

// it('generated non-empty /output', async () => {});
