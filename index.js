// Opretter en tom liste til koncerter
let concerts = [];

// Henter favoritkunstnere fra localStorage, eller opretter et tomt objekt hvis der ikke findes nogen
let favorites = JSON.parse(localStorage.getItem('roskildeFavoritter')) || {};

// Et objekt der matcher vurderinger til farver til visuel visning
const vurderingFarver = {
  "ja ja ja": "#086307",
  "ja": "#34a30f",
  "nok": "#4be319",
  "måske": "#bce02b",
  "kig forbi": "#d1a206",
  "idk": "#d17d06",
  "nok ikke": "#d13606",
  "nej": "#6e0202"
};

// Henter koncertdata fra en JSON-fil
fetch('koncerter.json')
  // Konverterer svaret til JSON
  .then(res => res.json())
  .then(data => {
    // Sorterer koncerterne efter tidspunkt
    concerts = data.sort((a, b) => new Date(a.Tidspunkt) - new Date(b.Tidspunkt));
    // Udfylder scenefiltre med checkboxe
    populateSceneCheckboxes();
    // Viser koncertlisten
    displayConcerts();
    // Planlægger notifikationer for favoritkoncerter
    scheduleNotifications();
  });

// Funktion til at udfylde scenefiltrene dynamisk baseret på unikke scener
function populateSceneCheckboxes() {
  // Finder containeren for scenefiltre
  const sceneContainer = document.getElementById('sceneFilter');
  // Finder unikke scener
  const uniqueScenes = [...new Set(concerts.map(c => c.Scene))];
  // Sorterer scener alfabetisk og laver en checkbox for hver
  uniqueScenes.sort().forEach(scene => {
    let label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" value="${scene}"> ${scene}`;
    sceneContainer.appendChild(label);
  });

  // Tilføjer event listeners til både scene- og vurderingsfiltrene
  sceneContainer.addEventListener('change', displayConcerts);
  document.getElementById('vurderingFilter').addEventListener('change', displayConcerts);
}

// Funktion til at finde hvilke checkboxe der er markeret i en given container
function getCheckedValues(containerId) {
  const checkboxes = document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`);
  return Array.from(checkboxes).map(cb => cb.value.toLowerCase());
}

// Funktion til at vise koncerter baseret på filtre
function displayConcerts() {
  const list = document.getElementById('concertList');
  // Rydder listen før visning
  list.innerHTML = '';

  // Henter valgte scener og vurderinger
  const selectedScenes = getCheckedValues('sceneFilter');
  const selectedRatings = getCheckedValues('vurderingFilter');

  // Går igennem hver koncert og tjekker om den matcher filtrene
  concerts.forEach(c => {
    const vurdering = c["Ska man se?"].toLowerCase();
    const matchScene = selectedScenes.length === 0 || selectedScenes.includes(c.Scene.toLowerCase());
    const matchRating = selectedRatings.length === 0 || selectedRatings.includes(vurdering);

    if (matchScene && matchRating) {
      // Opretter en div for koncerten
      const div = document.createElement('div');
      // Henter farven for vurderingen, standardfarve hvis ikke fundet
      const farve = vurderingFarver[vurdering] || "#ccc";

      div.className = 'concert';
      // Tilføjer farven som en venstrekant
      div.style.borderLeft = `5px solid ${farve}`;
      // Fylder indholdet med koncertinformation
      div.innerHTML = `
        <strong>${c.Kunstner}</strong> (${c.Tidspunkt})<br>
        <em>Scene:</em> ${c.Scene} – <em>Genre:</em> ${c.Genre}<br>
        <em>Vurdering:</em> ${c["Ska man se?"]}<br>
        <em>Noter:</em> ${c.Thoughts}
        <button class="favorite ${favorites[c.Kunstner] ? 'saved' : ''}" onclick="toggleFavorite('${c.Kunstner}', this)">★</button>
      `;
      // Tilføjer div'en til koncertlisten
      list.appendChild(div);
    }
  });
}

// Funktion til at tilføje/fjerne en kunstner som favorit
function toggleFavorite(artist, btn) {
  // Toggler favoritstatus
  favorites[artist] = !favorites[artist];
  // Gemmer opdaterede favoritter i localStorage
  localStorage.setItem('roskildeFavoritter', JSON.stringify(favorites));
  // Skifter visuelt om knappen har klassen 'saved'
  btn.classList.toggle('saved');
}

// Funktion til at planlægge notifikationer for favoritkoncerter
function scheduleNotifications() {
  // Tjekker om browseren understøtter notifikationer
  if (!("Notification" in window)) return;

  // Beder om tilladelse til at vise notifikationer
  Notification.requestPermission().then(permission => {
    if (permission !== "granted") return;

    // Gennemgår hver koncert
    concerts.forEach(c => {
      // Springer over koncerter der ikke er favoritter
      if (!favorites[c.Kunstner]) return;

      const concertTime = new Date(c.Tidspunkt).getTime();
      const now = new Date().getTime();
      // Sætter tidspunktet for notifikation til 14 minutter før koncerten
      const notifyTime = concertTime - 14 * 60 * 1000;

      // Hvis tidspunktet for notifikation er i fremtiden, planlægges den
      if (notifyTime > now) {
        setTimeout(() => {
          new Notification("Koncert snart!", {
            body: `🎤 ${c.Kunstner} spiller om 14 minutter på ${c.Scene}!`,
          });
        }, notifyTime - now);
      }
    });
  });
}
