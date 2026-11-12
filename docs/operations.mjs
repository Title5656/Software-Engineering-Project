import { day, balance } from './model.mjs';
import { byId, room, roomOptions, displayName, person, leaseOptions } from './office.mjs';
import { badge, cash, dateLabel, esc, empty, field, icon, link, mainCell, section, table } from './ui.mjs';

const text = (key, label, value = '') => field(key, label, { value });
const options = (key, label, choices, value = '') => field(key, label, { choices, value });
const calendar = (key, label, value = day()) => field(key,label,{type:'date',value});
const dateTime = (key, label, value = day() + 'T12:00') => field(key,label,{type:'datetime-local',value});
const amountField = (label, value) => field('amount',label,{type:'number',value,min:0.01});
const search = placeholder => '<label class="search"><span class="sr-only">ค้นหา</span><input type="search" data-filter placeholder="' + esc(placeholder) + '"></label>';
const repairLocation = (db, r) => byId(db.facilities,r.location)?.name || room(db,r.location);
const repairStatus = (key) => badge(key);

function history(entries) {
  if (!entries.length) return empty('ยังไม่มีบันทึกความคืบหน้า');
  return '<ol class="timeline">' + entries.toReversed().map(h => '<li><div>' + badge(h.status) + ' <small>' + dateLabel(h.date) + '</small></div><p>' + esc(h.note) + '</p></li>').join('') + '</ol>';
}

export function repairs({ db, data, user, id, action }) {
  const isResident = user.role === 'resident';
  const isAdmin = user.role === 'admin';
  const newAction = isResident ? action('repair','แจ้งซ่อม',[
    options('location','สถานที่',[...roomOptions(db).filter(([key]) => key === data.resident?.unit),...db.facilities.map(f => [f.id,f.name])]),
    text('title','หัวข้อ'),field('detail','รายละเอียดปัญหา',{type:'textarea'}),
    field('attachment','รูปแนบ',{required:false,choices:[['','ไม่แนบรูป'],['sample','แนบรูปแจ้งซ่อมตัวอย่าง']]}),
  ],{}, {primary:true}) : '';
  if (id) {
    const repair = byId(data.repairs,id);
    if (!repair) return section('รายการแจ้งซ่อม',empty('ไม่พบงานซ่อมที่บัญชีนี้เปิดได้') + '<div class="panel-padding">' + link('repairs','กลับไปยังรายการ') + '</div>');
    const facility = byId(db.facilities,repair.location);
    const techs = db.users.filter(u => u.role === 'tech' && u.status === 'active').map(u => [u.id,displayName(db,u)]);
    const assign = isAdmin && repair.status !== 'done' ? action('assign',repair.tech ? 'มอบหมายใหม่' : 'มอบหมายงาน',[
      options('tech','ช่างซ่อม',techs,repair.tech),calendar('appointment','วันนัด',repair.appointment || day(1)),
    ],{id}, {primary:true}) : '';
    const isTech = user.role === 'tech';
    const update = isTech && ['assigned','working'].includes(repair.status) ? action('progress','อัปเดตความคืบหน้า',[
      options('status','สถานะ',[['working','กำลังดำเนินการ'],...(repair.status === 'working' ? [['done','เสร็จแล้ว']] : [])]),
      field('note','รายละเอียดผลซ่อม',{type:'textarea'}),
    ],{id}, {primary:true}) : '';
    const facilityAction = isTech && repair.status === 'done' && facility ? action('facility','ปรับสถานะส่วนกลาง',[
      options('status','สถานะส่วนกลาง',[['open','เปิดใช้งาน'],['closed','ปิดใช้งาน']],facility.status),
    ],{id}, {primary:true}) : '';
    const assignee = byId(db.users,repair.tech);
    return '<div class="back-link">' + link('repairs','กลับไปยังรายการ') + '</div>' +
      section(repair.title,'<div class="panel-padding detail"><div>' + repairStatus(repair.status) +
      '<p class="preserve">' + esc(repair.detail) + '</p>' +
      (repair.attachment ? '<figure class="repair-sample"><span class="sample-pipe" role="img" aria-label="ภาพจำลองน้ำหยดจากท่อ"></span><figcaption>รูปประกอบตัวอย่าง</figcaption></figure>' : '') +
      '</div><dl><dt>รหัสงาน</dt><dd>' + esc(id) + '</dd><dt>สถานที่</dt><dd>' + esc(repairLocation(db,repair)) +
      '</dd><dt>ผู้รับผิดชอบ</dt><dd>' + esc(assignee ? displayName(db,assignee) : 'รอมอบหมาย') + '</dd><dt>วันนัด</dt><dd>' +
      dateLabel(repair.appointment) + '</dd></dl></div>', { action: assign || update || facilityAction }) +
      section('ประวัติความคืบหน้า',history(repair.history));
  }
  return section(user.role === 'tech' ? 'งานที่ได้รับมอบหมาย' : 'รายการแจ้งซ่อม',search('ค้นหาหัวข้อ เลขงาน หรือสถานะ') + table(
    ['งานซ่อม','สถานที่','วันที่แจ้ง','สถานะ','รายละเอียด'],
    data.repairs.toReversed().map(r => [mainCell(r.title,r.id),esc(repairLocation(db,r)),dateLabel(r.date),repairStatus(r.status),link('repairs/' + r.id,'เปิดงาน','chevron')]),
    'ยังไม่มีงานซ่อม',
  ),{action:newAction});
}

