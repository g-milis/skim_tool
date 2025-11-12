document.addEventListener('DOMContentLoaded', () => {
  const applyBtn = document.getElementById('apply-btn');
  const clearBtn = document.getElementById('clear-btn');
  const modeSelect = document.getElementById('mode-select');

  // Apply: read mode at click, store config, send message
  applyBtn.addEventListener('click', () => {
    const mode = modeSelect.value;

    // Store the chosen mode for the content script
    chrome.storage.local.set({ skimtool_cfg: { mode: mode, levels: 8 } });

    // Send message to content script to run highlight
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: "run_skimtool" });
    });
  });

  // Clear highlights
  clearBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: "clear_skimtool" });
    });
  });
});
