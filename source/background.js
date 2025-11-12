chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if(msg.action === 'apply_skimtool') {
    const cfg = { mode: msg.mode, levels: 8 };
    chrome.storage.local.set({ skimtool_cfg: cfg });

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if(tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: 'run_skimtool' });
  }

  if(msg.action === 'clear_skimtool') {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if(tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: 'clear_skimtool' });
  }
});
