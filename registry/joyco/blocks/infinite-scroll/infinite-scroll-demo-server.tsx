import { InfiniteScrollProvider } from './infinite-scroll';
import { InfiniteScrollDemoContent } from './infinite-scroll-demo';
import { LoadPageFn } from './use-infinite-scroll';

export type Pokemon = {
  id: number;
  name: string;
  sprite: string;
  types: string[];
};

type PokeApiListResponse = {
  count: number;
  results: Array<{
    name: string;
    url: string;
  }>;
};

type PokeApiSpeciesResponse = {
  types: Array<{
    type: {
      name: string;
    };
  }>;
};

const PAGE_SIZE = 20;
const INITIAL_PAGE_SIZE = PAGE_SIZE * 2;
const SPRITE_BASE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

const fetchPokemonPage: LoadPageFn<Pokemon> = async ({ offset, limit }) => {
  'use server';

  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error('Failed to load Pokémon.');
  }

  const data = (await response.json()) as PokeApiListResponse;

  const items: Pokemon[] = await Promise.all(
    data.results.map(async ({ name, url }) => {
      const segments = url.split('/').filter(Boolean);
      const id = Number(segments[segments.length - 1]);

      try {
        const speciesResponse = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
          },
          next: { revalidate: 60 },
        });

        if (!speciesResponse.ok) {
          throw new Error('Failed to load species.');
        }

        const speciesData = (await speciesResponse.json()) as PokeApiSpeciesResponse;

        return {
          id,
          name,
          sprite: `${SPRITE_BASE_URL}/${id}.png`,
          types: speciesData.types.map(({ type }) => type.name),
        };
      } catch {
        return {
          id,
          name,
          sprite: `${SPRITE_BASE_URL}/${id}.png`,
          types: [],
        };
      }
    })
  );

  return {
    items,
    totalCount: data.count ?? null,
  };
};

export async function InfiniteScrollDemo() {
  const initial = await fetchPokemonPage({ offset: 0, limit: INITIAL_PAGE_SIZE, page: 1 });

  return (
    <InfiniteScrollProvider
      loadPage={fetchPokemonPage}
      pageSize={PAGE_SIZE}
      initialItems={initial.items}
      initialFetched={initial.items.length}
      initialTotalCount={initial.totalCount ?? null}
      debug
    >
      <InfiniteScrollDemoContent />
    </InfiniteScrollProvider>
  );
}
