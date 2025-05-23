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

function setMinDueDate() {
    const dueDateInput = document.getElementById('taskDueDate');
    if (!dueDateInput) return;

    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);

    // Форматируем дату в yyyy-mm-dd для input[type="date"]
    const yyyy = minDate.getFullYear();
    const mm = String(minDate.getMonth() + 1).padStart(2, '0');
    const dd = String(minDate.getDate()).padStart(2, '0');
    dueDateInput.min = `${yyyy}-${mm}-${dd}`;

    // При желании, можно очистить текущее значение, если оно меньше min
    if (dueDateInput.value && dueDateInput.value < dueDateInput.min) {
        dueDateInput.value = dueDateInput.min;
    }
}

function initAddTaskPage() {
    setMinDueDate();

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

        // Проверяем, что выбранная дата >= min
        if (task.due_date < document.getElementById('taskDueDate').min) {
            alert(`Дата должна быть не ранее ${document.getElementById('taskDueDate').min}`);
            return;
        }

        const result = await sendTask(task);
        if (result && result.status === 'success') {
            await showAlert('Задача добавлена');
            taskForm.reset();
            setMinDueDate();
        }
    });
}

window.addEventListener('DOMContentLoaded', initAddTaskPage);
function navigateTo(url) {
    window.location.assign(url);
}
