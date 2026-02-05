// server.js - PHIÊN BẢN MỚI DÙNG SQLITE
console.log("=== SERVER QUẢN LÝ PHÒNG TRỌ VỚI SQLITE === - server.js:2");
console.log("Thời gian: - server.js:3", new Date().toLocaleString());

// Load modules
const express = require('express');
const cors = require('cors');
const { initDatabase, query, get, run } = require('./database.js');

const app = express();
app.use(cors());
app.use(express.json());

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Tạo tên file unique
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 10 // Tối đa 10 ảnh
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF, WebP)'));
        }
    }
});

// Middleware xử lý lỗi upload
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, error: 'File quá lớn (tối đa 5MB)' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ success: false, error: 'Quá nhiều file (tối đa 10 ảnh)' });
        }
    } else if (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
    next();
};

// ==================== API ROUTES ====================

// 1. Trang chủ
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: "API Quản lý Phòng Trọ (SQLite)",
        version: "1.0.0",
        database: "SQLite",
        endpoints: [
            "GET    /api/rooms           - Danh sách phòng",
            "GET    /api/rooms/:id       - Chi tiết phòng",
            "POST   /api/rooms           - Thêm phòng mới",
            "POST   /api/login           - Đăng nhập",
            "POST   /api/register        - Đăng ký",
            "POST   /api/bookings        - Đặt lịch xem phòng",
            "POST   /api/reviews         - Đánh giá phòng",
            "GET    /api/admin/pending   - Phòng chờ duyệt (admin)"
        ]
    });
});

