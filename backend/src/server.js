import { initDb } from './db/db.js';
import app from './app.js';

const PORT = 3001;

async function startServer() {
  // try initialize
  try {
    // we dont store the db instance here (initDb returns db)
    await initDb();

    app.listen(PORT, () => {
      console.log(`quai_antique API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

