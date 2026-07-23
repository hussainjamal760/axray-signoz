import { startTelemetry } from './lib/telemetry';
// Initialize OpenTelemetry SDK before starting Express or other modules
startTelemetry();

import { app } from './app';
import { config } from './config';
import { connectDatabase } from './lib/mongo';
import { ensureDefaultImageExists } from './lib/docker';

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDatabase();

    // 2. Pre-warm Docker runtime image asynchronously
    ensureDefaultImageExists().catch((err) => {
      console.warn('[Docker Startup Warning] Failed to pre-warm image:', err.message || err);
    });

    // 3. Start HTTP server
    app.listen(config.PORT, () => {
      console.log(`🚀 AXRAY backend running on port ${config.PORT} [${config.NODE_ENV}]`);
    });
  } catch (error) {
    console.error('❌ Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();
