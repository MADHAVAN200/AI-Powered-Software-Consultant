import type { Database } from "./types";

type PublicSchema = Database["public"];
type TableName = keyof PublicSchema["Tables"];
type Row<T extends TableName> = PublicSchema["Tables"][T]["Row"];
type Insert<T extends TableName> = PublicSchema["Tables"][T]["Insert"];
type Update<T extends TableName> = PublicSchema["Tables"][T]["Update"];

let sqliteDbInstance: any = null;

class SQLite3Database {
  private inner: any;

  constructor(path: string, sqliteModule: any) {
    this.inner = new sqliteModule.Database(path);
  }

  exec(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.inner.exec(sql, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  prepare(sql: string) {
    const inner = this.inner;
    return {
      all(params: any[] = []): Promise<any[]> {
        return new Promise((resolve, reject) => {
          inner.all(sql, params, (err: any, rows: any[]) => {
            if (err) reject(err);
            else resolve(rows || []);
          });
        });
      },
      get(params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
          inner.get(sql, params, (err: any, row: any) => {
            if (err) reject(err);
            else resolve(row || null);
          });
        });
      },
      run(params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
          inner.run(sql, params, function (this: any, err: any) {
            if (err) reject(err);
            else resolve({ changes: this?.changes || 0, lastID: this?.lastID || null });
          });
        });
      }
    };
  }
}

