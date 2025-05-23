async function showAlert(message, delay = 2000) {
    alert(message);
    return new Promise(resolve => setTimeout(resolve, delay));
}

async function sendTask(task) {
    try {
        const response = await fetch('/api/task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Ошибка при добавлении задачи');
        }

        return await response.json();
    } catch (err) {
        alert('Ошибка: ' + err.message);
        console.error(err);
    }
}

function initAddTaskPage() {
    const taskForm = document.getElementById('taskForm');
    if (!taskForm) return;

    taskForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const task = {
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDescription').value.trim(),
            due_date: document.getElementById('taskDueDate').value
        };

        if (!task.title || !task.due_date) {
            alert('Пожалуйста, заполните обязательные поля: Заголовок и Срок выполнения.');
            return;
        }

        const result = await sendTask(task);
        if (result && result.status === 'success') {
            await showAlert('Задача добавлена');
            taskForm.reset();
        }
    });
}

window.addEventListener('DOMContentLoaded', initAddTaskPage);