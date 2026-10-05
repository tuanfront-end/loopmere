export interface Sound {
  /**
   * A single happening — a call, a strike, a pass — rather than a bed. Only
   * these can be set to sound now and then.
   */
  event?: boolean;
  id: string;
  label: string;
  /**
   * The stretch of the file that loops, in seconds, where the whole file
   * would leave a hole at the seam: dead air at its end, or a fade at both.
   */
  loop?: [start: number, end: number];
  src: string;
}

export type Sounds = Array<Sound>;

export interface Category {
  id: string;
  sounds: Sounds;
  title: string;
}

export type Categories = Array<Category>;
