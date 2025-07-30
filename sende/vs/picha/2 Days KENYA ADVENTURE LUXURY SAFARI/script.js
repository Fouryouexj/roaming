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