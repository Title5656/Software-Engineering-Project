export const esc = (value = '') => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

/*
ISC License

Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/
const iconShapes = {
  grid: '<rect width="7" height="9" x="3" y="3" rx="1"/>' +
    '<rect width="7" height="5" x="14" y="3" rx="1"/>' +
    '<rect width="7" height="9" x="14" y="12" rx="1"/>' +
    '<rect width="7" height="5" x="3" y="16" rx="1"/>', // layout-dashboard
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>' +
    '<path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>', // house
  users: '<path d="M18 21a8 8 0 0 0-16 0"/>' +
    '<circle cx="10" cy="8" r="5"/>' +
    '<path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/>', // users-round
  file: '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/>' +
    '<path d="M14 2v5a1 1 0 0 0 1 1h5"/>' +
    '<path d="M10 9H8"/>' +
    '<path d="M16 13H8"/>' +
    '<path d="M16 17H8"/>', // file-text
  tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"/>', // wrench
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>' +
    '<path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>', // wallet
  parcel: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/>' +
    '<path d="M12 22V12"/>' +
    '<polyline points="3.29 7 12 12 20.71 7"/>' +
    '<path d="m7.5 4.27 9 5.15"/>', // package
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/>' +
    '<path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>', // bell
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/>' +
    '<path d="M18 17V9"/>' +
    '<path d="M13 17V5"/>' +
    '<path d="M8 17v-3"/>', // chart-column
  calendar: '<path d="M8 2v3"/>' +
    '<path d="M16 2v3"/>' +
    '<rect x="3" y="3" width="18" height="18" rx="2"/>' +
    '<path d="M3 9h18"/>' +
    '<path d="M8 13h.01"/>' +
    '<path d="M12 13h.01"/>' +
    '<path d="M16 13h.01"/>' +
    '<path d="M8 17h.01"/>' +
    '<path d="M12 17h.01"/>' +
    '<path d="M16 17h.01"/>', // calendar-days
  activity: '<path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"/>' +
    '<path d="m2.5 21.5 1.4-1.4"/>' +
    '<path d="m20.1 3.9 1.4-1.4"/>' +
    '<path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"/>' +
    '<path d="m9.6 14.4 4.8-4.8"/>', // dumbbell
  droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>', // droplet
  settings: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/>' +
    '<circle cx="12" cy="12" r="3"/>', // settings
  key: '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/>' +
    '<circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>', // key-round
  brand: '<path d="M3 21V8l9-5 9 5v13M7 21v-9m5 9V8m5 13v-9M2 21h20"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  switch: '<path d="M4 7h15m-4-4 4 4-4 4m5 6H5m4-4-4 4 4 4"/>',
  log: '<path d="M12 5H4v14h8m-2-7h11m-4-4 4 4-4 4"/>',
  info: '<path d="M12 11v6m0-10h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>',
};

export const icon = name => {
  const shape = Object.hasOwn(iconShapes, name) ? iconShapes[name] : iconShapes.info;
  return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + shape + '</svg>';
};

export const labels = {
  active: 'ใช้งาน', disabled: 'ระงับ', ended: 'สิ้นสุด', open: 'เปิดใช้งาน', closed: 'ปิดใช้งาน',
  vacant: 'ว่าง', occupied: 'มีผู้พัก', pending: 'รอตรวจ', approved: 'อนุมัติ', rejected: 'ปฏิเสธ',
  new: 'รับแจ้ง', assigned: 'มอบหมายแล้ว', working: 'กำลังดำเนินการ', done: 'เสร็จแล้ว',
  waiting: 'รอรับ', delivered: 'ส่งมอบแล้ว', draft: 'ฉบับร่าง', published: 'เผยแพร่แล้ว',
  in: 'ย้ายเข้า', out: 'ย้ายออก', unpaid: 'ค้างชำระ', paid: 'ชำระครบ', partial: 'ชำระบางส่วน', expired: 'หมดอายุ',
};
export const badge = (status, text = labels[status] ?? status) => '<span class="badge status-' + esc(status) + '">' + esc(text) + '</span>';

export const cash = amount => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(amount);
export function dateLabel(value) {
  if (!value) return '—';
  const date = new Date(value.slice(0, 10) + 'T00:00:00+07:00');
  if (Number.isNaN(+date)) return '—';
  const formatted = new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeZone: 'Asia/Bangkok' }).format(date);
  return formatted + (value.includes('T') ? ' · ' + value.slice(11,16) : '');
}

export const empty = (message = 'ยังไม่มีรายการ') => '<div class="empty">' + icon('file') + '<p>' + esc(message) + '</p></div>';
export const section = (title, content, options = {}) =>
  '<section class="panel"><div class="panel-head"><div><h2>' + esc(title) + '</h2>' +
  (options.description ? '<p>' + esc(options.description) + '</p>' : '') +
  '</div>' + (options.action || '') + '</div>' + content + '</section>';
export const table = (headers, rows, message) => rows.length ?
  '<div class="table-scroll" tabindex="0" role="region" aria-label="ตารางข้อมูล"><table><thead><tr>' +
  headers.map(h => '<th scope="col">' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' +
  rows.map(row => '<tr>' + row.map(cell => '<td>' + cell + '</td>').join('') + '</tr>').join('') +
  '</tbody></table></div>' : empty(message);
export const link = (route, text, symbol = 'arrow') =>
  '<a class="text-link" href="#/' + esc(route) + '">' + esc(text) + icon(symbol) + '</a>';
export const meta = text => '<span class="meta">' + esc(text) + '</span>';
export const mainCell = (title, subtitle) => '<strong>' + esc(title) + '</strong>' + (subtitle ? meta(subtitle) : '');

export function field(key, label, options = {}) {
  const { value = '', type = 'text', choices, required = true, hint, min, max, readonly = false } = options;
  let input;
  const attrs = ' name="' + esc(key) + '" id="field-' + esc(key) + '"' + (required ? ' required' : '') + (readonly ? ' readonly' : '');
  if (choices) {
    input = '<select' + attrs + '>' + (required && !value ? '<option value="">เลือก' + esc(label) + '</option>' : '') +
      choices.map(([id, name]) => '<option value="' + esc(id) + '"' + (id === value ? ' selected' : '') + '>' + esc(name) + '</option>').join('') + '</select>';
  } else if (type === 'textarea') {
    input = '<textarea rows="3"' + attrs + '>' + esc(value) + '</textarea>';
  } else {
    input = '<input type="' + esc(type) + '"' + attrs + (type !== 'file' ? ' value="' + esc(value) + '"' : ' accept="image/*,.pdf"') +
      (min !== undefined ? ' min="' + esc(min) + '"' : '') + (max !== undefined ? ' max="' + esc(max) + '"' : '') +
      (type === 'number' ? ' step="0.01"' : '') + '>';
  }
  return '<div class="field"><label for="field-' + esc(key) + '">' + esc(label) + (required ? '' : ' <small>ไม่บังคับ</small>') +
    '</label>' + input + (hint ? '<small>' + esc(hint) + '</small>' : '') + '</div>';
}
