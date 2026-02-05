class MovieUploader {
    constructor() {
        this.uploadForm = document.getElementById('uploadForm');
        this.myUploadsGrid = document.getElementById('myUploadsGrid');
        this.uploadedMovies = JSON.parse(localStorage.getItem('uploadedMovies')) || [];
        this.genres = new Set(); // Theo dõi thể loại đã thêm
        this.isEditing = false;
        this.editingId = null;
        
        this.init();
        this.loadMyUploads();
        this.setupValidation();
        this.setupDragAndDrop();
        this.updateStats();
    }

    // Thêm các phương thức validation
    setupValidation() {
        const titleInput = document.getElementById('movieTitle');
        titleInput.addEventListener('input', () => {
            const error = this.validateTitle(titleInput.value);
            this.showInputError(titleInput, error);
        });

        const yearInput = document.getElementById('releaseYear');
        yearInput.addEventListener('input', () => {
            const error = this.validateYear(yearInput.value);
            this.showInputError(yearInput, error);
        });

        const durationInput = document.getElementById('duration');
        durationInput.addEventListener('input', () => {
            const error = this.validateDuration(durationInput.value);
            this.showInputError(durationInput, error);
        });

        const videoInput = document.getElementById('movieFile');
        videoInput.addEventListener('change', () => {
            const error = this.validateVideoFile(videoInput.files[0]);
            this.showInputError(videoInput, error);
        });
    }

    validateTitle(title) {
        if (title.length < 3) return 'Tiêu đề phải có ít nhất 3 ký tự';
        if (title.length > 100) return 'Tiêu đề không được quá 100 ký tự';
        return '';
    }

    validateYear(year) {
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear + 5) {
            return `Năm phải từ 1900 đến ${currentYear + 5}`;
        }
        return '';
    }

    validateDuration(duration) {
        if (!duration.match(/^\d+h\s*\d*m$|^\d+m$/)) {
            return 'Định dạng không hợp lệ. Ví dụ: 2h 30m hoặc 90m';
        }
        return '';
    }

    validateVideoFile(file) {
        if (!file) return '';
        
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (!validTypes.includes(file.type)) {
            return 'Chỉ chấp nhận file MP4, WebM hoặc Ogg';
        }

        // Giới hạn 500MB
        const maxSize = 500 * 1024 * 1024;
        if (file.size > maxSize) {
            return 'File không được quá 500MB';
        }

        return '';
    }

    showInputError(input, error) {
        const container = input.parentElement;
        let errorDiv = container.querySelector('.error-message');
        
        if (!errorDiv && error) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            container.appendChild(errorDiv);
        }

        if (errorDiv) {
            errorDiv.textContent = error;
            errorDiv.style.display = error ? 'block' : 'none';
        }

        input.style.borderColor = error ? '#ff4444' : '';
    }

    init() {
        // Kiểm tra đăng nhập
        if (!window.authManager?.isLoggedIn()) {
            window.location.href = 'index.html';
            return;
        }

        // Xử lý preview ảnh
        const posterInput = document.getElementById('moviePoster');
        posterInput.addEventListener('change', (e) => this.handleImagePreview(e));

        // Xử lý preview video
        const videoInput = document.getElementById('movieFile');
        videoInput.addEventListener('change', (e) => this.handleVideoPreview(e));

        // Xử lý form submit
        this.uploadForm.addEventListener('submit', (e) => this.handleUpload(e));

        // Thiết lập drag & drop
        this.setupDragAndDrop();

        // Hiển thị thống kê
        this.updateStats();
    }

    setupDragAndDrop() {
        const containers = [
            document.getElementById('posterPreview'),
            document.getElementById('videoPreview')
        ];

        containers.forEach(container => {
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                container.classList.add('dragover');
            });

            container.addEventListener('dragleave', () => {
                container.classList.remove('dragover');
            });

            container.addEventListener('drop', (e) => {
                e.preventDefault();
                container.classList.remove('dragover');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    const file = files[0];
                    const isVideo = container.id === 'videoPreview';
                    
                    if (isVideo && file.type.startsWith('video/')) {
                        document.getElementById('movieFile').files = files;
                        this.handleVideoPreview({ target: { files: [file] }});
                    } else if (!isVideo && file.type.startsWith('image/')) {
                        document.getElementById('moviePoster').files = files;
                        this.handleImagePreview({ target: { files: [file] }});
                    }
                }
            });
        });
    }

    updateStats() {
        const currentUser = window.authManager.getCurrentUser();
        if (!currentUser) return;

        const myMovies = this.uploadedMovies.filter(movie => movie.uploadedBy === currentUser.id);
        const stats = {
            totalUploads: myMovies.length,
            totalViews: myMovies.reduce((sum, movie) => sum + (movie.views || 0), 0),
            averageRating: this.calculateAverageRating(myMovies),
            mostViewed: this.getMostViewedMovie(myMovies)
        };

        const statsHtml = `
            <div class="upload-stats">
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${stats.totalUploads}</div>
                        <div class="stat-label">Phim đã đăng</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${stats.totalViews}</div>
                        <div class="stat-label">Lượt xem</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${stats.averageRating.toFixed(1)}⭐</div>
                        <div class="stat-label">Đánh giá trung bình</div>
                    </div>
                    ${stats.mostViewed ? `
                        <div class="stat-item">
                            <div class="stat-value">${stats.mostViewed.views}</div>
                            <div class="stat-label">Lượt xem cao nhất</div>
                            <div class="stat-sublabel">${stats.mostViewed.title}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        const myUploadsSection = document.querySelector('.my-uploads');
        if (myUploadsSection.previousElementSibling?.classList.contains('upload-stats')) {
            myUploadsSection.previousElementSibling.remove();
        }
        myUploadsSection.insertAdjacentHTML('beforebegin', statsHtml);
    }

    handleImagePreview(e) {
        const file = e.target.files[0];
        const preview = document.getElementById('posterPreview');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="Poster Preview">`;
            };
            reader.readAsDataURL(file);
        }
    }

    handleVideoPreview(e) {
        const file = e.target.files[0];
        const preview = document.getElementById('videoPreview');
        
        if (file) {
            const video = document.createElement('video');
            video.controls = true;
            video.src = URL.createObjectURL(file);
            preview.innerHTML = '';
            preview.appendChild(video);
        }
    }

    async handleUpload(e) {
        e.preventDefault();

        try {
            const currentUser = window.authManager.getCurrentUser();
            if (!currentUser) {
                throw new Error('Vui lòng đăng nhập để đăng tải phim');
            }

            // Kiểm tra đăng nhập
            if (!window.authManager.isLoggedIn()) {
                throw new Error('Vui lòng đăng nhập để đăng tải phim');
            }

            // Validate all fields before proceeding
            const errors = this.validateForm();
            if (errors.length > 0) {
                throw new Error(errors.join('\n'));
            }

            const formData = this.getFormData();
            
            // Chuyển file thành base64
            const posterBase64 = await this.fileToBase64(formData.poster);
            const videoBase64 = await this.fileToBase64(formData.video);

            // Lưu file vào localStorage với mã hóa base64
            const movieFiles = JSON.parse(localStorage.getItem('movieFiles')) || {};
            const fileId = Date.now().toString();
            movieFiles[fileId] = {
                poster: posterBase64,
                video: videoBase64
            };

            // Lưu files
            localStorage.setItem('movieFiles', JSON.stringify(movieFiles));

            const movieData = {
                id: Date.now(),
                title: formData.title,
                description: formData.description,
                releaseYear: parseInt(formData.releaseYear),
                duration: formData.duration,
                genre: formData.genres.split(',').map(g => g.trim()),
                trailerUrl: formData.trailerUrl,
                fileId: fileId,
                uploadedBy: currentUser.id,
                uploadedAt: new Date().toISOString(),
                views: 0,
                rating: 0,
                ratings: []
            };

            // Lưu vào localStorage
            this.uploadedMovies.push(movieData);
            localStorage.setItem('uploadedMovies', JSON.stringify(this.uploadedMovies));

            // Thêm vào danh sách phim chung
            window.movies.push({
                ...movieData,
                posterUrl: posterBase64,
                videoUrl: videoBase64
            });

            this.showStatus('Đăng tải phim thành công!', 'success');
            this.uploadForm.reset();
            document.getElementById('posterPreview').innerHTML = '';
            document.getElementById('videoPreview').innerHTML = '';

            // Cập nhật grid phim đã đăng
            this.loadMyUploads();

        } catch (error) {
            console.error('Upload error:', error);
            this.showStatus(error.message || 'Có lỗi xảy ra khi đăng tải phim', 'error');
        }
    }

    getFormData() {
        return {
            title: document.getElementById('movieTitle').value,
            description: document.getElementById('movieDescription').value,
            releaseYear: document.getElementById('releaseYear').value,
            duration: document.getElementById('duration').value,
            genres: document.getElementById('genres').value,
            trailerUrl: document.getElementById('trailerUrl').value,
            poster: document.getElementById('moviePoster').files[0],
            video: document.getElementById('movieFile').files[0]
        };
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    loadMyUploads() {
        const currentUser = window.authManager.getCurrentUser();
        if (!currentUser || !this.myUploadsGrid) return;

        // Lọc phim của người dùng hiện tại
        const myMovies = this.uploadedMovies.filter(movie => movie.uploadedBy === currentUser.id);
        const movieFiles = JSON.parse(localStorage.getItem('movieFiles')) || {};
        
        // Hiển thị grid
        this.myUploadsGrid.innerHTML = '';
        myMovies.forEach(movie => {
            const movieFile = movieFiles[movie.fileId] || {};
            const movieWithFiles = {
                ...movie,
                posterUrl: movieFile.poster,
                videoUrl: movieFile.video
            };
            const card = this.createMovieCard(movieWithFiles);
            this.myUploadsGrid.appendChild(card);
        });
    }

    createMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        card.innerHTML = `
            <img src="${movie.posterUrl}" alt="${movie.title}" class="movie-poster">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-meta">
                    <span>${movie.releaseYear}</span> • 
                    <span>${movie.duration}</span> •
                    <span>${movie.views || 0} lượt xem</span>
                </div>
            </div>
            <div class="action-buttons">
                <button class="action-btn edit-btn" title="Chỉnh sửa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Thêm event listeners cho các nút
        card.querySelector('.edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.editMovie(movie.id);
        });

        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteMovie(movie.id);
        });

        card.addEventListener('click', () => {
            window.location.href = `movie-detail.html?id=${movie.id}`;
        });

        return card;
    }

    editMovie(movieId) {
        const movie = this.uploadedMovies.find(m => m.id === movieId);
        if (!movie) return;

        this.isEditing = true;
        this.editingId = movieId;

        // Điền thông tin vào form
        document.getElementById('movieTitle').value = movie.title;
        document.getElementById('movieDescription').value = movie.description;
        document.getElementById('releaseYear').value = movie.releaseYear;
        document.getElementById('duration').value = movie.duration;
        document.getElementById('genres').value = movie.genre.join(', ');
        document.getElementById('trailerUrl').value = movie.trailerUrl || '';

        // Hiển thị preview
        document.getElementById('posterPreview').innerHTML = 
            `<img src="${movie.posterUrl}" alt="Poster Preview">`;
        document.getElementById('videoPreview').innerHTML = 
            `<video src="${movie.videoUrl}" controls></video>`;

        // Thay đổi text nút submit
        const submitBtn = this.uploadForm.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Lưu thay đổi';

        // Cuộn lên form
        this.uploadForm.scrollIntoView({ behavior: 'smooth' });
    }

    deleteMovie(movieId) {
        if (!confirm('Bạn có chắc chắn muốn xóa phim này?')) return;

        const index = this.uploadedMovies.findIndex(m => m.id === movieId);
        if (index === -1) return;

        const movie = this.uploadedMovies[index];
        const movieFiles = JSON.parse(localStorage.getItem('movieFiles')) || {};

        // Xóa files
        if (movie.fileId && movieFiles[movie.fileId]) {
            delete movieFiles[movie.fileId];
            localStorage.setItem('movieFiles', JSON.stringify(movieFiles));
        }

        // Xóa khỏi danh sách
        this.uploadedMovies.splice(index, 1);
        localStorage.setItem('uploadedMovies', JSON.stringify(this.uploadedMovies));

        // Xóa khỏi danh sách phim chung
        const movieIndex = window.movies.findIndex(m => m.id === movieId);
        if (movieIndex !== -1) {
            window.movies.splice(movieIndex, 1);
        }

        // Cập nhật UI
        this.loadMyUploads();
        this.updateStats();
        this.showStatus('Đã xóa phim thành công!', 'success');
    }

    showStatus(message, type) {
        const status = document.createElement('div');
        status.className = `upload-status ${type}`;
        status.textContent = message;
        document.body.appendChild(status);
        
        // Show with animation
        status.style.display = 'block';
        status.style.opacity = '1';

        // Auto hide after 3 seconds
        setTimeout(() => {
            status.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(status);
            }, 300);
        }, 3000);
    }
}

// Khởi tạo uploader khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
    window.movieUploader = new MovieUploader();
});