import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/database.js';
import { env } from './src/config/env.js';
import { logger } from './src/utils/logger.js';

// ─── Connect DB then Start Server ─────────────────────────────────────────
await connectDB();

const server = app.listen(env.port, () => {
    logger.info(`🚀 Server started on http://localhost:${env.port} [${env.nodeEnv}]`);
});

// ─── Graceful Shutdown ─────────────────────────────────────────────────────
const shutdown = (signal) => {
    logger.warn(`${signal} received — shutting down gracefully`);
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });

    // Force exit if not closed in 10s
    setTimeout(() => {
        logger.error('Forcing process exit after timeout');
        process.exit(1);
    }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
    shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    shutdown('uncaughtException');
});
