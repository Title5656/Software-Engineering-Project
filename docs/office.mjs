import { day, roles, unitStatus } from './model.mjs';
import { badge, dateLabel, cash, esc, field, mainCell, section, table, empty } from './ui.mjs';

const statuses = [['open','เปิดใช้งาน'], ['closed','ปิดใช้งาน']];
const today = () => ({ type: 'date', value: day() });
const select = (key, name, choices, value = '', required = true) => field(key, name, { choices, value, required });
const input = (key, name, value = '') => field(key, name, { value });
const date = (key, name, value = day()) => field(key, name, { type: 'date', value });
const money = (key, name, value = '') => field(key, name, { type: 'number', value, min: 0.01 });
const note = (value = '') => field('note', 'หมายเหตุ', { type: 'textarea', required: false, value });
const search = placeholder => '<label class="search"><span class="sr-only">ค้นหารายการ</span><input type="search" data-filter placeholder="' + esc(placeholder) + '"></label>';
const reportTabs = active => '<nav class="tabs" aria-label="ประเภทรายงาน">' + [
  ['units','ห้องชุด'],['residents','ผู้พักอาศัย'],['leases','สัญญาเช่า'],['finance','การเงิน'],['repairs','งานซ่อม'],
].map(([key, name]) => '<a href="#/reports/' + key + '"' + (key === active ? ' aria-current="page"' : '') + '>' + name + '</a>').join('') + '</nav>';

export const byId = (rows, id) => rows.find(r => r.id === id);
export const room = (db, id) => byId(db.units, id)?.number ?? '—';
export const person = (db, id) => byId(db.residents, id)?.name ?? '—';
export const displayName = (db, u) => byId(db.residents, u.resident)?.name || u.name || u.username;
export const roomOptions = db => db.units.map(u => [u.id, u.number + ' · อาคาร ' + u.building]);
export const peopleOptions = db => db.residents.map(r => [r.id, r.name + ' · ' + room(db, r.unit)]);
export const leaseOptions = (db, activeOnly = false) => db.leases.filter(l => !activeOnly || l.status === 'active').map(l => [l.id, l.id + ' · ' + room(db, l.unit) + ' · ' + person(db, l.resident)]);

export function accounts({ db, user, action }) {
  const choices = [['', 'เลือกเมื่อเปลี่ยนเป็นผู้พักอาศัย'], ...peopleOptions(db)];
  return section('บัญชีผู้ใช้งาน', search('ค้นหาชื่อผู้ใช้หรือบทบาท') + table(
    ['บัญชี', 'บทบาท', 'สถานะ', 'จัดการ'],
    db.users.map(u => [mainCell(displayName(db, u), u.username), esc(roles[u.role]), badge(u.status), u.id === user.id ? 'บัญชีปัจจุบัน' : action('account', 'แก้สิทธิ์', [
      select('role', 'บทบาท', Object.entries(roles), u.role), select('status', 'สถานะบัญชี', [['active','ใช้งาน'],['disabled','ระงับ']], u.status),
      select('resident', 'ทะเบียนผู้พัก', choices, u.resident, false),
    ], { id: u.id })]),
  ));
}

export function units({ db, action, confirm }) {
  const fields = (u = {}) => [
    input('building','อาคาร',u.building), field('floor','ชั้น', { type: 'number', value: u.floor, min: 1 }), input('number','เลขห้อง',u.number),
    select('status','การเปิดใช้งาน',statuses,u.status || 'open'),
  ];
  return section('ทะเบียนห้องชุด', search('ค้นหาเลขห้องหรืออาคาร') + table(['เลขห้อง', 'อาคาร', 'ชั้น', 'สถานะ', 'จัดการ'],
    db.units.map(u => [mainCell(u.number,u.id),esc(u.building),esc(u.floor),badge(unitStatus(db, u)),
      action('unit','แก้ไข',fields(u),{id:u.id}) + confirm('removeUnit','ลบ',{id:u.id},'ลบห้อง ' + u.number + ' ออกจากทะเบียน')]),
  ), { action: action('unit','เพิ่มห้อง',fields(),{}, { primary: true }) });
}

