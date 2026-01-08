'use client'

import GithubIcon from '@/components/icons/github'
import XIcon from '@/components/icons/x'
import InstagramIcon from '@/components/icons/instagram'
import { AsideButton } from '../nav-aside'

const socialLinks = [
  { name: 'X', href: 'https://x.com/joyco-studio', icon: XIcon },
  {
    name: 'Github',
    href: 'https://github.com/joyco-studio',
    icon: GithubIcon,
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/joyco.studio',
    icon: InstagramIcon,
  },
]

export function SocialLinks() {
  return (
    <div className="flex gap-1">
      {socialLinks.map((link) => (
        <AsideButton key={link.name} icon={link.icon} label={link.name} asChild>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          />
        </AsideButton>
      ))}
    </div>
  )
}
