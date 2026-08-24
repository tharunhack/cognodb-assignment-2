import Fastify from 'fastify'
import cors from '@fastify/cors'
import neo4j, { Driver } from 'neo4j-driver'
import { queries } from './queries.js'

export const app = Fastify({ logger: true })
await app.register(cors, { origin: true })

let driver: Driver | undefined
if (process.env.COGNODB_URI && process.env.COGNODB_PASSWORD) {
  driver = neo4j.driver(process.env.COGNODB_URI, neo4j.auth.basic(process.env.COGNODB_USER || 'cognodb', process.env.COGNODB_PASSWORD))
}

const demoSkills = [
  { name: 'Python', level: 92, color: '#e2b93b' }, { name: 'SQL', level: 81, color: '#3ba8a0' },
  { name: 'Machine learning', level: 66, color: '#e8754c' }, { name: 'Data storytelling', level: 48, color: '#7087c8' },
]
const demoPaths = [
  { title: 'Machine Learning Engineer', company: 'Northstar Labs', fit: 87, steps: ['Python', 'ML systems', 'Model deployment'], salary: '$142k-$176k', time: '2 skill moves' },
  { title: 'Product Data Scientist', company: 'Arc & Arrow', fit: 76, steps: ['SQL', 'Experiment design', 'Product sense'], salary: '$128k-$158k', time: '3 skill moves' },
  { title: 'Analytics Lead', company: 'Lumen Health', fit: 71, steps: ['Data storytelling', 'Leadership', 'Strategy'], salary: '$119k-$149k', time: '3 skill moves' },
]
const toNumber = (value: unknown) => neo4j.isInt(value) ? value.toNumber() : Number(value)

app.get('/api/overview', async (_request, reply) => {
  if (!driver) return reply.send({ source: 'demo', skills: demoSkills, paths: demoPaths })
  try {
    const result = await driver.executeQuery(queries.overview)
    const skills = (result.records[0]?.get('skills') || []).map((skill: { name: string; level: unknown; color: string }) => ({ ...skill, level: toNumber(skill.level) }))
    return reply.send({ source: 'cognodb', skills, paths: demoPaths })
  } catch { return reply.send({ source: 'demo', skills: demoSkills, paths: demoPaths }) }
})

app.get<{ Querystring: { role?: string } }>('/api/paths', async (request, reply) => {
  const role = String(request.query.role || 'Machine learning engineer')
  if (!driver) return reply.send({ source: 'demo', paths: demoPaths })
  try {
    const result = await driver.executeQuery(queries.paths, { role, person: 'taylor-stone' })
    const paths = result.records.map((record) => { const hops = toNumber(record.get('hops')); return { title: record.get('title'), company: record.get('company'), fit: Math.max(58, 100 - hops * 8), steps: record.get('bridgeSkills'), salary: record.get('salary'), time: `${hops} skill moves` } })
    return reply.send({ source: 'cognodb', paths })
  } catch { return reply.send({ source: 'demo', paths: demoPaths }) }
})

app.get('/api/connections', async (_request, reply) => {
  if (!driver) return reply.send({ source: 'demo', connections: [] })
  try {
    const result = await driver.executeQuery(queries.connections, { person: 'taylor-stone' })
    const connections = result.records.map((record) => ({ from: record.get('from'), to: record.get('to'), strength: toNumber(record.get('strength')) }))
    return reply.send({ source: 'cognodb', connections })
  } catch { return reply.send({ source: 'demo', connections: [] }) }
})

app.get('/api/health', async (_request, reply) => {
  if (!driver) return reply.send({ ok: true, source: 'demo' })
  try { await driver.verifyConnectivity(); return reply.send({ ok: true, source: 'cognodb' }) }
  catch { return reply.code(503).send({ ok: false, source: 'cognodb' }) }
})
