/**
 * 글로벌 국제 영어 단어 대회 — 사이트 설정
 * 추후 수정: 참가부문, 참가비, 일정, Sheets URL 등
 */
const SITE = {
  orgName: '(주)글로벌영어교육아카데미',
  orgNameEn: 'Global English Education Academy',
  contact: {
    kakao: '010-8034-9314',
    hours: '평일 10:00 ~ 18:00',
    email: '', // 추후 입력
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
    fee: 90000, // 추후 수정
    bank: {
      name: '신한은행',
      account: '000-000-000000', // 추후 수정
      holder: '(주)글로벌영어교육아카데미',
    },
    // 참가 부문 — 추후 수정
    divisions: [
      { id: 'elem-low', label: '초등 저학년 (1~3학년)' },
      { id: 'elem-high', label: '초등 고학년 (4~6학년)' },
      { id: 'middle', label: '중등부' },
      { id: 'high', label: '고등부' },
    ],
    schedule: {
      registrationStart: '2026-06-01',
      registrationEnd: '2026-07-31',
      competitionDate: '2026-08-22', // 대회 당일 (예선·본선 구분 없음)
    },
    groupApplyMode: 'both', // 'excel' | 'web' | 'both'
  },
  // speak: { ... } — 말하기 대회 통합 시 추가
};