// 2. Lấy danh sách phòng
app.get('/api/rooms', async (req, res) => {
    try {
        const rooms = await query(`
            SELECT r.*, u.username as owner_name, u.phone as owner_phone 
            FROM rooms r 
            LEFT JOIN users u ON r.owner_id = u.id 
            WHERE r.status = 'approved'
            ORDER BY r.created_at DESC
        `);
        
        res.json({ success: true, data: rooms });
    } catch (error) {
        console.error("Lỗi lấy danh sách phòng: - server.js:105", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Lấy chi tiết phòng
app.get('/api/rooms/:id', async (req, res) => {
    try {
        const room = await get(`
            SELECT r.*, u.username as owner_name, u.phone as owner_phone, u.email as owner_email
            FROM rooms r 
            LEFT JOIN users u ON r.owner_id = u.id 
            WHERE r.id = ? AND r.status = 'approved'
        `, [req.params.id]);
        
        if (room) {
            // Lấy đánh giá của phòng
            const reviews = await query(`
                SELECT r.*, u.username as user_name
                FROM reviews r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE r.room_id = ?
                ORDER BY r.created_at DESC
            `, [req.params.id]);
            
            room.reviews = reviews;
            res.json({ success: true, data: room });
        } else {
            res.json({ success: false, message: "Không tìm thấy phòng" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. Đăng nhập
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await get(
            'SELECT id, username, email, fullname, phone, role FROM users WHERE username = ? AND password = ?',
            [username, password]
        );
        
        if (user) {
            res.json({
                success: true,
                user: {
                    ...user,
                    token: 'fake-jwt-token-' + Date.now()
                }
            });
        } else {
            res.json({
                success: false,
                message: "Sai tài khoản hoặc mật khẩu"
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. Đăng ký
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, email, fullname, phone, role } = req.body;
        
        // Kiểm tra username đã tồn tại chưa
        const existingUser = await get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
        
        if (existingUser) {
            return res.json({
                success: false,
                message: "Username hoặc email đã tồn tại"
            });
        }
        
        const result = await run(
            'INSERT INTO users (username, password, email, fullname, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
            [username, password, email, fullname, phone, role || 'user']
        );
        
        const newUser = await get(
            'SELECT id, username, email, fullname, phone, role FROM users WHERE id = ?',
            [result.id]
        );
        
        res.json({
            success: true,
            message: "Đăng ký thành công!",
            user: newUser
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 6. Thêm phòng mới (chủ trọ)
app.post('/api/rooms', async (req, res) => {
    try {
        const { owner_id, title, description, price, address, city, district, area, max_people } = req.body;
        
        const result = await run(
            `INSERT INTO rooms (owner_id, title, description, price, address, city, district, area, max_people) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [owner_id, title, description, price, address, city, district, area || 0, max_people || 1]
        );
        
        res.json({
            success: true,
            message: "Đăng phòng thành công! Đang chờ duyệt",
            roomId: result.id
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 7. Đặt lịch xem phòng
app.post('/api/bookings', async (req, res) => {
    try {
        const { room_id, user_id, booking_date, booking_time, notes } = req.body;
        
        const result = await run(
            `INSERT INTO bookings (room_id, user_id, booking_date, booking_time, notes) 
             VALUES (?, ?, ?, ?, ?)`,
            [room_id, user_id, booking_date, booking_time, notes || '']
        );
        
        res.json({
            success: true,
            message: "Đã đặt lịch thành công!",
            bookingId: result.id
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 8. Đánh giá phòng
app.post('/api/reviews', async (req, res) => {
    try {
        const { room_id, user_id, rating, comment } = req.body;
        
        const result = await run(
            'INSERT INTO reviews (room_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
            [room_id, user_id, rating, comment]
        );
        
        res.json({
            success: true,
            message: "Đã gửi đánh giá!",
            reviewId: result.id
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== ADMIN ROUTES ====================

// 9. Phòng chờ duyệt
app.get('/api/admin/pending-rooms', async (req, res) => {
    try {
        const rooms = await query(`
            SELECT r.*, u.username as owner_name, u.phone as owner_phone 
            FROM rooms r 
            LEFT JOIN users u ON r.owner_id = u.id 
            WHERE r.status = 'pending'
            ORDER BY r.created_at DESC
        `);
        
        res.json({ success: true, data: rooms });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 10. Duyệt phòng
app.post('/api/admin/approve-room/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'approve' hoặc 'reject'
        
        const status = action === 'approve' ? 'approved' : 'rejected';
        await run('UPDATE rooms SET status = ? WHERE id = ?', [status, id]);
        
        res.json({
            success: true,
            message: `Đã ${action === 'approve' ? 'duyệt' : 'từ chối'} phòng #${id}`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 11. Xóa phòng (admin)
app.delete('/api/admin/rooms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await run('DELETE FROM rooms WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: `Đã xóa phòng #${id}`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== KHỞI ĐỘNG SERVER ====================

const PORT = 3000;

// Khởi tạo database và start server
async function startServer() {
    try {
        console.log("🔄 Đang khởi tạo database SQLite... - server.js:325");
        await initDatabase();
        console.log("✅ Database đã sẵn sàng! - server.js:327");
        
        app.listen(PORT, () => {
            console.log("= - server.js:330".repeat(60));
            console.log(`✅ SERVER ĐANG CHẠY: http://localhost:${PORT} - server.js:331`);
            console.log(`📅 ${new Date().toLocaleString()} - server.js:332`);
            console.log(`💾 Database: SQLite (phongtro.db) - server.js:333`);
            console.log("= - server.js:334".repeat(60));
            console.log("");
            console.log("🎯 TÍNH NĂNG ĐÃ CÓ: - server.js:336");
            console.log("✓ Đăng nhập/Đăng ký - server.js:337");
            console.log("✓ Xem danh sách phòng - server.js:338");
            console.log("✓ Xem chi tiết phòng + đánh giá - server.js:339");
            console.log("✓ Đăng phòng mới (chủ trọ) - server.js:340");
            console.log("✓ Đặt lịch xem phòng - server.js:341");
            console.log("✓ Đánh giá phòng - server.js:342");
            console.log("✓ Admin: Duyệt/Xóa phòng - server.js:343");
            console.log("");
            console.log("🔧 TEST NGAY: - server.js:345");
            console.log(`1. Mở browser: http://localhost:${PORT} - server.js:346`);
            console.log(`2. Xem phòng: http://localhost:${PORT}/api/rooms - server.js:347`);
            console.log(`3. Chi tiết phòng: http://localhost:${PORT}/api/rooms/1 - server.js:348`);
            console.log("");
            console.log("🛑 DỪNG SERVER: Ctrl + C - server.js:350");
            console.log("");
        });
    } catch (error) {
        console.error("❌ Lỗi khởi động server: - server.js:354", error);
        process.exit(1);
    }
}

startServer();