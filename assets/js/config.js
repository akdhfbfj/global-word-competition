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
    titleBefore: '글로벌 국제 영어 ',
    titleHighlight: '단어',
    titleAfter: ' 대회',
    titleEn: 'Global International English Word Competition',
    shortTitle: '단어 대회',
    sheetsEndpoint: '',
    // admin 페이지 접속 토큰 — Apps Script ADMIN_TOKEN 과 동일하게 설정
    adminToken: '',
    fee: 60000,
    bank: {
      name: '신한은행 (법인)',
      account: '',
      holder: '(주)글로벌영어교육아카데미',
    },
    levels: [
      { id: 'a1', label: 'A1' },
      { id: 'a2', label: 'A2' },
      { id: 'b1', label: 'B1' },
      { id: 'b2', label: 'B2' },
      { id: 'c1', label: 'C1' },
      { id: 'c2', label: 'C2' },
    ],
    levelGroups: [
      {
        key: 'A',
        title: 'A 레벨 (A1 · A2)',
        desc: '영어 학습을 시작하는 단계입니다. 기본 단어와 알파벳·발음에 익숙해지는 수준을 평가합니다.',
      },
      {
        key: 'B',
        title: 'B 레벨 (B1 · B2)',
        desc: '일상·학습 영어를 어느 정도 구사하는 단계입니다. 단어 이해와 활용, 발음 정확도를 종합 평가합니다.',
      },
      {
        key: 'C',
        title: 'C 레벨 (C1 · C2)',
        desc: '고급 영어 구사 단계입니다. 풍부한 어휘력과 정확한 발음·활용 능력을 평가합니다.',
      },
    ],
    schedule: {
      registrationStart: '2026-06-21',
      registrationEnd: '2026-08-21',
      competitionDate: '2026-08-22',
    },
    format: '온라인(Zoom)',
    groupApplyMode: 'excel',
  },
};
