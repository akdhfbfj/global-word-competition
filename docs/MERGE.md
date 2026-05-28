# 말하기 대회 통합 가이드

장기적으로 [geeacademy.com](https://www.geeacademy.com/19) 말하기 대회 사이트를
본 단어 대회 사이트 구조로 통합할 때 참고합니다.

## 공통 재사용 파일

| 파일 | 용도 |
|------|------|
| `assets/css/variables.css` | 브랜드 색상, 폰트 |
| `assets/css/base.css` | Reset, 기본 타이포 |
| `assets/css/layout.css` | Header, Footer, Nav |
| `assets/js/config.js` | SITE + COMPETITIONS 설정 |
| `assets/js/form.js` | 폼 유틸, 헤더/푸터 바인딩 |
| `assets/js/sheets.js` | Google Sheets 연동 |

## 대회별 분리 파일

| 파일 | 용도 |
|------|------|
| `assets/css/word-competition.css` | 단어 대회 UI |
| `assets/js/word-form.js` | 단어 대회 폼 필드 |
| (추후) `speak-competition.css` | 말하기 대회 UI |
| (추후) `speak-form.js` | 말하기 대회 폼 |

## config.js 통합 예시

```javascript
const COMPETITIONS = {
  word: { id: 'word', title: '글로벌 국제 영어 단어 대회', ... },
  speak: { id: 'speak', title: '글로벌 국제 영어 말하기 대회', ... },
};
```

## URL 매핑 (통합 후)

| 현재 geeacademy | 통합 후 |
|-----------------|---------|
| /19 (말하기) | /speak/ |
| (신규) | /word/ 또는 루트 |
| 영어캠프 | /camp/ |
| 공지 | /notice/ |

## Google Sheets 탭 naming

- `word_individual` — 단어 대회 개인
- `word_group` — 단어 대회 단체
- `word_participants` — 단체 참가자 상세
- `speak_individual` — 말하기 (추후)
- `speak_group` — 말하기 (추후)

## 헤더 탭 추가

통합 시 `.nav-main` 앞에 대회 선택 탭 추가:

```html
<div class="competition-tabs">
  <a href="/speak/">말하기 대회</a>
  <a href="/word/" class="is-active">단어 대회</a>
</div>
```
