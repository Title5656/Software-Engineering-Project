import test from 'node:test';
import assert from 'node:assert/strict';
import { seed, change, read, day, balance, authenticate } from '../docs/model.mjs';

const action = (db, user, op, fields) => change(db, user, op, fields);

test('lease renewal approval and rejection reach the resident', () => {
  const db = seed();
  const lease = read(db, 'U1').leases[0];
  const approved = action(db, 'U1', 'renew', { id: lease.id, end: day(100) });
  action(db, 'A1', 'reviewRenewal', { id: approved.id, decision: 'approved' });
  assert.equal(read(db, 'U1').leases[0].end, day(100));
  const rejected = action(db, 'U1', 'renew', { id: lease.id, end: day(150) });
  action(db, 'A1', 'reviewRenewal', { id: rejected.id, decision: 'rejected' });
  assert.equal(read(db, 'U1').renewals.find(r => r.id === rejected.id).status, 'rejected');
  assert.equal(read(db, 'U1').leases[0].end, day(100));
  assert.throws(() => action(db, 'U2', 'renew', { id: lease.id, end: day(160) }));
});

test('repair handoff and technician isolation', () => {
  const db = seed();
  const repair = action(db, 'U1', 'repair', { location: 'F1', title: 'ไฟเสีย', detail: 'ไฟทางเดินดับ' });
  action(db, 'A1', 'assign', { id: repair.id, tech: 'T1', appointment: day(2) });
  assert.equal(read(db, 'T2').repairs.some(r => r.id === repair.id), false);
  assert.throws(() => action(db, 'T2', 'progress', { id: repair.id, status: 'working', note: 'ทดสอบ' }));
  action(db, 'T1', 'progress', { id: repair.id, status: 'working', note: 'ตรวจแล้ว' });
  action(db, 'T1', 'progress', { id: repair.id, status: 'done', note: 'เปลี่ยนหลอดแล้ว' });
  action(db, 'T1', 'facility', { id: repair.id, status: 'closed' });
  assert.equal(read(db, 'U1').repairs.find(r => r.id === repair.id).status, 'done');
  assert.equal(read(db, 'U1').facilities.find(f => f.id === 'F1').status, 'closed');
});

test('payment verification controls balance and receipt issuance', () => {
  const db = seed();
  const bill = action(db, 'A1', 'invoice', { lease: 'L1', period: day(0).slice(0,7), item: 'ค่าบริการ', amount: '1200', due: day(10) });
  const payment = action(db, 'U1', 'pay', { id: bill.id, amount: '500', time: day(0) + 'T10:00', proof: 'sample' });
  action(db, 'A1', 'reviewPayment', { id: payment.id, decision: 'rejected', note: 'ยอดไม่ตรง' });
  assert.throws(() => action(db, 'A1', 'receipt', { id: payment.id }));
  assert.equal(balance(db, bill), 1200);
  const accepted = action(db, 'U1', 'pay', { id: bill.id, amount: '1200', time: day(0) + 'T11:00', proof: 'sample' });
  action(db, 'A1', 'reviewPayment', { id: accepted.id, decision: 'approved', amount: '1200' });
  const receipt = action(db, 'A1', 'receipt', { id: accepted.id });
  assert.equal(balance(db, bill), 0);
  assert.throws(() => action(db, 'A1', 'receipt', { id: accepted.id }));
  assert.equal(read(db, 'U1').receipts.some(r => r.id === receipt.id), true);
  assert.equal(read(db, 'U2').invoices.some(i => i.id === bill.id), false);
});

test('booking conflict, adjacent time, and resident profile consistency', () => {
  const db = seed();
  const from = day(12) + 'T10:00';
  const to = day(12) + 'T11:00';
  action(db, 'U1', 'book', { facility: 'F1', from, to });
  assert.throws(() => action(db, 'U2', 'book', { facility: 'F1', from, to }));
  action(db, 'U2', 'book', { facility: 'F1', from: to, to: day(12) + 'T12:00' });
  action(db, 'U1', 'profile', { name: 'ผู้พักตัวอย่าง', phone: '0800000000' });
  assert.equal(db.residents.find(r => r.id === 'R1').name, 'ผู้พักตัวอย่าง');
  action(db, 'A1', 'move', { resident: 'R1', lease: 'L1', direction: 'out', date: day(0) });
  assert.equal(db.residents.find(r => r.id === 'R1').unit, '');
  assert.equal(db.moves.at(-1).unit, 'RM1');
});

test('registration, disabled access, parcels, and published announcements', () => {
  const db = seed();
  const user = action(db, '', 'register', { username: 'new.demo', password: 'demo123', name: 'ธารา ตัวอย่าง', phone: '0800000003', unit: 'RM3' });
  assert.equal(authenticate(db, 'new.demo', 'demo123').id, user.id);
  const parcel = action(db, 'A1', 'parcel', { resident: 'R3', carrier: 'เดโม', tracking: 'TK-1', time: day(0) + 'T10:00' });
  assert.equal(read(db, user.id).parcels[0].status, 'waiting');
  action(db, 'A1', 'deliver', { id: parcel.id });
  assert.equal(read(db, user.id).parcels[0].status, 'delivered');
  const post = action(db, 'A1', 'announcement', { title: 'ทดสอบ', detail: 'ข้อมูลตัวอย่าง', status: 'draft' });
  assert.equal(read(db, user.id).announcements.some(p => p.id === post.id), false);
  action(db, 'A1', 'announcement', { id: post.id, title: 'ทดสอบ', detail: 'ข้อมูลตัวอย่าง', status: 'published' });
  assert.equal(read(db, user.id).announcements.some(p => p.id === post.id), true);
  action(db, 'A1', 'account', { id: user.id, role: 'resident', status: 'disabled' });
  assert.throws(() => authenticate(db, 'new.demo', 'demo123'));
});

test('admin can reassign a working repair after technician suspension', () => {
  const db = seed();
  action(db, 'A1', 'account', { id: 'T1', role: 'tech', status: 'disabled' });
  const reassigned = action(db, 'A1', 'assign', { id: 'RP-01', tech: 'T2', appointment: day(2) });
  assert.equal(reassigned.status, 'working');
  assert.equal(reassigned.history.length, 2);
  assert.equal(read(db, 'T2').repairs.some(r => r.id === 'RP-01'), true);
  action(db, 'T2', 'progress', { id: 'RP-01', status: 'done', note: 'ซ่อมเสร็จ' });
  assert.equal(read(db, 'U1').repairs[0].status, 'done');
});
