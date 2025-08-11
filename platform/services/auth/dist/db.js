import mysql from 'mysql2/promise';
export function createMysqlPool() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST || 'localhost',
        port: Number(process.env.MYSQL_PORT || 3306),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'agrocraft',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });
    return pool;
}
