import { favicons } from 'favicons';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const source = join(__dirname, '../public/assets/6oclock.svg');
const destination = join(__dirname, '../public/favicon');
const htmlFile = join(__dirname, '../index.html');
const packageFile = join(__dirname, '../package.json');

async function generateFavicons() {
  const packageJson = JSON.parse(await fs.readFile(packageFile, 'utf8'));

  const configuration = {
    path: '/favicon/',
    appName: packageJson.name,
    appShortName: packageJson.name,
    appDescription: packageJson.description,
    developerName: null,
    developerURL: null,
    dir: 'auto',
    lang: 'en-US',
    background: '#020f23',
    theme_color: '#e8c446',
    appleStatusBarStyle: 'black-translucent',
    display: 'standalone',
    orientation: 'any',
    scope: '/',
    start_url: '/',
    version: packageJson.version,
    logging: false,
    pixel_art: false,
    loadManifestWithCredentials: false,
    manifestMaskable: false,
    icons: {
      android: true,
      appleIcon: true,
      appleStartup: false,
      coast: false,
      favicons: true,
      firefox: false,
      windows: true,
      yandex: false,
    },
  };

  await fs.rm(destination, { recursive: true, force: true });
  await fs.mkdir(destination, { recursive: true });

  const response = await favicons(source, configuration);

  await Promise.all(
    response.images.map(async (image) => {
      await fs.writeFile(join(destination, image.name), image.contents);
    }),
  );

  await Promise.all(
    response.files.map(async (file) => {
      const fileName =
        file.name === 'manifest.webmanifest' ? 'site.webmanifest' : file.name;
      await fs.writeFile(join(destination, fileName), file.contents);
    }),
  );

  const htmlContent = await fs.readFile(htmlFile, 'utf8');
  const startMarker = '<!-- favicon:start -->';
  const endMarker = '<!-- favicon:end -->';

  const startIndex = htmlContent.indexOf(startMarker);
  const endIndex = htmlContent.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Favicon markers not found in HTML file');
  }

  const htmlTags = response.html.map((tag) =>
    tag.replace('/favicon/manifest.webmanifest', '/favicon/site.webmanifest'),
  );

  const beforeMarker = htmlContent.slice(0, startIndex + startMarker.length);
  const afterMarker = htmlContent.slice(endIndex);
  const newHtmlContent =
    beforeMarker + '\n    ' + htmlTags.join('\n    ') + '\n    ' + afterMarker;

  await fs.writeFile(htmlFile, newHtmlContent);
}

generateFavicons().catch((error) => {
  console.error('Favicon generation failed:', error.message);
  process.exit(1);
});
