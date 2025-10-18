// ===============================
// PUNTO DE ENTRADA DEL SERVIDOR
// ===============================

import { startServer } from './app';

// Iniciar el servidor
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});