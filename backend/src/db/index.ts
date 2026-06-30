import path from 'path';
import fs from 'fs';

const dbDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'db.json');

export interface SolutionRecord {
  id?: number;
  platform: string;
  title: string;
  slug: string;
  language: string;
  github_url: string;
  linkedin_posted?: number;
  created_at?: string;
}

interface DatabaseStructure {
  solutions: SolutionRecord[];
  settings: Record<string, string>;
}

const defaultDb: DatabaseStructure = { solutions: [], settings: {} };

function readDb(): DatabaseStructure {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read db.json, returning default.', error);
    return defaultDb;
  }
}

function writeDb(data: DatabaseStructure) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

export function saveSolution(solution: SolutionRecord): number {
  const db = readDb();
  const newId = db.solutions.length > 0 ? (db.solutions[db.solutions.length - 1].id || 0) + 1 : 1;
  const newSolution = {
    ...solution,
    id: newId,
    linkedin_posted: solution.linkedin_posted ?? 0,
    created_at: new Date().toISOString()
  };
  db.solutions.push(newSolution);
  writeDb(db);
  return newId;
}

export function checkSolutionExists(platform: string, title: string): boolean {
  const db = readDb();
  return db.solutions.some(s => s.platform === platform && s.title === title);
}

export function getSetting(key: string, defaultValue: string = ''): string {
  const db = readDb();
  return db.settings[key] !== undefined ? db.settings[key] : defaultValue;
}

export function setSetting(key: string, value: string): void {
  const db = readDb();
  db.settings[key] = value;
  writeDb(db);
}

export default {
  prepare: (query: string) => {
    // A tiny mock of better-sqlite3 prepare just for the /solutions endpoint
    return {
      all: () => {
        const db = readDb();
        return db.solutions.slice().reverse().slice(0, 5); // Return last 5 solutions
      }
    };
  }
};
