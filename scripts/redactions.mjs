/**
 * Areas to hide in images before they are published. Used by `npm run redact`.
 *
 * Coordinates are pixels in the ORIGINAL image: x/y is the top-left corner, w/h the size.
 * Not sure of the numbers? Run `npm run redact -- --grid` and open the gridded previews
 * it writes to .redact-preview/ to read them off.
 *
 * Modes:
 *   'blur'      heavy blur, blends into the background (default)
 *   'pixelate'  big blocks
 *   'fill'      solid box, the safest choice for long numbers or IDs
 */
export default {
  'src/assets/certificates/maseno-bsc-it.jpg': [
    // The certificate serial number was blurred by hand before this script existed,
    // so the backed-up original already has it hidden.
    { label: 'middle name', x: 1114, y: 636, w: 336, h: 76 },
  ],
};
