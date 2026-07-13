'use client'

export function ShimmerRow({ label }: { label: string }) {
  return (
    <div className="my-4 ml-2" data-slot="ai-sdk-chat-shimmer">
      <style>{
        /* css */ `
          @keyframes ai-chat-shimmer-sweep {
            from { transform: translateX(-100%); }
            to { transform: translateX(100%); }
          }
          .ai-chat-shimmer {
            position: relative;
            overflow: hidden;
            color: var(--color-muted-foreground);
          }
          .ai-chat-shimmer::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(
              90deg,
              transparent 0%,
              color-mix(in oklch, var(--color-foreground) 22%, transparent) 50%,
              transparent 100%
            );
            transform: translateX(-100%);
            animation: ai-chat-shimmer-sweep 1.4s linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .ai-chat-shimmer::after {
              animation: ai-chat-shimmer-pulse 1.4s ease-in-out infinite;
              background: none;
            }
            .ai-chat-shimmer { animation: ai-chat-shimmer-pulse 1.4s ease-in-out infinite; }
            @keyframes ai-chat-shimmer-pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.55; }
            }
          }
        `
      }</style>
      <span className="ai-chat-shimmer bg-primary/5 inline-flex rounded-2xl border border-white/10 px-4 py-2 text-sm">
        {label}
      </span>
    </div>
  )
}
