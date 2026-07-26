import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { startTelemetry } from './lib/telemetry';
// Initialize OpenTelemetry SDK before starting Express or other modules
startTelemetry();

import { app } from './app';
import { config } from './config';
import { connectDatabase } from './lib/mongo';
import { ensureDefaultImageExists } from './lib/docker';
import { initSocketIO } from './sockets/socket.emitter';
import { autoImportSigNozAssets } from './services/signoz-import.service';

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDatabase();

    // 2. Pre-warm Docker runtime image asynchronously
    ensureDefaultImageExists().catch((err) => {
      console.warn('[Docker Startup Warning] Failed to pre-warm image:', err.message || err);
    });

    // 3. Auto-import SigNoz dashboard and alert rules asynchronously
    autoImportSigNozAssets().catch((err) => {
      console.warn('[SigNoz Auto-Import Warning] Skipped:', err.message || err);
    });

    // 3. Create HTTP & Socket.IO server
    const server = http.createServer(app);
    const io = new SocketIOServer(server, {
      cors: {
        origin: config.FRONTEND_URL,
        credentials: true,
      },
    });

    initSocketIO(io);

    server.listen(config.PORT, () => {
      console.log(`🚀 AXRAY backend running on port ${config.PORT} [${config.NODE_ENV}] with Socket.IO enabled`);
    });
  } catch (error) {
    console.error('❌ Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();
