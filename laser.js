window.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('laserCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = document.getElementById('godzilla-container');
    
    let width, height;
    let mouse = { x: -100, y: -100, isDown: false, active: false };
    let burnMarks = [];
    let particles = [];
    
    // สถานะ: 'INIT', 'ENTER', 'CHARGE', 'BEAM', 'READY'
    let state = 'INIT';
    let introProgress = 0;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // ดักจับเมาส์
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
            radius: Math.random() * 12 + 16,
            alpha: 1, life: 200
        });
    }

    function addParticles(x, y, count, isIntro = false) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * (isIntro ? 10 : 5) + 2;
            particles.push({
                x: x, y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * (isIntro ? 5 : 3) + 1,
                color: Math.random() > 0.3 ? '#c084fc' : '#ff4500',
                alpha: 1, life: isIntro ? 45 : 25
            });
        }
    }

    // --- เริ่มฉากเคลื่อนตัว Godzilla 3D ---
    function startIntroAnimation() {
        state = 'ENTER';
        if (container) {
            container.style.left = '20px'; // ขยับ Godzilla เลื่อนเข้ามาจากซ้าย
        }

        // ชาร์จพลัง
        setTimeout(() => { 
            state = 'CHARGE'; 
        }, 2000);

        // ยิงลำแสง Atomic Beam สแกนหน้าจอ
        setTimeout(() => {
            state = 'BEAM';
            introProgress = 0;
        }, 3200);
    }

    // เริ่มทำงานหลังเว็บโหลด 1 วินาที
    setTimeout(startIntroAnimation, 1000);

    // --- Render Loop (วาดแสงเลเซอร์ + รอยไหม้) ---
    function render() {
        ctx.clearRect(0, 0, width, height);

        // จุดพิกัดปากของ Godzilla 3D ฝั่งซ้าย
        const mouthX = 320;
        const mouthY = height * 0.5 - 30;

        if (state === 'CHARGE') {
            addParticles(mouthX + (Math.random() * 40 - 20), mouthY + (Math.random() * 40 - 20), 4, true);
        } 
        else if (state === 'BEAM') {
            introProgress += 0.02;
            const targetX = width * Math.min(introProgress * 1.2, 1);
            const targetY = (height * 0.5) + Math.sin(introProgress * Math.PI * 2) * 120;

            const bWidth = 35 + Math.random() * 15;
            ctx.save();
            ctx.shadowBlur = 40;
            ctx.shadowColor = '#c084fc';

            ctx.beginPath();
            ctx.moveTo(mouthX, mouthY);
            ctx.lineTo(targetX, targetY);
            ctx.strokeStyle = 'rgba(192, 132, 252, 0.6)';
            ctx.lineWidth = bWidth * 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(mouthX, mouthY);
            ctx.lineTo(targetX, targetY);
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = bWidth;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(mouthX, mouthY);
            ctx.lineTo(targetX, targetY);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = bWidth * 0.3;
            ctx.stroke();
            ctx.restore();

            if (Math.random() < 0.7) addBurnMark(targetX, targetY);
            addParticles(targetX, targetY, 6, true);
            canvas.style.transform = `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 10}px)`;

            if (introProgress >= 1) {
                state = 'READY';
                canvas.style.transform = 'none';
            }
        }

        // --- รอยไหม้ ---
        for (let i = burnMarks.length - 1; i >= 0; i--) {
            const b = burnMarks[i];
            ctx.save();
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            const grad = ctx.createRadialGradient(b.x, b.y, 1, b.x, b.y, b.radius);
            grad.addColorStop(0, `rgba(255, 69, 0, ${b.alpha})`);
            grad.addColorStop(0.4, `rgba(168, 85, 247, ${b.alpha * 0.7})`);
            grad.addColorStop(1, `rgba(11, 15, 25, 0)`);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.restore();

            b.life--;
            b.alpha = b.life / 200;
            if (b.life <= 0) burnMarks.splice(i, 1);
        }

        // --- เลเซอร์ตามเมาส์ ---
        if (state === 'READY' && mouse.active) {
            const startX = width;
            const startY = 0;
            const isClicking = mouse.isDown;
            const laserWidth = isClicking ? 18 + Math.random() * 6 : 5 + Math.random() * 2;

            ctx.save();
            ctx.shadowBlur = isClicking ? 30 : 12;
            ctx.shadowColor = '#c084fc';

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = 'rgba(192, 132, 252, 0.5)';
            ctx.lineWidth = laserWidth * 2;
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

            addParticles(mouse.x, mouse.y, isClicking ? 5 : 2);
            if (isClicking && Math.random() < 0.4) {
                addBurnMark(mouse.x + (Math.random() * 10 - 5), mouse.y + (Math.random() * 10 - 5));
            }
        }

        // --- ประกายไฟ ---
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
