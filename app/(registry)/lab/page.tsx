import type { Metadata } from 'next'
import { getExperiments } from '@/lib/lab'
import { getRegistryCounts } from '@/lib/source'
import { RegistryMetaProvider } from '@/components/registry-meta'
import { LabView } from '@/components/lab/lab-view'

export const revalidate = 30

export const metadata: Metadata = {
  title: 'Lab',
  description:
    'Experimental projects and creative explorations from JOYCO Studio.',
}

export default async function LabPage() {
  const { experiments } = await getExperiments()
  const counts = getRegistryCounts()

  return (
    <RegistryMetaProvider counts={counts}>
      <LabView experiments={experiments} />
    </RegistryMetaProvider>
  )
}
