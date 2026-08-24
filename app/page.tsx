'use client'

import { useEffect, useState, type FormEvent } from 'react'

type Skill = { name: string; level: number; color: string }
type Path = { title: string; company: string; fit: number; steps: string[]; salary: string; time: string }
type Connection = { from: string; to: string; strength: number }

const demoSkills: Skill[] = [
  { name: 'Python', level: 92, color: '#e2b93b' }, { name: 'SQL', level: 81, color: '#3ba8a0' },
  { name: 'Machine learning', level: 66, color: '#e8754c' }, { name: 'Data storytelling', level: 48, color: '#7087c8' },
]
const demoPaths: Path[] = [
  { title: 'Machine Learning Engineer', company: 'Northstar Labs', fit: 87, steps: ['Python', 'ML systems', 'Model deployment'], salary: '$142k-$176k', time: '2 skill moves' },
  { title: 'Product Data Scientist', company: 'Arc & Arrow', fit: 76, steps: ['SQL', 'Experiment design', 'Product sense'], salary: '$128k-$158k', time: '3 skill moves' },
  { title: 'Analytics Lead', company: 'Lumen Health', fit: 71, steps: ['Data storytelling', 'Leadership', 'Strategy'], salary: '$119k-$149k', time: '3 skill moves' },
]
const toNumber = (value: unknown) => typeof value === 'object' && value !== null && 'low' in value ? Number(value.low) : Number(value)

