// Функция инициализации страницы текущих задач
function initActiveTasksPage() {
    console.log('Active tasks page initialized');

    // Определяем контейнер в зависимости от платформы
    const platform = APP_CONFIG.PLATFORM || detectPlatform();
    let tasksContainer;
    if (platform === 'tg') {
        tasksContainer = document.getElementById('activeTasksContainer');
    } else if (platform === 'mobile') {
        tasksContainer = document.getElementById('activeTasksContainerMobile');
    } else {
        tasksContainer = document.getElementById('activeTasksContainerDesktop');
    }

    if (!tasksContainer) {
        console.error('Tasks container not found for platform:', platform);
        return;
    }

    // Декоративное завершение задачи
    window.completeTask = function(taskId) {
        console.log(`Completing task ${taskId} (decorative)`);
        const taskItem = tasksContainer.querySelector(`.task-item[data-task-id="${taskId}"]`);
        if (taskItem) {
            taskItem.classList.add('completed');
            const completeBtn = taskItem.querySelector('.complete-btn');
            if (completeBtn) {
                completeBtn.disabled = true;
                completeBtn.textContent = 'Завершено';
            }
            showAlert('Задача завершена', 2000);
        }
    };

    // Декоративное удаление задачи
    window.deleteTask = function(taskId) {
        console.log(`Deleting task ${taskId} (decorative)`);
        const taskItem = tasksContainer.querySelector(`.task-item[data-task-id="${taskId}"]`);
        if (taskItem && confirm('Вы уверены, что хотите удалить задачу?')) {
            taskItem.style.transition = 'opacity 0.5s';
            taskItem.style.opacity = '0';
            setTimeout(() => {
                taskItem.remove();
                showAlert('Задача удалена', 2000);
            }, 500);
        }
    };
}

// Экспортируем для использования в script.js
if (typeof window !== 'undefined') {
    window.initActiveTasksPage = initActiveTasksPage;
}