'use client'

import * as React from 'react'

export type SearchResult = {
  id: string
  url: string
  type: 'page' | 'heading' | 'text'
  content: string
}

const MIN_QUERY_LENGTH = 2

export function useSearch() {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<SearchResult[]>([])
  // Track which query the current results belong to
  const [resultsForQuery, setResultsForQuery] = React.useState('')

  // Debounced fetch
  React.useEffect(() => {
    if (query.length < MIN_QUERY_LENGTH) {
      // Clear results when query is too short
      setResults([])
      setResultsForQuery('')
      return
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      fetch(`/api/search?query=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data: SearchResult[]) => {
          setResults(data)
          setResultsForQuery(query)
        })
        .catch(() => {
          // Ignore aborted requests
        })
    }, 150)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [query])

  // Derive display state:
  // Key insight: if we're showing results, keep showing them until new results arrive
  const isSearching = query.length >= MIN_QUERY_LENGTH
  const hasLoadedResults = resultsForQuery.length >= MIN_QUERY_LENGTH
  const resultsMatch = resultsForQuery === query

  // hasResults: show results if we have any loaded (even if for previous query while loading)
  // But only if we're still in search mode (query >= 2)
  const hasResults = isSearching && hasLoadedResults && results.length > 0

  // isEmpty: only when we've confirmed no results for the CURRENT query specifically
  const isEmpty = isSearching && resultsMatch && results.length === 0

  return {
    query,
    setQuery,
    results,
    hasResults,
    isEmpty,
  }
}
