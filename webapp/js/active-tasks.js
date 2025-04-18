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

    document.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = this.getAttribute('data-task-id');
            console.log('Задача выполнена:', taskId);
            this.closest('.task-item').remove();
        });
    });
});

function renderTasks(tasks) {
    const container = document.getElementById('activeTasksContainer');
    if (!container) return;

    container.innerHTML = '';

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description || ''}</p>
            <div class="task-meta">
                <span class="due-date">До: ${formatDate(task.dueDate)}</span>
                <button class="btn complete-btn" data-task-id="${task.id}">✓</button>
            </div>
        `;
        container.appendChild(taskElement);
    });
}

function formatDate(dateString) {
    if (!dateString) return 'Без срока';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}