const sliderContainer = document.querySelector(".slider-container");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const sliderItems = document.querySelectorAll(".slider-item");
const itemWidth = 270;
const totalItems = sliderItems.length / 2;
const initialIndex = totalItems;
let currentIndex = initialIndex;

sliderContainer.style.transform = `translateX(-${itemWidth * initialIndex}px)`;
updateFocusClass();

function updateFocusClass() {
  sliderItems.forEach((item) => item.classList.remove("focus"));
  const focusIndex = (currentIndex - totalItems + 0) % totalItems;
  const displayIndex = focusIndex < 0 ? focusIndex + totalItems : focusIndex;
  sliderItems[displayIndex].classList.add("focus");
  sliderItems[displayIndex + totalItems].classList.add("focus");
}

function slideTo(index) {
  sliderContainer.style.transition = "transform 0.5s ease";
  sliderContainer.style.transform = `translateX(-${index * itemWidth}px)`;

  if (index >= totalItems + 2) {
    setTimeout(() => {
      sliderContainer.style.transition = "none";
      currentIndex = index - totalItems;
      sliderContainer.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
      updateFocusClass();
    }, 500);
  } else if (index <= 2) {
    setTimeout(() => {
      sliderContainer.style.transition = "none";
      currentIndex = index + totalItems;
      sliderContainer.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
      updateFocusClass();
    }, 500);
  } else {
    currentIndex = index;
    updateFocusClass();
  }
}

nextBtn.addEventListener("click", () => {
  slideTo(currentIndex + 1);
});

prevBtn.addEventListener("click", () => {
  slideTo(currentIndex - 1);
});

function toggleMobileNav() {
  const mobileNav = document.querySelector(".mobile-nav");
  mobileNav.classList.toggle("active");
}
