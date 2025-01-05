import path from 'path';
import url from 'url';

export const DIRNAME = path.dirname(url.fileURLToPath(import.meta.url));
