import { ImageResponseOptions } from 'next/server'
import { CubeIcon, FileIcon, TerminalWithCursorIcon } from '../icons'

const TYPE_LOGO = {
  components: CubeIcon,
  toolbox: TerminalWithCursorIcon,
  logs: FileIcon,
}

export const isTypeLogo = (type: string): type is keyof typeof TYPE_LOGO => {
  return type in TYPE_LOGO
}

interface DocsOgImageProps {
  title: string
  description?: string
  type: keyof typeof TYPE_LOGO
  author?: string
  date?: string
}

export function DocsOgImage({
  title,
  description,
  type,
  author,
  date,
}: DocsOgImageProps) {
  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '5px',
        background: '#121212',
      }}
    >
      <Col
        style={{
          width: '29.33%',
        }}
      >
        <Box style={{ height: '20%' }} />
        <Box style={{ height: '45%' }} />
        <Box style={{ height: '38%' }} />
      </Col>
      <Col
        style={{
          width: '39.33%',
        }}
      >
        <Box style={{ height: '15%' }} />
        <Box style={{ height: '87%', background: 'transparent' }}>
          <Card
            type={type}
            title={title}
            description={description}
            author={author}
            date={date}
            style={{ height: '100%' }}
          />
        </Box>
        <Box style={{ height: '15%' }} />
      </Col>
      <Col
        style={{
          width: '29.33%',
        }}
      >
        <Box style={{ height: '30%' }} />
        <Box style={{ height: '45%' }} />
        <Box style={{ height: '25%' }} />
      </Col>
    </div>
  )
}

const Col = ({ children, style }: React.ComponentProps<'div'>) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        flexGrow: 1,
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
const Box = ({ style, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      style={{
        background: '#191919',
        display: 'flex',
        ...style,
      }}
      {...props}
    />
  )
}

const Card = ({
  type,
  title,
  description,
  author,
  date,
  style,
}: Pick<
  DocsOgImageProps,
  'title' | 'description' | 'type' | 'author' | 'date'
> & { style?: React.CSSProperties }) => {
  const Icon = TYPE_LOGO[type]
  return (
    <div
      style={{
        fontFamily: 'PublicSans',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        flex: 1,
        flexGrow: 1,
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          gap: '5px',
          height: '45px',
        }}
      >
        <div
          style={{
            aspectRatio: '1/1',
            background: '#191919',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '45px',
          }}
        >
          <Icon style={{ color: '#FFFFFF' }} />
        </div>
        <div
          style={{
            display: 'flex',
            gap: '5px',
            alignItems: 'center',
            background: '#191919',
            width: '100%',
            padding: '14px',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              color: '#FFFFFF',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: 'RobotoMono',
            }}
          >
            {type}
          </div>
        </div>
      </div>
      {/* Body */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '40px',
          gap: '5px',
          background: '#0000FF',
          flexGrow: 1,
          fontFamily: 'PublicSans',
        }}
      >
        <div
          style={{
            fontSize: '56px',
            color: '#FFFFFF',
            fontWeight: '600',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: 'PublicSans',
            fontSize: '20px',
            color: '#FFFFFF',
            fontWeight: '400',
          }}
        >
          {description}
        </div>
      </div>
      {/* Footer */}
      <div
        style={{
          display: 'flex',
          gap: '5px',
          height: '45px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '5px',
            alignItems: 'center',
            background: '#191919',
            width: '100%',
            padding: '14px',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              color: '#F1F1F1',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: 'RobotoMono',
              opacity: 0.5,
            }}
          >
            {author}
          </div>
          {date && (
            <div
              style={{
                fontSize: '18px',
                color: '#F1F1F1',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: 'RobotoMono',
              }}
            >
              {formatDate(date)}
            </div>
          )}
        </div>
      </div>
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
  // new Date(date) -> 2026.01.01
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}.${month}.${day}`
}
