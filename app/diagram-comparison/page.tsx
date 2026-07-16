import type { Metadata } from 'next'
import { Diagram } from '@/components/flow'
import { Mermaid } from '@/components/mermaid'
import { ThemeSwitcher } from './theme-switcher'

export const metadata: Metadata = {
  title: 'Diagram comparison',
  robots: { index: false, follow: false },
}

// Temporary review page: every diagram that trazo now renders on the
// `kahdri/trazo-integration` branch, next to whatever stood in its place on
// `main` (a Mermaid chart, an Excalidraw screenshot, or a plain-text snippet).
// Not linked from anywhere — delete once the reviewer has seen the before/after.

type Before =
  | { kind: 'mermaid'; chart: string }
  | { kind: 'image'; src: string; width: number; height: number; alt: string }
  | { kind: 'text'; text: string }

type Pair = {
  article: string
  index: number
  title: string
  ascii?: boolean
  before: Before
  after: string
}

const PAIRS: Pair[] = [
  // ── 07 · Next.js promises + PPR ─────────────────────────────────────────
  {
    article: '07',
    index: 1,
    title: 'Blocking await chain',
    before: {
      kind: 'mermaid',
      chart: `flowchart TD
    A(["Request arrives"]) --> B["await getCart(), 200ms"]
    B --> C["await getFlags(), 150ms"]
    C --> D["Render HTML"]
    D --> E["Send response, 350ms+ later"]

    style B fill:#fecaca,stroke:#dc2626,color:#000
    style C fill:#fecaca,stroke:#dc2626,color:#000
    style E fill:#fecaca,stroke:#dc2626,color:#000`,
    },
    after: `flow TD
A(["Request arrives"]):primary
B["await \`getCart()\`<br/>200ms"]:error
C["await \`getFlags()\`<br/>150ms"]:error
D["Render HTML"]
E["Send response<br/>350ms+ later"]:error
A --- B
B --- C
C --- D
D --- E`,
  },
  {
    article: '07',
    index: 2,
    title: 'Forward promises, render shell immediately',
    before: {
      kind: 'mermaid',
      chart: `flowchart TD
    A(["Request arrives"]) --> B["getCart() started"]
    A --> C["getFlags() started"]
    A --> D["Render HTML shell immediately<br/>(with Suspense fallbacks)"]

    B --> E["Stream resolved data<br/>as promises settle"]
    C --> E
    D --> E

    style B fill:#bbf7d0,stroke:#16a34a,color:#000
    style C fill:#bbf7d0,stroke:#16a34a,color:#000
    style D fill:#bfdbfe,stroke:#2563eb,color:#000
    style E fill:#bfdbfe,stroke:#2563eb,color:#000`,
    },
    after: `flow TD
A(["Request arrives"]):primary
B["\`getCart()\` started"]:success
C["\`getFlags()\` started"]:success
D["Render HTML shell immediately<br/>(\`<Suspense>\` fallbacks)"]:primary
E["Stream resolved data<br/>as promises settle"]:info
A --- B
A --- C
A --- D
B --- E
C --- E
D --- E`,
  },
  {
    article: '07',
    index: 3,
    title: 'The static shell: built at build time, served from CDN',
    before: {
      kind: 'mermaid',
      chart: `block-beta
    columns 1
    block:shell["Static Shell: built at build time, served from CDN"]
        columns 2
        nav["&lt;nav&gt;<br/>Store<br/>&lt;/nav&gt;"]:2
        skeleton1["CartTotal skeleton"]:1
        skeleton2["CartCount skeleton"]:1
        main["&lt;main&gt;<br/>Featured Products"]:2
        fallback["Checkout button fallback"]:2
    end

    style nav fill:#bfdbfe,stroke:#2563eb,color:#000
    style main fill:#bfdbfe,stroke:#2563eb,color:#000
    style skeleton1 fill:#fef9c3,stroke:#ca8a04,color:#000
    style skeleton2 fill:#fef9c3,stroke:#ca8a04,color:#000
    style fallback fill:#fef9c3,stroke:#ca8a04,color:#000`,
    },
    after: `flow TD
shell(["Static Shell: built at build time, served from CDN"])
nav["\`<nav>\` Store \`</nav>\`"]:primary
skeleton1["\`CartTotal\` skeleton"]:warning
skeleton2["\`CartCount\` skeleton"]:warning
main["\`<main>\` Featured Products"]:primary
fallback["\`CheckoutButton\` fallback"]:warning
shell --- nav
nav --- skeleton1
nav --- skeleton2
skeleton1 --- main
skeleton2 --- main
main --- fallback`,
  },
  {
    article: '07',
    index: 4,
    title: 'Shell served instantly, dynamic parts stream in',
    before: {
      kind: 'mermaid',
      chart: `flowchart TD
    A(["Static shell served, 0ms"]) --> S["UI renders with Suspense fallbacks instantly"]
    S --> B["getFlags resolves, 80ms"]
    S --> C["getCart resolves, 120ms"]

    B --> D["CheckoutButton renders<br/>Checkout with Express Pay"]
    C --> E["CartCount: 3<br/>CartTotal: $149.97"]

    D --> F(["Page fully interactive ~120ms"])
    E --> F

    style A fill:#bfdbfe,stroke:#2563eb,color:#000
    style S fill:#fef9c3,stroke:#ca8a04,color:#000
    style B fill:#bbf7d0,stroke:#16a34a,color:#000
    style C fill:#bbf7d0,stroke:#16a34a,color:#000
    style D fill:#e9d5ff,stroke:#7c3aed,color:#000
    style E fill:#e9d5ff,stroke:#7c3aed,color:#000
    style F fill:#bbf7d0,stroke:#16a34a,color:#000`,
    },
    after: `flow TD
A(["Static shell served<br/>0ms"]):primary
S["UI renders with<br/>\`<Suspense>\` fallbacks instantly"]:warning
B["\`getFlags()\` resolves<br/>80ms"]:success
C["\`getCart()\` resolves<br/>120ms"]:success
D["\`CheckoutButton\` renders<br/>Checkout with Express Pay"]:info
E["\`CartCount\`: 3<br/>\`CartTotal\`: $149.97"]:info
F(["Page fully interactive<br/>~120ms"]):success
A --- S
S --- B
S --- C
B === D
C === E
D --- F
E --- F`,
  },
  {
    article: '07',
    index: 5,
    title: 'Traditional: slow TTFB, fast render',
    before: {
      kind: 'mermaid',
      chart: `sequenceDiagram
    participant S as Server
    participant C as Client

    Note over C: Blank screen...
    S->>S: await getCart(), 200ms
    S->>S: await getFlags(), 150ms
    S->>S: Render full HTML
    S->>C: Send response (350ms+ later)
    C->>C: Display everything at once
    C->>C: Hydrate
    Note over S,C: Slow TTFB, fast render`,
    },
    after: `sequenceDiagram
participant S[Server]
participant C[Client]
note over C: Blank screen…
S->>S: await getCart() (200ms)
S->>S: await getFlags() (150ms)
S->>S: Render full HTML
S->>C: Send response (350ms+ later)
C->>C: Display everything at once
C->>C: Hydrate
note over S,C: Slow TTFB, fast render`,
  },
  {
    article: '07',
    index: 6,
    title: 'Promise forwarding + PPR: fast TTFB, progressive render',
    before: {
      kind: 'mermaid',
      chart: `sequenceDiagram
    participant S as Server
    participant C as Client

    S->>S: Start getCart()
    S->>S: Start getFlags()
    S->>C: Static shell + fallbacks (instant)
    C->>C: Display shell + hydrate static parts
    Note over C: Users see content immediately
    S-->>C: Stream flags data
    C->>C: CheckoutButton resolves
    S-->>C: Stream cart data
    C->>C: CartCount + CartTotal pop in
    Note over S,C: Fast TTFB, progressive render`,
    },
    after: `sequenceDiagram
participant S[Server]
participant C[Client]
S->>S: Start getCart()
S->>S: Start getFlags()
S->>C: Static shell + fallbacks (instant)
C->>C: Display shell + hydrate static parts
note over C: Users see content immediately
S-->>C: Stream flags data
C->>C: CheckoutButton resolves
S-->>C: Stream cart data
C->>C: CartCount + CartTotal pop in
note over S,C: Fast TTFB, progressive render`,
  },
  {
    article: '07',
    index: 7,
    title: 'Full request flow with promise forwarding + PPR',
    before: {
      kind: 'mermaid',
      chart: `flowchart TD
    subgraph build ["BUILD TIME"]
        B1["Next.js prerenders the route"]
        B2["Static Shell<br/>html, body, nav, main, footer<br/>Suspense fallbacks<br/>All non-dynamic content"]
        B3[("CDN / Edge Cache")]
        B1 --> B2 --> B3
    end

    subgraph request ["REQUEST TIME"]
        R1["CDN serves static shell"] --> R2["Browser paints immediately"]
        R3["Server executes layout"]
        R3 --> R4["getCart(): fetch in flight"]
        R3 --> R5["getFlags(): fetch in flight"]
        R4 --> R6["Promises forwarded via<br/>RSC payload"]
        R5 --> R6
        R6 --> R7["flags ready<br/>stream HTML"]
        R6 --> R8["cart ready<br/>stream HTML"]
    end

    B3 --> R1
    B3 --> R3

    style build fill:#eff6ff,stroke:#2563eb,color:#000
    style request fill:#f0fdf4,stroke:#16a34a,color:#000
    style B3 fill:#bfdbfe,stroke:#2563eb,color:#000
    style R2 fill:#bbf7d0,stroke:#16a34a,color:#000
    style R7 fill:#e9d5ff,stroke:#7c3aed,color:#000
    style R8 fill:#e9d5ff,stroke:#7c3aed,color:#000`,
    },
    after: `flow TD
subgraph build ["BUILD TIME"]
B1["Next.js prerenders the route"]
B2["Static Shell<br/>html, body, nav, main, footer<br/>Suspense fallbacks<br/>All non-dynamic content"]
B3[("CDN / Edge Cache")]:primary
B1 --- B2
B2 --- B3
end
subgraph request ["REQUEST TIME"]
R1["CDN serves static shell"]
R2["Browser paints immediately"]:success
R3["Server executes layout"]
R4["getCart(): fetch in flight"]
R5["getFlags(): fetch in flight"]
R6["Promises forwarded<br/>via RSC payload"]
R7["flags ready<br/>stream HTML"]:info
R8["cart ready<br/>stream HTML"]:info
R1 --- R2
R3 --- R4
R3 --- R5
R4 --- R6
R5 --- R6
R6 === R7
R6 === R8
end
B3 --- R1
B3 --- R3`,
  },
  // ── 08 · WebGL scroll sync ──────────────────────────────────────────────
  {
    article: '08',
    index: 1,
    title: 'Scroll input reaches the compositor first',
    before: {
      kind: 'mermaid',
      chart: `flowchart LR
    A["User scrolls<br/>(wheel / touch)"] --> B["Compositor thread<br/>receives input"]
    B --> C["GPU shifts pixel tiles<br/>instantly"]
    B --> D["Main thread notified<br/>asynchronously"]

    style B fill:#bfdbfe,stroke:#2563eb,color:#000
    style C fill:#bbf7d0,stroke:#16a34a,color:#000
    style D fill:#fecaca,stroke:#dc2626,color:#000`,
    },
    after: `flow LR
A["User scrolls<br/>(wheel / touch)"]
B["Compositor thread<br/>receives input"]:primary
C["GPU shifts pixel tiles<br/>instantly"]:success
D["Main thread notified<br/>asynchronously"]:error
A --- B
B --- C
B --- D`,
  },
  {
    article: '08',
    index: 2,
    title: 'The full Chromium render pipeline',
    before: {
      kind: 'mermaid',
      chart: `flowchart TD
    subgraph main ["Main Thread"]
        direction TB
        S["Style"] --> L["Layout"]
        L --> PP["Pre-paint"]
        PP --> P["Paint<br/>(generate display lists)"]
    end

    subgraph commit ["Commit"]
        direction TB
        CO["Copy layer tree +<br/>property trees to impl thread<br/>(main thread blocked)"]
    end

    subgraph impl ["Compositor Thread (impl)"]
        direction TB
        LY["Layerize"] --> R["Raster<br/>(worker threads → GPU tiles)"]
        R --> AC["Activate"]
        AC --> DR["Draw compositor frame"]
    end

    P --> CO
    CO --> LY

    style main fill:#eff6ff,stroke:#2563eb,color:#000
    style commit fill:#fef9c3,stroke:#ca8a04,color:#000
    style impl fill:#f0fdf4,stroke:#16a34a,color:#000`,
    },
    after: `flow TD
subgraph main ["Main Thread"]
S["Style"]:primary
L["Layout"]:primary
PP["Pre-paint"]:primary
P["Paint<br/>(generate display lists)"]:primary
S --- L
L --- PP
PP --- P
end
subgraph commit ["Commit"]
CO["Copy layer tree +<br/>property trees to impl thread<br/>(main thread blocked)"]:warning
end
subgraph impl ["Compositor Thread (impl)"]
LY["Layerize"]:success
R["Raster<br/>(worker threads → GPU tiles)"]:success
AC["Activate"]:success
DR["Draw compositor frame"]:success
LY --- R
R --- AC
AC --- DR
end
P --- CO
CO --- LY`,
  },
  {
    article: '08',
    index: 3,
    title: 'The two layer trees and how they sync',
    before: {
      kind: 'mermaid',
      chart: `flowchart LR
    subgraph main ["Main Thread"]
        LTH["LayerTreeHost<br/>owns main-thread tree"]
    end

    subgraph impl ["Impl Thread"]
        LTHI["LayerTreeHostImpl<br/>owns impl-thread tree"]
    end

    LTH -- "commit<br/>(periodic sync)" --> LTHI
    LTHI -- "scroll deltas<br/>(async notify)" --> LTH

    style main fill:#eff6ff,stroke:#2563eb,color:#000
    style impl fill:#f0fdf4,stroke:#16a34a,color:#000`,
    },
    after: `flow LR
subgraph main ["Main Thread"]
LTH["LayerTreeHost<br/>owns main-thread tree"]:primary
end
subgraph impl ["Impl Thread"]
LTHI["LayerTreeHostImpl<br/>owns impl-thread tree"]:success
end
LTH -->|commit (periodic sync)| LTHI
LTHI -->|scroll deltas (async notify)| LTH`,
  },
  {
    article: '08',
    index: 4,
    title: 'JS-driven scroll: canvas lives on the window side',
    before: {
      kind: 'mermaid',
      chart: `flowchart LR
    subgraph viewport ["Window (W)"]
        direction TB
        CANVAS["Canvas<br/>(fixed to window)"]
        VIEW["Viewport<br/>(what user sees)"]
    end

    subgraph page ["Page (P)"]
        direction TB
        CONTENT["DOM content"]
    end

    viewport ---|"D (delta)<br/>JS animates scrollTop,<br/>reads it back for canvas"| page

    style viewport fill:#bfdbfe,stroke:#2563eb,color:#000
    style page fill:#f0fdf4,stroke:#16a34a,color:#000
    style CANVAS fill:#e9d5ff,stroke:#7c3aed,color:#000
    style CONTENT fill:#dbeafe,stroke:#3b82f6,color:#000`,
    },
    after: `flow LR
subgraph viewport ["Window (W)"]
CANVAS["Canvas<br/>(fixed to window)"]:info
VIEW["Viewport<br/>(what user sees)"]:primary
end
subgraph page ["Page (P)"]
CONTENT["DOM content"]:success
end
VIEW ===|D (delta): JS animates scrollTop,<br/>reads it back for canvas| CONTENT`,
  },
  {
    article: '08',
    index: 5,
    title: 'JS-driven scroll frame sequence',
    before: {
      kind: 'mermaid',
      chart: `sequenceDiagram
    participant U as User Input
    participant M as Main Thread (Lenis)
    participant C as Compositor
    participant S as Screen

    Note over U: User scrolls
    U->>M: Scroll input
    Note over M: rAF callback
    M->>M: Lerp toward target<br/>Set scrollTop<br/>Render WebGL with same value
    M->>C: Commit layers
    C->>S: Draw frame
    Note over S: DOM and canvas<br/>perfectly in sync`,
    },
    after: `sequenceDiagram
participant U[User Input]
participant M[Main Thread (Lenis)]
participant C[Compositor]
participant S[Screen]
note over U: User scrolls
U->>M: Scroll input
note over M: rAF callback
M->>M: Lerp toward target<br/>Set scrollTop<br/>Render WebGL with same value
M->>C: Commit layers
C->>S: Draw frame
note over S: DOM and canvas<br/>perfectly in sync`,
  },
  {
    article: '08',
    index: 6,
    title: 'Absolute: canvas lives on the page side',
    before: {
      kind: 'mermaid',
      chart: `flowchart LR
    subgraph viewport ["Window (W)"]
        direction TB
        VIEW["Viewport<br/>(what user sees)"]
    end

    subgraph page ["Page (P)"]
        direction TB
        CANVAS["Canvas<br/>(absolute, in page flow)"]
        DOM["DOM elements"]
    end

    viewport ---|"D (delta)<br/>JS reads scrollY,<br/>applies transform<br/>to reposition canvas"| page

    style viewport fill:#bfdbfe,stroke:#2563eb,color:#000
    style page fill:#f0fdf4,stroke:#16a34a,color:#000
    style CANVAS fill:#e9d5ff,stroke:#7c3aed,color:#000
    style DOM fill:#dbeafe,stroke:#3b82f6,color:#000`,
    },
    after: `flow LR
subgraph viewport ["Window (W)"]
VIEW["Viewport<br/>(what user sees)"]:primary
end
subgraph page ["Page (P)"]
CANVAS["Canvas<br/>(absolute, in page flow)"]:info
DOM["DOM elements"]:success
end
VIEW ===|D (delta): JS reads scrollY,<br/>applies transform to reposition canvas| CANVAS`,
  },
  {
    article: '08',
    index: 7,
    title: 'Absolute approach: edge drift sequence',
    before: {
      kind: 'mermaid',
      chart: `sequenceDiagram
    participant C as Compositor
    participant P as Page (canvas + DOM)
    participant M as Main Thread

    Note over P: Initial state:<br/>scrollY = 500<br/>transform: translateY(500px)<br/>Canvas perfectly covers viewport

    Note over C: User scrolls 40px
    C->>P: Compositor moves page to scrollY=540<br/>(canvas + DOM shift together, instant)
    Note over P: Canvas and DOM still aligned with each other<br/>but transform still says 500px<br/>→ 40px gap at the edge
    Note over M: rAF fires
    M->>M: Read scrollY = 540
    M->>P: Update transform to translateY(540px)
    Note over P: Transform catches up<br/>Canvas covers viewport again`,
    },
    after: `sequenceDiagram
participant C[Compositor]
participant P[Page (canvas + DOM)]
participant M[Main Thread]
note over P: Initial state:<br/>scrollY = 500<br/>transform: translateY(500px)<br/>Canvas perfectly covers viewport
note over C: User scrolls 40px
C->>P: Compositor moves page to scrollY=540<br/>(canvas + DOM shift together, instant)
note over P: Canvas and DOM still aligned<br/>but transform still says 500px<br/>→ 40px gap at the edge
note over M: rAF fires
M->>M: Read scrollY = 540
M->>P: Update transform to translateY(540px)
note over P: Transform catches up<br/>Canvas covers viewport again`,
  },
  {
    article: '08',
    index: 8,
    title: 'Padding absorbs the stale-transform shift',
    before: {
      kind: 'mermaid',
      chart: `flowchart TD
    subgraph canvas ["Canvas (150% viewport height)"]
        direction TB
        PAD_TOP["25% padding (top)<br/>Extra rendered area"]
        VP["100% viewport area<br/>What the user actually sees"]
        PAD_BOT["25% padding (bottom)<br/>Extra rendered area"]
    end

    SCROLL["During fast scroll,<br/>stale transform shifts canvas<br/>a few pixels"] --> VP
    NOTE["Padding absorbs the shift<br/>→ no visible clipping"] --> VP

    style PAD_TOP fill:#f0fdf4,stroke:#16a34a,color:#000
    style VP fill:#bfdbfe,stroke:#2563eb,color:#000
    style PAD_BOT fill:#f0fdf4,stroke:#16a34a,color:#000
    style NOTE fill:#bbf7d0,stroke:#16a34a,color:#000`,
    },
    after: `flow TD
subgraph canvas ["Canvas (150% viewport height)"]
PAD_TOP["25% padding (top)<br/>Extra rendered area"]:success
VP["100% viewport area<br/>What the user actually sees"]:primary
PAD_BOT["25% padding (bottom)<br/>Extra rendered area"]:success
PAD_TOP --- VP
VP --- PAD_BOT
end
SCROLL["During fast scroll,<br/>stale transform shifts canvas<br/>a few pixels"]
NOTE["Padding absorbs the shift<br/>→ no visible clipping"]:success
SCROLL --- VP
NOTE --- VP`,
  },
  {
    article: '08',
    index: 9,
    title: 'The fixed-element jelly sequence',
    before: {
      kind: 'mermaid',
      chart: `sequenceDiagram
    participant C as Compositor
    participant P as Page (canvas here)
    participant M as Main Thread

    Note over P: "Fixed" element sitting at<br/>its viewport position on the canvas
    Note over C: User scrolls 40px
    C->>P: Compositor moves page to scrollY=540<br/>(entire canvas shifts, including the "fixed" element)
    Note over P: Element dragged 40px with the page<br/>→ visibly displaced from where it should be
    Note over M: rAF fires: reads scrollY=540
    M->>M: Correct element position back<br/>to where it should be on screen
    Note over P: Element snaps back into place<br/>but for that frame it was wrong → jelly`,
    },
    after: `sequenceDiagram
participant C[Compositor]
participant P[Page (canvas here)]
participant M[Main Thread]
note over P: "Fixed" element sitting at<br/>its viewport position on the canvas
note over C: User scrolls 40px
C->>P: Compositor moves page to scrollY=540<br/>(entire canvas shifts, including the "fixed" element)
note over P: Element dragged 40px with the page<br/>→ visibly displaced from where it should be
note over M: rAF fires: reads scrollY=540
M->>M: Correct element position back<br/>to where it should be on screen
note over P: Element snaps back into place<br/>but for that frame it was wrong → jelly`,
  },
  {
    article: '08',
    index: 10,
    title: 'Choosing a scroll-sync approach',
    before: {
      kind: 'mermaid',
      chart: `flowchart TD
    ROOT["WebGL canvas needs to<br/>stay in sync with DOM during scroll"]
    ROOT --> PROBLEM["Compositor scrolls instantly (GPU)<br/>JS reads scrollY 1+ frames late"]
    PROBLEM --> Q{"Where does<br/>the canvas live?"}

    Q --> FIXED["Window side (fixed)"]
    Q --> ABS["Page side (absolute)"]

    FIXED --> FIX_HOW["JS-driven scroll (Lenis):<br/>JS animates scrollTop<br/>Canvas reads it back"]
    FIX_HOW --> FIX_PRO["Zero drift between<br/>DOM and canvas"]
    FIX_HOW --> FIX_CON["Main-thread scrolling<br/>Can drop frames on mobile"]

    ABS --> ABS_HOW["Keep native scroll:<br/>Canvas moves with page<br/>Transform corrects position"]
    ABS_HOW --> ABS_PRO["Native scroll preserved<br/>Content stays aligned"]
    ABS_HOW --> ABS_CON["Edge clipping (fix with padding)<br/>Viewport-fixed WebGL elements drift"]

    style PROBLEM fill:#fef9c3,stroke:#ca8a04,color:#000
    style FIXED fill:#bfdbfe,stroke:#2563eb,color:#000
    style ABS fill:#f0fdf4,stroke:#16a34a,color:#000
    style FIX_PRO fill:#bbf7d0,stroke:#16a34a,color:#000
    style FIX_CON fill:#fecaca,stroke:#dc2626,color:#000
    style ABS_PRO fill:#bbf7d0,stroke:#16a34a,color:#000
    style ABS_CON fill:#fecaca,stroke:#dc2626,color:#000`,
    },
    after: `flow TD
ROOT["WebGL canvas needs to<br/>stay in sync with DOM during scroll"]
PROBLEM["Compositor scrolls instantly (GPU)<br/>JS reads scrollY 1+ frames late"]:warning
Q{"Where does<br/>the canvas live?"}:primary
FIXED["Window side (fixed)"]:primary
ABS["Page side (absolute)"]:success
FIX_HOW["JS-driven scroll (Lenis):<br/>JS animates scrollTop<br/>Canvas reads it back"]
FIX_PRO["Zero drift between<br/>DOM and canvas"]:success
FIX_CON["Main-thread scrolling<br/>Can drop frames on mobile"]:error
ABS_HOW["Keep native scroll:<br/>Canvas moves with page<br/>Transform corrects position"]
ABS_PRO["Native scroll preserved<br/>Content stays aligned"]:success
ABS_CON["Edge clipping (fix with padding)<br/>Viewport-fixed WebGL elements drift"]:error
ROOT --- PROBLEM
PROBLEM --- Q
Q --- FIXED
Q --- ABS
FIXED --- FIX_HOW
FIX_HOW --- FIX_PRO
FIX_HOW --- FIX_CON
ABS --- ABS_HOW
ABS_HOW --- ABS_PRO
ABS_HOW --- ABS_CON`,
  },
  // ── 11 · Layout thrashing (was an Excalidraw screenshot) ────────────────
  {
    article: '11',
    index: 1,
    title: 'Browser rendering pipeline',
    before: {
      kind: 'image',
      src: 'https://r2.joyco.studio/nbOp4PikfFPi.png',
      width: 1903,
      height: 520,
      alt: 'Browser rendering pipeline',
    },
    after: `flow LR
js["JS"]:warning
style["Style"]:info
layout["Layout"]:primary
paint["Paint"]:success
composite["Composite"]:error
js --- style
style --- layout
layout --- paint
paint --- composite
note layout below "this one makes fps cry 😢"`,
  },
  // ── 12 · The render pipeline (was an Excalidraw screenshot) ─────────────
  {
    article: '12',
    index: 1,
    title: 'Full Frame Window — 60fps = 16ms / 120fps = 8ms',
    before: {
      kind: 'image',
      src: 'https://r2.joyco.studio/hTyqgeONsgOA.jpg',
      width: 1903,
      height: 520,
      alt: 'Browser rendering pipeline',
    },
    after: `flow LR
subgraph main ["Main Thread"]
js["JS"]:warning
style["Style"]:info
layout["Layout"]:primary
paint["Paint"]:success
js --- style
style --- layout
layout --- paint
end
subgraph compositor ["Compositor Thread"]
composite["Composite"]:error
end
paint === composite`,
  },
  // ── 14 · Phantom merge conflicts (was plain-text / ASCII snippets) ──────
  {
    article: '14',
    index: 1,
    title: 'Stacked branches',
    before: { kind: 'text', text: `main ← elvira/checkout ← homero/receipts` },
    after: `flow LR
main["main"]:primary
elvira["elvira/checkout"]:success
homero["homero/receipts"]:info
main <==|base of| elvira
elvira <==|base of| homero`,
  },
  {
    article: '14',
    index: 2,
    title: 'Squash merge: same work, a new hash',
    ascii: true,
    before: {
      kind: 'text',
      text: `main:              A ── B ───────── S        (S = squash of elvira/checkout)
                          \\
homero/receipts:           e1 ── e2 ── h1 ── h2
                          └ Elvira's ┘└ Homero's ┘
                             commits      commits`,
    },
    after: `main:              A ── B ───────── S        (S = squash of elvira/checkout)
                            \\
homero/receipts:           e1 ── e2 ── h1 ── h2
                           └ Elvira's ┘└ Homero's ┘`,
  },
  {
    article: '14',
    index: 3,
    title: 'After rebase --onto: only your commits replayed',
    ascii: true,
    before: {
      kind: 'text',
      text: `main:              A ── B ── S
                                 \\
homero/receipts:                  h1' ── h2'`,
    },
    after: `main:              A ── B ── S
                            \\
homero/receipts:           h1' ── h2'`,
  },
]

