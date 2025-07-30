let currentSlide = 0; //Tracks the current slide index
const slides = document.querySelectorAll('.slide'); //get all slides
const prevButton = document.querySelector('.prev'); //previous button
const nextButton = document.querySelector('.next') //next button

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.remove('active'); //Remove 'active' class from all slides
        if (i === index) {
            slide.classList.add('active'); //add 'active' class to the current slide
        }
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length; //move to the next slide
    showSlide(currentSlide); //display the new slide
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length; //move to the previous slide
    showSlide(currentSlide); //display the new slide
}

//event listerners for buttons
prevButton.addEventListener('click', prevSlide);
nextButton.addEventListener('click', nextSlide);

//automatically change slide every 5 seconds
setInterval(nextSlide, 5000);

//initialize the first slide
showSlide(currentSlide);

//new js
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.navbar-toggler');
    const navbar = document.querySelector('#navbarNav');


    toggle.addEventListener('click', () => {
        navbar.classList.toggle('show');
        toggle.querySelector('span').classList.toggle('fa-bars');
        toggle.querySelector('span').classList.toggle('fa-times');
    });


    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar') && !e.target.closest('.navbar-toggler')) {
            navbar.classList.remove('show');
            toggle.querySelector('span').classList.add('fa-bars');
            toggle.querySelector('span').classList.remove('fa-times');
        }
    });
});


window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});