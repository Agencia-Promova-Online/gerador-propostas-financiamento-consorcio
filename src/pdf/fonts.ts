import { Font } from '@react-pdf/renderer';
import inter400 from '@fontsource/inter/files/inter-latin-400-normal.woff?url';
import inter600 from '@fontsource/inter/files/inter-latin-600-normal.woff?url';
import inter700 from '@fontsource/inter/files/inter-latin-700-normal.woff?url';
import playfair600 from '@fontsource/playfair-display/files/playfair-display-latin-600-normal.woff?url';
import playfair700 from '@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff?url';

let registered = false;

export function registerPdfFonts(): void {
  if (registered) return;
  Font.register({
    family: 'Inter',
    fonts: [
      { src: inter400, fontWeight: 400 },
      { src: inter600, fontWeight: 600 },
      { src: inter700, fontWeight: 700 },
    ],
  });
  Font.register({
    family: 'Playfair Display',
    fonts: [
      { src: playfair600, fontWeight: 600 },
      { src: playfair700, fontWeight: 700 },
    ],
  });
  registered = true;
}
