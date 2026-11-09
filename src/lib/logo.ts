export const LOGO_MAX_BYTES = 2 * 1024 * 1024;
export const LOGO_ACCEPT = 'image/png,image/jpeg,image/svg+xml';
const LOGO_MAX_DIMENSION = 800;
const LOGO_MIN_WIDTH_WARNING = 400;

export interface LogoResult {
  dataUrl: string;
  lowResolution: boolean;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Não foi possível ler esta imagem.'));
    image.src = src;
  });
}

export async function processLogoFile(file: File): Promise<LogoResult> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error('Use um arquivo PNG, JPG ou SVG.');
  }
  if (file.size > LOGO_MAX_BYTES) {
    throw new Error('O logotipo deve ter no máximo 2 MB.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const naturalWidth = image.naturalWidth || LOGO_MAX_DIMENSION;
    const naturalHeight = image.naturalHeight || LOGO_MAX_DIMENSION;
    const scale = Math.min(1, LOGO_MAX_DIMENSION / Math.max(naturalWidth, naturalHeight));

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(naturalWidth * scale);
    canvas.height = Math.round(naturalHeight * scale);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Não foi possível processar o logotipo.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return {
      dataUrl: canvas.toDataURL('image/png'),
      lowResolution: naturalWidth < LOGO_MIN_WIDTH_WARNING,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
