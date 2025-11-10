
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    
    host: process.env.MYSQL_HOST || mysql-hfu5.railway.internal,      
    user: process.env.MYSQL_USER || root,           
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || railway,       
    port: process.env.MYSQL_PORT || 3306
    
});

module.exports = pool;

