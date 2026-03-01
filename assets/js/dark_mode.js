function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    sessionStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);

    updateThemeButton(newTheme);
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!sessionStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        updateThemeButton(newTheme);
    }
});

function updateThemeButton(theme) {
    const toggle = document.getElementById('theme-toggle');
    toggle.style.borderColor = `var(--text-color)`;
    toggle.style.background = `var(--container-bg)`;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
});