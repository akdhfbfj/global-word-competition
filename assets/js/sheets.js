/**
 * Google Sheets 연동 (Apps Script Web App)
 * config.js의 sheetsEndpoint 설정 후 사용
 */

function generateReceiptNo() {
  const date = new Date();
  const ymd = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `W${ymd}-${rand}`;
}

async function submitToSheets(type, data) {
  const comp = COMPETITIONS.word;
  const endpoint = comp.sheetsEndpoint;

  const payload = {
    type,
    competitionId: comp.id,
    receiptNo: generateReceiptNo(),
    submittedAt: new Date().toISOString(),
    ...data,
  };

  if (!endpoint) {
    console.warn('[sheets] sheetsEndpoint 미설정 — 데모 모드로 처리');
    await new Promise((r) => setTimeout(r, 800));
    return { success: true, receiptNo: payload.receiptNo, demo: true };
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload),
  });

  // no-cors 모드에서는 응답 본문 확인 불가 — 접수번호는 클라이언트에서 생성
  return { success: true, receiptNo: payload.receiptNo };
}

async function checkReceipt(receiptNo, name, phoneLast4) {
  const endpoint = COMPETITIONS.word.sheetsEndpoint;

  if (!endpoint) {
    return {
      found: false,
      message: '접수 확인 기능은 Google Sheets 연동 후 이용 가능합니다.',
    };
  }

  const url = `${endpoint}?action=check&receiptNo=${encodeURIComponent(receiptNo)}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phoneLast4)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch {
    return { found: false, message: '조회 중 오류가 발생했습니다.' };
  }
}
