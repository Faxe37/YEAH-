
let concerts = [];
let favorites = JSON.parse(localStorage.getItem('roskildeFavoritter')) || {};

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

fetch('koncerter.json')
  .then(res => res.json())
  .then(data => {
    concerts = data.sort((a, b) => new Date(a.Tidspunkt) - new Date(b.Tidspunkt));
    populateSceneCheckboxes();
    displayConcerts();
    scheduleNotifications();
  });

function populateSceneCheckboxes() {
  const sceneContainer = document.getElementById('sceneFilter');
  const uniqueScenes = [...new Set(concerts.map(c => c.Scene))];
  uniqueScenes.sort().forEach(scene => {
    let label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" value="${scene}"> ${scene}`;
    sceneContainer.appendChild(label);
  });

  sceneContainer.addEventListener('change', displayConcerts);
  document.getElementById('vurderingFilter').addEventListener('change', displayConcerts);
}

function getCheckedValues(containerId) {
  const checkboxes = document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`);
  return Array.from(checkboxes).map(cb => cb.value.toLowerCase());
}

function displayConcerts() {
  const list = document.getElementById('concertList');
  list.innerHTML = '';

  const selectedScenes = getCheckedValues('sceneFilter');
  const selectedRatings = getCheckedValues('vurderingFilter');

  concerts.forEach(c => {
    const vurdering = c["Ska man se?"].toLowerCase();
    const matchScene = selectedScenes.length === 0 || selectedScenes.includes(c.Scene.toLowerCase());
    const matchRating = selectedRatings.length === 0 || selectedRatings.includes(vurdering);

    if (matchScene && matchRating) {
      const div = document.createElement('div');
      const farve = vurderingFarver[vurdering] || "#ccc";

      div.className = 'concert';
      div.style.borderLeft = `5px solid ${farve}`;
      div.innerHTML = `
        <strong>${c.Kunstner}</strong> (${c.Tidspunkt})<br>
        <em>Scene:</em> ${c.Scene} – <em>Genre:</em> ${c.Genre}<br>
        <em>Vurdering:</em> ${c["Ska man se?"]}<br>
        <em>Noter:</em> ${c.Thoughts}
        <button class="favorite ${favorites[c.Kunstner] ? 'saved' : ''}" onclick="toggleFavorite('${c.Kunstner}', this)">★</button>
      `;
      list.appendChild(div);
    }
  });
}

function toggleFavorite(artist, btn) {
  favorites[artist] = !favorites[artist];
  localStorage.setItem('roskildeFavoritter', JSON.stringify(favorites));
  btn.classList.toggle('saved');
}

function scheduleNotifications() {
  if (!("Notification" in window)) return;

  Notification.requestPermission().then(permission => {
    if (permission !== "granted") return;

    concerts.forEach(c => {
      if (!favorites[c.Kunstner]) return;

      const concertTime = new Date(c.Tidspunkt).getTime();
      const now = new Date().getTime();
      const notifyTime = concertTime - 14 * 60 * 1000;
      //const notifyTime = Date.now() + 10000; // 10 sekunder fra nu


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
