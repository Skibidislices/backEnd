import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'variables.env' });

const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;

const createDatabaseAndTable = async () => {
  const connection = await mysql.createConnection({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\`;`);
  await connection.query(`USE \`${MYSQL_DATABASE}\`;`);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`email\` varchar(255) NOT NULL,
      \`password\` varchar(255) NOT NULL,
      \`isVerified\` tinyint(1) DEFAULT 0,
      \`verificationToken\` varchar(255) DEFAULT NULL,
      \`verificationTokenExpires\` datetime DEFAULT NULL,
      \`resetPasswordToken\` varchar(255) DEFAULT NULL,
      \`resetPasswordTokenExpires\` datetime DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`email\` (\`email\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
  `);
  await connection.end();
};

const connectDatabase = async () => {
  await createDatabaseAndTable();

  const pool = mysql.createPool({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  return pool;
};

const db = await connectDatabase();
export default db;
