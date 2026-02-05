// Get movie ID from URL
function getMovieIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Populate movie details
function populateMovieDetails() {
    const movieId = getMovieIdFromUrl();
    const movie = movies.find(m => m.id === parseInt(movieId));
    
    if (!movie) {
        // Handle movie not found
        window.location.href = 'index.html';
        return;
    }

    // Set page title
    document.title = `${movie.title} - MovieFlix`;

    // Set backdrop and poster
    document.getElementById('movieBackdrop').src = movie.imageUrl || movie.posterUrl;
    document.getElementById('movieBackdrop').alt = movie.title;
    document.getElementById('moviePoster').src = movie.posterUrl;
    document.getElementById('moviePoster').alt = movie.title;

    // Set movie info
    document.querySelector('.movie-title').textContent = movie.title;
    document.querySelector('.movie-meta .year').textContent = movie.releaseYear;
    document.querySelector('.movie-meta .duration').textContent = movie.duration;
    document.querySelector('.movie-meta .rating').textContent = `⭐ ${movie.rating}`;
    
    // Set genres
    const genresContainer = document.querySelector('.movie-genres');
    movie.genre.forEach(genre => {
        const genreTag = document.createElement('span');
        genreTag.className = 'genre-tag';
        genreTag.textContent = genre;
        genresContainer.appendChild(genreTag);
    });

    // Set description
    document.querySelector('.movie-description').textContent = movie.description;

    // Add button event listeners
    document.querySelector('.play-btn').addEventListener('click', () => watchMovie(movie.id));
    document.querySelector('.trailer-btn').addEventListener('click', () => watchTrailer(movie.trailerUrl));

    // Populate similar movies
    populateSimilarMovies(movie);
}

// Populate similar movies based on genres
function populateSimilarMovies(currentMovie) {
    const similarMovies = movies
        .filter(movie => 
            movie.id !== currentMovie.id && 
            movie.genre.some(genre => currentMovie.genre.includes(genre))
        )
        .slice(0, 6); // Limit to 6 similar movies

    const movieGrid = document.querySelector('.similar-movies .movie-grid');
    
    similarMovies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        card.innerHTML = `
            <img src="${movie.posterUrl}" alt="${movie.title}" class="movie-poster">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-meta">
                    <span>${movie.releaseYear}</span> • 
                    <span>${movie.duration}</span> • 
                    <span>⭐ ${movie.rating}</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            window.location.href = `movie-detail.html?id=${movie.id}`;
        });
        
        movieGrid.appendChild(card);
    });
}

// Movie Functions
function watchMovie(movieId) {
    const movie = movies.find(m => m.id === movieId);
    if (!movie) return;
    
    // Kiểm tra đăng nhập
    if (!window.authManager.isLoggedIn()) {
        alert('Vui lòng đăng nhập để xem phim');
        return;
    }

    // Tạo video player
    const videoContainer = document.createElement('div');
    videoContainer.id = 'videoPlayer';
    videoContainer.className = 'video-player-container';
    
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
        <div class="video-modal-content">
            <span class="close-video">&times;</span>
            <h2>${movie.title}</h2>
            <div id="videoContainer"></div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Tạo player
    const player = window.videoHandler.createVideoPlayer(movie.videoId, 'videoContainer');
    if (!player) {
        alert('Không thể tải video. Vui lòng thử lại sau.');
        return;
    }
    
    // Xử lý đóng modal
    const closeBtn = modal.querySelector('.close-video');
    closeBtn.onclick = () => {
        player.pause();
        modal.remove();
    };
    
    // Cập nhật lượt xem
    movie.views = (movie.views || 0) + 1;
    localStorage.setItem('movies', JSON.stringify(movies));
}

function watchTrailer(trailerUrl) {
    // Open trailer in new tab
    window.open(trailerUrl, '_blank');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    populateMovieDetails();
});