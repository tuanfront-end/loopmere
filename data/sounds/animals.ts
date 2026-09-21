import type { Category } from '../types';

import { getAssetPath } from '@/helpers/path';

export const animals: Category = {
  id: 'animals',
  sounds: [
    {
      id: 'birds',
      label: 'Birds',
      src: getAssetPath('/sounds/animals/birds.mp3'),
    },
    {
      id: 'seagulls',
      label: 'Seagulls',
      src: getAssetPath('/sounds/animals/seagulls.mp3'),
    },
    {
      id: 'crickets',
      label: 'Crickets',
      src: getAssetPath('/sounds/animals/crickets.mp3'),
    },
    {
      id: 'wolf',
      label: 'Wolf',
      src: getAssetPath('/sounds/animals/wolf.mp3'),
    },
    {
      id: 'owl',
      label: 'Owl',
      src: getAssetPath('/sounds/animals/owl.mp3'),
    },
    {
      id: 'frog',
      label: 'Frog',
      src: getAssetPath('/sounds/animals/frog.mp3'),
    },
    {
      id: 'dog-barking',
      label: 'Dog Barking',
      src: getAssetPath('/sounds/animals/dog-barking.mp3'),
    },
    {
      id: 'horse-gallop',
      label: 'Horse Gallop',
      src: getAssetPath('/sounds/animals/horse-gallop.mp3'),
    },
    {
      id: 'cat-purring',
      label: 'Cat Purring',
      src: getAssetPath('/sounds/animals/cat-purring.mp3'),
    },
    {
      id: 'crows',
      label: 'Crows',
      src: getAssetPath('/sounds/animals/crows.mp3'),
    },
    {
      id: 'whale',
      label: 'Whale',
      src: getAssetPath('/sounds/animals/whale.mp3'),
    },
    {
      id: 'beehive',
      label: 'Beehive',
      src: getAssetPath('/sounds/animals/beehive.mp3'),
    },
    {
      id: 'woodpecker',
      label: 'Woodpecker',
      src: getAssetPath('/sounds/animals/woodpecker.mp3'),
    },
    {
      id: 'chickens',
      label: 'Chickens',
      src: getAssetPath('/sounds/animals/chickens.mp3'),
    },
    {
      id: 'cows',
      label: 'Cows',
      src: getAssetPath('/sounds/animals/cows.mp3'),
    },
    {
      id: 'sheep',
      label: 'Sheep',
      src: getAssetPath('/sounds/animals/sheep.mp3'),
    },
  ],
  title: 'Animals',
};
