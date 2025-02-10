document.addEventListener('DOMContentLoaded', function() {
    // 淡入效果
    document.body.classList.add('fade-in');

    // 滚动动画
    const scrollElements = document.querySelectorAll('.scroll-animation');
    const elementInView = (el) => {
        const elementTop = el.getBoundingClientRect().top;
        return elementTop <= (window.innerHeight || document.documentElement.clientHeight);
    };

    const displayScrollElement = (element) => {
        element.classList.add('visible');
    };

    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el)) {
                displayScrollElement(el);
            }
        });
    };

    window.addEventListener('scroll', handleScrollAnimation);
    handleScrollAnimation(); // 初始加载时检查
});