function initAnalyticsPage() {
    console.log('Analytics page initialized');
}

if (typeof window !== 'undefined') {
    window.initAnalyticsPage = initAnalyticsPage;
}


Chart.register(ChartDataLabels);

new Chart(document.getElementById('statusPieChart'), {
    type: 'pie',
    data: {
        labels: ["Выполнена", "Просрочена", "Удалена"],
        datasets: [{
            data: [71.4, 14.3, 14.3],
            backgroundColor: ["#388E3C", "#D32F2F", "#FF9800"],
            borderColor: ["#ffffff", "#ffffff", "#ffffff"],
            borderWidth: 1
        }]
    },
    options: {
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    font: { size: 12 }
                }
            },
            title: {
                display: true,
                text: 'Распределение задач по статусам',
                font: { size: 14 }
            },
            datalabels: {
                formatter: (value, context) => {
                    const data = context.chart.data.datasets[0].data;
                    const total = data.reduce((sum, val) => sum + val, 0);
                    const percentage = (value / total * 100).toFixed(1);
                    return percentage + '%';
                },
                color: '#fff',
                font: { size: 14 },
                anchor: 'center',
                align: 'center'
            }
        }
    }
});
