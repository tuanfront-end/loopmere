import type { Category } from '../types';

import { getAssetPath } from '@/helpers/path';

export const things: Category = {
  id: 'things',
  sounds: [
    {
      id: 'keyboard',
      label: 'Keyboard',
      src: getAssetPath('/sounds/things/keyboard.mp3'),
    },
    {
      id: 'typewriter',
      label: 'Typewriter',
      src: getAssetPath('/sounds/things/typewriter.mp3'),
    },
    {
      id: 'paper',
      label: 'Paper',
      src: getAssetPath('/sounds/things/paper.mp3'),
    },
    {
      id: 'clock',
      label: 'Clock',
      src: getAssetPath('/sounds/things/clock.mp3'),
    },
    {
      id: 'wind-chimes',
      label: 'Wind Chimes',
      src: getAssetPath('/sounds/things/wind-chimes.mp3'),
    },
    {
      id: 'singing-bowl',
      label: 'Singing Bowl',
      src: getAssetPath('/sounds/things/singing-bowl.mp3'),
    },
    {
      id: 'ceiling-fan',
      label: 'Ceiling Fan',
      src: getAssetPath('/sounds/things/ceiling-fan.mp3'),
    },
    {
      id: 'dryer',
      label: 'Dryer',
      src: getAssetPath('/sounds/things/dryer.mp3'),
    },
    {
      id: 'slide-projector',
      label: 'Slide Projector',
      src: getAssetPath('/sounds/things/slide-projector.mp3'),
    },
    {
      id: 'boiling-water',
      label: 'Boiling Water',
      src: getAssetPath('/sounds/things/boiling-water.mp3'),
    },
    {
      id: 'bubbles',
      label: 'Bubbles',
      src: getAssetPath('/sounds/things/bubbles.mp3'),
    },
    {
      id: 'tuning-radio',
      label: 'Tuning Radio',
      src: getAssetPath('/sounds/things/tuning-radio.mp3'),
    },
    {
      id: 'morse-code',
      label: 'Morse Code',
      src: getAssetPath('/sounds/things/morse-code.mp3'),
    },
    {
      id: 'washing-machine',
      label: 'Washing Machine',
      src: getAssetPath('/sounds/things/washing-machine.mp3'),
    },
    {
      id: 'vinyl-effect',
      label: 'Vinyl Effect',
      src: getAssetPath('/sounds/things/vinyl-effect.mp3'),
    },
    {
      id: 'windshield-wipers',
      label: 'Windshield Wipers',
      src: getAssetPath('/sounds/things/windshield-wipers.mp3'),
    },
  ],
  title: 'Things',
};
