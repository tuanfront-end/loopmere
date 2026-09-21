import type { Category } from '../types';

import { getAssetPath } from '@/helpers/path';

export const places: Category = {
  id: 'places',
  sounds: [
    {
      id: 'cafe',
      label: 'Cafe',
      src: getAssetPath('/sounds/places/cafe.mp3'),
    },
    {
      id: 'airport',
      label: 'Airport',
      src: getAssetPath('/sounds/places/airport.mp3'),
    },
    {
      id: 'church',
      label: 'Church',
      src: getAssetPath('/sounds/places/church.mp3'),
    },
    {
      id: 'temple',
      label: 'Temple',
      src: getAssetPath('/sounds/places/temple.mp3'),
    },
    {
      id: 'construction-site',
      label: 'Construction Site',
      src: getAssetPath('/sounds/places/construction-site.mp3'),
    },
    {
      id: 'underwater',
      label: 'Underwater',
      src: getAssetPath('/sounds/places/underwater.mp3'),
    },
    {
      id: 'crowded-bar',
      label: 'Crowded Bar',
      src: getAssetPath('/sounds/places/crowded-bar.mp3'),
    },
    {
      id: 'night-village',
      label: 'Night Village',
      src: getAssetPath('/sounds/places/night-village.mp3'),
    },
    {
      id: 'subway-station',
      label: 'Subway Station',
      src: getAssetPath('/sounds/places/subway-station.mp3'),
    },
    {
      id: 'office',
      label: 'Office',
      src: getAssetPath('/sounds/places/office.mp3'),
    },
    {
      id: 'supermarket',
      label: 'Supermarket',
      src: getAssetPath('/sounds/places/supermarket.mp3'),
    },
    {
      id: 'carousel',
      label: 'Carousel',
      src: getAssetPath('/sounds/places/carousel.mp3'),
    },
    {
      id: 'laboratory',
      label: 'Laboratory',
      src: getAssetPath('/sounds/places/laboratory.mp3'),
    },
    {
      id: 'laundry-room',
      label: 'Laundry Room',
      src: getAssetPath('/sounds/places/laundry-room.mp3'),
    },
    {
      id: 'restaurant',
      label: 'Restaurant',
      src: getAssetPath('/sounds/places/restaurant.mp3'),
    },
    {
      id: 'library',
      label: 'Library',
      src: getAssetPath('/sounds/places/library.mp3'),
    },
  ],
  title: 'Places',
};
