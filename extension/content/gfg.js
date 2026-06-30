let submissionDetected = false;

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      // GFG usually shows a modal or a specific div on success
      const successMsg = document.querySelector('.problem-submission-modal-header') ||
                         Array.from(document.querySelectorAll('div')).find(el => el.textContent.includes('Correct Answer'));
                         
      if (successMsg && !submissionDetected) {
        submissionDetected = true;
        
        setTimeout(() => {
          const titleElement = document.querySelector('.problem-tab__name');
          const title = titleElement ? titleElement.textContent.trim() : 'GFG Problem';
          
          const diffElement = document.querySelector('.problem-tab__difficulty');
          const difficulty = diffElement ? diffElement.textContent.trim() : 'Medium';
          
          const url = window.location.href;
          const language = 'cpp'; // Might need more robust language detection on GFG
          
          const codeElement = document.querySelector('.CodeMirror-code');
          const code = codeElement ? codeElement.innerText : '// Code extraction failed';
          
          const runtimeElement = document.querySelector('.problem-submission-modal-time');
          const runtime = runtimeElement ? runtimeElement.textContent.trim() : 'N/A';
          
          const payload = {
            platform: 'geeksforgeeks',
            title,
            url,
            language,
            code,
            runtime,
            memory: 'N/A', // GFG doesn't always provide memory
            difficulty
          };

          chrome.runtime.sendMessage({ action: 'solutionSubmitted', payload });
          
          setTimeout(() => { submissionDetected = false; }, 60000);
        }, 1000);
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });
