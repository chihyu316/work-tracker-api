const API_BASE = 'https://work-tracker-o0hbogvr1-chihyu316s-projects.vercel.app';

let currentView = 'week';

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('inp-date').value = today();
    loadReport();
});

// 工具函式
const today = () => new Date().toISOString().slice(0, 10);

function getWeekStart() {
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d.toISOString().slice(0, 10);
}

function getMonthStart() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function scoreClass(s) {
    if (s === 0) return 'score-0';
    if (s >= 8) return 'score-high';
    if (s >= 5) return 'score-mid';
    return 'score-low';
}

// 新增記錄
async function saveRecord() {
    const title = document.getElementById('inp-title').value.trim();
    const date = document.getElementById('inp-date').value;
    const type = document.getElementById('inp-type').value;
    const rating = parseInt(document.getElementById('inp-rating').value) || 0;
    const note = document.getElementById('inp-note').value.trim();
    const msg = document.getElementById('save-msg');

    if (!title) { msg.textContent = '請填寫工作項目名稱'; msg.className = 'msg error'; return; }
    if (!date) { msg.textContent = '請選擇日期'; msg.className = 'msg error'; return; }

    msg.textContent = '儲存中...'; msg.className = 'msg';

    try {
        const res = await fetch(`${API_BASE}/api/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, date, type, rating, note })
        });
        const data = await res.json();

        if (data.success) {
            msg.textContent = '✅ 儲存成功！';
            msg.className = 'msg success';
            document.getElementById('inp-title').value = '';
            document.getElementById('inp-note').value = '';
            document.getElementById('inp-rating').value = '';
            loadReport();
        } else {
            msg.textContent = '❌ 錯誤：' + data.error;
            msg.className = 'msg error';
        }
    } catch (e) {
        msg.textContent = '❌ 無法連線到伺服器';
        msg.className = 'msg error';
    }
}

// 切換檢視
function setView(view, btn) {
    currentView = view;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    loadReport();
}

// 載入報表
async function loadReport() {
    const el = document.getElementById('report-content');
    el.textContent = '載入中...';

    try {
        const res = await fetch(`${API_BASE}/api/report`);
        const data = await res.json();

        if (!data.success) {
            el.textContent = '載入失敗：' + data.error;
            return;
        }

        // 依照檢視過濾日期
        let startDate = '';
        if (currentView === 'week') startDate = getWeekStart();
        if (currentView === 'month') startDate = getMonthStart();

        const dates = startDate
            ? data.dates.filter(d => d >= startDate)
            : data.dates;

        if (dates.length === 0 || data.rows.length === 0) {
            el.textContent = '目前沒有資料';
            return;
        }

        // 產生表格（對應你的 Excel 格式）
        let html = '<table>';

        // 表頭：工作盤點 | 4/14 | 4/15 | ...
        html += '<tr><th class="item-col">工作盤點</th>';
        dates.forEach(d => {
            const label = d.slice(5).replace('-', '/'); // 2026-04-14 → 04/14
            html += `<th>${label}</th>`;
        });
        html += '</tr>';

        // 每一列 = 一個工作項目
        data.rows.forEach(row => {
            html += `<tr><td class="item-col">${row.title}</td>`;
            dates.forEach(d => {
                const score = row.scores[data.dates.indexOf(d)] ?? 0;
                html += `<td class="${scoreClass(score)}">${score || ''}</td>`;
            });
            html += '</tr>';
        });

        html += '</table>';
        el.innerHTML = html;

    } catch (e) {
        el.textContent = '❌ 無法連線到伺服器';
    }
}
