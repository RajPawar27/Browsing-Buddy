// Default site lists
let FOOD_SITES   = [
  "wikipedia.org",
  "developer.mozilla.org",
  "stackoverflow.com"
];
let POISON_SITES = [
  "facebook.com",
  "instagram.com",
  "youtube.com"
];
let health = 50;

// Load saved lists from storage
function loadLists() {
  chrome.storage.local.get(["foodSites", "poisonSites"], data => {
    if (Array.isArray(data.foodSites))   FOOD_SITES   = data.foodSites;
    if (Array.isArray(data.poisonSites)) POISON_SITES = data.poisonSites;
  });
}
loadLists();

// Refresh lists on install or when storage changes
chrome.runtime.onInstalled.addListener(loadLists);
chrome.storage.onChanged.addListener(changes => {
  if (changes.foodSites || changes.poisonSites) loadLists();
});

// Monitor tab updates and adjust health
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const host = new URL(tab.url).hostname.replace(/^www\./, '');
      if (FOOD_SITES.includes(host))       health = Math.min(100, health + 10);
      else if (POISON_SITES.includes(host)) health = Math.max(0,   health - 10);
      chrome.storage.local.set({ health });
    } catch (e) {
      console.error('Invalid URL:', e);
    }
  }
});