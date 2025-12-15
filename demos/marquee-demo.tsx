'use client'
import { Marquee } from '@/registry/joyco/blocks/marquee'
import { IBMLogo, NasaLogo, SpaceXLogo, ValveLogo } from '@/components/logos'

const LOGOS = [IBMLogo, NasaLogo, SpaceXLogo, ValveLogo]
const ITEMS = [...LOGOS, ...LOGOS].map((Logo, i) => ({ Logo, id: i }))

export function MarqueeDemo() {
  return (
    <div className="py-14">
      <Marquee speed={100} speedFactor={0.5} direction={1} play>
        {ITEMS.map(({ Logo, id }) => (
          <Logo key={id} className="h-8 w-auto" />
        ))}
      </Marquee>
    </div>
  )
}

export default MarqueeDemo
