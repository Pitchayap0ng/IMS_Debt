function updateDebtChart(history) {
    const ctx = document.getElementById('debtChart');
    if (!ctx || history.length === 0) return;

    const lastSeven = [...history].sort((a, b) => a.id - b.id).slice(-7);
    const labels = lastSeven.map((_, i) => i + 1);

    let runningTotal = 0;
    const dataPoints = lastSeven.map(h => {
        runningTotal += h.amount;
        // แสดงเป็นค่าติดลบเพื่อให้กราฟสะท้อนสถานะหนี้
        return -Math.abs(runningTotal);
    });

    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: dataPoints,
                borderColor: '#f43f5e',
                backgroundColor: 'rgba(244, 63, 94, 0.05)',
                borderWidth: 4,
                tension: 0.4,
                pointRadius: 4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { display: true, grid: { display: false }, ticks: { font: { size: 8 } } }
            }
        }
    });
}

function updateHistoryTable(history) {
    const container = document.getElementById('historyList');
    if (!container) return;
    container.innerHTML = [...history].sort((a, b) => b.id - a.id).map(h => `
        <div class="glass-card p-4 flex justify-between items-center bg-white border-l-4 ${h.amount < 0 ? 'border-emerald-400' : 'border-rose-400'}">
            <div>
                <p class="font-bold text-slate-800">${h.name}</p>
                <p class="text-[9px] text-slate-400 font-bold">${h.timestamp}</p>
            </div>
            <p class="font-black text-lg ${h.amount < 0 ? 'text-emerald-500' : 'text-rose-500'}">${h.amount.toLocaleString()}</p>
        </div>`).join('');
}

function exportDebtExcel() {
    let csv = "\uFEFF\"วันที่\",\"ชื่อ\",\"ยอดเงิน\"\n";
    transactions.forEach(t => csv += `"${t.timestamp}","${t.name}","${t.amount}"\n`);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Report_${Date.now()}.csv`;
    link.click();
}