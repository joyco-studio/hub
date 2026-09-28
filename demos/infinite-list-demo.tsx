import { PokemonInfiniteListClient } from './infinite-list-client'

const initialPokemon = [
  'bulbasaur',
  'ivysaur',
  'venusaur',
  'charmander',
  'charmeleon',
  'charizard',
  'squirtle',
  'wartortle',
  'blastoise',
  'caterpie',
  'metapod',
  'butterfree',
  'weedle',
  'kakuna',
  'beedrill',
  'pidgey',
  'pidgeotto',
  'pidgeot',
  'rattata',
  'raticate',
  'spearow',
  'fearow',
  'ekans',
  'arbok',
].map((name, index) => {
  const id = index + 1

  return {
    name,
    url: `https://pokeapi.co/api/v2/pokemon/${id}/`,
    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
  }
})

export function PokemonInfiniteList() {
  const pageSize = 12

  return (
    <PokemonInfiniteListClient
      initialPokemon={initialPokemon}
      pageSize={pageSize}
    />
  )
}

export default PokemonInfiniteList
