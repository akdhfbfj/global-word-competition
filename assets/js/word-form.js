/**
 * 단어 대회 — 개인/단체 신청 폼
 */

function initIndividualForm() {
  const form = $('#individual-form');
  if (!form) return;

  populateLevels($('#level', form));
  initBirthDateInput(form);
  initLevelGuide(form);
  bindFormClearErrors(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateRequired(form)) return;

    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    btn.textContent = '제출 중...';

    const data = {
      name: $('#name', form).value.trim(),
      birthDate: $('#birthDate', form).value,
      school: $('#school', form).value.trim(),
      grade: $('#grade', form).value.trim(),
      phoneStudent: $('#phoneStudent', form).value.trim(),
      phoneParent: $('#phoneParent', form).value.trim(),
      email: $('#email', form).value.trim(),
      level: $('#level', form).value,
      address: $('#address', form).value.trim(),
    };

    try {
      const result = await submitToSheets('individual', data);
      form.closest('.form-card').innerHTML = '';
      showSuccess(form.closest('.form-card'), result.receiptNo);
    } catch {
      alert('제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      btn.disabled = false;
      btn.textContent = '접수하기';
    }
  });
}

function initGroupForm() {
  const form = $('#group-form');
  if (!form) return;

  bindFormClearErrors(form);
  initParticipantTable();
  updateFeeSummary();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateRequired(form)) return;

    const participants = collectParticipants();
    if (participants.length === 0) {
      alert('참가자를 1명 이상 추가해 주세요.');
      return;
    }

    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    btn.textContent = '제출 중...';

    const data = {
      orgName: $('#orgName', form).value.trim(),
      phoneAcademy: $('#phoneAcademy', form).value.trim(),
      phoneParent: $('#phoneParent', form).value.trim(),
      address: $('#address', form).value.trim(),
      participantCount: participants.length,
      totalFee: participants.length * COMPETITIONS.word.fee,
      participants,
    };

    try {
      const result = await submitToSheets('group', data);
      form.closest('.form-card').innerHTML = '';
      showSuccess(form.closest('.form-card'), result.receiptNo);
    } catch {
      alert('제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      btn.disabled = false;
      btn.textContent = '접수하기';
    }
  });
}

function parseCsvParticipants(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map((h) => h.trim().replace(/^\uFEFF/, ''));
  const nameIdx = header.findIndex((h) => /이름|name/i.test(h));
  const schoolIdx = header.findIndex((h) => /학교|school/i.test(h));
  const gradeIdx = header.findIndex((h) => /학년|grade/i.test(h));
  const levelIdx = header.findIndex((h) => /레벨|level|부문/i.test(h));

  if (nameIdx === -1) {
    throw new Error('CSV 첫 줄에 "이름" 열이 필요합니다.');
  }

  const levelMap = Object.fromEntries(
    COMPETITIONS.word.levels.flatMap((l) => [
      [l.label.toLowerCase(), l.id],
      [l.id, l.id],
    ])
  );

  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    const rawLevel = levelIdx >= 0 ? cols[levelIdx] : '';
    const levelId = levelMap[rawLevel.toLowerCase()] || rawLevel.toLowerCase();
    return {
      name: cols[nameIdx] || '',
      school: schoolIdx >= 0 ? cols[schoolIdx] : '',
      grade: gradeIdx >= 0 ? cols[gradeIdx] : '',
      level: levelId,
    };
  }).filter((p) => p.name);
}

function initParticipantTable() {
  const tbody = $('#participant-tbody');
  const addBtn = $('#add-participant');
  if (!tbody || !addBtn) return;

  addBtn.addEventListener('click', () => addParticipantRow());

  const excelInput = $('#excel-upload');
  if (excelInput) {
    excelInput.addEventListener('change', async () => {
      const file = excelInput.files?.[0];
      if (!file) return;

      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'xlsx' || ext === 'xls') {
        alert('엑셀(.xlsx) 파일은 CSV로 저장 후 업로드해 주세요.\n엑셀 → 다른 이름으로 저장 → CSV UTF-8');
        excelInput.value = '';
        return;
      }

      try {
        const text = await file.text();
        const participants = parseCsvParticipants(text);
        if (participants.length === 0) {
          alert('참가자 데이터를 찾을 수 없습니다. 양식을 확인해 주세요.');
          return;
        }
        tbody.innerHTML = '';
        participants.forEach((p) => addParticipantRow(p));
        alert(`${participants.length}명의 참가자를 불러왔습니다.`);
      } catch (err) {
        alert(err.message || '파일을 읽는 중 오류가 발생했습니다.');
      }
      excelInput.value = '';
    });
  }

  if ($$('#participant-tbody tr').length === 0) {
    addParticipantRow();
  }
}

