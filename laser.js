document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('laserCanvas');
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const heatVentBtn = document.getElementById('heatVentBtn');
    const btnRoar = document.getElementById('btnRoar');
    const btnBlackout = document.getElementById('btnBlackout');

    let isHeatVentActive = false;
    let particles = [];
    let lasers = [];

    // --- Event Listeners สำหรับปุ่มควบคุม ---

    // 1. ปุ่ม Heat Vent (เปิด/ปิด โหมดเลเซอร์สแกนและเผาหน้าจอ)
    if (heatVentBtn) {
        heatVentBtn.addEventListener('click', () => {
            isHeatVentActive = !isHeatVentActive;
            heatVentBtn.classList.toggle('active', isHeatVentActive);
            document.body.classList.toggle('heat-vent-active', isHeatVentActive);

            if (isHeatVentActive) {
                // สร้างลำแสงเลเซอร์ยิงกราดทันทีเมื่อเปิดใช้งาน
                createLaserBeam();
            }
        });
    }

    // 2. ปุ่ม Roar Shockwave (สั่นหน้าจอ + ยิงวงคลื่นกระแทก)
    if (btnRoar) {
        btnRoar.addEventListener('click', () => {
            triggerScreenShake(1000);
            createShockwaveParticles();
        });
    }

    // 3. ปุ่ม Yashiori Operation (โหมดตัดไฟ)
    if (btnBlackout) {
        btnBlackout.addEventListener('click', () => {
            btnBlackout.classList.toggle('active');
            document.body.classList.toggle('godzilla-burned');
        });
    }

    // --- ฟังก์ชันสร้างเอฟเฟกต์ ---

    function createLaserBeam() {
        lasers.push({
            x: Math.random() * width,
            y: 0,
            targetX: Math.random() * width,
            targetY: height,
            width: Math.random() * 6 + 3,
            alpha: 1,
            color: '#c084fc'
        });
    }

    function triggerScreenShake(duration) {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                document.body.style.transform = 'none';
                clearInterval(interval);
                return;
            }
            const x = (Math.random() - 0.5) * 12;
            const y = (Math.random() - 0.5) * 12;
            document.body.style.transform = `translate(${x}px, ${y}px)`;
        }, 30);
    }

    function createShockwaveParticles() {
        const centerX = width / 2;
        const centerY = height / 2;
        for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 4;
            particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                color: '#a855f7',
                alpha: 1
            });
        }
    }

    // --- Animation Loop ---

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // วาดเอฟเฟกต์อนุภาคความร้อนลอยขึ้นเมื่อเปิด Heat Vent
        if (isHeatVentActive) {
            if (Math.random() < 0.4) {
                particles.push({
                    x: Math.random() * width,
                    y: height + 10,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -Math.random() * 4 - 2,
                    size: Math.random() * 3 + 1,
                    color: Math.random() > 0.5 ? '#ff4500' : '#c084fc',
                    alpha: 1
                });
            }

            if (Math.random() < 0.05) {
                createLaserBeam();
            }
        }

        // วาดเลเซอร์
        for (let i = lasers.length - 1; i >= 0; i--) {
            const l = lasers[i];
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(l.x, l.y);
            ctx.lineTo(l.targetX, l.targetY);
            ctx.strokeStyle = l.color;
            ctx.lineWidth = l.width;
            ctx.globalAlpha = l.alpha;
            ctx.shadowBlur = 15;
            ctx.shadowColor = l.color;
            ctx.stroke();
            ctx.restore();

            l.alpha -= 0.02;
            if (l.alpha <= 0) {
                lasers.splice(i, 1);
            }
        }

        // วาดและอัปเดตอนุภาค (Particles)
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();

            p.x += p.vx || 0;
            p.y += p.vy || 0;
            p.alpha -= 0.015;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
});
