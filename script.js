(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const KEYS = { t: "taskly_tasks", n: "taskly_notes", s: "taskly_schedule" };
  const P = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    check: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/>',
    note: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    chart: '<path d="M18 20V10M12 20V4M6 20v-6"/>',
    trend: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    tick: '<path d="M5 12l5 5L19 7"/>'
  };
  const icon = (n) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[n] + "</svg>";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return Array.isArray(v) ? v : d; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { toast("Could not save: browser storage is unavailable."); } };
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const off = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
  const today = () => iso(new Date());
  const fmt = (s) => (s ? new Date(s + "T00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No deadline");
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  // ---- state (sample data only on first run) ----
  const firstRun = localStorage.getItem(KEYS.t) === null;
  let tasks = load(KEYS.t, [
    { id: uid(), title: "Prepare for sprint review", subject: "Software Project", due: off(2), priority: "high", progress: 3 },
    { id: uid(), title: "Fix API integration issue", subject: "Software Project", due: off(1), priority: "high", progress: 1 },
    { id: uid(), title: "Design login UI prototype", subject: "Design", due: off(5), priority: "medium", progress: 2 },
    { id: uid(), title: "Optimize database queries", subject: "Databases", due: off(7), priority: "low", progress: 0 },
    { id: uid(), title: "Submit lab report", subject: "Databases", due: off(-3), priority: "medium", progress: 4 }
  ]);
  let notes = load(KEYS.n, [
    { id: uid(), title: "Exam tips", text: "Revise past papers and focus on weak chapters first.", date: today() },
    { id: uid(), title: "Group project", text: "Send final slides to the team before Friday.", date: today() }
  ]);
  let sched = load(KEYS.s, [
    { id: uid(), date: today(), time: "09:00", subject: "Mathematics", loc: "Room 204", sample: true },
    { id: uid(), date: today(), time: "11:00", subject: "Databases", loc: "Lab 3", sample: true },
    { id: uid(), date: today(), time: "14:00", subject: "Design Studio", loc: "Room 12", sample: true }
  ]);
  if (firstRun) { save(KEYS.t, tasks); save(KEYS.n, notes); save(KEYS.s, sched); }
  let filter = "all", query = "", showAll = false, editId = null;

  // ---- helpers ----
  const status = (t) => (t.progress >= 4 ? "done" : t.progress > 0 ? "progress" : "todo");
  const STATUS = { todo: "To Do", progress: "In Progress", done: "Done" };
  const overdue = (t) => t.due && t.due < today() && t.progress < 4;
  const soon = (t) => t.due && t.due >= today() && t.due <= off(3) && t.progress < 4;
  let timer;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(timer); timer = setTimeout(() => t.classList.remove("show"), 2400); }

  // ---- tasks ----
  function renderTasks() {
    const od = tasks.filter(overdue).length, sn = tasks.filter(soon).length, dn = tasks.filter((t) => t.progress >= 4).length;
    $("#stats").innerHTML =
      '<div class="stat"><b>' + tasks.length + "</b><span>Total</span></div>" +
      '<div class="stat"><b>' + dn + "</b><span>Completed</span></div>" +
      '<div class="stat"><b>' + sn + "</b><span>Due in 3 days</span></div>" +
      '<div class="stat ' + (od ? "bad" : "") + '"><b>' + od + "</b><span>Overdue</span></div>";
    const b = $("#badge"); b.textContent = od + sn; b.hidden = od + sn === 0;
    let list = tasks.filter((t) => (filter === "all" || status(t) === filter) && (t.title + " " + t.subject).toLowerCase().includes(query));
    list.sort((a, b2) => (a.progress >= 4) - (b2.progress >= 4) || (a.due || "9").localeCompare(b2.due || "9"));
    const total = list.length;
    if (!showAll) list = list.slice(0, 4);
    $("#viewAll").hidden = total <= 4;
    $("#viewAll").textContent = showAll ? "Show fewer" : "View All Tasks (" + total + ")";
    $("#taskList").innerHTML = list.length ? list.map((t) => {
      const st = status(t), od2 = overdue(t);
      let segs = "";
      for (let i = 1; i <= 4; i++) segs += '<button class="seg ' + (t.progress >= i ? "on" : "") + '" data-act="seg" data-n="' + i + '" aria-label="Set progress to ' + i + ' of 4"></button>';
      return '<li class="task ' + (st === "done" ? "done" : "") + '" data-id="' + t.id + '">' +
        '<button class="check" data-act="toggle" aria-label="Mark complete">' + icon("tick") + "</button>" +
        '<div><div class="t-title">' + esc(t.title) + '</div><div class="t-meta">' + esc(t.subject || "General") + " · " + (od2 ? '<span class="over">Overdue: ' + fmt(t.due) + "</span>" : "Due " + fmt(t.due)) + "</div></div>" +
        '<div class="t-right"><span class="pill ' + t.priority + '">' + t.priority[0].toUpperCase() + t.priority.slice(1) + '</span><span class="pill st">' + STATUS[st] + '</span><div class="segs">' + segs + '</div>' +
        '<div class="acts"><button class="mini" data-act="edit" aria-label="Edit">' + icon("edit") + '</button><button class="mini" data-act="del" aria-label="Delete">' + icon("trash") + "</button></div></div></li>";
    }).join("") : '<li class="empty">No tasks here yet. Add one to get started.</li>';
    renderProgress();
  }
  $("#taskList").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]"); if (!btn) return;
    const li = btn.closest(".task"), t = tasks.find((x) => x.id === li.dataset.id); if (!t) return;
    const a = btn.dataset.act;
    if (a === "toggle") t.progress = t.progress >= 4 ? 0 : 4;
    else if (a === "seg") { const n = +btn.dataset.n; t.progress = t.progress === n ? n - 1 : n; }
    else if (a === "del") { if (!confirm('Delete "' + t.title + '"?')) return; tasks = tasks.filter((x) => x.id !== t.id); }
    else if (a === "edit") {
      editId = t.id; $("#fTitle").value = t.title; $("#fSubject").value = t.subject; $("#fDue").value = t.due; $("#fPriority").value = t.priority;
      $("#fSave").textContent = "Update task"; $("#taskForm").hidden = false; $("#fTitle").focus(); return;
    }
    save(KEYS.t, tasks); renderTasks();
  });
  function closeTaskForm() { $("#taskForm").reset(); $("#taskForm").hidden = true; editId = null; $("#fSave").textContent = "Save task"; }
  $("#addTaskBtn").onclick = () => { const f = $("#taskForm"); if (f.hidden) { closeTaskForm(); f.hidden = false; $("#fTitle").focus(); } else closeTaskForm(); };
  $("#fCancel").onclick = closeTaskForm;
  $("#taskForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = $("#fTitle").value.trim(); if (!title) return toast("Enter a task title.");
    const data = { title, subject: $("#fSubject").value.trim() || "General", due: $("#fDue").value, priority: $("#fPriority").value };
    if (editId) Object.assign(tasks.find((t) => t.id === editId), data);
    else tasks.push({ id: uid(), progress: 0, ...data });
    toast(editId ? "Task updated" : "Task added");
    save(KEYS.t, tasks); closeTaskForm(); renderTasks();
  });
  $("#tabs").addEventListener("click", (e) => {
    const b = e.target.closest(".tab"); if (!b) return;
    filter = b.dataset.f; showAll = false;
    document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("active", x === b)); renderTasks();
  });
  $("#viewAll").onclick = () => { showAll = !showAll; renderTasks(); };
  $("#searchBtn").onclick = () => { const s = $("#search"); s.hidden = !s.hidden; if (!s.hidden) s.focus(); else { s.value = ""; query = ""; renderTasks(); } };
  $("#search").addEventListener("input", (e) => { query = e.target.value.toLowerCase(); showAll = true; renderTasks(); });
  $("#bellBtn").onclick = () => { const o = tasks.filter(overdue).length, s = tasks.filter(soon).length; toast(o + s ? o + " overdue, " + s + " due within 3 days." : "You're all caught up."); };

  // ---- progress (calculated from saved tasks) ----
  function renderProgress() {
    const sum = tasks.reduce((a, t) => a + t.progress, 0), pct = tasks.length ? Math.round((sum / (tasks.length * 4)) * 100) : 0;
    const done = tasks.filter((t) => t.progress >= 4).length;
    $("#overallPill").textContent = pct + "%";
    $("#progressSummary").textContent = done + " of " + tasks.length + " tasks completed";
    const by = {};
    tasks.forEach((t) => { const k = t.subject || "General"; (by[k] = by[k] || []).push(t); });
    const rows = Object.entries(by).map(([k, arr]) => [k, Math.round((arr.reduce((a, t) => a + t.progress, 0) / (arr.length * 4)) * 100)]).sort((a, b) => b[1] - a[1]).slice(0, 5);
    $("#subjectBars").innerHTML = rows.length ? rows.map(([k, p]) => '<div class="bar-row"><div class="bar-top"><span>' + esc(k) + "</span><span>" + p + '%</span></div><div class="bar"><i style="width:' + p + '%"></i></div></div>').join("") : '<p class="hint">Add tasks to see your progress by subject.</p>';
  }

  // ---- notes ----
  function renderNotes() {
    $("#noteList").innerHTML = notes.length ? notes.slice(-4).reverse().map((n, i) =>
      '<article class="note c' + (i % 2) + '"><button class="x" data-id="' + n.id + '" aria-label="Delete note">×</button><h3>' + esc(n.title) + "</h3><p>" + esc(n.text) + "</p><small>" + fmt(n.date) + "</small></article>").join("") : '<p class="hint">No notes yet. Select Add Note to write one.</p>';
  }
  $("#addNoteBtn").onclick = () => { const f = $("#noteForm"); f.hidden = !f.hidden; if (!f.hidden) $("#nTitle").focus(); };
  $("#noteForm").addEventListener("submit", (e) => {
    e.preventDefault();
    notes.push({ id: uid(), title: $("#nTitle").value.trim(), text: $("#nText").value.trim(), date: today() });
    save(KEYS.n, notes); e.target.reset(); e.target.hidden = true; renderNotes(); toast("Note added");
  });
  $("#noteList").addEventListener("click", (e) => { const b = e.target.closest(".x"); if (!b) return; notes = notes.filter((n) => n.id !== b.dataset.id); save(KEYS.n, notes); renderNotes(); });

  // ---- schedule ----
  function renderSched() {
    const d = $("#schedDate").value, rows = sched.filter((s) => s.date === d).sort((a, b) => a.time.localeCompare(b.time));
    $("#schedBody").innerHTML = rows.length ? rows.map((s) => "<tr><td>" + s.time + "</td><td>" + esc(s.subject) + (s.sample ? '<span class="tag">sample</span>' : "") + "</td><td>" + esc(s.loc || "-") + '</td><td><button class="mini" data-id="' + s.id + '" aria-label="Delete entry">' + icon("trash") + "</button></td></tr>").join("") : '<tr><td colspan="4" class="hint">Nothing scheduled for this day.</td></tr>';
  }
  $("#schedDate").value = today();
  $("#schedDate").onchange = renderSched;
  $("#schedForm").addEventListener("submit", (e) => {
    e.preventDefault();
    sched.push({ id: uid(), date: $("#schedDate").value || today(), time: $("#sTime").value, subject: $("#sSubject").value.trim(), loc: $("#sLoc").value.trim() });
    save(KEYS.s, sched); e.target.reset(); renderSched();
  });
  $("#schedBody").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; sched = sched.filter((s) => s.id !== b.dataset.id); save(KEYS.s, sched); renderSched(); });

  // ---- nav + icons ----
  document.querySelectorAll("[data-icon]").forEach((el) => el.insertAdjacentHTML("afterbegin", icon(el.dataset.icon)));
  $("#nav").addEventListener("click", (e) => {
    const a = e.target.closest(".nav-item"); if (!a) return; e.preventDefault();
    const target = a.dataset.target;
    if (!target) return toast((a.dataset.name === "Log out" ? "No account needed: Taskly runs locally." : a.dataset.name + " isn't available yet."));
    document.querySelectorAll(".nav-item").forEach((x) => x.classList.toggle("active", x === a));
    (target === "top" ? document.body : document.getElementById(target)).scrollIntoView({ behavior: "smooth", block: "start" });
  });

  renderTasks(); renderNotes(); renderSched();
})();
