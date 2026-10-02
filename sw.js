// notifikasi-status-jaringan/pwa/sw.js
self.addEventListener("push", function (event) {
  var data = { title: "Status jaringan hari ini sudah diperbarui", body: "Tap untuk buka & bagikan ke WhatsApp", url: "./" };
  if (event.data) {
    try { var diterima = event.data.json(); data = Object.assign(data, diterima); } catch (e) { /* abaikan, pakai default */ }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "icon-512.png",
      badge: "icon-192.png",
      vibrate: [200, 100, 200, 100, 400],
      requireInteraction: true,
      tag: "status-jaringan",
      data: { url: data.url },
    })
  );
});

// Ambil path saja (buang query string) supaya tab yang sudah terbuka
// dengan ?v=<sesi> atau parameter lain tetap dianggap "sama" dengan URL
// di payload push -- dibandingkan apa adanya (dengan query), tab yang
// sudah terbuka nyaris tidak pernah cocok dan selalu buka tab baru.
function pathSaja(url) {
  try {
    return new URL(url, self.location.href).pathname;
  } catch (e) {
    return url;
  }
}

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var tujuan = event.notification.data && event.notification.data.url;
  if (!tujuan) return; // payload push rusak/tanpa url -- tidak ada tujuan yang bisa dibuka
  var pathTujuan = pathSaja(tujuan);
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (semuaKlien) {
      for (var i = 0; i < semuaKlien.length; i++) {
        if (pathSaja(semuaKlien[i].url) === pathTujuan && "focus" in semuaKlien[i]) return semuaKlien[i].focus();
      }
      return clients.openWindow(tujuan);
    })
  );
});
