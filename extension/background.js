chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'solutionSubmitted') {
    processSolution(request.payload)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Keep the message channel open for async response
  }
});

async function processSolution(payload) {
  try {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      title: 'Solution Tracker',
      message: 'Processing your solution...'
    });

    const response = await fetch('http://localhost:3000/solution', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.details || errData.error || `Server returned ${response.status}`);
    }

    const data = await response.json();
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      title: 'Solution Tracker',
      message: data.message || 'Solution successfully documented!'
    });

    return { success: true, data };
  } catch (error) {
    console.error('Failed to document solution:', error);
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      title: 'Solution Tracker Error',
      message: 'Failed to process solution. Is the local backend running?'
    });
    throw error;
  }
}
