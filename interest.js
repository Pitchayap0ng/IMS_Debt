let interestDebts = [];
db.ref('interest_debts').on('value', s => {
    interestDebts = s.val() ? Object.values(s.val()) : [];
    renderInterestPage();
});

function renderInterestPage() {
    const container = document.getElementById('interestDebtList');
    if (!container) return;

    container.innerHTML = interestDebts.map(d => {
        const nextDate = getNextDateLabel();
        const interest = (d.principle * d.rate) / 100;
        return `
            <div class="glass-card p-6 border-t-8 border-rose-500 bg-white shadow-xl shadow-rose-50/50">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="font-black text-xl">${d.name}</h3>
                    <span class="bg-rose-50 text-rose-500 text-[10px] font-bold px-3 py-1 rounded-full">${d.rate}%</span>
                </div>
                <div class="grid grid-cols-2 gap-3 mb-4 text-center">
                    <div class="bg-slate-50 p-3 rounded-2xl">
                        <p class="text-[9px] font-bold text-slate-400">ต้น</p>
                        <p class="font-black">${d.principle.toLocaleString()}</p>
                    </div>
                    <div class="bg-rose-50 p-3 rounded-2xl">
                        <p class="text-[9px] font-bold text-rose-400">ดอก</p>
                        <p class="font-black text-rose-600">${interest.toLocaleString()}</p>
                    </div>
                </div>
                <p class="text-center text-[10px] font-bold text-indigo-500 mb-4 bg-indigo-50 py-2 rounded-xl italic">จ่ายภายใน: ${nextDate}</p>
                <div class="flex gap-2">
                    <button onclick="Swal.fire('รับดอกแล้ว', '', 'success')" class="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-bold text-[10px]">จ่ายดอก</button>
                    <button onclick="closeInt('${d.id}')" class="flex-1 bg-slate-800 text-white py-3 rounded-xl font-bold text-[10px]">ปิดยอดต้น</button>
                </div>
            </div>`;
    }).join('');
}

function getNextDateLabel() {
    const d = new Date();
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    if (day < 15) return `15/${month}/${year}`;
    return `${new Date(year, month, 0).getDate()}/${month}/${year}`;
}

function saveInterestDebt() {
    const dId = document.getElementById('selectInterestDebtor').value;
    const debtor = debtors.find(d => d.id == dId);
    const principle = parseFloat(document.getElementById('principleAmount').value);
    const rate = parseFloat(document.getElementById('interestRate').value);
    if (!debtor || isNaN(principle)) return;

    db.ref('interest_debts/' + Date.now()).set({ id: Date.now(), name: debtor.name, principle, rate }).then(() => {
        document.getElementById('principleAmount').value = '';
        Swal.fire('เพิ่มหนี้ดอกเรียบร้อย', '', 'success');
    });
}

function closeInt(id) {
    Swal.fire({ title: 'ต้นครบแล้วใช่ไหม?', icon: 'warning', showCancelButton: true }).then(r => {
        if (r.isConfirmed) db.ref('interest_debts/' + id).remove();
    });
}