export function residents({ db, action, confirm }) {
  const fields = (r = {}) => [
    input('name','ชื่อ–นามสกุล',r.name), field('phone','เบอร์โทร', {type:'tel',value:r.phone}),
    ...(!r.id ? [select('unit','ห้องปัจจุบัน',[['','ยังไม่ระบุห้อง'],...roomOptions(db)],r.unit,false)] : []),
  ];
  const move = action('move','บันทึกย้ายเข้า–ออก',[
    select('resident','ผู้พักอาศัย',peopleOptions(db)), select('lease','สัญญาเช่า',leaseOptions(db)),
    select('direction','ประเภทการย้าย',[['in','ย้ายเข้า'],['out','ย้ายออก']]), date('date','วันที่ย้าย'),
  ],{}, { primary: true });
  return section('ทะเบียนผู้พักอาศัย', search('ค้นหาชื่อ เบอร์โทร หรือเลขห้อง') + table(['ผู้พักอาศัย','เบอร์โทร','ห้องปัจจุบัน','จัดการ'],
    db.residents.map(r => [mainCell(r.name,r.id),esc(r.phone),esc(room(db,r.unit)),
      action('resident','แก้ไข',fields(r),{id:r.id}) + confirm('removeResident','ลบ',{id:r.id},'ลบผู้พัก ' + r.name + ' ออกจากทะเบียน')]),
  ), { action: action('resident','เพิ่มผู้พัก',fields(),{}, { primary: true }) }) +
  section('ประวัติการย้ายเข้า–ออก', search('ค้นหาผู้พัก ห้อง หรือสัญญา') + table(['ผู้พัก','ห้อง','สัญญา','วันที่','รายการ'],
    [...db.moves].reverse().map(m => [esc(person(db,m.resident)),esc(room(db,m.unit)),esc(m.lease),dateLabel(m.date),badge(m.direction)]),
  ), { action: move });
}

export function leases({ db, data, user, action, confirm }) {
  const admin = user.role === 'admin';
  const fields = (l = {}) => [
    select('resident','ผู้พัก',peopleOptions(db),l.resident),select('unit','ห้อง',roomOptions(db),l.unit),
    date('start','วันเริ่มสัญญา',l.start || day()),date('end','วันสิ้นสุด',l.end || day(365)),money('rent','ค่าเช่าต่อเดือน',l.rent),
  ];
  const contracts = table(['สัญญาและห้อง','ระยะเวลา','ค่าเช่า','สถานะ','จัดการ'],
    data.leases.map(l => [
      mainCell(l.id + ' · ' + room(db,l.unit), admin ? person(db,l.resident) : ''),
      dateLabel(l.start) + ' ถึง ' + dateLabel(l.end), cash(l.rent),
      badge(l.status === 'active' && l.end < day() ? 'expired' : l.status),
      l.status !== 'active' ? '—' : admin ? action('lease','แก้ไข',fields(l),{id:l.id}) +
        confirm('endLease','สิ้นสุดสัญญา',{id:l.id},'บันทึกสิ้นสุดสัญญา ' + l.id) :
        action('renew','ขอต่อสัญญา',[date('end','วันสิ้นสุดใหม่',l.end > day(90) ? '' : day(90))],{id:l.id}),
    ]), 'ยังไม่มีสัญญาเช่า');
  const requests = table(['คำขอ','วันสิ้นสุดที่ขอ','สถานะ','หมายเหตุ','จัดการ'],
    [...data.renewals].reverse().map(r => [
      mainCell(r.id + ' · ' + r.lease, admin ? person(db,r.resident) : dateLabel(r.date)),dateLabel(r.end),
      badge(r.status, r.status === 'pending' ? 'รอพิจารณา' : undefined),esc(r.note || '—'),
      admin && r.status === 'pending' ? action('reviewRenewal','พิจารณา',[
        select('decision','ผลพิจารณา',[['approved','อนุมัติ'],['rejected','ปฏิเสธ']]),note(),
      ],{id:r.id}) : '—',
    ]), 'ยังไม่มีคำขอต่อสัญญา');
  return section('รายการสัญญาเช่า', contracts, { action: admin ? action('lease','สร้างสัญญา',fields(),{}, {primary:true}) : '' }) +
    section('คำขอต่อสัญญา', search('ค้นหารหัสคำขอหรือสัญญา') + requests);
}

export function reception({ db, data, user, action, confirm }) {
  const admin = user.role === 'admin';
  const time = (label) => field('time', label, { type: 'datetime-local', value: day() + 'T12:00' });
  const parcelForm = admin ? action('parcel','บันทึกพัสดุรับเข้า',[
    select('resident','ผู้รับ',peopleOptions(db)),input('carrier','บริษัทขนส่ง'),input('tracking','เลขติดตาม'),time('วันเวลารับเข้า'),
  ], {}, { primary:true }) : '';
  const parcels = section('สถานะพัสดุ', search('ค้นหาเลขติดตามหรือสถานะ') + table(
    ['พัสดุ','ผู้รับและห้อง','เวลารับเข้า','สถานะ','ส่งมอบ'],
    [...data.parcels].reverse().map(p => [
      mainCell(p.tracking,p.id + ' · ' + p.carrier),mainCell(person(db,p.resident),room(db,p.unit)),dateLabel(p.time),badge(p.status),
      admin && p.status === 'waiting' ? confirm('deliver','ส่งมอบ',{id:p.id},'บันทึกการส่งมอบพัสดุ ' + p.tracking) : dateLabel(p.delivered),
    ]), 'ยังไม่มีพัสดุ'), { action: parcelForm });
  if (!admin) return parcels;
  return parcels + section('สมุดผู้มาติดต่อ', search('ค้นหาผู้มาติดต่อหรือเลขห้อง') + table(
    ['ผู้มาติดต่อ','ห้องและวัตถุประสงค์','เวลาเข้า','เวลาออก'],
    [...db.visitors].reverse().map(v => [mainCell(v.name,v.id),mainCell(room(db,v.unit),v.purpose),dateLabel(v.entered),
      v.exited ? dateLabel(v.exited) : action('leave','บันทึกออก',[time('เวลาออก')],{id:v.id})]),
  ), { action: action('visit','บันทึกผู้มาติดต่อ',[
    input('name','ชื่อผู้มาติดต่อ'),select('unit','ห้องที่ติดต่อ',roomOptions(db)),input('purpose','วัตถุประสงค์'),time('เวลาเข้า'),
  ],{}, {primary:true}) });
}

