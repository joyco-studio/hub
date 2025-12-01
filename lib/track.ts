const JOYCO_WORKER_SECRET = process.env.JOYCO_WORKER_SECRET || ""

export function trackDownload(componentName: string) {
  if (!JOYCO_WORKER_SECRET) {
    console.error(`[Registry Download] No worker secret found`)
    return
  }

  fetch("https://registry.joyco.studio/registry/downloads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JOYCO_WORKER_SECRET}`,
    },
    body: JSON.stringify({ component: componentName }),
  }).catch((error) => {
    console.error(`[Registry Download] Failed to track for ${componentName}:`, error)
  })
}

