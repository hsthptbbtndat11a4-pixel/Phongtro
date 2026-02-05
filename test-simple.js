const sql = require('mssql');

console.log("🧪 Test kết nối SQL Server đơn giản - test-simple.js:3");

// Thử các config khác nhau
const configs = [
    {
        name: "Config 1 - Localhost",
        config: {
            user: 'sa',
            password: '123456',  // ĐỔI THÀNH PASSWORD THẬT
            server: 'localhost',
            database: 'master',  // Thử kết nối database master trước
            options: { encrypt: false, trustServerCertificate: true }
        }
    },
    {
        name: "Config 2 - Dot",
        config: {
            user: 'sa',
            password: '123456',
            server: '.',
            database: 'master',
            options: { encrypt: false, trustServerCertificate: true }
        }
    },
    {
        name: "Config 3 - Express",
        config: {
            user: 'sa',
            password: '123456',
            server: 'localhost\\SQLEXPRESS',
            database: 'master',
            options: { encrypt: false, trustServerCertificate: true }
        }
    }
];

async function testConnection(config, name) {
    console.log(`\n🔧 Testing: ${name} - test-simple.js:40`);
    console.log(`Server: ${config.server} - test-simple.js:41`);
    
    try {
        await sql.connect(config);
        console.log(`✅ ${name}: Kết nối THÀNH CÔNG! - test-simple.js:45`);
        
        // Test query
        const result = await sql.query`SELECT @@VERSION as version`;
        console.log(`📊 Version: ${result.recordset[0].version.substring(0, 50)}... - test-simple.js:49`);
        
        await sql.close();
        return true;
    } catch (error) {
        console.log(`❌ ${name}: ${error.message} - test-simple.js:54`);
        return false;
    }
}

async function runTests() {
    console.log("= - test-simple.js:60".repeat(60));
    console.log("🧪 BẮT ĐẦU TEST KẾT NỐI SQL SERVER - test-simple.js:61");
    console.log("= - test-simple.js:62".repeat(60));
    
    let success = false;
    
    for (const test of configs) {
        success = await testConnection(test.config, test.name);
        if (success) break;
    }
    
    console.log("\n - test-simple.js:71" + "=".repeat(60));
    if (success) {
        console.log("🎉 TÌM THẤY CẤU HÌNH KẾT NỐI THÀNH CÔNG! - test-simple.js:73");
        console.log("✅ Có thể sử dụng config đó trong file .env - test-simple.js:74");
    } else {
        console.log("⚠️  KHÔNG KẾT NỐI ĐƯỢC SQL SERVER - test-simple.js:76");
        console.log("\n🔍 HÃY KIỂM TRA: - test-simple.js:77");
        console.log("1. SQL Server có đang chạy không? - test-simple.js:78");
        console.log("2. Password 'sa' có đúng không? - test-simple.js:79");
        console.log("3. Thử đăng nhập bằng SSMS trước - test-simple.js:80");
    }
    
    process.exit();
}

runTests();