import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Read products JSON
const products = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'products.json'), 'utf-8'));

// Collect all download tasks
const downloads = [];
for (const product of products) {
  for (const image of product.images) {
    if (!image.original_url) continue;
    const localPath = path.join(ROOT, 'public', image.src);
    downloads.push({
      url: image.original_url,
      dest: localPath,
      productName: product.name,
    });
  }
}

console.log(`Total images to download: ${downloads.length}`);

// Download with concurrency limit
const CONCURRENCY = 5;
const RETRIES = 3;
let completed = 0;
let failed = 0;
let skipped = 0;

function downloadFile(url, dest, retries = RETRIES) {
  return new Promise((resolve) => {
    // Skip if already exists
    if (fs.existsSync(dest)) {
      const stat = fs.statSync(dest);
      if (stat.size > 0) {
        skipped++;
        resolve(true);
        return;
      }
    }

    // Ensure directory exists
    fs.mkdirSync(path.dirname(dest), { recursive: true });

    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, { timeout: 30000 }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadFile(response.headers.location, dest, retries).then(resolve);
        return;
      }

      if (response.statusCode !== 200) {
        if (retries > 0) {
          setTimeout(() => downloadFile(url, dest, retries - 1).then(resolve), 1000);
        } else {
          console.error(`  FAILED (${response.statusCode}): ${url}`);
          failed++;
          resolve(false);
        }
        return;
      }

      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        completed++;
        if ((completed + failed + skipped) % 20 === 0) {
          console.log(`  Progress: ${completed} downloaded, ${skipped} skipped, ${failed} failed / ${downloads.length} total`);
        }
        resolve(true);
      });
      file.on('error', (err) => {
        fs.unlink(dest, () => {});
        if (retries > 0) {
          setTimeout(() => downloadFile(url, dest, retries - 1).then(resolve), 1000);
        } else {
          console.error(`  WRITE ERROR: ${dest} - ${err.message}`);
          failed++;
          resolve(false);
        }
      });
    });

    request.on('error', (err) => {
      if (retries > 0) {
        setTimeout(() => downloadFile(url, dest, retries - 1).then(resolve), 1000);
      } else {
        console.error(`  NET ERROR: ${url} - ${err.message}`);
        failed++;
        resolve(false);
      }
    });

    request.on('timeout', () => {
      request.destroy();
      if (retries > 0) {
        setTimeout(() => downloadFile(url, dest, retries - 1).then(resolve), 1000);
      } else {
        console.error(`  TIMEOUT: ${url}`);
        failed++;
        resolve(false);
      }
    });
  });
}

async function processQueue(queue, concurrency) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < queue.length) {
      const current = index++;
      const item = queue[current];
      await downloadFile(item.url, item.dest);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

console.log('Starting image downloads...');
const startTime = Date.now();

await processQueue(downloads, CONCURRENCY);

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\n--- Download Complete ---`);
console.log(`Downloaded: ${completed}`);
console.log(`Skipped (already exists): ${skipped}`);
console.log(`Failed: ${failed}`);
console.log(`Time: ${elapsed}s`);
