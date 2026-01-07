# REVIEWERS.md

This file is intended to used as **review guidance** for automated/agent code reviews in this repo.

## CodeBlock component / shiki codeblock styling divergence

The react codeblock component should avoid creating custom styles for itself, prefer styling shiki and it's elements from app/styles/shiki.css and and lib/shiki.ts

### Why

We defer styling to the same mechanism used for MD-parsed codeblocks (Shiki + `app/styles/shiki.css`) so both rendered markdown codeblocks and the React `CodeBlock` component stay visually consistent. This avoids styling divergence over time (e.g. different tokens, spacing, borders, or themes) and keeps the source of truth for codeblock styling in one place.
