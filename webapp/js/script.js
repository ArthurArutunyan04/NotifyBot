const APP_CONFIG = {
    API_BASE_URL: '/api/v1',
    PLATFORM: detectPlatform()
};

document.addEventListener('DOMContentLoaded', function() {
    initPlatform();
    setupNavigation();
    checkAuth();
    loadCurrentPage();
});

function detectPlatform() {
    if (window.Telegram && Telegram.WebApp) return 'tg';
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        ? 'mobile'
        : 'desktop';
}

function initPlatform() {
    document.body.classList.add(`platform-${APP_CONFIG.PLATFORM}`);

    if (APP_CONFIG.PLATFORM === 'tg') {
        const webApp = Telegram.WebApp;
        webApp.ready();
        webApp.expand();

        webApp.BackButton.show();
        webApp.BackButton.onClick(() => {
            if (window.history.length > 1) {
                history.back();
            } else {
                webApp.close();
            }
        });
    }
}

function setupNavigation() {
    window.navigateTo = function(page) {
        if (APP_CONFIG.PLATFORM === 'tg') {
            history.pushState(null, '', page);
            loadPageContent(page);
        } else {
            window.location.href = page;
        }
    };

    window.addEventListener('popstate', function() {
        loadPageContent(window.location.pathname);
    });
}

function loadCurrentPage() {
    loadPageContent(window.location.pathname);
}

async function loadPageContent(path) {
    try {
        const pageToLoad = path === '/' ? '/index.html' : path;
        const response = await fetch(pageToLoad);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        document.querySelector('.app-container').innerHTML =
            doc.querySelector('.app-container').innerHTML;

        initPageScripts(path);

        initPlatform();
    } catch (error) {
        console.error('Failed to load page:', error);
        showAlert('Ошибка загрузки страницы');
    }
}

function initPageScripts(path) {
    const pageScripts = {
        '/': initMainPage,
        '/index.html': initMainPage,
        '/add-task.html': initAddTaskPage,
        '/active-tasks.html': initActiveTasksPage,
        '/completed-tasks.html': initCompletedTasksPage
    };

    const pageKey = Object.keys(pageScripts).find(key =>
        path.endsWith(key)
    );

    if (pageKey && pageScripts[pageKey]) {
        pageScripts[pageKey]();
    }
}

function initMainPage() {
    console.log('Main page initialized');
}

async function checkAuth() {
    if (!localStorage.getItem('jwt') && APP_CONFIG.PLATFORM === 'tg') {
        await authenticateTelegram();
    }
}

async function authenticateTelegram() {
    if (!window.Telegram?.WebApp?.initData) {
        console.warn('Telegram WebApp data not available');
        return;
    }

    try {
        const initData = Telegram.WebApp.initData;
        const user = Telegram.WebApp.initDataUnsafe.user;

        const response = await apiRequest('/auth/telegram', 'POST', {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            photoUrl: user.photo_url,
            authDate: Telegram.WebApp.initDataUnsafe.auth_date,
            hash: Telegram.WebApp.initDataUnsafe.hash
        });

        localStorage.setItem('jwt', response.token);
        localStorage.setItem('user', JSON.stringify({
            id: user.id,
            username: user.username,
            name: [user.first_name, user.last_name].filter(Boolean).join(' ')
        }));

        Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        return true;
    } catch (error) {
        console.error('Auth error:', error);
        showAlert('Ошибка авторизации. Попробуйте снова.');
        return false;
    }
}

async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    const token = localStorage.getItem('jwt');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }

    return response.json();
}

function showAlert(message) {
    if (APP_CONFIG.PLATFORM === 'tg') {
        Telegram.WebApp.showAlert(message);
    } else {
        alert(message);
    }
}

window.apiRequest = apiRequest;
window.showAlert = showAlert;
window.navigateTo = navigateTo;