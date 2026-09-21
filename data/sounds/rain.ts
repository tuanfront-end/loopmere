import type { Category } from '../types';

import { getAssetPath } from '@/helpers/path';

export const rain: Category = {
  id: 'rain',
  sounds: [
    {
      id: 'light-rain',
      label: 'Light Rain',
      src: getAssetPath('/sounds/rain/light-rain.mp3'),
    },
    {
      id: 'heavy-rain',
      label: 'Heavy Rain',
      src: getAssetPath('/sounds/rain/heavy-rain.mp3'),
    },
    {
      id: 'thunder',
      label: 'Thunder',
      src: getAssetPath('/sounds/rain/thunder.mp3'),
    },
    {
      id: 'rain-on-window',
      label: 'Rain on Window',
      src: getAssetPath('/sounds/rain/rain-on-window.mp3'),
    },
    {
      id: 'rain-on-car-roof',
      label: 'Rain on Car Roof',
      src: getAssetPath('/sounds/rain/rain-on-car-roof.mp3'),
    },
    {
      id: 'rain-on-umbrella',
      label: 'Rain on Umbrella',
      src: getAssetPath('/sounds/rain/rain-on-umbrella.mp3'),
    },
    {
      id: 'rain-on-tent',
      label: 'Rain on Tent',
      src: getAssetPath('/sounds/rain/rain-on-tent.mp3'),
    },
    {
      id: 'rain-on-leaves',
      label: 'Rain on Leaves',
      src: getAssetPath('/sounds/rain/rain-on-leaves.mp3'),
    },
  ],
  title: 'Rain',
};
