/**
 * Google Apps Script — Web App 배포용
 *
 * 설정: 프로젝트 설정 > 스크립트 속성
 *   ADMIN_TOKEN = admin 페이지 접속 비밀번호
 */

function getAdminToken_() {
  return PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN') || '';
}

function sheetToRows_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  return data.slice(1).map(function (row) {
    var obj = {};
    headers.forEach(function (h, i) {
      obj[h] = row[i];
    });
    return obj;
  });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.type === 'individual') {
      var sheet = ss.getSheetByName('word_individual') || ss.insertSheet('word_individual');
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['접수번호', '제출일시', '이름', '생년월일', '학교', '학년', '학부모연락처', '이메일', '레벨', '주소']);
      }
      sheet.appendRow([
        data.receiptNo, data.submittedAt, data.name, data.birthDate,
        data.school, data.grade, data.phoneParent,
        data.email, data.level, data.address
      ]);
    }

    if (data.type === 'group') {
      var gSheet = ss.getSheetByName('word_group') || ss.insertSheet('word_group');
      if (gSheet.getLastRow() === 0) {
        gSheet.appendRow(['접수번호', '제출일시', '단체명', '학원연락처', '학부모연락처', '주소', '인원', '총참가비']);
      }
      gSheet.appendRow([
        data.receiptNo, data.submittedAt, data.orgName, data.phoneAcademy,
        data.phoneParent, data.address, data.participantCount, data.totalFee
      ]);

      var pSheet = ss.getSheetByName('word_participants') || ss.insertSheet('word_participants');
      if (pSheet.getLastRow() === 0) {
        pSheet.appendRow(['접수번호', '이름', '학교', '학년', '레벨']);
      }
      (data.participants || []).forEach(function (p) {
        pSheet.appendRow([data.receiptNo, p.name, p.school, p.grade, p.level]);
      });
    }

    return jsonResponse_({ success: true, receiptNo: data.receiptNo });
  } catch (err) {
    return jsonResponse_({ success: false, error: err.message });
  }
}

function doGet(e) {
  var action = e.parameter.action;
  var token = e.parameter.token || '';

  if (action === 'admin') {
    if (!getAdminToken_() || token !== getAdminToken_()) {
      return jsonResponse_({ error: '인증 실패' });
    }
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    return jsonResponse_({
      individual: sheetToRows_(ss.getSheetByName('word_individual')),
      group: sheetToRows_(ss.getSheetByName('word_group')),
      participants: sheetToRows_(ss.getSheetByName('word_participants')),
    });
  }

  if (action === 'check') {
    return jsonResponse_({ found: false, message: '조회 기능 준비 중' });
  }

  return ContentService.createTextOutput('OK');
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
