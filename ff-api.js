// Function Factory · ตัวเชื่อมหน้าเว็บกับ Supabase (แทน google.script.run ของเวอร์ชัน Google Apps Script)
// ต้องโหลดหลัง config.js, static.js และ supabase-js
var FF_BASE = location.origin + location.pathname.replace(/[^\/]*$/, '');
var FFSB = window.FF_LOCAL ? null : supabase.createClient(FF_URL, FF_KEY, { auth: { persistSession: false } });

function ffRpc(fn, args) {
  if (window.FF_LOCAL) return FF_LOCAL(fn, args || {});
  return FFSB.rpc(fn, args || {}).then(function (r) {
    if (r.error) throw new Error(r.error.message || String(r.error));
    return r.data;
  });
}
function ffNull(v) { return v === '' || v === undefined ? null : v; }

// รวมคำพ้องที่พบบ่อยให้เป็นคำเดียว (เหมือน norm_ ในเวอร์ชันเดิม)
function ffNorm(w) {
  var s = String(w || '').replace(/\s+/g, '').replace(/[.,!?"']/g, '').toLowerCase();
  for (var i = 0; i < FF_STATIC.synonyms.length; i++) { var x = FF_STATIC.synonyms[i]; if (new RegExp(x[0], x[1]).test(s)) return x[2]; }
  return s;
}

// ชื่อฟังก์ชันเดิม → ฟังก์ชันในฐานข้อมูล
function api(fn) {
  var a = Array.prototype.slice.call(arguments, 1);
  switch (fn) {
    case 'getStatic': return ffRpc('ff_roster').then(function (ro) { var s = JSON.parse(JSON.stringify(FF_STATIC)); s.roster = ro || []; return s; });
    case 'register': return ffRpc('ff_register', { p_no: Number(a[0]), p_grp: ffNull(a[1]), p_role: ffNull(a[2]) });
    case 'getMyState': return ffRpc('ff_student_state', { p_no: Number(a[0]) });
    case 'getScreenState': return ffRpc('ff_pub');
    case 'submitTest': return ffRpc('ff_submit_test', { p_no: Number(a[0]), p_kind: a[1], p_answers: a[2] });
    case 'submitGoal': return ffRpc('ff_submit_goal', { p_no: Number(a[0]), p_target: Number(a[1]), p_focus: a[2], p_note: a[3] || '' });
    case 'submitReview': return ffRpc('ff_submit_review', { p_no: Number(a[0]), p_answers: a[1] || {} });
    case 'submitWord': return ffRpc('ff_submit_word', { p_no: Number(a[0]), p_word: a[1], p_norm: ffNorm(a[1]) });
    case 'checkParsons': return ffRpc('ff_check_parsons', { p_no: Number(a[0]), p_order: a[1] || [] });
    case 'submitChallenge': return ffRpc('ff_submit_challenge', { p_no: Number(a[0]), p_text: a[1] });
    case 'submitHandoff': return ffRpc('ff_submit_handoff', { p_no: Number(a[0]), p_answers: a[1] });
    case 'submitRule': return ffRpc('ff_submit_rule', { p_no: Number(a[0]), p_team: a[1], p_text: a[2] });
    case 'updateBuild': return ffRpc('ff_update_build', { p_no: Number(a[0]), p_checks: a[1] === undefined ? null : a[1], p_sos: a[2] === undefined ? null : a[2] });
    case 'submitBug': return ffRpc('ff_submit_bug', { p_no: Number(a[0]), p_symptom: a[1], p_fix: a[2], p_rule: a[3] });
    case 'submitExtend': return ffRpc('ff_submit_extend', { p_no: Number(a[0]), p_choice: a[1], p_mode: a[2], p_text: a[3] });
    case 'submitPeer': return ffRpc('ff_submit_peer', { p_no: Number(a[0]), p_scores: a[1], p_like: a[2], p_suggest: a[3] });
    case 'submitReflect': return ffRpc('ff_submit_reflect', { p_no: Number(a[0]), d: a[1] });
    case 'submitInquiry': return ffRpc('ff_submit_inquiry', { p_no: Number(a[0]), p_topic: a[1], p_summary: a[2], p_source: a[3] });
    case 'teacherLogin': return ffRpc('ff_teacher_login', { p_pin: String(a[0]) });
    case 'getTeacherState': return ffRpc('ff_teacher_snapshot', { p_pin: String(a[0]) }).then(ffTeacherState);
    case 'teacherAction': return ffRpc('ff_teacher_action', { p_pin: String(a[0]), p_action: a[1], p_data: a[2] || {} });
  }
  return Promise.reject(new Error('ไม่รู้จักคำสั่ง ' + fn));
}

// ฟังการเปลี่ยนแปลงแบบ realtime: มีใครส่งข้อมูล → โหลดสถานะใหม่ (หน่วงสุ่มเล็กน้อยไม่ให้ทุกเครื่องถามพร้อมกัน)
function ffLive(cb) {
  var t = null;
  var kick = function () { clearTimeout(t); t = setTimeout(cb, 250 + Math.random() * 900); };
  if (FFSB) {
    try { FFSB.channel('ff-ticker').on('postgres_changes', { event: '*', schema: 'public', table: 'ff_ticker' }, kick).subscribe(); } catch (e) { }
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
}
