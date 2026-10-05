export interface Sound {
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