async function getDb() {
  if (typeof window !== 'undefined') return null;
  if (sqliteDbInstance) return sqliteDbInstance;

  // Lazy-load server modules to prevent bundler errors on the client
  const sqlite3 = await import('sqlite3');
  const { join } = await import('node:path');
  const dbPath = join(process.cwd(), 'db.sqlite3');
  
  const verboseSqlite = sqlite3.default.verbose();
  sqliteDbInstance = new SQLite3Database(dbPath, verboseSqlite);

  // Initialize SQLite schema
  await sqliteDbInstance.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      full_name TEXT,
      avatar_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    
    CREATE TABLE IF NOT EXISTS user_roles (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      role TEXT,
      UNIQUE(user_id, role)
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      owner_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active',
      tech_stack TEXT DEFAULT '[]',
      repo_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS project_members (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      user_id TEXT,
      role TEXT DEFAULT 'viewer',
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(project_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS project_overview (
      id TEXT PRIMARY KEY,
      project_id TEXT UNIQUE,
      client_name TEXT,
      business_domain TEXT,
      industry TEXT,
      project_type TEXT,
      expected_users TEXT,
      expected_traffic TEXT,
      tech_preference TEXT,
      methodology TEXT,
      timeline TEXT,
      budget TEXT,
      risk_level TEXT,
      problem_statement TEXT,
      current_challenges TEXT,
      business_opportunity TEXT,
      expected_outcome TEXT,
      ai_consultant_summary TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'active',
      version TEXT DEFAULT '1.0.0',
      progress INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS stakeholders (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      person_name TEXT NOT NULL,
      email TEXT,
      role TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS requirements (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      code TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'draft',
      category TEXT DEFAULT 'functional',
      module TEXT,
      ai_estimated_effort TEXT,
      business_value TEXT,
      created_by TEXT,
      complexity TEXT,
      inputs TEXT,
      outputs TEXT,
      validation TEXT,
      version INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS requirement_dependencies (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      requirement_id TEXT,
      depends_on_id TEXT,
      dependency_type TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_stories (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      requirement_id TEXT,
      code TEXT NOT NULL,
      as_role TEXT NOT NULL,
      i_want TEXT NOT NULL,
      so_that TEXT,
      story_points INTEGER,
      sprint TEXT,
      status TEXT DEFAULT 'draft',
      priority TEXT DEFAULT 'medium',
      risk TEXT,
      epic TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS acceptance_criteria (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      requirement_id TEXT,
      story_id TEXT,
      given_text TEXT,
      when_text TEXT,
      then_text TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS non_functional_requirements (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      category TEXT,
      metric TEXT,
      target_value TEXT,
      estimated_effort INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ai_analyses (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      analysis_type TEXT,
      content TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS requirement_versions (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      requirement_id TEXT,
      version INTEGER,
      content TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS approvals (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      requirement_id TEXT,
      stage TEXT,
      status TEXT,
      reviewer_id TEXT,
      comments TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS requirement_comments (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      requirement_id TEXT,
      user_id TEXT,
      comment_text TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS requirement_attachments (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      requirement_id TEXT,
      file_name TEXT,
      file_url TEXT,
      file_size INTEGER,
      file_type TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      title TEXT NOT NULL,
      type TEXT,
      status TEXT DEFAULT 'draft',
      content_md TEXT,
      version INTEGER DEFAULT 1,
      owner_id TEXT,
      linked_artifact_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS document_sections (
      id TEXT PRIMARY KEY,
      document_id TEXT,
      title TEXT,
      content_md TEXT,
      position INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS document_versions (
      id TEXT PRIMARY KEY,
      document_id TEXT,
      version INTEGER,
      content_md TEXT,
      created_by TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS document_reviews (
      id TEXT PRIMARY KEY,
      document_id TEXT,
      reviewer_id TEXT,
      status TEXT,
      comments TEXT,
      reviewed_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS document_approvals (
      id TEXT PRIMARY KEY,
      document_id TEXT,
      stage TEXT,
      status TEXT,
      reviewer_id TEXT,
      comments TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS document_comments (
      id TEXT PRIMARY KEY,
      document_id TEXT,
      section_id TEXT,
      user_id TEXT,
      comment_text TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS document_templates (
      id TEXT PRIMARY KEY,
      name TEXT,
      type TEXT,
      content_md TEXT,
      description TEXT,
      is_global INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS artifacts (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      created_by TEXT,
      kind TEXT,
      title TEXT NOT NULL,
      content_md TEXT,
      metadata TEXT DEFAULT '{}',
      score INTEGER,
      version INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quality_scores (
      id TEXT PRIMARY KEY,
      project_id TEXT UNIQUE,
      requirements INTEGER DEFAULT 0,
      architecture INTEGER DEFAULT 0,
      documentation INTEGER DEFAULT 0,
      security INTEGER DEFAULT 0,
      ui INTEGER DEFAULT 0,
      database INTEGER DEFAULT 0,
      apis INTEGER DEFAULT 0,
      testing INTEGER DEFAULT 0,
      maintainability INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      actor_id TEXT,
      action TEXT NOT NULL,
      target TEXT,
      metadata TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  return sqliteDbInstance;
}

function serializeValue(val: any): any {
  if (val === undefined || val === null) return null;
  if (typeof val === 'object') return JSON.stringify(val);
  return val;
}

function deserializeRow(row: any): any {
  if (!row) return row;
  const out = { ...row };
  for (const [k, v] of Object.entries(out)) {
    if (typeof v === 'string') {
      if ((v.startsWith('{') && v.endsWith('}')) || (v.startsWith('[') && v.endsWith(']'))) {
        try {
          out[k] = JSON.parse(v);
        } catch {
          // ignore
        }
      }
    }
  }
  return out;
}

export class SQLiteQueryBuilder<T extends TableName> {
  private tableName: T;
  private method: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private selectColumns: string[] = ['*'];
  private insertData: any = null;
  private updateData: any = null;
  private isUpsert: boolean = false;
  private upsertOnConflict: string = 'id';
  private conditions: { col: string; val: any; op: '=' | '!=' | 'in' | 'like' }[] = [];
  private orFilter: string | null = null;
  private orderCol: string | null = null;
  private orderAsc: boolean = true;
  private limitCount: number | null = null;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;
  private countOption: string | null = null;
  private isHead: boolean = false;

  constructor(tableName: T) {
    this.tableName = tableName;
  }

  select(columns: string = '*', options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }) {
    if (this.method === 'select') {
      this.method = 'select';
    }
    this.selectColumns = columns.split(',').map(c => c.trim());
    if (options?.count) this.countOption = options.count;
    if (options?.head) this.isHead = options.head;
    return this;
  }

  insert(data: Insert<T> | Insert<T>[]) {
    this.method = 'insert';
    this.insertData = data;
    this.isUpsert = false;
    return this;
  }

  update(data: Update<T>) {
    this.method = 'update';
    this.updateData = data;
    return this;
  }

  delete() {
    this.method = 'delete';
    return this;
  }

  upsert(data: Insert<T> | Insert<T>[], opts?: { onConflict?: keyof Row<T> }) {
    this.method = 'insert';
    this.insertData = data;
    this.isUpsert = true;
    this.upsertOnConflict = (opts?.onConflict as string) || 'id';
    return this;
  }

  eq(col: keyof Row<T>, val: any) {
    this.conditions.push({ col: col as string, val, op: '=' });
    return this;
  }

  neq(col: keyof Row<T>, val: any) {
    this.conditions.push({ col: col as string, val, op: '!=' });
    return this;
  }

  like(col: keyof Row<T>, val: any) {
    this.conditions.push({ col: col as string, val, op: 'like' });
    return this;
  }

  in(col: keyof Row<T>, vals: any[]) {
    this.conditions.push({ col: col as string, val: vals, op: 'in' });
    return this;
  }

  or(filterStr: string) {
    this.orFilter = filterStr;
    return this;
  }

  order(col: keyof Row<T>, opts?: { ascending?: boolean }) {
    this.orderCol = col as string;
    this.orderAsc = opts?.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  async then<TResult1 = { data: (Row<T>[] & Row<T> & any) | null; count: number | null; error: { message: string } | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: (Row<T>[] & Row<T> & any) | null; count: number | null; error: { message: string } | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    try {
      if (typeof window !== 'undefined') {
        const fallbackRes = { data: (this.isSingle ? null : []) as any, count: 0, error: null };
        if (onfulfilled) return onfulfilled(fallbackRes);
        return fallbackRes as any;
      }

      const activeDb = await getDb();
      if (!activeDb) {
        throw new Error('Database initialization failed');
      }

      let data: any = null;
      let count: number | null = null;

      // Check if we need to run a count query
      if (this.countOption) {
        let countSql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
        const countParams: any[] = [];
        if (this.conditions.length > 0) {
          countSql += ' WHERE ' + this.conditions.map(c => {
            if (c.op === 'in') {
              const placeholders = c.val.map(() => '?').join(', ');
              countParams.push(...c.val);
              return `${c.col} IN (${placeholders})`;
            }
            countParams.push(c.val);
            return `${c.col} ${c.op} ?`;
          }).join(' AND ');
        }
        const countRow = await activeDb.prepare(countSql).get(countParams);
        count = countRow ? countRow.count : 0;
      }

      if (this.isHead) {
        data = null;
      } else if (this.method === 'select') {
        let selectCols = '*';
        if (this.selectColumns && this.selectColumns.length > 0 && this.selectColumns[0] !== '*') {
          selectCols = this.selectColumns.join(', ');
        }
        let sql = `SELECT ${selectCols} FROM ${this.tableName}`;
        const params: any[] = [];

        if (this.conditions.length > 0) {
          sql += ' WHERE ' + this.conditions.map(c => {
            if (c.op === 'in') {
              const placeholders = c.val.map(() => '?').join(', ');
              params.push(...c.val);
              return `${c.col} IN (${placeholders})`;
            }
            params.push(c.val);
            return `${c.col} ${c.op} ?`;
          }).join(' AND ');
        }

        if (this.orFilter) {
          const parts = this.orFilter.split(',');
          const orConditions = parts.map(part => {
            const [col, op, val] = part.split('.');
            if (op === 'eq') {
              let parsedVal: any = val;
              if (val === 'true') parsedVal = 1;
              if (val === 'false') parsedVal = 0;
              if (val === 'null') return `${col} IS NULL`;
              params.push(parsedVal);
              return `${col} = ?`;
            }
            return '';
          }).filter(Boolean);

          if (orConditions.length > 0) {
            if (this.conditions.length > 0) {
              sql += ` AND (${orConditions.join(' OR ')})`;
            } else {
              sql += ` WHERE (${orConditions.join(' OR ')})`;
            }
          }
        }

        if (this.orderCol) {
          sql += ` ORDER BY ${this.orderCol} ${this.orderAsc ? 'ASC' : 'DESC'}`;
        }
        if (this.limitCount !== null) {
          sql += ` LIMIT ${this.limitCount}`;
        }

        const rawRows = await activeDb.prepare(sql).all(params);
        console.log(`[Local DB] SELECT: ${sql} | Params: ${JSON.stringify(params)} | Found: ${rawRows.length} rows`);
        const rows = rawRows.map(deserializeRow);
        if (this.isSingle || this.isMaybeSingle) {
          data = rows[0] || null;
        } else {
          data = rows;
        }
      } else if (this.method === 'insert') {
        const items = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
        const results: any[] = [];

        for (const item of items) {
          if (this.isUpsert) {
            const conflictCol = this.upsertOnConflict || 'id';
            const conflictVal = item[conflictCol];
            let exists = false;
            if (conflictVal !== undefined && conflictVal !== null) {
              const row = await activeDb.prepare(`SELECT 1 FROM ${this.tableName} WHERE ${conflictCol} = ?`).get([conflictVal]);
              exists = !!row;
            }

            if (exists) {
              const keys = Object.keys(item).filter(k => k !== conflictCol);
              const sets = keys.map(k => `${k} = ?`).join(', ');
              const params = keys.map(k => serializeValue(item[k]));
              params.push(conflictVal);
              const sql = `UPDATE ${this.tableName} SET ${sets} WHERE ${conflictCol} = ?`;
              console.log(`[Local DB] UPSERT (UPDATE): ${sql} | Params: ${JSON.stringify(params)}`);
              await activeDb.prepare(sql).run(params);
              results.push(deserializeRow(item));
            } else {
              const keys = Object.keys(item);
              if (!item.id && keys.indexOf('id') === -1) {
                item.id = crypto.randomUUID();
                keys.push('id');
              }
              const placeholders = keys.map(() => '?').join(', ');
              const params = keys.map(k => serializeValue(item[k]));
              const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
              console.log(`[Local DB] UPSERT (INSERT): ${sql} | Params: ${JSON.stringify(params)}`);
              await activeDb.prepare(sql).run(params);
              results.push(deserializeRow(item));
            }
          } else {
            const keys = Object.keys(item);
            if (!item.id && keys.indexOf('id') === -1) {
              item.id = crypto.randomUUID();
              keys.push('id');
            }
            const placeholders = keys.map(() => '?').join(', ');
            const params = keys.map(k => serializeValue(item[k]));
            const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
            console.log(`[Local DB] INSERT: ${sql} | Params: ${JSON.stringify(params)}`);
            await activeDb.prepare(sql).run(params);
            results.push(deserializeRow(item));
          }
        }

        if (this.isSingle) {
          data = results[0] || null;
        } else {
          data = results;
        }
      } else if (this.method === 'update') {
        const keys = Object.keys(this.updateData);
        const sets = keys.map(k => `${k} = ?`).join(', ');
        const params = keys.map(k => serializeValue(this.updateData[k]));
        
        let sql = `UPDATE ${this.tableName} SET ${sets}`;
        if (this.conditions.length > 0) {
          sql += ' WHERE ' + this.conditions.map(c => {
            if (c.op === 'in') {
              const placeholders = c.val.map(() => '?').join(', ');
              params.push(...c.val);
              return `${c.col} IN (${placeholders})`;
            }
            params.push(c.val);
            return `${c.col} ${c.op} ?`;
          }).join(' AND ');
        }
        console.log(`[Local DB] UPDATE: ${sql} | Params: ${JSON.stringify(params)}`);
        await activeDb.prepare(sql).run(params);

        let selectSql = `SELECT * FROM ${this.tableName}`;
        const selectParams: any[] = [];
        if (this.conditions.length > 0) {
          selectSql += ' WHERE ' + this.conditions.map(c => {
            if (c.op === 'in') {
              const placeholders = c.val.map(() => '?').join(', ');
              selectParams.push(...c.val);
              return `${c.col} IN (${placeholders})`;
            }
            selectParams.push(c.val);
            return `${c.col} ${c.op} ?`;
          }).join(' AND ');
        }
        const rawRows = await activeDb.prepare(selectSql).all(selectParams);
        const rows = rawRows.map(deserializeRow);
        if (this.isSingle || this.isMaybeSingle) {
          data = rows[0] || null;
        } else {
          data = rows;
        }
      } else if (this.method === 'delete') {
        let sql = `DELETE FROM ${this.tableName}`;
        const params: any[] = [];
        if (this.conditions.length > 0) {
          sql += ' WHERE ' + this.conditions.map(c => {
            if (c.op === 'in') {
              const placeholders = c.val.map(() => '?').join(', ');
              params.push(...c.val);
              return `${c.col} IN (${placeholders})`;
            }
            params.push(c.val);
            return `${c.col} ${c.op} ?`;
          }).join(' AND ');
        }
        console.log(`[Local DB] DELETE: ${sql} | Params: ${JSON.stringify(params)}`);
        await activeDb.prepare(sql).run(params);
        data = null;
      }

      const res = { data, count, error: null };
      if (onfulfilled) return onfulfilled(res);
      return res as any;
    } catch (e: any) {
      console.error('[Local DB SQL error]', e);
      const res = { data: null, count: null, error: { message: e.message } };
      if (onrejected) return onrejected(res);
      return res as any;
    }
  }
}

function getLocalSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('aristotle.session');
    if (!raw) return null;
    const session = JSON.parse(raw);
    const roleId = session.roleId || 'project_manager';
    return {
      access_token: 'mock.jwt.' + roleId,
      user: {
        id: roleId,
        email: session.username || 'pm@aristotle.dev',
        user_metadata: {
          full_name: roleId.split('_').map((w: string) => w[0].toUpperCase() + w.slice(1)).join(' '),
        }
      }
    };
  } catch {
    return null;
  }
}

export const db = {
  auth: {
    getSession: async () => {
      const s = getLocalSession();
      return { data: { session: s }, error: null as { message: string } | null };
    },
    getUser: async () => {
      const s = getLocalSession();
      return { data: { user: s ? s.user : null }, error: null as { message: string } | null };
    },
    signInAnonymously: async () => {
      const user = {
        id: 'anonymous-user-id',
        email: 'anonymous@aristotle.dev',
        user_metadata: {
          full_name: 'Anonymous User'
        }
      };
      return { data: { user }, error: null as { message: string } | null };
    },
    onAuthStateChange: (callback: any) => {
      const s = getLocalSession();
      setTimeout(() => {
        callback('SIGNED_IN', s);
      }, 0);
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    },
    signInWithOAuth: async () => {
      return { data: { redirected: false }, error: null as { message: string } | null };
    },
    signOut: async () => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('aristotle.session');
        window.location.href = '/login';
      }
      return { error: null as { message: string } | null };
    },
    setSession: async () => {
      return { data: { session: null }, error: null as { message: string } | null };
    },
    getClaims: async (token: string) => {
      const parts = token.split('.');
      const roleId = parts[2] || 'project_manager';
      return {
        data: {
          claims: {
            sub: roleId,
            email: roleId + '@aristotle.dev',
            role: roleId === 'project_manager' ? 'admin' : 'member'
          }
        },
        error: null as { message: string } | null
      };
    }
  },
  from: <T extends TableName>(tableName: T) => {
    return new SQLiteQueryBuilder<T>(tableName);
  }
};
