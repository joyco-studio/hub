export type DemoConfig = {
  styles: string
  timeout?: number
  viewport: {
    width: number
    height: number
  }
  preview?: string
}

export const config: Record<string, Partial<DemoConfig>> = {
  'file-button': {
    styles: `html, body { width: 100% }`,
  },
  'mobile-menu': {
    styles: `html, body { width: 400px; height: 600px; }`,
    viewport: {
      width: 400,
      height: 700,
    },
    preview: 'object-contain!',
  },
  mention: {
    styles: `html, body { width: 100% }\n body { scale: 1.5 }`,
  },
  'action-hint': {
    styles: `html { scale: 1.5 }`,
  },
  'hls-player': {
    styles: `html { scale: 1.5 }`,
    timeout: 1000,
  },
  'media-player': {
    timeout: 2000,
  },
}

export const defaultConfig: DemoConfig = {
  styles: '',
  viewport: {
    width: 1200,
    height: 600,
  },
}

export function getDemoConfig(name: string) {
  const selectedConfig = config[name]

  return Object.assign({}, defaultConfig, selectedConfig)
}

export const baseScreenshStyle: string = `
html, body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
body * {
  flex-shrink: 0;
}
/* Hide scrollbars */
::-webkit-scrollbar {
  display: none;
}
* {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
`
