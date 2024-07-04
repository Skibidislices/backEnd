// start.js setup from learnnode.com by Wes Bos
import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'variables.env' });
import indexRouter from './routes/index.js';
import cors from 'cors';
import db from './config/db.js';

const app = express();

// support json encoded and url-encoded bodies, mainly used for post and update
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRouter);

app.set('port', process.env.PORT || 3010);
const server = app.listen(app.get('port'), async () => {
  try {
    await db.query('SELECT 1'); // Test the connection
    console.log('🍿 Express running → PORT', server.address().port);
    console.log('📦 Connected to MySQL');
  } catch (err) {
    console.error('❌ Unable to connect to MySQL:', err.message);
    process.exit(1);
  }
});
