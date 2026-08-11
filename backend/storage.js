import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Reads local persistent JSON database
 */
export function loadLocalDB(defaultPlan) {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      console.log('💾 Persistent database loaded from backend/data/db.json');
      return {
        plan: data.plan || defaultPlan,
        workOrders: data.workOrders || []
      };
    }
  } catch (err) {
    console.error('Error reading local db.json:', err);
  }

  // Initial fresh database state (no work orders until Zone Counselor dispatches)
  const initial = {
    plan: defaultPlan,
    workOrders: []
  };

  saveLocalDB(initial.plan, initial.workOrders);
  return initial;
}

/**
 * Saves plan and workOrders into backend/data/db.json
 */
export function saveLocalDB(plan, workOrders) {
  try {
    const data = {
      plan,
      workOrders,
      lastSavedAt: new Date().toISOString()
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to local db.json:', err);
  }
}
