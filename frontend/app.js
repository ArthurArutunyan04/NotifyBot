const tg = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('status').textContent = 'Ready!';

    document.getElementById('sendBtn').addEventListener('click', () => {
        const data = {
            command: 'test',
            userId: tg.initDataUnsafe.user?.id
        };

        fetch('https://ваш-бекенд.railway.app/api/webapp/handle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.text())
            .then(result => {
                tg.showAlert(result);
            });
    });

    tg.expand();
    tg.enableClosingConfirmation();
});