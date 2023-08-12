import fs from 'fs';
import Path from 'path';
import Utils, { promisify } from 'util';
import { IFilesDirResult, ITrack } from './music';
import { parseFile } from 'music-metadata';
import config from './config';

const readdirAsync = promisify(fs.readdir);
const copyFileAsync = promisify(fs.copyFile);

export const getContents = async (uri: string): Promise<IFilesDirResult> => {
  const contents = await readdirAsync(uri, { withFileTypes: true });
  const dirs = contents.filter(dirent => dirent.isDirectory()).map(dirent => Path.resolve(uri, dirent.name));
  const tracks = contents.filter(dirent => {
    const extName = Path.extname(dirent.name);
    return dirent.isFile() && (extName.toLowerCase() === '.mp3' || extName.toLocaleLowerCase() === '.flac')
  }).map(dirent => Path.resolve(uri, dirent.name));

  const result = {
    dirs,
    tracks,
  };
  return result;
};

export const getTrack = async (uri: string): Promise<ITrack> => {
  let result: any = {
    format: {},
    common: {},
  };
  try {
    result = await parseFile(uri, {duration: true, skipCovers: true});
  } catch (error) {
    console.log('shit happenz');
  }
  const filename = Path.basename(uri).split(' — ').join(' - ');
  const divided = filename.split(' - ');
  const title = (filename).slice(0, -4);
  // const title = (divided[1] || divided[0]).slice(0, -4);
  
  return {
    duration: result?.format?.duration || 10,
    title: result?.common?.title || title,
    artist: result?.common?.artist || divided[0],
    name: Path.basename(uri),
    path: uri,
  };
};

export const copyTrack = async (uri: string): Promise<void> => {
  await copyFileAsync(uri, config.FILE_PATH);
};

export const shuffleArray = (array: Array<any>) => {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}