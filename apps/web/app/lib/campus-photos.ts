// Real photos only. Add files to public/campus/ (see the README there), then fill in the credit and licence.
// A slot whose file is missing renders nothing, so the layout never shows a broken image.
export type CampusSlot = 'login' | 'info';

export const CAMPUS_PHOTOS: Record<CampusSlot, { src: string; alt: string; credit: string; licence: string }> = {
  login: {
    src: '/campus/login.jpg',
    alt: 'Andhra University campus, Visakhapatnam',
    credit: '',
    licence: '',
  },
  info: {
    src: '/campus/au-info.jpg',
    alt: 'Andhra University College of Engineering, Visakhapatnam',
    credit: '',
    licence: '',
  },
};
