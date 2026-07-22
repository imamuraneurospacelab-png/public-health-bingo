const QUESTIONS = [
  { id: 0, short: "再興感染症", text: "再興感染症はどっち？", options: ["新型コロナウィルス感染症", "結核"] },
  { id: 1, short: "腸炎ビブリオ", text: "腸炎ビブリオはどこに多い？", options: ["魚介類", "肉"] },
  { id: 2, short: "換気管理", text: "職場の換気管理はどっち？", options: ["作業管理", "作業環境管理"] },
  { id: 3, short: "病院の病床", text: "〜病院のベッド数は何床以上？", options: ["1床", "20床"] },
  { id: 4, short: "労災申請", text: "労災の申請先は？", options: ["保健所", "労働基準監督署"] },
  { id: 5, short: "世帯構成", text: "最多の世帯構成は？", options: ["単独世帯", "三世帯"] },
  { id: 6, short: "保健師", text: "保健師の職種区分は？", options: ["業務独占職", "名称独占職"] },
  { id: 7, short: "健康づくり", text: "WHOが採択した『健康づくり』の国際文書は？", options: ["オタワ憲章", "児童憲章"] },
  { id: 8, short: "喫煙率", text: "喫煙率の高い性別は？", options: ["男性", "女性"] },
  { id: 9, short: "イタイイタイ病", text: "イタイイタイ病の原因は？", options: ["カドミウム", "有機水銀"] },
  { id: 10, short: "介護保険第2号", text: "介護保険の第2号被保険者の年齢範囲は？", options: ["20歳以上40歳未満", "40歳以上65歳未満"] },
  { id: 11, short: "要介護申請", text: "要介護認定の申請先は？", options: ["高齢者施設", "市町村"] },
  { id: 12, short: "虐待類型", text: "食事・衣服・医療などの世話を怠る", options: ["ネグレクト", "心理的虐待"] },
  { id: 13, short: "日本の総人口", text: "日本の総人口は約何人？", options: ["1億人", "1億2600万人"] },
  { id: 14, short: "ブドウ球菌", text: "黄色ブドウ球菌の毒素は？", options: ["エンテロトキシン", "ベロ毒素"] },
  { id: 15, short: "診療所の病床", text: "診療所のベッド数は？", options: ["20床", "19床"] },
  { id: 16, short: "医療費", text: "医療費が最もかかる年齢層は？", options: ["若年層", "高齢者層"] },
  { id: 17, short: "死亡原因", text: "死亡原因1位は？", options: ["脳血管障害", "悪性新生物"] },
  { id: 18, short: "後期高齢者", text: "後期高齢者医療制度の対象年齢は？", options: ["75歳以上", "20歳未満"] },
  { id: 19, short: "出席停止", text: "学校の感染症による出席停止の根拠法は？", options: ["学校保健安全法", "学校給食法"] },
  { id: 20, short: "出生率", text: "出生率（人口千人対）は？", options: ["6.8", "1.22"] },
  { id: 21, short: "運動習慣", text: "運動習慣が最も高い年齢層は？", options: ["20代", "70代"] },
  { id: 22, short: "陽性症状", text: "統合失調症の陽性症状は？", options: ["自閉", "幻覚"] },
  { id: 23, short: "粗死亡率", text: "粗死亡率（人口千人対）は？", options: ["11.1", "1110"] }
];

const $ = selector => document.querySelector(selector);
const landing = $("#landing");
const hostScreen = $("#host-screen");
const studentScreen = $("#student-screen");

let hostSession = null;
let playerSession = null;
let hostPollTimer = null;
let studentPollTimer = null;
let countdownTimer = null;
let countdownValue = null;
let lastStudentQuestionId = null;
let lastStudentLines = 0;
let celebratedRank = null;
let answerBusy = false;
let toastTimer = null;

function showOnly(screen) {
  [landing, hostScreen, studentScreen].forEach(el => el.classList.toggle("hidden", el !== screen));
}

