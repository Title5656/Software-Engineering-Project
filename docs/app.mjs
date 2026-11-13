import { seed, upgradeDemo, registrationExample, change, read, day, roles, authenticate, demoPassword, availability, balance, unitStatus } from './model.mjs';
import { esc, icon, badge, cash, dateLabel, field, section, link, empty } from './ui.mjs';
import { accounts, units, residents, leases, reception, announcements, reports, displayName, byId, roomOptions, rangeForm } from './office.mjs';
import { repairs, booking, finance } from './operations.mjs';

const app = document.querySelector('#app');
const dialog = document.querySelector('#dialog');
const toast = document.querySelector('#toast');
const dataKey = 'baanruam-demo-v1';
const sessionKey = 'baanruam-account';

const routes = {
  home: ['ภาพรวม','grid'], units: ['ห้องชุด','home'], residents: ['ผู้พักอาศัย','users'], leases: ['สัญญาเช่า','file'],
  repairs: ['งานซ่อม','tool'], booking: ['จองส่วนกลาง','calendar'], finance: ['การเงิน','wallet'],
  reception: ['ผู้มาติดต่อและพัสดุ','parcel'], announcements: ['ประกาศ','bell'], reports: ['รายงาน','chart'],
  accounts: ['บัญชีและสิทธิ์','key'], profile: ['โปรไฟล์ของฉัน','settings'],
};
const menus = {
  admin: [['ภาพรวม',['home']],['จัดการอาคาร',['units','residents','leases','repairs','finance','reception','announcements']],['การบริหาร',['reports','accounts']]],
  resident: [['ภาพรวม',['home']],['บริการสำหรับผู้พัก',['leases','repairs','booking','finance','reception','announcements']]],
  tech: [['การปฏิบัติงาน',['home','repairs']]],
};
const renderers = { accounts, units, residents, leases, reception, announcements, reports, repairs, booking, finance };
const descriptions = {
  units:'ข้อมูลอาคาร ห้อง และสถานะการใช้งาน', residents:'จัดการทะเบียนผู้พักและติดตามการย้ายเข้า–ออก',
  leases:'ตรวจสอบสัญญาเช่าและติดตามคำขอต่ออายุ', repairs:'ติดตามสถานะ นัดหมาย และผลการซ่อม',
  booking:'ตรวจช่วงว่างและจองพื้นที่ส่วนกลาง', finance:'ติดตามใบแจ้งหนี้ หลักฐานการชำระเงิน และใบเสร็จ',
  reception:'ติดตามการรับ–ส่งพัสดุและการเข้า–ออกอาคาร', announcements:'ข่าวสารสำหรับผู้พักอาศัย',
  reports:'ตรวจสอบข้อมูลตามประเภทและช่วงวันที่', accounts:'จัดการบทบาทและสถานะการเข้าใช้เดโม',
  profile:'ข้อมูลติดต่อที่ใช้ในระบบ',
};

let db = load();
let account = getSession();
let reportRange = { start:'', end:'' };
let drawerOpen = false;
let callbacks = [];
let toastTimeout;

function load() {
  try {
    return upgradeDemo(JSON.parse(localStorage.getItem(dataKey)));
  } catch { /* Start with sample data if storage is unavailable. */ }
  return seed();
}
function getSession() {
  try { return sessionStorage.getItem(sessionKey) || ''; } catch { return ''; }
}
function setSession(id) {
  account = id;
  try { sessionStorage.setItem(sessionKey,id); } catch { /* Keep the session in this tab. */ }
}
function persist() {
  try { localStorage.setItem(dataKey,JSON.stringify(db)); return true; } catch { return false; }
}
function tell(message) {
  clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimeout = setTimeout(() => toast.classList.remove('visible'),4200);
}
function go(page) {
  const next = '#/' + page;
  if (location.hash === next) render();
  else location.hash = next;
}
function activeUser() {
  return db.users.find(u => u.id === account && u.status === 'active');
}

