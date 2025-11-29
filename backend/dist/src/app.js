"use strict";
// ===============================
// SERVIDOR PRINCIPAL - BACKEND
// ===============================
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = require("./middleware/auth");
// Importar rutas
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const entity_routes_1 = __importDefault(require("./routes/entity.routes"));
const teacher_routes_1 = __importDefault(require("./routes/teacher.routes"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const class_routes_1 = __importDefault(require("./routes/class.routes"));
const master_routes_1 = __importDefault(require("./routes/master.routes"));
const attendance_routes_1 = __importDefault(require("./routes/attendance.routes"));
const assessment_routes_1 = __importDefault(require("./routes/assessment.routes"));
const grading_routes_1 = __importDefault(require("./routes/grading.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const statistics_routes_1 = __importDefault(require("./routes/statistics.routes"));
const voice_routes_1 = __importDefault(require("./routes/voice.routes"));
// Cargar variables de entorno
dotenv_1.default.config();
// Crear aplicación Express
const app = (0, express_1.default)();
// ===============================
// MIDDLEWARE GLOBAL
// ===============================
// Seguridad
app.use((0, helmet_1.default)());
// CORS
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
// Logging
app.use((0, morgan_1.default)('combined'));
// Parser de JSON
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// ===============================
// RUTAS PÚBLICAS
// ===============================
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'ASISvOX Backend is running',
        timestamp: new Date().toISOString(),
        version: process.env.API_VERSION || '1.0.0',
    });
});
// Rutas de autenticación (no requieren token)
app.use('/api/auth', auth_routes_1.default);
// ===============================
// MIDDLEWARE DE AUTENTICACIÓN
// ===============================
// Aplicar middleware de auth a todas las rutas protegidas
app.use('/api', auth_1.authMiddleware);
// ===============================
// RUTAS PROTEGIDAS
// ===============================
app.use('/api/users', user_routes_1.default);
app.use('/api/entities', entity_routes_1.default);
app.use('/api/teachers', teacher_routes_1.default);
app.use('/api/students', student_routes_1.default);
app.use('/api/classes', class_routes_1.default);
app.use('/api/master', master_routes_1.default);
app.use('/api/attendance', attendance_routes_1.default);
app.use('/api/assessments', assessment_routes_1.default);
app.use('/api/grades', grading_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use('/api/statistics', statistics_routes_1.default);
app.use('/api/voice', voice_routes_1.default);
// ===============================
// MANEJO DE ERRORES
// ===============================
// Ruta no encontrada
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
    });
});
// Middleware de manejo de errores
app.use(errorHandler_1.errorHandler);
// ===============================
// CONFIGURACIÓN DEL SERVIDOR
// ===============================
const PORT = process.env.PORT || 3001;
// Función para iniciar el servidor
const startServer = async () => {
    try {
        // Inicializar la base de datos PostgreSQL
        const { initializeDatabase } = await Promise.resolve().then(() => __importStar(require('./config/connection')));
        await initializeDatabase();
        app.listen(PORT, () => {
            console.log(`🚀 ASISvOX Backend running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
        });
    }
    catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
};
exports.startServer = startServer;
exports.default = app;
//# sourceMappingURL=app.js.map