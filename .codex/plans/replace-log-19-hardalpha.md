# Replace log 19 with HardAlpha

Update the existing hub article with the supplied draft, preserving its URL and author. The cover is for X and the blog, so it is excluded from this hub entry.

## Implementation

1. Replace the existing entry with the supplied description and body, retain the original title **19 - The aliasing lurks in the shadows**, and retain author `justkahdri` and the existing filename.
2. Remove the cover placeholder and normalize self-linked headings to ordinary MDX headings. Preserve the remaining prose and code examples.
3. Copy the four star illustrations into `public/static/logs/figma-inner-shadows/`. Use existing `ImageCols` and `Figure` components for labeled enlarged before/after comparisons under “The tell.” Follow with the unoptimized PNG at its native 288 × 144 size and a link to the SVG alternative.
4. Keep legacy assets and shared components, APIs, and schemas unchanged.

## Validation

Run log-numbering, targeted formatting, and production-build checks. Verify the existing article URL, images, heading links, and desktop/mobile comparison layout.

## Progress

Completed: replaced the article and copied all four illustrations. No cover was added.

Validation passed: log numbering, targeted Prettier checks, production build, and `git diff --check`. Headless Chrome verified the existing URL at desktop (1440px) and mobile (390px) widths: all three inline images loaded, the PNG rendered unoptimized at exactly 288 × 144, the alternate SVG returned HTTP 200, all fragment links resolved, and neither viewport overflowed horizontally. Enlarged comparisons rendered in two columns on desktop and stacked on mobile; no browser runtime errors occurred.

The build emitted dependency/configuration warnings about baseline-browser-mapping data age, the Shiki version mismatch, and package module type. These did not prevent a successful build.

User correction: restored the original article title, **19 - The aliasing lurks in the shadows**. The replacement body and illustrations remain as implemented.
