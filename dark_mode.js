function setTheme(theme, save = true) {
    // document.documentElement.setAttribute('data-theme', theme);
    // if (save) localStorage.setItem('theme', theme);
    // // Update button state
    // const toggle = document.getElementById('theme-toggle');
    // toggle.style.borderColor = `var(--text-color)`;
    // toggle.style.background = `var(--container-bg)`;

    document.documentElement.style.transition = 'none'; // Disable transition during change
    document.documentElement.setAttribute('data-theme', theme);
    if (save) localStorage.setItem('theme', theme);
    
    // Update button state
    const toggle = document.getElementById('theme-toggle');
    toggle.style.borderColor = `var(--text-color)`;
    toggle.style.background = `var(--container-bg)`;
    
    // Force synchronous layout update
    document.documentElement.offsetHeight; // Trigger reflow
    
    // Re-enable transitions
    document.documentElement.style.transition = '';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

// Initialize theme with proper system detection
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        setTheme(savedTheme, false);
    } else {
        // Apply system theme without saving to localStorage
        document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : 'light');
        document.getElementById('theme-toggle').textContent = systemDark ? '🌙' : '☀️';
    }

    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Watch for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            document.getElementById('theme-toggle').textContent = e.matches ? '🌙' : '☀️';
        }
    });
});