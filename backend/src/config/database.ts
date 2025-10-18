// ===============================
// CONFIGURACIÓN DE BASE DE DATOS
// ===============================

import mongoose from 'mongoose';

// Configuración de conexión
const DATABASE_CONFIG = {
  // MongoDB URI desde variables de entorno
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/asisVox',
  
  // Opciones de conexión
  options: {
    // Configuraciones recomendadas para producción
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    bufferCommands: false,
  }
};

// ===============================
// FUNCIONES DE CONEXIÓN
// ===============================

export async function connectDatabase(): Promise<void> {
  try {
    // Configurar eventos de conexión
    mongoose.connection.on('connecting', () => {
      console.log('🔄 Conectando a MongoDB...');
    });

    mongoose.connection.on('connected', () => {
      console.log('✅ Conectado a MongoDB exitosamente');
    });

    mongoose.connection.on('error', (error) => {
      console.error('❌ Error de conexión MongoDB:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Desconectado de MongoDB');
    });

    // Manejar cierre graceful
    process.on('SIGINT', async () => {
      await closeDatabase();
      process.exit(0);
    });

    // Conectar a la base de datos
    await mongoose.connect(DATABASE_CONFIG.uri, DATABASE_CONFIG.options);
    
    // Crear datos de prueba en desarrollo
    if (process.env.NODE_ENV === 'development') {
      await createSeedData();
    }

  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

export async function closeDatabase(): Promise<void> {
  try {
    await mongoose.connection.close();
    console.log('✅ Conexión a MongoDB cerrada correctamente');
  } catch (error) {
    console.error('❌ Error cerrando conexión MongoDB:', error);
  }
}

// ===============================
// DATOS DE PRUEBA (DESARROLLO)
// ===============================

async function createSeedData(): Promise<void> {
  try {
    const { User, Teacher, Student, Class, SystemConfig } = await import('../models');

    // Verificar si ya existen datos
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('📊 Datos de prueba ya existen en la base de datos');
      return;
    }

    console.log('🌱 Creando datos de prueba...');

    // Crear configuración del sistema
    await SystemConfig.create({
      academicYear: '2024',
      currentPeriod: '2024-1',
      gradeScale: {
        min: 0,
        max: 20,
        passingGrade: 12
      },
      attendanceThreshold: 75,
      voiceRecognition: {
        enabled: true,
        language: 'es-ES',
        confidence: 80
      }
    });

    // Crear usuarios administradores
    const adminUser = await User.create({
      name: 'Administrador Principal',
      email: 'admin@asisVox.com',
      password: 'admin123',
      role: 'admin'
    });

    // Crear usuarios profesores
    const teacherUser1 = await User.create({
      name: 'Prof. María González',
      email: 'maria.gonzalez@asisVox.com',
      password: 'teacher123',
      role: 'teacher'
    });

    const teacherUser2 = await User.create({
      name: 'Prof. Carlos Ruiz',
      email: 'carlos.ruiz@asisVox.com',
      password: 'teacher123',
      role: 'teacher'
    });

    // Crear perfiles de profesores
    const teacher1 = await Teacher.create({
      userId: teacherUser1._id,
      subjects: ['Matemáticas', 'Álgebra'],
      specialization: 'Matemáticas',
      phone: '+51 999 888 777',
      schedule: new Map([
        ['Lunes', [
          { time: '8:00-9:30', subject: 'Matemáticas', class: '10°A', classId: null },
          { time: '14:00-15:30', subject: 'Álgebra', class: '11°B', classId: null }
        ]],
        ['Martes', [
          { time: '10:00-11:30', subject: 'Matemáticas', class: '10°A', classId: null }
        ]]
      ])
    });

    const teacher2 = await Teacher.create({
      userId: teacherUser2._id,
      subjects: ['Física', 'Química'],
      specialization: 'Ciencias',
      phone: '+51 999 777 666',
      schedule: new Map([
        ['Lunes', [
          { time: '9:30-11:00', subject: 'Física', class: '11°A', classId: null }
        ]],
        ['Miércoles', [
          { time: '15:30-17:00', subject: 'Química', class: '10°B', classId: null }
        ]]
      ])
    });

    // Crear clases
    const class1 = await Class.create({
      name: 'Matemáticas 10°A',
      subject: 'Matemáticas',
      teacherId: teacher1._id,
      grade: '10',
      section: 'A',
      schedule: 'Lun-Mié-Vie 8:00-9:30',
      room: 'Aula 201',
      period: '2024-1',
      academicYear: '2024'
    });

    const class2 = await Class.create({
      name: 'Física 11°A',
      subject: 'Física',
      teacherId: teacher2._id,
      grade: '11',
      section: 'A',
      schedule: 'Lun-Mié-Vie 9:30-11:00',
      room: 'Lab. Física',
      period: '2024-1',
      academicYear: '2024'
    });

    // Crear estudiantes de prueba
    const students = [];
    for (let i = 1; i <= 10; i++) {
      const studentUser = await User.create({
        name: `Estudiante ${i.toString().padStart(2, '0')}`,
        email: `estudiante${i}@asisVox.com`,
        password: 'student123',
        role: 'student'
      });

      const student = await Student.create({
        userId: studentUser._id,
        code: `2024${i.toString().padStart(3, '0')}`,
        classId: i <= 5 ? class1._id : class2._id,
        grade: i <= 5 ? '10' : '11',
        section: 'A',
        parentName: `Padre/Madre ${i}`,
        parentPhone: `+51 999 ${(100 + i).toString().padStart(3, '0')} ${(200 + i).toString().padStart(3, '0')}`,
        parentEmail: `padre${i}@email.com`
      });

      students.push(student);
    }

    console.log('✅ Datos de prueba creados exitosamente:');
    console.log(`   - 1 Administrador`);
    console.log(`   - 2 Profesores`);
    console.log(`   - 2 Clases`);
    console.log(`   - 10 Estudiantes`);
    console.log(`   - Configuración del sistema`);

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  }
}

// ===============================
// UTILIDADES DE BASE DE DATOS
// ===============================

export function getConnectionStatus(): string {
  const state = mongoose.connection.readyState;
  switch (state) {
    case 0: return 'disconnected';
    case 1: return 'connected';
    case 2: return 'connecting';
    case 3: return 'disconnecting';
    default: return 'unknown';
  }
}

export async function dropDatabase(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Esta función solo está disponible en desarrollo');
  }
  
  try {
    await mongoose.connection.dropDatabase();
    console.log('🗑️ Base de datos eliminada');
  } catch (error) {
    console.error('❌ Error eliminando base de datos:', error);
  }
}

export async function getStats(): Promise<any> {
  try {
    const { User, Teacher, Student, Class, AttendanceRecord, Grade } = await import('../models');
    
    const stats = {
      users: await User.countDocuments(),
      teachers: await Teacher.countDocuments(),
      students: await Student.countDocuments(),
      classes: await Class.countDocuments(),
      attendanceRecords: await AttendanceRecord.countDocuments(),
      grades: await Grade.countDocuments(),
      connection: getConnectionStatus()
    };

    return stats;
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    return null;
  }
}