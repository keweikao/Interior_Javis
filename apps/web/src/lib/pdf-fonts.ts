import { Font } from '@react-pdf/renderer';

const NOTO_SANS_TC_BASE =
  'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-tc@latest/chinese-traditional';

Font.register({
  family: 'Noto Sans TC',
  fonts: [
    { src: `${NOTO_SANS_TC_BASE}-400-normal.woff2`, fontWeight: 400 },
    { src: `${NOTO_SANS_TC_BASE}-700-normal.woff2`, fontWeight: 700 },
  ],
});

export const PDF_FONT_FAMILY = 'Noto Sans TC';
