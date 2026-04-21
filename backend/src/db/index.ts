import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { Child, ChildRow } from '../types/index'

const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(process.cwd(), 'data', 'children.db')

const dir = path.dirname(dbPath)
fs.mkdirSync(dir, { recursive: true })

const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS children (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    data_nascimento TEXT NOT NULL,
    bairro TEXT NOT NULL,
    responsavel TEXT NOT NULL,
    saude TEXT,
    educacao TEXT,
    assistencia_social TEXT,
    revisado INTEGER NOT NULL DEFAULT 0,
    revisado_por TEXT,
    revisado_em TEXT
  )
`)

function seedDatabase(): void {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM children').get() as { count: number }
  if (countRow.count > 0) {
    return
  }

  // Candidate paths in priority order:
  // 1. cwd/seed.json          — Docker (build context = repo root, WORKDIR /app)
  // 2. __dirname/../../seed.json — compiled: dist/db -> dist -> root of backend
  // 3. __dirname/../../../seed.json — tsx dev: src/db -> src -> backend -> repo root
  const candidates = [
    path.join(process.cwd(), 'seed.json'),
    path.join(__dirname, '..', '..', 'seed.json'),
    path.join(__dirname, '..', '..', '..', 'seed.json'),
  ]

  const seedPath = candidates.find(fs.existsSync)
  if (!seedPath) {
    console.warn('seed.json not found, skipping seed.')
    return
  }

  const raw = fs.readFileSync(seedPath, 'utf-8')
  const children: Child[] = JSON.parse(raw)

  const insert = db.prepare(`
    INSERT INTO children (
      id, nome, data_nascimento, bairro, responsavel,
      saude, educacao, assistencia_social,
      revisado, revisado_por, revisado_em
    ) VALUES (
      @id, @nome, @data_nascimento, @bairro, @responsavel,
      @saude, @educacao, @assistencia_social,
      @revisado, @revisado_por, @revisado_em
    )
  `)

  const insertMany = db.transaction((items: Child[]) => {
    for (const child of items) {
      insert.run({
        id: child.id,
        nome: child.nome,
        data_nascimento: child.data_nascimento,
        bairro: child.bairro,
        responsavel: child.responsavel,
        saude: child.saude !== null ? JSON.stringify(child.saude) : null,
        educacao: child.educacao !== null ? JSON.stringify(child.educacao) : null,
        assistencia_social:
          child.assistencia_social !== null ? JSON.stringify(child.assistencia_social) : null,
        revisado: child.revisado ? 1 : 0,
        revisado_por: child.revisado_por ?? null,
        revisado_em: child.revisado_em ?? null,
      })
    }
  })

  insertMany(children)
  console.info(`Seeded ${children.length} children into the database.`)
}

export function rowToChild(row: ChildRow): Child {
  return {
    id: row.id,
    nome: row.nome,
    data_nascimento: row.data_nascimento,
    bairro: row.bairro,
    responsavel: row.responsavel,
    saude: row.saude ? JSON.parse(row.saude) : null,
    educacao: row.educacao ? JSON.parse(row.educacao) : null,
    assistencia_social: row.assistencia_social ? JSON.parse(row.assistencia_social) : null,
    revisado: row.revisado === 1,
    revisado_por: row.revisado_por,
    revisado_em: row.revisado_em,
  }
}

export function getAllChildren(): ChildRow[] {
  return db.prepare('SELECT * FROM children').all() as ChildRow[]
}

export function getChildById(id: string): ChildRow | undefined {
  return db.prepare('SELECT * FROM children WHERE id = ?').get(id) as ChildRow | undefined
}

export function updateChildReview(
  id: string,
  revisado_por: string,
  revisado_em: string
): void {
  db.prepare(
    'UPDATE children SET revisado = 1, revisado_por = ?, revisado_em = ? WHERE id = ?'
  ).run(revisado_por, revisado_em, id)
}

seedDatabase()

export { db }
