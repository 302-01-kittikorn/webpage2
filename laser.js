// Shin Godzilla Inferno & Atomic Aura Laser System
window.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('laserCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    let width, height;
    let mouse = { x: -100, y: -100, isDown: false, active: false };
    let burnMarks = [];
    let particles = [];
    let embers = []; // เศษประกายเถ้าถ่านปลิวในเมือง
    let buildings = []; // เงานครตึกระฟ้าด้านล่าง

    // สถานะแอนิเมชัน: 'INIT', 'CHARGE', 'BEAM', 'READY'
    let state = 'INIT';
    let introProgress = 0;
    let auraOpacity = 0; // ออร่าสีม่วงที่จะค่อยๆ ปรากฏขึ้นหลังยิงเพลิง

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        generateCity();
        generateEmbers();
    }

    // สุ่มสร้างตึกเมืองด้านล่าง (City Silhouette)
    function generateCity() {
        buildings = [];
        let curX = 0;
        while (curX < width) {
            const bWidth = Math.random() * 50 + 40;
            const bHeight = Math.random() * (height * 0.22) + (height * 0.12);
            buildings.push({
                x: curX,
                y: height - bHeight,
                w: bWidth,
                h: bHeight,
                windows: []
            });
            curX += bWidth - 2; // ให้ตึกซ้อนกันเล็กน้อย
        }
    }

    // สร้างเถ้าถ่านลอยในอากาศ (Embers)
    function generateEmbers() {
        embers = [];
        for (let i = 0; i < 70; i++) {
            embers.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 0.8,
                speedY: Math.random() * 0.8 + 0.3,
                speedX: (Math.random() - 0.5) * 0.6,
                color: Math.random() > 0.4 ? '#ff5500' : '#c084fc',
                alpha: Math.random() * 0.8 + 0.2
            });
        }
    }

    window.addEventListener('resize', resize);
    resize();

    // Event listeners เมาส์
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });
    window.addEventListener('mousedown', (e) => {
        mouse.isDown = true;
        if (state === 'READY') addBurnMark(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', () => { mouse.isDown = false; });

    function addBurnMark(x, y) {
        burnMarks.push({
            x: x, y: y,
            radius: Math.random() * 14 + 16,
            alpha: 1, life: 240
        });
    }

    function addParticles(x, y, count, isIntro = false) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * (isIntro ? 12 : 6) + 2;
            particles.push({
                x: x, y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * (isIntro ? 6 : 3) + 1,
                color: Math.random() > 0.35 ? '#c084fc' : '#ff4500',
                alpha: 1, life: isIntro ? 45 : 25
            });
        }
    }

    // --- เริ่มฉากเปิดตัว ---
    setTimeout(() => { state = 'CHARGE'; }, 400);
    setTimeout(() => { state = 'BEAM'; introProgress = 0; }, 1800);

    // --- Render Loop ---
    function render() {
        ctx.clearRect(0, 0, width, height);

        // ==========================================
        // 1. วาดไฟลุกเมือง + ออร่าสีม่วง (Inferno Aura Background)
        // ==========================================
        
        // เพลิงไหม้ลุกโชนสีส้มแดงที่ฐานล่างเมือง
        const fireGrad = ctx.createLinearGradient(0, height, 0, height - 220);
        fireGrad.addColorStop(0, 'rgba(255, 69, 0, 0.55)');
        fireGrad.addColorStop(0.5, 'rgba(255, 140, 0, 0.25)');
        fireGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = fireGrad;
        ctx.fillRect(0, height - 250, width, 250);

        // ออร่า Atomic Purple เรืองแสงขึ้นเมื่อยิง Atomic Beam (เพิ่มความ opacity เรื่อยๆ)
        if (state === 'BEAM' || state === 'READY') {
            if (auraOpacity < 0.35) auraOpacity += 0.003;
        }

        if (auraOpacity > 0) {
            const purpleAura = ctx.createRadialGradient(width * 0.3, height * 0.4, 50, width * 0.5, height * 0.5, width * 0.7);
            purpleAura.addColorStop(0, `rgba(168, 85, 247, ${auraOpacity * 1.2})`);
            purpleAura.addColorStop(0.6, `rgba(147, 51, 234, ${auraOpacity * 0.5})`);
            purpleAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = purpleAura;
            ctx.fillRect(0, 0, width, height);
        }

        // ==========================================
        // 2. วาดเงาตึกระฟ้า (City Skyline Silhouette)
        // ==========================================
        ctx.fillStyle = '#07090e';
        buildings.forEach(b => {
            ctx.fillRect(b.x, b.y, b.w, b.h);
        });

        // ==========================================
        // 3. วาดละอองเถ้าถ่านไฟลอยล่อง (Floating Embers)
        // ==========================================
        embers.forEach(e => {
            ctx.save();
            ctx.globalAlpha = e.alpha * (0.6 + Math.sin(Date.now() * 0.005 + e.x) * 0.4);
            ctx.fillStyle = e.color;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            e.y -= e.speedY;
            e.x += e.speedX;
            if (e.y < -10) {
                e.y = height + 10;
                e.x = Math.random() * width;
            }
        });

        // ==========================================
        // 4. ฉากยิง Atomic Beam ของ Shin Godzilla
        // ==========================================
        const mouthX = -20;
        const mouthY = height + 20;

        if (state === 'CHARGE') {
            const chargeX = 70;
            const chargeY = height - 70;
            addParticles(chargeX + (Math.random() * 60 - 30), chargeY + (Math.random() * 60 - 30), 4, true);

            ctx.save();
            ctx.shadowBlur = 50;
            ctx.shadowColor = '#c084fc';
            ctx.beginPath();
            ctx.arc(chargeX, chargeY, 22 + Math.random() * 15, 0, Math.PI * 2);
            ctx.fillStyle = '#a855f7';
            ctx.fill();
            ctx.restore();
        } 
        else if (state === 'BEAM') {
            introProgress += 0.016;

            const targetX = width * Math.min(introProgress * 1.25, 1);
            const targetY = (height * 0.4) + Math.sin(introProgress * Math.PI * 2.5) * (height * 0.22);

            const bWidth = 48 + Math.random() * 20;

            ctx.save();
            ctx.shadowBlur = 60;
            ctx.shadowColor = '#c084fc';

            // Aura แสงชั้นนอก
            ctx.beginPath();
            ctx.moveTo(mouthX, mouthY);
            ctx.lineTo(targetX, targetY);
            ctx.strokeStyle = 'rgba(192, 132, 252, 0.55)';
            ctx.lineWidth = bWidth * 2.3;
            ctx.stroke();

            // ลำแสงแกนกลาง (Purple Core)
            ctx.beginPath();
            ctx.moveTo(mouthX, mouthY);
            ctx.lineTo(targetX, targetY);
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = bWidth;
            ctx.stroke();

            // แกนในสุด (White Hot Center)
            ctx.beginPath();
            ctx.moveTo(mouthX, mouthY);
            ctx.lineTo(targetX, targetY);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = bWidth * 0.35;
            ctx.stroke();
            ctx.restore();

            if (Math.random() < 0.85) addBurnMark(targetX, targetY);
            addParticles(targetX, targetY, 9, true);
            
            // สั่นหน้าจอเพิ่มอารมณ์ความรุนแรง
            canvas.style.transform = `translate(${(Math.random() - 0.5) * 14}px, ${(Math.random() - 0.5) * 14}px)`;

            if (introProgress >= 1) {
                state = 'READY';
                canvas.style.transform = 'none';
            }
        }

        // ==========================================
        // 5. วาดรอยเผาไหม้บนหน้าจอ
        // ==========================================
        for (let i = burnMarks.length - 1; i >= 0; i--) {
            const b = burnMarks[i];
            ctx.save();
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            const grad = ctx.createRadialGradient(b.x, b.y, 1, b.x, b.y, b.radius);
            grad.addColorStop(0, `rgba(255, 69, 0, ${b.alpha})`);
            grad.addColorStop(0.45, `rgba(168, 85, 247, ${b.alpha * 0.75})`);
            grad.addColorStop(1, `rgba(7, 9, 14, 0)`);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.restore();

            b.life--;
            b.alpha = b.life / 240;
            if (b.life <= 0) burnMarks.splice(i, 1);
        }

        // ==========================================
        // 6. โหมดเลเซอร์ยิงตามเมาส์
        // ==========================================
        if (state === 'READY' && mouse.active) {
            const startX = width;
            const startY = 0;
            const isClicking = mouse.isDown;
            const laserWidth = isClicking ? 20 + Math.random() * 8 : 5 + Math.random() * 2;

            ctx.save();
            ctx.shadowBlur = isClicking ? 35 : 12;
            ctx.shadowColor = '#c084fc';

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = 'rgba(192, 132, 252, 0.5)';
            ctx.lineWidth = laserWidth * 2.2;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = laserWidth;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = laserWidth * 0.3;
            ctx.stroke();
            ctx.restore();

            addParticles(mouse.x, mouse.y, isClicking ? 6 : 2);
            if (isClicking && Math.random() < 0.45) {
                addBurnMark(mouse.x + (Math.random() * 12 - 6), mouse.y + (Math.random() * 12 - 6));
            }
        }

        // ==========================================
        // 7. วาดประกายไฟแรงสูง
        // ==========================================
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
            ctx.globalAlpha = 1;

            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.alpha = p.life / 35;
            if (p.life <= 0) particles.splice(i, 1);
        }

        requestAnimationFrame(render);
    }

    render();
});
