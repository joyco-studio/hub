# Image sequence validation — 2026-10-01

## Implementation and behavioral checks

The registry installs one component and two runtime modules through shadcn, with
imports rewritten for the consuming application. The browser suite exercises that
installed payload in React Strict Mode with no Hub providers.

- 26 runtime tests pass: binary order, width selection, resolved-URL deduplication,
  eight-transfer admission, rolling fairness, nearby preemption, encoded eviction,
  streaming/no-byte limits, oversized responses, retries, local readiness, soft
  decode cancellation, scrub reversal, resize, leases, disposal, zero ready-ahead,
  sequential/hybrid policies, loop bounds, and one-shot completion.
- 27 browser checks pass across Chromium, Firefox, and WebKit (nine per engine).
  Delayed decodes, single-element identity, incomplete-image sampling, early
  assignments/revocations, failure holds, reduced motion, simultaneous sequences,
  scrub/resize, replay, distance, disabling, unmount, document visibility, and
  idempotent poster assignments are covered.
- TypeScript, focused ESLint, registry build/install, and the Hub production build
  pass. The build still reports existing baseline-browser-mapping and Shiki version
  warnings; neither prevents compilation.
- The actual Hub demo and homepage were opened in Chromium: all three sequence
  images loaded with natural dimensions of 600 × 600; no page errors were observed.

## Profile overview

The profiled code is the **installed registry payload**, built into a production
React fixture. Production registry files contain no profiler, debug flags, or
public inspector API. The website reference remains commit `6c849e66`; the older
`kahdri/image-seq-log` article was not imported or changed.

| Property                  | Value                                                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hub base commit           | `8c1001460acf82d2ce1fcfb3f45861c765810df9` plus this workspace's changes                                                                          |
| Installed payload SHA-256 | `8ff22a207b1c85ed3b67673df29b62634954c0c8e85faa7efb0f1cf11b82418b`                                                                                |
| Browser                   | Headed Chromium 153.0.8010.12, GPU enabled                                                                                                        |
| Hardware / OS             | Apple M4 Pro / Darwin 25.6.0                                                                                                                      |
| Viewport / DPR            | 1000 × 800 / 1                                                                                                                                    |
| Image size                | 600 × 600 WebP, rendered at 360px; resized to 500px in scrub capture                                                                              |
| Assets                    | Hub demo `sequence-01/Lata00..70.webp` and `sequence-02/Bot00..70.webp` on Vercel Blob                                                            |
| Delivery                  | 4 Mbps download, 3 Mbps upload, 40ms latency, browser cache disabled                                                                              |
| Runtime                   | Hybrid, 24 authored fps, eight shared transfers, three relevant decodes, three future ready candidates, 16 MiB encoded LRU, 200px nearby boundary |
| Measurement               | Cold navigation plus a separate final five-second warm window; one refreshed capture per condition                                                |

The source files contain only one rendition. Responsive URL changes are verified
with the deterministic 160w/640w browser fixture; the real-asset resize measures
lifecycle behavior without changing the underlying rendition. CDN state was not
controlled. This is a validation sample, not a controlled comparison against the
legacy player or a universal device benchmark.

## Delivery and cadence

Source fetches below count `fetch()` calls, separately from native poster requests
and local Blob assignments. First-frame timings are navigation-relative callbacks
for a decoded image assignment, not proof of physical presentation.

| Scenario                 |     Source fetches | Blob assignments | First valid frame                          | Cold first-five-second cadence | Warm cadence             | Warm source fetches |
| ------------------------ | -----------------: | ---------------: | ------------------------------------------ | ------------------------------ | ------------------------ | ------------------: |
| Isolated                 |   71 / 71 distinct |              381 | 924ms                                      | 7.6 fps                        | 23.96 fps                |                   0 |
| Two visible              | 142 / 142 distinct |            1,125 | A 1,382ms; B 943ms                         | A 2.2; B 4.2 fps               | A 24.00; B 23.96 fps     |                   0 |
| Consecutive sections     | 142 / 142 distinct |              423 | A 769ms; B 7,872ms after navigation/scroll | A 6.6 fps; B initially distant | B 24.00 fps; A suspended |                   0 |
| Scrub reversals + resize |   60 / 40 distinct |                3 | 1,229ms                                    | Target-driven                  | Held target 2            |                   0 |

Transfers finished at approximately 4.83s in isolation and 9.54s with two visible
sequences. Cold bandwidth limits visibly reduce cadence while preserving the last
valid surface. The scrub capture superseded in-flight work: four requests aborted
before headers and additional body-stage cancellations appear in the trace. Repeat
requests in that scenario reflect cancellation/re-demand, not warm cache replay.

Warm p95 assignment gaps were 50.1ms in isolation, 42.2/49.8ms for the two visible
owners, and 50.2ms for the final visible consecutive section. The largest warm gap
was 72.6ms. Across the entire cold+warm captures, gaps exceeding two authored frame
intervals occurred 15 times in isolation and 29/32 times for the two visible owners.
Those gaps are observable holds, not a claim about internal per-tick stall counts.
Hybrid skipped 60 authored positions in isolation and 116/109 for the two visible
owners over their full captures. Consecutive-section gaps also include intentional
suspension and are not comparable to continuously visible playback.

