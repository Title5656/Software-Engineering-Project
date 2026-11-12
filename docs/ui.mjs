export const esc = (value = '') => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

const paths = {
  brand: 'M3 21V8l9-5 9 5v13M7 21v-9m5 9V8m5 13v-9M2 21h20',
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z M9 21v-7h6v7',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm3-4a4 4 0 0 1 0 8',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6M8 13h8m-8 4h8',
  tool: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.8 7.8l-7 7a2.1 2.1 0 0 1-3-3l7-7a6 6 0 0 1 7.8-7.8z',
  wallet: 'M20 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6m19 6h-5a2 2 0 0 0 0 4h5',
  parcel: 'm3 7 9-5 9 5v10l-9 5-9-5z m0 0 9 5 9-5m-9 5v10m-4-18 9 5',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0',
  chart: 'M3 3v18h18M8 16v-4m5 4V7m5 9v-7',
  calendar: 'M8 2v4m8-4v4M3 9h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  activity: 'M2 12h4l3-8 5 16 3-8h5',
  droplet: 'M12 2c3 5 7 8.3 7 13a7 7 0 0 1-14 0c0-4.7 4-8 7-13z',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  chevron: 'm9 18 6-6-6-6',
  plus: 'M12 5v14M5 12h14',
  check: 'm5 12 4 4L19 6',
  close: 'm6 6 12 12M6 18 18 6',
  menu: 'M4 6h16M4 12h16M4 18h16',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z',
  switch: 'M4 7h15m-4-4 4 4-4 4m5 6H5m4-4-4 4 4 4',
  log: 'M12 5H4v14h8m-2-7h11m-4-4 4 4-4 4',
  info: 'M12 11v6m0-10h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
  key: 'M21 3l-8 8m5-5 3 3m-6 0 3 3M14 15a5 5 0 1 1-10 0 5 5 0 0 1 10 0z',
};
export const icon = name => '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (paths[name] || paths.info) + '"/></svg>';

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
