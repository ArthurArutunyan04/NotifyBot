document.addEventListener('DOMContentLoaded', function() {
    const platform = detectPlatform();
    document.body.classList.add('platform-' + platform);

    if (platform === 'tg') {
        setupTelegramWebApp();
    } else if (platform === 'mobile') {
        setupMobileBrowser();
    } else {
        setupDesktopBrowser();
    }
});

function detectPlatform() {
    if (window.Telegram && Telegram.WebApp) {
        return 'tg';
    }

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return 'mobile';
    }

    return 'desktop';
}

function setupTelegramWebApp() {
    const webApp = Telegram.WebApp;

    const backBtn = document.getElementById('tgBackBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            webApp.close();
        });
    }

    document.getElementById('title').textContent = 'Привет в Telegram!';
}

function setupMobileBrowser() {
    document.getElementById('title').textContent = 'Откройте в Telegram';
}

window.navigateTo = function(page) {
    if (window.Telegram && Telegram.WebApp) {
        handleTelegramNavigation(page);
    } else {
        handleBrowserNavigation(page);
    }
};

function handleTelegramNavigation(page) {
    const webApp = Telegram.WebApp;

    if (page === 'index.html') {
        webApp.close();
    } else {
        webApp.openLink(getFullUrl(page));
    }
}

function handleBrowserNavigation(page) {
    window.location.href = page;
}

function getFullUrl(page) {
    const baseUrl = window.location.href.split('/').slice(0, -1).join('/');
    return `${baseUrl}/${page}`;
}

