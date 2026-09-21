export interface Sound {
  id: string;
  label: string;
  src: string;
}

export type Sounds = Array<Sound>;

export interface Category {
  id: string;
  sounds: Sounds;
  title: string;
}

export type Categories = Array<Category>;
