// YouTube 2.0 - JavaScript (Fixed Version)
document.addEventListener('DOMContentLoaded', () => {
    // ==================== ДАННЫЕ ====================
    
    // Каналы
    const channels = {
        GreenLine: {
            id: '',
            name: 'GreenLine Creator',
            handle: '@GreenLine_Creator',
            avatar: 'GC',
            color: 'linear-gradient(135deg, #006400 0%, #006400 100%)',
            subscribers: 48800,
            description: 'Выкладываю сообственные видео но я создатель этой платформы'
        },
        myChannel: {
            id: 'myChannel',
            name: 'Мой канал',
            handle: '@mychannel',
            avatar: 'М',
            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 60%)',
            subscribers: 0,
            description: 'Мой личный канал на GreenLine',
            banner: '',
            avatarImg: '' // if set, replaces avatar letter
        }
    };
    // Load saved channel data
    function loadMyChannel() {
        try {
            const saved = localStorage.getItem('youtube2_myChannel');
            if (saved) {
                const savedData = JSON.parse(saved);
                channels.myChannel = { ...channels.myChannel, ...savedData };
            }
        } catch (e) {
            console.error('Error loading My Channel', e);
        }
    }
    loadMyChannel();
    function saveMyChannel() {
        try {
            // Save only customizable fields
            const dataToSave = {
                name: channels.myChannel.name,
                handle: channels.myChannel.handle,
                description: channels.myChannel.description,
                avatar: channels.myChannel.avatar,
                banner: channels.myChannel.banner,
                avatarImg: channels.myChannel.avatarImg
            };
            localStorage.setItem('youtube2_myChannel', JSON.stringify(dataToSave));
        } catch (e) {
            console.error('Error saving My Channel', e);
        }
    }
    // Базовые видео (всегда доступны)
    const defaultVideos = [
        {
            id: 'v1',
            title: 'Shaders and textures',
            channelId: 'GreenLine',
            thumbnail: 'wow.jpg',
            videoSrc: 'Video/wow/wow.mp4',
            duration: '11:37',
            views: 1,
            uploadDate: '2026.01.29',
            likes: 0,
            description: 'Шейдеры...',
            isDefault: true
        }


    ];
    // Массив всех видео
    let videos = [...defaultVideos];
    
    // Загруженные пользователем видео (хранятся отдельно)
    let uploadedVideos = [];
    // Состояние пользователя
    let userState = {
        subscriptions: [],
        likedVideos: [],
        dislikedVideos: [],
        watchHistory: []
    };
    // ==================== ЛОКАЛЬНОЕ ХРАНИЛИЩЕ ====================
    function loadUserState() {
        try {
            const saved = localStorage.getItem('youtube2_userState');
            if (saved) {
                userState = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Ошибка загрузки состояния:', e);
        }
    }
    function saveUserState() {
        try {
            localStorage.setItem('youtube2_userState', JSON.stringify(userState));
        } catch (e) {
            console.error('Ошибка сохранения состояния:', e);
        }
    }
    function loadUploadedVideos() {
        try {
            const saved = localStorage.getItem('youtube2_uploadedVideos');
            if (saved) {
                const loadedVideos = JSON.parse(saved);
                // Фильтруем видео без источника (blob URL потеряны после перезагрузки)
                uploadedVideos = loadedVideos.filter(v => v.videoSrc && v.videoSrc.length > 0);
                
                // Если были удалены недоступные видео, обновляем хранилище
                if (uploadedVideos.length !== loadedVideos.length) {
                    console.log('Очищены недоступные видео:', loadedVideos.length - uploadedVideos.length);
                    saveUploadedVideos();
                }
                
                // Добавляем загруженные видео к основному списку
                videos = [...uploadedVideos, ...defaultVideos];
            }
        } catch (e) {
            console.error('Ошибка загрузки видео:', e);
        }
    }
    function saveUploadedVideos() {
        try {
            // Сохраняем загруженные видео
            // Примечание: blob URLs работают только в текущей сессии браузера
            // После перезагрузки страницы видео без реального файла будут удалены
            const videosToSave = uploadedVideos.map(v => ({
                ...v,
                // Сохраняем thumbnail если он не blob, иначе используем заглушку
                thumbnail: (v.thumbnail && v.thumbnail.startsWith('blob:')) ? 'Logo.png' : (v.thumbnail || 'Logo.png')
            }));
            localStorage.setItem('youtube2_uploadedVideos', JSON.stringify(videosToSave));
        } catch (e) {
            console.error('Ошибка сохранения видео:', e);
        }
    }
    // Очистка старых данных при первой загрузке
    function clearOldData() {
        // Удаляем старые ключи если есть
        localStorage.removeItem('youtubeUserState');
        localStorage.removeItem('youtubeVideos');
    }
    // Инициализация данных
    clearOldData();
    loadUserState();
    loadUploadedVideos();
    // ==================== ЭЛЕМЕНТЫ DOM ====================
    
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarMyChannel = document.getElementById('sidebarMyChannel');
    const editChannelBtn = document.getElementById('editChannelBtn');
    const editChannelModal = document.getElementById('editChannelModal');
    const closeEditChannelModal = document.getElementById('closeEditChannelModal');
    const editChannelForm = document.getElementById('editChannelForm');
    const channelNameInput = document.getElementById('channelNameInput');
    const channelHandleInput = document.getElementById('channelHandleInput');
    const channelDescInput = document.getElementById('channelDescInput');
    const avatarInput = document.getElementById('avatarInput');
    const bannerInput = document.getElementById('bannerInput');
    const editAvatarImg = document.getElementById('editAvatarImg');
    const editAvatarText = document.getElementById('editAvatarText');
    const editBannerImg = document.getElementById('editBannerImg');
    const bannerPlaceholder = document.getElementById('bannerPlaceholder');
    const mainContent = document.getElementById('mainContent');
    const homeBtn = document.getElementById('homeBtn');
    const sidebarHome = document.getElementById('sidebarHome');
    const sidebarSubscriptions = document.getElementById('sidebarSubscriptions');
    const sidebarLiked = document.getElementById('sidebarLiked');
    const videosGrid = document.getElementById('videosGrid');
    const videoModal = document.getElementById('videoModal');
    const videoPlayer = document.getElementById('videoPlayer');
    const closeModal = document.getElementById('closeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMeta = document.getElementById('modalMeta');
    const modalChannelAvatar = document.getElementById('modalChannelAvatar');
    const modalChannelName = document.getElementById('modalChannelName');
    const modalChannelSubs = document.getElementById('modalChannelSubs');
    const modalSubscribeBtn = document.getElementById('modalSubscribeBtn');
    const likeBtn = document.getElementById('likeBtn');
    const likeCount = document.getElementById('likeCount');
    const dislikeBtn = document.getElementById('dislikeBtn');
    const searchInput = document.getElementById('searchInput');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadModal = document.getElementById('uploadModal');
    const closeUploadModal = document.getElementById('closeUploadModal');
    const uploadForm = document.getElementById('uploadForm');
    const uploadDropzone = document.getElementById('uploadDropzone');
    const videoFileInput = document.getElementById('videoFileInput');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewVideo = document.getElementById('previewVideo');
    const thumbnailUpload = document.getElementById('thumbnailUpload');
    const thumbnailInput = document.getElementById('thumbnailInput');
    const thumbnailPreview = document.getElementById('thumbnailPreview');
    const thumbnailImg = document.getElementById('thumbnailImg');
    const subscriptionsList = document.getElementById('subscriptionsList');
    // Страницы
    const homePage = document.getElementById('homePage');
    const channelPage = document.getElementById('channelPage');
    const subscriptionsPage = document.getElementById('subscriptionsPage');
    const likedPage = document.getElementById('likedPage');
    // Текущее состояние
    let currentVideo = null;
    let currentChannel = null;
    let uploadedVideoURL = null;
    let uploadedThumbnailURL = null;
    let uploadedVideoDuration = '0:00';
    // ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + ' млн';
        } else if (num >= 1000) {
            return Math.floor(num / 1000) + ' тыс.';
        }
        return num.toString();
    }
    function formatViews(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + ' млн просмотров';
        } else if (num >= 1000) {
            return Math.floor(num / 1000) + ' тыс. просмотров';
        } else if (num === 0) {
            return 'Нет просмотров';
        } else if (num === 1) {
            return '1 просмотр';
        }
        return num + ' просмотров';
    }
    function showNotification(message, type = 'success') {
        // Удаляем предыдущие уведомления
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    function getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Только что';
        return ' %{minutes} мин. назад';
    }

    // ===== ПЕРЕМЕШИВАНИЕ ВИДЕО =====
    function shuffleContainer(container) {

        const items = Array.from(container.children);
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
                        }

                container.innerHTML = '';
                items.forEach(item => container.appendChild(item));
                }

     // ==================== РЕНДЕРИНГ ====================
    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + ' млн';
        } else if (num >= 1000) {
            return Math.floor(num / 1000) + ' тыс.';
        }
        return num.toString();
    }
    function formatViews(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + ' млн просмотров';
        } else if (num >= 1000) {
            return Math.floor(num / 1000) + ' тыс. просмотров';
        } else if (num === 0) {
            return 'Нет просмотров';
        } else if (num === 1) {
            return '1 просмотр';
        }
        return num + ' просмотров';
    }
    function showNotification(message, type = 'success') {
        // Удаляем предыдущие уведомления
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    function getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1) return 'Только что';
        if (minutes < 60) return `${minutes} мин. назад`;
        if (hours < 24) return `${hours} ч. назад`;
        if (days === 1) return 'Вчера';
        if (days < 7) return `${days} дн. назад`;
        if (days < 30) return `${Math.floor(days / 7)} нед. назад`;
        return `${Math.floor(days / 30)} мес. назад`;
    }
    // ==================== РЕНДЕРИНГ ====================
    function createVideoCard(video) {
        const channel = channels[video.channelId];
        if (!channel) return null;
        
        // Пропускаем видео без источника (удалённые/недоступные)
        if (!video.videoSrc) return null;
        
        const card = document.createElement('div');
        card.className = 'video-card';
        card.dataset.videoId = video.id;
        
        // Проверяем есть ли превью
        const thumbnailSrc = video.thumbnail || 'Logo.png';
        
        card.innerHTML = `
            <div class="video-thumbnail">
                <img src="${thumbnailSrc}" alt="${video.title}" onerror="this.src='Logo.png'">
                <span class="video-duration">${video.duration}</span>
            </div>
            <div class="video-info">
                <div class="channel-avatar" data-channel="${video.channelId}" style="background: ${channel.color}">${channel.avatar}</div>
                <div class="video-details">
                    <h3 class="video-title">${video.title}</h3>
                    <p class="channel-name" data-channel="${video.channelId}">${channel.name}</p>
                    <p class="video-meta">${formatViews(video.views)} • ${video.uploadDate}</p>
                </div>
            </div>
        `;
        
        // Автоисправление длительности (только для видео с некорректной длительностью, чтобы не тормозить загрузку)
        if (video.videoSrc && !video.durationChecked && (!video.duration || video.duration === '0:00')) {
            video.durationChecked = true; // Помечаем, что проверка запущена
            
            const tempVideo = document.createElement('video');
            tempVideo.preload = 'metadata';
            tempVideo.src = video.videoSrc;
            tempVideo.onloadedmetadata = () => {
                const duration = tempVideo.duration;
                if (isFinite(duration) && duration > 0) {
                    const hours = Math.floor(duration / 3600);
                    const minutes = Math.floor((duration % 3600) / 60);
                    const seconds = Math.floor(duration % 60);
                    let fmt;
                    if (hours > 0) {
                        fmt = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    } else {
                        fmt = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    }
                    
                    if (video.duration !== fmt) {
                        video.duration = fmt;
                        const durSpan = card.querySelector('.video-duration');
                        if (durSpan) durSpan.textContent = fmt;
                        
                        if (video.isUploaded) saveUploadedVideos();
                    }
                }
            };
        }

        return card;
    }
    function renderVideos(videosToRender = videos) {
        if (!videosGrid) return;
        
        videosGrid.innerHTML = '';
        
        videosToRender.forEach(video => {
            const card = createVideoCard(video);
            if (card) { 

                videosGrid.appendChild(card);

            }
        });
        
        attachVideoCardListeners();
        animateCards();
        
        shuffleContainer(videosGrid);
    }
    function animateCards() {
        const cards = document.querySelectorAll('.video-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }
    function attachVideoCardListeners() {
        // Клик по карточке видео
        document.querySelectorAll('.video-card').forEach(card => {
            card.onclick = null; // Очищаем старые обработчики
            card.addEventListener('click', function(e) {
                // Не открываем видео при клике на канал
                if (e.target.closest('.channel-avatar') || e.target.closest('.channel-name')) {
                    return;
                }
                const videoId = this.dataset.videoId;
                openVideo(videoId);
            });
        });
        // Клик по аватару или имени канала
        document.querySelectorAll('.video-card .channel-avatar, .video-card .channel-name').forEach(el => {
            el.onclick = null;
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                const channelId = this.dataset.channel;
                if (channelId) {
                    openChannelPage(channelId);
                }
            });
        });
    }
    // ==================== ВИДЕО ПЛЕЕР ====================
    function openVideo(videoId) {
        const video = videos.find(v => v.id === videoId);
        if (!video) {
            showNotification('Видео не найдено', 'error');
            return;
        }
        const channel = channels[video.channelId];
        if (!channel) {
            showNotification('Канал не найден', 'error');
            return;
        }
        currentVideo = video;
        // Увеличиваем просмотры
        video.views++;
        if (video.isUploaded) saveUploadedVideos();
        
        // Добавляем в историю
        if (!userState.watchHistory.includes(videoId)) {
            userState.watchHistory.unshift(videoId);
            if (userState.watchHistory.length > 100) {
                userState.watchHistory.pop();
            }
            saveUserState();
        }
        // Проверяем источник видео
        if (!video.videoSrc) {
            showNotification('Видео недоступно (файл был удалён)', 'error');
            return;
        }
        // Устанавливаем данные в модальное окно
        videoPlayer.src = video.videoSrc;
        modalTitle.textContent = video.title;
        modalMeta.textContent = `${formatViews(video.views)} • ${video.uploadDate}`;
        modalChannelAvatar.textContent = channel.avatar;
        modalChannelAvatar.style.background = channel.color;
        modalChannelAvatar.dataset.channel = video.channelId;
        modalChannelName.textContent = channel.name;
        modalChannelName.dataset.channel = video.channelId;
        modalChannelSubs.textContent = `${formatNumber(channel.subscribers)} подписчиков`;
        likeCount.textContent = formatNumber(video.likes);
        // Обновляем кнопки
        if (modalSubscribeBtn) modalSubscribeBtn.classList.remove('hidden');
        updateSubscribeButton(modalSubscribeBtn, video.channelId);
        updateLikeButtons(video.id);
        // Показываем модальное окно
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Воспроизводим видео
        videoPlayer.load();
        videoPlayer.play().catch(e => {
            console.log('Автовоспроизведение заблокировано:', e);
        });
    }
    function closeVideoModal() {
        videoModal.classList.remove('active');
        document.body.style.overflow = '';
        videoPlayer.pause();
        videoPlayer.removeAttribute('src');
        videoPlayer.load();
        currentVideo = null;
    }
    // ==================== ЛАЙКИ И ПОДПИСКИ ====================
    function updateSubscribeButton(button, channelId) {
        if (!button) return;
        
        if (userState.subscriptions.includes(channelId)) {
            button.textContent = 'Вы подписаны';
            button.classList.add('subscribed');
        } else {
            button.textContent = 'Подписаться';
            button.classList.remove('subscribed');
        }
    }
    function updateLikeButtons(videoId) {
        if (userState.likedVideos.includes(videoId)) {
            likeBtn.classList.add('liked');
        } else {
            likeBtn.classList.remove('liked');
        }
        if (userState.dislikedVideos.includes(videoId)) {
            dislikeBtn.classList.add('disliked');
        } else {
            dislikeBtn.classList.remove('disliked');
        }
    }
    function toggleSubscription(channelId) {
        const channel = channels[channelId];
        if (!channel) return;
        const index = userState.subscriptions.indexOf(channelId);
        if (index > -1) {
            userState.subscriptions.splice(index, 1);
            channel.subscribers = Math.max(0, channel.subscribers - 1);
            showNotification(`Вы отписались от ${channel.name}`);
        } else {
            userState.subscriptions.push(channelId);
            channel.subscribers++;
            showNotification(`Вы подписались на ${channel.name}`, 'success');
        }
        
        saveUserState();
        updateSubscriptionsList();
    }
    function toggleLike(videoId) {
        const video = videos.find(v => v.id === videoId);
        if (!video) return;
        // Убираем дизлайк если есть
        const dislikeIndex = userState.dislikedVideos.indexOf(videoId);
        if (dislikeIndex > -1) {
            userState.dislikedVideos.splice(dislikeIndex, 1);
        }
        const likeIndex = userState.likedVideos.indexOf(videoId);
        if (likeIndex > -1) {
            userState.likedVideos.splice(likeIndex, 1);
            video.likes = Math.max(0, video.likes - 1);
            showNotification('Лайк убран');
        } else {
            userState.likedVideos.push(videoId);
            video.likes++;
            showNotification('Вам понравилось видео!');
        }
        saveUserState();
        if (video.isUploaded) saveUploadedVideos();
        likeCount.textContent = formatNumber(video.likes);
        updateLikeButtons(videoId);
    }
    function toggleDislike(videoId) {
        const video = videos.find(v => v.id === videoId);
        if (!video) return;
        // Убираем лайк если есть
        const likeIndex = userState.likedVideos.indexOf(videoId);
        if (likeIndex > -1) {
            userState.likedVideos.splice(likeIndex, 1);
            video.likes = Math.max(0, video.likes - 1);
            likeCount.textContent = formatNumber(video.likes);
        }
        const dislikeIndex = userState.dislikedVideos.indexOf(videoId);
        if (dislikeIndex > -1) {
            userState.dislikedVideos.splice(dislikeIndex, 1);
        } else {
            userState.dislikedVideos.push(videoId);
            showNotification('Вы поставили дизлайк');
        }
        saveUserState();
        if (video.isUploaded) saveUploadedVideos();
        updateLikeButtons(videoId);
    }
    function updateSubscriptionsList() {
        if (!subscriptionsList) return;
        
        subscriptionsList.innerHTML = '';
        
        if (userState.subscriptions.length === 0) {
            subscriptionsList.innerHTML = '<p class="no-subs">Нет подписок</p>';
            return;
        }
        userState.subscriptions.forEach(channelId => {
            const channel = channels[channelId];
            if (channel) {
                const item = document.createElement('div');
                item.className = 'sidebar-channel';
                item.innerHTML = `
                    <div class="sidebar-channel-avatar" style="background: ${channel.color}">${channel.avatar}</div>
                    <span class="sidebar-channel-name">${channel.name}</span>
                `;
                item.addEventListener('click', () => openChannelPage(channelId));
                subscriptionsList.appendChild(item);
            }
        });
    }
    // ==================== НАВИГАЦИЯ ====================
    function hideAllPages() {
        homePage?.classList.add('hidden');
        channelPage?.classList.add('hidden');
        subscriptionsPage?.classList.add('hidden');
        likedPage?.classList.add('hidden');
        
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
    }
    function showHomePage() {
        hideAllPages();
        homePage?.classList.remove('hidden');
        sidebarHome?.classList.add('active');
        renderVideos();
    }

    function openChannelPage(channelId) {
        const channel = channels[channelId];
        if (!channel) {
            showNotification('Канал не найден', 'error');
            return;
        }

        hideAllPages();
        closeVideoModal();
        
        currentChannel = channel;
        const isMyChannel = channelId === 'myChannel';

        // Заполняем данные канала
        const avatarLarge = document.getElementById('channelAvatarLarge');
        const channelAvatarImg = document.getElementById('channelAvatarImg');
        const channelAvatarText = document.getElementById('channelAvatarText');
        const nameTitle = document.getElementById('channelNameTitle');
        const handle = document.getElementById('channelHandle');
        const subs = document.getElementById('channelSubscribers');
        const desc = document.getElementById('channelDescription');
        const videosCount = document.getElementById('channelVideosCount');
        const channelVideosGrid = document.getElementById('channelVideos');
        const subscribeBtn = document.getElementById('subscribeBtn');
        const editChannelBtn = document.getElementById('editChannelBtn');
        const channelBanner = document.getElementById('channelBanner');

        // Setup Avatar
        if (avatarLarge) {
            if (channel.avatarImg) {
                if (channelAvatarImg) {
                    channelAvatarImg.src = channel.avatarImg;
                    channelAvatarImg.classList.remove('hidden');
                }
                if (channelAvatarText) channelAvatarText.classList.add('hidden');
                avatarLarge.style.background = 'transparent';
                avatarLarge.style.border = '4px solid var(--bg-primary)';
            } else {
                if (channelAvatarImg) channelAvatarImg.classList.add('hidden');
                if (channelAvatarText) {
                    channelAvatarText.textContent = channel.avatar;
                    channelAvatarText.classList.remove('hidden');
                }
                avatarLarge.style.background = channel.color;
            }
        }

        // Setup Banner
        if(channelBanner) {
             if (channel.banner) {
                 channelBanner.style.backgroundImage = `url('${channel.banner}')`;
                 channelBanner.querySelector('.channel-banner-gradient').style.display = 'block';
             } else {
                 channelBanner.style.backgroundImage = 'none';
                 channelBanner.style.background = isMyChannel && !channel.banner ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : channel.color;
             }
        }

        if (nameTitle) nameTitle.textContent = channel.name;
        if (handle) handle.textContent = channel.handle;
        if (subs) subs.textContent = `${formatNumber(channel.subscribers)} подписчиков`;
        if (desc) desc.textContent = channel.description;

        // Видео канала
        const channelVideos = videos.filter(v => v.channelId === channelId);
        if (videosCount) videosCount.textContent = `${channelVideos.length} видео`;
        
        if (channelVideosGrid) {
            channelVideosGrid.innerHTML = '';
            
            if (channelVideos.length === 0) {
                channelVideosGrid.innerHTML = '<p class="no-videos">На этом канале пока нет видео</p>';
            } else {
                channelVideos.forEach(video => {
                    const card = createVideoCard(video);
                    if (card) channelVideosGrid.appendChild(card);
                });
            }
        }

        // Кнопка подписки / редактирования
        if (isMyChannel) {
            // Allow subscribing to self requested by user
            if (subscribeBtn) {
                subscribeBtn.classList.remove('hidden');
                updateSubscribeButton(subscribeBtn, channelId);
            }

            if (editChannelBtn) {
                 editChannelBtn.classList.remove('hidden');
                 // Remove old listeners to prevent duplicates if using addEventListener,
                 // but onclick overwrite is safer for single handler.
                 editChannelBtn.onclick = (e) => {
                     e.preventDefault();
                     console.log('Opening edit channel modal');
                     openEditChannelModal();
                 };
            }
        } else {
            if (editChannelBtn) editChannelBtn.classList.add('hidden');
            if (subscribeBtn) {
                subscribeBtn.classList.remove('hidden');
                 updateSubscribeButton(subscribeBtn, channelId);
            }
        }

        channelPage?.classList.remove('hidden');
        attachVideoCardListeners();
    }
    function showSubscriptionsPage() {
        hideAllPages();
        subscriptionsPage?.classList.remove('hidden');
        sidebarSubscriptions?.classList.add('active');
        const grid = document.getElementById('subscriptionsGrid');
        const emptyState = document.getElementById('emptySubscriptions');
        
        if (!grid) return;
        
        grid.innerHTML = '';
        if (userState.subscriptions.length === 0) {
            emptyState?.classList.remove('hidden');
            return;
        }
        emptyState?.classList.add('hidden');
        userState.subscriptions.forEach(channelId => {
            const channel = channels[channelId];
            if (channel) {
                const card = document.createElement('div');
                card.className = 'subscription-card';
                card.innerHTML = `
                    <div class="subscription-avatar" style="background: ${channel.color}">${channel.avatar}</div>
                    <p class="subscription-name">${channel.name}</p>
                    <p class="subscription-subs">${formatNumber(channel.subscribers)} подписчиков</p>
                `;
                card.addEventListener('click', () => openChannelPage(channelId));
                grid.appendChild(card);
            }
        });
    }
    function showLikedPage() {
        hideAllPages();
        likedPage?.classList.remove('hidden');
        sidebarLiked?.classList.add('active');
        const grid = document.getElementById('likedVideosGrid');
        const emptyState = document.getElementById('emptyLiked');
        
        if (!grid) return;
        
        grid.innerHTML = '';
        const likedVideos = videos.filter(v => userState.likedVideos.includes(v.id));
        if (likedVideos.length === 0) {
            emptyState?.classList.remove('hidden');
            return;
        }
        emptyState?.classList.add('hidden');
        likedVideos.forEach(video => {
            const card = createVideoCard(video);
            if (card) grid.appendChild(card);
        });
        attachVideoCardListeners();
    }
    // ==================== ЗАГРУЗКА ВИДЕО ====================
    function openUploadModal() {
        uploadModal?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeUploadModalFn() {
        uploadModal?.classList.remove('active');
        document.body.style.overflow = '';
        resetUploadForm();
    }
    function resetUploadForm() {
        if (uploadForm) uploadForm.reset();
        uploadPreview?.classList.add('hidden');
        uploadDropzone?.classList.remove('hidden');
        thumbnailPreview?.classList.add('hidden');
        thumbnailUpload?.classList.remove('hidden');
        
        // Очищаем URLs
        if (uploadedVideoURL) {
            URL.revokeObjectURL(uploadedVideoURL);
            uploadedVideoURL = null;
        }
        if (uploadedThumbnailURL) {
            URL.revokeObjectURL(uploadedThumbnailURL);
            uploadedThumbnailURL = null;
        }
        
        if (previewVideo) previewVideo.src = '';
        if (thumbnailImg) thumbnailImg.src = '';
        uploadedVideoDuration = '0:00';
    }
    function handleVideoFile(file) {
        if (!file) return;
        
        if (!file.type.startsWith('video/')) {
            showNotification('Пожалуйста, выберите видео файл', 'error');
            return;
        }
        // Проверка размера (макс 500MB для демо)
        if (file.size > 500 * 1024 * 1024) {
            showNotification('Файл слишком большой (макс. 500MB)', 'error');
            return;
        }
        // Очищаем предыдущий URL
        if (uploadedVideoURL) {
            URL.revokeObjectURL(uploadedVideoURL);
        }
        uploadedVideoURL = URL.createObjectURL(file);
        
        if (previewVideo) {
             // Reset duration
             uploadedVideoDuration = '0:00';

            // Получаем длительность (вешаем обработчик ДО src)
            previewVideo.onloadedmetadata = function() {
                const duration = previewVideo.duration;
                if (!isFinite(duration) || isNaN(duration)) {
                    uploadedVideoDuration = '0:00';
                    return;
                }

                const hours = Math.floor(duration / 3600);
                const minutes = Math.floor((duration % 3600) / 60);
                const seconds = Math.floor(duration % 60);
                
                if (hours > 0) {
                     uploadedVideoDuration = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                } else {
                     uploadedVideoDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }
            };

            previewVideo.src = uploadedVideoURL;
        }
        
        uploadDropzone?.classList.add('hidden');
        uploadPreview?.classList.remove('hidden');
        // Автозаполнение названия
        const titleInput = document.getElementById('videoTitleInput');
        if (titleInput && !titleInput.value) {
            titleInput.value = file.name.replace(/\.[^/.]+$/, '');
        }
        showNotification('Видео загружено!');
    }
    function handleThumbnailFile(file) {
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            showNotification('Пожалуйста, выберите изображение', 'error');
            return;
        }
        // Очищаем предыдущий URL
        if (uploadedThumbnailURL) {
            URL.revokeObjectURL(uploadedThumbnailURL);
        }
        uploadedThumbnailURL = URL.createObjectURL(file);
        
        if (thumbnailImg) {
            thumbnailImg.src = uploadedThumbnailURL;
        }
        
        thumbnailUpload?.classList.add('hidden');
        thumbnailPreview?.classList.remove('hidden');
    }
    function submitVideo(e) {
        e.preventDefault();
        if (!uploadedVideoURL) {
            showNotification('Пожалуйста, загрузите видео', 'error');
            return;
        }
        const titleInput = document.getElementById('videoTitleInput');
        const descInput = document.getElementById('videoDescInput');
        const channelSelect = document.getElementById('channelSelect');
        
        const title = titleInput?.value?.trim();
        const description = descInput?.value?.trim() || '';
        const channelId = channelSelect?.value || 'myChannel';
        if (!title) {
            showNotification('Введите название видео', 'error');
            return;
        }
        // Попытка получить длительность из DOM если глобальная переменная пуста
        let finalDuration = uploadedVideoDuration;
        if ((!finalDuration || finalDuration === '0:00') && previewVideo && !isNaN(previewVideo.duration) && isFinite(previewVideo.duration)) {
             const duration = previewVideo.duration;
             const hours = Math.floor(duration / 3600);
             const minutes = Math.floor((duration % 3600) / 60);
             const seconds = Math.floor(duration % 60);
             if (hours > 0) {
                 finalDuration = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
             } else {
                 finalDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
             }
        }

        // Создаём новое видео
        const newVideo = {
            id: 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: title,
            channelId: channelId,
            thumbnail: uploadedThumbnailURL || 'Logo.png',
            videoSrc: uploadedVideoURL,
            duration: finalDuration,
            views: 0,
            uploadDate: 'Только что',
            likes: 0,
            description: description,
            isUploaded: true,
            uploadTimestamp: Date.now()
        };
        // Добавляем видео в начало списка
        videos.unshift(newVideo);
        uploadedVideos.unshift(newVideo);
        
        // Увеличиваем счётчик видео канала
        if (channels[channelId]) {
            // Можно добавить счётчик видео на канал
        }
        // Сбрасываем URLs чтобы не очистились при закрытии
        uploadedVideoURL = null;
        uploadedThumbnailURL = null;

        showNotification('Видео опубликовано! (Доступно до перезагрузки страницы)', 'success');
        saveUploadedVideos();
        closeUploadModalFn();
        openChannelPage('myChannel');
    }
    // ==================== ПОИСК ====================
    function handleSearch(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (!term) {
            renderVideos();
            return;
        }
        const filteredVideos = videos.filter(video => {
            const channel = channels[video.channelId];
            const channelName = channel ? channel.name.toLowerCase() : '';
            return video.title.toLowerCase().includes(term) || channelName.includes(term);
        });
        renderVideos(filteredVideos);
        
        if (filteredVideos.length === 0) {
            videosGrid.innerHTML = '<p class="no-results">Ничего не найдено по запросу "' + searchTerm + '"</p>';
        }
    }
    // ==================== ОБРАБОТЧИКИ СОБЫТИЙ ====================
    // Меню
    menuBtn?.addEventListener('click', () => {
        sidebar?.classList.toggle('collapsed');
        mainContent?.classList.toggle('expanded');
    });
    // Навигация
    homeBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        showHomePage();
    });
    sidebarHome?.addEventListener('click', (e) => {
        e.preventDefault();
        showHomePage();
    });
    sidebarSubscriptions?.addEventListener('click', (e) => {
        e.preventDefault();
        showSubscriptionsPage();
    });
    sidebarLiked?.addEventListener('click', (e) => {
        e.preventDefault();
        showLikedPage();
    });

    sidebarMyChannel?.addEventListener('click', (e) => {
        e.preventDefault();
        openChannelPage('myChannel');
    });
    // Модальное окно видео
    closeModal?.addEventListener('click', closeVideoModal);
    
    videoModal?.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });
    // Обработка ошибок видео
    videoPlayer?.addEventListener('error', (e) => {
        // Игнорируем ошибку при пустом источнике (сброс плеера)
        if (!videoPlayer.getAttribute('src')) return;
        
        console.error('Ошибка воспроизведения:', e);
        showNotification('Ошибка воспроизведения видео', 'error');
    });
    // Подписка в модальном окне
    modalSubscribeBtn?.addEventListener('click', () => {
        if (currentVideo) {
            toggleSubscription(currentVideo.channelId);
            updateSubscribeButton(modalSubscribeBtn, currentVideo.channelId);
        }
    });
    // Подписка на странице канала
    subscribeBtn?.addEventListener('click', () => {
        if (currentChannel) {
            toggleSubscription(currentChannel.id);
            updateSubscribeButton(subscribeBtn, currentChannel.id);
        }
    });

    // UX: Смена текста при наведении для отписки
    [modalSubscribeBtn, subscribeBtn].forEach(btn => {
        if (!btn) return;
        
        btn.addEventListener('mouseover', () => {
            if (btn.classList.contains('subscribed')) {
                btn.textContent = 'Отписаться';
                btn.style.backgroundColor = '#cc0000';
                btn.style.color = '#fff';
            }
        });
        
        btn.addEventListener('mouseout', () => {
            if (btn.classList.contains('subscribed')) {
                btn.textContent = 'Вы подписаны';
                btn.style.backgroundColor = '';
                btn.style.color = '';
            }
        });
    });

    // Лайк/дизлайк
    likeBtn?.addEventListener('click', () => {
        if (currentVideo) {
            toggleLike(currentVideo.id);
        }
    });
    dislikeBtn?.addEventListener('click', () => {
        if (currentVideo) {
            toggleDislike(currentVideo.id);
        }
    });
    // Переход на канал из модального окна
    modalChannelAvatar?.addEventListener('click', () => {
        if (currentVideo) {
            closeVideoModal();
            openChannelPage(currentVideo.channelId);
        }
    });
    modalChannelName?.addEventListener('click', () => {
        if (currentVideo) {
            closeVideoModal();
            openChannelPage(currentVideo.channelId);
        }
    });
    // Поиск
    let searchTimeout;
    searchInput?.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            handleSearch(e.target.value);
        }, 300);
    });
    // Категории
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.textContent.toLowerCase();
            if (category === 'все') {
                renderVideos();
            } else if (category === 'недавно добавленные') {
                const recent = [...videos].sort((a, b) => {
                    return (b.uploadTimestamp || 0) - (a.uploadTimestamp || 0);
                });
                renderVideos(recent);
            }
        });
    });
    // Загрузка видео
    uploadBtn?.addEventListener('click', openUploadModal);
    closeUploadModal?.addEventListener('click', closeUploadModalFn);
    
    uploadModal?.addEventListener('click', (e) => {
        if (e.target === uploadModal) {
            closeUploadModalFn();
        }
    });
    uploadDropzone?.addEventListener('click', () => videoFileInput?.click());
    
    uploadDropzone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadDropzone.style.borderColor = '#3ea6ff';
        uploadDropzone.style.backgroundColor = 'rgba(62, 166, 255, 0.1)';
    });
    uploadDropzone?.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadDropzone.style.borderColor = '';
        uploadDropzone.style.backgroundColor = '';
    });
    uploadDropzone?.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadDropzone.style.borderColor = '';
        uploadDropzone.style.backgroundColor = '';
        
        const file = e.dataTransfer?.files[0];
        if (file) {
            handleVideoFile(file);
        }
    });
    videoFileInput?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleVideoFile(file);
        }
    });
    thumbnailUpload?.addEventListener('click', () => thumbnailInput?.click());
    thumbnailInput?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleThumbnailFile(file);
        }
    });
    uploadForm?.addEventListener('submit', submitVideo);
    // Клавиатурные сокращения
    document.addEventListener('keydown', (e) => {
        // Escape - закрыть модальные окна
        if (e.key === 'Escape') {
            if (videoModal?.classList.contains('active')) {
                closeVideoModal();
            }
            if (uploadModal?.classList.contains('active')) {
                closeUploadModalFn();
            }
            return;
        }
        // Остальные только для видео плеера
        if (!videoModal?.classList.contains('active')) return;
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        
        switch(e.key) {
            case ' ':
            case 'k':
                e.preventDefault();
                if (videoPlayer?.paused) {
                    videoPlayer.play();
                } else {
                    videoPlayer?.pause();
                }
                break;
            case 'ArrowRight':
            case 'l':
                if (videoPlayer) videoPlayer.currentTime += 10;
                break;
            case 'ArrowLeft':
            case 'j':
                if (videoPlayer) videoPlayer.currentTime -= 10;
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (videoPlayer) videoPlayer.volume = Math.min(1, videoPlayer.volume + 0.1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (videoPlayer) videoPlayer.volume = Math.max(0, videoPlayer.volume - 0.1);
                break;
            case 'f':
                e.preventDefault();
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    videoPlayer?.requestFullscreen();
                }
                break;
            case 'm':
                if (videoPlayer) videoPlayer.muted = !videoPlayer.muted;
                break;
            case '0':
            case 'Home':
                if (videoPlayer) videoPlayer.currentTime = 0;
                break;
            case 'End':
                if (videoPlayer) videoPlayer.currentTime = videoPlayer.duration;
                break;
        }
    });
    // Адаптивность
    function handleResize() {
        if (window.innerWidth <= 1024) {
            sidebar?.classList.add('collapsed');
            mainContent?.classList.add('expanded');
        } else {
            sidebar?.classList.remove('collapsed');
            mainContent?.classList.remove('expanded');
        }
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    // ==================== ИНИЦИАЛИЗАЦИЯ ====================
    
    renderVideos();
    updateSubscriptionsList();
    
    console.log('🎬 YouTube 2.0 успешно загружен!');
    console.log('📹 Всего видео:', videos.length);
    console.log('👤 Подписки:', userState.subscriptions.length);
    // ==================== РЕДАКТИРОВАНИЕ КАНАЛА ====================
    function openEditChannelModal() {
        editChannelModal?.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Load current data
        const my = channels.myChannel;
        if (channelNameInput) channelNameInput.value = my.name;
        if (channelHandleInput) channelHandleInput.value = my.handle;
        if (channelDescInput) channelDescInput.value = my.description;
        
        // Reset previews
        if (editAvatarImg) {
            if (my.avatarImg) {
                editAvatarImg.src = my.avatarImg;
                editAvatarImg.classList.remove('hidden');
                if (editAvatarText) editAvatarText.classList.add('hidden');
            } else {
                 editAvatarImg.classList.add('hidden');
                 if (editAvatarText) editAvatarText.classList.remove('hidden');
            }
        }
        
         if (editBannerImg) {
            if (my.banner) {
                editBannerImg.src = my.banner;
                editBannerImg.classList.remove('hidden');
                if(bannerPlaceholder) bannerPlaceholder.classList.add('hidden');
            } else {
                 editBannerImg.classList.add('hidden');
                 if(bannerPlaceholder) bannerPlaceholder.classList.remove('hidden');
            }
        }
    }
    function closeEditChannelModalFn() {
        editChannelModal?.classList.remove('active');
        document.body.style.overflow = '';
    }
    function handleAvatarFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const url = URL.createObjectURL(file);
        
        if (editAvatarImg) {
            editAvatarImg.src = url;
            editAvatarImg.classList.remove('hidden');
        }
        if (editAvatarText) editAvatarText.classList.add('hidden');
    }
    function handleBannerFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const url = URL.createObjectURL(file);
        
        if (editBannerImg) {
            editBannerImg.src = url;
            editBannerImg.classList.remove('hidden');
        }
        if (bannerPlaceholder) bannerPlaceholder.classList.add('hidden');
    }
    // Avatar input
    const avatarContainer = document.getElementById('avatarUpload');
    if (avatarContainer) {
        avatarContainer.addEventListener('click', () => {
             avatarInput?.click();
        });
    }
    avatarInput?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) handleAvatarFile(file);
    });
    // Banner input
    const bannerContainer = document.getElementById('bannerUpload');
    if (bannerContainer) {
        bannerContainer.addEventListener('click', () => {
             bannerInput?.click();
        });
    }
    bannerInput?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) handleBannerFile(file);
    });
    // Save Channel
    editChannelForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = channelNameInput?.value;
        const handle = channelHandleInput?.value;
        const desc = channelDescInput?.value;
        
        if (!name || !handle) return;
        
        channels.myChannel.name = name;
        channels.myChannel.handle = handle;
        channels.myChannel.description = desc;
        
        // Save images if they are blob urls (newly uploaded)
        if (editAvatarImg && !editAvatarImg.classList.contains('hidden')) {
             channels.myChannel.avatarImg = editAvatarImg.src;
        }
        if (editBannerImg && !editBannerImg.classList.contains('hidden')) {
             channels.myChannel.banner = editBannerImg.src;
        }
        saveMyChannel();
        showNotification('Изменения сохранены', 'success');
        closeEditChannelModalFn();
        openChannelPage('myChannel'); // Refresh page
    });
    closeEditChannelModal?.addEventListener('click', closeEditChannelModalFn);
    editChannelModal?.addEventListener('click', (e) => {
        if (e.target === editChannelModal) closeEditChannelModalFn();
    });
});
