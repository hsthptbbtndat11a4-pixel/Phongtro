const { connectToDatabase } = require('./database.js');

async function test() {
    console.log("🧪 Bắt đầu test kết nối database... - test-db.js:4");
    const connected = await connectToDatabase();
    
    if (connected) {
        console.log("🎉 Kết nối database THÀNH CÔNG! - test-db.js:8");
        console.log("✅ Có thể bắt đầu code backend! - test-db.js:9");
    } else {
        console.log("⚠️  Cần fix lỗi kết nối database trước - test-db.js:11");
    }
    
    process.exit();
}

test();