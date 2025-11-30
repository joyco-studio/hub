'use client'

import { useState, useTransition } from 'react'
import {
  MaskedList,
  useInfiniteList,
} from '@/registry/joyco/blocks/infinite-list'
import { Button } from '@/components/ui/button'
import { fetchPokemon, Pokemon } from './api'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

export function PokemonInfiniteListClient({
  initialPokemon,
  pageSize,
}: {
  initialPokemon: Pokemon[]
  pageSize: number
}) {
  const [pokemon, setPokemon] = useState<Pokemon[]>(initialPokemon)
  const [isPending, startTransition] = useTransition()

  const list = useInfiniteList({
    pageSize,
    initialItems: initialPokemon,
  })

  const loadMore = () => {
    list.nextPage()

    startTransition(async () => {
      const newPokemon = await fetchPokemon(list.offset, pageSize)
      setPokemon((prev) => [...prev, ...newPokemon])
    })
  }

  return (
    <div className="not-prose bg-card border-border relative h-[500px] w-full overflow-auto rounded-lg border p-4">
      <div className="bg-card/90 border-border sticky top-0 z-10 -mb-7 ml-auto max-w-max rounded-md border px-3 py-2 font-mono text-xs uppercase backdrop-blur-md">
        Displayed: {list.displayLimit} | Loaded: {list.offset}
      </div>

      <h4 className="text-2xl font-semibold">Pokémons</h4>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <MaskedList {...list}>
          {pokemon.map((p) => (
            <Card key={p.url} className="gap-y-3 overflow-hidden pt-0 pb-3">
              <Image
                className="bg-muted w-full object-cover [image-rendering:pixelated]"
                src={p.image}
                alt={p.name}
                width={500}
                height={500}
              />
              <CardContent className="px-3">
                <h3 className="text-lg font-semibold capitalize">{p.name}</h3>
              </CardContent>
            </Card>
          ))}
        </MaskedList>
      </div>

      <div className="flex justify-center py-4">
        <Button
          onClick={loadMore}
          disabled={isPending}
          variant="outline"
          size="lg"
        >
          {isPending ? 'Loading...' : 'Load More Pokémon'}
        </Button>
      </div>
    </div>
  )
}
