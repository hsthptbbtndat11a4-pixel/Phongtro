// Quản lý người dùng với localStorage
class AuthManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        
        // Tạo tài khoản admin mặc định nếu chưa có
        if (!this.users.some(user => user.isAdmin)) {
            this.createDefaultAdmin();
        }
        
        this.init();
    }

    createDefaultAdmin() {
        const adminUser = {
            id: Date.now(),
            name: "Admin",
            email: "admin@movieflix.com",
            password: "admin123", // Trong thực tế nên sử dụng mật khẩu mạnh hơn
            isAdmin: true,
            favoriteMovies: [],
            watchHistory: []
        };
        
        this.users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    init() {
        // Kiểm tra đăng nhập khi tải trang
        if (this.currentUser) {
            this.updateUIForLoggedInUser();
        }

        // Xử lý form đăng ký
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Xử lý form đăng nhập
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Kiểm tra quyền truy cập trang upload
        if (window.location.pathname.includes('upload.html')) {
            this.checkAdminAccess();
        }

        // Xử lý đăng xuất
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn logout-btn';
        logoutBtn.textContent = 'Đăng xuất';
        logoutBtn.addEventListener('click', () => this.handleLogout());

        // Thêm nút đăng xuất vào nav-buttons nếu đã đăng nhập
        if (this.currentUser) {
            const navButtons = document.querySelector('.nav-buttons');
            if (navButtons) {
                navButtons.appendChild(logoutBtn);
            }
        }
    }

    handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Kiểm tra mật khẩu khớp
        if (password !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        // Kiểm tra email đã tồn tại
        if (this.users.some(user => user.email === email)) {
            alert('Email đã được đăng ký!');
            return;
        }

        // Thêm người dùng mới
        const newUser = {
            id: Date.now(),
            name,
            email,
            password, // Trong thực tế nên mã hóa mật khẩu
            isAdmin: false, // Người dùng mới mặc định không phải admin
            favoriteMovies: [],
            watchHistory: []
        };

        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));

        // Tự động đăng nhập sau khi đăng ký
        this.currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        // Cập nhật UI
        this.updateUIForLoggedInUser();
        alert('Đăng ký thành công!');
        
        // Đóng modal
        const registerModal = document.getElementById('registerModal');
        if (registerModal) {
            registerModal.style.display = 'none';
        }
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Tìm user
        const user = this.users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.updateUIForLoggedInUser();
            alert('Đăng nhập thành công!');
            
            // Đóng modal
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.style.display = 'none';
            }
        } else {
            alert('Email hoặc mật khẩu không đúng!');
        }
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUIForLoggedInUser();
        location.reload(); // Tải lại trang để cập nhật UI
    }

    updateUIForLoggedInUser() {
        const navButtons = document.querySelector('.nav-buttons');
        if (!navButtons) return;

        if (this.currentUser) {
            // Xóa nút đăng nhập/đăng ký
            navButtons.innerHTML = '';

            // Thêm tên người dùng và nút đăng xuất
            const userInfo = document.createElement('span');
            userInfo.className = 'user-info';
            userInfo.innerHTML = `
                <span class="user-name">Xin chào, ${this.currentUser.name}${this.currentUser.isAdmin ? ' (Admin)' : ''}</span>
                <button class="btn logout-btn">Đăng xuất</button>
            `;
            navButtons.appendChild(userInfo);

            // Ẩn/hiện nút "Đăng tải phim" dựa trên quyền admin
            const uploadLink = document.querySelector('a[href="upload.html"]');
            if (uploadLink) {
                uploadLink.style.display = this.currentUser.isAdmin ? 'block' : 'none';
            }

            // Thêm event listener cho nút đăng xuất
            const logoutBtn = navButtons.querySelector('.logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => this.handleLogout());
            }
        } else {
            // Khôi phục nút đăng nhập/đăng ký
            navButtons.innerHTML = `
                <button class="btn login-btn">Đăng nhập</button>
                <button class="btn register-btn">Đăng ký</button>
            `;

            // Thêm lại event listeners
            const loginBtn = navButtons.querySelector('.login-btn');
            const registerBtn = navButtons.querySelector('.register-btn');
            
            if (loginBtn) {
                loginBtn.addEventListener('click', () => {
                    const loginModal = document.getElementById('loginModal');
                    if (loginModal) loginModal.style.display = 'block';
                });
            }
            
            if (registerBtn) {
                registerBtn.addEventListener('click', () => {
                    const registerModal = document.getElementById('registerModal');
                    if (registerModal) registerModal.style.display = 'block';
                });
            }
        }
    }

    // Kiểm tra quyền admin và chuyển hướng nếu không phải admin
    checkAdminAccess() {
        if (!this.currentUser || !this.currentUser.isAdmin) {
            alert('Chỉ quản trị viên mới có quyền đăng tải phim!');
            window.location.href = 'index.html';
        }
    }

    // Kiểm tra đăng nhập
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Kiểm tra quyền admin
    isAdmin() {
        return this.currentUser?.isAdmin || false;
    }

    // Lấy thông tin người dùng hiện tại
    getCurrentUser() {
        return this.currentUser;
    }

    // Thêm phim vào danh sách yêu thích
    addToFavorites(movieId) {
        if (!this.currentUser) return false;

        if (!this.currentUser.favoriteMovies.includes(movieId)) {
            this.currentUser.favoriteMovies.push(movieId);
            this.updateUserData();
            return true;
        }
        return false;
    }

    // Cập nhật lịch sử xem
    addToWatchHistory(movieId) {
        if (!this.currentUser) return;

        const now = new Date();
        this.currentUser.watchHistory.push({
            movieId,
            watchedAt: now.toISOString()
        });
        this.updateUserData();
    }

    // Cập nhật dữ liệu người dùng trong localStorage
    updateUserData() {
        // Cập nhật trong mảng users
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            localStorage.setItem('users', JSON.stringify(this.users));
        }

        // Cập nhật currentUser
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
}

// Khởi tạo AuthManager khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});