document.addEventListener('DOMContentLoaded', () => {
  const healthEl    = document.getElementById('health');
  const editBtn     = document.getElementById('editBtn');
  const editArea    = document.getElementById('editArea');
  const foodInput   = document.getElementById('foodInput');
  const poisonInput = document.getElementById('poisonInput');
  const saveBtn     = document.getElementById('saveBtn');
  const cancelBtn   = document.getElementById('cancelBtn');

  // State groups from inline SVG
  const states = {
    neutral: document.getElementById('state-neutral'),
    happy:   document.getElementById('state-happy'),
    sad:     document.getElementById('state-sad'),
  };

    // Show only the selected face state
  function showState(name) {
    // Iterate through each state and toggle visibility if the element exists
    Object.entries(states).forEach(([key, element]) => {
      if (!element) return;  // skip if missing
      element.style.display = (key === name) ? 'block' : 'none';
    });
  }

  // Update avatar and health label
  function updateAvatar(health) {
    if (health > 70)      showState('happy');
    else if (health < 30) showState('sad');
    else                  showState('neutral');
    healthEl.textContent = `Health: ${health}`;
  }

  // Load health and site lists on startup
  chrome.storage.local.get(['health', 'foodSites', 'poisonSites'], data => {
    updateAvatar(data.health ?? 50);
    foodInput.value   = (data.foodSites   || FOOD_SITES).join(', ');
    poisonInput.value = (data.poisonSites || POISON_SITES).join(', ');
  });

  // Listen for health changes
  chrome.storage.onChanged.addListener(changes => {
    if (changes.health) updateAvatar(changes.health.newValue);
  });

  // Toggle edit area
  editBtn.addEventListener('click', () => editArea.classList.toggle('hidden'));

  // Cancel edits
  cancelBtn.addEventListener('click', () => editArea.classList.add('hidden'));

  // Save new site lists
  saveBtn.addEventListener('click', () => {
    const foodArr   = foodInput.value.split(',').map(s => s.trim()).filter(Boolean);
    const poisonArr = poisonInput.value.split(',').map(s => s.trim()).filter(Boolean);
    chrome.storage.local.set({ foodSites: foodArr, poisonSites: poisonArr }, () => {
      // Provide feedback (replace alert with non-blocking UI toast in production)
      alert('Site lists updated!');
      editArea.classList.add('hidden');
    });
  });
});