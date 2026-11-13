import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { day, seed, registrationExample } from '../docs/model.mjs';
import { dateLabel } from '../docs/ui.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.DEMO_PLAYWRIGHT || 'playwright');
const prefix = '/Software-Engineering-Project/';
const files = new Map([['','index.html'],['styles.css','styles.css'],...['app','model','ui','office','operations'].map(name => [name + '.mjs',name + '.mjs'])]);
for (const size of [650,1280]) {
  const path = `assets/condo-${size}.webp`;
  files.set(path,path);
}
const server = createServer(async (req,res) => {
  const path = files.get(req.url.startsWith(prefix) ? req.url.slice(prefix.length) : null);
  if (!path) return res.writeHead(404).end();
  const types = { html:'text/html', css:'text/css', mjs:'text/javascript', webp:'image/webp' };
  const mime = types[path.split('.').at(-1)];
  const contentType = mime.startsWith('text/') ? mime + '; charset=utf-8' : mime;
  res.writeHead(200,{'Content-Type':contentType}).end(await readFile(new URL('../docs/' + path,import.meta.url)));
});

await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
const url = process.argv[2] || 'http://127.0.0.1:' + server.address().port + prefix;
let browser;
try {
  browser = await chromium.launch({ executablePath:process.env.DEMO_BROWSER || undefined, headless:true });
  for (const width of [1440,390]) {
    const page = await browser.newPage({viewport:{width,height:900}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const role = name => page.getByRole('button',{name,exact:true});
    const click = name => role(name).click();
    const modal = page.locator('dialog');
    const submit = (name = 'บันทึก') => modal.getByRole('button',{name,exact:true}).click();
    const field = key => modal.locator('[name="' + key + '"]');
    const fill = (key,value) => field(key).fill(value);
    const choose = (key,value) => field(key).selectOption(value);
    const has = async (text, scope = page.locator('main')) => {
      await scope.getByText(text,{exact:false}).first().waitFor();
    };
    const go = async route => {
      await page.evaluate(route => { location.hash = '#/' + route; },route);
      await page.waitForFunction(route => location.hash === '#/' + route,route);
    };
    const switchTo = async name => {
      if (await role('สลับบทบาท').isVisible()) await click('สลับบทบาท');
      await click(name);
      await role('สลับบทบาท').waitFor();
    };
    const row = name => page.getByRole('row').filter({hasText:name}).first();
    const open = async (name, link) => row(name).getByRole('link',{name:link}).click();
    const rowButton = async (name, button) => row(name).getByRole('button',{name:button,exact:true}).click();

    const response = await page.goto(url);
    assert.equal(response.status(),200);
    assert.equal(await page.title(), 'Salaya Two Resident');
    assert.equal(await page.locator('meta[property="og:title"]').getAttribute('content'), 'Salaya Two Resident');
    await has('Salaya Two Resident',page.locator('.landing-top'));
    await has('เลือกบทบาทเพื่อเริ่มเดโม');
    const photo = page.getByRole('img',{name:'อาคารพักอาศัยคอนกรีตสีเทา มองจากมุมเงย'});
    assert.ok(await photo.isVisible(),'the landing photo should be visible');
    assert.equal(await photo.evaluate(img => img.decode().then(() => img.naturalWidth > 0)),true,'the local photo should load');
    if (width === 1440) {
      const legacy = seed();
      legacy.version = 1;
      legacy.residents[0].name = 'พิมพ์ชนก วงศ์ดี';
      legacy.users[0].name = 'กมล วัฒนกุล';
      await page.evaluate(data => localStorage.setItem('baanruam-demo-v1',JSON.stringify(data)),legacy);
      await page.reload();
    }
    if (process.env.DEMO_SCREENSHOT) {
      const suffix = width === 1440 ? '-landing.png' : '-mobile.png';
      await page.screenshot({path:process.env.DEMO_SCREENSHOT + suffix,fullPage:true});
    }
    await click('เข้าสู่ระบบ');
    await fill('username','resident');
    await fill('password','bad-password');
    await submit('เข้าสู่ระบบ');
    await has('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',modal);
    await modal.getByRole('button',{name:'ยกเลิก'}).click();
    await click('ลงทะเบียนผู้พักอาศัย');
    await fill('username','new.demo'); await fill('password','demo123');
    await fill('name',registrationExample.name); await fill('phone',registrationExample.phone); await choose('unit',registrationExample.unit);
    await submit('สร้างบัญชีเดโม'); await has('สวัสดี คุณมาร์ก');

    await switchTo('ผู้พักอาศัย');
    await has('สวัสดี คุณเจนเซน');
    if (width === 390) {
      await click('เมนู');
      await page.getByRole('navigation',{name:'เมนูหลัก'}).getByRole('link',{name:'สัญญาเช่า'}).click();
    } else await go('leases');
    await click('ขอต่อสัญญา'); await fill('end',day(100)); await submit();
    await has('รอพิจารณา');
    await switchTo('นิติบุคคล');
    await has('สวัสดี คุณลิซา');
    if (width === 1440 && process.env.DEMO_SCREENSHOT) await page.screenshot({path:process.env.DEMO_SCREENSHOT + '-dashboard.png'});
    await go('leases'); await click('พิจารณา'); await choose('decision','approved'); await submit();
    await has('อนุมัติ');
    await switchTo('ผู้พักอาศัย'); await go('leases');
    await has('อนุมัติ'); await has(dateLabel(day(100)),row('L1'));
    await click('ขอต่อสัญญา'); await fill('end',day(150)); await submit();
    await has('รอพิจารณา');
    await switchTo('นิติบุคคล'); await go('leases'); await click('พิจารณา'); await choose('decision','rejected'); await submit();
    await switchTo('ผู้พักอาศัย'); await go('leases'); await has('ปฏิเสธ'); await has(dateLabel(day(100)),row('L1'));
    await go('profile'); await click('แก้ไขโปรไฟล์'); await fill('name','เจนเซน ทดสอบ'); await submit(); await has('เจนเซน ทดสอบ');

    await go('repairs'); await click('แจ้งซ่อม'); await choose('location','F1'); await fill('title','ไฟห้องออกกำลังกายดับ');
    await fill('detail','เปิดสวิตช์แล้วไฟไม่ติด'); await choose('attachment','sample'); await submit(); await has('รูปประกอบตัวอย่าง');
    const repairRoute = await page.evaluate(() => location.hash.slice(2));
    await switchTo('นิติบุคคล'); await go(repairRoute); await click('มอบหมายงาน'); await choose('tech','T1'); await submit(); await has('มอบหมายแล้ว');
    await click('สลับบทบาท'); await submit('เข้าสู่ระบบด้วยบัญชีอื่น');
    await fill('username','tech2'); await fill('password','demo123'); await submit('เข้าสู่ระบบ');
    await go(repairRoute); await has('ไม่พบงานซ่อมที่บัญชีนี้เปิดได้');
    await switchTo('ช่างซ่อม'); await go(repairRoute);
    await click('อัปเดตความคืบหน้า'); await choose('status','working'); await fill('note','ตรวจสวิตช์'); await submit();
    await click('อัปเดตความคืบหน้า'); await choose('status','done'); await fill('note','เปลี่ยนหลอดไฟ'); await submit(); await has('เสร็จแล้ว');
    await click('ปรับสถานะส่วนกลาง'); await choose('status','open'); await submit();
    await switchTo('ผู้พักอาศัย'); await go(repairRoute); await has('เปลี่ยนหลอดไฟ');

    await go('booking'); await page.locator('.facility-card').filter({hasText:'ห้องประชุม'}).getByRole('button').click();
    await submit('ตรวจช่วงว่าง'); await has('ช่วงเวลานี้ถูกจองแล้ว',modal);
    await fill('from',day(1) + 'T11:00'); await fill('to',day(1) + 'T12:00');
    await submit('ตรวจช่วงว่าง'); await has('ช่วงเวลานี้ว่าง',modal);
    await submit('ยืนยันการจอง'); await has('จองแล้ว'); await page.reload(); await has('จองแล้ว');

    await switchTo('นิติบุคคล'); await go('finance'); await click('ออกใบแจ้งหนี้'); await choose('lease','L1');
    await fill('item','ค่าทดสอบ 1200'); await fill('amount','1200'); await submit(); await has('ค่าทดสอบ 1200');
    const billRoute = await page.evaluate(() => location.hash.slice(2));
    await switchTo('ผู้พักอาศัย'); await go(billRoute);
    await click('ส่งหลักฐานการชำระเงิน'); await submit(); await has('รอตรวจ');
    await switchTo('นิติบุคคล'); await go(billRoute); await click('ดูสลิป'); await has('สลิปตัวอย่าง',modal); await submit('ปิด');
    await click('ตรวจหลักฐาน'); await choose('decision','rejected'); await fill('note','ยอดโอนไม่ตรง'); await submit(); await has('ไม่ผ่าน');
    assert.equal(await role('ออกใบเสร็จ').count(),0);
    await switchTo('ผู้พักอาศัย'); await go(billRoute); await has('ยอดโอนไม่ตรง'); await click('ส่งหลักฐานการชำระเงิน'); await submit();
    await switchTo('นิติบุคคล'); await go(billRoute); await click('ตรวจหลักฐาน'); await choose('decision','approved'); await submit();
    await click('ออกใบเสร็จ'); await submit('ยืนยัน');
    await switchTo('ผู้พักอาศัย'); await go(billRoute); await has('ชำระครบ'); await click('ดูใบเสร็จ'); await has('เอกสารตัวอย่าง',modal); await submit('ปิด');

    await switchTo('นิติบุคคล'); await go('accounts'); await rowButton('resident2','แก้สิทธิ์');
    await choose('status','disabled'); await submit(); await has('ระงับ',row('resident2'));
    await go('units'); await click('เพิ่มห้อง'); await fill('building','C'); await fill('floor','2'); await fill('number','C-201'); await submit(); await has('C-201');
    await rowButton('C-201','แก้ไข'); await choose('status','closed'); await submit(); await has('ปิดใช้งาน',row('C-201'));
    await rowButton('C-201','ลบ'); await submit('ยืนยัน'); await row('C-201').waitFor({state:'hidden'});
    await go('residents'); await click('เพิ่มผู้พัก'); await fill('name','ผู้พักเพิ่มทดสอบ'); await fill('phone','0800000020'); await submit();
    await rowButton('ผู้พักเพิ่มทดสอบ','แก้ไข'); await fill('phone','0800000021'); await submit(); await has('0800000021',row('ผู้พักเพิ่มทดสอบ'));
    await rowButton('ผู้พักเพิ่มทดสอบ','ลบ'); await submit('ยืนยัน'); await row('ผู้พักเพิ่มทดสอบ').waitFor({state:'hidden'});
    await has('เจนเซน ทดสอบ');
    await click('บันทึกย้ายเข้า–ออก'); await choose('resident','R1'); await choose('lease','L1'); await choose('direction','out'); await submit(); await has('ย้ายออก');
    await click('บันทึกย้ายเข้า–ออก'); await choose('resident','R1'); await choose('lease','L1'); await choose('direction','in'); await submit(); await has('A-804',row('เจนเซน ทดสอบ'));
    await go('leases'); await click('สร้างสัญญา'); await choose('resident','R3'); await choose('unit','RM3'); await fill('rent','7700'); await submit();
    const newLease = row(registrationExample.name);
    await newLease.getByRole('button',{name:'แก้ไข',exact:true}).click(); await fill('rent','8800'); await submit();
    await has('8,800',newLease);
    await newLease.getByRole('button',{name:'สิ้นสุดสัญญา',exact:true}).click(); await submit('ยืนยัน'); await has('สิ้นสุด',newLease);

    await go('reception'); await click('บันทึกผู้มาติดต่อ'); await fill('name','ผู้เยี่ยมทดสอบ'); await choose('unit','RM1'); await fill('purpose','เยี่ยม'); await submit();
    await rowButton('ผู้เยี่ยมทดสอบ','บันทึกออก'); await submit();
    await click('บันทึกพัสดุรับเข้า'); await choose('resident','R1'); await fill('carrier','ขนส่งทดสอบ'); await fill('tracking','TEST-084'); await submit();
    await switchTo('ผู้พักอาศัย'); await has('มีพัสดุรอรับ'); await go('reception'); await has('TEST-084');
    await switchTo('นิติบุคคล'); await go('reception'); await rowButton('TEST-084','ส่งมอบ'); await submit('ยืนยัน'); await has('ส่งมอบแล้ว',row('TEST-084'));
    await go('announcements'); await click('สร้างประกาศ'); await fill('title','ประกาศทดสอบ'); await fill('detail','เนื้อหาสำหรับเดโม'); await choose('status','published'); await submit();
    await switchTo('ผู้พักอาศัย'); await go('announcements'); await has('ประกาศทดสอบ');
    await switchTo('นิติบุคคล');
    for (const [key,label] of [['units','ห้องชุด'],['residents','ประวัติผู้พัก'],['leases','สัญญาเช่า'],['finance','การเงิน'],['repairs','งานซ่อม']]) {
      await go('reports/' + key); await has('รายงาน' + label);
    }
    await page.locator('[name="report-start"]').fill(day(10)); await click('ใช้ช่วงวันที่'); await has('ไม่มีรายการในช่วงวันที่ที่เลือก');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false,'page should fit viewport');
    if (width === 390) await click('เมนู');
    await click('คืนค่าข้อมูลเดโม'); await submit('คืนค่าข้อมูล'); await has('เลือกบทบาทเพื่อเริ่มเดโม');
    await switchTo('ผู้พักอาศัย'); await go('booking'); await has('ยังไม่มีรายการจอง');
    assert.deepEqual(errors,[]);
    console.log(width + 'px: lease, repair, payment happy/unhappy paths and 30-function workflow checks passed');
    await page.close();
  }
} finally {
  await browser?.close();
  server.close();
}
