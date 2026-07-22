const QUESTIONS = [
  { id: 0, text: "再興感染症はどっち？", options: ["新型コロナウィルス感染症", "結核"], answer: 2 },
  { id: 1, text: "腸炎ビブリオはどこに多い？", options: ["魚介類", "肉"], answer: 1 },
  { id: 2, text: "職場の換気管理はどっち？", options: ["作業管理", "作業環境管理"], answer: 2 },
  { id: 3, text: "〜病院のベッド数は何床以上？", options: ["1床", "20床"], answer: 2 },
  { id: 4, text: "労災の申請先は？", options: ["保健所", "労働基準監督署"], answer: 2 },
  { id: 5, text: "最多の世帯構成は？", options: ["単独世帯", "三世帯"], answer: 1 },
  { id: 6, text: "保健師の職種区分は？", options: ["業務独占職", "名称独占職"], answer: 2 },
  { id: 7, text: "WHOが採択した『健康づくり』の国際文書は？", options: ["オタワ憲章", "児童憲章"], answer: 1 },
  { id: 8, text: "喫煙率の高い性別は？", options: ["男性", "女性"], answer: 1 },
  { id: 9, text: "イタイイタイ病の原因は？", options: ["カドミウム", "有機水銀"], answer: 1 },
  { id: 10, text: "介護保険の第2号被保険者の年齢範囲は？", options: ["20歳以上40歳未満", "40歳以上65歳未満"], answer: 2 },
  { id: 11, text: "要介護認定の申請先は？", options: ["高齢者施設", "市町村"], answer: 2 },
  { id: 12, text: "食事・衣服・医療などの世話を怠る", options: ["ネグレクト", "心理的虐待"], answer: 1 },
  { id: 13, text: "日本の総人口は約何人？", options: ["1億人", "1億2600万人"], answer: 2 },
  { id: 14, text: "黄色ブドウ球菌の毒素は？", options: ["エンテロトキシン", "ベロ毒素"], answer: 1 },
  { id: 15, text: "診療所のベッド数は？", options: ["20床", "19床"], answer: 2 },
  { id: 16, text: "医療費が最もかかる年齢層は？", options: ["若年層", "高齢者層"], answer: 2 },
  { id: 17, text: "死亡原因1位は？", options: ["脳血管障害", "悪性新生物"], answer: 2 },
  { id: 18, text: "後期高齢者医療制度の対象年齢は？", options: ["75歳以上", "20歳未満"], answer: 1 },
  { id: 19, text: "学校の感染症による出席停止の根拠法は？", options: ["学校保健安全法", "学校給食法"], answer: 1 },
  { id: 20, text: "出生率（人口千人対）は？", options: ["6.8", "1.22"], answer: 1 },
  { id: 21, text: "運動習慣が最も高い年齢層は？", options: ["20代", "70代"], answer: 2 },
  { id: 22, text: "統合失調症の陽性症状は？", options: ["自閉", "幻覚"], answer: 2 },
  { id: 23, text: "粗死亡率（人口千人対）は？", options: ["11.1", "1110"], answer: 1 }
];

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function safeParse(value, fallback) {
  try { return JSON.parse(value); } catch { return fallback; }
}

function shuffle(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomCode(length = 6) {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return out;
}

function cleanName(value) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 20);
}

function makeCard() {
  const qids = shuffle(QUESTIONS.map(q => q.id));
  const card = [];
  let k = 0;
  for (let i = 0; i < 25; i++) card.push(i === 12 ? -1 : qids[k++]);
  return card;
}

function lineSets(card) {
  const lines = [];
  for (let r = 0; r < 5; r++) lines.push(card.slice(r * 5, r * 5 + 5));
  for (let c = 0; c < 5; c++) lines.push([0, 1, 2, 3, 4].map(r => card[r * 5 + c]));
  lines.push([0, 6, 12, 18, 24].map(i => card[i]));
  lines.push([4, 8, 12, 16, 20].map(i => card[i]));
  return lines;
}

function countLines(card, marked) {
  const set = new Set(marked);
  return lineSets(card).filter(line => line.every(qid => qid === -1 || set.has(qid))).length;
}

function countNearLines(card, marked) {
  const set = new Set(marked);
  return lineSets(card).filter(line => {
    const count = line.filter(qid => qid === -1 || set.has(qid)).length;
    return count === 4;
  }).length;
}

