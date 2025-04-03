const BACKEND_URL = "https://notify-bot-backend.onrender.com";
const tg = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('status').textContent = '✅ Бот готов к работе!';

    document.getElementById('sendBtn').addEventListener('click', () => {
        const data = {
            command: 'test',
            userId: tg.initDataUnsafe.user?.id,
            timestamp: new Date().toISOString()
        };

        fetch(`${BACKEND_URL}/api/webapp/handle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Telegram-Init-Data': tg.initData || ''
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.text();
            })
            .then(result => {
                tg.showAlert(`Сервер ответил: ${result}`);
                console.log("Response:", result);
            })
            .catch(error => {
                tg.showAlert(`Ошибка: ${error.message}`);
                console.error("Fetch error:", error);
            });
    });

    // Инициализация WebApp
    tg.expand();
    tg.MainButton.setText("Готово").show();
    tg.enableClosingConfirmation();
});