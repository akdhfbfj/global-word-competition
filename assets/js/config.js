/**
 * 글로벌 국제 영어 단어 대회 — 사이트 설정
 */
const SITE = {
  orgName: '(주)글로벌영어교육아카데미',
  orgNameEn: 'Global English Education Academy',
  contact: {
    kakao: '010-8034-9314',
    hours: '평일 10:00 ~ 18:00',
    email: 'geea.asia@gmail.com',
  },
  address: '서울특별시 강남구 테헤란로2길 27, 904호',
  ceo: '이진규',
};

const COMPETITIONS = {
  word: {
    id: 'word',
    title: '글로벌 국제 영어 단어 대회',
    titleEn: 'Global International English Word Competition',
    shortTitle: '단어 대회',
    // Google Apps Script Web App URL — 배포 후 입력
    sheetsEndpoint: '',
    fee: 60000,
    bank: {
      name: '신한은행 (법인)',
      account: '', // 계좌번호 확정 후 입력
      holder: '(주)글로벌영어교육아카데미',
    },
    // CEFR 참가 레벨
    levels: [
      { id: 'a1', label: 'A1' },
      { id: 'a2', label: 'A2' },
      { id: 'b1', label: 'B1' },
      { id: 'b2', label: 'B2' },
      { id: 'c1', label: 'C1' },
      { id: 'c2', label: 'C2' },
    ],
    schedule: {
      registrationStart: '2026-06-21',
      registrationEnd: '2026-08-21',
      competitionDate: '2026-08-22',
    },
    format: '온라인(Zoom)',
    groupApplyMode: 'excel', // 'excel' | 'web' | 'both'
  },
  // speak: { ... } — 말하기 대회 통합 시 추가
};
