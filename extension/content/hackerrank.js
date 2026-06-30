let submissionDetected = false;

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      const successElement = document.querySelector('.congratulations') || 
                             Array.from(document.querySelectorAll('.ui-icon-check')).length > 0;
      
      if (successElement && !submissionDetected) {
        // Need to make sure it's an actual successful submission and not just UI state
        // HackerRank can be tricky, so this is a simplified approach
        const isSuccessText = document.body.textContent.includes('Congratulations!');
        
        if (isSuccessText) {
          submissionDetected = true;
          
          setTimeout(() => {
            const titleElement = document.querySelector('.ui-icon-label'); // Placeholder selector
            const title = titleElement ? titleElement.textContent.trim() : window.location.pathname.split('/').pop();
            
            const url = window.location.href;
            const language = 'python'; // Needs better parsing
            
            // Getting code from monaco or CodeMirror in HackerRank
            const codeLines = Array.from(document.querySelectorAll('.view-lines .view-line'));
            const code = codeLines.length > 0 ? codeLines.map(line => line.textContent).join('\n') : '// Extraction failed';
            
            const payload = {
              platform: 'hackerrank',
              title,
              url,
              language,
              code,
              runtime: 'N/A',
              memory: 'N/A',
              difficulty: 'Unknown'
            };

            chrome.runtime.sendMessage({ action: 'solutionSubmitted', payload });
            
            setTimeout(() => { submissionDetected = false; }, 60000);
          }, 2000);
        }
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });
