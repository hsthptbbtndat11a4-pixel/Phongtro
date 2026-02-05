// Dữ liệu phim mẫu
const movies = [
    {
        id: 1,
        title: "Avengers: Endgame",
        description: "Sau sự kiện Thanos xóa sổ nửa vũ trụ, các Avengers còn lại phải tập hợp một lần nữa để đảo ngược tình thế và khôi phục trật tự.",
        posterUrl: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
        releaseYear: 2019,
        duration: "3h 1m",
        rating: 8.4,
        genre: ["Hành động", "Phiêu lưu", "Khoa học viễn tưởng"],
        trailerUrl: "https://www.youtube.com/embed/TcMBFSGVi1c"
    },
    {
        id: 4,
        title: "The Batman",
        description: "Trong năm thứ hai chiến đấu với tội phạm, Batman phải điều tra một kẻ giết người hàng loạt bí ẩn đang khủng bố Gotham City.",
        posterUrl: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
        releaseYear: 2022,
        duration: "2h 56m",
        rating: 7.8,
        genre: ["Hành động", "Tội phạm", "Ly kì"],
        trailerUrl: "https://www.youtube.com/embed/mqqft2x_Aa4"
    },
    {
        id: 5,
        title: "Top Gun: Maverick",
        description: "Sau hơn 30 năm phục vụ, Pete 'Maverick' Mitchell trở lại trường đào tạo phi công để huấn luyện thế hệ mới cho một nhiệm vụ đặc biệt.",
        posterUrl: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
        releaseYear: 2022,
        duration: "2h 11m",
        rating: 8.3,
        genre: ["Hành động", "Kịch tính"],
        trailerUrl: "https://www.youtube.com/embed/giXco2jaZ_4"
    },
    {
        id: 6,
        title: "Dune",
        description: "Một gia đình quý tộc tranh giành quyền kiểm soát sa mạc Arrakis và nguồn tài nguyên quý giá nhất vũ trụ.",
        posterUrl: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
        releaseYear: 2021,
        duration: "2h 35m",
        rating: 7.9,
        genre: ["Phiêu lưu", "Khoa học viễn tưởng"],
        trailerUrl: "https://www.youtube.com/embed/8g18jFHCLXk"
    },
    {
        id: 2,
        title: "Spider-Man: No Way Home",
        description: "Với danh tính của Spider-Man giờ đã được tiết lộ, Peter nhờ Doctor Strange giúp đỡ. Khi một câu thần chú bị sai, những kẻ thù nguy hiểm từ các thế giới khác bắt đầu xuất hiện.",
        posterUrl: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
        releaseYear: 2021,
        duration: "2h 28m",
        rating: 8.3,
        genre: ["Hành động", "Phiêu lưu", "Khoa học viễn tưởng"],
        trailerUrl: "https://www.youtube.com/embed/JfVOs4VSpmA"
    },
    {
        id: 3,
        title: "Inception",
        description: "Một tên trộm có khả năng chiếm đoạt bí mật thương mại từ giấc mơ được trao nhiệm vụ ngược lại: Cấy một ý tưởng vào tâm trí của một CEO.",
        posterUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
        releaseYear: 2010,
        duration: "2h 28m",
        rating: 8.8,
        genre: ["Hành động", "Phiêu lưu", "Khoa học viễn tưởng"],
        trailerUrl: "https://www.youtube.com/embed/YoHD9XEInc0"
    },
    // Thêm nhiều phim khác ở đây
];

// Phim cho hero slider
const heroMovies = [
    {
        id: 1,
        title: "Avengers: Endgame",
        description: "Cuộc chiến cuối cùng để cứu lấy một nửa vũ trụ đã bị Thanos xóa sổ.",
        imageUrl: "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
        trailerUrl: "https://www.youtube.com/embed/TcMBFSGVi1c"
    },
    {
        id: 2,
        title: "Spider-Man: No Way Home",
        description: "Khi quá khứ và hiện tại va chạm, Peter Parker phải khám phá ý nghĩa thực sự của việc trở thành Spider-Man.",
        imageUrl: "https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg",
        trailerUrl: "https://www.youtube.com/embed/JfVOs4VSpmA"
    },
    {
        id: 3,
        title: "Inception",
        description: "Một hành trình vào những giấc mơ sâu nhất của tâm trí con người.",
        imageUrl: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
        trailerUrl: "https://www.youtube.com/embed/YoHD9XEInc0"
    }
];