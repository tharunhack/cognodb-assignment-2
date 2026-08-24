import 'dotenv/config'
import neo4j from 'neo4j-driver'

if (!process.env.COGNODB_URI || !process.env.COGNODB_PASSWORD) {
  console.error('Set COGNODB_URI and COGNODB_PASSWORD before seeding.')
  process.exit(1)
}

const driver = neo4j.driver(process.env.COGNODB_URI, neo4j.auth.basic(process.env.COGNODB_USER || 'cognodb', process.env.COGNODB_PASSWORD))
const session = driver.session()
const seed = `
CREATE CONSTRAINT person_id IF NOT EXISTS FOR (n:Person) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT skill_name IF NOT EXISTS FOR (n:Skill) REQUIRE n.name IS UNIQUE;
CREATE CONSTRAINT role_name IF NOT EXISTS FOR (n:Role) REQUIRE n.name IS UNIQUE;
MERGE (p:Person {id: 'taylor-stone'}) SET p.name = 'Taylor Stone', p.headline = 'Analytics engineer'
WITH p
UNWIND [
  {name: 'Python', level: 92, color: '#e2b93b'}, {name: 'SQL', level: 81, color: '#3ba8a0'},
  {name: 'Machine learning', level: 66, color: '#e8754c'}, {name: 'Data storytelling', level: 48, color: '#7087c8'},
  {name: 'Experiment design', level: 34, color: '#c58dba'}, {name: 'Model deployment', level: 24, color: '#6aa4b5'},
  {name: 'Product sense', level: 20, color: '#d58b4f'}, {name: 'Leadership', level: 12, color: '#9eaa67'}
] AS item MERGE (s:Skill {name: item.name}) SET s.level = item.level, s.color = item.color MERGE (p)-[:HAS_SKILL {level: item.level}]->(s)
WITH p
UNWIND [
  {name: 'Machine Learning Engineer', company: 'Northstar Labs', salary: '$142k-$176k'},
  {name: 'Product Data Scientist', company: 'Arc & Arrow', salary: '$128k-$158k'},
  {name: 'Analytics Lead', company: 'Lumen Health', salary: '$119k-$149k'}
] AS item MERGE (r:Role {name: item.name}) SET r.company = item.company, r.salary = item.salary MERGE (c:Company {name: item.company}) MERGE (r)-[:AT_COMPANY]->(c)
WITH p
MATCH (ml:Skill {name: 'Machine learning'}), (python:Skill {name: 'Python'}), (sql:Skill {name: 'SQL'}), (story:Skill {name: 'Data storytelling'}), (exp:Skill {name: 'Experiment design'}), (deploy:Skill {name: 'Model deployment'}), (product:Skill {name: 'Product sense'}), (lead:Skill {name: 'Leadership'}), (eng:Role {name: 'Machine Learning Engineer'}), (scientist:Role {name: 'Product Data Scientist'}), (analytics:Role {name: 'Analytics Lead'})
MERGE (python)-[:RELATED_TO]->(ml) MERGE (ml)-[:RELATED_TO]->(deploy) MERGE (sql)-[:RELATED_TO]->(exp) MERGE (exp)-[:RELATED_TO]->(product) MERGE (story)-[:RELATED_TO]->(lead)
MERGE (ml)-[:BUILDS_TOWARD]->(eng) MERGE (deploy)-[:REQUIRES]->(eng) MERGE (sql)-[:BUILDS_TOWARD]->(scientist) MERGE (exp)-[:REQUIRES]->(scientist) MERGE (story)-[:BUILDS_TOWARD]->(analytics) MERGE (lead)-[:REQUIRES]->(analytics)
`

try {
  for (const statement of seed.split(';').map((part) => part.trim()).filter(Boolean)) await session.run(statement)
  console.log('Seed complete: Taylor Stone career graph loaded.')
} finally {
  await session.close()
  await driver.close()
}