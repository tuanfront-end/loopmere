export interface Sound {
  /**
   * A single happening — a call, a strike, a pass — rather than a bed. Only
   * these can be set to sound now and then.
   */
  event?: boolean;
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
