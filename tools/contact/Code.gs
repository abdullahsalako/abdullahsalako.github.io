// Deploy as a web app running as the owner. Responses go into a dedicated tab.
const SPREADSHEET_ID = '1WavvtvUOqiimRO7feHHXvo5yqeP5kyn5qsecvw14-eY';
function doPost(e) {
  const reply = ok => ContentService.createTextOutput(JSON.stringify({ok})).setMimeType(ContentService.MimeType.JSON);
  try {
    const p = e.parameter || {};
    const fields = ['name','email','company','service','platform','deadline','budget','link','brief'];
    if (p.website || !p.name || !p.email || !p.service || !p.brief || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) return reply(false);
    if (fields.some(k => String(p[k] || '').length > 4000)) return reply(false);
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      let sheet = ss.getSheetByName('Website enquiries');
      if (!sheet) { sheet = ss.insertSheet('Website enquiries'); sheet.appendRow(['Timestamp','Name','Email','Company or channel','Service','Platform and length','Deadline','Budget','Reference link','Project brief']); sheet.setFrozenRows(1); }
      const safe = x => { const v = String(x || '').trim(); return /^[=+\-@\t\r]/.test(v) ? "'" + v : v; };
      sheet.appendRow([new Date(), ...fields.map(k => safe(p[k]))]);
    } finally { lock.releaseLock(); }
    return reply(true);
  } catch (error) { return reply(false); }
}
