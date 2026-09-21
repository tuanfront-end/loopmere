import type { Category } from '../types';

import { getAssetPath } from '@/helpers/path';

export const noise: Category = {
  id: 'noise',
  sounds: [
    {
      id: 'white-noise',
      label: 'White Noise',
      src: getAssetPath('/sounds/noise/white-noise.wav'),
    },
    {
      id: 'pink-noise',
      label: 'Pink Noise',
      src: getAssetPath('/sounds/noise/pink-noise.wav'),
    },
    {
      id: 'brown-noise',
      label: 'Brown Noise',
      src: getAssetPath('/sounds/noise/brown-noise.wav'),
    },
  ],
  title: 'Noise',
};