function brand() {
  return '<a class="brand" href="#/home"><span class="brand-mark">' + icon('brand') + '</span><span><strong>Salaya Two Resident</strong><small>จัดการคอนโดมิเนียม</small></span></a>';
}
function button(label, callback, { primary = false, symbol = '', style = '' } = {}) {
  const index = callbacks.push(callback) - 1;
  return '<button type="button" class="button ' + (primary ? 'primary ' : '') + style + '" data-callback="' + index + '">' +
    (symbol ? icon(symbol) : '') + esc(label) + '</button>';
}
function showDialog(title, content) {
  dialog.innerHTML = '<div class="dialog-head"><h2 id="dialog-title">' + esc(title) +
    '</h2><button type="button" class="icon-button" data-close aria-label="ปิด">' + icon('close') + '</button></div>' + content;
  if (!dialog.open) dialog.showModal();
}
function values(form) {
  return Object.fromEntries(new FormData(form));
}
function submitForm(title, fields, submit, settings = {}) {
  const { submitLabel = 'บันทึก', summary = '', check, extraAction = '' } = settings;
  showDialog(title,'<form class="dialog-form">' + (summary ? '<p>' + esc(summary) + '</p>' : '') + fields.join('') +
    '<p class="form-message" role="status"></p>' + extraAction + '<div class="dialog-foot"><button class="button quiet" type="button" data-close>ยกเลิก</button>' +
    (check ? '<button class="button" type="button" data-check>ตรวจช่วงว่าง</button>' : '') +
    '<button class="button primary" type="submit">' + esc(submitLabel) + '</button></div></form>');
  const form = dialog.querySelector('form');
  const message = form.querySelector('.form-message');
  function display(messageText,error) {
    message.textContent = messageText;
    message.classList.toggle('error',error);
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    try { submit(values(form)); }
    catch (error) { display(error.message,true); }
  });
  if (check) {
    form.addEventListener('input',() => display('',false));
    form.querySelector('[data-check]').addEventListener('click',() => {
      if (!form.reportValidity()) return;
      try { check(values(form)); display('ช่วงเวลานี้ว่าง กดยืนยันการจองเพื่อบันทึกได้',false); }
      catch (error) { display(error.message,true); }
    });
  }
}

function action(op, label, fields, preset = {}, opts = {}) {
  return button(label, () => submitForm(label,fields,form => {
    const result = change(db,account,op,{ ...preset, ...form });
    const saved = persist();
    dialog.close();
    if (op === 'repair') go('repairs/' + result.id);
    else if (op === 'invoice') go('finance/' + result.id);
    else render();
    tell(saved ? 'บันทึกแล้ว' : 'บันทึกสำหรับแท็บนี้แล้ว เบราว์เซอร์จัดเก็บข้ามการรีเฟรชไม่ได้');
  }, { summary:opts.summary, submitLabel:opts.check ? 'ยืนยันการจอง' : opts.submitLabel,
    check:opts.check ? f => availability(db,preset.facility,f.from,f.to) : null,
  }), { primary:opts.primary, symbol:opts.primary ? 'plus' : '', style:opts.primary ? '' : 'compact' });
}
const confirm = (op,label,preset,summary) => action(op,label,[],preset,{ summary,submitLabel:'ยืนยัน' });
const detail = (label,title,html) => button(label,() => showDialog(title,'<div class="dialog-form">' + html + '</div>'),{style:'compact'});

