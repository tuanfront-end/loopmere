import type { Category } from '../types';

import { getAssetPath } from '@/helpers/path';

export const binaural: Category = {
  id: 'binaural',
  sounds: [
    {
      id: 'binaural-delta',
      label: 'Delta',
      src: getAssetPath('/sounds/binaural/binaural-delta.wav'),
    },
    {
      id: 'binaural-theta',
      label: 'Theta',
      src: getAssetPath('/sounds/binaural/binaural-theta.wav'),
    },
    {
      id: 'binaural-alpha',
      label: 'Alpha',
      src: getAssetPath('/sounds/binaural/binaural-alpha.wav'),
    },
    {
      id: 'binaural-beta',
      label: 'Beta',
      src: getAssetPath('/sounds/binaural/binaural-beta.wav'),
    },
    {
      id: 'binaural-gamma',
      label: 'Gamma',
      src: getAssetPath('/sounds/binaural/binaural-gamma.wav'),
    },
  ],
  title: 'Binaural Beats',
};
