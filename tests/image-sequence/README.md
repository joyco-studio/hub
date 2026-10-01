# Image sequence validation

The runtime tests cover stateful scheduling, network limits, decode cancellation,
responsive identity, Blob ownership, and playback policies. The browser suite
installs the built registry through shadcn into `.context/image-sequence-install`
and exercises those installed files in a standalone React Strict Mode consumer.
It uses no Hub application providers or production debugger hooks.

```sh
pnpm test:image-sequence
pnpm exec playwright install chromium firefox webkit
pnpm test:image-sequence:browser
```

The install fixture is disposable. `prepare-image-sequence-browser.mjs` replaces
only its generated `.context/image-sequence-install` directory, builds into
`.context/image-sequence-registry`, and resolves the utility dependency from that
local registry. Browser traces and failures are under
`.context/image-sequence-results`.

The synthetic SVG endpoints make delayed decoding, failure, contention, and
responsive source changes deterministic. Browser checks sample image completeness
and natural dimensions; they do not prove physical GPU presentation. The hidden
page test dispatches a controlled visibility event because automated tab focus
behavior varies by engine.

## Real-asset profiling

Build the installed payload into a production fixture, then serve it:

```sh
node scripts/prepare-image-sequence-browser.mjs
pnpm exec vite build --config tests/image-sequence/browser/vite.config.mts --outDir ../../../.context/image-sequence-production
pnpm exec vite preview --config tests/image-sequence/browser/vite.config.mts --outDir ../../../.context/image-sequence-production --port 4180 --strictPort
```

With that server running, execute `node scripts/profile-image-sequence.mjs`.
It launches headed Chromium, caps delivery at 4 Mbps with 40 ms latency and browser
cache disabled, and exercises the Hub demo's real WebP assets. Keep the browser
visible and builds/tests idle during this run. The scenarios are one sequence,
two simultaneous sequences, consecutive sections crossing the nearby boundary,
and scrub reversals plus resize. Each capture includes a separate five-second
warm observation window.

Results, screenshots, and Chrome traces are written to
`.context/image-sequence-profile`. Metadata records the base commit and SHA-256 of
the installed registry payload, browser, hardware, viewport, DPR, and settings.
Instrumentation belongs to the fixture and script only; registry files contain no
profiling APIs. The real demo assets have one 600px rendition, so the responsive
URL-change assertion belongs to the cross-engine fixture, not this performance
run. Do not treat single-machine measurements as device-independent thresholds.
