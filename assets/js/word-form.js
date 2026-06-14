/**
 * 단어 대회 — 개인/단체 신청 폼
 */

function initIndividualForm() {
  const form = $('#individual-form');
  if (!form) return;

  populateLevels($('#level', form));
  initBirthDateInput(form);
  initLevelGuide(form);
  initPhoneInputs(form);
  bindFormClearErrors(form);

  const validatePhoneMatch = initPhoneConfirm(
    form,
    'phoneParent',
    'phoneParentConfirm',
    '학부모 연락처'
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateRequired(form)) return;
    if (validatePhoneMatch && !validatePhoneMatch()) return;

    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    btn.textContent = '제출 중...';

    const data = {
      name: $('#name', form).value.trim(),
      birthDate: $('#birthDate', form).value,
      school: $('#school', form).value.trim(),
      grade: $('#grade', form).value.trim(),
      phoneParent: $('#phoneParent', form).value.trim(),
      level: $('#level', form).value,
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

let uploadedParticipants = [];

function initGroupForm() {
  const form = $('#group-form');
  if (!form) return;

  bindFormClearErrors(form);
  initPhoneInputs(form);

  const validatePhoneMatch = initPhoneConfirm(
    form,
    'phoneAcademy',
    'phoneAcademyConfirm',
    '학원 연락처'
  );

  const countInput = $('#participantCountInput', form);
  if (countInput) {
    countInput.addEventListener('input', updateFeeSummary);
  }

  initCsvUpload(form);
  updateFeeSummary();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateRequired(form)) return;
    if (validatePhoneMatch && !validatePhoneMatch()) return;

    const count = parseInt($('#participantCountInput', form)?.value, 10) || 0;
    if (count < 1) {
      alert('참가 인원을 입력해 주세요.');
      return;
    }

    if (uploadedParticipants.length === 0) {
      const csvError = $('#csv-error', form);
      if (csvError) {
        csvError.textContent = '명단 파일을 업로드해 주세요.';
        csvError.closest('.form-group')?.classList.add('is-invalid');
      }
      return;
    }

    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    btn.textContent = '제출 중...';

    const data = {
      orgName: $('#orgName', form).value.trim(),
      phoneAcademy: $('#phoneAcademy', form).value.trim(),
      participantCount: count,
      totalFee: count * COMPETITIONS.word.fee,
      participants: uploadedParticipants,
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

  return lines
    .slice(1)
    .map((line) => {
      const cols = line.split(',').map((c) => c.trim());
      const rawLevel = levelIdx >= 0 ? cols[levelIdx] : '';
      const levelId = levelMap[rawLevel.toLowerCase()] || rawLevel.toLowerCase();
      return {
        name: cols[nameIdx] || '',
        school: schoolIdx >= 0 ? cols[schoolIdx] : '',
        grade: gradeIdx >= 0 ? cols[gradeIdx] : '',
        level: levelId,
      };
    })
    .filter((p) => p.name);
}

function initCsvUpload(form) {
  const excelInput = $('#excel-upload', form);
  if (!excelInput) return;

  excelInput.addEventListener('change', async () => {
    const file = excelInput.files?.[0];
    const csvError = $('#csv-error', form);
    const csvStatus = $('#csv-status', form);
    const group = excelInput.closest('.form-group');

    group?.classList.remove('is-invalid');
    if (csvError) csvError.textContent = '';
    if (csvStatus) csvStatus.hidden = true;
    uploadedParticipants = [];

    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') {
      if (csvError) csvError.textContent = '엑셀 파일은 CSV로 저장 후 업로드해 주세요.';
      group?.classList.add('is-invalid');
      excelInput.value = '';
      return;
    }

    try {
      const text = await file.text();
      uploadedParticipants = parseCsvParticipants(text);
      if (uploadedParticipants.length === 0) {
        if (csvError) csvError.textContent = '참가자 데이터를 찾을 수 없습니다. 양식을 확인해 주세요.';
        group?.classList.add('is-invalid');
        return;
      }
      if (csvStatus) {
        csvStatus.hidden = false;
        csvStatus.textContent = `${uploadedParticipants.length}명의 참가자 명단을 불러왔습니다.`;
      }
    } catch (err) {
      if (csvError) csvError.textContent = err.message || '파일을 읽는 중 오류가 발생했습니다.';
      group?.classList.add('is-invalid');
      excelInput.value = '';
    }
  });
}

function updateFeeSummary() {
  const countEl = $('#participant-count');
  const totalEl = $('#total-fee');
  const countInput = $('#participantCountInput');
  if (!countEl || !totalEl) return;

  const count = parseInt(countInput?.value, 10) || 0;
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
}

function renderCountdownDigits(value, pad) {
  return String(value)
    .padStart(pad, '0')
    .split('')
    .map((d) => `<span class="countdown__digit">${d}</span>`)
    .join('');
}

function initCompetitionCountdown() {
  const root = $('#hero-countdown');
  if (!root) return;

  const dateStr = COMPETITIONS.word.schedule.competitionDate;
  const target = new Date(dateStr + 'T09:00:00');

  function tick() {
    const now = new Date();
    let diff = Math.max(0, target - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * 1000 * 60 * 60 * 24;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * 1000 * 60 * 60;
    const mins = Math.floor(diff / (1000 * 60));
    diff -= mins * 1000 * 60;
    const secs = Math.floor(diff / 1000);

    const dayPad = days > 99 ? 3 : 2;
    $('#cd-days').innerHTML = renderCountdownDigits(days, dayPad);
    $('#cd-hours').innerHTML = renderCountdownDigits(hours, 2);
    $('#cd-mins').innerHTML = renderCountdownDigits(mins, 2);
    $('#cd-secs').innerHTML = renderCountdownDigits(secs, 2);
  }

  tick();
  setInterval(tick, 1000);
}

function initCefrLevelCards() {
  const container = $('#cefr-level-cards');
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
  initCompetitionCountdown();
  initCefrLevelCards();
  initAboutSchedule();
});
