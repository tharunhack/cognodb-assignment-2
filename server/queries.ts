export const queries = {
  overview: `MATCH (s:Skill) WITH s ORDER BY s.level DESC RETURN collect({name: s.name, level: s.level, color: s.color}) AS skills`,
  paths: `MATCH (role:Role) WHERE toLower(role.name) = toLower($role) MATCH (person:Person {id: $person}) MATCH p=(person)-[:HAS_SKILL]->(skill:Skill)-[:BUILDS_TOWARD|REQUIRES*1..2]->(role) WITH role, min(length(p)) AS hops, collect(DISTINCT skill.name) AS bridgeSkills RETURN role.name AS title, role.company AS company, role.salary AS salary, hops, bridgeSkills ORDER BY hops ASC LIMIT 3`,
  connections: `MATCH (person:Person {id: $person})-[r:HAS_SKILL]->(skill:Skill)-[:RELATED_TO]->(neighbor:Skill) RETURN DISTINCT skill.name AS from, neighbor.name AS to, r.level AS strength LIMIT 20`,
}