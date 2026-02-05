// Initialize Swiper
const heroSwiper = new Swiper('.hero-slider', {
    loop: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});

// Populate Hero Slider
function populateHeroSlider() {
    const swiperWrapper = document.querySelector('.hero-slider .swiper-wrapper');
    
    heroMovies.forEach(movie => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide hero-slide';
        
        slide.innerHTML = `
            <img src="${movie.imageUrl}" alt="${movie.title}" class="slide-image">
            <div class="slide-content">
                <h2 class="slide-title">${movie.title}</h2>
                <p class="slide-description">${movie.description}</p>
                <div class="slide-buttons">
                    <button class="btn register-btn" onclick="watchMovie(${movie.id})">
                        <i class="fas fa-play"></i> Xem phim
                    </button>
                    <button class="btn login-btn" onclick="watchTrailer('${movie.trailerUrl}')">
                        <i class="fas fa-film"></i> Trailer
                    </button>
                </div>
            </div>
        `;
        
        swiperWrapper.appendChild(slide);
    });
}

// Populate Movie Grids
function populateMovieGrid() {
    const movieGrids = document.querySelectorAll('.movie-grid');
    
    movieGrids.forEach(grid => {
        movies.forEach(movie => {
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
            
            card.addEventListener('click', () => showMovieDetails(movie));
            grid.appendChild(card);
        });
    });
}

// Modal Management
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginBtn = document.querySelector('.login-btn');
const registerBtn = document.querySelector('.register-btn');
const closeBtns = document.querySelectorAll('.close');
const switchFormBtns = document.querySelectorAll('.switch-form');

function showModal(modal) {
    modal.style.display = 'block';
}

function hideModal(modal) {
    modal.style.display = 'none';
}

loginBtn.addEventListener('click', () => showModal(loginModal));
registerBtn.addEventListener('click', () => showModal(registerModal));

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        hideModal(loginModal);
        hideModal(registerModal);
    });
});

switchFormBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const formToShow = btn.dataset.form === 'login' ? loginModal : registerModal;
        const formToHide = btn.dataset.form === 'login' ? registerModal : loginModal;
        hideModal(formToHide);
        showModal(formToShow);
    });
});

// Form Handling
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    // Implement login logic here
    console.log('Login attempted');
    hideModal(loginModal);
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    // Implement registration logic here
    console.log('Registration attempted');
    hideModal(registerModal);
});

// Movie Functions
function watchMovie(movieId) {
    // Implement movie watching logic
    console.log(`Playing movie ${movieId}`);
}

function watchTrailer(trailerUrl) {
    // Implement trailer watching logic
    window.open(trailerUrl, '_blank');
}

function showMovieDetails(movie) {
    // Implement movie details modal/page
    console.log('Showing details for:', movie.title);
}

// Search functionality
const searchInput = document.querySelector('.search-box input');
const searchIcon = document.querySelector('.search-icon');

function performSearch(query) {
    // Implement search logic
    console.log('Searching for:', query);
}

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch(searchInput.value);
    }
});

searchIcon.addEventListener('click', () => {
    performSearch(searchInput.value);
});

// Mobile Menu Toggle
const menuIcon = document.querySelector('.menu-icon');
const menu = document.querySelector('.menu');

menuIcon.addEventListener('click', () => {
    menu.classList.toggle('active');
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    populateHeroSlider();
    populateMovieGrid();
});