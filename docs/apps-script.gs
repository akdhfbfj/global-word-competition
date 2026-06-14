/**
 * Google Apps Script — Web App 배포용
 *
 * 사용법:
 * 1. Google Sheets 새로 만들기
 * 2. 시트 탭: word_individual, word_group, word_participants
 * 3. 확장 프로그램 > Apps Script > 이 코드 붙여넣기
 * 4. 배포 > 새 배포 > 웹 앱 > "모든 사용자" 접근
 * 5. URL을 assets/js/config.js 의 sheetsEndpoint 에 입력
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.type === 'individual') {
      const sheet = ss.getSheetByName('word_individual') || ss.insertSheet('word_individual');
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['접수번호', '제출일시', '이름', '생년월일', '학교', '학년', '학생연락처', '학부모연락처', '이메일', '레벨', '주소']);
      }
      sheet.appendRow([
        data.receiptNo, data.submittedAt, data.name, data.birthDate,
        data.school, data.grade, data.phoneStudent, data.phoneParent,
        data.email, data.level, data.address
      ]);
    }

    if (data.type === 'group') {
      const sheet = ss.getSheetByName('word_group') || ss.insertSheet('word_group');
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['접수번호', '제출일시', '단체명', '학원연락처', '학부모연락처', '주소', '인원', '총참가비']);
      }
      sheet.appendRow([
        data.receiptNo, data.submittedAt, data.orgName, data.phoneAcademy,
        data.phoneParent, data.address, data.participantCount, data.totalFee
      ]);

      const pSheet = ss.getSheetByName('word_participants') || ss.insertSheet('word_participants');
      if (pSheet.getLastRow() === 0) {
        pSheet.appendRow(['접수번호', '이름', '학교', '학년', '레벨']);
      }
      (data.participants || []).forEach(function (p) {
        pSheet.appendRow([data.receiptNo, p.name, p.school, p.grade, p.level]);
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, receiptNo: data.receiptNo }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  if (e.parameter.action === 'check') {
    // 접수 확인 — 추후 구현
    return ContentService
      .createTextOutput(JSON.stringify({ found: false, message: '조회 기능 준비 중' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput('OK');
}
