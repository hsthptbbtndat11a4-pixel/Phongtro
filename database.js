// database.js - Sử dụng SQLite (không cần SQL Server)
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log("📦 Đang khởi tạo SQLite Database... - database.js:5");

// Đường dẫn đến file database
const dbPath = path.join(__dirname, 'phongtro.db');
const db = new sqlite3.Database(dbPath);

// Hàm khởi tạo database
function initDatabase() {
    console.log("🔄 Đang tạo bảng... - database.js:13");
    
    return new Promise((resolve, reject) => {
        // Tạo bảng Users
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT UNIQUE,
            fullname TEXT,
            phone TEXT,
            role TEXT CHECK(role IN ('admin', 'chutro', 'user')) DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) reject(err);
            else console.log("✅ Bảng 'users' đã sẵn sàng - database.js:28");
        });
        
        // Tạo bảng Rooms
        db.run(`CREATE TABLE IF NOT EXISTS rooms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_id INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            price INTEGER NOT NULL,
            address TEXT NOT NULL,
            city TEXT,
            district TEXT,
            area REAL,
            max_people INTEGER DEFAULT 1,
            status TEXT CHECK(status IN ('pending', 'approved', 'rented')) DEFAULT 'pending',
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users(id)
        )`, (err) => {
            if (err) reject(err);
            else console.log("✅ Bảng 'rooms' đã sẵn sàng - database.js:49");
        });
        
        // Tạo bảng Bookings
        db.run(`CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER,
            user_id INTEGER,
            booking_date DATE,
            booking_time TIME,
            status TEXT CHECK(status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (room_id) REFERENCES rooms(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`, (err) => {
            if (err) reject(err);
            else console.log("✅ Bảng 'bookings' đã sẵn sàng - database.js:66");
        });
        
        // Tạo bảng Reviews
        db.run(`CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER,
            user_id INTEGER,
            rating INTEGER CHECK(rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (room_id) REFERENCES rooms(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`, (err) => {
            if (err) reject(err);
            else console.log("✅ Bảng 'reviews' đã sẵn sàng - database.js:81");
        });
        
        // Thêm dữ liệu mẫu
        setTimeout(() => {
            addSampleData().then(() => {
                console.log("🎉 Database khởi tạo thành công! - database.js:87");
                resolve(true);
            });
        }, 1000);
    });
}

// Hàm thêm dữ liệu mẫu
async function addSampleData() {
    return new Promise((resolve, reject) => {
        // Kiểm tra xem đã có dữ liệu chưa
        db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
            if (err) reject(err);
            
            if (row.count === 0) {
                console.log("📝 Đang thêm dữ liệu mẫu... - database.js:102");
                
                // Thêm users
                const users = [
                    `INSERT INTO users (username, password, email, fullname, phone, role) VALUES 
                    ('admin', '123456', 'admin@gmail.com', 'Quản trị viên', '0909123456', 'admin'),
                    ('chutro1', '123456', 'chutro1@gmail.com', 'Nguyễn Văn A', '0912345678', 'chutro'),
                    ('user1', '123456', 'user1@gmail.com', 'Trần Thị B', '0923456789', 'user')`
                ];
                
                // Thêm rooms
                const rooms = [
                    `INSERT INTO rooms (owner_id, title, description, price, address, city, district, area, max_people, status) VALUES
                    (2, 'Phòng trọ đẹp Quận 1', 'Phòng 20m2, toilet riêng, cửa sổ lớn', 3500000, '123 Nguyễn Văn Linh', 'Hồ Chí Minh', 'Quận 1', 20.5, 2, 'approved'),
                    (2, 'Phòng sinh viên Quận 3', 'Phòng 15m2, gần đại học, an ninh', 2500000, '456 Lê Văn Sỹ', 'Hồ Chí Minh', 'Quận 3', 15.0, 1, 'approved')`
                ];
                
                // Thực thi queries
                db.serialize(() => {
                    users.forEach(query => db.run(query));
                    rooms.forEach(query => db.run(query));
                    
                    console.log("✅ Đã thêm dữ liệu mẫu - database.js:124");
                    resolve(true);
                });
            } else {
                console.log("📊 Database đã có dữ liệu - database.js:128");
                resolve(true);
            }
        });
    });
}

// Hàm thực thi query
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Hàm thực thi query trả về 1 row
function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// Hàm thực thi run (INSERT, UPDATE, DELETE)
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

// Xuất các hàm
module.exports = {
    db,
    initDatabase,
    query,
    get,
    run,
    addSampleData
};