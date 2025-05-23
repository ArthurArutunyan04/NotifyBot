async function fetchTasks() {
    try {
        const res = await fetch('/api/tasks');
        if (!res.ok) throw new Error('Ошибка загрузки задач');
        return await res.json();
    } catch (e) {
        alert(e.message);
        return [];
    }
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function createTaskHTML(task) {
    return `
        <div class="task-item" data-task-id="${task.id}">
            <h3>${task.title}</h3>
            <p>${task.description ? `Описание: ${task.description}` : ''}</p>
            <div class="task-meta">
                <span class="due-date">Срок выполнения: ${formatDate(task.due_date)}</span>
                <button class="btn task-action-btn complete-btn" onclick="completeTask(${task.id})">✓</button>
                <button class="btn task-action-btn delete-btn" onclick="deleteTask(${task.id})">❌</button>
            </div>
        </div>
    `;
}

async function renderTasks() {
    const tasks = await fetchTasks();
    const html = tasks.map(createTaskHTML).join('');

    const containers = [
        document.getElementById('activeTasksContainer'),
        document.getElementById('activeTasksContainerMobile'),
        document.getElementById('activeTasksContainerDesktop')
    ];

    containers.forEach(container => {
        container.innerHTML = html || '<p>Нет активных задач.</p>';
    });

    // Спрятать или показать loader
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
}

async function updateTaskStatus(id, status) {
    try {
        const res = await fetch(`/api/task/${id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({status})
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Ошибка обновления задачи');
        }
        await renderTasks();
    } catch (e) {
        alert(e.message);
    }
}

function completeTask(id) {
    updateTaskStatus(id, 'Завершено');
}

function deleteTask(id) {
    updateTaskStatus(id, 'Удалена');
}

window.onload = renderTasks;
