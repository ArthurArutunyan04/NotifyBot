function initCompletedTasksPage() {
    console.log('Initializing completed tasks page');
    loadCompletedTasks();
}

async function loadCompletedTasks() {
    try {
        const loader = document.getElementById('loader');
        const container = document.getElementById('completedTasksContainer');

        loader.style.display = 'block';
        container.innerHTML = '';

        const tasks = await apiRequest('/tasks?status=completed');

        if (tasks.length === 0) {
            container.innerHTML = '<p class="no-tasks">Нет выполненных задач</p>';
            return;
        }

        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item completed';
            taskElement.innerHTML = `
                <h3>${task.title}</h3>
                <p>${task.description || 'Нет описания'}</p>
                <div class="task-meta">
                    <span class="completion-date">Выполнено: ${formatDate(task.completedAt)}</span>
                </div>
            `;
            container.appendChild(taskElement);
        });
    } catch (error) {
        console.error('Error loading completed tasks:', error);
        showAlert(`Ошибка загрузки задач: ${error.message}`);
    } finally {
        document.getElementById('loader').style.display = 'none';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Дата неизвестна';
    return new Date(dateString).toLocaleDateString('ru-RU');
}

if (document.readyState !== 'loading') {
    initCompletedTasksPage();
}