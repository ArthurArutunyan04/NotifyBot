async function fetchCompletedTasks() {
    try {
        const res = await fetch('/api/task/completed');
        if (!res.ok) throw new Error('Ошибка загрузки завершённых задач');
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

function createCompletedTaskHTML(task) {
    return `
        <div class="task-item completed" data-task-id="${task.id}">
            <h3>${task.title}</h3>
            <p>${task.description ? `Описание: ${task.description}` : ''}</p>
            <p>Срок: ${formatDate(task.due_date)}</p>
            <p>Статус: <strong>${task.status}</strong></p>
        </div>
    `;
}

async function renderCompletedTasks() {
    const tasks = await fetchCompletedTasks();
    const container = document.getElementById('completedTasksContainer');
    if (!container) return;

    if (tasks.length === 0) {
        container.innerHTML = '<p>Нет выполненных задач.</p>';
        return;
    }

    container.innerHTML = tasks.map(createCompletedTaskHTML).join('');
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
}

window.onload = renderCompletedTasks;
