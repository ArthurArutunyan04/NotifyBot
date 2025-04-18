document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('taskForm');
    const taskDate = document.getElementById("taskDueDate")

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDueDate').min = today;

    if (taskForm) {
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const title = document.getElementById('taskTitle').value;
            const description = document.getElementById('taskDescription').value;
            const dueDate = document.getElementById('taskDueDate').value;

            console.log('Добавление задачи:', { title, description, dueDate });

            alert('Задача добавлена!');
            navigateTo('index.html');
        });
    }
});