export function booking({ data, action }) {
  const cards = data.facilities.map(f => '<article class="facility-card panel"><div class="feature-icon">' + icon(f.icon) + '</div>' +
    badge(f.status) + '<h2>' + esc(f.name) + '</h2><p>' + esc(f.location) + '</p>' +
    (f.status === 'open' ? action('book','ตรวจช่วงว่างและจอง',[
      dateTime('from','เริ่ม',day(1) + 'T10:00'),dateTime('to','สิ้นสุด',day(1) + 'T11:00'),
    ],{facility:f.id},{primary:true,check:true}) : '') + '</article>');
  return '<div class="facility-grid">' + cards.join('') + '</div>' +
    section('การจองของฉัน',table(['ส่วนกลาง','เริ่ม','สิ้นสุด','สถานะ'],
      data.bookings.toReversed().map(b => [mainCell(byId(data.facilities,b.facility)?.name,b.id),dateLabel(b.from),dateLabel(b.to),badge('approved','จองแล้ว')]),
    'ยังไม่มีรายการจอง'));
}

const billStatus = (db,i) => {
  const due = balance(db,i);
  return due === 0 ? 'paid' : due < i.amount ? 'partial' : 'unpaid';
};
const paymentBadge = p => badge(p.status, {pending:'รอตรวจ',approved:'ตรวจผ่าน',rejected:'ไม่ผ่าน'}[p.status]);

