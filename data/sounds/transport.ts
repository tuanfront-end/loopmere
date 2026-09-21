import type { Category } from '../types';

import { getAssetPath } from '@/helpers/path';

export const transport: Category = {
  id: 'transport',
  sounds: [
    {
      id: 'train',
      label: 'Train',
      src: getAssetPath('/sounds/transport/train.mp3'),
    },
    {
      id: 'inside-a-train',
      label: 'Inside a Train',
      src: getAssetPath('/sounds/transport/inside-a-train.mp3'),
    },
    {
      id: 'airplane',
      label: 'Airplane',
      src: getAssetPath('/sounds/transport/airplane.mp3'),
    },
    {
      id: 'submarine',
      label: 'Submarine',
      src: getAssetPath('/sounds/transport/submarine.mp3'),
    },
    {
      id: 'sailboat',
      label: 'Sailboat',
      src: getAssetPath('/sounds/transport/sailboat.mp3'),
    },
    {
      id: 'rowing-boat',
      label: 'Rowing Boat',
      src: getAssetPath('/sounds/transport/rowing-boat.mp3'),
    },
  ],
  title: 'Transport',
};
