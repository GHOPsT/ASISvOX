// ===============================
// MODELOS DE BASE DE DATOS - ASISvOX
// ===============================

import mongoose from 'mongoose';

// ===============================
// ESQUEMA DE USUARIO
// ===============================

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['teacher', 'admin', 'student'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  profileImage: {
    type: String,
    default: null
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });

// Middleware para hashear contraseña
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const bcrypt = require('bcryptjs');
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método para verificar contraseña
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);

// ===============================
// ESQUEMA DE PROFESOR
// ===============================

const teacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subjects: [{
    type: String,
    required: true
  }],
  specialization: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  schedule: {
    type: Map,
    of: [{
      time: String,
      subject: String,
      class: String,
      classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
      }
    }]
  },
  totalStudents: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para obtener información del usuario
teacherSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual para obtener clases asignadas
teacherSchema.virtual('classes', {
  ref: 'Class',
  localField: '_id',
  foreignField: 'teacherId'
});

export const Teacher = mongoose.model('Teacher', teacherSchema);

// ===============================
// ESQUEMA DE ESTUDIANTE
// ===============================

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  parentName: {
    type: String,
    trim: true
  },
  parentPhone: {
    type: String,
    trim: true
  },
  parentEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
studentSchema.index({ code: 1 });
studentSchema.index({ classId: 1 });
studentSchema.index({ grade: 1, section: 1 });

// Virtual para obtener información del usuario
studentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual para obtener asistencias
studentSchema.virtual('attendanceRecords', {
  ref: 'AttendanceRecord',
  localField: '_id',
  foreignField: 'studentId'
});

// Virtual para obtener calificaciones
studentSchema.virtual('grades', {
  ref: 'Grade',
  localField: '_id',
  foreignField: 'studentId'
});

export const Student = mongoose.model('Student', studentSchema);

// ===============================
// ESQUEMA DE CLASE/MATERIA
// ===============================

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  schedule: {
    type: String,
    required: true
  },
  room: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    default: 30
  },
  period: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
classSchema.index({ teacherId: 1 });
classSchema.index({ grade: 1, section: 1 });
classSchema.index({ academicYear: 1, period: 1 });

// Virtual para obtener profesor
classSchema.virtual('teacher', {
  ref: 'Teacher',
  localField: 'teacherId',
  foreignField: '_id',
  justOne: true
});

// Virtual para obtener estudiantes
classSchema.virtual('students', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'classId'
});

// Virtual para obtener evaluaciones
classSchema.virtual('assessments', {
  ref: 'Assessment',
  localField: '_id',
  foreignField: 'classId'
});

export const Class = mongoose.model('Class', classSchema);

// ===============================
// ESQUEMA DE SESIÓN DE ASISTENCIA
// ===============================

const attendanceSessionSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress'
  },
  notes: {
    type: String,
    trim: true
  },
  method: {
    type: String,
    enum: ['manual', 'voice'],
    default: 'manual'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
attendanceSessionSchema.index({ classId: 1, date: 1 });
attendanceSessionSchema.index({ teacherId: 1 });

// Virtual para obtener registros de asistencia
attendanceSessionSchema.virtual('records', {
  ref: 'AttendanceRecord',
  localField: '_id',
  foreignField: 'sessionId'
});

export const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);

// ===============================
// ESQUEMA DE REGISTRO DE ASISTENCIA
// ===============================

const attendanceRecordSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AttendanceSession',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true
  },
  recordedAt: {
    type: Date,
    default: Date.now
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  method: {
    type: String,
    enum: ['manual', 'voice'],
    default: 'manual'
  },
  notes: {
    type: String,
    trim: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
attendanceRecordSchema.index({ sessionId: 1 });
attendanceRecordSchema.index({ studentId: 1 });
attendanceRecordSchema.index({ status: 1 });

// Índice compuesto para evitar duplicados
attendanceRecordSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });

export const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);

// ===============================
// ESQUEMA DE EVALUACIÓN
// ===============================

const assessmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['exam', 'quiz', 'homework', 'project', 'participation'],
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  maxScore: {
    type: Number,
    required: true,
    min: 1
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  date: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date
  },
  description: {
    type: String,
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
assessmentSchema.index({ classId: 1 });
assessmentSchema.index({ teacherId: 1 });
assessmentSchema.index({ type: 1 });
assessmentSchema.index({ date: 1 });

// Virtual para obtener calificaciones
assessmentSchema.virtual('grades', {
  ref: 'Grade',
  localField: '_id',
  foreignField: 'assessmentId'
});

export const Assessment = mongoose.model('Assessment', assessmentSchema);

// ===============================
// ESQUEMA DE CALIFICACIÓN
// ===============================

const gradeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  feedback: {
    type: String,
    trim: true
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gradedAt: {
    type: Date,
    default: Date.now
  },
  method: {
    type: String,
    enum: ['manual', 'voice'],
    default: 'manual'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100
  },
  isSubmitted: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
gradeSchema.index({ studentId: 1 });
gradeSchema.index({ assessmentId: 1 });
gradeSchema.index({ gradedBy: 1 });

// Índice compuesto para evitar duplicados
gradeSchema.index({ studentId: 1, assessmentId: 1 }, { unique: true });

// Virtual para calcular porcentaje
gradeSchema.virtual('percentage').get(function() {
  if (this.populated('assessmentId') && this.assessmentId.maxScore) {
    return (this.score / this.assessmentId.maxScore) * 100;
  }
  return null;
});

export const Grade = mongoose.model('Grade', gradeSchema);

// ===============================
// ESQUEMA DE REPORTE
// ===============================

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['attendance', 'grades', 'performance', 'summary'],
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filters: {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    dateFrom: Date,
    dateTo: Date,
    subject: String,
    assessmentType: String
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  format: {
    type: String,
    enum: ['pdf', 'excel', 'json'],
    default: 'pdf'
  },
  filePath: {
    type: String
  },
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
reportSchema.index({ generatedBy: 1 });
reportSchema.index({ type: 1 });
reportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Report = mongoose.model('Report', reportSchema);

// ===============================
// ESQUEMA DE CONFIGURACIÓN DEL SISTEMA
// ===============================

const systemConfigSchema = new mongoose.Schema({
  academicYear: {
    type: String,
    required: true
  },
  currentPeriod: {
    type: String,
    required: true
  },
  gradeScale: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 20
    },
    passingGrade: {
      type: Number,
      default: 12
    }
  },
  attendanceThreshold: {
    type: Number,
    default: 75,
    min: 0,
    max: 100
  },
  voiceRecognition: {
    enabled: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'es-ES'
    },
    confidence: {
      type: Number,
      default: 80,
      min: 0,
      max: 100
    }
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    }
  },
  backup: {
    enabled: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    retention: {
      type: Number,
      default: 30
    }
  }
}, {
  timestamps: true
});

export const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);

// ===============================
// FUNCIÓN DE CONEXIÓN A LA BASE DE DATOS
// ===============================

export async function connectDatabase() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/asisVox';
    
    await mongoose.connect(MONGODB_URI, {
      // Opciones de conexión modernas
    });

    console.log('✅ Conectado a MongoDB exitosamente');
    
    // Crear índices si no existen
    await createIndexes();
    
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Función para crear índices
async function createIndexes() {
  try {
    await User.createIndexes();
    await Teacher.createIndexes();
    await Student.createIndexes();
    await Class.createIndexes();
    await AttendanceSession.createIndexes();
    await AttendanceRecord.createIndexes();
    await Assessment.createIndexes();
    await Grade.createIndexes();
    await Report.createIndexes();
    await SystemConfig.createIndexes();
    
    console.log('✅ Índices de base de datos creados');
  } catch (error) {
    console.error('❌ Error creando índices:', error);
  }
}

// Función para cerrar conexión
export async function closeDatabase() {
  try {
    await mongoose.connection.close();
    console.log('✅ Conexión a MongoDB cerrada');
  } catch (error) {
    console.error('❌ Error cerrando conexión:', error);
  }
}