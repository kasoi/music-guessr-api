import dotenv from 'dotenv';

export interface AppConfig {
  APP_PORT: number,
  FILE_PATH: string,
}

class Config implements AppConfig {
  APP_PORT: number = Number(dotenv.config().parsed?.APP_PORT) || 9000;
  FILE_PATH: string = 'resources/file.mp3';
}

const config = new Config();

export default config;