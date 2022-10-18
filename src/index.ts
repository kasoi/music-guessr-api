import { copyTrack, getContents, getTrack, shuffleArray } from "./utils";
import express from 'express';
import config from "./config";
import { ITrack } from "./music";
import path from "path";
import nocache from 'nocache';
import cors from 'cors';

const folderURI = 'D:\\torrents\\auto';
// const folderURI = 'D:\\music\\fresh\\trip';
let tracks: Array<string> = [];
let currentTrack: ITrack | null = null;
let count = 0;
let ids: Array<number> = [];

const startNextQuiz = async () => {
  count ++;
  count = count % tracks.length;
  const trackId = ids[count];
  const trackUri = tracks[trackId];
  currentTrack = await getTrack(trackUri);
  await copyTrack(trackUri);
  currentTrack.arrayId = count;

  return currentTrack;
};

const startApp = async () => {
  const result = await getContents(folderURI);
  tracks = tracks.concat(result.tracks);
  for (let i = 0; i < tracks.length; i++) {
    ids.push(i);
  }
  shuffleArray(ids);
  startNextQuiz();
}

startApp();

const app = express();

app.use(cors());
app.use(nocache());

app.listen(config.APP_PORT);

app.get('/', (req, res) => {
  res.send('Bob ross');
});

app.get('/privet', (req, res) => {
  console.log('request body:', req.body);
  res.send(`Bolshe ne bob ross. You sent: ${req.body}`);
});

app.get('/current', (req, res) => {
  res.send(JSON.stringify(currentTrack));
});

app.get('/file', (req, res) => {
  // const uri = path.resolve(config.FILE_PATH);
  // res.sendFile(uri);
  if (!currentTrack) {
    res.sendStatus(500).send('Something went wrong');
    return;
  }
  res.sendFile(currentTrack.path);
});

app.get('/next', async (req, res) => {
  await startNextQuiz();
  res.send(JSON.stringify(currentTrack));
});

app.get('/guess', (req, res) => {
  res.send('wrong');
});