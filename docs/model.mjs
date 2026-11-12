export function day(offset = 0) {
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Bangkok' }).format();
  const date = new Date(today + 'T00:00Z');
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export const roles = { resident: 'ผู้พักอาศัย', admin: 'นิติบุคคล', tech: 'ช่างซ่อม' };
export const demoPassword = 'demo123';

const demoVersion = 2;
const cast = {
  users: {
    A1: ['กมล วัฒนกุล', 'ลิซา ซู'],
    T1: ['นนท์ ศรีอาคาร', 'อีลอน มัสก์'],
    T2: ['ภพ ดีพร้อม', 'ทิม คุก'],
  },
  residents: {
    R1: ['พิมพ์ชนก วงศ์ดี', 'เจนเซน หวัง'],
    R2: ['กิตติ สมใจ', 'แซม อัลต์แมน'],
    R3: ['ธารา ตัวอย่าง', 'มาร์ก ซักเคอร์เบิร์ก'],
  },
  visitors: {
    'VS-01': ['ผู้มาติดต่อ ตัวอย่าง', 'สัตยา นาเดลลา'],
  },
};

export const registrationExample = {
  name: cast.residents.R3[1], phone: '0800000003', unit: 'RM3', room: 'A-602',
};

export function upgradeDemo(data) {
  if (!Array.isArray(data?.users)) return seed();
  if (data.version === demoVersion) return data;
  if (data.version !== 1) return seed();
  const updated = structuredClone(data);
  for (const [collection, names] of Object.entries(cast)) {
    for (const record of updated[collection]) {
      const namesForRecord = names[record.id];
      if (namesForRecord && record.name === namesForRecord[0]) record.name = namesForRecord[1];
    }
  }
  updated.version = demoVersion;
  return updated;
}

export function seed() {
  const users = [
    ['A1', 'office', 'admin', ''],
    ['U1', 'resident', 'resident', 'R1'],
    ['U2', 'resident2', 'resident', 'R2'],
    ['T1', 'tech', 'tech', ''],
    ['T2', 'tech2', 'tech', ''],
  ].map(([id, username, role, resident]) => ({
    id, username, role, resident, name: cast.users[id]?.[1] ?? '', phone: '0800000000', password: demoPassword, status: 'active',
  }));
  return {
    version: demoVersion, next: 100, users,
    units: [
      ['RM1','A','8','A-804','open'], ['RM2','B','4','B-406','open'],
      ['RM3','A','6','A-602','open'], ['RM4','B','3','B-305','open'],
      ['RM5','A','9','A-902','closed'],
    ].map(([id, building, floor, number, status]) => ({ id, building, floor, number, status })),
    residents: [
      { id: 'R1', name: cast.residents.R1[1], phone: '0800000001', unit: 'RM1' },
      { id: 'R2', name: cast.residents.R2[1], phone: '0800000002', unit: 'RM2' },
      { id: 'R3', name: registrationExample.name, phone: registrationExample.phone, unit: registrationExample.unit },
    ],
    leases: [
      { id: 'L1', resident: 'R1', unit: 'RM1', start: day(-335), end: day(25), rent: 9500, status: 'active' },
      { id: 'L2', resident: 'R2', unit: 'RM2', start: day(-20), end: day(160), rent: 8000, status: 'active' },
    ],
    renewals: [],
    moves: [{ id: 'MV-01', resident: 'R1', unit: 'RM1', lease: 'L1', direction: 'in', date: day(-335) }],
    facilities: [
      { id: 'F1', name: 'ห้องออกกำลังกาย', location: 'อาคาร A · ชั้น 2', status: 'open', icon: 'activity' },
      { id: 'F2', name: 'ห้องประชุม', location: 'อาคาร A · ชั้น 1', status: 'open', icon: 'calendar' },
      { id: 'F3', name: 'สระว่ายน้ำ', location: 'อาคาร B · ชั้น 3', status: 'closed', icon: 'droplet' },
    ],
    repairs: [
      { id: 'RP-01', resident: 'R1', location: 'RM1', title: 'น้ำหยดจากเครื่องปรับอากาศ', detail: 'พบหยดน้ำบริเวณเครื่องปรับอากาศในห้องนั่งเล่น', date: day(-2), status: 'working', tech: 'T1', appointment: day(1), history: [{ date: day(-1), status: 'working', note: 'ตรวจสอบเบื้องต้นแล้ว นัดล้างท่อน้ำทิ้ง' }] },
      { id: 'RP-02', resident: 'R2', location: 'F3', title: 'ตรวจปั๊มน้ำสระว่ายน้ำ', detail: 'ปั๊มน้ำทำงานผิดปกติ', date: day(-1), status: 'assigned', tech: 'T2', appointment: day(1), history: [] },
    ],
    bookings: [{ id: 'BK-01', resident: 'R2', facility: 'F2', from: day(1) + 'T10:00', to: day(1) + 'T11:00' }],
    invoices: [
      { id: 'IV-01', resident: 'R1', lease: 'L1', unit: 'RM1', period: day(-35).slice(0, 7), item: 'ค่าเช่าห้องชุด', amount: 9500, due: day(-12) },
      { id: 'IV-02', resident: 'R2', lease: 'L2', unit: 'RM2', period: day(-35).slice(0, 7), item: 'ค่าเช่าห้องชุด', amount: 8000, due: day(-12) },
    ],
    payments: [{ id: 'PY-01', invoice: 'IV-02', amount: 8000, time: day(-14) + 'T09:00', proof: 'sample', status: 'approved', verified: 8000 }],
    receipts: [{ id: 'RC-01', invoice: 'IV-02', payment: 'PY-01', amount: 8000, date: day(-13) }],
    visitors: [{ id: 'VS-01', name: cast.visitors['VS-01'][1], unit: 'RM2', purpose: 'เยี่ยมผู้พัก', entered: day(0) + 'T09:30', exited: '' }],
    parcels: [{ id: 'PK-01', resident: 'R1', unit: 'RM1', carrier: 'ขนส่งตัวอย่าง', tracking: 'DEMO-804', time: day(0) + 'T10:20', status: 'waiting', delivered: '' }],
    announcements: [
      { id: 'AN-01', title: 'ตรวจระบบน้ำอาคาร A', detail: 'ทีมอาคารจะตรวจระบบน้ำช่วง 10:00–12:00 น. หากพบแรงดันน้ำลดลง กรุณาแจ้งนิติบุคคลผ่านเมนูแจ้งซ่อม', date: day(0), status: 'published' },
      { id: 'AN-02', title: 'ปรับเวลาเปิดห้องออกกำลังกาย', detail: 'ห้องออกกำลังกายเปิดให้ใช้เวลา 06:00–22:00 น. ตรวจช่วงว่างก่อนเข้าใช้บริการ', date: day(-3), status: 'published' },
    ],
  };
}

const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
const find = (items, id) => items.find(item => item.id === id);
const get = (items, id) => {
  const item = find(items, id);
  requireThat(item, 'ไม่พบรายการที่เลือก');
  return item;
};

export function authenticate(db, username, password) {
  const user = db.users.find(u => u.username === username.trim().toLowerCase() && u.password === password);
  requireThat(user, 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  requireThat(user.status === 'active', 'บัญชีนี้ถูกระงับ');
  return user;
}

export function balance(db, invoice) {
  const paid = db.payments.filter(p => p.invoice === invoice.id && p.status === 'approved')
    .reduce((sum, p) => sum + Math.round(p.verified * 100), 0);
  return Math.max(0, Math.round(invoice.amount * 100) - paid) / 100;
}

export function unitStatus(db, unit) {
  if (unit.status === 'closed') return 'closed';
  return db.residents.some(r => r.unit === unit.id) ? 'occupied' : 'vacant';
}

export function read(db, userId) {
  const user = find(db.users, userId);
  if (user?.status !== 'active') return {};
  if (user.role === 'admin') return db;
  const resident = find(db.residents, user.resident);
  const own = items => resident ? items.filter(item => item.resident === resident.id) : [];
  if (user.role === 'tech') {
    return { repairs: db.repairs.filter(r => r.tech === userId), units: db.units, facilities: db.facilities };
  }
  const invoices = own(db.invoices);
  return {
    resident, units: db.units, leases: own(db.leases), renewals: own(db.renewals),
    repairs: own(db.repairs), facilities: db.facilities, bookings: own(db.bookings),
    invoices, payments: db.payments.filter(p => find(invoices, p.invoice)),
    receipts: db.receipts.filter(r => find(invoices, r.invoice)), parcels: own(db.parcels),
    announcements: db.announcements.filter(a => a.status === 'published' && a.date <= day()),
  };
}

export function availability(db, facilityId, from, to) {
  const facility = get(db.facilities, facilityId);
  requireThat(facility.status === 'open', 'ส่วนกลางนี้ปิดให้บริการ');
  requireThat(from && to && from < to && from.slice(0, 10) >= day(), 'เลือกช่วงเวลาเริ่มและสิ้นสุดที่ถูกต้อง');
  requireThat(!db.bookings.some(b => b.facility === facility.id && from < b.to && b.from < to), 'ช่วงเวลานี้ถูกจองแล้ว กรุณาเลือกช่วงอื่น');
  return facility;
}

const adminActions = new Set(['account', 'unit', 'removeUnit', 'resident', 'removeResident', 'lease', 'endLease', 'move', 'reviewRenewal', 'assign', 'invoice', 'reviewPayment', 'receipt', 'visit', 'leave', 'parcel', 'deliver', 'announcement']);
const residentActions = new Set(['renew', 'repair', 'book', 'pay']);
const techActions = new Set(['progress', 'facility']);

export function change(db, userId, op, fields) {
  const draft = structuredClone(db);
  const result = perform(draft, userId, op, fields);
  Object.assign(db, draft);
  return result;
}

function perform(db, userId, op, fields) {
  const f = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, String(value).trim()]));
  const user = find(db.users, userId);
  if (op !== 'register') {
    requireThat(user?.status === 'active', 'กรุณาเข้าสู่ระบบด้วยบัญชีที่ใช้งานได้');
    requireThat(op === 'profile' || (user.role === 'admin' && adminActions.has(op))
      || (user.role === 'resident' && residentActions.has(op)) || (user.role === 'tech' && techActions.has(op)), 'คุณไม่มีสิทธิ์ดำเนินการ');
  }
  const resident = find(db.residents, user?.resident);
  const required = (...keys) => requireThat(keys.every(key => f[key]), 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ');
  const add = (items, prefix, data) => {
    const item = { id: prefix + '-' + db.next++, ...data };
    items.push(item);
    return item;
  };
  const save = (items, prefix, data) => f.id ? Object.assign(get(items, f.id), data) : add(items, prefix, data);
  const remove = (items, id) => items.splice(items.indexOf(get(items, id)), 1);
  const money = (key = 'amount') => {
    const amount = Number(f[key]);
    requireThat(Number.isFinite(amount) && amount > 0 && amount <= 10000000, 'กรอกยอดเงินที่มากกว่า 0');
    return Math.round(amount * 100) / 100;
  };
  const owns = record => requireThat(resident && record.resident === resident.id, 'ไม่พบรายการของบัญชีนี้');
  const linked = () => {
    requireThat(resident, 'บัญชีนี้ยังไม่ได้ผูกกับข้อมูลผู้พัก');
    return resident;
  };
  switch (op) {
    case 'register': {
      required('username', 'password', 'name', 'phone', 'unit');
      get(db.units, f.unit);
      const username = f.username.toLowerCase();
      requireThat(/^[a-z0-9._-]{3,30}$/.test(username) && f.password.length >= 4, 'ชื่อผู้ใช้ต้องเป็นอักษรอังกฤษหรือตัวเลขอย่างน้อย 3 ตัว และรหัสผ่านอย่างน้อย 4 ตัว');
      requireThat(!db.users.some(u => u.username === username), 'ชื่อผู้ใช้นี้ถูกใช้แล้ว');
      const match = db.residents.find(r => r.unit === f.unit && r.name === f.name && r.phone === f.phone && !db.users.some(u => u.resident === r.id));
      requireThat(match, 'ไม่พบผู้พักที่ยังไม่ผูกบัญชีในห้องนี้ หรือชื่อและเบอร์โทรไม่ตรงกับทะเบียน');
      return add(db.users, 'U', { username, password: f.password, name: '', phone: '', role: 'resident', resident: match.id, status: 'active' });
    }
    case 'profile':
      required('name', 'phone');
      return Object.assign(resident ?? user, { name: f.name, phone: f.phone });
    case 'account': {
      const account = get(db.users, f.id);
      requireThat(account.id !== user.id, 'ใช้บัญชีอื่นเพื่อแก้สิทธิ์บัญชีที่กำลังใช้งาน');
      requireThat(Object.hasOwn(roles, f.role) && ['active', 'disabled'].includes(f.status), 'เลือกบทบาทและสถานะให้ถูกต้อง');
      if (f.role === 'resident') {
        const record = get(db.residents, f.resident || account.resident);
        requireThat(!db.users.some(u => u.id !== account.id && u.resident === record.id), 'ผู้พักรายนี้ผูกกับบัญชีอื่นแล้ว');
        account.resident = record.id;
      }
      return Object.assign(account, { role: f.role, status: f.status });
    }
    case 'unit':
      required('building', 'floor', 'number', 'status');
      requireThat(!db.units.some(u => u.id !== f.id && u.building === f.building && u.number === f.number), 'เลขห้องซ้ำในอาคารนี้');
      return save(db.units, 'RM', { building: f.building, floor: f.floor, number: f.number, status: f.status });
    case 'removeUnit':
      requireThat(![db.residents, db.leases, db.moves, db.visitors, db.parcels, db.invoices].some(rows => rows.some(r => r.unit === f.id))
        && !db.repairs.some(r => r.location === f.id), 'ห้องนี้มีข้อมูลอ้างอิงและลบไม่ได้');
      return remove(db.units, f.id);
    case 'resident': {
      required('name', 'phone');
      if (f.unit) get(db.units, f.unit);
      const previous = find(db.residents, f.id);
      return save(db.residents, 'R', { name: f.name, phone: f.phone, unit: previous ? previous.unit : f.unit });
    }
    case 'removeResident':
      requireThat(![db.users, db.leases, db.moves, db.repairs, db.bookings, db.parcels, db.invoices].some(rows => rows.some(r => r.resident === f.id)), 'ผู้พักรายนี้มีข้อมูลอ้างอิงและลบไม่ได้');
      return remove(db.residents, f.id);
    case 'lease': {
      required('resident', 'unit', 'start', 'end');
      get(db.residents, f.resident);
      get(db.units, f.unit);
      requireThat(f.start < f.end, 'วันสิ้นสุดต้องอยู่หลังวันเริ่มสัญญา');
      const previous = find(db.leases, f.id);
      if (previous) {
        requireThat(previous.status === 'active' && previous.resident === f.resident && previous.unit === f.unit, 'แก้ไขได้เฉพาะวันที่และค่าเช่าของสัญญาที่เปิดอยู่');
      }
      return save(db.leases, 'L', { resident: f.resident, unit: f.unit, start: f.start, end: f.end, rent: money('rent'), status: 'active' });
    }
    case 'endLease': {
      const lease = get(db.leases, f.id);
      requireThat(lease.status === 'active', 'สัญญานี้สิ้นสุดแล้ว');
      lease.status = 'ended';
      db.renewals.filter(r => r.lease === lease.id && r.status === 'pending').forEach(r => { r.status = 'rejected'; r.note = 'สัญญาสิ้นสุดแล้ว'; });
      return lease;
    }
    case 'move': {
      required('resident', 'lease', 'direction', 'date');
      const record = get(db.residents, f.resident);
      const lease = get(db.leases, f.lease);
      requireThat(lease.resident === record.id && f.date <= day(), 'เลือกสัญญาของผู้พักและวันที่ไม่เกินวันนี้');
      const last = db.moves.filter(m => m.resident === record.id).at(-1);
      requireThat(!last || f.date >= last.date, 'วันย้ายต้องไม่มาก่อนรายการล่าสุด');
      if (f.direction === 'in') {
        requireThat(lease.status === 'active' && get(db.units, lease.unit).status === 'open', 'ห้องและสัญญาต้องอยู่ในสถานะใช้งาน');
        requireThat(!record.unit, 'บันทึกย้ายออกจากห้องปัจจุบันก่อน');
        record.unit = lease.unit;
      } else {
        requireThat(f.direction === 'out' && record.unit === lease.unit, 'สัญญาไม่ตรงกับห้องที่พักอยู่');
        record.unit = '';
      }
      return add(db.moves, 'MV', { resident: record.id, unit: lease.unit, lease: lease.id, direction: f.direction, date: f.date });
    }
    case 'renew': {
      const lease = get(db.leases, f.id);
      owns(lease);
      requireThat(lease.status === 'active' && f.end && f.end > lease.end, 'เลือกวันสิ้นสุดใหม่หลังวันสิ้นสุดปัจจุบัน');
      requireThat(!db.renewals.some(r => r.lease === lease.id && r.status === 'pending'), 'มีคำขอที่รอพิจารณาอยู่');
      return add(db.renewals, 'RN', { resident: resident.id, lease: lease.id, end: f.end, date: day(), status: 'pending', note: '' });
    }
    case 'reviewRenewal': {
      const request = get(db.renewals, f.id);
      const lease = get(db.leases, request.lease);
      requireThat(request.status === 'pending' && ['approved', 'rejected'].includes(f.decision), 'คำขอนี้ได้รับการพิจารณาแล้ว');
      if (f.decision === 'approved') {
        requireThat(lease.status === 'active' && request.end > lease.end, 'วันสิ้นสุดที่ขอไม่สอดคล้องกับสัญญาปัจจุบัน');
        lease.end = request.end;
      }
      return Object.assign(request, { status: f.decision, note: f.note || '' });
    }
    case 'repair':
      required('location', 'title', 'detail');
      requireThat(f.location === linked().unit || find(db.facilities, f.location), 'เลือกห้องปัจจุบันหรือพื้นที่ส่วนกลาง');
      return add(db.repairs, 'RP', { resident: resident.id, location: f.location, title: f.title, detail: f.detail, attachment: f.attachment || '', date: day(), status: 'new', tech: '', appointment: '', history: [] });
    case 'assign': {
      required('tech', 'appointment');
      const repair = get(db.repairs, f.id);
      const tech = get(db.users, f.tech);
      requireThat(tech.role === 'tech' && tech.status === 'active' && repair.status !== 'done', 'เลือกช่างที่ใช้งานได้และงานที่ยังเปิดอยู่');
      const status = repair.status === 'working' ? 'working' : 'assigned';
      repair.history.push({ status, date: day(), note: 'มอบหมายให้ ' + (find(db.residents, tech.resident)?.name || tech.name || tech.username) });
      return Object.assign(repair, { tech: tech.id, appointment: f.appointment, status });
    }
    case 'progress': {
      required('note');
      const repair = get(db.repairs, f.id);
      const next = { assigned: ['working'], working: ['working', 'done'] };
      requireThat(repair.tech === user.id && next[repair.status]?.includes(f.status), 'สถานะนี้ใช้ได้กับงานที่ได้รับมอบหมายในขั้นตอนที่กำหนด');
      repair.history.push({ status: f.status, note: f.note, date: day() });
      repair.status = f.status;
      return repair;
    }
    case 'facility': {
      const repair = get(db.repairs, f.id);
      requireThat(repair.tech === user.id && repair.status === 'done' && ['open', 'closed'].includes(f.status), 'ปรับสถานะส่วนกลางได้หลังปิดงานซ่อมของคุณ');
      return Object.assign(get(db.facilities, repair.location), { status: f.status });
    }
    case 'book':
      availability(db, f.facility, f.from, f.to);
      return add(db.bookings, 'BK', { resident: linked().id, facility: f.facility, from: f.from, to: f.to });
    case 'invoice': {
      required('lease', 'period', 'item', 'due');
      const lease = get(db.leases, f.lease);
      requireThat(lease.status === 'active', 'เลือกสัญญาที่เปิดอยู่');
      requireThat(!db.invoices.some(i => i.lease === lease.id && i.period === f.period), 'ออกบิลสำหรับรอบนี้แล้ว');
      return add(db.invoices, 'IV', { lease: lease.id, resident: lease.resident, unit: lease.unit, period: f.period, item: f.item, amount: money(), due: f.due });
    }
    case 'pay': {
      required('time', 'proof');
      const invoice = get(db.invoices, f.id);
      owns(invoice);
      const amount = money();
      requireThat(amount <= balance(db, invoice), 'ยอดชำระต้องไม่เกินยอดค้าง');
      requireThat(!db.payments.some(p => p.invoice === invoice.id && p.status === 'pending'), 'มีหลักฐานรอตรวจสำหรับบิลนี้');
      return add(db.payments, 'PY', { invoice: invoice.id, amount, time: f.time, proof: f.proof, status: 'pending', verified: 0, note: '' });
    }
    case 'reviewPayment': {
      const payment = get(db.payments, f.id);
      requireThat(payment.status === 'pending' && ['approved', 'rejected'].includes(f.decision), 'รายการนี้ผ่านการพิจารณาแล้ว');
      const verified = f.decision === 'approved' ? money() : 0;
      requireThat(verified <= payment.amount && verified <= balance(db, get(db.invoices, payment.invoice)), 'ยอดยืนยันเกินยอดที่แจ้งหรือยอดค้าง');
      return Object.assign(payment, { verified, status: f.decision, note: f.note || '' });
    }
    case 'receipt': {
      const payment = get(db.payments, f.id);
      requireThat(payment.status === 'approved' && !db.receipts.some(r => r.payment === payment.id), 'ออกใบเสร็จได้ครั้งเดียวต่อรายการที่ตรวจผ่าน');
      return add(db.receipts, 'RC', { payment: payment.id, invoice: payment.invoice, amount: payment.verified, date: day() });
    }
    case 'visit':
      required('name', 'unit', 'purpose', 'time');
      get(db.units, f.unit);
      return add(db.visitors, 'VS', { name: f.name, unit: f.unit, purpose: f.purpose, entered: f.time, exited: '' });
    case 'leave': {
      const visit = get(db.visitors, f.id);
      requireThat(!visit.exited && f.time && f.time >= visit.entered, 'ตรวจสอบเวลาออกจากอาคาร');
      return Object.assign(visit, { exited: f.time });
    }
    case 'parcel': {
      required('resident', 'carrier', 'tracking', 'time');
      const recipient = get(db.residents, f.resident);
      requireThat(recipient.unit, 'ผู้พักยังไม่มีห้องปัจจุบัน');
      return add(db.parcels, 'PK', { resident: recipient.id, unit: recipient.unit, carrier: f.carrier, tracking: f.tracking, time: f.time, status: 'waiting', delivered: '' });
    }
    case 'deliver': {
      const parcel = get(db.parcels, f.id);
      requireThat(parcel.status === 'waiting', 'ส่งมอบพัสดุรายการนี้แล้ว');
      return Object.assign(parcel, { status: 'delivered', delivered: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Bangkok', dateStyle: 'short', timeStyle: 'short' }).format().replace(' ', 'T') });
    }
    case 'announcement':
      required('title', 'detail');
      requireThat(['draft', 'published'].includes(f.status), 'เลือกสถานะประกาศ');
      return save(db.announcements, 'AN', { title: f.title, detail: f.detail, status: f.status, date: f.date || day() });
    default:
      throw new Error('ไม่พบคำสั่งนี้');
  }
}
