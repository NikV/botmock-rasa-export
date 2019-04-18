import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
// import { MODEL_OUTPUT_PATH } from '../constants';

export async function trainDialogModel() {
  // return await promisify(exec)(
  //   `python -m rasa_core.train -d domain.yml -s stories.md -o ${MODEL_OUTPUT_PATH}`
  // );
}
