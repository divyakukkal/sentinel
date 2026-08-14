/* =========================================================
   Sentinel — synthetic, client-side demo only.
   No real files, hosts, or malware are involved anywhere here.
   Every "event" below is randomly generated for illustration.
   ========================================================= */

(() => {
  "use strict";

  /* ---------- shared state ---------- */
  let incidentActive = false;
  let riskScore = 8;
  let entropy = 4.02;
  let renameRate = 2;

  const NORMAL_EVENTS = [
    "file read: invoice_{n}.pdf",
    "file write: notes_{n}.docx",
    "process: backup-agent.exe idle poll",
    "file open: photo_{n}.jpg",
    "dir listing: /Users/analyst/Documents",
    "file read: report_{n}.xlsx",
    "process: explorer.exe file dialog",
    "cache write: thumbnail_{n}.db"
  ];

  const INCIDENT_EVENTS = [
    { text: "RENAME: report_{n}.docx → report_{n}.docx.locked", sev: "crit" },
    { text: "entropy spike: file_{n}.dat 3.9 → 7.9", sev: "crit" },
    { text: "mass write burst: 40+ files in 2s", sev: "crit" },
    { text: "process: unknown_bin_{n}.exe spawned", sev: "warn" },
    { text: "shadow copy delete attempt blocked", sev: "crit" },
    { text: "DELETE: backup_{n}.bak", sev: "warn" },
    { text: "unusual syscall: bulk file handle open", sev: "warn" }
  ];

  const FEATURES_NORMAL = [
    { label: "entropy_delta", val: 6 },
    { label: "rename_rate", val: 4 },
    { label: "io_burst", val: 9 },
    { label: "proc_anomaly", val: 3 },
    { label: "rw_ratio", val: 5 }
  ];

  const FEATURES_INCIDENT = [
    { label: "entropy_delta", val: 94 },
    { label: "rename_rate", val: 88 },
    { label: "io_burst", val: 76 },
    { label: "proc_anomaly", val: 61 },
    { label: "rw_ratio", val: 48 }
  ];

  const rand = (a, b) => Math.random() * (b - a) + a;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const nowStamp = () => {
    const d = new Date();
    return d.toTimeString().slice(0, 8);
  };

  /* ---------- entropy pulse canvas ---------- */
  const canvas = document.getElementById("pulse-canvas");
  const ctx = canvas.getContext("2d");
  let cw, ch;
  const points = new Array(90).fill(4.0);

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cw = rect.width;
    ch = rect.height;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function drawPulse() {
    ctx.clearRect(0, 0, cw, ch);

    // baseline grid
    ctx.strokeStyle = "rgba(255,255,255,0.045)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = (ch / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(cw, y);
      ctx.stroke();
    }

    const max = 8.2, min = 3.4;
    const stepX = cw / (points.length - 1);

    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    const lineColor = incidentActive ? "#E8595F" : "#4FD8B8";
    grad.addColorStop(0, incidentActive ? "rgba(232,89,95,0.28)" : "rgba(79,216,184,0.22)");
    grad.addColorStop(1, "rgba(79,216,184,0.0)");

    // fill
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = i * stepX;
      const y = ch - ((p - min) / (max - min)) * ch;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(cw, ch);
    ctx.lineTo(0, ch);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // line
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = i * stepX;
      const y = ch - ((p - min) / (max - min)) * ch;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // leading dot
    const lastX = (points.length - 1) * stepX;
    const lastY = ch - ((points[points.length - 1] - min) / (max - min)) * ch;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();
  }

  function stepPulse() {
    const target = incidentActive ? rand(7.4, 8.0) : rand(3.85, 4.25);
    points.push(clamp(target, 3.4, 8.2));
    points.shift();
    entropy = points[points.length - 1];
    document.getElementById("entropy-val").textContent = entropy.toFixed(2);
    drawPulse();
  }

  /* ---------- gauge ---------- */
  const gaugeArc = document.getElementById("gauge-arc");
  const gaugeNum = document.getElementById("gauge-num");
  const gaugeLabel = document.getElementById("gauge-label");
  const verdictLine = document.getElementById("verdict-line");
  const heroBadge = document.getElementById("hero-badge");
  const CIRC = 251.3;

  function renderGauge() {
    const offset = CIRC * (1 - riskScore / 100);
    gaugeArc.style.strokeDashoffset = offset.toFixed(1);
    gaugeNum.textContent = String(Math.round(riskScore)).padStart(2, "0");
    document.getElementById("risk-val").textContent = String(Math.round(riskScore)).padStart(2, "0");

    let color, label, verdict, badgeClass, badgeText;
    if (riskScore < 35) {
      color = "#4FD8B8"; label = "LOW RISK";
      verdict = "No malicious behaviour observed in current window.";
      badgeClass = ""; badgeText = "NOMINAL";
    } else if (riskScore < 70) {
      color = "#F0A742"; label = "ELEVATED";
      verdict = "Anomalous file activity detected — building confidence.";
      badgeClass = "warn"; badgeText = "ELEVATED";
    } else {
      color = "#E8595F"; label = "CRITICAL";
      verdict = "High-confidence ransomware behaviour — early-warning alert raised.";
      badgeClass = "crit"; badgeText = "ALERT RAISED";
    }
    gaugeArc.style.stroke = color;
    gaugeLabel.textContent = label;
    gaugeLabel.style.color = color;
    verdictLine.textContent = verdict;
    heroBadge.className = "badge " + badgeClass;
    heroBadge.textContent = badgeText;
  }

  /* ---------- SHAP-style feature bars ---------- */
  const shapList = document.getElementById("shap-list");
  function renderShap(features) {
    shapList.innerHTML = "";
    features.forEach((f) => {
      const row = document.createElement("div");
      row.className = "shap-row";
      row.innerHTML = `
        <span class="shap-label">${f.label}</span>
        <span class="shap-bar-track"><span class="shap-bar-fill" style="width:${f.val}%"></span></span>
        <span class="shap-val">${f.val}%</span>`;
      shapList.appendChild(row);
    });
  }

  /* ---------- event feed ---------- */
  const eventFeed = document.getElementById("event-feed");
  let eventCount = 0;

  function pushEvent() {
    eventCount++;
    const row = document.createElement("div");
    let text, sev = "";
    if (incidentActive && Math.random() < 0.7) {
      const ev = pick(INCIDENT_EVENTS);
      text = ev.text.replace("{n}", eventCount);
      sev = ev.sev;
    } else {
      text = pick(NORMAL_EVENTS).replace("{n}", eventCount);
    }
    row.className = "event-row" + (sev ? " sev-" + sev : "");
    row.innerHTML = `<span class="t">${nowStamp()}</span><span>${text}</span>`;
    eventFeed.prepend(row);
    while (eventFeed.children.length > 40) {
      eventFeed.removeChild(eventFeed.lastChild);
    }
  }

  /* ---------- timeline ---------- */
  const timeline = document.getElementById("timeline");
  function pushTimelineMark(kind) {
    const mark = document.createElement("div");
    mark.className = "tl-mark" + (kind !== "normal" ? " " + kind : "");
    const labels = {
      normal: "baseline",
      warn: "anomaly ↑",
      crit: "alert raised"
    };
    mark.textContent = `${nowStamp()} · ${labels[kind]}`;
    timeline.appendChild(mark);
    timeline.scrollLeft = timeline.scrollWidth;
    while (timeline.children.length > 30) {
      timeline.removeChild(timeline.firstChild);
    }
  }

  /* ---------- incident orchestration ---------- */
  const triggerBtn = document.getElementById("trigger-btn");
  const streamStatus = document.getElementById("stream-status");

  function runIncident() {
    if (incidentActive) return;
    incidentActive = true;
    triggerBtn.disabled = true;
    triggerBtn.textContent = "Incident in progress…";
    streamStatus.innerHTML = `<b>WKSTN-04</b> · behavioural anomaly under investigation`;
    pushTimelineMark("warn");

    let elapsed = 0;
    const rampInterval = setInterval(() => {
      elapsed += 400;
      riskScore = clamp(riskScore + rand(6, 14), 0, 97);
      renameRate = Math.round(clamp(renameRate + rand(3, 8), 0, 60));
      document.getElementById("rename-val").textContent = renameRate + " /min";
      renderGauge();
      renderShap(FEATURES_INCIDENT.map(f => ({
        label: f.label,
        val: clamp(Math.round(f.val + rand(-4, 4)), 0, 100)
      })));
      if (riskScore > 68 && elapsed <= 2400) pushTimelineMark("crit");
      if (elapsed >= 3200) clearInterval(rampInterval);
    }, 400);

    setTimeout(() => {
      incidentActive = false;
      streamStatus.innerHTML = `watching host <b>WKSTN-04</b> · synthetic stream`;
      pushTimelineMark("normal");
      const decay = setInterval(() => {
        riskScore = clamp(riskScore - rand(4, 9), 8, 100);
        renameRate = Math.max(2, Math.round(renameRate - rand(2, 5)));
        document.getElementById("rename-val").textContent = renameRate + " /min";
        renderGauge();
        renderShap(FEATURES_NORMAL.map(f => ({
          label: f.label,
          val: clamp(Math.round(f.val + rand(-2, 2)), 1, 15)
        })));
        if (riskScore <= 10) {
          clearInterval(decay);
          triggerBtn.disabled = false;
          triggerBtn.textContent = "Simulate ransomware burst";
        }
      }, 350);
    }, 7000);
  }

  triggerBtn.addEventListener("click", runIncident);

  /* ---------- init ---------- */
  renderShap(FEATURES_NORMAL);
  renderGauge();
  for (let i = 0; i < 10; i++) pushEvent();
  pushTimelineMark("normal");

  setInterval(stepPulse, 550);
  setInterval(pushEvent, 1400);
  setInterval(() => {
    if (!incidentActive) pushTimelineMark("normal");
  }, 6000);

  drawPulse();
})();
