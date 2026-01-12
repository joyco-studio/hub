import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getRegistryExampleComponent,
  getRegistryExampleItem,
  getRegistryExampleItems,
} from '@/lib/registry-examples'
import { Suspense } from 'react'

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    name: string
  }>
}): Promise<Metadata> {
  const { name } = await params

  const item = await getRegistryExampleItem(name)

  if (!item) {
    return {}
  }

  const description = item.description

  return {
    title: item.name,
    description,
  }
}

export async function generateStaticParams() {
  return getRegistryExampleItems().map((item) => ({ name: item.name }))
}
export default async function BlockPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const Component = getRegistryExampleComponent(name)

  if (!Component) {
    return notFound()
  }
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* eslint-disable-next-line  */}
      <Component />
    </Suspense>
  )
}
