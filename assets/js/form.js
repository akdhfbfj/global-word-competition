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

function formatDateShort(dateStr) {
  if (!dateStr) return '미정';
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]})`;
}

function populateDivisions(selectEl) {
  if (!selectEl) return;
  const divisions = COMPETITIONS.word.divisions;
  selectEl.innerHTML =
    '<option value="">부문을 선택하세요</option>' +
    divisions.map((d) => `<option value="${d.id}">${d.label}</option>`).join('');
}

function validateRequired(form) {
  let valid = true;
  $$('[data-required]', form).forEach((group) => {
    const input = $('input, select, textarea', group);
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
        ${comp.bank.name} ${comp.bank.account} (${comp.bank.holder})<br>
        입금자명: 신청 시 입력한 이름(단체: 단체명)<br><br>
        입금 확인 후 2영업일 이내 안내 문자가 발송됩니다.
      </div>
      <a href="../index.html" class="btn btn--primary">홈으로</a>
    </div>
  `;
}

function initSiteMeta() {
  const comp = COMPETITIONS.word;

  $$('[data-site-org]').forEach((el) => (el.textContent = SITE.orgName));
  $$('[data-site-title]').forEach((el) => (el.textContent = comp.title));
  $$('[data-site-title-en]').forEach((el) => (el.textContent = comp.titleEn));
  $$('[data-site-contact]').forEach((el) => (el.textContent = SITE.contact.kakao));
  $$('[data-site-address]').forEach((el) => (el.textContent = SITE.address));
  $$('[data-site-ceo]').forEach((el) => (el.textContent = SITE.ceo));
  $$('[data-fee]').forEach((el) => (el.textContent = formatCurrency(comp.fee)));
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
