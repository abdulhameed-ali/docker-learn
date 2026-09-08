const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('تم الاتصال بقاعدة البيانات بنجاح!');
  } catch (err) {
    console.error('خطأ في تهيئة قاعدة البيانات، جاري إعادة المحاولة بعد ثوانٍ...', err.message);
    setTimeout(initDB, 5000);
  }
}
initDB();

app.get('/', async (req, res) => {
  try {
    await pool.query('INSERT INTO visits DEFAULT VALUES');
    const result = await pool.query('SELECT COUNT(*) FROM visits');
    const count = result.rows[0].count; // تعديل بسيط لضمان القراءة الصحيحة للعداد
    
    res.send(`<h1>نورت صفحة الدوكر ياحبيبنا 🐳</h1><p>تم زيارة هذه الصفحة ${count} مرات.</p>`);
  } catch (err) {
    res.status(500).send('خطأ في الاتصال بقاعدة البيانات: ' + err.message);
  }
});

app.listen(port, () => {
  console.log(`التطبيق يعمل الآن على المنفذ ${port}`);
});
