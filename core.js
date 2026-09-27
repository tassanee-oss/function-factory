// สร้างอัตโนมัติจาก WebApp/Code.gs · ฟังก์ชันของแผงครู (ไม่มีเฉลย)
var ROLES = [{"id":"data","ic":"📦","name":"ผู้ออกแบบข้อมูล"},{"id":"random","ic":"🎲","name":"Random"},{"id":"check","ic":"✔️","name":"CheckAnswer"},{"id":"end","ic":"🏁","name":"EndGame"}];
var EXTEND = [{"id":"ก","title":"เกมสุ่มเพียง 5 ข้อจาก 10 ข้อ","hint":"ต้องแก้ชิ้นส่วนใด และเพิ่มอะไร จึงจบเกมเมื่อครบ 5 ข้อ"},{"id":"ข","title":"ป้องกันการกดปุ่มซ้ำ","hint":"ถ้าเพิ่ม Wait 0.4 วินาทีให้เห็นผลถูก/ผิดก่อนขึ้นข้อใหม่ แล้วผู้เล่นกดปุ่มซ้ำระหว่างรอ คะแนนอาจเพิ่มเกิน จะแก้ที่ ✔️ อย่างไร"},{"id":"ค","title":"เปลี่ยนเป็นเกมทายคำศัพท์","hint":"ใช้โครงสร้าง Array และ Function เดิม ต้องเปลี่ยนส่วนใด และส่วนใดใช้ได้เหมือนเดิม เพราะอะไร"}];
var FFDB = {}, FFPUB = null, FFSS = null;
function rows_(n) { return FFDB[n] || []; }
function config_() { var o = {}; rows_('Config').forEach(function (r) { o[r.key] = String(r.value); }); return o; }
function publicState_() { return FFPUB; }
function auth_() { }
function flagOf_(s) { try { return JSON.parse(s || '[]'); } catch (e) { return []; } }
function ss_() { return FFSS || { getUrl: function () { return ''; } }; }
function testKey_() { return FFDB.Key || []; }
function parsonsKey_() { return FFDB.PKey || {}; }
function ansOf_(t) { if (!t) return []; try { return JSON.parse(t.raw || '[]'); } catch (e) { return []; } }
function ngain_(pre, post) { if (pre === '' || post === '' || pre === null || post === null) return null; pre = Number(pre); post = Number(post); if (pre >= 10) return null; return Math.round((post - pre) / (10 - pre) * 100) / 100; }
function uniq_(a) { var o = {}; a.forEach(function (x) { o[x] = 1; }); return Object.keys(o); }
function getTeacherState(pin) {
  auth_(pin);
  var pub = publicState_();
  var roster = rows_('Roster'), students = rows_('Students'), tests = rows_('Tests'), parsons = rows_('Parsons'), handoff = rows_('Handoff'), rub = rows_('Rubric'), refl = rows_('Reflect'), cloud = rows_('Cloud');
  var goals = rows_('Goals'), support = rows_('Support'), inquiry = rows_('Inquiry');
  var by = function (arr, no) { return arr.filter(function (x) { return Number(x.no) === Number(no); }); };
  var people = roster.map(function (r) {
    var s = by(students, r.no)[0] || {}, pre = by(tests, r.no).filter(function (t) { return t.kind === 'pre'; })[0], post = by(tests, r.no).filter(function (t) { return t.kind === 'post'; })[0];
    var p = by(parsons, r.no)[0], h = by(handoff, r.no)[0], ru = by(rub, r.no)[0] || {};
    return {
      no: Number(r.no), name: String(r.name), group: s.group || '', role: s.role || '',
      pre: pre ? Number(pre.score) : '', post: post ? Number(post.score) : '', gain: pre && post ? ngain_(pre.score, post.score) : '',
      words: by(cloud, r.no).map(function (c) { return c.word; }).join(' · '),
      parsons: p ? { attempts: Number(p.attempts), first: Number(p.firstScore), passed: String(p.passed) === 'true', challenge: p.challenge } : null,
      handoff: h ? { a: [h.a1, h.a2, h.a3, h.a4, h.a5], score: h.teacherScore, marks: h.marks || '' } : null,
      r1: [ru.r1a, ru.r1b, ru.r1c, ru.r1d], r3: [ru.r3a, ru.r3b, ru.r3c, ru.r3d], piece: ru.piece === undefined ? '' : ru.piece, pieceMarks: ru.pieceMarks || '', r5: [ru.r5a, ru.r5b, ru.r5c, ru.r5d], c: [ru.c1, ru.c2, ru.c3],
      reflect: by(refl, r.no)[0] ? (function (x) { return { prior: x.prior, now: x.now, rule: x.rule, why: x.why, self: [x.r1, x.r2, x.r3], conf: x.conf, goalMet: x.goalMet, goalWhy: x.goalWhy, goalNext: x.goalNext, inqTopic: x.inqTopic }; })(by(refl, r.no)[0]) : null,
      goal: by(goals, r.no)[0] ? (function (g) { return { target: Number(g.target), focus: g.focus, note: g.note }; })(by(goals, r.no)[0]) : null,
      flag: pre ? flagOf_(pre.answers) : [],
      support: by(support, r.no)[0] ? (function (s) { return { given: String(s.given) === 'true', done: String(s.reviewDone) === 'true', score: s.reviewScore, total: s.reviewTotal }; })(by(support, r.no)[0]) : null,
      inquiry: by(inquiry, r.no)[0] ? (function (q) { return { topic: q.topic, summary: q.summary, source: q.source }; })(by(inquiry, r.no)[0]) : null,
      preAns: ansOf_(pre), postAns: ansOf_(post),
      rule: (function (x) { return x ? { team: x.team, text: x.text } : null; })(by(rows_('Rules'), r.no)[0]),
      peerGiven: (function (x) { return x ? { to: x.toGroup, s: [x.s1, x.s2, x.s3, x.s4], like: x.like, suggest: x.suggest } : null; })(by(rows_('Peer'), r.no)[0])
    };
  });
  // เสนอเพื่อนคู่ให้ผู้ถูกติดธง: บทบาทเดียวกัน ไม่ติดธง ผลก่อนเรียนสูงสุด และยังไม่ได้คู่
  var taken = {};
  people.filter(function (p) { return p.flag.length; }).forEach(function (p) {
    var cand = people.filter(function (q) { return q.role && q.role === p.role && !q.flag.length && q.pre !== '' && !taken[q.no]; }).sort(function (a, b) { return b.pre - a.pre; })[0];
    if (cand) { taken[cand.no] = 1; p.buddy = cand.no + ' ' + cand.name; } else p.buddy = '';
  });
  var peer = rows_('Peer'), grub = rows_('GroupRubric'), extend = rows_('Extend'), build = rows_('Build');
  var groups = [1, 2, 3, 4, 5, 6, 7, 8].map(function (g) {
    var ps = peer.filter(function (p) { return Number(p.toGroup) === g; });
    var peerAvg = ps.length ? Math.round(ps.reduce(function (a, p) { return a + Number(p.s1) + Number(p.s2) + Number(p.s3) + Number(p.s4); }, 0) / ps.length * 10) / 10 : '';
    var gr = grub.filter(function (x) { return Number(x.group) === g; })[0] || {};
    var ex = extend.filter(function (x) { return Number(x.group) === g; })[0];
    var bd = build.filter(function (x) { return Number(x.group) === g; })[0];
    return { group: g, members: people.filter(function (p) { return Number(p.group) === g; }).map(function (p) { return p.no + ' ' + p.role; }), build: pub.build[g] || { checks: [], sos: false },
      peerAvg: peerAvg, peerComments: ps.map(function (p) { return { like: p.like, suggest: p.suggest }; }), rub: [gr.a, gr.b, gr.c, gr.d], x: [gr.x1, gr.x2, gr.x3, gr.x4], peerScores: ps.map(function (p) { return Number(p.s1) + Number(p.s2) + Number(p.s3) + Number(p.s4); }),
      extend: ex ? { choice: ex.choice, mode: ex.mode, text: ex.text } : null, sosCount: bd ? Number(bd.sosCount) || 0 : 0,
      bugs: rows_('Bugs').filter(function (b) { return Number(b.group) === g; }).map(function (b) { return { symptom: b.symptom, fix: b.fix, rule: b.rule, name: b.name }; }) };
  });
  // คะแนนกลุ่ม (Rubric 2 และคะแนนจากเพื่อน) บันทึกให้สมาชิกทุกคน แล้วสรุปผลตามเกณฑ์ผ่านในแผน ข้อ 6.3
  var sumv = function (a) { var v = a.filter(function (x) { return x !== '' && x !== undefined && x !== null; }); return v.length === a.length ? v.reduce(function (x, y) { return x + Number(y); }, 0) : ''; };
  people.forEach(function (p) {
    var g = groups.filter(function (x) { return x.group === Number(p.group); })[0];
    p.r2 = g ? sumv(g.rub) : ''; p.peer = g ? g.peerAvg : '';
    var parts = [['Post ≥ 8', p.post, 8], ['ชิ้นส่วน ≥ 4', p.piece, 4], ['R1 ≥ 10', sumv(p.r1), 10], ['R2 ≥ 10', p.r2, 10], ['เพื่อน ≥ 10', p.peer, 10], ['R3 ≥ 10', sumv(p.r3), 10], ['R5 ≥ 10', sumv(p.r5), 10], ['C ≥ 7', sumv(p.c), 7]];
    var missing = parts.filter(function (x) { return x[1] === '' || x[1] === undefined || x[1] === null; });
    var low = parts.filter(function (x) { return !(x[1] === '' || x[1] === undefined || x[1] === null) && Number(x[1]) < x[2]; }).map(function (x) { return x[0]; });
    p.result = low.length ? 'ไม่ผ่าน (' + low.join(', ') + ')' : (missing.length ? '' : 'ผ่าน');
  });
  // บัดดี้หลังเรียน: ผู้ที่ได้ต่ำกว่า 8/10 จับคู่เพื่อนบทบาทเดียวกันที่ได้ 8 ขึ้นไป
  var taken2 = {};
  people.filter(function (p) { return p.post !== '' && p.post < 8; }).forEach(function (p) {
    var cand = people.filter(function (q) { return q.role === p.role && q.post !== '' && q.post >= 8 && !taken2[q.no]; }).sort(function (a, b) { return b.post - a.post; })[0]
      || people.filter(function (q) { return q.post !== '' && q.post >= 8 && !taken2[q.no]; }).sort(function (a, b) { return b.post - a.post; })[0];
    if (cand) { taken2[cand.no] = 1; p.postBuddy = cand.no + ' ' + cand.name; } else p.postBuddy = '';
  });
  return { pub: pub, people: people, groups: groups, key: testKey_(), pkey: parsonsKey_(), metrics: metrics_(people, groups), metrics81: metrics81_(people, groups, pub), cfg: { phase: config_().phase, reveal: config_().reveal }, sheetUrl: ss_().getUrl() };
}
function metrics_(people, groups) {
  var n = function (f) { return people.filter(f).length; };
  var post = people.filter(function (p) { return p.post !== ''; });
  var flagged = people.filter(function (p) { return p.flag.length; });
  var bugStat = {}; rows_('Bugs').forEach(function (b) { bugStat[b.rule] = (bugStat[b.rule] || 0) + 1; });
  var topBug = Object.keys(bugStat).sort(function (a, b) { return bugStat[b] - bugStat[a]; })[0] || '';
  var ext = groups.filter(function (g) { return g.extend; });
  var byChoice = {}; EXTEND.forEach(function (e) { byChoice[e.id] = ext.filter(function (g) { return g.extend.choice === e.id; }).length; });
  var goalsPost = people.filter(function (p) { return p.goal && p.post !== ''; });
  return [
    { k: '1. เข้าถึงและเข้าใจบทเรียน', v: 'ผ่านแบบทดสอบหลังเรียน (≥8) ' + n(function (p) { return p.post !== '' && p.post >= 8; }) + '/' + post.length + ' คน · เกมผ่านเช็กลิสต์ครบ 5 ข้อ ' + groups.filter(function (g) { return g.build.checks.filter(Boolean).length === 5; }).length + '/8 กลุ่ม' },
    { k: '2. เชื่อมโยงความรู้เดิม', v: 'ติดธง ' + flagged.length + ' คน · ได้รับการ์ดทบทวน ' + flagged.filter(function (p) { return p.support && p.support.given; }).length + ' คน · ทบทวนดิจิทัลแล้ว ' + flagged.filter(function (p) { return p.support && p.support.done; }).length + ' คน · ผ่านหลังเรียน ' + flagged.filter(function (p) { return p.post !== '' && p.post >= 8; }).length + '/' + flagged.filter(function (p) { return p.post !== ''; }).length + ' คน' },
    { k: '3. สร้างความรู้เอง', v: 'เขียนชิ้นส่วนเองระดับ 3 (Rubric 1 ข้อ 1) ' + n(function (p) { return Number(p.r1[0]) === 3; }) + ' คน · กฎทองที่ทีมส่ง ' + rows_('Rules').length + '/8 ทีม' },
    { k: '4. แรงจูงใจ', v: 'ส่งคำตอบ Word Cloud ' + uniq_(rows_('Cloud').map(function (r) { return r.no; })).length + ' คน · ตอบโจทย์ท้าทาย Parsons ' + n(function (p) { return p.parsons && String(p.parsons.challenge || '').trim(); }) + ' คน' },
    { k: '5. พัฒนาทักษะ', v: 'ทำภารกิจต่อยอด ' + ext.length + '/8 กลุ่ม (ทำจริง ' + ext.filter(function (g) { return g.extend.mode === 'code'; }).length + ' · เขียนแผน ' + ext.filter(function (g) { return g.extend.mode === 'plan'; }).length + ') · ' + EXTEND.map(function (e) { return e.id + ' ' + byChoice[e.id]; }).join(' · ') },
    { k: '6. ข้อมูลสะท้อนกลับ', v: 'กด SOS ' + groups.reduce(function (a, g) { return a + g.sosCount; }, 0) + ' ครั้ง · บันทึกบั๊ก ' + rows_('Bugs').length + ' รายการ' + (topBug ? ' · บั๊กมากที่สุด: กฎทอง ' + topBug + ' (' + bugStat[topBug] + ' ครั้ง)' : '') },
    { k: '7. บรรยากาศชั้นเรียน', v: 'ความเห็น “ชอบ…” จากเพื่อน ' + rows_('Peer').filter(function (p) { return String(p.like || '').trim(); }).length + ' รายการ · ประเมินตนเอง “ช่วยเหลือกลุ่ม” ระดับ 3 ' + n(function (p) { return p.reflect && Number(p.reflect.self[2]) === 3; }) + ' คน' },
    { k: '8. กำกับการเรียนรู้เอง', v: 'ตั้งเป้าหมาย ' + n(function (p) { return p.goal; }) + ' คน · ถึงเป้า ' + goalsPost.filter(function (p) { return p.post >= p.goal.target; }).length + '/' + goalsPost.length + ' คน · ส่งภารกิจค้นคว้า ' + n(function (p) { return p.inquiry; }) + ' คน' }
  ];
}
function metrics81_(people, groups, pub) {
  var num = function (v) { return v !== '' && v !== undefined && v !== null; };
  var sum = function (a) { return a.filter(num).length === a.length ? a.reduce(function (x, y) { return x + Number(y); }, 0) : null; };
  var pct = function (a, b) { return b ? Math.round(a / b * 1000) / 10 : ''; };
  var post = people.filter(function (p) { return num(p.post); });
  var k = post.filter(function (p) { return p.post >= 8; }).length;
  var gains = people.filter(function (p) { return num(p.gain) && p.gain !== null; });
  var g30 = gains.filter(function (p) { return p.gain >= 0.3; }).length;
  var pi = people.filter(function (p) { return num(p.piece) || sum(p.r1) !== null; });
  var piOk = pi.filter(function (p) { return Number(p.piece) >= 4 && sum(p.r1) >= 10; }).length;
  var gr = groups.filter(function (g) { return sum(g.rub) !== null || num(g.peerAvg); });
  var grOk = gr.filter(function (g) { return sum(g.rub) >= 10 && Number(g.peerAvg) >= 10; }).length;
  var a = people.filter(function (p) { return sum(p.r3) !== null; });
  var aOk = a.filter(function (p) { return sum(p.r3) >= 10; }).length;
  return [
    { k: 'ความรู้ (K) – แบบทดสอบหลังเรียน (≥ 8/10)', n: k + ' / ' + post.length + ' คน', p: pct(k, post.length) },
    { k: 'พัฒนาการ (K) – N-gain เฉลี่ยของห้อง ' + (pub.gainAvg === null ? '–' : pub.gainAvg) + ' · ระดับปานกลางขึ้นไป (≥ 0.30)', n: g30 + ' / ' + gains.length + ' คน', p: pct(g30, gains.length) },
    { k: 'ทักษะกระบวนการ (P) รายบุคคล – เช็กลิสต์ชิ้นส่วน (≥ 4/5) + Rubric 1 (≥ 10/12)', n: piOk + ' / ' + pi.length + ' คน', p: pct(piOk, pi.length) },
    { k: 'ทักษะกระบวนการ (P) รายกลุ่ม – Rubric 2 + ประเมินเพื่อน (≥ 10/12)', n: grOk + ' / ' + gr.length + ' กลุ่ม', p: pct(grOk, gr.length) },
    { k: 'คุณลักษณะ (A) – Rubric 3 (≥ 10/12)', n: aOk + ' / ' + a.length + ' คน', p: pct(aOk, a.length) }
  ];
}
function timeRows_(pub) {
  var T = pub.timer || { min: {}, log: [], now: Date.now(), budget: 55 }, used = {};
  (T.log || []).forEach(function (x) { used[x.p] = (used[x.p] || 0) + ((x.e || T.now) - x.s); });
  var r1 = function (v) { return Math.round(v * 10) / 10; }, sp = 0, su = 0;
  var rows = PHASES.filter(function (p) { return T.min[p.id] !== undefined; }).map(function (p) {
    var plan = Number(T.min[p.id]) || 0, u = used[p.id] ? used[p.id] / 60000 : 0; sp += plan; su += u;
    return [p.label, plan, used[p.id] ? r1(u) : '', used[p.id] ? r1(u - plan) : ''];
  });
  rows.push(['รวม (กรอบ ' + T.budget + ' นาที)', sp, r1(su), r1(su - sp)]);
  return rows;
}
var PHASES = [{"id":"wait","label":"รอเริ่มกิจกรรม","step":0},{"id":"pretest","label":"1.1 แบบทดสอบก่อนเรียน","step":1},{"id":"cloud","label":"1.2 Word Cloud เบื้องหลังเกม","step":1},{"id":"parsons","label":"2.3 เรียงบล็อกคำสั่ง (Parsons)","step":2},{"id":"handoff","label":"2.4 บัตรส่งต่องาน","step":2},{"id":"rules","label":"2.5 สรุปกฎทอง","step":2},{"id":"build","label":"3 ประกอบเกม · ทดสอบ · บันทึกบั๊ก","step":3},{"id":"peer","label":"4 เจ้าบ้าน–แขก · ประเมินเพื่อน","step":4},{"id":"posttest","label":"5.1 แบบทดสอบหลังเรียน","step":5},{"id":"reflect","label":"5.2 สะท้อนตนเอง","step":5},{"id":"after","label":"หลังคาบ · ภารกิจค้นคว้าต่อยอด","step":5}];
function buildEvidence() {
  var st = getTeacherState(config_().teacherPin);
  var name = 'หลักฐานรายบุคคล', s = ss_().getSheetByName(name); if (s) ss_().deleteSheet(s); s = ss_().insertSheet(name);
  var head = ['เลขที่', 'ชื่อ-สกุล', 'กลุ่ม', 'บทบาท', 'Pre /10', 'Post /10', 'N-gain', 'ผล K (≥8)', 'เช็กลิสต์ชิ้นส่วน /5', 'Rubric 2 /12 (กลุ่ม)', 'เพื่อน /12 (กลุ่ม)', 'ผลรวม (เกณฑ์ข้อ 6.3)', 'บัดดี้หลังเรียน', 'เป้าหมาย /10', 'เรื่องที่ตั้งใจเข้าใจ', 'ถึงเป้า', 'ติดธง (ข้อ)', 'ได้การ์ดทบทวน', 'ทบทวนดิจิทัล', 'Parsons ครั้งแรก %', 'จำนวนครั้ง', 'Parsons ผ่าน', 'บัตรส่งต่องาน /5', 'Rubric 1 /12', 'Rubric 3 /12', 'Rubric 5 /12', 'สมรรถนะ C /9', 'Word Cloud (ความรู้เดิม)', 'สัปดาห์ก่อนฉันรู้ว่า', 'วันนี้ฉันต่อยอดได้ว่า', 'ความมั่นใจ', 'สะท้อนเป้าหมาย (เพราะ)', 'ครั้งหน้าฉันจะ', 'หัวข้อค้นคว้า', 'สรุปการค้นคว้า', 'แหล่งที่มา'];
  var sum = function (a) { var v = a.filter(function (x) { return x !== '' && x !== undefined; }); return v.length ? v.reduce(function (x, y) { return x + Number(y); }, 0) : ''; };
  var roleName = {}; ROLES.forEach(function (r) { roleName[r.id] = r.ic + ' ' + r.name; });
  var data = st.people.map(function (p) {
    var g = p.goal, sp = p.support, rf = p.reflect, iq = p.inquiry;
    return [p.no, p.name, p.group, roleName[p.role] || '', p.pre, p.post, p.gain === null ? '' : p.gain, p.post === '' ? '' : (p.post >= 8 ? 'ผ่าน' : 'ไม่ผ่าน'), p.piece, p.r2, p.peer, p.result, p.postBuddy || '',
      g ? g.target : '', g ? g.focus : '', g && p.post !== '' ? (p.post >= g.target ? 'ถึงเป้า' : 'ยังไม่ถึง') : '', p.flag.join(','), sp ? (sp.given ? 'ได้รับ' : '') : '', sp && sp.done ? sp.score + '/' + sp.total : '',
      p.parsons ? p.parsons.first : '', p.parsons ? p.parsons.attempts : '', p.parsons ? (p.parsons.passed ? 'ผ่าน' : '') : '', p.handoff ? p.handoff.score : '', sum(p.r1), sum(p.r3), sum(p.r5), sum(p.c), p.words,
      rf ? rf.prior : '', rf ? rf.now : '', rf ? rf.conf : '', rf ? rf.goalWhy || '' : '', rf ? rf.goalNext || '' : '', iq ? iq.topic : (rf ? rf.inqTopic || '' : ''), iq ? iq.summary : '', iq ? iq.source : ''];
  });
  s.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#d9e8f5');
  if (data.length) s.getRange(2, 1, data.length, head.length).setValues(data);
  s.setFrozenRows(1);
  var gname = 'หลักฐานรายกลุ่ม', g = ss_().getSheetByName(gname); if (g) ss_().deleteSheet(g); g = ss_().insertSheet(gname);
  var gh = ['กลุ่ม', 'สมาชิก', 'เช็กลิสต์ทดสอบเกม /5', 'Rubric 2 /12', 'ประเมินเพื่อน /12', 'บั๊กที่บันทึก', 'คำชมจากเพื่อน', 'ข้อเสนอแนะจากเพื่อน', 'SOS (ครั้ง)', 'ภารกิจต่อยอด', 'ทำจริง/เขียนแผน', 'รายละเอียดภารกิจต่อยอด'];
  var bugs = rows_('Bugs');
  var gd = st.groups.map(function (x) { return [x.group, x.members.join(', '), x.build.checks.filter(Boolean).length, sum(x.rub), x.peerAvg, bugs.filter(function (b) { return Number(b.group) === x.group; }).map(function (b) { return b.symptom + ' → ' + b.fix + ' (' + b.rule + ')'; }).join('\n'), x.peerComments.map(function (c) { return c.like; }).join('\n'), x.peerComments.map(function (c) { return c.suggest; }).join('\n'),
    x.sosCount, x.extend ? x.extend.choice : '', x.extend ? (x.extend.mode === 'code' ? 'ทำจริงในเกม' : 'เขียนแผน') : '', x.extend ? x.extend.text : '']; });
  g.getRange(1, 1, 1, gh.length).setValues([gh]).setFontWeight('bold').setBackground('#d9e8f5');
  g.getRange(2, 1, gd.length, gh.length).setValues(gd);
  g.setFrozenRows(1);
  var kname = 'สรุปตาราง 8.1', kk = ss_().getSheetByName(kname); if (kk) ss_().deleteSheet(kk); kk = ss_().insertSheet(kname);
  kk.getRange(1, 1, 1, 3).setValues([['ด้าน', 'จำนวนผู้ผ่านเกณฑ์', 'ร้อยละ']]).setFontWeight('bold').setBackground('#d9e8f5');
  kk.getRange(2, 1, st.metrics81.length, 3).setValues(st.metrics81.map(function (x) { return [x.k, x.n, x.p]; }));
  kk.setFrozenRows(1);
  var tname = 'เวลาแต่ละขั้น', tt = ss_().getSheetByName(tname); if (tt) ss_().deleteSheet(tt); tt = ss_().insertSheet(tname);
  var tr = timeRows_(st.pub);
  tt.getRange(1, 1, 1, 4).setValues([['ขั้น', 'แผน (นาที)', 'ใช้จริง (นาที)', 'ต่าง (นาที)']]).setFontWeight('bold').setBackground('#d9e8f5');
  tt.getRange(2, 1, tr.length, 4).setValues(tr);
  tt.setFrozenRows(1);
  var mname = 'สรุปตาราง 8.2', m = ss_().getSheetByName(mname); if (m) ss_().deleteSheet(m); m = ss_().insertSheet(mname);
  m.getRange(1, 1, 1, 2).setValues([['ตัวชี้วัด', 'ผลที่เกิดกับผู้เรียน (นำไปกรอกตาราง 8.2 ในแผน)']]).setFontWeight('bold').setBackground('#d9e8f5');
  m.getRange(2, 1, st.metrics.length, 2).setValues(st.metrics.map(function (x) { return [x.k, x.v]; }));
  m.setFrozenRows(1);
  return { url: ss_().getUrl(), gid: s.getSheetId(), ggid: g.getSheetId(), mgid: m.getSheetId() };
}
function ffTeacherState(snap) { FFDB = snap.tables; FFPUB = snap.pub; return getTeacherState(""); }
// สเปรดชีตจำลองให้ buildEvidence() ของเดิมเขียนลง แล้วแปลงเป็นไฟล์ Excel ด้วย SheetJS
function ffFakeSS() {
  var ss = { _sheets: {}, _order: [], getUrl: function () { return ''; },
    getSheetByName: function (n) { return this._sheets[n] || null; },
    deleteSheet: function (s) { delete this._sheets[s._name]; },
    insertSheet: function (n) {
      var sh = { _name: n, _data: [], setFrozenRows: function () { }, getSheetId: function () { return 0; },
        getRange: function (r, c) {
          var d = sh._data;
          return { setValues: function (v) { v.forEach(function (row, i) { while (d.length < r + i) d.push([]); row.forEach(function (x, j) { d[r - 1 + i][c - 1 + j] = x; }); }); return this; },
            setFontWeight: function () { return this; }, setBackground: function () { return this; } };
        } };
      this._sheets[n] = sh; if (this._order.indexOf(n) < 0) this._order.push(n);
      return sh;
    } };
  return ss;
}
var FF_TABLE_TH = { Roster: 'รายชื่อ', Students: 'กลุ่ม-บทบาท', Tests: 'แบบทดสอบ', Goals: 'เป้าหมาย', Support: 'การ์ดทบทวน', Cloud: 'WordCloud', Parsons: 'Parsons', Handoff: 'บัตรส่งต่องาน',
  Rules: 'กฎทอง', Build: 'ประกอบเกม', Bugs: 'บันทึกบั๊ก', Extend: 'ภารกิจต่อยอด', Peer: 'ประเมินเพื่อน', Reflect: 'สะท้อนตนเอง', Inquiry: 'ภารกิจค้นคว้า', Rubric: 'Rubric1-3', GroupRubric: 'Rubric2' };