function BeforePanel({ before }: { before: Before }) {
  if (before.kind === 'mermaid') {
    return <Mermaid chart={before.chart} />
  }
  if (before.kind === 'image') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={before.src}
        alt={before.alt}
        width={before.width}
        height={before.height}
        className="mx-auto h-auto max-w-full"
      />
    )
  }
  return (
    <div className="overflow-x-auto px-4 py-8">
      <pre className="text-foreground/90 w-fit min-w-full font-mono text-[13px] leading-relaxed whitespace-pre">
        {before.text}
      </pre>
    </div>
  )
}

export default function DiagramComparisonPage() {
  return (
    <div className="min-h-screen">
      <ThemeSwitcher />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-12">
          <h1 className="font-heading text-3xl font-medium tracking-tight">
            Trazo diagram comparison
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-pretty">
            Every diagram now rendered with{' '}
            <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm">
              @joycostudio/trazo
            </code>{' '}
            on this branch, next to the original that lived on{' '}
            <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm">
              main
            </code>{' '}
            — a Mermaid chart, an Excalidraw screenshot, or a plain-text
            snippet. {PAIRS.length} diagrams across 5 logs.
          </p>
        </header>

        <div className="flex flex-col gap-16">
          {PAIRS.map((pair) => (
            <section key={`${pair.article}-${pair.index}`}>
              <div className="border-border mb-4 flex items-baseline gap-3 border-b pb-2">
                <span className="text-muted-foreground font-mono text-xs tabular-nums">
                  N{pair.article}-{String(pair.index).padStart(2, '0')}
                </span>
                <h2 className="font-heading text-lg font-medium">
                  {pair.title}
                </h2>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="text-muted-foreground mb-2 font-mono text-xs uppercase">
                    Before ·{' '}
                    {pair.before.kind === 'mermaid'
                      ? 'Mermaid'
                      : pair.before.kind === 'image'
                        ? 'Excalidraw screenshot'
                        : 'Plain text'}
                  </p>
                  <div className="border-border bg-card flex min-h-[8rem] items-center justify-center border p-2">
                    <BeforePanel before={pair.before} />
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2 font-mono text-xs uppercase">
                    After · Trazo{pair.ascii ? ' (ASCII)' : ''}
                  </p>
                  <Diagram
                    index={pair.index}
                    articleNumber={pair.article}
                    title={pair.title}
                    ascii={pair.ascii}
                    className="my-0!"
                  >
                    {pair.after}
                  </Diagram>
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