export default function Page() {
  const [activeTab, setActiveTab] = useState('Path finder')
  const [query, setQuery] = useState('Machine learning engineer')
  const [skills, setSkills] = useState(demoSkills)
  const [paths, setPaths] = useState(demoPaths)
  const [connections, setConnections] = useState<Connection[]>([])
  const [savedPaths, setSavedPaths] = useState<Path[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('Demo graph')

  useEffect(() => {
    fetch('/api/overview').then(async (response) => {
      if (!response.ok) throw new Error('offline')
      const data = await response.json()
      setSkills(data.skills.map((skill: Skill) => ({ ...skill, level: toNumber(skill.level) })))
      setPaths(data.paths)
      setStatus(data.source === 'cognodb' ? 'CognoDB connected' : 'Demo graph')
    }).catch(() => setStatus('Demo graph'))
    fetch('/api/connections').then(async (response) => {
      if (!response.ok) throw new Error('offline')
      const data = await response.json()
      setConnections(data.connections)
    }).catch(() => setConnections([
      { from: 'Python', to: 'Machine learning', strength: 92 },
      { from: 'SQL', to: 'Experiment design', strength: 81 },
      { from: 'Machine learning', to: 'Model deployment', strength: 66 },
      { from: 'Data storytelling', to: 'Leadership', strength: 48 },
    ]))
  }, [])

  function findPaths(event: FormEvent) {
    event.preventDefault(); setLoading(true)
    fetch(`/api/paths?role=${encodeURIComponent(query)}`).then(async (response) => {
      if (!response.ok) throw new Error('offline')
      const data = await response.json(); setPaths(data.paths); setStatus(data.source === 'cognodb' ? 'CognoDB connected' : 'Demo graph')
    }).catch(() => setPaths(demoPaths)).finally(() => setLoading(false))
  }

  function toggleSaved(path: Path) {
    setSavedPaths((current) => current.some((saved) => saved.title === path.title) ? current.filter((saved) => saved.title !== path.title) : [...current, path])
  }

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#top"><span className="brand-mark">✦</span> skillpath</a><span className="tagline">career moves, mapped</span><div className="status"><span className="status-dot" />{status}<button className="avatar" aria-label="Open profile">TS</button></div></header>
    <main id="top">
      <section className="intro"><div><p className="eyebrow">PERSONAL CAREER GRAPH / 01</p><h1>Find the next<br /><em>right</em> move.</h1><p className="lede">SkillPath connects the dots between what you know and where you want to go.</p></div><div className="intro-art" aria-hidden="true"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="node node-a">SQL</span><span className="node node-b">ML</span><span className="node node-c">✦</span><span className="node node-d">PY</span></div></section>
      <nav className="tabs" aria-label="Explore"><button className={activeTab === 'Path finder' ? 'active' : ''} onClick={() => setActiveTab('Path finder')}>Path finder <span>→</span></button><button className={activeTab === 'My graph' ? 'active' : ''} onClick={() => setActiveTab('My graph')}>My graph</button><button className={activeTab === 'Saved' ? 'active' : ''} onClick={() => setActiveTab('Saved')}>Saved <span className="count">{savedPaths.length}</span></button></nav>
      {activeTab === 'Path finder' ? <>
        <section className="finder"><div className="section-label"><span>01</span><span>DESTINATION</span></div><form onSubmit={findPaths}><label htmlFor="role">I want to become a</label><div className="search-row"><input id="role" value={query} onChange={(event) => setQuery(event.target.value)} /><button className="find-button" type="submit" disabled={loading}>{loading ? 'Mapping...' : 'Map my path'} <span>↗</span></button></div></form><div className="suggestions"><span>Try a destination</span><button type="button" onClick={() => setQuery('Product data scientist')}>Product data scientist</button><button type="button" onClick={() => setQuery('Analytics lead')}>Analytics lead</button></div></section>
        <section className="workspace"><div className="section-label"><span>02</span><span>YOUR ADVANTAGE</span></div><div className="workspace-grid"><div className="skills-panel"><div className="panel-heading"><h2>Your signal</h2><span>4 skills mapped</span></div><p>Skills you already have, and how strongly they connect to the destination.</p>{skills.map((skill) => <div className="skill" key={skill.name}><div className="skill-meta"><span>{skill.name}</span><strong>{skill.level}%</strong></div><div className="meter"><span style={{ width: `${skill.level}%`, background: skill.color }} /></div></div>)}<button className="text-button" type="button">Edit my skills <span>→</span></button></div><div className="paths-panel"><div className="panel-heading"><h2>Possible paths</h2><span className="live-label"><span className="status-dot" /> ranked by fit</span></div><p>Multi-hop routes through the graph, with the shortest useful step surfaced first.</p>{paths.length ? paths.map((path, index) => <article className="path-card" key={path.title}><div className="rank">0{index + 1}</div><div className="path-main"><div className="path-top"><div><h3>{path.title}</h3><span>{path.company}</span></div><div className="fit"><strong>{path.fit}%</strong><small>fit</small></div></div><div className="path-steps">{path.steps.map((step, stepIndex) => <span key={step}>{step}{stepIndex < path.steps.length - 1 && <b>→</b>}</span>)}</div><div className="path-footer"><span>{path.time}</span><span>{path.salary}</span><button type="button" aria-label={`Save ${path.title}`} onClick={() => toggleSaved(path)}>{savedPaths.some((saved) => saved.title === path.title) ? '♥' : '♡'}</button></div></div></article>) : <div className="empty">No matching paths yet. Try a nearby role.</div>}</div></div></section>
        <section className="insight"><div className="insight-icon">⌁</div><div><p className="eyebrow">A NOTE FROM YOUR GRAPH</p><h2>Your unfair advantage is the bridge between data and people.</h2><p>People with your combination of Python, SQL, and storytelling tend to move into ML product roles 1.8x faster.</p></div><button className="circle-button" type="button" aria-label="Read insight">↗</button></section>
      </> : activeTab === 'My graph' ? <section className="graph-view"><div className="section-label"><span>03</span><span>LIVE SKILL GRAPH</span></div><div className="graph-heading"><div><h2>Your graph is growing.</h2><p>Direct connections from your current skills, loaded from CognoDB.</p></div><span className="graph-count">{connections.length} connections</span></div><div className="connection-list">{connections.map((connection) => <div className="connection" key={`${connection.from}-${connection.to}`}><span className="connection-node">{connection.from}</span><span className="connection-line"><i style={{ width: `${connection.strength}%` }} /><b>→</b></span><span className="connection-node">{connection.to}</span><strong>{connection.strength}%</strong></div>)}</div></section> : <section className="saved-view"><div className="section-label"><span>03</span><span>SAVED PATHS</span></div><div className="graph-heading"><div><h2>Paths worth keeping.</h2><p>Your shortlist stays here while you explore.</p></div><span className="graph-count">{savedPaths.length} saved</span></div>{savedPaths.length ? <div className="saved-list">{savedPaths.map((path) => <article className="path-card" key={path.title}><div className="rank">♡</div><div className="path-main"><div className="path-top"><div><h3>{path.title}</h3><span>{path.company}</span></div><div className="fit"><strong>{path.fit}%</strong><small>fit</small></div></div><div className="path-steps">{path.steps.map((step) => <span key={step}>{step}</span>)}</div><div className="path-footer"><span>{path.time}</span><span>{path.salary}</span><button type="button" onClick={() => toggleSaved(path)} aria-label={`Remove ${path.title}`}>♥</button></div></div></article>)}</div> : <div className="saved-empty">No saved paths yet. Return to Path finder and tap a heart to keep one here.</div>}</section>}
    </main>
    <footer><span>SKILLPATH / A GRAPH FOR HUMANS</span><span>Built with CognoDB · <a href="https://github.com/tharunhack/cognodb-assignment-2" target="_blank" rel="noreferrer">View the model ↗</a></span></footer>
  </div>
}
