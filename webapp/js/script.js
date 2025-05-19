const APP_CONFIG = {
    API_BASE_URL: 'https://api.notify-task-bot.ru/api/v1',
    PLATFORM: detectPlatform()
};

function initApp() {
    console.log("DOM loaded");
    try {
        if (window.Telegram && Telegram.WebApp) {
            console.log("Telegram WebApp detected");
            console.log("InitData:", Telegram.WebApp.initData);
            console.log("User:", Telegram.WebApp.initDataUnsafe?.user);
        } else {
            console.warn("Telegram WebApp not loaded");
        }
        initPlatform();
        setupNavigation();
        checkAuth().catch(e => console.error("Auth error:", e));
        loadCurrentPage();
    } catch (e) {
        console.error("Initialization error:", e);
        showAlert("Critical error: " + e.message);
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

async function checkAuth() {
    if (APP_CONFIG.PLATFORM === 'tg') {
        try {
            console.log("Checking auth...");
            if (!Telegram.WebApp.initData) {
                console.warn("Telegram auth data not available");
                showAlert("Данные авторизации отсутствуют. Пожалуйста, перезайдите в бота.");
                return;
            }
            if (!localStorage.getItem('jwt')) {
                console.log("No JWT found, authenticating...");
                await authenticateTelegram();
            }
            console.log("Validating token...");
            await validateToken();
        } catch (error) {
            console.error("Auth check failed:", error);
            showAlert("Ошибка авторизации: " + error.message);
            // Не закрываем Web App, даём пользователю шанс исправить
        }
    }
}

async function authenticateTelegram() {
    const tgData = Telegram.WebApp.initData;
    const user = Telegram.WebApp.initDataUnsafe.user;
    console.log("Authenticating with user:", user);
    try {
        const response = await apiRequest('/auth/telegram', 'POST', {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username,
            authDate: Telegram.WebApp.initDataUnsafe.auth_date,
            hash: Telegram.WebApp.initDataUnsafe.hash
        });
        console.log("Auth response:", response);
        localStorage.setItem('jwt', response.token);
        localStorage.setItem('user', JSON.stringify({
            id: user.id,
            username: user.username
        }));
        Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    } catch (error) {
        console.error("Auth failed:", error);
        throw new Error("Не удалось авторизоваться: " + error.message);
    }
}

async function validateToken() {
    try {
        const response = await apiRequest('/auth/validate', 'GET');
        console.log("Token validation response:", response);
    } catch (error) {
        console.error("Token validation failed:", error);
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
    console.log(`Sending ${method} request to ${APP_CONFIG.API_BASE_URL}${endpoint}`);
    try {
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
    } catch (error) {
        console.error("API request failed:", error);
        throw error;
    }
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