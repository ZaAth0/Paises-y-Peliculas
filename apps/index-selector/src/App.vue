<template>
  <div class="background-container">
    <div class="background" id="background"></div>
  </div>

  <div class="container">
    <div class="card">
      <h1>Selecciona una Aplicación</h1>
      <div class="button-group">
        <a href="http://localhost:5175" target="_blank" class="btn blue">🎬 Películas</a>
        <a href="http://localhost:5174" target="_blank" class="btn green">🌍 Países</a>
      </div>
    </div>
  </div>
</template>

<style src="./assets/style.css"></style>

<script>
export default {
  mounted() {
    const images = [
      'src/assets/bandera1.jpg', 'src/assets/bandera2.jpg', 'src/assets/bandera3.jpg',
      'src/assets/cartelera1.jpg', 'src/assets/cartelera2.jpg', 'src/assets/cartelera3.jpg'
    ];

    let currentIndex = 0;
    const backgroundContainer = document.querySelector('.background-container');

    function getRandomDirection() {
      const directions = ["translateX(100%)", "translateX(-100%)", "translateY(100%)", "translateY(-100%)"];
      return directions[Math.floor(Math.random() * directions.length)];
    }

    function changeBackground() {
      const newBackground = document.createElement("div");
      newBackground.classList.add("background");
      newBackground.style.backgroundImage = `url(${images[currentIndex]})`;
      newBackground.style.transform = getRandomDirection();
      newBackground.style.opacity = "0";

      backgroundContainer.appendChild(newBackground);

      setTimeout(() => {
        newBackground.style.transform = "translateX(0) translateY(0)";
        newBackground.style.opacity = "1";
      }, 100);

      setTimeout(() => {
        const oldBackgrounds = document.querySelectorAll(".background");
        if (oldBackgrounds.length > 1) {
          oldBackgrounds[0].style.transform = getRandomDirection();
          oldBackgrounds[0].style.opacity = "0";

          setTimeout(() => {
            oldBackgrounds[0].remove();
          }, 1000);
        }
      }, 5000);

      currentIndex = (currentIndex + 1) % images.length;
    }

    setInterval(changeBackground, 5000);
    changeBackground();
  }
};
</script>