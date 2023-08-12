import { copyTrack, getContents, getTrack, shuffleArray } from "./utils";
import express from 'express';
import config from "./config";
import { ITrack } from "./music";
import nocache from 'nocache';
import cors from 'cors';

const folderURI = `D:\\torrents\\hits90`;
let tracks: Array<string> = [];
let currentTrack: ITrack | null = null;
let count = 0;
let ids: Array<number> = [];

const startNextQuiz = async () => {
  if (count < 0) count = Math.abs(tracks.length - Math.abs(count));
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

app.get('/current', (req, res) => {
  res.send(JSON.stringify(currentTrack));
});

app.get('/file', (req, res) => {
  // const uri = path.resolve(config.FILE_PATH);
  // res.sendFile(uri);
  if (!currentTrack) {
    res.sendStatus(500).send('Something went wrong');
  } else res.sendFile(currentTrack.path);
});

app.get('/next', async (req, res) => {
  await startNextQuiz();
  res.send(JSON.stringify(currentTrack));
});

app.get('/goto/:id', async (req, res) => {
  const { id } = req?.params || {};
  const idNum = parseInt(id);
  const isNumber = !isNaN(idNum);
  if (!isNumber) {
    res.status(401).send({
      error: 'no id set or id is not a number',
    });
  }
  
  count = idNum - 1;
  await startNextQuiz();
  res.status(200).send(JSON.stringify(currentTrack));
});

app.get('/prev', async (req, res) => {
  count -= 2;
  await startNextQuiz();
  res.status(200).send(JSON.stringify(currentTrack));
});

app.get('/guess', (req, res) => {
  res.send('wrong');
});