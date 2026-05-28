/**
 * 단어 대회 — 개인/단체 신청 폼
 */

function initIndividualForm() {
  const form = $('#individual-form');
  if (!form) return;

  populateDivisions($('#division', form));
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
      division: $('#division', form).value,
      address: $('#address', form).value.trim(),
      coupon: $('#coupon', form)?.value.trim() || '',
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
      coupon: $('#coupon', form)?.value.trim() || '',
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

function initParticipantTable() {
  const tbody = $('#participant-tbody');
  const addBtn = $('#add-participant');
  if (!tbody || !addBtn) return;

  addBtn.addEventListener('click', () => addParticipantRow());
  addParticipantRow();

  const excelInput = $('#excel-upload');
  if (excelInput) {
    excelInput.addEventListener('change', () => {
      alert('엑셀 업로드 기능은 Google Sheets 연동과 함께 구현 예정입니다.\n현재는 아래 표에서 직접 입력해 주세요.');
      excelInput.value = '';
    });
  }
}

function addParticipantRow(data = {}) {
  const tbody = $('#participant-tbody');
  const divisions = COMPETITIONS.word.divisions;
  const row = document.createElement('tr');

  row.innerHTML = `
    <td><input type="text" name="pName" value="${data.name || ''}" placeholder="이름" required></td>
    <td><input type="text" name="pSchool" value="${data.school || ''}" placeholder="학교"></td>
    <td><input type="text" name="pGrade" value="${data.grade || ''}" placeholder="학년"></td>
    <td>
      <select name="pDivision">
        <option value="">부문</option>
        ${divisions.map((d) => `<option value="${d.id}" ${data.division === d.id ? 'selected' : ''}>${d.label}</option>`).join('')}
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
      division: $('select[name="pDivision"]', row)?.value,
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
    regEl.textContent = `${formatDate(sched.registrationStart)} ~ ${formatDate(sched.registrationEnd)}`;
  }
  if (competitionEl) {
    competitionEl.textContent = formatDateShort(sched.competitionDate);
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

function initAboutSchedule() {
  const tbody = $('#schedule-table-body');
  if (!tbody) return;

  const s = COMPETITIONS.word.schedule;
  const rows = [
    ['접수', `${formatDate(s.registrationStart)} ~ ${formatDate(s.registrationEnd)}`],
    ['대회', formatDateShort(s.competitionDate)],
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
  initAboutSchedule();
});
