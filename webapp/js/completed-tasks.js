// Функция инициализации страницы завершённых задач
function initCompletedTasksPage() {
    console.log('Completed tasks page initialized');

    // Используем единый контейнер
    const tasksContainer = document.getElementById('completedTasksContainer');
    console.log('Tasks container:', tasksContainer);

    if (!tasksContainer) {
        console.error('Tasks container not found');
        return;
    }

    const taskItems = tasksContainer.querySelectorAll('.task-item');
    console.log('Found task items:', taskItems.length);
}

// Экспортируем для использования в script.js
if (typeof window !== 'undefined') {
    window.initCompletedTasksPage = initCompletedTasksPage;
}