export function announcements({ data, user, action }) {
  const admin = user.role === 'admin';
  const fields = (post = {}) => [
    input('title','หัวข้อ',post.title),field('detail','เนื้อหา',{type:'textarea',value:post.detail}),
    date('date','วันที่เผยแพร่',post.date || day()),select('status','สถานะ',[['draft','ฉบับร่าง'],['published','เผยแพร่']],post.status || 'draft'),
  ];
  const cards = [...data.announcements].sort((a,b) => b.date.localeCompare(a.date)).map(a =>
    '<article class="notice"><div>' + (admin ? badge(a.status) : '') + '<p class="meta">' + dateLabel(a.date) + '</p><h3>' + esc(a.title) +
    '</h3><p class="preserve">' + esc(a.detail) + '</p></div>' + (admin ? action('announcement','แก้ไขประกาศ',fields(a),{id:a.id}) : '') + '</article>');
  return section('ประกาศภายในอาคาร', cards.length ? '<div class="notice-list">' + cards.join('') + '</div>' : empty(),
    { action: admin ? action('announcement','สร้างประกาศ',fields(),{}, {primary:true}) : '' });
}

export function reports({ db, id, reportRange }) {
  const { start, end } = reportRange;
  const inRange = date => (!start || date >= start) && (!end || date <= end);
  const types = {
    units: ['รายงานห้องชุด ณ ปัจจุบัน',['ห้อง','อาคาร','ชั้น','สถานะ'], db.units.map(u => [esc(u.number),esc(u.building),esc(u.floor),badge(unitStatus(db,u))])],
    residents: ['รายงานประวัติผู้พัก',['ผู้พัก','ห้อง','วันที่','ประเภท'],db.moves.filter(m => inRange(m.date)).map(m => [esc(person(db,m.resident)),esc(room(db,m.unit)),dateLabel(m.date),badge(m.direction)])],
    leases: ['รายงานสัญญาเช่า',['สัญญา','ผู้พัก','วันสิ้นสุด','สถานะ'],db.leases.filter(l => inRange(l.end)).map(l => [esc(l.id),esc(person(db,l.resident)),dateLabel(l.end),badge(l.status === 'active' && l.end < day() ? 'expired' : l.status)])],
    finance: ['รายงานการเงิน',['ใบแจ้งหนี้','ครบกำหนด','ยอดบิล','ยอดค้าง'],db.invoices.filter(i => inRange(i.due)).map(i => [esc(i.id),dateLabel(i.due),cash(i.amount),cash(outstanding(db,i))])],
    repairs: ['รายงานงานซ่อม',['งานซ่อม','วันที่แจ้ง','สถานที่','สถานะ'],db.repairs.filter(r => inRange(r.date)).map(r => [mainCell(r.title,r.id),dateLabel(r.date),esc(byId(db.facilities,r.location)?.name || room(db,r.location)),badge(r.status)])],
  };
  const key = Object.hasOwn(types,id) ? id : 'units';
  const [title,headers,rows] = types[key];
  return reportTabs(key) + section(title,
    (key === 'units' ? '' : rangeForm(reportRange)) + table(headers,rows,'ไม่มีรายการในช่วงวันที่ที่เลือก'),
  );
}

export function rangeForm(range) {
  return '<form class="range-form" data-range>' +
    field('report-start','ตั้งแต่',{type:'date',value:range.start,required:false}) +
    field('report-end','ถึง',{type:'date',value:range.end,required:false}) +
    '<button class="button" type="submit">ใช้ช่วงวันที่</button><button class="button quiet" type="button" data-clear-range>ล้าง</button></form>';
}

export { balance as outstanding } from './model.mjs';
import { balance as outstanding } from './model.mjs';
