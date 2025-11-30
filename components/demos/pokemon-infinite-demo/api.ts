export interface PokemonLink {
  name: string
  url: string
}

export interface Pokemon {
  name: string
  url: string
  image: string
}

export async function fetchPokemon(
  offset: number,
  limit: number
): Promise<Pokemon[]> {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
  ).then((res) => res.json())

  const pokemons = await Promise.all(
    response.results.map(async (pokemon: PokemonLink) => {
      const pokemonResponse = await fetch(pokemon.url).then((res) => res.json())
      return {
        ...pokemon,
        image: pokemonResponse.sprites.front_default,
      }
    })
  )

  return pokemons
}