function showToast(message, ms = 2600) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), ms);
}

async function apiPost(payload) {
  const response = await fetch("/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({ error: "サーバー応答を読み取れませんでした。" }));
  if (!response.ok) throw new Error(data.error || "通信に失敗しました。");
  return data;
}

async function apiGet(params) {
  const query = new URLSearchParams(params);
  const response = await fetch(`/api?${query.toString()}`, { cache: "no-store" });
  const data = await response.json().catch(() => ({ error: "サーバー応答を読み取れませんでした。" }));
  if (!response.ok) throw new Error(data.error || "通信に失敗しました。");
  return data;
}

function joinLink(code) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("room", code);
  return url.toString();
}

function makeQrUrl(text) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(text)}`;
}

function stopTimers() {
  clearInterval(hostPollTimer);
  clearInterval(studentPollTimer);
  clearInterval(countdownTimer);
  hostPollTimer = null;
  studentPollTimer = null;
  countdownTimer = null;
}

function beep(frequency = 660, duration = 0.08, volume = 0.035) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    osc.addEventListener("ended", () => ctx.close());
  } catch {}
}

function confetti(amount = 70) {
  const layer = $("#confetti-layer");
  const colors = ["#2563eb", "#f59e0b", "#16a34a", "#ef4444", "#8b5cf6", "#ec4899"];
  for (let i = 0; i < amount; i++) {
    const piece = document.createElement("i");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty("--drift", `${-120 + Math.random() * 240}px`);
    piece.style.animationDelay = `${Math.random() * 0.45}s`;
    piece.style.animationDuration = `${2.2 + Math.random() * 1.5}s`;
    layer.appendChild(piece);
    setTimeout(() => piece.remove(), 4300);
  }
}

async function createRoom() {
  const button = $("#create-btn");
  button.disabled = true;
  try {
    const data = await apiPost({ action: "create", winLines: Number($("#win-lines").value) });
    hostSession = { room: data.code, pin: data.pin };
    localStorage.setItem(`bingo-host-${data.code}`, JSON.stringify(hostSession));
    history.replaceState(null, "", `?host=${data.code}`);
    setupHostScreen();
    await pollHost();
    hostPollTimer = setInterval(pollHost, 1000);
  } catch (error) {
    showToast(error.message, 4200);
  } finally {
    button.disabled = false;
  }
}

function setupHostScreen() {
  stopTimers();
  showOnly(hostScreen);
  $("#host-room-code").textContent = hostSession.room;
  $("#host-pin").textContent = hostSession.pin;
  const url = joinLink(hostSession.room);
  $("#join-url").textContent = url;
  $("#qr-image").src = makeQrUrl(url);
}

async function pollHost() {
  if (!hostSession) return;
  try {
    const data = await apiGet({ role: "host", room: hostSession.room, pin: hostSession.pin });
    renderHost(data);
  } catch (error) {
    showToast(error.message, 3800);
  }
}

function renderHost(data) {
  const { room, question, stats, players, winners } = data;
  $("#stat-players").textContent = stats.players;
  $("#stat-answered").textContent = stats.answered;
  $("#stat-reach").textContent = stats.reach;
  $("#stat-bingo").textContent = stats.bingo;

  const list = $("#player-list");
  if (!players.length) {
    list.textContent = "まだ参加者はいません";
  } else {
    list.innerHTML = players.map(p => {
      const winner = p.rank >= 1 && p.rank <= 3;
      return `<span class="player-chip ${winner ? "winner" : ""}">${winner ? `${p.rank}位 ` : ""}${escapeHtml(p.name)}</span>`;
    }).join("");
  }

  const waiting = room.status === "waiting";
  $("#host-waiting").classList.toggle("hidden", !waiting);
  $("#host-game").classList.toggle("hidden", waiting);
  $("#start-btn").disabled = stats.players < 1;

  if (!waiting) {
    $("#question-progress").textContent = room.currentPos >= 0
      ? `第${room.currentPos + 1}問 / ${room.totalQuestions}問`
      : "終了";
    $("#question-number").textContent = room.currentPos >= 0 ? `Q${room.currentPos + 1}` : "FINISH";

    if (question) {
      $("#host-question").textContent = question.text;
      $("#host-option-1 strong").textContent = question.options[0];
      $("#host-option-2 strong").textContent = question.options[1];
      $("#host-option-1").classList.toggle("correct", room.revealed && question.answer === 1);
      $("#host-option-2").classList.toggle("correct", room.revealed && question.answer === 2);
    }

    const answerBanner = $("#answer-banner");
    if (room.status === "ended") {
      answerBanner.textContent = winners.length >= 3 ? "上位3名が決定しました！表彰式へどうぞ 🎉" : "ゲームを終了しました";
      answerBanner.classList.remove("hidden");
    } else if (room.revealed && question) {
      answerBanner.textContent = `正解は ${question.answer}．${question.options[question.answer - 1]}`;
      answerBanner.classList.remove("hidden");
    } else {
      answerBanner.classList.add("hidden");
    }

    $("#timer-btn").disabled = room.revealed || room.status === "ended";
    $("#reveal-btn").disabled = room.revealed || room.status === "ended";
    $("#next-btn").disabled = !room.revealed || room.status === "ended";
    $("#next-btn").textContent = winners.length >= 3 ? "結果確定" : "次の問題";

    if (room.revealed) {
      $("#correct-rate").textContent = stats.answered > 0
        ? `${Math.round((stats.correct / stats.answered) * 100)}%`
        : "回答なし";
    } else {
      $("#correct-rate").textContent = "未発表";
    }
  }

  renderWinnerList($("#winner-list"), winners, "待機中");
}

async function hostAction(action) {
  if (!hostSession) return;
  try {
    await apiPost({ action, room: hostSession.room, pin: hostSession.pin });
    if (action === "reveal") {
      clearInterval(countdownTimer);
      countdownTimer = null;
      $("#countdown").textContent = "✓";
      beep(880, .15, .05);
    }
    await pollHost();
  } catch (error) {
    showToast(error.message, 3500);
  }
}

function startCountdown() {
  clearInterval(countdownTimer);
  countdownValue = 10;
  $("#countdown").textContent = countdownValue;
  beep(540);
  countdownTimer = setInterval(async () => {
    countdownValue -= 1;
    $("#countdown").textContent = countdownValue;
    if (countdownValue <= 3 && countdownValue > 0) beep(720, .07, .045);
    if (countdownValue <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      $("#countdown").textContent = "0";
      await hostAction("reveal");
    }
  }, 1000);
}

async function joinRoom() {
  const room = $("#join-room").value.toUpperCase().replace(/\s/g, "");
  const name = $("#join-name").value.trim();
  if (!room || !name) {
    showToast("ルームコードとニックネームを入力してください。");
    return;
  }
  const button = $("#join-btn");
  button.disabled = true;
  try {
    const data = await apiPost({ action: "join", room, name });
    playerSession = { room: data.room, playerId: data.playerId, name };
    localStorage.setItem(`bingo-player-${data.room}`, JSON.stringify(playerSession));
    history.replaceState(null, "", `?room=${data.room}`);
    setupStudentScreen();
    await pollStudent();
    studentPollTimer = setInterval(pollStudent, 1200);
  } catch (error) {
    showToast(error.message, 4200);
  } finally {
    button.disabled = false;
  }
}

function setupStudentScreen() {
  stopTimers();
  showOnly(studentScreen);
  $("#student-name").textContent = playerSession.name;
  $("#student-room-code").textContent = playerSession.room;
  lastStudentQuestionId = null;
  lastStudentLines = 0;
  celebratedRank = null;
}

async function pollStudent() {
  if (!playerSession) return;
  try {
    const data = await apiGet({ role: "student", room: playerSession.room, player: playerSession.playerId });
    renderStudent(data);
  } catch (error) {
    clearInterval(studentPollTimer);
    studentPollTimer = null;
    showToast(error.message, 4300);
  }
}

function renderStudent(data) {
  const { room, question, player, winners } = data;
  $("#line-count").textContent = `${player.lines}列`;
  renderBoard(player.card, player.marked);
  renderWinnerList($("#student-winner-list"), winners, "まだビンゴはいません");

  const status = $("#student-status");
  status.className = "status-pill";
  const buttons = [$("#answer-1"), $("#answer-2")];
  buttons.forEach(btn => {
    btn.classList.remove("selected", "correct", "wrong");
    btn.disabled = true;
  });

  const result = $("#student-result");
  result.className = "student-result hidden";

  if (room.status === "waiting") {
    $("#student-progress").textContent = `勝利条件：${room.winLines}列`;
    status.textContent = "待機中";
    $("#student-question").textContent = "先生がゲームを開始するまでお待ちください";
    buttons[0].querySelector("strong").textContent = "選択肢1";
    buttons[1].querySelector("strong").textContent = "選択肢2";
  } else if (room.status === "ended") {
    $("#student-progress").textContent = "ゲーム終了";
    status.textContent = "終了";
    $("#student-question").textContent = "お疲れさまでした！上位3名は前へどうぞ";
    showPlayerOutcome(player, result, room.winLines);
  } else if (question) {
    $("#student-progress").textContent = `第${room.currentPos + 1}問 / ${room.totalQuestions}問`;
    status.textContent = room.revealed ? "正解発表" : (data.answered ? "回答済み" : "回答受付中");
    status.classList.add(room.revealed ? "revealed" : "live");
    $("#student-question").textContent = question.text;
    buttons[0].querySelector("strong").textContent = question.options[0];
    buttons[1].querySelector("strong").textContent = question.options[1];

    if (lastStudentQuestionId !== question.id) {
      lastStudentQuestionId = question.id;
      answerBusy = false;
      if (navigator.vibrate) navigator.vibrate(30);
    }

    if (!room.revealed) {
      buttons.forEach(btn => btn.disabled = data.answered || answerBusy);
      if (data.selected) buttons[data.selected - 1].classList.add("selected");
      if (data.answered) {
        result.textContent = "回答を受け付けました。正解発表を待ってください。";
        result.className = "student-result";
      }
    } else {
      if (data.selected) buttons[data.selected - 1].classList.add("selected");
      if (question.answer) buttons[question.answer - 1].classList.add("correct");
      if (data.selected && data.selected !== question.answer) buttons[data.selected - 1].classList.add("wrong");

      const correct = data.selected === question.answer;
      result.textContent = data.selected
        ? (correct ? "正解！ マスが1つ開きました" : `残念。正解は「${question.options[question.answer - 1]}」`)
        : `未回答でした。正解は「${question.options[question.answer - 1]}」`;
      result.className = `student-result ${correct ? "good" : "bad"}`;
    }
  }

  if (player.lines > lastStudentLines) {
    if (player.rank === null && player.lines < room.winLines) {
      confetti(35);
      beep(920, .12, .05);
      showToast(`${player.lines}列完成！あと${room.winLines - player.lines}列！`, 3200);
    }
    lastStudentLines = player.lines;
  }

  if (player.rank !== null && celebratedRank !== player.rank) {
    celebratedRank = player.rank;
    showPlayerOutcome(player, result, room.winLines);
    confetti(player.rank >= 1 && player.rank <= 3 ? 130 : 65);
    beep(1040, .22, .06);
    setTimeout(() => beep(1320, .25, .055), 180);
    if (navigator.vibrate) navigator.vibrate([80, 50, 160]);
  }
}

function showPlayerOutcome(player, result, winLines) {
  if (player.rank >= 1 && player.rank <= 3) {
    result.textContent = `🎉 第${player.rank}位！ この画面を先生に見せてください`;
    result.className = "student-result win";
  } else if (player.rank === 0 || player.lines >= winLines) {
    result.textContent = "ビンゴ完成！惜しくも上位3名には届きませんでした";
    result.className = "student-result good";
  }
}

async function submitAnswer(choice) {
  if (!playerSession || answerBusy) return;
  answerBusy = true;
  const buttons = [$("#answer-1"), $("#answer-2")];
  buttons.forEach(btn => btn.disabled = true);
  buttons[choice - 1].classList.add("selected");
  try {
    await apiPost({ action: "answer", room: playerSession.room, playerId: playerSession.playerId, choice });
    beep(choice === 1 ? 620 : 720, .06, .025);
    await pollStudent();
  } catch (error) {
    answerBusy = false;
    showToast(error.message, 3300);
    await pollStudent();
  }
}

function renderBoard(card, marked) {
  const board = $("#bingo-board");
  const markedSet = new Set(marked);
  board.innerHTML = card.map((qid, index) => {
    if (qid === -1) return `<div class="bingo-cell free marked"><span>FREE</span></div>`;
    const q = QUESTIONS[qid];
    return `<div class="bingo-cell ${markedSet.has(qid) ? "marked" : ""}" title="${escapeHtml(q.text)}"><small>${index + 1}</small><span>${escapeHtml(q.short)}</span></div>`;
  }).join("");
}

function renderWinnerList(element, winners, emptyText) {
  if (!winners || winners.length === 0) {
    element.innerHTML = `<li>${escapeHtml(emptyText)}</li>`;
    return;
  }
  const medals = ["🥇", "🥈", "🥉"];
  element.innerHTML = winners.map(w => `<li>${medals[(Number(w.rank) || 1) - 1] || "🏅"} ${escapeHtml(w.name)}</li>`).join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function bindEvents() {
  $("#create-btn").addEventListener("click", createRoom);
  $("#join-btn").addEventListener("click", joinRoom);
  $("#join-room").addEventListener("input", event => { event.target.value = event.target.value.toUpperCase(); });
  $("#join-name").addEventListener("keydown", event => { if (event.key === "Enter") joinRoom(); });
  $("#start-btn").addEventListener("click", () => hostAction("start"));
  $("#reveal-btn").addEventListener("click", () => hostAction("reveal"));
  $("#next-btn").addEventListener("click", () => hostAction("next"));
  $("#end-btn").addEventListener("click", () => {
    if (window.confirm("ゲームを終了しますか？")) hostAction("end");
  });
  $("#timer-btn").addEventListener("click", startCountdown);
  $("#answer-1").addEventListener("click", () => submitAnswer(1));
  $("#answer-2").addEventListener("click", () => submitAnswer(2));
}

async function restoreFromUrl() {
  const params = new URLSearchParams(location.search);
  const hostCode = params.get("host")?.toUpperCase();
  const roomCode = params.get("room")?.toUpperCase();

  if (hostCode) {
    const saved = safeJson(localStorage.getItem(`bingo-host-${hostCode}`));
    if (saved?.pin) {
      hostSession = saved;
      setupHostScreen();
      await pollHost();
      hostPollTimer = setInterval(pollHost, 1000);
      return;
    }
    history.replaceState(null, "", location.pathname);
    showToast("教員PINを復元できません。新しいルームを作成してください。", 4200);
  }

  if (roomCode) {
    $("#join-room").value = roomCode;
    const saved = safeJson(localStorage.getItem(`bingo-player-${roomCode}`));
    if (saved?.playerId) {
      playerSession = saved;
      setupStudentScreen();
      try {
        await pollStudent();
        studentPollTimer = setInterval(pollStudent, 1200);
        return;
      } catch {}
    }
    $("#join-name").focus();
  }
}

function safeJson(value) {
  try { return JSON.parse(value); } catch { return null; }
}

document.addEventListener("DOMContentLoaded", async () => {
  bindEvents();
  await restoreFromUrl();
});
