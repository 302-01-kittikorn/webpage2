// --- ระบบควบคุมฉากเปิด (Intro Overlay) และเสียงประกอบ ---
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const introOverlay = document.getElementById('introOverlay');
    const introSound = document.getElementById('introSound');

    if (startBtn && introOverlay) {
        startBtn.addEventListener('click', () => {
            // 1. เล่นเสียงฉากเปิด
            if (introSound) {
                introSound.currentTime = 0; // เริ่มเล่นตั้งแต่ต้น
                introSound.volume = 1.0;    // ความดังสูงสุด (100%)
                
                introSound.play().catch(error => {
                    console.log("Audio playback error:", error);
                });

                // 2. ค่อยๆ ลดระดับเสียงลง (Fade Out Audio) ภายใน 1 วินาที
                const fadeAudio = setInterval(() => {
                    if (introSound.volume > 0.1) {
                        introSound.volume -= 0.1;
                    } else {
                        introSound.pause(); // หยุดเล่นเสียงถาวรหลังฉากเปิดปิด
                        introSound.currentTime = 0;
                        clearInterval(fadeAudio);
                    }
                }, 100);
            }

            // 3. ทำเอฟเฟกต์ค่อยๆ จางฉากเปิดออก (Fade Out Overlay)
            introOverlay.classList.add('fade-out');

            // 4. ซ่อนฉากเปิดออกจากหน้าเว็บถาวรเมื่อจางหายเสร็จแล้ว
            setTimeout(() => {
                introOverlay.style.display = 'none';
            }, 800);
        });
    }
});
