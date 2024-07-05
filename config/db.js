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
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`students\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`name\` varchar(255) NOT NULL,
      \`year\` int(11) NOT NULL,
      \`group\` varchar(255) NOT NULL,
      \`email\` varchar(255) DEFAULT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
  `);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`teachers\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`name\` varchar(255) NOT NULL,
      \`email\` varchar(255) DEFAULT NULL,
      \`monday\` varchar(3) DEFAULT 'yes',
      \`tuesday\` varchar(3) DEFAULT 'yes',
      \`wednesday\` varchar(3) DEFAULT 'yes',
      \`thursday\` varchar(3) DEFAULT 'yes',
      \`friday\` varchar(3) DEFAULT 'yes',
      \`saturday\` varchar(3) DEFAULT 'no',
      \`sunday\` varchar(3) DEFAULT 'no',
      \`specific_days_off\` varchar(255) DEFAULT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
  `);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`courses\` (
      \`id\` varchar(255) NOT NULL,
      \`name\` varchar(255) NOT NULL,
      \`ec\` float NOT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
  `);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`teacherCourses\` (
      \`course_id\` varchar(255) NOT NULL,
      \`teacher_id\` int(11) NOT NULL,
      FOREIGN KEY (\`course_id\`) REFERENCES \`courses\`(\`id\`),
      FOREIGN KEY (\`teacher_id\`) REFERENCES \`teachers\`(\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
  `);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`studentCourses\` (
      \`course_id\` varchar(255) NOT NULL,
      \`student_id\` int(11) NOT NULL,
      FOREIGN KEY (\`course_id\`) REFERENCES \`courses\`(\`id\`),
      FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
  `);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`timetable\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`teacher_id\` int(11) NOT NULL,
      \`course_id\` varchar(255) NOT NULL,
      \`start_time\` datetime NOT NULL,
      \`end_time\` datetime NOT NULL,
      \`type\` enum('lecture', 'exam', 'presentation') NOT NULL,
      \`classroom\` varchar(255) NOT NULL,
      \`group\` varchar(255) NOT NULL,
      PRIMARY KEY (\`id\`),
      FOREIGN KEY (\`teacher_id\`) REFERENCES \`teachers\`(\`id\`),
      FOREIGN KEY (\`course_id\`) REFERENCES \`courses\`(\`id\`)
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
