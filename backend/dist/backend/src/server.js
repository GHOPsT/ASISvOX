"use strict";
// ===============================
// PUNTO DE ENTRADA DEL SERVIDOR
// ===============================
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
// Iniciar el servidor
(0, app_1.startServer)().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map