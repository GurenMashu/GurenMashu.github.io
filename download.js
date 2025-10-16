(function(){
    'use strict';

    // Configuration
    const MAX_DOWNLOADS_PER_PERIOD = 10; // per browser (localStorage)
    const PERIOD_MS = 24 * 60 * 60 * 1000; // 24 hours
    const STORAGE_KEY = 'resume_downloads_v1';
    const RESUME_PATH = '/resume.pdf';

    const downloadBtn = document.getElementById('downloadBtn');
    const statusEl = document.getElementById('status');

    function readData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return { count: 0, windowStart: Date.now() };
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed.count !== 'number' || typeof parsed.windowStart !== 'number') {
                return { count: 0, windowStart: Date.now() };
            }
            return parsed;
        } catch (e) {
            // If localStorage is unavailable or corrupted, return safe defaults
            return { count: 0, windowStart: Date.now() };
        }
    }

    function writeData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            // ignore write failures
        }
    }

    function resetWindow() {
        const now = Date.now();
        writeData({ count: 0, windowStart: now });
        return { count: 0, windowStart: now };
    }

    function remainingWindowMs(windowStart) {
        return Math.max(0, (windowStart + PERIOD_MS) - Date.now());
    }

    function formatDuration(ms) {
        const s = Math.ceil(ms / 1000);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        if (h > 0) return `${h}h ${m}m`;
        if (m > 0) return `${m}m ${sec}s`;
        return `${sec}s`;
    }

    function updateUI(data) {
        const remaining = remainingWindowMs(data.windowStart);
        if (remaining === 0) {
            // window expired
            data = resetWindow();
        }

        if (data.count >= MAX_DOWNLOADS_PER_PERIOD) {
            downloadBtn.classList.add('disabled');
            downloadBtn.setAttribute('aria-disabled', 'true');
            downloadBtn.setAttribute('href', '#');
            statusEl.textContent = `Download limit reached. Try again in ${formatDuration(remainingWindowMs(data.windowStart))}.`;
        } else {
            downloadBtn.classList.remove('disabled');
            downloadBtn.removeAttribute('aria-disabled');
            downloadBtn.setAttribute('href', RESUME_PATH);
            statusEl.textContent = `You have ${MAX_DOWNLOADS_PER_PERIOD - data.count} downloads left in this 24-hour period.`;
        }
    }

    function onDownloadClick(e) {
        const data = readData();
        if (remainingWindowMs(data.windowStart) === 0) {
            // reset the window
            data.count = 0;
            data.windowStart = Date.now();
        }

        if (data.count >= MAX_DOWNLOADS_PER_PERIOD) {
            e.preventDefault();
            updateUI(data);
            return;
        }

        // allow the download, increment counter
        data.count = (data.count || 0) + 1;
        writeData(data);

        // small UX: disable button briefly to avoid accidental double-clicks
        downloadBtn.classList.add('disabled');
        downloadBtn.setAttribute('aria-disabled', 'true');
        setTimeout(() => updateUI(data), 1200);

        // Note: we let the browser do the download via normal navigation
        // If you prefer fetch+blob download (to measure more), you can replace this behavior.
    }

    // Initialization
    try {
        const data = readData();
        updateUI(data);
        if (downloadBtn) {
            downloadBtn.addEventListener('click', onDownloadClick, false);
        }
    } catch (e) {
        // If something goes wrong, keep the page functional: link to resume directly
        if (downloadBtn) downloadBtn.setAttribute('href', RESUME_PATH);
    }
})();
