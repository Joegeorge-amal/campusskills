export function levenshteinDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

export function getBestMatch(query, list, maxDistance = 2) {
  if (!query || query.trim() === '') return null;
  
  let bestMatch = null;
  let minDistance = Infinity;
  
  for (const item of list) {
    const itemLower = item.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Exact or prefix match takes precedence
    if (itemLower === queryLower) return { item, distance: 0, isPrefix: true };
    if (itemLower.startsWith(queryLower)) {
      const dist = itemLower.length - queryLower.length;
      if (dist < minDistance) {
        minDistance = dist;
        bestMatch = { item, distance: 0, isPrefix: true };
      }
      continue;
    }

    if (queryLower.includes(itemLower) && minDistance > 1) {
      minDistance = 1;
      bestMatch = { item, distance: 1, isPrefix: false };
      continue;
    }
    
    // Fuzzy match on full query
    const distFull = levenshteinDistance(queryLower, itemLower);
    // Fuzzy match if query is longer but starts with a typo of the item (e.g. "pythong prog" -> "python")
    const queryPrefixDist = levenshteinDistance(queryLower.substring(0, itemLower.length), itemLower);
    
    // Fuzzy match on any single word in query
    let minWordDist = Infinity;
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
    for (const qw of queryWords) {
      const d = levenshteinDistance(qw, itemLower);
      if (d < minWordDist) minWordDist = d;
    }
    
    const dist = Math.min(distFull, queryPrefixDist, minWordDist);
    
    if (dist <= maxDistance && dist < minDistance) {
      minDistance = dist;
      bestMatch = { item, distance: dist, isPrefix: false };
    }
  }
  
  return bestMatch;
}

export function getSuggestions(query, list, maxResults = 5) {
  if (!query || query.trim() === '') return list.slice(0, maxResults);
  
  const results = list.map(item => {
    const itemLower = item.toLowerCase();
    const queryLower = query.toLowerCase();
    
    if (itemLower.startsWith(queryLower)) return { item, score: 0 };
    if (itemLower.includes(queryLower)) return { item, score: 1 };
    if (queryLower.includes(itemLower)) return { item, score: 2 };
    
    const distFull = levenshteinDistance(queryLower, itemLower);
    const queryPrefixDist = levenshteinDistance(queryLower.substring(0, itemLower.length), itemLower);
    
    let minWordDist = Infinity;
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
    for (const qw of queryWords) {
      const d = levenshteinDistance(qw, itemLower);
      if (d < minWordDist) minWordDist = d;
    }
    
    const bestFuzzyDist = Math.min(distFull, queryPrefixDist, minWordDist);
    return { item, score: bestFuzzyDist + 3 };
  });
  
  results.sort((a, b) => a.score - b.score);
  
  // Filter out completely irrelevant ones if query is long enough
  const filtered = results.filter(r => r.score < 6 || (query.length < 3 && r.score < 7));
  
  return filtered.slice(0, maxResults).map(r => r.item);
}
