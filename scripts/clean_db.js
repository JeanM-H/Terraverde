const mysql = require('mysql2/promise');

(async () => {
  const db = await mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'terraverde'
  });

  await db.query('DELETE FROM pagos');
  await db.query('DELETE FROM lotes');
  await db.query('DELETE FROM pqrs');
  await db.query("DELETE FROM usuarios WHERE role != 'admin'");

  console.log('Limpieza completada: pagos y lotes borrados; usuarios no-admin borrados.');
  process.exit(0);
})();