function addParticipantRow(data = {}) {
  const tbody = $('#participant-tbody');
  const levels = COMPETITIONS.word.levels;
  const row = document.createElement('tr');

  row.innerHTML = `
    <td><input type="text" name="pName" value="${data.name || ''}" placeholder="이름" required></td>
    <td><input type="text" name="pSchool" value="${data.school || ''}" placeholder="학교"></td>
    <td><input type="text" name="pGrade" value="${data.grade || ''}" placeholder="학년"></td>
    <td>
      <select name="pLevel">
        <option value="">레벨</option>
        ${levels.map((l) => `<option value="${l.id}" ${data.level === l.id ? 'selected' : ''}>${l.label}</option>`).join('')}
      </select>
    </td>
    <td><button type="button" class="btn btn--sm btn--outline remove-row">삭제</button></td>
  `;

  $('.remove-row', row).addEventListener('click', () => {
    if ($$('#participant-tbody tr').length <= 1) {
      alert('최소 1명의 참가자가 필요합니다.');
      return;
    }
    row.remove();
    updateFeeSummary();
  });

  $$('input, select', row).forEach((el) => {
    el.addEventListener('change', updateFeeSummary);
  });

  tbody.appendChild(row);
  updateFeeSummary();
}

function collectParticipants() {
  const rows = $$('#participant-tbody tr');
  return rows
    .map((row) => ({
      name: $('input[name="pName"]', row)?.value.trim(),
      school: $('input[name="pSchool"]', row)?.value.trim(),
      grade: $('input[name="pGrade"]', row)?.value.trim(),
      level: $('select[name="pLevel"]', row)?.value,
    }))
    .filter((p) => p.name);
}

function updateFeeSummary() {
  const countEl = $('#participant-count');
  const totalEl = $('#total-fee');
  if (!countEl || !totalEl) return;

  const count = collectParticipants().length;
  const fee = COMPETITIONS.word.fee;
  countEl.textContent = count + '명';
  totalEl.textContent = formatCurrency(count * fee);
}

function initCheckForm() {
  const form = $('#check-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const resultEl = $('#check-result');
    const receiptNo = $('#receiptNo', form).value.trim();
    const name = $('#checkName', form).value.trim();
    const phone = $('#phoneLast4', form).value.trim();

    if (!receiptNo || !name || !phone) {
      resultEl.innerHTML = '<p class="form-error" style="display:block">모든 항목을 입력해 주세요.</p>';
      return;
    }

    resultEl.innerHTML = '<p>조회 중...</p>';
    const result = await checkReceipt(receiptNo, name, phone);

    if (result.found) {
      resultEl.innerHTML = `
        <div class="form-notice">
          <strong>접수 확인됨</strong><br>
          접수번호: ${result.receiptNo || receiptNo}<br>
          이름: ${result.name || name}<br>
          상태: ${result.status || '접수완료'}
        </div>
      `;
    } else {
      resultEl.innerHTML = `<p class="form-error" style="display:block">${result.message || '일치하는 접수 내역이 없습니다.'}</p>`;
    }
  });
}

function initHomeCards() {
  const comp = COMPETITIONS.word;
  const sched = comp.schedule;

  const regEl = $('#card-registration');
  const competitionEl = $('#card-competition');
  const feeEl = $('#card-fee');

  if (regEl) {
    regEl.textContent = formatDateRange(sched.registrationStart, sched.registrationEnd);
  }
  if (competitionEl) {
    competitionEl.textContent = formatDateFull(sched.competitionDate);
  }
  if (feeEl) {
    feeEl.textContent = formatCurrency(comp.fee);
  }

  const ddayEl = $('#hero-dday');
  if (ddayEl && sched.registrationEnd) {
    const end = new Date(sched.registrationEnd);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    ddayEl.textContent =
      diff > 0 ? `접수 마감까지 D-${diff}` : diff === 0 ? '오늘 접수 마감' : '접수가 마감되었습니다';
  }
}

function initHomeLevels() {
  const container = $('#home-level-cards');
  if (!container) return;

  container.innerHTML = COMPETITIONS.word.levelGroups
    .map(
      (g) => `
      <div class="card card--center">
        <div class="card__title">${g.title}</div>
        <div class="card__value card__value--desc">${g.desc}</div>
      </div>`
    )
    .join('');
}

function initAboutSchedule() {
  const tbody = $('#schedule-table-body');
  if (!tbody) return;

  const comp = COMPETITIONS.word;
  const s = comp.schedule;
  const rows = [
    ['접수', formatDateRange(s.registrationStart, s.registrationEnd)],
    ['대회', formatDateFull(s.competitionDate)],
    ['진행 방식', comp.format],
  ];

  tbody.innerHTML = rows
    .map(([label, value]) => `<tr><th>${label}</th><td>${value}</td></tr>`)
    .join('');
}

document.addEventListener('DOMContentLoaded', () => {
  initIndividualForm();
  initGroupForm();
  initCheckForm();
  initHomeCards();
  initHomeLevels();
  initAboutSchedule();
});
