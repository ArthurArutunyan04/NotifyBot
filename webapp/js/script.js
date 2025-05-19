const APP_CONFIG = {
    API_BASE_URL: 'https://api.notify-task-bot.ru/api/v1',
    PLATFORM: detectPlatform()
};

// Функция для записи логов в интерфейс
function logToDebug(message) {
    console.log(message);
    const debugLog = document.getElementById('debug-log');
    if (debugLog) {
        debugLog.innerHTML += `<div>${new Date().toISOString()}: ${message}</div>`;
        debugLog.scrollTop = debugLog.scrollHeight;
    }
}

function initApp() {
    logToDebug("DOM loaded");
    try {
        if (window.Telegram && Telegram.WebApp) {
            logToDebug("Telegram WebApp detected");
            logToDebug("InitData: " + Telegram.WebApp.initData);
            logToDebug("User: " + JSON.stringify(Telegram.WebApp.initDataUnsafe?.user));
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();
        } else {
            logToDebug("Telegram WebApp not loaded");
        }
        initPlatform();
        setupNavigation();
        checkAuth().catch(e => {
            logToDebug("Auth error: " + e.message);
            showAlert("Ошибка авторизации: " + e.message);
        });
        loadCurrentPage();
    } catch (e) {
        logToDebug("Initialization error: " + e.message);
        showAlert("Критическая ошибка: " + e.message);
    }
}

if (document.readyState === 'complete') {
    initApp();
} else {
    document.addEventListener('DOMContentLoaded', initApp);
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
        webApp.BackButton.show();
        webApp.BackButton.onClick(() => {
            if (window.history.length > 1) {
                history.back();
                logToDebug("Back button: navigating back");
            } else {
                logToDebug("Back button: closing Web App");
                webApp.close();
            }
        });
    }
}

function setupNavigation() {
    window.navigateTo = function(page) {
        logToDebug("Navigating to: " + page);
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
        logToDebug("Loading page: " + pageToLoad);
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
        logToDebug("Failed to load page: " + error.message);
        showAlert("Ошибка загрузки страницы: " + error.message);
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
    logToDebug("Main page initialized");
}

async function checkAuth() {
    if (APP_CONFIG.PLATFORM === 'tg') {
        logToDebug("Checking auth...");
        if (!Telegram.WebApp.initData) {
            logToDebug("Telegram auth data not available");
            showAlert("Данные авторизации отсутствуют. Пожалуйста, перезайдите в бота.");
            return;
        }
        if (!localStorage.getItem('jwt')) {
            logToDebug("No JWT found, authenticating...");
            await authenticateTelegram();
        }
        logToDebug("Validating token...");
        await validateToken();
    }
}

async function authenticateTelegram() {
    const tgData = Telegram.WebApp.initData;
    const user = Telegram.WebApp.initDataUnsafe.user;
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
    } catch (error) {
        logToDebug("Auth failed: " + error.message);
        throw new Error("Не удалось авторизоваться: " + error.message);
    }
}

async function validateToken() {
    try {
        const response = await apiRequest('/auth/validate', 'GET');
        logToDebug("Token validation response: " + JSON.stringify(response));
    } catch (error) {
        logToDebug("Token validation failed: " + error.message);
        localStorage.removeItem('jwt');
        throw new Error("Токен недействителен: " + error.message);
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

function showAlert(message) {
    logToDebug("Showing alert: " + message);
    if (APP_CONFIG.PLATFORM === 'tg') {
        Telegram.WebApp.showAlert(message);
    } else {
        alert(message);
    }
}

window.apiRequest = apiRequest;
window.showAlert = showAlert;
window.navigateTo = navigateTo;
