const mysql = require(mysql/promise);

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'farmeasy'
        });
        console.log("Connection Successfully");
        await connection.end();
    }catch (err) {
        console.error("Connection Failed:..",err.message);
    }
}

testConnection();