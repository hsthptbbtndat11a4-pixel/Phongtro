class VideoHandler {
    constructor() {
        this.videoStorage = {};
        this.loadVideos();
    }

    loadVideos() {
        // Tải danh sách video từ localStorage
        this.videoStorage = JSON.parse(localStorage.getItem('videoStorage')) || {};
    }

    saveVideo(videoId, videoData) {
        this.videoStorage[videoId] = videoData;
        localStorage.setItem('videoStorage', JSON.stringify(this.videoStorage));
    }

    getVideo(videoId) {
        return this.videoStorage[videoId];
    }

    deleteVideo(videoId) {
        if (this.videoStorage[videoId]) {
            delete this.videoStorage[videoId];
            localStorage.setItem('videoStorage', JSON.stringify(this.videoStorage));
            return true;
        }
        return false;
    }

    async uploadToCloud(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const videoData = {
                    id: Date.now().toString(),
                    data: e.target.result,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    uploadDate: new Date().toISOString()
                };
                this.saveVideo(videoData.id, videoData);
                resolve(videoData.id);
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    createVideoPlayer(videoId, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const videoData = this.getVideo(videoId);
        if (!videoData) return null;

        const video = document.createElement('video');
        video.controls = true;
        video.style.width = '100%';
        video.style.maxHeight = '500px';
        
        // Tạo source từ base64 data
        const source = document.createElement('source');
        source.src = videoData.data;
        source.type = videoData.type;
        
        video.appendChild(source);
        container.innerHTML = '';
        container.appendChild(video);
        
        return video;
    }
}