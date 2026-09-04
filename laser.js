document.addEventListener('DOMContentLoaded', () => {
    // 1. ตั้งค่า Canvas
    const canvas = document.getElementById('laserCanvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 2. ดึงปุ่มกด
    const heatVentBtn = document.getElementById('heatVentBtn');
    const btnRoar = document.getElementById('btnRoar');
    const btnBlackout = document.getElementById('btnBlackout');

    let isLaserActive = false;
    let laserProgress = 0;
    let shockwaves = [];

    // ----------------------------------------------------
    // [1] HEAT VENT MODE (ยิงลำแสงเลเซอร์ Godzilla ☢️)
    // ----------------------------------------------------
    if (heatVentBtn) {
        heatVentBtn.addEventListener('click', () => {
            document.body.classList.toggle('heat-vent-active');
            heatVentBtn.classList.toggle('active');
            
            isLaserActive = document.body.classList.contains('heat-vent-active');
            if (isLaserActive) {
                laserProgress = 0;
                triggerShake(1500);
            }
        });
    }

    // ----------------------------------------------------
    // [2] ROAR SHOCKWAVE (เสียงคำราม + คลื่นกระแทก 💥)
    // ----------------------------------------------------
    if (btnRoar) {
        btnRoar.addEventListener('click', () => {
            triggerShake(1000);

            const elements = document.querySelectorAll('.card, h1, .btn, .hero-img');
            elements.forEach(el => el.classList.add('godzilla-shake'));
            
            setTimeout(() => {
                elements.forEach(el => el.classList.remove('godzilla-shake'));
            }, 1000);

            // เพิ่มคลื่นกระแทก 2 ชั้น
            createShockwave(window.innerWidth / 2, window.innerHeight / 2);
            setTimeout(() => createShockwave(window.innerWidth / 2, window.innerHeight / 2), 200);
        });
    }

    // ----------------------------------------------------
    // [3] YASHIORI OPERATION (โหมดเผาผลาญ/ไซเรน 🚨)
    // ----------------------------------------------------
    if (btnBlackout) {
        btnBlackout.addEventListener('click', () => {
            btnBlackout.classList.toggle('active');
            
            const cards = document.querySelectorAll('.card');
            cards.forEach(card => card.classList.toggle('godzilla-burned'));
            triggerShake(500);
        });
    }

    // ----------------------------------------------------
    // ฟังก์ชันวาดรูป GODZILLA และ ลำแสงเลเซอร์
    // ----------------------------------------------------

    // วาดเงา Godzilla มุมซ้ายล่าง
    function drawGodzillaSilhouette() {
        const gx = 80;
        const gy = canvas.height - 20;

        ctx.save();
        ctx.fillStyle = '#0a0518';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = isLaserActive ? 25 : 5;

        // ตัว Godzilla
        ctx.beginPath();
        ctx.moveTo(gx - 100, canvas.height);
        ctx.lineTo(gx - 60, gy - 180);
        ctx.lineTo(gx - 20, gy - 220); // หัว
        ctx.lineTo(gx + 30, gy - 200); // ปาก
        ctx.lineTo(gx + 10, gy - 170);
        ctx.lineTo(gx + 50, gy - 120);
        ctx.lineTo(gx + 120, canvas.height);
        ctx.closePath();
        ctx.fill();

        // ครีบหลังเรืองแสง (Spines)
        const spineColors = isLaserActive ? ['#a855f7', '#c084fc', '#38bdf8', '#ffffff'] : ['#4c1d95'];
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = spineColors[Math.floor(Math.random() * spineColors.length)];
            ctx.beginPath();
            ctx.arc(gx - 50 + (i * 20), gy - 150 + (i * 25), 12 - i, 0, Math.PI * 2);
            ctx.fill();
        }

        // ตาเรืองแสง
        ctx.fillStyle = isLaserActive ? '#ff0055' : '#c084fc';
        ctx.beginPath();
        ctx.arc(gx + 5, gy - 205, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // วาดเลเซอร์ลำแสงปรมาณู (Atomic Laser Beam)
    function drawLaserBeam() {
        if (!isLaserActive) return;

        if (laserProgress < 1) laserProgress += 0.05;

        const startX = 110;
        const startY = canvas.height - 210;
        const targetX = canvas.width;
        const targetY = 120;

        const currentX = startX + (targetX - startX) * laserProgress;
        const currentY = startY + (targetY - startY) * laserProgress;

        ctx.save();

        // 1. แสงฟุ้งรอบนอก (Outer Glow)
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)';
        ctx.lineWidth = 35 + Math.random() * 10;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 30;
        ctx.stroke();

        // 2. ลำแสงชั้นกลาง (Inner Flame)
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
        ctx.lineWidth = 18 + Math.random() * 6;
        ctx.stroke();

        // 3. แกนกลางแสงสีขาว (Core Beam)
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.stroke();

        // สะเก็ดไฟ/ละอองพลังงานรอบลำแสง
        for (let i = 0; i < 6; i++) {
            const px = startX + Math.random() * (currentX - startX);
            const py = startY + Math.random() * (currentY - startY) + (Math.random() - 0.5) * 40;
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(px, py, 4, 4);
        }

        ctx.restore();
    }

    // ----------------------------------------------------
    // ระบบ Animation Loop
    // ----------------------------------------------------
    function triggerShake(duration) {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                document.body.style.transform = 'none';
                clearInterval(interval);
                return;
            }
            const x = (Math.random() - 0.5) * 10;
            const y = (Math.random() - 0.5) * 10;
            document.body.style.transform = `translate(${x}px, ${y}px)`;
        }, 30);
    }

    function createShockwave(x, y) {
        shockwaves.push({
            x: x,
            y: y,
            radius: 10,
            maxRadius: Math.max(canvas.width, canvas.height) * 0.7,
            alpha: 1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // วาดคลื่น Shockwave
        for (let i = shockwaves.length - 1; i >= 0; i--) {
            const sw = shockwaves[i];
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(192, 132, 252, ${sw.alpha})`;
            ctx.lineWidth = 6;
            ctx.stroke();

            sw.radius += 20;
            sw.alpha -= 0.02;

            if (sw.alpha <= 0) shockwaves.splice(i, 1);
        }

        // วาดองค์ประกอบ Godzilla และ เลเซอร์
        drawGodzillaSilhouette();
        drawLaserBeam();

        requestAnimationFrame(animate);
    }

    animate();
});
