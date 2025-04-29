function initActiveTasksPage() {
    console.log('Initializing active tasks page');

    loadTasks();

    document.addEventListener('click', async function(e) {
        if (e.target.classList.contains('complete-btn')) {
            const taskId = e.target.dataset.taskId;
            try {
                await apiRequest(`/tasks/${taskId}/complete`, 'PATCH');
                e.target.closest('.task-item').remove();
                showAlert('Задача завершена!');
            } catch (error) {
                console.error('Error completing task:', error);
                showAlert(`Ошибка: ${error.message}`);
            }
        }
    });
}

async function loadTasks() {
    try {
        const loader = document.getElementById('loader');
        const container = document.getElementById('activeTasksContainer');

        loader.style.display = 'block';
        container.innerHTML = '';

        const tasks = await apiRequest('/tasks?status=active');

        if (tasks.length === 0) {
            container.innerHTML = '<p class="no-tasks">Нет активных задач</p>';
            return;
        }

        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            taskElement.innerHTML = `
                <h3>${task.title}</h3>
                <p>${task.description || 'Нет описания'}</p>
                <div class="task-meta">
                    <span class="due-date">До: ${formatDate(task.deadline)}</span>
                    <button class="btn complete-btn" data-task-id="${task.id}">✓</button>
                </div>
            `;
            container.appendChild(taskElement);
        });
    } catch (error) {
        console.error('Error loading tasks:', error);
        showAlert(`Ошибка загрузки задач: ${error.message}`);
    } finally {
        document.getElementById('loader').style.display = 'none';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Без срока';
    return new Date(dateString).toLocaleDateString('ru-RU');
}

if (document.readyState !== 'loading') {
    initActiveTasksPage();
}