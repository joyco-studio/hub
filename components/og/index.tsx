import { ImageResponseOptions } from 'next/server'
import { CubeIcon, FileIcon, TerminalWithCursorIcon } from '../icons'
import FlaskIcon from '../icons/flask'
import { Logo } from '../logos/logo'

const TYPE_LOGO = {
  components: CubeIcon,
  toolbox: TerminalWithCursorIcon,
  logs: FileIcon,
}

export const isTypeLogo = (type: string): type is keyof typeof TYPE_LOGO => {
  return type in TYPE_LOGO
}

const CANVAS = '#121212'
const BOX = '#191919'
const LINE = 'rgba(255, 255, 255, 0.1)'
const TITLE_COLOR = '#F1F1F1'

interface OgImageProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  number?: string
  title: string
  meta: string[]
}

interface DocsOgImageProps {
  title: string
  type: keyof typeof TYPE_LOGO
  number?: string
  author?: string
  date?: string
}

export function DocsOgImage({
  title,
  type,
  number,
  author,
  date,
}: DocsOgImageProps) {
  return (
    <OgImage
      icon={TYPE_LOGO[type]}
      label={type}
      number={number}
      title={title}
      meta={[author, date && formatDate(date)].filter(
        (value): value is string => Boolean(value)
      )}
    />
  )
}

interface LabOgImageProps {
  title: string
  tags?: string[]
  date?: string
}

export function LabOgImage({ title, tags, date }: LabOgImageProps) {
  const displayTags = tags?.slice(0, 3).join(' · ')

  return (
    <OgImage
      icon={FlaskIcon}
      label="LAB"
      title={title}
      meta={[displayTags, date && formatDate(date)].filter(
        (value): value is string => Boolean(value)
      )}
    />
  )
}

function OgImage({ icon: Icon, label, number, title, meta }: OgImageProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '1200px',
        height: '630px',
        display: 'flex',
        background: CANVAS,
        fontFamily: 'PublicSans',
      }}
    >
      <GridOverlay />

      {/* Header */}
      <div
        style={{
          position: 'absolute',
          left: '61px',
          top: '52px',
          width: '477px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'RobotoMono',
          fontSize: '18px',
          padding: '0 26px',
          background: BOX,
          fontWeight: 500,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Icon width={24} height={24} style={{ color: '#FFFFFF' }} />
          <span style={labelStyle}>{label}</span>
        </div>
        {number && <span style={labelStyle}>{number}</span>}
      </div>

      {/* Brand mark */}
      <Logo
        width={65}
        height={65}
        style={{
          position: 'absolute',
          left: '1093px',
          top: '44px',
          color: '#FFFFFF',
        }}
      />

      {/* Title + footer */}
      <div
        style={{
          position: 'absolute',
          left: '61px',
          top: '243px',
          width: '1090px',
          height: '320px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '26px',
          background: BOX,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            fontSize: '72px',
            fontWeight: 400,
            letterSpacing: '-0.8px',
            lineHeight: 1.1,
            color: TITLE_COLOR,
          }}
        >
          {title}
        </div>
        {meta.length > 0 && (
          <div style={{ display: 'flex', gap: '57px', flexShrink: 0 }}>
            {meta.map((item, index) => (
              <span key={index} style={{ ...labelStyle, opacity: 0.5 }}>
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'RobotoMono',
  fontSize: '18px',
  color: '#FFFFFF',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  fontWeight: 500,
}

const GridOverlay = () => {
  const horizontals = [51, 102, 242, 563]
  const verticals = [60, 1151]
  const segments = [
    { left: 538, top: 0, height: 291 },
    { left: 538, top: 563, height: 67 },
    { left: 1099, top: 0, height: 291 },
    { left: 1026, top: 563, height: 67 },
  ]

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
      {horizontals.map((top) => (
        <div
          key={`h-${top}`}
          style={{
            position: 'absolute',
            left: 0,
            top: `${top}px`,
            width: '1200px',
            height: '1px',
            background: LINE,
          }}
        />
      ))}
      {verticals.map((left) => (
        <div
          key={`v-${left}`}
          style={{
            position: 'absolute',
            left: `${left}px`,
            top: 0,
            width: '1px',
            height: '630px',
            background: LINE,
          }}
        />
      ))}
      {segments.map((segment, index) => (
        <div
          key={`s-${index}`}
          style={{
            position: 'absolute',
            left: `${segment.left}px`,
            top: `${segment.top}px`,
            width: '1px',
            height: `${segment.height}px`,
            background: LINE,
          }}
        />
      ))}
    </div>
  )
}

export const getFonts = async () => {
  const { readFile } = await import('fs/promises')
  const { join } = await import('path')
  const [fontArrayBuf, fontArrayBufSemiBold, fontArrayBufRegular] =
    await Promise.all([
      readFile(join(process.cwd(), 'public', 'fonts', 'PublicSans-Medium.ttf')),
      readFile(
        join(process.cwd(), 'public', 'fonts', 'PublicSans-SemiBold.ttf')
      ),
      readFile(
        join(process.cwd(), 'public', 'fonts', 'RobotoMono-Regular.ttf')
      ),
    ])
  return [
    {
      name: 'PublicSans',
      data: fontArrayBuf,
      style: 'normal' as const,
      weight: 400 as const,
    },
    {
      name: 'PublicSans',
      data: fontArrayBufSemiBold,
      style: 'normal' as const,
      weight: 600 as const,
    },
    {
      name: 'RobotoMono',
      data: fontArrayBufRegular,
      style: 'normal' as const,
      weight: 400 as const,
    },
  ] satisfies ImageResponseOptions['fonts']
}

const formatDate = (date: string) => {
  // new Date(date) -> 28.9.2025
  const d = new Date(date)
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`
}
