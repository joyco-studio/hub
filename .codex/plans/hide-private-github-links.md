# Hide buttons linking to private GitHub repositories

Show repository action buttons only when their own destination is confirmed public across documentation and lab pages. Leave inline content, profiles, organizations, README loading, and non-GitHub links unchanged.

## Implementation

1. Share a server-side GitHub visibility helper, requiring `private === false`, retaining optional authentication and one-hour caching, and normalizing file links to their repository.
2. Filter generated and frontmatter documentation buttons concurrently and check the configured hub repository once for both responsive source buttons.
3. Reuse the helper in lab and verify visibility failures fail closed.

## Validation

Add focused mocked visibility/filtering tests, run focused lint and TypeScript checks, and inspect responsive rendering. Private, missing, malformed, and failed responses must hide buttons independently of other destinations.

## Defaults

Unknown visibility hides buttons. Existing hourly caching remains. No relevant prior guidance was found in the JOYCO indexes.
