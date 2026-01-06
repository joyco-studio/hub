---
reference: https://registry.joyco.studio/toolbox/pr-guidelines#architecture-doc-updates
---

# Keep ARCHITECTURE.md Updated

### What

Maintain an `ARCHITECTURE.md` file at the repository root. When a change constitutes a significant architectural update, update `ARCHITECTURE.md` in the same PR to reflect the new state of the system.

### Why

Architecture decisions quickly become tribal knowledge. A single, up-to-date document helps agents and future contributors understand the current data management approach, data fetching patterns, and layout/rendering patterns without reverse-engineering the codebase.

### Review Requirement

Code diff review agents should require an `ARCHITECTURE.md` update when a change materially affects:

- Data management (e.g., new state containers, caching layers, stores, or shared context boundaries).
- Data fetching patterns (e.g., new fetch client, batching/streaming changes, SSR/CSR shifts, or query ownership changes).
- Layout and rendering patterns (e.g., route hierarchy, streaming/partial rendering, suspense boundaries, or layout composition strategy).

### Examples

**Needs ARCHITECTURE.md update**
- Migrating from local state to a global store or new context hierarchy.
- Moving data fetching from client components to server components (or vice-versa).
- Updating the data-fetching mechanism (migrating from react-query to swr).
- Introducing a new layout shell, route grouping strategy, or streaming rendering model.

**Does not require update**
- Localized refactors that keep the existing architecture intact.
- Minor component moves that do not change data flow or rendering strategy.
