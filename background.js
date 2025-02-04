// Tells the content script to update the icon when the tab changes
chrome.tabs.onUpdated.addListener(async (tabID, changeInfo, tab) => {
    if (!changeInfo.url)
      return

    if (!changeInfo.url.includes('icloud.com'))
      return

    const response = await chrome.tabs.sendMessage(tabID, {method: "UpdateFaviconFromEXT"})
    console.log(response)
  }
);