function signIn(username, password) {
  const user = authenticate(db,username,password);
  const switching = Boolean(activeUser());
  setSession(user.id);
  drawerOpen = false;
  if (dialog.open) dialog.close();
  const target = location.hash.slice(2).split('/')[0];
  if (!switching && target && accessible(user.role,target)) render();
  else go('home');
}
function authDialog(register = false, username = '', message = '') {
  const entry = [
    field('username','ชื่อผู้ใช้',{ value:username, hint:register ? 'ใช้ตัวอักษรอังกฤษหรือตัวเลขอย่างน้อย 3 ตัว' : '' }),
    field('password','รหัสผ่าน',{ type:'password' }),
  ];
  if (register) {
    entry.push(field('name','ชื่อ–นามสกุล'),field('phone','เบอร์โทร',{type:'tel'}),
      field('unit','ห้อง',{choices:roomOptions(db)}));
  }
  submitForm(register ? 'ลงทะเบียนผู้พักอาศัย' : 'เข้าสู่ระบบ',entry,form => {
    if (register) {
      change(db,'','register',form);
      const saved = persist();
      authDialog(false,form.username.trim(),'ลงทะเบียนสำเร็จ กรอกรหัสผ่านเพื่อเข้าสู่ระบบ' + (saved ? '' : ' บัญชีนี้ใช้ได้ในแท็บนี้'));
      return;
    }
    signIn(form.username,form.password);
  }, { submitLabel:register ? 'สร้างบัญชีเดโม' : 'เข้าสู่ระบบ',
    extraAction:activeUser() ? '' : register
      ? button('กลับไปเข้าสู่ระบบ',() => authDialog(),{style:'quiet'})
      : button('ลงทะเบียนผู้พักอาศัย',() => authDialog(true),{style:'quiet'}),
    summary:register ? ['ทะเบียนตัวอย่างสำหรับลงทะเบียน', registrationExample.name, registrationExample.phone, registrationExample.room].join(' · ') :
      (message ? message + ' ' : '') + 'บัญชีเดโม office, resident, resident2, tech และ tech2 ใช้รหัสผ่าน ' + demoPassword });
  dialog.querySelector(username ? '[name="password"]' : '[name="username"]').focus();
}
function resetDialog() {
  submitForm('คืนค่าข้อมูลเดโม',[],() => {
    db = seed();
    const saved = persist();
    setSession('');
    dialog.close();
    go('home');
    tell(saved ? 'คืนค่าข้อมูลเดโมแล้ว' : 'คืนค่าข้อมูลเดโมในแท็บนี้แล้ว');
  },{summary:'ข้อมูลที่เพิ่มหรือแก้ไขในเบราว์เซอร์นี้จะถูกแทนด้วยชุดตัวอย่างเริ่มต้น',submitLabel:'คืนค่าข้อมูล'});
}

function landing() {
  return '<div class="landing"><header class="landing-top">' + brand() + '</header>' +
    '<main class="landing-main" id="main"><div class="landing-copy">' +
    '<h1>Unit and Tenant <span>Management System</span></h1><p class="landing-intro">ดูสัญญา แจ้งซ่อม และติดตามงานอาคาร</p>' +
    button('เข้าสู่ระบบ',() => authDialog(),{primary:true,symbol:'log'}) + '</div>' +
    '<figure class="landing-photo"><img src="./assets/condo-650.webp" ' +
    'srcset="./assets/condo-650.webp 650w, ./assets/condo-1280.webp 1280w" ' +
    'sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1440px) 44vw, 620px" ' +
    'width="650" height="975" fetchpriority="high" alt="อาคารพักอาศัยคอนกรีตสีเทา มองจากมุมเงย">' +
    '<figcaption><span>ภาพประกอบ</span><a href="https://unsplash.com/photos/gray-concrete-building-during-daytime-nrqVT4Fx5Xo">' +
    'Jorge Percival / Unsplash</a></figcaption></figure></main></div>';
}

