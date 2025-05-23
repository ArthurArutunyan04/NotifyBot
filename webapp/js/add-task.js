function initAddTaskPage() {
    console.log('Add task page initialized');

    const taskForm = document.getElementById('taskForm');
    if (!taskForm) {
        console.error('Task form not found');
        return;
    }

    taskForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Предотвращаем реальную отправку

        const taskTitle = document.getElementById('taskTitle').value;
        const taskDescription = document.getElementById('taskDescription').value;
        const taskDueDate = document.getElementById('taskDueDate').value;

        console.log('Form submitted (decorative):', {
            taskTitle,
            taskDescription,
            taskDueDate
        });

        try {
            await showAlert('Задача добавлена', 2000);
            console.log('Alert shown successfully');
            taskForm.reset();
        } catch (error) {
            console.error('Failed to show alert:', error);
        }
    });
}

if (typeof window !== 'undefined') {
    window.initAddTaskPage = initAddTaskPage;
}