## Decode and application ownership

| Scenario                 | Decode promise median / p95 / max | Peak live Blob URLs | Encoded bytes retained after completed delivery |
| ------------------------ | --------------------------------- | ------------------: | ----------------------------------------------: |
| Isolated                 | 5.2 / 7.1 / 11.0ms                |                   4 |                                        2.12 MiB |
| Two visible              | 4.8 / 6.2 / 12.6ms                |                   8 |                                        4.38 MiB |
| Consecutive sections     | 4.9 / 7.1 / 15.5ms                |                   8 |                                        4.38 MiB |
| Scrub reversals + resize | 5.4 / 13.4 / 13.4ms               |       5 transiently |                              0.56 MiB completed |

Decode durations measure the off-DOM `decode()` promise, including browser
scheduling. Encoded retention is inferred from distinct completed response body
lengths: these captures stay below the 16 MiB budget, so no encoded eviction is
needed. The unit suite separately verifies eviction behavior.

Live Blob URLs include pending decodes and surface leases. Cancellation can briefly
leave an obsolete URL awaiting promise cleanup while replacements start; the scrub
peak of five does not mean five relevant native decodes were admitted. Steady
ownership is one visible frame plus up to three future candidates. At 600 × 600,
four RGBA frame references correspond to about 5.49 MiB of decoded pixel data per
sequence. This is an ownership estimate, not browser/GPU memory measurement.

## Chrome trace audit

The trace-audit detection passes examined renderer main-thread tasks, layout
invalidation/reflow, RAF requests, style, paint, GC, layout shifts, event timing,
network responses, repeated URLs, script evaluation, and long animation frames.
The traces include Browser, Renderer, and GPU Process events.

| Metric                                        |  Isolated | Two visible | Consecutive | Scrub + resize |
| --------------------------------------------- | --------: | ----------: | ----------: | -------------: |
| Duration                                      |    19.30s |      29.36s |      24.34s |         10.31s |
| Incomplete mounted-image samples              | 0 / 2,201 |   0 / 6,740 |   0 / 4,795 |      0 / 1,089 |
| Main-thread tasks over 50ms                   |         0 |           0 |           0 |              0 |
| Forced-reflow stack traces                    |         0 |           0 |           0 |              0 |
| Maximum invalidation/layout pairs per second  |         3 |           4 |           4 |              3 |
| Style events over 5ms / paint events over 3ms |     0 / 0 |       0 / 0 |       0 / 0 |          0 / 0 |
| Recorded paint work                           |   63.38ms |    104.57ms |     78.71ms |         0.82ms |
| Recorded raster work                          |   34.64ms |     56.47ms |     48.54ms |         1.83ms |
| Layout-shift score                            |         0 |           0 |           0 |              0 |
| `DroppedFrame` events                         |         0 |           0 |           0 |              0 |

No slow script evaluation or long-animation-frame events were found. These scripted
captures do not establish an INP score. Paint/raster totals span the whole capture,
may overlap across threads, and do not measure GPU completion.

### Warnings and interpretation

1. **GC activity with two sequences:** four GC trace records exceeded the audit
   threshold, with the largest duration at 36.99ms. Records cluster at
   24.0–24.5s and 28.0–28.5s and may describe overlapping phases of the same GC.
   No main-thread task crossed 50ms and no dropped-frame event was recorded.
   A longer, uninstrumented low-end-device run is the useful next check before
   tuning allocation or decode controls; do not infer a leak from these records.
2. **RAF heuristic flags:** approximately 238/357 requests per second for one/two
   active players reflect a 120Hz display, one clock per player, and the test's
   sampling RAF. Scrub without an autoplay clock was approximately 120/sec from
   sampling. This is not evidence of duplicate player clocks.
3. **Network audit:** a missing fixture favicon caused one unrelated 404. There
   were no HTTP error responses for frames. Native poster requests remain separate
   from scheduler fetches. Repeated observer-driven poster assignments found in the
   initial capture were fixed and regression-tested before these final captures.
4. **Cold rapid reversals:** requests can be cancelled before enough bytes arrive;
   the observed sequence showed targets 50, 40, then 2 and held valid images between
   them. If more motion under this delivery cap is required, publish smaller
   responsive assets before increasing concurrency.

No claim is made that `decode()`, `onFrame`, `Paint`, `Decode Image`, or image
completeness proves physical GPU presentation. The no-blank evidence concerns the
observable mounted element across the supported engines.

Raw captures, screenshots, detailed metrics, and the audit summary are retained in
`.context/image-sequence-profile/`. Reproduction commands are in [README.md](README.md).

_Trace analysis follows the trace-audit skill; pipeline interpretation follows the
JOYCO [Render Pipeline](https://hub.joyco.studio/logs/12-the-render-pipeline) guidance._
