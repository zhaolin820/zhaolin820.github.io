// function setTheme(theme, save = true) {
//     // document.documentElement.setAttribute('data-theme', theme);
//     // if (save) localStorage.setItem('theme', theme);
//     // // Update button state
//     // const toggle = document.getElementById('theme-toggle');
//     // toggle.style.borderColor = `var(--text-color)`;
//     // toggle.style.background = `var(--container-bg)`;

//     document.documentElement.style.transition = 'none'; // Disable transition during change
//     document.documentElement.setAttribute('data-theme', theme);
//     if (save) localStorage.setItem('theme', theme);
    
//     // Update button state
//     const toggle = document.getElementById('theme-toggle');
//     toggle.style.borderColor = `var(--text-color)`;
//     toggle.style.background = `var(--container-bg)`;
    
//     // Force synchronous layout update
//     document.documentElement.offsetHeight; // Trigger reflow
    
//     // Re-enable transitions
//     document.documentElement.style.transition = '';
// }

// function toggleTheme() {
//     const currentTheme = document.documentElement.getAttribute('data-theme');
//     setTheme(currentTheme === 'dark' ? 'light' : 'dark');
// }

// // // Initialize theme with proper system detection
// // document.addEventListener('DOMContentLoaded', function() {
// //     const savedTheme = localStorage.getItem('theme');
// //     const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
// //     if (savedTheme) {
// //         setTheme(savedTheme, false);
// //     } else {
// //         // Apply system theme without saving to localStorage
// //         document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : 'light');
// //         document.getElementById('theme-toggle').textContent = systemDark ? '🌙' : '☀️';
// //     }

// //     document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
// //     // Watch for system theme changes
// //     window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
// //         if (!localStorage.getItem('theme')) {
// //             document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
// //             document.getElementById('theme-toggle').textContent = e.matches ? '🌙' : '☀️';
// //         }
// //     });
// // });

// document.addEventListener('DOMContentLoaded', function() {
//     const savedTheme = localStorage.getItem('theme');
//     const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
//     // Initial theme setup
//     if (savedTheme) {
//         setTheme(savedTheme, false);
//     } else {
//         document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : 'light');
//     }

//     // Button event listener
//     document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

//     // System theme change listener
//     window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
//         if (!localStorage.getItem('theme')) {
//             document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
//         }
//     });
// });


// 主题切换函数
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // 仅存入sessionStorage
    sessionStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // 更新按钮样式
    updateThemeButton(newTheme);
}

// 系统主题变化监听
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    // 仅当无session存储时响应系统变化
    if(!sessionStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        updateThemeButton(newTheme);
    }
});

// 按钮状态更新
function updateThemeButton(theme) {
    const toggle = document.getElementById('theme-toggle');
    toggle.style.borderColor = `var(--text-color)`;
    toggle.style.background = `var(--container-bg)`;
}

// 初始化事件监听
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
});