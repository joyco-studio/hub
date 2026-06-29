import { parseGit, layoutGit } from '@joycostudio/trazo'
const d1 = `
commit A
commit B
branch homero/receipts
commit e1 : elvira
commit e2 : elvira
commit h1 : homero
commit h2 : homero
checkout main
commit S : squash of elvira/checkout`
const d2 = `
commit A
commit B
commit S : squash of elvira/checkout
branch homero/receipts
commit h1' : homero
commit h2' : homero`
for (const [name, src] of [['d1', d1], ['d2', d2]]) {
  const { graph, error } = parseGit(src)
  if (error) { console.log(`${name} PARSE FAIL line ${error.line}: ${error.message}`); continue }
  try {
    const g = layoutGit(graph)
    console.log(`${name} OK — ${g.nodes.length} nodes, ${g.edges.length} edges, ${g.width}x${g.height}`)
    console.log('   commits:', graph.commits.map(c=>`${c.id}[${c.parents.join(',')||'∅'}]`).join(' '))
    console.log('   refs:', JSON.stringify(graph.refs))
  } catch(e){ console.log(`${name} LAYOUT FAIL: ${e.message}`) }
}
