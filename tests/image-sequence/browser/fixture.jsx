import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ImageSequence } from '@/components/image-sequence'
import './style.css'

const query = new URLSearchParams(location.search)
const realSource = (index, owner) =>
  `https://qfxa88yauvyse9vr.public.blob.vercel-storage.com/sequence-${owner === 'a' ? '01/Lata' : '02/Bot'}${String(index).padStart(2, '0')}.webp`
const source = (index, owner = 'a') =>
  query.has('real')
    ? realSource(index, owner)
    : {
        src: `/frames/${owner}/640/${index}.svg`,
        srcSet: `/frames/${owner}/160/${index}.svg 160w, /frames/${owner}/640/${index}.svg 640w`,
      }
window.presented = []
window.completions = 0

function Fixture() {
  const [mounted, setMounted] = useState(true)
  const [playing, setPlaying] = useState(true)
  const [enabled, setEnabled] = useState(true)
  const [target, setTarget] = useState(0)
  const [run, setRun] = useState(0)
  const [size, setSize] = useState(query.has('real') ? 360 : 120)
  useEffect(() => {
    window.controls = {
      setMounted,
      setPlaying,
      setEnabled,
      setTarget,
      setRun,
      setSize,
    }
  }, [])
  return (
    <main>
      {query.has('reentry') && <div className="spacer" />}
      <div
        className={
          query.has('consecutive') ? 'sequences consecutive' : 'sequences'
        }
        style={{ '--size': `${size}px` }}
      >
        {mounted &&
          (query.has('two') || query.has('consecutive')
            ? ['a', 'b']
            : ['a']
          ).map((owner) => (
            <ImageSequence
              key={owner}
              sequenceId={`${owner}-${run}`}
              poster={{
                src: query.has('real') ? realSource(0, owner) : '/poster.svg',
                width: 600,
                height: 600,
              }}
              frameCount={query.has('real') ? 71 : 12}
              source={(index) => source(index, owner)}
              mode={query.has('scrub') ? 'scrub' : 'autoplay'}
              target={target}
              loop={!query.has('once')}
              priority={query.has('sequential') ? 'sequential' : 'hybrid'}
              playing={playing}
              enabled={enabled}
              frameDuration={1000 / 24}
              alt={`Sequence ${owner}`}
              onFrame={(index) => {
                window.presented.push({
                  owner,
                  index,
                  target,
                  time: performance.now(),
                })
              }}
              onComplete={() => window.completions++}
            />
          ))}
      </div>
      <div className="spacer" />
    </main>
  )
}
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Fixture />
  </StrictMode>
)
