'use client'

import Image from 'next/image'

import { useState, useTransition } from 'react'
import {
  MaskedList,
  useInfiniteList,
} from '@/registry/joyco/blocks/infinite-list'
import { Button } from '@/components/ui/button'
import { Card, CardFooter } from '@/components/ui/card'

type Pokemon = { name: string; url: string; image: string }

async function fetchPokemon(offset: number, limit: number): Promise<Pokemon[]> {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
  ).then((r) => r.json())
  return Promise.all(
    res.results.map(async (p: { url: string }) => {
      const data = await fetch(p.url).then((r) => r.json())
      return { name: data.name, url: p.url, image: data.sprites.front_default }
    })
  )
}

interface PokemonInfiniteListClientProps {
  initialPokemon: Pokemon[]
  pageSize: number
}

export function PokemonInfiniteListClient({
  initialPokemon,
  pageSize,
}: PokemonInfiniteListClientProps) {
  const [pokemon, setPokemon] = useState<Pokemon[]>(initialPokemon)
  const [isPending, startTransition] = useTransition()
  const list = useInfiniteList({ pageSize, initialItems: pokemon })

  const loadMore = () => {
    list.nextPage()
    startTransition(async () => {
      const newPokemon = await fetchPokemon(list.offset, pageSize)
      setPokemon((prev) => [...prev, ...newPokemon])
    })
  }

  return (
    <div className="not-prose relative h-[500px] w-full overflow-auto">
      <div className="bg-background/90 border-border sticky top-4 right-8 z-10 ml-auto w-fit rounded-lg border px-3 py-2 font-mono text-xs">
        DISPLAYED: {Math.min(list.displayLimit, pokemon.length)} | LOADED:{' '}
        {pokemon.length}
      </div>
      <div className="flex flex-col gap-6 p-6">
        <h2 className="text-2xl font-semibold">Pokemon Infinite List</h2>
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          <MaskedList {...list}>
            {pokemon.map((p) => (
              <Card key={p.url} className="gap-0 overflow-hidden p-0">
                <div className="bg-muted aspect-square">
                  <Image
                    src={p.image}
                    alt={p.name}
                    width={500}
                    height={500}
                    className="h-full w-full object-cover [image-rendering:pixelated]"
                    unoptimized
                  />
                </div>
                <CardFooter className="p-4">
                  <h3 className="text-base font-semibold capitalize">
                    {p.name}
                  </h3>
                </CardFooter>
              </Card>
            ))}
          </MaskedList>
        </div>

        <Button
          onClick={loadMore}
          disabled={isPending}
          variant="outline"
          className="self-center shadow-none transition-none"
        >
          {isPending ? 'Loading...' : 'Load More'}
        </Button>
      </div>
    </div>
  )
}
