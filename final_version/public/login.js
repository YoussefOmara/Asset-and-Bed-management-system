$(document).ready(function() {
    var slideIndex = 0;
    var slides = $('.carousel-item');
    var totalSlides = slides.length;
  
    function showSlide() {
      slides.removeClass('active');
      slides.eq(slideIndex).addClass('active');
    }
  
    function nextSlide() {
      slideIndex++;
      if (slideIndex >= totalSlides) {
        slideIndex = 0;
      }
      showSlide();
    }
  
    setInterval(nextSlide, 3000); // Change slide every 3 seconds (3000 milliseconds)
  });
  
// function moveCards() {
//     const firstCard = slider.firstElementChild;
//     slider.style.transform = `translateX(-${firstCard.offsetWidth}px)`;
//     slider.appendChild(firstCard);
//   }
//   setInterval(moveCards, 3000);
// function moveCards() {
//     const firstCard = slider.firstElementChild;
//     firstCard.classList.add('active');
//     setTimeout(() => {
//       firstCard.style.opacity = 0;
//       setTimeout(() => {
//         slider.style.transform = `translateX(-${firstCard.offsetWidth}px)`;
//         slider.appendChild(firstCard);
//         firstCard.style.opacity = 1;
//         firstCard.classList.remove('active');
//       }, 400);
//     }, 2600);
//   }
  
//   setInterval(moveCards, 3000);