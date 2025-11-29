/**
 * ASISvOX - PostgreSQL Database Connection
 * Configuración de conexión a PostgreSQL 17
 */
import { Pool, PoolClient, QueryResult } from 'pg';
export declare const pool: Pool;
/**
 * Ejecuta una consulta SQL
 * @param text - Consulta SQL
 * @param params - Parámetros de la consulta
 * @returns Resultado de la consulta
 */
export declare const query: (text: string, params?: any[]) => Promise<QueryResult>;
/**
 * Obtiene un cliente del pool para transacciones
 * @returns Cliente de PostgreSQL
 */
export declare const getClient: () => Promise<PoolClient>;
/**
 * Ejecuta una función dentro de una transacción
 * @param callback - Función a ejecutar dentro de la transacción
 * @returns Resultado de la función
 */
export declare const transaction: <T>(callback: (client: PoolClient) => Promise<T>) => Promise<T>;
/**
 * Verifica la conexión a la base de datos
 * @returns true si la conexión es exitosa
 */
export declare const testConnection: () => Promise<boolean>;
/**
 * Cierra todas las conexiones del pool
 */
export declare const closePool: () => Promise<void>;
/**
 * Encuentra un registro por ID
 */
export declare const findById: (table: string, id: string) => Promise<any | null>;
/**
 * Encuentra todos los registros de una tabla
 */
export declare const findAll: (table: string, conditions?: {
    [key: string]: any;
}) => Promise<any[]>;
/**
 * Inserta un nuevo registro
 */
export declare const insert: (table: string, data: {
    [key: string]: any;
}) => Promise<any>;
/**
 * Actualiza un registro
 */
export declare const update: (table: string, id: string, data: {
    [key: string]: any;
}) => Promise<any>;
/**
 * Elimina un registro
 */
export declare const deleteById: (table: string, id: string) => Promise<boolean>;
export declare const initializeDatabase: () => Promise<void>;
declare const _default: {
    pool: Pool;
    query: (text: string, params?: any[]) => Promise<QueryResult>;
    getClient: () => Promise<PoolClient>;
    transaction: <T>(callback: (client: PoolClient) => Promise<T>) => Promise<T>;
    testConnection: () => Promise<boolean>;
    closePool: () => Promise<void>;
    findById: (table: string, id: string) => Promise<any | null>;
    findAll: (table: string, conditions?: {
        [key: string]: any;
    }) => Promise<any[]>;
    insert: (table: string, data: {
        [key: string]: any;
    }) => Promise<any>;
    update: (table: string, id: string, data: {
        [key: string]: any;
    }) => Promise<any>;
    deleteById: (table: string, id: string) => Promise<boolean>;
    initializeDatabase: () => Promise<void>;
};
export default _default;
//# sourceMappingURL=connection.d.ts.map