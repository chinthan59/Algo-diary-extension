// Note: Content scripts might need updates if LeetCode changes their DOM.

function getLanguage() {
  const langElement = document.querySelector('[data-cy="lang-select"]');
  return langElement ? langElement.textContent.trim().toLowerCase() : 'python';
}

function getTitle() {
  try {
    const slug = window.location.pathname.split('/')[2];
    if (!slug) return 'Unknown Problem';
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  } catch (e) {
    return 'Unknown Problem';
  }
}

function getDifficulty() {
  const diffElement = document.querySelector('[class*="text-difficulty-"]');
  return diffElement ? diffElement.textContent : 'Unknown';
}

function getCode() {
  // 1. Try Monaco editor lines directly
  const monacoLines = document.querySelectorAll('.view-line');
  if (monacoLines.length > 0) {
    const code = Array.from(monacoLines).map(line => line.textContent).join('\n');
    if (code.trim().length > 10) return code;
  }

  // 2. Try the editor container text
  const editor = document.querySelector('.view-lines') || document.querySelector('.cm-content');
  if (editor && editor.innerText.trim().length > 10) {
    const text = editor.innerText;
    if (!text.includes('My PlaygroundsSettingsAppearance')) {
      return text;
    }
  }

  // 3. Fallback for code tags, but ignore very short strings (like constraints)
  const codeTags = Array.from(document.querySelectorAll('code'));
  if (codeTags.length > 0) {
    let bestCode = '';
    for (const tag of codeTags) {
      const text = tag.innerText || tag.textContent || '';
      // Heuristic: Code blocks usually don't contain LeetCode navigation text and should be decently long
      if (text.length > bestCode.length && text.length > 35 && !text.includes('My PlaygroundsSettings') && !text.includes('Premium subscription!')) {
        bestCode = text;
      }
    }
    if (bestCode) return bestCode.trim();
  }

  return '// Could not extract code. Please make sure the code editor is visible.';
}

let submissionDetected = false;
let lastCapturedCode = '';

// Capture the code the moment the user clicks any "Submit" button
document.addEventListener('click', (e) => {
  const button = e.target.closest('button');
  // LeetCode submit button usually contains the text "Submit" or has specific data attributes
  if (button && (button.textContent.includes('Submit') || button.getAttribute('data-e2e-locator') === 'console-submit-button')) {
    const codeAtSubmit = getCode();
    if (!codeAtSubmit.includes('Could not extract code')) {
      lastCapturedCode = codeAtSubmit;
      console.log('Solution Tracker: Captured code at submission time.');
    }
  }
}, true);

// Intercepting fetch calls or observing DOM for success state
console.log("Solution Tracker: LeetCode content script loaded");

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      const successElement = document.querySelector('.success-state') ||
        Array.from(document.querySelectorAll('span, div')).find(el => el.textContent === 'Accepted');

      if (successElement && !submissionDetected) {
        console.log("Solution Tracker: Detected 'Accepted' element!");
        submissionDetected = true;

        // Add a small delay to allow DOM to fully render the results
        setTimeout(() => {
          const title = getTitle();
          const language = getLanguage();
          const difficulty = getDifficulty();
          
          // Use the code we captured when they clicked submit, or try to get it now if we missed it
          let code = lastCapturedCode;
          if (!code || code.trim() === '') {
            code = getCode();
          }

          // Extract runtime/memory if possible, otherwise use placeholders
          let runtime = 'N/A';
          let memory = 'N/A';
          const spans = Array.from(document.querySelectorAll('span'));
          const msSpan = spans.find(el => el.textContent.trim().endsWith('ms') && el.textContent.length < 15);
          if (msSpan) runtime = msSpan.textContent.trim();

          const mbSpan = spans.find(el => el.textContent.trim().endsWith('MB') && el.textContent.length < 15);
          if (mbSpan) memory = mbSpan.textContent.trim();

          console.log("Solution Tracker: Extracted data", { title, language, difficulty, runtime, memory });

          const payload = {
            platform: 'leetcode',
            title,
            url: window.location.href,
            language,
            code,
            runtime,
            memory,
            difficulty
          };

          chrome.runtime.sendMessage({ action: 'solutionSubmitted', payload });

          // Reset after a minute so another submission can be tracked if they stay on page
          setTimeout(() => { submissionDetected = false; lastCapturedCode = ''; }, 60000);
        }, 1000);
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });
