// COMPLETE SWIPER FIX - Replace the broken JavaScript section with this

document.addEventListener('DOMContentLoaded', function() {
    // Wait for all images and content to load
    window.addEventListener('load', function() {
        
        // Initialize Main Tour Slider (tour-slider div)
        const mainSwiper = new Swiper('.main-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            autoplay: {
                delay: 30000,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: '#nextBtn',
                prevEl: '#prevBtn',
            },
            effect: 'slide',
            speed: 600,
            grabCursor: true,
            breakpoints: {
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30,
                },
                1024: {
                    slidesPerView: 2,
                    spaceBetween: 40,
                }
            }
        });

        // Package swipers configuration
        const packageSwiperConfig = {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            autoplay: {
                delay: 30000,
                disableOnInteraction: false,
            },
            effect: 'slide',
            speed: 600,
            grabCursor: true,
            breakpoints: {
                640: {
                    slidesPerView: 2,
                    spaceBetween: 25
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30
                }
            }
        };

        // Initialize Day Trips Swiper (section second)
        const dayTripsSwiper = new Swiper('#dayTripsSwiper', {
            ...packageSwiperConfig,
            navigation: {
                nextEl: '#dayTripsSwiper .swiper-button-next',
                prevEl: '#dayTripsSwiper .swiper-button-prev',
            },
            pagination: {
                el: '#dayTripsSwiper .swiper-pagination',
                clickable: true,
            },
        });
        
        // Initialize Group Trips Swiper (section third)
        const groupTripsSwiper = new Swiper('#groupTripsSwiper', {
            ...packageSwiperConfig,
            navigation: {
                nextEl: '#groupTripsSwiper .swiper-button-next',
                prevEl: '#groupTripsSwiper .swiper-button-prev',
            },
            pagination: {
                el: '#groupTripsSwiper .swiper-pagination',
                clickable: true,
            },
        });
        
        // Initialize Luxury Tours Swiper (section fourth)
        const luxuryToursSwiper = new Swiper('#luxuryToursSwiper', {
            ...packageSwiperConfig,
            navigation: {
                nextEl: '#luxuryToursSwiper .swiper-button-next',
                prevEl: '#luxuryToursSwiper .swiper-button-prev',
            },
            pagination: {
                el: '#luxuryToursSwiper .swiper-pagination',
                clickable: true,
            },
        });

        // Main swiper manual navigation
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                mainSwiper.slideNext();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                mainSwiper.slidePrev();
            });
        }

        // Hover controls for main swiper
        const mainSwiperContainer = document.querySelector('.main-swiper');
        if (mainSwiperContainer) {
            mainSwiperContainer.addEventListener('mouseenter', () => mainSwiper.autoplay.stop());
            mainSwiperContainer.addEventListener('mouseleave', () => mainSwiper.autoplay.start());
        }

        // Add hover effects for package swipers
        [dayTripsSwiper, groupTripsSwiper, luxuryToursSwiper].forEach((swiper, index) => {
            const swiperIds = ['#dayTripsSwiper', '#groupTripsSwiper', '#luxuryToursSwiper'];
            const container = document.querySelector(swiperIds[index]);
            
            if (container) {
                container.addEventListener('mouseenter', () => {
                    swiper.autoplay.stop();
                });

                container.addEventListener('mouseleave', () => {
                    swiper.autoplay.start();
                });
            }
        });

        console.log('All swipers initialized successfully!');
    });
});