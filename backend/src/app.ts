// ===============================
// SERVIDOR PRINCIPAL - BACKEND
// ===============================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

// Importar rutas
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import entityRoutes from './routes/entity.routes';
import teacherRoutes from './routes/teacher.routes';
import studentRoutes from './routes/student.routes';
import classRoutes from './routes/class.routes';
import attendanceRoutes from './routes/attendance.routes';
import assessmentRoutes from './routes/assessment.routes';
import gradingRoutes from './routes/grading.routes';
import reportRoutes from './routes/report.routes';
import statisticsRoutes from './routes/statistics.routes';
import voiceRoutes from './routes/voice.routes';

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();

// ===============================
// MIDDLEWARE GLOBAL
// ===============================

// Seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Logging
app.use(morgan('combined'));

// Parser de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
app.use('/api/auth', authRoutes);

// ===============================
// MIDDLEWARE DE AUTENTICACIÓN
// ===============================

// Aplicar middleware de auth a todas las rutas protegidas
app.use('/api', authMiddleware);

// ===============================
// RUTAS PROTEGIDAS
// ===============================

app.use('/api/users', userRoutes);
app.use('/api/entities', entityRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/grades', gradingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/voice', voiceRoutes);

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
app.use(errorHandler);

// ===============================
// CONFIGURACIÓN DEL SERVIDOR
// ===============================

const PORT = process.env.PORT || 3001;

// Función para iniciar el servidor
export const startServer = async () => {
  try {
    // Inicializar la base de datos PostgreSQL
    const { initializeDatabase } = await import('./config/connection');
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 ASISvOX Backend running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

export default app;