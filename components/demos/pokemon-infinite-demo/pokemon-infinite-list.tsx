import { PokemonInfiniteListClient } from './pokemon-infinite-list-client'
import { fetchPokemon } from './api'

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
