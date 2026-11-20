// Entry program for make.fun bounty news-image-20261120.
// Copies the pre-rendered front page (entry.png) to the output directory.
// Node 22, standard library only; no network access is used.

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1_048_576; // 1 MiB

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);

const repoRoot = dirname(fileURLToPath(import.meta.url));
const entryPath = join(repoRoot, "entry.png");

if (!existsSync(entryPath)) {
  throw new Error("entry.png is missing from the repository root");
}

const entrySize = statSync(entryPath).size;
if (entrySize > MAX_BYTES) {
  throw new Error(
    `entry.png is ${entrySize} bytes, over the 1 MiB limit of ${MAX_BYTES} bytes`,
  );
}

// The gate tells PNG from JPEG by the first bytes, so refuse a file that
// is neither instead of submitting bytes the judge cannot read.
const header = readFileSync(entryPath).subarray(0, 8);
if (!header.equals(PNG_MAGIC) && !header.subarray(0, 3).equals(JPEG_MAGIC)) {
  throw new Error("entry.png is neither a PNG nor a JPEG file");
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
const outputPath = join(outputDir, "entry.png");
copyFileSync(entryPath, outputPath);

// Confirm the copy landed whole: a truncated output must fail loudly.
if (statSync(outputPath).size !== entrySize) {
  throw new Error(
    `copied entry.png is ${statSync(outputPath).size} bytes, expected ${entrySize}`,
  );
}