function accessible(role, route) {
  return route === 'profile' || menus[role]?.some(([,items]) => items.includes(route));
}
function heading(title, subtitle) {
  return '<div class="page-heading"><div><h1>' + esc(title) + '</h1><p>' + esc(subtitle) + '</p></div><span class="today">' +
    icon('calendar') + dateLabel(day()) + '</span></div>';
}
function tile(symbol,label,value,sub,route) {
  return '<a href="#/' + route + '" class="metric panel"><div class="metric-top"><span class="feature-icon">' + icon(symbol) +
    '</span>' + icon('arrow') + '</div><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong><small>' + esc(sub) + '</small></a>';
}
function quick(route,text,symbol) {
  return '<a href="#/' + route + '" class="quick"><span class="feature-icon">' + icon(symbol) + '</span><strong>' +
    esc(text) + '</strong>' + icon('chevron') + '</a>';
}
function overview(user,data) {
  const admin = user.role === 'admin';
  const tech = user.role === 'tech';
  const name = displayName(db,user).split(' ')[0];
  const from = reportRange.start, to = reportRange.end;
  const ranged = date => !admin || ((!from || date >= from) && (!to || date <= to));
  const jobs = data.repairs.filter(r => ranged(r.date));
  const openJobs = jobs.filter(r => r.status !== 'done');
  const working = jobs.filter(r => r.status === 'working').length;
  const done = jobs.length - openJobs.length;
  const emptyRooms = db.units.filter(u => unitStatus(db,u) === 'vacant').length;
  const occupiedRooms = db.units.filter(u => unitStatus(db,u) === 'occupied').length;
  const endSoon = admin ? db.leases.filter(l => l.status === 'active' && l.end >= day() && l.end <= day(30) && ranged(l.end)) : [];
  const waiting = data.parcels?.filter(p => p.status === 'waiting') || [];
  const due = data.invoices?.filter(i => ranged(i.due)).reduce((sum,i) => sum + balance(db,i),0) || 0;
  let tiles;
  let shortcuts;
  if (admin) {
    tiles = [tile('home','ห้องว่าง',emptyRooms,'มีผู้พัก ' + occupiedRooms + ' ห้อง','units'),
      tile('file','สัญญาใกล้หมดอายุ',endSoon.length,'ภายใน 30 วัน','leases'),
      tile('wallet','ยอดค้างชำระ',cash(due),'รวมทุกใบแจ้งหนี้ในช่วงวันที่','finance'),
      tile('tool','งานซ่อมที่ยังเปิด',openJobs.length,'กำลังดำเนินการ ' + working + ' งาน','repairs')];
    shortcuts = [quick('residents','ทะเบียนผู้พัก','users'),quick('finance','ออกใบแจ้งหนี้','wallet'),quick('reception','บันทึกรับพัสดุ','parcel')];
  } else if (tech) {
    tiles = [tile('tool','งานที่ยังเปิด',openJobs.length,'รายการที่ได้รับมอบหมาย','repairs'),
      tile('activity','กำลังดำเนินการ',working,'งานที่เริ่มซ่อมแล้ว','repairs'),
      tile('check','เสร็จแล้ว',done,'งานที่บันทึกผลแล้ว','repairs')];
    shortcuts = [quick('repairs','ดูงานที่ได้รับมอบหมาย','tool'),quick('profile','แก้ไขข้อมูลส่วนตัว','settings')];
  } else {
    const current = data.leases.find(l => l.status === 'active');
    tiles = [tile('wallet','ยอดค้างชำระ',cash(due),'ตรวจสอบใบแจ้งหนี้','finance'),
      tile('tool','งานซ่อมที่ยังเปิด',openJobs.length,'ติดตามสถานะล่าสุด','repairs'),
      tile('parcel','พัสดุรอรับ',waiting.length,'รายการของห้องคุณ','reception'),
      tile('file','วันสิ้นสุดสัญญา',current ? dateLabel(current.end) : '—','ดูรายละเอียดสัญญา','leases')];
    shortcuts = [quick('repairs','แจ้งซ่อม','tool'),quick('booking','จองส่วนกลาง','calendar'),quick('finance','ดูใบแจ้งหนี้','wallet')];
  }
  const statusLegend = [['new','รับแจ้ง'],['assigned','มอบหมาย'],['working','กำลังซ่อม'],['done','เสร็จแล้ว']];
  const counts = statusLegend.map(([key]) => jobs.filter(r => r.status === key).length);
  const ring = '<div class="repair-breakdown"><div class="ring" style="--r1:' + (counts[0] / (jobs.length || 1) * 100) + '%;--r2:' +
    ((counts[0] + counts[1]) / (jobs.length || 1) * 100) + '%;--r3:' + ((jobs.length - counts[3]) / (jobs.length || 1) * 100) +
    '%"><div><strong>' + jobs.length + '</strong><small>งานทั้งหมด</small></div></div><ul>' +
    statusLegend.map(([key,label],index) => '<li><i class="dot dot-' + key + '"></i><span>' + label + '</span><strong>' + counts[index] + '</strong></li>').join('') + '</ul></div>';
  const activity = jobs.toReversed().slice(0,4).map(r => '<a class="activity-row" href="#/repairs/' + esc(r.id) + '">' +
    '<span class="feature-icon">' + icon('tool') + '</span><span><strong>' + esc(r.title) + '</strong><small>' + esc(r.id) +
    ' · ' + dateLabel(r.date) + '</small></span>' + badge(r.status) + '</a>').join('');
  const notices = !admin && !tech && waiting.length ? '<a class="banner" href="#/reception">' + icon('bell') +
    '<span><strong>มีพัสดุรอรับ ' + waiting.length + ' รายการ</strong><small>ดูเลขติดตามและเวลารับเข้า</small></span>' + icon('arrow') + '</a>' : '';
  return heading('สวัสดี คุณ' + name,admin ? 'ภาพรวมการดำเนินงานของอาคาร' : tech ? 'ภาพรวมงานซ่อมของคุณ' : 'บริการและรายการล่าสุดของคุณ') +
    notices + (admin ? '<div class="dashboard-range">' + rangeForm(reportRange) + '</div>' : '') +
    '<div class="metrics ' + (tech ? 'three' : '') + '">' + tiles.join('') + '</div>' +
    '<div class="overview-grid">' + section('งานซ่อมล่าสุด',activity ? '<div class="activities">' + activity + '</div>' : empty(),
      {action:link('repairs','ดูทั้งหมด')}) + section('งานซ่อมตามสถานะ',ring) + '</div>' +
    section('เมนูที่ใช้บ่อย','<div class="quick-grid">' + shortcuts.join('') + '</div>');
}

