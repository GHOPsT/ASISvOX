/**
 * ASISvOX - PostgreSQL Database Connection
 * Configuración de conexión a PostgreSQL 17
 */

import { Pool, PoolClient, QueryResult } from 'pg';

// ============================================
// CONFIGURACIÓN DE LA BASE DE DATOS
// ============================================

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number; // Número máximo de clientes en el pool
  idleTimeoutMillis?: number; // Tiempo de espera antes de cerrar cliente inactivo
  connectionTimeoutMillis?: number; // Tiempo de espera para conexión
  ssl?: boolean | object; // Configuración SSL
  allowExitOnIdle?: boolean; // Permitir salir cuando esté idle
}

// Configuración desde variables de entorno
const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'asisvox_db',
  user: process.env.DB_USER || 'asisvox_user',
  password: process.env.DB_PASSWORD || 'asisvox_user',
  max: parseInt(process.env.DB_POOL_MAX || '20'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
  // Configuraciones adicionales para resolver problemas de autenticación
  ssl: false, // Deshabilitar SSL para conexiones locales
  allowExitOnIdle: true, // Permitir salir cuando esté idle
};

// ============================================
// POOL DE CONEXIONES
// ============================================

export const pool = new Pool(dbConfig);

// Evento cuando se crea una nueva conexión
pool.on('connect', (client: PoolClient) => {
  console.log('✅ Nueva conexión establecida con PostgreSQL');
});

// Evento cuando hay un error en una conexión inactiva
pool.on('error', (err: Error, client: PoolClient) => {
  console.error('❌ Error inesperado en cliente PostgreSQL:', err);
  process.exit(-1);
});

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Ejecuta una consulta SQL
 * @param text - Consulta SQL
 * @param params - Parámetros de la consulta
 * @returns Resultado de la consulta
 */
export const query = async (
  text: string,
  params?: any[]
): Promise<QueryResult> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('🔍 Query ejecutado', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('❌ Error en query:', error);
    throw error;
  }
};

/**
 * Obtiene un cliente del pool para transacciones
 * @returns Cliente de PostgreSQL
 */
export const getClient = async (): Promise<PoolClient> => {
  const client = await pool.connect();
  return client;
};

/**
 * Ejecuta una función dentro de una transacción
 * @param callback - Función a ejecutar dentro de la transacción
 * @returns Resultado de la función
 */
export const transaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Verifica la conexión a la base de datos
 * @returns true si la conexión es exitosa
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT NOW() as time, version() as version');
    console.log('✅ Conexión exitosa a PostgreSQL');
    console.log('📅 Hora del servidor:', result.rows[0].time);
    console.log('📦 Versión:', result.rows[0].version);
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error);
    return false;
  }
};

/**
 * Cierra todas las conexiones del pool
 */
export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('👋 Pool de conexiones cerrado correctamente');
  } catch (error) {
    console.error('❌ Error al cerrar pool:', error);
    throw error;
  }
};

// ============================================
// FUNCIONES HELPER PARA CONSULTAS COMUNES
// ============================================

/**
 * Encuentra un registro por ID
 */
export const findById = async (
  table: string,
  id: string
): Promise<any | null> => {
  const result = await query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
  return result.rows[0] || null;
};

/**
 * Encuentra todos los registros de una tabla
 */
export const findAll = async (
  table: string,
  conditions?: { [key: string]: any }
): Promise<any[]> => {
  let sql = `SELECT * FROM ${table}`;
  const params: any[] = [];

  if (conditions) {
    const whereClauses = Object.keys(conditions).map((key, index) => {
      params.push(conditions[key]);
      return `${key} = $${index + 1}`;
    });
    sql += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  const result = await query(sql, params);
  return result.rows;
};

/**
 * Inserta un nuevo registro
 */
export const insert = async (
  table: string,
  data: { [key: string]: any }
): Promise<any> => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');

  const sql = `
    INSERT INTO ${table} (${keys.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await query(sql, values);
  return result.rows[0];
};

/**
 * Actualiza un registro
 */
export const update = async (
  table: string,
  id: string,
  data: { [key: string]: any }
): Promise<any> => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

  const sql = `
    UPDATE ${table}
    SET ${setClause}
    WHERE id = $${keys.length + 1}
    RETURNING *
  `;

  const result = await query(sql, [...values, id]);
  return result.rows[0];
};

/**
 * Elimina un registro
 */
export const deleteById = async (
  table: string,
  id: string
): Promise<boolean> => {
  const result = await query(`DELETE FROM ${table} WHERE id = $1`, [id]);
  return (result.rowCount || 0) > 0;
};

// ============================================
// FUNCIÓN DE INICIALIZACIÓN
// ============================================

export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 Conectando a PostgreSQL...');
    
    // Probar la conexión
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Conectado a PostgreSQL exitosamente');
      console.log(`📊 Base de datos: ${dbConfig.database}`);
      console.log(`🏠 Host: ${dbConfig.host}:${dbConfig.port}`);
    } else {
      throw new Error('No se pudo conectar a PostgreSQL');
    }
    
    // Configurar manejo de cierre graceful
    process.on('SIGINT', async () => {
      console.log('🔄 Cerrando conexión a PostgreSQL...');
      await closePool();
      console.log('✅ Conexión cerrada correctamente');
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('🔄 Cerrando conexión a PostgreSQL...');
      await closePool();
      console.log('✅ Conexión cerrada correctamente');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error);
    throw error;
  }
};

// ============================================
// EXPORTACIONES
// ============================================

export default {
  pool,
  query,
  getClient,
  transaction,
  testConnection,
  closePool,
  findById,
  findAll,
  insert,
  update,
  deleteById,
  initializeDatabase,
};
