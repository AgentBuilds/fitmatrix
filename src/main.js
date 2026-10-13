const status = document.querySelector('#api-status');
const button = document.querySelector('#check-api');

async function checkApi() {
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.textContent = 'Checking…';
  status.textContent = 'Checking the local API…';
  status.classList.remove('is-error');

  try {
    const response = await fetch('/api/health', { signal: AbortSignal.timeout(5000), cache: 'no-store' });
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    if (data.status !== 'ok' || data.service !== 'fitmatrix') throw new Error('Unexpected API response');
    status.textContent = 'Connected · FitMatrix API is ready.';
    button.textContent = 'Check again';
  } catch {
    status.textContent = 'Connection unavailable. Check that the server is running and try again.';
    status.classList.add('is-error');
    button.textContent = 'Retry connection';
  } finally {
    button.disabled = false;
    button.setAttribute('aria-busy', 'false');
  }
}

button.addEventListener('click', checkApi);
checkApi();
