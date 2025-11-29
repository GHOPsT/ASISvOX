"use strict";
/**
 * ASISvOX - PostgreSQL Database Connection
 * Configuración de conexión a PostgreSQL 17
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.deleteById = exports.update = exports.insert = exports.findAll = exports.findById = exports.closePool = exports.testConnection = exports.transaction = exports.getClient = exports.query = exports.pool = void 0;
const pg_1 = require("pg");
// Configuración desde variables de entorno
const dbConfig = {
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
exports.pool = new pg_1.Pool(dbConfig);
// Evento cuando se crea una nueva conexión
exports.pool.on('connect', (client) => {
    console.log('✅ Nueva conexión establecida con PostgreSQL');
});
// Evento cuando hay un error en una conexión inactiva
exports.pool.on('error', (err, client) => {
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
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await exports.pool.query(text, params);
        const duration = Date.now() - start;
        console.log('🔍 Query ejecutado', { text, duration, rows: result.rowCount });
        return result;
    }
    catch (error) {
        console.error('❌ Error en query:', error);
        throw error;
    }
};
exports.query = query;
/**
 * Obtiene un cliente del pool para transacciones
 * @returns Cliente de PostgreSQL
 */
const getClient = async () => {
    const client = await exports.pool.connect();
    return client;
};
exports.getClient = getClient;
/**
 * Ejecuta una función dentro de una transacción
 * @param callback - Función a ejecutar dentro de la transacción
 * @returns Resultado de la función
 */
const transaction = async (callback) => {
    const client = await (0, exports.getClient)();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
};
exports.transaction = transaction;
/**
 * Verifica la conexión a la base de datos
 * @returns true si la conexión es exitosa
 */
const testConnection = async () => {
    try {
        const result = await (0, exports.query)('SELECT NOW() as time, version() as version');
        console.log('✅ Conexión exitosa a PostgreSQL');
        console.log('📅 Hora del servidor:', result.rows[0].time);
        console.log('📦 Versión:', result.rows[0].version);
        return true;
    }
    catch (error) {
        console.error('❌ Error al conectar con PostgreSQL:', error);
        return false;
    }
};
exports.testConnection = testConnection;
/**
 * Cierra todas las conexiones del pool
 */
const closePool = async () => {
    try {
        await exports.pool.end();
        console.log('👋 Pool de conexiones cerrado correctamente');
    }
    catch (error) {
        console.error('❌ Error al cerrar pool:', error);
        throw error;
    }
};
exports.closePool = closePool;
// ============================================
// FUNCIONES HELPER PARA CONSULTAS COMUNES
// ============================================
/**
 * Encuentra un registro por ID
 */
const findById = async (table, id) => {
    const result = await (0, exports.query)(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    return result.rows[0] || null;
};
exports.findById = findById;
/**
 * Encuentra todos los registros de una tabla
 */
const findAll = async (table, conditions) => {
    let sql = `SELECT * FROM ${table}`;
    const params = [];
    if (conditions) {
        const whereClauses = Object.keys(conditions).map((key, index) => {
            params.push(conditions[key]);
            return `${key} = $${index + 1}`;
        });
        sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }
    const result = await (0, exports.query)(sql, params);
    return result.rows;
};
exports.findAll = findAll;
/**
 * Inserta un nuevo registro
 */
const insert = async (table, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const sql = `
    INSERT INTO ${table} (${keys.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;
    const result = await (0, exports.query)(sql, values);
    return result.rows[0];
};
exports.insert = insert;
/**
 * Actualiza un registro
 */
const update = async (table, id, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const sql = `
    UPDATE ${table}
    SET ${setClause}
    WHERE id = $${keys.length + 1}
    RETURNING *
  `;
    const result = await (0, exports.query)(sql, [...values, id]);
    return result.rows[0];
};
exports.update = update;
/**
 * Elimina un registro
 */
const deleteById = async (table, id) => {
    const result = await (0, exports.query)(`DELETE FROM ${table} WHERE id = $1`, [id]);
    return (result.rowCount || 0) > 0;
};
exports.deleteById = deleteById;
// ============================================
// FUNCIÓN DE INICIALIZACIÓN
// ============================================
const initializeDatabase = async () => {
    try {
        console.log('🔄 Conectando a PostgreSQL...');
        // Probar la conexión
        const isConnected = await (0, exports.testConnection)();
        if (isConnected) {
            console.log('✅ Conectado a PostgreSQL exitosamente');
            console.log(`📊 Base de datos: ${dbConfig.database}`);
            console.log(`🏠 Host: ${dbConfig.host}:${dbConfig.port}`);
        }
        else {
            throw new Error('No se pudo conectar a PostgreSQL');
        }
        // Configurar manejo de cierre graceful
        process.on('SIGINT', async () => {
            console.log('🔄 Cerrando conexión a PostgreSQL...');
            await (0, exports.closePool)();
            console.log('✅ Conexión cerrada correctamente');
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            console.log('🔄 Cerrando conexión a PostgreSQL...');
            await (0, exports.closePool)();
            console.log('✅ Conexión cerrada correctamente');
            process.exit(0);
        });
    }
    catch (error) {
        console.error('❌ Error conectando a PostgreSQL:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
// ============================================
// EXPORTACIONES
// ============================================
exports.default = {
    pool: exports.pool,
    query: exports.query,
    getClient: exports.getClient,
    transaction: exports.transaction,
    testConnection: exports.testConnection,
    closePool: exports.closePool,
    findById: exports.findById,
    findAll: exports.findAll,
    insert: exports.insert,
    update: exports.update,
    deleteById: exports.deleteById,
    initializeDatabase: exports.initializeDatabase,
};
//# sourceMappingURL=connection.js.map