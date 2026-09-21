import type { Category } from '../types';

import { getAssetPath } from '@/helpers/path';

export const nature: Category = {
  id: 'nature',
  sounds: [
    {
      id: 'river',
      label: 'River',
      src: getAssetPath('/sounds/nature/river.mp3'),
    },
    {
      id: 'waves',
      label: 'Waves',
      src: getAssetPath('/sounds/nature/waves.mp3'),
    },
    {
      id: 'campfire',
      label: 'Campfire',
      src: getAssetPath('/sounds/nature/campfire.mp3'),
    },
    {
      id: 'wind',
      label: 'Wind',
      src: getAssetPath('/sounds/nature/wind.mp3'),
    },
    {
      id: 'howling-wind',
      label: 'Howling Wind',
      src: getAssetPath('/sounds/nature/howling-wind.mp3'),
    },
    {
      id: 'wind-in-trees',
      label: 'Wind in Trees',
      src: getAssetPath('/sounds/nature/wind-in-trees.mp3'),
    },
    {
      id: 'waterfall',
      label: 'Waterfall',
      src: getAssetPath('/sounds/nature/waterfall.mp3'),
    },
    {
      id: 'walk-in-snow',
      label: 'Walk in Snow',
      src: getAssetPath('/sounds/nature/walk-in-snow.mp3'),
    },
    {
      id: 'walk-on-leaves',
      label: 'Walk on Leaves',
      src: getAssetPath('/sounds/nature/walk-on-leaves.mp3'),
    },
    {
      id: 'walk-on-gravel',
      label: 'Walk on Gravel',
      src: getAssetPath('/sounds/nature/walk-on-gravel.mp3'),
    },
    {
      id: 'droplets',
      label: 'Droplets',
      src: getAssetPath('/sounds/nature/droplets.mp3'),
    },
    {
      id: 'jungle',
      label: 'Jungle',
      src: getAssetPath('/sounds/nature/jungle.mp3'),
    },
  ],
  title: 'Nature',
};
