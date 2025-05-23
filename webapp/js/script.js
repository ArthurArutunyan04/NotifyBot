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

// async function apiRequest(endpoint, method = 'GET', body = null) {
//     const headers = {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//     };
//     const token = localStorage.getItem('jwt');
//     if (token) headers['Authorization'] = `Bearer ${token}`;
//     logToDebug(`Sending ${method} request to ${APP_CONFIG.API_BASE_URL}${endpoint}`);
//     try {
//         const response = await fetch(`${APP_CONFIG.API_BASE_URL}${endpoint}`, {
//             method,
//             headers,
//             body: body ? JSON.stringify(body) : null
//         });
//         logToDebug(`Response status: ${response.status}`);
//         if (!response.ok) {
//             let errorMessage = 'Request failed';
//             try {
//                 const error = await response.json();
//                 errorMessage = error.message || errorMessage;
//             } catch (e) {
//                 logToDebug("Failed to parse error response: " + e.message);
//             }
//             throw new Error(errorMessage);
//         }
//         return response.json();
//     } catch (error) {
//         logToDebug("API request failed: " + error.message);
//         throw error;
//     }
// }
//
// async function authenticateTelegram() {
//     logToDebug("Starting authentication in background...");
//     if (!window.Telegram || !Telegram.WebApp) {
//         logToDebug("Telegram WebApp not loaded");
//         return;
//     }
//
//     Telegram.WebApp.ready();
//     Telegram.WebApp.expand();
//     const tgData = Telegram.WebApp.initData;
//     const user = Telegram.WebApp.initDataUnsafe.user;
//
//     if (!tgData || !user) {
//         logToDebug("Telegram auth data not available, skipping authentication");
//         return;
//     }
//
//     logToDebug("Authenticating with user: " + JSON.stringify(user));
//     try {
//         logToDebug("Authentication skipped as decorative (no API call)");
//     } catch (error) {
//         logToDebug("Auth failed (decorative), continuing without auth: " + error.message);
//     }
// }
//
// async function checkAuth() {
//     if (APP_CONFIG.PLATFORM === 'tg' && window.Telegram && Telegram.WebApp) {
//         try {
//             if (!localStorage.getItem('jwt')) {
//                 await authenticateTelegram();
//             } else {
//                 logToDebug("Token validation skipped as decorative");
//             }
//         } catch (error) {
//             logToDebug("Auth check failed (decorative), continuing without auth: " + error.message);
//             localStorage.removeItem('jwt');
//         }
//     }
// }
//
// async function validateToken() {
//     logToDebug("Token validation skipped as decorative");
// }
//
// function detectPlatform() {
//     if (window.Telegram && Telegram.WebApp) return 'tg';
//     return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
//         ? 'mobile'
//         : 'desktop';
// }

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
            logToDebug(`Navigating to ${page}`);
            history.pushState({ page }, '', page);
            loadPageContent(page);
        } else {
            window.location.href = page;
        }
    };

    window.addEventListener('popstate', function(event) {
        const page = event.state?.page || '/index.html';
        logToDebug(`Popstate event triggered, loading ${page}`);
        loadPageContent(page);
    });
}

function loadCurrentPage() {
    const currentPath = window.location.pathname || '/index.html';
    logToDebug(`Loading current page: ${currentPath}`);
    loadPageContent(currentPath);
}

async function loadPageContent(path) {
    try {
        const pageToLoad = path === '/' || !path || path === '/index.html' ? '/index.html' : path;
        logToDebug(`Attempting to load page: ${pageToLoad}`);

        const response = await fetch(pageToLoad, { cache: 'no-store' });
        if (!response.ok) {
            logToDebug(`Page ${pageToLoad} not found (status: ${response.status}), falling back to index.html`);
            const fallbackResponse = await fetch('/index.html', { cache: 'no-store' });
            if (!fallbackResponse.ok) {
                logToDebug(`Failed to load index.html (status: ${fallbackResponse.status})`);
                return;
            }
            const text = await fallbackResponse.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');

            const appContainer = document.querySelector('.app-container');
            const newContent = doc.querySelector('.app-container');
            if (!newContent) {
                logToDebug('Invalid page structure in index.html');
                return;
            }
            appContainer.innerHTML = newContent.innerHTML;
            initPageScripts('/index.html');
        } else {
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');

            const appContainer = document.querySelector('.app-container');
            const newContent = doc.querySelector('.app-container');
            if (!newContent) {
                logToDebug(`Invalid page structure in ${pageToLoad}`);
                return;
            }
            appContainer.innerHTML = newContent.innerHTML;
            initPageScripts(pageToLoad);
        }
    } catch (error) {
        logToDebug(`Page load error (decorative): ${error.message}`);
        try {
            const fallbackResponse = await fetch('/index.html', { cache: 'no-store' });
            if (fallbackResponse.ok) {
                const text = await fallbackResponse.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                const appContainer = document.querySelector('.app-container');
                const newContent = doc.querySelector('.app-container');
                if (newContent) {
                    appContainer.innerHTML = newContent.innerHTML;
                    initPageScripts('/index.html');
                }
            }
        } catch (fallbackError) {
            logToDebug(`Failed to load index.html as fallback: ${fallbackError.message}`);
        }
    }
}

function initPageScripts(path) {
    const pageScripts = {
        '/': initMainPage,
        '/index.html': initMainPage,
        '/add-task.html': initAddTaskPage,
        '/active-tasks.html': initActiveTasksPage,
        '/completed-tasks.html': initCompletedTasksPage,
        '/analytics.html': initAnalyticsPage
    };

    const pageKey = Object.keys(pageScripts).find(key => path.endsWith(key));
    if (pageKey && pageScripts[pageKey]) {
        pageScripts[pageKey]();
    } else {
        logToDebug(`No script initialization for path: ${path}`);
    }
}

function initMainPage() {
    console.log('Main page initialized');
}

function initAddTaskPage() {
    console.log('Add task page initialized');
}

function initActiveTasksPage() {
    console.log('Active tasks page initialized');
}

function initCompletedTasksPage() {
    console.log('Completed tasks page initialized');
}

function initAnalyticsPage() {
    console.log('Analytics page initialized');
}

document.addEventListener('DOMContentLoaded', () => {
    logToDebug("DOM loaded");
    APP_CONFIG.PLATFORM = detectPlatform();
    initPlatform();
    setupNavigation();
    loadCurrentPage();
    checkAuth().catch(e => logToDebug("Background auth error: " + e.message));
});