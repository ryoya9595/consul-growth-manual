// ===== コピー用テキスト（<pre id="..."> に流し込む） =====
const SHEET_PROMPT = `以下の運営アカウントの投稿を、全部スプレッドシートにまとめてください。

【列の構成】
- 投稿日
- 投稿動画タイトル
- 動画URL
- 「◯◯再生を超えたか」（例：3桁再生を超えたか / 1000回再生を超えたか）
- 参考元動画URL（1）
- 参考元動画URL（2）
- 参考元動画URL（3）
- 備考

【ルール】
- 一定以上の再生回数を出した動画にだけ、基準の列に「越えた」と記入
- その動画を作るときに参考にした動画があれば、参考元動画URLに記入
- 参考が無かった投稿は、備考に「参考なし」と記入`;

const CHECK_PROMPT = `この参考動画は、参考対象としてふさわしいか3つの条件でチェックしてください。

1. 半年以内に投稿された動画か？（YES / NO）
2. 登録者が多すぎる「何を出しても伸びるチャンネル」ではないか？（YES / NO）
3. そのチャンネル内の「人気順」で上位30本以内に入っているか？（YES / NO）

→ 3つすべてYESなら参考対象としてOK。
→ 1つでもNOがあれば、参考動画を選び直してください。
（外側＝サムネ・タイトル・構成は真似てOK。中身で自分らしさを出す）`;

const TEXTS = { sheetPrompt: SHEET_PROMPT, checkPrompt: CHECK_PROMPT };

// 各 <pre> に本文を流し込む
Object.entries(TEXTS).forEach(([id, text]) => {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
});

// ===== コピー処理 =====
async function copyText(text, target) {
  let ok = false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      ok = true;
    }
  } catch { ok = false; }
  if (!ok && target) {
    const range = document.createRange();
    range.selectNodeContents(target);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    sel.removeAllRanges();
  }
  return ok;
}

function showToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

document.querySelectorAll(".copy-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const targetId = button.dataset.target;
    const target = document.getElementById(targetId);
    const text = TEXTS[targetId] || (target ? target.textContent : "");
    const ok = await copyText(text, target);
    const original = button.textContent;
    button.textContent = ok ? "コピーしました" : "手動でコピー";
    button.classList.toggle("done", ok);
    showToast(ok ? "📋 コピーしました" : "コピーできませんでした");
    setTimeout(() => {
      button.textContent = original;
      button.classList.remove("done");
    }, 2000);
  });
});

// ===== ナビ現在地ハイライト =====
const navLinks = Array.from(document.querySelectorAll(".topnav a[href^='#']"));
const sections = navLinks
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);
if ("IntersectionObserver" in window && sections.length) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const id = "#" + e.target.id;
        navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === id));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => obs.observe(s));
}