function shell(user,route,content) {
  const groups = menus[user.role].map(([label,items]) => '<div class="nav-group"><div class="nav-label">' + label + '</div>' + items.map(key =>
    '<a href="#/' + key + '"' + (key === route ? ' aria-current="page"' : '') + '>' + icon(routes[key][1]) +
      '<span>' + (key === 'reception' && user.role === 'resident' ? 'พัสดุของฉัน' : routes[key][0]) + '</span></a>').join('') + '</div>').join('');
  return '<div class="shell ' + (drawerOpen ? 'drawer-open' : '') + '"><a class="skip-link" href="#main">ข้ามไปยังเนื้อหา</a>' +
    '<button class="scrim" type="button" data-toggle aria-label="ปิดเมนู"></button><aside class="sidebar">' + brand() +
    '<nav aria-label="เมนูหลัก">' + groups + '</nav><div class="sidebar-foot">' +
    '<a href="#/profile"' + (route === 'profile' ? ' aria-current="page"' : '') + '>' + icon('settings') + '<span>โปรไฟล์ของฉัน</span></a>' +
    button('คืนค่าข้อมูลเดโม',resetDialog,{style:'quiet'}) + '</div></aside><div class="work"><header class="topbar">' +
    '<div class="top-left"><button class="icon-button mobile-menu" type="button" data-toggle aria-label="เมนู" aria-expanded="' + drawerOpen + '">' +
    icon('menu') + '</button><span>พื้นที่ทำงาน</span>' + icon('chevron') + '<strong>' + esc(routes[route][0]) + '</strong></div><div class="top-right">' +
    button('สลับบทบาท',() => showDialog('สลับบัญชี','<div class="dialog-form">' +
      button('เข้าสู่ระบบด้วยบัญชีอื่น',() => authDialog(),{symbol:'log'}) +
      button('ออกจากระบบ',() => { setSession(''); dialog.close(); go('home'); },{style:'quiet'}) + '</div>'),{symbol:'switch'}) +
    '<a class="identity" href="#/profile"><span class="avatar">' + esc(displayName(db,user).slice(0,1)) + '</span><span><strong>' +
    esc(displayName(db,user)) + '</strong><small>' + roles[user.role] + '</small></span></a></div></header>' +
    '<main id="main" tabindex="-1" class="content">' + content + '</main></div></div>';
}

