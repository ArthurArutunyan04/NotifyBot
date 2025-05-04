const APP_CONFIG = {
    API_BASE_URL: '/api/v1',
    PLATFORM: detectPlatform()
};

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded");
    try {
        if (window.Telegram && Telegram.WebApp) {
            console.log("Telegram WebApp detected");
            console.log("InitData:", Telegram.WebApp.initData);
            console.log("User:", Telegram.WebApp.initDataUnsafe?.user);
        }
        initPlatform();
        setupNavigation();
        checkAuth().catch(e => console.error("Auth error:", e));
    } catch (e) {
        console.error("Initialization error:", e);
        showAlert("Critical error: " + e.message);
    }

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
    if (APP_CONFIG.PLATFORM === 'tg') {
        try {
            if (!Telegram.WebApp.initData) {
                throw new Error("Telegram auth data not available");
            }

            if (!localStorage.getItem('jwt')) {
                await authenticateTelegram();
            }

            await validateToken();
        } catch (error) {
            console.error("Auth check failed:", error);
            showAlert("Ошибка авторизации. Пожалуйста, перезайдите в бота.");
            if (APP_CONFIG.PLATFORM === 'tg') {
                Telegram.WebApp.close();
            }
        }
    }
}

async function authenticateTelegram() {
    const tgData = Telegram.WebApp.initData;
    const user = Telegram.WebApp.initDataUnsafe.user;

    try {
        const response = await apiRequest('/auth/telegram', 'POST', {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            authDate: Telegram.WebApp.initDataUnsafe.auth_date,
            hash: Telegram.WebApp.initDataUnsafe.hash
        });

        localStorage.setItem('jwt', response.token);
        localStorage.setItem('user', JSON.stringify({
            id: user.id,
            username: user.username
        }));

        Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    } catch (error) {
        console.error("Auth failed:", error);
        throw new Error("Не удалось авторизоваться");
    }
}

async function validateToken() {
    try {
        await apiRequest('/auth/validate', 'GET');
    } catch (error) {
        localStorage.removeItem('jwt');
        throw new Error("Токен недействителен");
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