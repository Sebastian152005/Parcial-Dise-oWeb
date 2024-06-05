let slider = document.querySelector('.slider .list');
let items = document.querySelectorAll('.slider .list .item');
let next = document.getElementById('next');
let prev = document.getElementById('prev');
let dots = document.querySelectorAll('.slider .dots li');

let lengthItems = items.length - 1;
let active = 0;
let refreshInterval = setInterval(nextSlide, 5000);

function nextSlide() {
    active = (active + 1) <= lengthItems ? active + 1 : 0;
    reloadSlider();
}

function prevSlide() {
    active = (active - 1) >= 0 ? active - 1 : lengthItems;
    reloadSlider();
}

function reloadSlider() {
    slider.style.left = -items[active].offsetLeft + 'px';
    document.querySelector('.slider .dots li.active').classList.remove('active');
    dots[active].classList.add('active');
    clearInterval(refreshInterval);
    refreshInterval = setInterval(nextSlide, 5000);
}

next.addEventListener('click', nextSlide);
prev.addEventListener('click', prevSlide);

dots.forEach((li, key) => {
    li.addEventListener('click', () => {
        active = key;
        reloadSlider();
    });
});

window.addEventListener('resize', reloadSlider);