const APP_CONFIG = {
    API_BASE_URL: 'https://api.notify-task-bot.ru/api/v1'
};

function logToDebug(message) {
    console.log(message);
    const debugLog = document.getElementById('debug-log');
    if (debugLog) {
        debugLog.innerHTML += `<div>${new Date().toISOString()}: ${message}</div>`;
        debugLog.scrollTop = debugLog.scrollHeight;
    }
}

function showAlert(message, duration = 3000) {
    logToDebug("Showing alert: " + message);
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.showAlert(message);
        return new Promise(resolve => setTimeout(resolve, duration));
    } else {
        alert(message);
        return Promise.resolve();
    }
}

async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    const token = localStorage.getItem('jwt');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    logToDebug(`Sending ${method} request to ${APP_CONFIG.API_BASE_URL}${endpoint}`);
    try {
        const response = await fetch(`${APP_CONFIG.API_BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });
        logToDebug(`Response status: ${response.status}`);
        if (!response.ok) {
            let errorMessage = 'Request failed';
            try {
                const error = await response.json();
                errorMessage = error.message || errorMessage;
            } catch (e) {
                logToDebug("Failed to parse error response: " + e.message);
            }
            throw new Error(errorMessage);
        }
        return response.json();
    } catch (error) {
        logToDebug("API request failed: " + error.message);
        throw error;
    }
}

async function authenticateTelegram() {
    logToDebug("Starting authentication in background...");
    if (!window.Telegram || !Telegram.WebApp) {
        logToDebug("Telegram WebApp not loaded");
        return;
    }

    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    const tgData = Telegram.WebApp.initData;
    const user = Telegram.WebApp.initDataUnsafe.user;

    if (!tgData || !user) {
        logToDebug("Telegram auth data not available, skipping authentication");
        return;
    }

    logToDebug("Authenticating with user: " + JSON.stringify(user));
    try {
        const response = await apiRequest('/auth/telegram', 'POST', {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            authDate: Telegram.WebApp.initDataUnsafe.auth_date,
            hash: Telegram.WebApp.initDataUnsafe.hash
        });
        logToDebug("Auth response: " + JSON.stringify(response));
        localStorage.setItem('jwt', response.token);
        localStorage.setItem('user', JSON.stringify({
            id: user.id,
            username: user.username
        }));
        Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        logToDebug("Авторизация успешна! JWT сохранён.");
    } catch (error) {
        logToDebug("Auth failed, continuing without auth: " + error.message);
    }
}

async function checkAuth() {
    if (APP_CONFIG.PLATFORM === 'tg' && window.Telegram && Telegram.WebApp) {
        try {
            if (!localStorage.getItem('jwt')) {
                await authenticateTelegram();
            } else {
                await validateToken();
            }
        } catch (error) {
            logToDebug("Auth check failed, continuing without auth: " + error.message);
            localStorage.removeItem('jwt');
        }
    }
}

async function validateToken() {
    try {
        await apiRequest('/auth/validate', 'GET');
    } catch (error) {
        logToDebug("Token validation failed, continuing without auth: " + error.message);
        localStorage.removeItem('jwt');
    }
}

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
        if (!response.ok) throw new Error(`Page not found: ${pageToLoad}`);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        const appContainer = document.querySelector('.app-container');
        const newContent = doc.querySelector('.app-container');
        if (!newContent) throw new Error('Invalid page structure');
        appContainer.innerHTML = newContent.innerHTML;

        initPageScripts(path);
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

    const pageKey = Object.keys(pageScripts).find(key => path.endsWith(key));
    if (pageKey && pageScripts[pageKey]) {
        pageScripts[pageKey]();
    }
}

function initMainPage() {
    console.log('Main page initialized');
}

document.addEventListener('DOMContentLoaded', () => {
    logToDebug("DOM loaded");
    APP_CONFIG.PLATFORM = detectPlatform();
    initPlatform();
    setupNavigation();
    loadCurrentPage();
    checkAuth().catch(e => logToDebug("Background auth error: " + e.message));
});

function initAddTaskPage() {}
function initActiveTasksPage() {}
function initCompletedTasksPage() {}