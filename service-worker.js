// Lytter efter 'install'-eventet, som sker når service worker første gang installeres i browseren
self.addEventListener('install', event => {
  // Skriver en besked i konsollen for at vise at installation er sket
  console.log('Service worker installed');
  // Hopper direkte til 'activate'-stadiet og springer ventetid over
  self.skipWaiting();
});

// Lytter efter 'activate'-eventet, som sker når service workeren aktiveres (efter installation)
self.addEventListener('activate', event => {
  // Skriver en besked i konsollen for at bekræfte at service workeren er aktiv
  console.log('Service worker activated');
});

// Lytter efter beskeder der sendes til service workeren fra andre dele af appen (typisk main thread)
self.addEventListener('message', function(event) {
  // Gemmer beskedens data i en variabel
  const data = event.data;

  // Tjekker om der faktisk er data, og at dataen er af typen 'scheduleNotification'
  if (data && data.type === 'scheduleNotification') {
    // Udregner hvor lang tid der er til notifikationen skal vises
    const delay = data.timestamp - Date.now();

    // Hvis delay er positivt (dvs. tidspunktet er i fremtiden), så opretter vi en timeout
    if (delay > 0) {
      // Venter i den beregnede tid og viser så en notifikation
      setTimeout(() => {
        // Viser en notifikation med kunstnernavn og scene, 14 minutter før koncerten
        self.registration.showNotification("Koncert snart!", {
          body: `🎤 ${data.artist} spiller om 14 minutter på ${data.scene}!`
        });
      }, delay); // forsinkelsen som timeout'en venter
    }
  }
});
