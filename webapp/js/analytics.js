async function fetchStatistics() {
    try {
        const res = await fetch('/api/task/statistics');
        if (!res.ok) throw new Error('Ошибка загрузки статистики');
        return await res.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}

function dowToRussian(dow) {
    if (dow === 0) return 6;
    return dow - 1;
}

async function initAnalyticsPage() {
    console.log('Analytics page initialized');
    Chart.register(ChartDataLabels);

    const stats = await fetchStatistics();
    if (!stats) return;

    const statusLabels = ["Выполнена", "Просрочена", "Удалена"];
    const statusData = statusLabels.map(label => stats.statusCounts[label] || 0);

    new Chart(document.getElementById('statusPieChart'), {
        type: 'pie',
        data: {
            labels: statusLabels,
            datasets: [{
                data: statusData,
                backgroundColor: ["#388E3C", "#D32F2F", "#FF9800"],
                borderColor: ["#ffffff", "#ffffff", "#ffffff"],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: { position: 'right', labels: { font: { size: 12 } } },
                title: { display: true, text: 'Распределение задач по статусам', font: { size: 14 } },
                datalabels: {
                    formatter: (value, ctx) => {
                        const data = ctx.chart.data.datasets[0].data;
                        const total = data.reduce((a,b) => a+b, 0);
                        if (total === 0) return '0%';
                        return (value / total * 100).toFixed(1) + '%';
                    },
                    color: '#fff',
                    font: { size: 14 },
                    anchor: 'center',
                    align: 'center'
                }
            }
        }
    });

    const timeLabels = ["0 часов", "24 часа и более"];
    const timeData = [
        stats.timeData.zero_hours || 0,
        stats.timeData.more_than_zero_hours || 0
    ];
    new Chart(document.getElementById('timeBarChart'), {
        type: 'bar',
        data: {
            labels: timeLabels,
            datasets: [{
                label: "Количество задач",
                data: timeData,
                backgroundColor: "steelblue",
                borderColor: "#ffffff",
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: { title: { display: true, text: "Время выполнения (часы)" } },
                y: { beginAtZero: true, title: { display: true, text: "Количество задач" }, ticks: { stepSize: 1 } }
            },
            plugins: {
                legend: { display: false },
                title: { display: true, text: "Время выполнения задач", font: { size: 14 } }
            }
        }
    });

    const totalTasks = statusData.reduce((a,b) => a+b, 0);
    const statusPercent = statusData.map(c => totalTasks ? (c / totalTasks * 100) : 0);
    new Chart(document.getElementById('statusBarChart'), {
        type: 'bar',
        data: {
            labels: statusLabels,
            datasets: [{
                label: "Доля от общего числа",
                data: statusPercent,
                backgroundColor: ["#388E3C", "#D32F2F", "#FF9800"],
                borderColor: ["#ffffff", "#ffffff", "#ffffff"],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: { title: { display: true, text: "Статус задачи" } },
                y: { beginAtZero: true, max: 100, title: { display: true, text: "Доля от общего числа (%)" } }
            },
            plugins: {
                legend: { display: false },
                title: { display: true, text: "Распределение задач по статусам", font: { size: 14 } }
            }
        }
    });

    const createdByDay = new Array(7).fill(0);
    const completedByDay = new Array(7).fill(0);

    for (const [dow, count] of Object.entries(stats.createdByDay)) {
        const index = dowToRussian(+dow);
        createdByDay[index] = count;
    }
    for (const [dow, count] of Object.entries(stats.completedByDay)) {
        const index = dowToRussian(+dow);
        completedByDay[index] = count;
    }

    const weekDays = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
    new Chart(document.getElementById('weeklyActivityChart'), {
        type: 'bar',
        data: {
            labels: weekDays,
            datasets: [
                {
                    label: "Создано задач",
                    data: createdByDay,
                    backgroundColor: "#2196F3",
                    borderColor: "#ffffff",
                    borderWidth: 1
                },
                {
                    label: "Выполнено задач",
                    data: completedByDay,
                    backgroundColor: "#388E3C",
                    borderColor: "#ffffff",
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                x: { title: { display: true, text: "День недели" } },
                y: { beginAtZero: true, title: { display: true, text: "Количество задач" }, ticks: { stepSize: 1 } }
            },
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: "Активность по дням недели", font: { size: 14 } }
            }
        }
    });
}

window.onload = initAnalyticsPage;
function navigateTo(url) {
    window.location.assign(url);
}
