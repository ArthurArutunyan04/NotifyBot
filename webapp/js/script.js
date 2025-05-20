const APP_CONFIG = {
    API_BASE_URL: 'https://api.notify-task-bot.ru/api/v1'
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

// Функция для показа алерта
async function showAlert(message, duration = 3000) {
    logToDebug("Showing alert: " + message);
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.showAlert(message);
        return new Promise(resolve => setTimeout(resolve, duration));
    } else {
        alert(message);
        return Promise.resolve();
    }
}

// Функция для выполнения API-запроса
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

// Функция авторизации
async function authenticateTelegram() {
    logToDebug("Starting authentication...");
    if (!window.Telegram || !Telegram.WebApp) {
        logToDebug("Telegram WebApp not loaded");
        await showAlert("Telegram WebApp не загружен. Пожалуйста, перезайдите в бота.", 5000);
        return;
    }

    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    const tgData = Telegram.WebApp.initData;
    const user = Telegram.WebApp.initDataUnsafe.user;

    if (!tgData || !user) {
        logToDebug("Telegram auth data not available");
        await showAlert("Данные авторизации отсутствуют. Пожалуйста, перезайдите в бота.", 5000);
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
        await showAlert("Авторизация успешна! JWT сохранён.", 3000);
    } catch (error) {
        logToDebug("Auth failed: " + error.message);
        await showAlert("Ошибка авторизации: " + error.message, 5000);
    }
}

// Запуск авторизации при загрузке
document.addEventListener('DOMContentLoaded', () => {
    logToDebug("DOM loaded");
    authenticateTelegram().catch(e => {
        logToDebug("Initialization error: " + e.message);
        showAlert("Критическая ошибка: " + e.message, 5000);
    });
});