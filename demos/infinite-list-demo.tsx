import { PokemonInfiniteListClient } from './infinite-list-client-demo'

type Pokemon = { name: string; url: string; image: string }

async function fetchPokemon(offset: number, limit: number): Promise<Pokemon[]> {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`,
    { next: { revalidate: 3600 } }
  ).then((r) => r.json())
  return Promise.all(
    res.results.map(async (p: { url: string }) => {
      const data = await fetch(p.url, { next: { revalidate: 3600 } }).then(
        (r) => r.json()
      )
      return { name: data.name, url: p.url, image: data.sprites.front_default }
    })
  )
}

export async function PokemonInfiniteList() {
  const pageSize = 12
  const initialPokemon = await fetchPokemon(0, pageSize * 2)

  return (
    <PokemonInfiniteListClient
      initialPokemon={initialPokemon}
      pageSize={pageSize}
    />
  )
}

export default PokemonInfiniteList
