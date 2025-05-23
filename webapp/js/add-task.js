async function showAlert(message, delay = 2000) {
    alert(message);
    await new Promise(resolve => setTimeout(resolve, delay));
}

async function sendTask(task) {
    try {
        const response = await fetch('/api/task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            due_date: document.getElementById('taskDueDate').value,
        };

        await sendTask(task);
        await showAlert('Задача добавлена');
        taskForm.reset();
    });
}

if (typeof window !== 'undefined') {
    window.initAddTaskPage = initAddTaskPage;
}
