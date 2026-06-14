/**
 * 공통 폼 유틸리티
 */

function $(sel, ctx = document) {
  return ctx.querySelector(sel);
}

function $$(sel, ctx = document) {
  return [...ctx.querySelectorAll(sel)];
}

function formatCurrency(amount) {
  return amount.toLocaleString('ko-KR') + '원';
}

function formatDate(dateStr) {
  if (!dateStr) return '미정';
  const [y, m, d] = dateStr.split('-');
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
}

function formatDateRange(startStr, endStr) {
  if (!startStr || !endStr) return '미정';
  const [sy, sm, sd] = startStr.split('-');
  const [, em, ed] = endStr.split('-');
  return `${sy}년 ${parseInt(sm)}월 ${parseInt(sd)}일 ~ ${parseInt(em)}월 ${parseInt(ed)}일`;
}

function formatDateFull(dateStr) {
  if (!dateStr) return '미정';
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일(${days[d.getDay()]})`;
}

function formatDateShort(dateStr) {
  return formatDateFull(dateStr);
}

function renderTitleHtml(comp) {
  const h = comp.titleHighlight || '단어';
  return `${comp.titleBefore || ''}<span class="text-gold">${h}</span>${comp.titleAfter || ''}`;
}

function renderTitlePlain(comp) {
  return `${comp.titleBefore || ''}${comp.titleHighlight || ''}${comp.titleAfter || ''}`;
}

function populateLevels(selectEl) {
  if (!selectEl) return;
  const levels = COMPETITIONS.word.levels;
  selectEl.innerHTML =
    '<option value="">레벨을 선택하세요</option>' +
    levels.map((l) => `<option value="${l.id}">${l.label}</option>`).join('');
}

/** @deprecated populateLevels 사용 */
function populateDivisions(selectEl) {
  populateLevels(selectEl);
}

function formatBankAccount(bank) {
  if (bank.account) {
    return `${bank.name} ${bank.account} (${bank.holder})`;
  }
  return `${bank.name} 법인 계좌 (${bank.holder})`;
}

function validateRequired(form) {
  let valid = true;
  $$('[data-required]', form).forEach((group) => {
    const hiddenBirth = $('#birthDate', group);
    const input =
      hiddenBirth ||
      $('input:not([type="hidden"]), select, textarea', group);
    const errorEl = $('.form-error', group);
    const isCheckbox = input?.type === 'checkbox';

    let isEmpty = false;
    if (isCheckbox) {
      isEmpty = !input.checked;
    } else if (input) {
      isEmpty = !input.value.trim();
    }

    if (isEmpty) {
      group.classList.add('is-invalid');
      if (errorEl) errorEl.textContent = '필수 입력 항목입니다.';
      valid = false;
    } else {
      group.classList.remove('is-invalid');
    }
  });
  return valid;
}

function bindFormClearErrors(form) {
  $$('input, select, textarea', form).forEach((el) => {
    el.addEventListener('input', () => {
      el.closest('.form-group')?.classList.remove('is-invalid');
    });
  });
}

function showSuccess(container, receiptNo) {
  const comp = COMPETITIONS.word;
  container.innerHTML = `
    <div class="form-success">
      <div class="form-success__icon">✓</div>
      <h2>접수가 완료되었습니다</h2>
      <p>아래 접수번호를 꼭 기록해 주세요.</p>
      <div class="receipt-no">${receiptNo}</div>
      <div class="form-notice">
        <strong>입금 안내</strong><br>
        참가비: ${formatCurrency(comp.fee)} (1인)<br>
        ${formatBankAccount(comp.bank)}<br>
        입금자명: 신청 시 입력한 이름(단체: 단체명)<br><br>
        입금 확인 후 2영업일 이내 안내 문자가 발송됩니다.
      </div>
      <a href="../index.html" class="btn btn--primary">홈으로</a>
    </div>
  `;
}

function initBirthDateInput(form) {
  const yearEl = $('#birthYear', form);
  const monthEl = $('#birthMonth', form);
  const dayEl = $('#birthDay', form);
  const hiddenEl = $('#birthDate', form);
  if (!yearEl || !monthEl || !dayEl || !hiddenEl) return;

  function syncHidden() {
    const y = yearEl.value.padStart(4, '0');
    const m = monthEl.value.padStart(2, '0');
    const d = dayEl.value.padStart(2, '0');
    hiddenEl.value =
      yearEl.value.length === 4 && monthEl.value && dayEl.value ? `${y}-${m}-${d}` : '';
  }

  function digitsOnly(el, max) {
    el.value = el.value.replace(/\D/g, '').slice(0, max);
    syncHidden();
  }

  yearEl.addEventListener('input', () => {
    digitsOnly(yearEl, 4);
    if (yearEl.value.length === 4) monthEl.focus();
  });
  monthEl.addEventListener('input', () => {
    digitsOnly(monthEl, 2);
    if (monthEl.value.length === 2) dayEl.focus();
  });
  dayEl.addEventListener('input', () => digitsOnly(dayEl, 2));
}

function initLevelGuide(form) {
  const select = $('#level', form);
  const guideEl = $('#level-guide', form);
  if (!select || !guideEl) return;

  const comp = COMPETITIONS.word;
  const groupMap = {
    a1: 'A', a2: 'A', b1: 'B', b2: 'B', c1: 'C', c2: 'C',
  };

  function renderGuide() {
    const key = groupMap[select.value];
    const group = comp.levelGroups.find((g) => g.key === key);
    if (!group) {
      guideEl.innerHTML = comp.levelGroups
        .map(
          (g) => `
          <div class="level-guide__item">
            <strong>${g.title}</strong>
            <p>${g.desc}</p>
          </div>`
        )
        .join('');
      return;
    }
    guideEl.innerHTML = `
      <div class="level-guide__item level-guide__item--active">
        <strong>${group.title}</strong>
        <p>${group.desc}</p>
      </div>`;
  }

  select.addEventListener('change', renderGuide);
  renderGuide();
}

function initSiteMeta() {
  const comp = COMPETITIONS.word;

  $$('[data-site-org]').forEach((el) => (el.textContent = SITE.orgName));
  $$('[data-site-title]').forEach((el) => {
    el.innerHTML = renderTitleHtml(comp);
  });
  $$('[data-site-title-plain]').forEach((el) => {
    el.textContent = renderTitlePlain(comp);
  });
  $$('[data-site-title-en]').forEach((el) => (el.textContent = comp.titleEn));
  $$('[data-site-contact]').forEach((el) => (el.textContent = SITE.contact.kakao));
  $$('[data-site-email]').forEach((el) => (el.textContent = SITE.contact.email));
  $$('[data-site-address]').forEach((el) => (el.textContent = SITE.address));
  $$('[data-site-ceo]').forEach((el) => (el.textContent = SITE.ceo));
  $$('[data-fee]').forEach((el) => (el.textContent = formatCurrency(comp.fee)));
  $$('[data-bank-info]').forEach((el) => (el.textContent = formatBankAccount(comp.bank)));
}

function initMobileNav() {
  const toggle = $('.nav-toggle');
  const nav = $('.nav-main');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', nav.classList.contains('is-open'));
  });
}

function initActiveNav() {
  const path = window.location.pathname;
  $$('.nav-main a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href && path.includes(href.replace('../', '').replace('./', ''))) {
      link.classList.add('is-active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSiteMeta();
  initMobileNav();
  initActiveNav();
});
