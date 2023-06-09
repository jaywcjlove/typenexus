import path from 'path';
import fs from 'fs';
import { __dirname, __filename } from './utils.js';

export async function getEntity(entityPath: string = '../entity') {
  const dirPath = path.resolve(__dirname, entityPath);
  const dirArr = (await fs.promises.readdir(dirPath)).filter((fileName) => !/(.js.map|.d.ts)$/.test(fileName));
  const arr: string[] = [];
  dirArr.forEach((fileName) => {
    const ePath = path.resolve(dirPath, fileName).replace(/\.(js|ts)$/, '');
    const handle = require(ePath);
    Object.keys(handle).forEach((funName) => {
      arr.push(handle[funName]);
    });
  });
  return arr;
}
