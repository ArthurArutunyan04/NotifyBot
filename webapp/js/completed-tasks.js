document.addEventListener('DOMContentLoaded', function() {
    const mockTasks = [
        {
            id: 1,
            title: 'Текст',
            description: 'Текст много',
            dueDate: '2025-07-31T23:59'
        },
        {
            id: 1,
            title: 'Текст',
            description: 'Текст много',
            dueDate: '2025-07-20T18:00'
        }
    ];

    renderTasks(mockTasks);
});

function renderTasks(tasks) {
    const container = document.getElementById('completedTasksContainer');
    if (!container) return;

    container.innerHTML = '';

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item completed';
        taskElement.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description || ''}</p>
            <div class="task-meta">
                <span class="completion-date">Выполнено: ${formatDate(task.completionDate)}</span>
            </div>
        `;
        container.appendChild(taskElement);
    });
}

function formatDate(dateString) {
    if (!dateString) return 'Дата неизвестна';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}