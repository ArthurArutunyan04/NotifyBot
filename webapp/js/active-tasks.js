function showMessage(msg) {
    if (window.Telegram && Telegram.WebApp && Telegram.WebApp.showAlert) {
        Telegram.WebApp.showAlert(msg);
    } else {
        alert(msg);
    }
}

async function fetchTasks() {
    try {
        const res = await fetch('/api/task');
        if (!res.ok) throw new Error('Ошибка загрузки задач');
        sessionStorage.removeItem('reloadedOnce');
        return await res.json();
    } catch (e) {
        alert(e.message);
        if (!sessionStorage.getItem('reloadedOnce')) {
            sessionStorage.setItem('reloadedOnce', 'true');
            location.reload();
        }
        return [];
    }
}



function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function createTaskHTML(task) {
    return `
        <div class="task-item" data-task-id="${task.id}">
            <h3>${task.title}</h3>
            <p>${task.description ? `Описание: ${task.description}` : ''}</p>
            <div class="task-meta">
                <span class="due-date">Срок выполнения: ${formatDate(task.due_date)}</span>
                <button class="btn task-action-btn complete-btn" data-action="complete" data-id="${task.id}">✓</button>
                <button class="btn task-action-btn delete-btn" data-action="delete" data-id="${task.id}">❌</button>
            </div>
        </div>
    `;
}

async function renderTasks() {
    const tasks = await fetchTasks();
    const html = tasks.length ? tasks.map(createTaskHTML).join('') : '<p>Нет активных задач.</p>';

    const containerIds = ['activeTasksContainer', 'activeTasksContainerMobile', 'activeTasksContainerDesktop'];
    containerIds.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = html;
        }
    });

    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';

    // После рендера навесим обработчики кнопок
    attachTaskButtonsHandlers();
}

async function updateTaskStatus(id, status) {
    try {
        const res = await fetch(`/api/task/${id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ status })
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Ошибка обновления задачи');
        }
        await renderTasks();
    } catch (e) {
        showMessage(e.message);
    }
}

function completeTask(id) {
    updateTaskStatus(id, 'Завершено');
}

function deleteTask(id) {
    if (confirm('Вы уверены, что хотите удалить задачу?')) {
        updateTaskStatus(id, 'Удалена');
    }
}

function attachTaskButtonsHandlers() {
    const buttons = document.querySelectorAll('.task-action-btn');
    buttons.forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            const action = btn.dataset.action;
            if (!id || !action) return;

            if (action === 'complete') {
                completeTask(id);
            } else if (action === 'delete') {
                deleteTask(id);
            }
        };
    });
}

function navigateTo(url) {
    window.location.href = url;
}

window.addEventListener('DOMContentLoaded', () => {
    renderTasks();

    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => navigateTo('index.html'));
    }
});
