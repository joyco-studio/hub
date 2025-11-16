'use client';

import { useState, useTransition } from 'react';
import { MaskedList, useInfiniteList } from '@/registry/joyco/blocks/infinite-list/infinite-list';
import { Button } from '@/components/ui/button';
import { fetchPokemon, Pokemon } from './api';
import { Card, CardContent } from '../ui/card';
import Image from 'next/image';

export function PokemonInfiniteListClient({ 
  initialPokemon, 
  pageSize, 
}: {
  initialPokemon: Pokemon[];
  pageSize: number;
}) {
  const [pokemon, setPokemon] = useState<Pokemon[]>(initialPokemon);
  const [isPending, startTransition] = useTransition();

  const list = useInfiniteList({
    pageSize,
    initialItems: initialPokemon,
  });


  const loadMore = () => {
    list.nextPage();
    
    startTransition(async () => {
      const newPokemon = await fetchPokemon(list.offset, pageSize);
      setPokemon(prev => [...prev, ...newPokemon]);
    });
  };

  return (
    <div className="not-prose relative w-full h-[500px] overflow-auto p-4 bg-fd-card border border-fd-border rounded-lg">
      <div className='sticky top-0 text-xs font-mono uppercase z-10 max-w-max ml-auto -mb-7 bg-fd-card/90 backdrop-blur-md  px-3 py-2 rounded-md border border-fd-border'>
        Displayed: {list.displayLimit} | Loaded: {list.offset}
      </div>
    
      <h4 className="text-2xl font-semibold">Pokémons</h4>
      
      <div className="grid mt-4 grid-cols-2 md:grid-cols-3 gap-3">
        <MaskedList {...list}>
          {pokemon.map((p) => (
            <Card
              key={p.url}
              className='pt-0 pb-3 overflow-hidden gap-y-3'
            >
              <Image className="w-full bg-fd-muted [image-rendering:pixelated] object-cover" src={p.image} alt={p.name} width={500} height={500} />
              <CardContent className='px-3'>
                <h3 className="font-semibold capitalize text-lg">{p.name}</h3>
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
  );
}

