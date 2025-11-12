(async () => {
  const getConfig = async () => {
    const v = await browser.storage.local.get("skimtool_cfg");
    return v.skimtool_cfg || { mode: "heuristic", levels: 8 };
  };

  const heuristicScore = w => {
    if (!w.trim()) return 0;
    const stop = ["the","a","an","in","on","and","or","is","are","to","of","for","that","with","as"];
    return stop.includes(w.toLowerCase()) ? 0 : Math.min(1, w.length / 8);
  };

  async function scoreText(text, mode) {
    if (mode === "server") {
      return new Promise(resolve => {
        chrome.runtime.sendMessage({ action: "server_score", text }, response => {
          if (response && response.scores) resolve(response.scores);
          else resolve(text.split(/(\b|\s+)/).map(w => heuristicScore(w)));
        });
      });
    }
    return text.split(/(\b|\s+)/).map(heuristicScore);
  }

  async function highlightPage() {
    const cfg = await getConfig();
    const levels = cfg.levels || 8;
    const minOpacity = 0.2;
    const maxOpacity = 1.0;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.trim().length > 0 && node.parentNode.offsetParent !== null) {
        textNodes.push(node);
      }
    }

    for (const t of textNodes) {
      const words = t.textContent.split(/(\b|\s+)/);
      const scores = await scoreText(t.textContent, cfg.mode);

      if (scores.length !== words.length) continue;

      const frag = document.createDocumentFragment();
      for (let i = 0; i < words.length; i++) {
        const span = document.createElement("span");
        span.className = "skimtool_span";

        let level = Math.floor(scores[i] * levels);
        level = Math.min(Math.max(level, 0), levels - 1);

        const opacity = minOpacity + (level / (levels - 1)) * (maxOpacity - minOpacity);
        span.style.opacity = opacity;

        span.textContent = words[i];
        frag.appendChild(span);
      }

      const wrapper = document.createElement("span");
      wrapper.className = "skimtool_overlay";
      wrapper.appendChild(frag);
      t.parentNode.replaceChild(wrapper, t);
    }
  }

  function clearHighlights() {
    document.querySelectorAll('.skimtool_overlay').forEach(overlay => {
      const parent = overlay.parentNode;
      while (overlay.firstChild) parent.insertBefore(overlay.firstChild, overlay);
      overlay.remove();
    });

    document.querySelectorAll('.skimtool_span').forEach(span => {
      const parent = span.parentNode;
      while (span.firstChild) parent.insertBefore(span.firstChild, span);
      span.remove();
    });
  }

  browser.runtime.onMessage.addListener(msg => {
    if(msg.action === "run_skimtool") highlightPage();
    if(msg.action === "clear_skimtool") clearHighlights();
  });

})();
