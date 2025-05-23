function initActiveTasksPage() {
    console.log('Active tasks page initialized');

    window.completeTask = function(taskId) {
        console.log(`Completing task ${taskId} (decorative)`);
        const taskItem = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
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

    window.deleteTask = function(taskId) {
        console.log(`Deleting task ${taskId} (decorative)`);
        const taskItem = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
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

if (typeof window !== 'undefined') {
    window.initActiveTasksPage = initActiveTasksPage;
}