async function getRoom(db, code) {
  return db.prepare("SELECT * FROM rooms WHERE code = ?").bind(code).first();
}

async function requireHost(db, code, pin) {
  const room = await getRoom(db, code);
  if (!room) return { error: json({ error: "ルームが見つかりません。" }, 404) };
  if (String(room.pin) !== String(pin || "")) return { error: json({ error: "教員PINが違います。" }, 403) };
  return { room };
}

async function syncPlayer(env, room, player) {
  let marked = safeParse(player.marked, []);
  let lines = Number(player.lines || 0);
  let rank = player.rank;
  const order = safeParse(room.question_order, []);
  const revealedThrough = Math.max(0, Number(room.current_pos) + (room.revealed ? 1 : 0));
  const revealedQuestionIds = new Set(order.slice(0, revealedThrough));

  if (revealedQuestionIds.size > 0) {
    const responseRows = await env.DB.prepare(
      "SELECT question_id, choice FROM responses WHERE room_code = ? AND player_id = ?"
    ).bind(room.code, player.id).all();
    const responses = new Map((responseRows.results || []).map(r => [Number(r.question_id), Number(r.choice)]));
    let changed = false;

    for (const qid of revealedQuestionIds) {
      const question = QUESTIONS[qid];
      if (question && responses.get(qid) === question.answer && !marked.includes(qid)) {
        marked.push(qid);
        changed = true;
      }
    }

    if (changed) {
      const card = safeParse(player.card, []);
      lines = countLines(card, marked);
      await env.DB.prepare(
        "UPDATE players SET marked = ?, lines = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?"
      ).bind(JSON.stringify(marked), lines, player.id).run();

      if (lines >= Number(room.win_lines) && rank === null) {
        const claim = await env.DB.prepare(
          "UPDATE players SET rank = -1 WHERE id = ? AND rank IS NULL RETURNING id"
        ).bind(player.id).first();
        if (claim) {
          const rankRow = await env.DB.prepare(
            "UPDATE rooms SET winner_count = winner_count + 1, updated_at = CURRENT_TIMESTAMP " +
            "WHERE code = ? AND winner_count < 3 RETURNING winner_count"
          ).bind(room.code).first();
          rank = rankRow ? Number(rankRow.winner_count) : 0;
          await env.DB.prepare("UPDATE players SET rank = ? WHERE id = ?").bind(rank, player.id).run();
        }
      }
    } else {
      await env.DB.prepare("UPDATE players SET last_seen = CURRENT_TIMESTAMP WHERE id = ?").bind(player.id).run();
    }
  } else {
    await env.DB.prepare("UPDATE players SET last_seen = CURRENT_TIMESTAMP WHERE id = ?").bind(player.id).run();
  }

  return { ...player, marked: JSON.stringify(marked), lines, rank };
}

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ error: "D1データベースのバインド名 DB が設定されていません。" }, 500);
  const url = new URL(request.url);
  const role = url.searchParams.get("role");
  const code = String(url.searchParams.get("room") || "").toUpperCase().trim();

  if (!code) return json({ error: "ルームコードが必要です。" }, 400);
  let room = await getRoom(env.DB, code);
  if (!room) return json({ error: "ルームが見つかりません。" }, 404);

  const order = safeParse(room.question_order, []);
  const qid = room.current_pos >= 0 ? order[room.current_pos] : null;
  const baseQuestion = qid === null || qid === undefined ? null : QUESTIONS[qid];

  if (role === "student") {
    const playerId = url.searchParams.get("player");
    let player = await env.DB.prepare(
      "SELECT * FROM players WHERE id = ? AND room_code = ?"
    ).bind(playerId, code).first();
    if (!player) return json({ error: "参加情報が見つかりません。もう一度参加してください。" }, 404);

    player = await syncPlayer(env, room, player);
    room = await getRoom(env.DB, code);

    let response = null;
    if (qid !== null && qid !== undefined) {
      response = await env.DB.prepare(
        "SELECT choice FROM responses WHERE room_code = ? AND player_id = ? AND question_id = ?"
      ).bind(code, player.id, qid).first();
    }

    const winners = await env.DB.prepare(
      "SELECT name, rank FROM players WHERE room_code = ? AND rank BETWEEN 1 AND 3 ORDER BY rank"
    ).bind(code).all();

    return json({
      room: {
        code: room.code,
        status: room.status,
        currentPos: room.current_pos,
        totalQuestions: order.length,
        revealed: Boolean(room.revealed),
        winLines: room.win_lines
      },
      question: baseQuestion ? {
        id: baseQuestion.id,
        text: baseQuestion.text,
        options: baseQuestion.options,
        ...(room.revealed ? { answer: baseQuestion.answer } : {})
      } : null,
      answered: Boolean(response),
      selected: response ? Number(response.choice) : null,
      player: {
        id: player.id,
        name: player.name,
        card: safeParse(player.card, []),
        marked: safeParse(player.marked, []),
        lines: Number(player.lines || 0),
        rank: player.rank === null ? null : Number(player.rank)
      },
      winners: winners.results || []
    });
  }

  if (role === "host") {
    const pin = url.searchParams.get("pin");
    const auth = await requireHost(env.DB, code, pin);
    if (auth.error) return auth.error;

    const playersResult = await env.DB.prepare(
      "SELECT id, name, card, marked, lines, rank, joined_at FROM players WHERE room_code = ? ORDER BY joined_at"
    ).bind(code).all();
    const players = (playersResult.results || []).map(p => {
      const card = safeParse(p.card, []);
      const marked = safeParse(p.marked, []);
      return {
        name: p.name,
        lines: Number(p.lines || 0),
        rank: p.rank === null ? null : Number(p.rank),
        near: countNearLines(card, marked)
      };
    });

    let answeredCount = 0;
    let correctCount = 0;
    if (qid !== null && qid !== undefined) {
      const stats = await env.DB.prepare(
        "SELECT COUNT(*) AS answered, SUM(CASE WHEN choice = ? THEN 1 ELSE 0 END) AS correct " +
        "FROM responses WHERE room_code = ? AND question_id = ?"
      ).bind(QUESTIONS[qid].answer, code, qid).first();
      answeredCount = Number(stats?.answered || 0);
      correctCount = Number(stats?.correct || 0);
    }

    return json({
      room: {
        code: room.code,
        status: room.status,
        currentPos: room.current_pos,
        totalQuestions: order.length,
        revealed: Boolean(room.revealed),
        winLines: Number(room.win_lines),
        winnerCount: Number(room.winner_count)
      },
      question: baseQuestion ? {
        id: baseQuestion.id,
        text: baseQuestion.text,
        options: baseQuestion.options,
        ...(room.revealed ? { answer: baseQuestion.answer } : {})
      } : null,
      stats: {
        players: players.length,
        answered: answeredCount,
        correct: correctCount,
        reach: players.filter(p => p.near > 0 && !(p.rank > 0)).length,
        bingo: players.filter(p => p.lines >= Number(room.win_lines)).length
      },
      players,
      winners: players.filter(p => p.rank >= 1 && p.rank <= 3).sort((a, b) => a.rank - b.rank)
    });
  }

  return json({ error: "role を指定してください。" }, 400);
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: "D1データベースのバインド名 DB が設定されていません。" }, 500);
  let body;
  try { body = await request.json(); } catch { return json({ error: "JSON形式が不正です。" }, 400); }
  const action = body.action;

  if (action === "create") {
    await env.DB.prepare("DELETE FROM rooms WHERE created_at < datetime('now', '-2 day')").run();
    let code;
    for (let i = 0; i < 10; i++) {
      const candidate = randomCode(6);
      const exists = await getRoom(env.DB, candidate);
      if (!exists) { code = candidate; break; }
    }
    if (!code) return json({ error: "ルーム作成に失敗しました。もう一度お試しください。" }, 500);

    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const winLines = Number(body.winLines) === 2 ? 2 : 1;
    const order = shuffle(QUESTIONS.map(q => q.id));
    await env.DB.prepare(
      "INSERT INTO rooms (code, pin, question_order, win_lines) VALUES (?, ?, ?, ?)"
    ).bind(code, pin, JSON.stringify(order), winLines).run();
    return json({ code, pin, winLines });
  }

  if (action === "join") {
    const code = String(body.room || "").toUpperCase().trim();
    const name = cleanName(body.name);
    if (!name) return json({ error: "ニックネームを入力してください。" }, 400);
    const room = await getRoom(env.DB, code);
    if (!room) return json({ error: "ルームが見つかりません。" }, 404);
    if (room.status !== "waiting") return json({ error: "受付は終了しています。教員に声をかけてください。" }, 409);

    const id = crypto.randomUUID();
    const card = makeCard();
    await env.DB.prepare(
      "INSERT INTO players (id, room_code, name, card) VALUES (?, ?, ?, ?)"
    ).bind(id, code, name, JSON.stringify(card)).run();
    return json({ playerId: id, room: code, card });
  }

  if (action === "answer") {
    const code = String(body.room || "").toUpperCase().trim();
    const room = await getRoom(env.DB, code);
    if (!room) return json({ error: "ルームが見つかりません。" }, 404);
    if (room.status !== "live" || room.revealed || room.current_pos < 0) {
      return json({ error: "現在は回答できません。" }, 409);
    }

    const player = await env.DB.prepare(
      "SELECT id FROM players WHERE id = ? AND room_code = ?"
    ).bind(body.playerId, code).first();
    if (!player) return json({ error: "参加情報が見つかりません。" }, 404);

    const order = safeParse(room.question_order, []);
    const qid = order[room.current_pos];
    const choice = Number(body.choice);
    if (![1, 2].includes(choice)) return json({ error: "回答を選択してください。" }, 400);

    await env.DB.prepare(
      "INSERT INTO responses (room_code, player_id, question_id, choice) VALUES (?, ?, ?, ?) " +
      "ON CONFLICT(room_code, player_id, question_id) DO UPDATE SET choice = excluded.choice, answered_at = CURRENT_TIMESTAMP"
    ).bind(code, player.id, qid, choice).run();
    return json({ ok: true, questionId: qid, choice });
  }

  if (["start", "reveal", "next", "end", "setWinLines"].includes(action)) {
    const code = String(body.room || "").toUpperCase().trim();
    const auth = await requireHost(env.DB, code, body.pin);
    if (auth.error) return auth.error;
    const room = auth.room;
    const order = safeParse(room.question_order, []);

    if (action === "setWinLines") {
      if (room.status !== "waiting") return json({ error: "開始後は勝利条件を変更できません。" }, 409);
      const winLines = Number(body.winLines) === 2 ? 2 : 1;
      await env.DB.prepare("UPDATE rooms SET win_lines = ?, updated_at = CURRENT_TIMESTAMP WHERE code = ?")
        .bind(winLines, code).run();
      return json({ ok: true });
    }

    if (action === "start") {
      const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM players WHERE room_code = ?").bind(code).first();
      if (Number(count?.n || 0) < 1) return json({ error: "参加者がまだいません。" }, 409);
      await env.DB.prepare(
        "UPDATE rooms SET status = 'live', current_pos = 0, revealed = 0, updated_at = CURRENT_TIMESTAMP WHERE code = ?"
      ).bind(code).run();
      return json({ ok: true });
    }

    if (action === "reveal") {
      if (room.status !== "live") return json({ error: "ゲームは開始されていません。" }, 409);
      await env.DB.prepare("UPDATE rooms SET revealed = 1, updated_at = CURRENT_TIMESTAMP WHERE code = ?")
        .bind(code).run();
      return json({ ok: true });
    }

    if (action === "next") {
      if (room.status !== "live") return json({ error: "ゲームは開始されていません。" }, 409);
      if (!room.revealed) return json({ error: "先に正解を発表してください。" }, 409);
      const nextPos = Number(room.current_pos) + 1;
      if (nextPos >= order.length || Number(room.winner_count) >= 3) {
        await env.DB.prepare("UPDATE rooms SET status = 'ended', revealed = 1, updated_at = CURRENT_TIMESTAMP WHERE code = ?")
          .bind(code).run();
      } else {
        await env.DB.prepare(
          "UPDATE rooms SET current_pos = ?, revealed = 0, updated_at = CURRENT_TIMESTAMP WHERE code = ?"
        ).bind(nextPos, code).run();
      }
      return json({ ok: true });
    }

    if (action === "end") {
      await env.DB.prepare("UPDATE rooms SET status = 'ended', revealed = 1, updated_at = CURRENT_TIMESTAMP WHERE code = ?")
        .bind(code).run();
      return json({ ok: true });
    }
  }

  return json({ error: "不明な操作です。" }, 400);
}
