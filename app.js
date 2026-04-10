const firebaseConfig = {
    apiKey: "AIzaSyA11zPbXEFs-sdIHKaxhkprkoGSGP1whfg",
    authDomain: "ims-fei.firebaseapp.com",
    databaseURL: "https://ims-fei-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ims-fei",
    storageBucket: "ims-fei.firebasestorage.app",
    messagingSenderId: "791711191329",
    appId: "1:791711191329:web:0a4ba03cd5f11eb71bae60"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
let debtors = [], transactions = [], myChart = null;

db.ref('debtors').on('value', s => {
    debtors = s.val() ? Object.values(s.val()) : [];
    renderApp();
});

db.ref('trans').on('value', s => {
    transactions = s.val() ? Object.values(s.val()) : [];
    renderApp();
    if (typeof updateDebtChart === 'function') updateDebtChart(transactions);
});

function renderApp() {
    const selNormal = document.getElementById('selectDebtor');
    const selInt = document.getElementById('selectInterestDebtor');
    const options = '<option value="">-- ชื่อ --</option>' +
        debtors.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

    if (selNormal) selNormal.innerHTML = options;
    if (selInt) selInt.innerHTML = options;

    const master = document.getElementById('debtorMasterList');
    if (master) master.innerHTML = debtors.map(d => `
        <div class="glass-card p-4 flex justify-between items-center mb-2 bg-white">
            <span class="font-bold text-slate-700">${d.name}</span>
            <button onclick="removeDebtor(${d.id})" class="text-slate-200 text-xs font-black">✕</button>
        </div>`).join('');

    // หนี้คือลบ (ยืมเป็นบวก คืนเงินเป็นลบ)
    const total = transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    // แสดงค่าสัมบูรณ์ใน UI เพราะเรามีเครื่องหมาย - ใน HTML แล้ว
    document.getElementById('totalDebtDisplay').innerText = Math.abs(total).toLocaleString();

    if (typeof updateHistoryTable === 'function') updateHistoryTable(transactions);
}

function handleRecord(type) {
    const dId = document.getElementById('selectDebtor').value;
    const debtor = debtors.find(d => d.id == dId);
    let amt = parseFloat(document.getElementById('inputAmount').value);

    if (!debtor || isNaN(amt)) return Swal.fire('ข้อมูลไม่ครบ', '', 'warning');
    if (type === 'repay') amt = -amt;

    const id = Date.now();
    db.ref('trans/' + id).set({
        id, name: debtor.name, amount: amt,
        timestamp: new Date().toLocaleString('th-TH'),
    }).then(() => {
        document.getElementById('inputAmount').value = '';
        setTimeout(() => checkCleanup(debtor.name), 1000);
    });
}

function checkCleanup(name) {
    const personTrans = transactions.filter(t => t.name === name);
    const sum = personTrans.reduce((s, t) => s + (t.amount || 0), 0);
    if (sum === 0 && personTrans.length > 0) {
        personTrans.forEach(t => db.ref('trans/' + t.id).remove());
        Swal.fire('อิสระ!', `${name} คืนเงินครบแล้ว ประวัติถูกลบ`, 'success');
    }
}

function addDebtor() {
    const name = document.getElementById('newDebtorName').value;
    if (!name) return;
    db.ref('debtors/' + Date.now()).set({ id: Date.now(), name }).then(() => {
        document.getElementById('newDebtorName').value = '';
    });
}

function removeDebtor(id) {
    Swal.fire({ title: 'ลบรายชื่อนี้?', icon: 'warning', showCancelButton: true }).then(r => {
        if (r.isConfirmed) db.ref('debtors/' + id).remove();
    });
}