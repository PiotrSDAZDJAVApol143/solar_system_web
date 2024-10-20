export function loadNavbar() {
  const navbar = document.getElementById("navbar");
  navbar.innerHTML = `
      <nav class="navbar">
      <div class="navbar-brand" style="display: flex; align-items: center;">
      <a href="#">
          <img src="assets/textures/logo/logo.png" alt="Logo" class="logo">
      </a>
      <span class="navbar-title">ASTRO<br>FRIQ</span>
  </div>
    <div class="navbar-links">
        <a href="#" id="home-link" class = "active">Strona Główna</a>
        <a href="#" id="about-link">O mnie</a>
        <a href="#" id="solar-system-link">Układ Słoneczny</a>
        <a href="#" id="library-link">Biblioteka astralna</a>
        <a href="#" id="fun-facts-link">Śmieszne ciekawostki</a>
        <a href="#" id="contact-link">Kontakt</a>
      </div>
    <div class="navbar-search">
    <input type="text" placeholder="Szukaj...">
    </div>
      </nav>
    `;
}
