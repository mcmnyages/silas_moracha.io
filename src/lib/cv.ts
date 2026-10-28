/**
 * BUILD TIME ONLY. Resolves the CV link if the PDF is present in public/, so every
 * "Download CV" button can hide itself instead of pointing at a missing file.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { site } from '../config/site';
import { withBase } from './url';

const present = existsSync(join(process.cwd(), 'public', site.cv.file));
if (!present) console.warn(`[cv] public/${site.cv.file} not found; CV buttons are hidden.`);

/** Link to the CV, or null when there is no file to serve. */
export const cv = present ? { href: withBase(site.cv.file), downloadName: site.cv.downloadName } : null;
