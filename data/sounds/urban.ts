import type { Category } from '../types';

import { getAssetPath } from '@/helpers/path';

export const urban: Category = {
  id: 'urban',
  sounds: [
    {
      id: 'highway',
      label: 'Highway',
      src: getAssetPath('/sounds/urban/highway.mp3'),
    },
    {
      id: 'road',
      label: 'Road',
      src: getAssetPath('/sounds/urban/road.mp3'),
    },
    {
      id: 'ambulance-siren',
      label: 'Ambulance Siren',
      src: getAssetPath('/sounds/urban/ambulance-siren.mp3'),
    },
    {
      id: 'busy-street',
      label: 'Busy Street',
      src: getAssetPath('/sounds/urban/busy-street.mp3'),
    },
    {
      id: 'crowd',
      label: 'Crowd',
      src: getAssetPath('/sounds/urban/crowd.mp3'),
    },
    {
      id: 'traffic',
      label: 'Traffic',
      src: getAssetPath('/sounds/urban/traffic.mp3'),
    },
    {
      id: 'fireworks',
      label: 'Fireworks',
      src: getAssetPath('/sounds/urban/fireworks.mp3'),
    },
  ],
  title: 'Urban',
};
