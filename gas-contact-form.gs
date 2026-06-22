const SHEET_NAME = 'お問い合わせ';

function doPost(e) {
  try {
    const data = parseRequestBody_(e);
    validateContact_(data);

    const sheet = getContactSheet_();
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      ensureHeader_(sheet);
      sheet.appendRow([
        new Date(),
        data.name,
        data.email,
        data.phone || '',
        data.inquiryType,
        data.message,
        data.pageUrl || '',
        data.userAgent || '',
        data.submittedAt || ''
      ]);
    } finally {
      lock.releaseLock();
    }

    return createJsonResponse_({
      ok: true,
      message: 'saved'
    });
  } catch (error) {
    return createJsonResponse_({
      ok: false,
      message: error.message
    });
  }
}

function doGet() {
  return createJsonResponse_({
    ok: true,
    message: 'contact form endpoint is running'
  });
}

function parseRequestBody_(e) {
  if (e && e.postData && e.postData.contents) {
    return JSON.parse(e.postData.contents);
  }

  if (e && e.parameter) {
    return e.parameter;
  }

  throw new Error('送信データが空です。');
}

function validateContact_(data) {
  const requiredFields = ['name', 'email', 'inquiryType', 'message'];
  requiredFields.forEach(function(field) {
    if (!data[field] || String(data[field]).trim() === '') {
      throw new Error(field + ' is required.');
    }
  });

  const email = String(data.email).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('email is invalid.');
  }
}

function getContactSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error('スプレッドシートに紐づいた Apps Script で実行してください。');
  }

  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.appendRow([
    '受信日時',
    'お名前',
    'メールアドレス',
    '電話番号',
    'お問い合わせ種別',
    'お問い合わせ内容',
    '送信ページURL',
    'ユーザーエージェント',
    'ブラウザ送信日時'
  ]);
}

function createJsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
