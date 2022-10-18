export interface IFilesDirResult {
  tracks: Array<string>,
  dirs: Array<string>,
}

export interface ITrack {
  name: string,
  duration: number,
  artist: string,
  title: string,
  path: string,
  arrayId?: number,
};