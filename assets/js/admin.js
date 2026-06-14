/**
 * 운영진 admin — Google Sheets(Apps Script) 접수 조회 · CSV 내보내기
 */

let adminData = null;
let adminToken = '';

function rowsToTable(tableEl, rows) {
  if (!rows || rows.length === 0) {
    tableEl.innerHTML = '<thead><tr><td colspan="10">데이터 없음</td></tr></thead>';
    return;
  }
  const headers = Object.keys(rows[0]);
  tableEl.innerHTML = `
    <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>
      ${rows
        .map(
          (row) =>
            `<tr>${headers.map((h) => `<td>${row[h] ?? ''}</td>`).join('')}</tr>`
        )
        .join('')}
    </tbody>`;
}

function downloadCsv(filename, rows) {
  if (!rows || rows.length === 0) {
    alert('내보낼 데이터가 없습니다.');
    return;
  }
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
    ),
  ];
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function fetchAdminData() {
  const endpoint = COMPETITIONS.word.sheetsEndpoint;
  if (!endpoint) {
    throw new Error('sheetsEndpoint가 설정되지 않았습니다. config.js를 확인하세요.');
  }
  const url = `${endpoint}?action=admin&token=${encodeURIComponent(adminToken)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

function renderAdmin(data) {
  adminData = data;
  $('#stat-individual').textContent = data.individual?.length || 0;
  $('#stat-group').textContent = data.group?.length || 0;
  $('#stat-participants').textContent = data.participants?.length || 0;
  rowsToTable($('#table-individual'), data.individual);
  rowsToTable($('#table-group'), data.group);
}

async function loadAdmin() {
  try {
    const data = await fetchAdminData();
    renderAdmin(data);
    $('#admin-login').hidden = true;
    $('#admin-panel').hidden = false;
    sessionStorage.setItem('adminToken', adminToken);
  } catch (err) {
    alert(err.message || '데이터를 불러오지 못했습니다.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = $('#login-form');
  if (!loginForm) return;

  const saved = sessionStorage.getItem('adminToken');
  if (saved) {
    adminToken = saved;
    loadAdmin();
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    adminToken = $('#admin-token').value.trim();
    loadAdmin();
  });

  $('#btn-refresh')?.addEventListener('click', loadAdmin);

  $('#btn-export-individual')?.addEventListener('click', () => {
    downloadCsv('word_individual.csv', adminData?.individual);
  });

  $('#btn-export-group')?.addEventListener('click', () => {
    downloadCsv('word_group.csv', adminData?.group);
  });

  $('#btn-export-all')?.addEventListener('click', () => {
    downloadCsv('word_participants.csv', adminData?.participants);
  });
});