export function finance({ db, data, user, id, action, confirm, detail }) {
  const admin = user.role === 'admin';
  const bill = id && byId(data.invoices,id);
  const pay = bill && !admin && balance(db,bill) > 0 && !data.payments.some(p => p.invoice === id && p.status === 'pending')
    ? action('pay','ส่งหลักฐานการชำระเงิน',[
      amountField('ยอดชำระ',balance(db,bill)),dateTime('time','วันเวลาชำระ'),
      options('proof','หลักฐาน',[['sample','สลิปตัวอย่าง']],'sample'),
    ],{id}, {primary:true}) : '';
  const issue = admin ? action('invoice','ออกใบแจ้งหนี้',[
    options('lease','สัญญา',leaseOptions(db,true)),field('period','รอบบิล',{type:'month',value:day().slice(0,7)}),
    text('item','รายการค่าใช้จ่าย','ค่าเช่าห้องชุด'),amountField('ยอดรวม'),calendar('due','วันครบกำหนด',day(10)),
  ],{}, {primary:true}) : '';
  const receiptButton = r => detail('ดูใบเสร็จ','ใบเสร็จรับเงิน ' + r.id,
    '<dl class="receipt"><dt>เลขที่ใบเสร็จ</dt><dd>' + esc(r.id) + '</dd><dt>ใบแจ้งหนี้</dt><dd>' + esc(r.invoice) +
    '</dd><dt>รายการชำระ</dt><dd>' + esc(r.payment) + '</dd><dt>วันที่ออก</dt><dd>' + dateLabel(r.date) +
    '</dd><dt>ยอดรับชำระ</dt><dd>' + cash(r.amount) + '</dd></dl><p class="meta">เอกสารตัวอย่างสำหรับสาธิต</p>');
  const paymentRows = items => table(['รายการ','ยอดที่แจ้ง / ยืนยัน','ผลตรวจ','หลักฐาน','จัดการ'],
    items.toReversed().map(p => {
      const receipt = data.receipts.find(r => r.payment === p.id);
      const review = admin && p.status === 'pending' ? action('reviewPayment','ตรวจหลักฐาน',[
        options('decision','ผลตรวจ',[['approved','ตรวจผ่าน'],['rejected','ปฏิเสธ']]),
        amountField('ยอดที่ยืนยันเมื่อผ่าน',p.amount),field('note','หมายเหตุ',{required:false}),
      ],{id:p.id}) : '';
      const receiptAction = admin && p.status === 'approved' && !receipt ?
        confirm('receipt','ออกใบเสร็จ',{id:p.id},'ออกใบเสร็จสำหรับ ' + p.id + ' ยอด ' + cash(p.verified)) : '';
      return [mainCell(p.id,p.invoice + ' · ' + dateLabel(p.time)),mainCell(cash(p.amount),p.verified ? 'ยืนยัน ' + cash(p.verified) : ''),
        paymentBadge(p) + (p.note ? '<span class="meta">' + esc(p.note) + '</span>' : ''),
        detail('ดูสลิป','หลักฐานการชำระเงิน',
          '<div class="slip"><strong>' + icon('check') + ' สลิปตัวอย่าง</strong><p>' + cash(p.amount) + '</p><div>' + esc(p.id) + ' · ' + dateLabel(p.time) + '</div></div>'),
        review || receiptAction || (receipt ? receiptButton(receipt) : '—')];
    }), 'ยังไม่มีรายการชำระเงิน');
  if (id) {
    if (!bill) return section('ใบแจ้งหนี้',empty('ไม่พบใบแจ้งหนี้ที่บัญชีนี้เปิดได้') + '<div class="panel-padding">' + link('finance','กลับไปยังรายการ') + '</div>');
    return '<div class="back-link">' + link('finance','กลับไปยังรายการ') + '</div>' +
      section('ใบแจ้งหนี้ ' + bill.id,'<div class="panel-padding detail"><div>' + badge(billStatus(db,bill)) +
      '<h3>' + esc(bill.item) + '</h3><p>ห้อง ' + esc(room(db,bill.unit)) + ' · ' + esc(person(db,bill.resident)) +
      '</p></div><dl><dt>รอบบิล</dt><dd>' + esc(bill.period) + '</dd><dt>ครบกำหนด</dt><dd>' + dateLabel(bill.due) +
      '</dd><dt>ยอดรวม</dt><dd>' + cash(bill.amount) + '</dd><dt>ยอดค้าง</dt><dd>' + cash(balance(db,bill)) + '</dd></dl></div>',{action:pay}) +
      section('รายการชำระเงินและใบเสร็จ',paymentRows(data.payments.filter(p => p.invoice === id)));
  }
  return section('ใบแจ้งหนี้',search('ค้นหาใบแจ้งหนี้หรือเลขห้อง') + table(['ใบแจ้งหนี้','ครบกำหนด','ยอดรวม / ค้าง','สถานะ','รายละเอียด'],
    data.invoices.toReversed().map(i => [mainCell(i.item,i.id + ' · ' + room(db,i.unit)),dateLabel(i.due),
      mainCell(cash(i.amount),'ค้าง ' + cash(balance(db,i))),badge(billStatus(db,i)),link('finance/' + i.id,'เปิดบิล','chevron')]),
    'ยังไม่มีใบแจ้งหนี้'),{action:issue}) +
    section(admin ? 'ตรวจสอบหลักฐานและออกใบเสร็จ' : 'ประวัติชำระเงินและใบเสร็จ',paymentRows(data.payments));
}