function render() {
  callbacks = [];
  const user = activeUser();
  if (!user) {
    app.innerHTML = landing();
    return;
  }
  const [requested,id] = location.hash.startsWith('#/') ? location.hash.slice(2).split('/') : ['home'];
  const route = accessible(user.role,requested) ? requested : 'home';
  const data = read(db,user.id);
  let content;
  if (route === 'home') {
    content = overview(user,data);
  } else {
    const title = route === 'reception' && user.role === 'resident' ? 'พัสดุของฉัน' : routes[route][0];
    const context = { db, data, user, id, action, confirm, detail, reportRange };
    const body = route === 'profile' ? section('ข้อมูลบัญชี','<div class="panel-padding detail"><dl><dt>ชื่อผู้ใช้</dt><dd>' +
      esc(user.username) + '</dd><dt>ชื่อ–นามสกุล</dt><dd>' + esc(displayName(db,user)) +
      '</dd><dt>เบอร์โทร</dt><dd>' + esc(data.resident?.phone ?? byId(db.residents,user.resident)?.phone ?? user.phone) +
      '</dd><dt>บทบาท</dt><dd>' + roles[user.role] + '</dd></dl></div>',{action:action('profile','แก้ไขโปรไฟล์',[
        field('name','ชื่อ–นามสกุล',{value:displayName(db,user)}),
        field('phone','เบอร์โทร',{type:'tel',value:byId(db.residents,user.resident)?.phone ?? user.phone}),
      ],{}, {primary:true})}) : renderers[route](context);
    content = heading(title,descriptions[route]) + body;
  }
  app.innerHTML = shell(user,route,content);
}

document.addEventListener('click',event => {
  const callback = event.target.closest('[data-callback]');
  if (callback) callbacks[Number(callback.dataset.callback)]?.();
  if (event.target.closest('[data-close]')) dialog.close();
  if (event.target.closest('[data-toggle]')) {
    drawerOpen = !drawerOpen;
    render();
    document.querySelector(drawerOpen ? '.sidebar nav a' : '.mobile-menu')?.focus();
  }
  if (event.target.closest('[data-clear-range]')) {
    reportRange = {start:'',end:''};
    render();
  }
  if (event.target.closest('.skip-link')) {
    event.preventDefault();
    document.querySelector('main').focus();
  }
});
document.addEventListener('input',event => {
  if (!event.target.matches('[data-filter]')) return;
  const query = event.target.value.trim().toLocaleLowerCase();
  for (const row of event.target.closest('.panel').querySelectorAll('tbody tr')) {
    row.hidden = !row.textContent.toLocaleLowerCase().includes(query);
  }
});
document.addEventListener('submit',event => {
  if (!event.target.matches('[data-range]')) return;
  event.preventDefault();
  const f = values(event.target);
  const start = f['report-start'], end = f['report-end'];
  if (start && end && start > end) return tell('วันเริ่มต้องไม่อยู่หลังวันสิ้นสุด');
  reportRange = {start,end};
  render();
});
window.addEventListener('hashchange',() => {
  drawerOpen = false;
  if (dialog.open) dialog.close();
  render();
  window.scrollTo(0,0);
});
window.addEventListener('storage',event => {
  if (event.key !== dataKey) return;
  db = load();
  if (dialog.open) dialog.close();
  render();
});
render();