function ffExportExcel(pin) {
  return ffRpc('ff_teacher_snapshot', { p_pin: String(pin) }).then(function (snap) {
    FFDB = snap.tables; FFPUB = snap.pub; FFSS = ffFakeSS();
    try { buildEvidence(); } finally { var ss = FFSS; FFSS = null; }
    var wb = XLSX.utils.book_new();
    ss._order.forEach(function (n) { if (ss._sheets[n]) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ss._sheets[n]._data), n.slice(0, 31)); });
    // ข้อมูลดิบทุกตาราง (สำรองไว้เป็นหลักฐาน)
    Object.keys(FF_TABLE_TH).forEach(function (t) {
      var rows = FFDB[t] || []; if (!rows.length) return;
      var keys = Object.keys(rows[0]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([keys].concat(rows.map(function (r) { return keys.map(function (k) { var v = r[k]; return v !== null && typeof v === 'object' ? JSON.stringify(v) : v; }); }))), ('ดิบ_' + FF_TABLE_TH[t]).slice(0, 31));
    });
    var d = new Date(), pad = function (x) { return (x < 10 ? '0' : '') + x; };
    var name = 'หลักฐาน_แผน18_' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '_' + pad(d.getHours()) + pad(d.getMinutes()) + '.xlsx';
    XLSX.writeFile(wb, name);
    return name;
  });
}
