document.addEventListener('DOMContentLoaded', () => {
    // 1. ตั้งค่า Canvas สำหรับวาดเอฟเฟกต์
    const canvas = document.getElementById('laserCanvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 2. ดึงปุ่มควบคุมทั้งหมด
    const heatVentBtn = document.getElementById('heatVentBtn');
    const btnRoar = document.getElementById('btnRoar');
    const btnBlackout = document.getElementById('btnBlackout');

    // ----------------------------------------------------
    // [1] HEAT VENT MODE (ปุ่มระบายความร้อน ☢️)
    // ----------------------------------------------------
    if (heatVentBtn) {
        heatVentBtn.addEventListener('click', () => {
            document.body.classList.toggle('heat-vent-active');
            heatVentBtn.classList.toggle('active');
            
            // เอฟเฟกต์สั่นหน้าจอเบาๆ เมื่อเปิดใช้งาน
            if (document.body.classList.contains('heat-vent-active')) {
                triggerShake(800);
            }
        });
    }

    // ----------------------------------------------------
    // [2] ROAR SHOCKWAVE (ปุ่มคำรามส่งคลื่นกระแทก 💥)
    // ----------------------------------------------------
    if (btnRoar) {
        btnRoar.addEventListener('click', () => {
            // สั่นหน้าจอแรงๆ
            triggerShake(1200);

            // ใส่คลาสสั่นกระชับข้อความชั่วคราว
            const cards = document.querySelectorAll('.card, h1, .btn');
            cards.forEach(el => el.classList.add('godzilla-shake'));
            
            setTimeout(() => {
                cards.forEach(el => el.classList.remove('godzilla-shake'));
            }, 1200);

            // วาด วงคลื่นกระแทก Shockwave บน Canvas
            createShockwave();
        });
    }

    // ----------------------------------------------------
    // [3] YASHIORI OPERATION (ปุ่มเตือนภัยไซเรน 🚨)
    // ----------------------------------------------------
    if (btnBlackout) {
        btnBlackout.addEventListener('click', () => {
            btnBlackout.classList.toggle('active');
            
            // เปลี่ยนกรอบการ์ดทั้งหมดให้เป็นสีแดงไหม้
            const cards = document.querySelectorAll('.card');
            cards.forEach(card => card.classList.toggle('godzilla-burned'));
        });
    }

    // ----------------------------------------------------
    // ฟังก์ชันช่วยสำหรับการแสดงผล Animation
    // ----------------------------------------------------

    // ฟังก์ชันสั่งหน้าจอกระตุก/สั่น
    function triggerShake(duration) {
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

    // ฟังก์ชันวาดวงคลื่น Shockwave ขยายออกจากจุดศูนย์กลาง
    let shockwaves = [];
    function createShockwave() {
        shockwaves.push({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            radius: 10,
            maxRadius: Math.max(window.innerWidth, window.innerHeight) * 0.8,
            alpha: 1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // วาดและอัปเดต Shockwave
        for (let i = shockwaves.length - 1; i >= 0; i--) {
            const sw = shockwaves[i];
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(192, 132, 252, ${sw.alpha})`;
            ctx.lineWidth = 8;
            ctx.stroke();

            sw.radius += 25;
            sw.alpha -= 0.02;

            if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
                shockwaves.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }
    animate();
});
