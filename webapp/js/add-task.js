function initAddTaskPage() {
    const form = document.getElementById('taskForm');
    if (!form) return;

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDueDate').min = today;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleFormSubmit(form);
    });
}

async function handleFormSubmit(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
        const taskData = {
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDescription').value.trim(),
            deadline: document.getElementById('taskDueDate').value
        };

        if (!taskData.title) {
            throw new Error('Введите название задачи');
        }

        await apiRequest('/tasks', 'POST', taskData);
        showAlert('Задача успешно добавлена!');
        form.reset();


    } catch (error) {
        console.error('Error adding task:', error);
        showAlert(`Ошибка: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
    }
}

if (document.readyState !== 'loading') {
    initAddTaskPage();
}