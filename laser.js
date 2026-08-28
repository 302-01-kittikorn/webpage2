// Laser & Godzilla Cinematic Intro Script
window.addEventListener('load', function() {
    let canvas = document.getElementById('laserCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'laserCanvas';
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width, height;
    let mouse = { x: -100, y: -100, isDown: false, active: false };
    let burnMarks = [];
    let particles = [];

    // สถานะของ Animation เปิดตัว: 'ENTER', 'CHARGE', 'BEAM', 'READY'
    let state = 'ENTER';
    let introProgress = 0; 
    let godzillaX = -300; // เริ่มต้นนอกจอฝั่งซ้าย
    let godzillaTargetX = 90; // จุดหยุดฝั่งซ้าย
    let chargeEnergy = 0;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });

    window.addEventListener('mousedown', (e) => {
        mouse.isDown = true;
        if (state === 'READY') addBurnMark(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
        mouse.isDown = false;
    });

    function addBurnMark(x, y) {
        burnMarks.push({
            x: x,
            y: y,
            radius: Math.random() * 12 + 16,
            alpha: 1,
            life: 200
        });
    }

    function addParticles(x, y, count, isIntro = false) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * (isIntro ? 9 : 5) + 2;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * (isIntro ? 5 : 3) + 1,
                color: Math.random() > 0.3 ? '#c084fc' : (Math.random() > 0.5 ? '#e9d5ff' : '#ff4500'),
                alpha: 1,
                life: isIntro ? 40 : 25
            });
        }
    }

    // วาดโครงร่างหัวและครีบหลัง Godzilla เปล่งแสง
    function drawGodzillaHead(x, y, scale = 1, isCharging = false) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        // โครงเงาตัวก๊อตซิลล่า
        ctx.fillStyle = '#0a0b12';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = isCharging ? 30 + Math.random() * 20 : 10;

        ctx.beginPath();
        ctx.moveTo(-100, 150);
        ctx.quadraticCurveTo(-80, 50, -40, 0); 
        ctx.lineTo(-20, -30); 
        ctx.lineTo(25, -20);  
        ctx.lineTo(20, 0);    
        ctx.lineTo(45, 25);   
        ctx.lineTo(0, 45);    
        ctx.lineTo(-30, 85);  
        ctx.lineTo(-60, 150); 
        ctx.closePath();
        ctx.fill();

        // ครีบหลังสว่างสีม่วง (Dorsal Spines Glow)
        const spineColors = isCharging ? ['#ffffff', '#e9d5ff', '#c084fc', '#a855f7'] : ['#a855f7', '#7e22ce'];
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            let spineX = -70 - (i * 25);
            let spineY = 40 + (i * 30);
            ctx.moveTo(spineX, spineY);
            ctx.lineTo(spineX - 35, spineY - 30);
            ctx.lineTo(spineX + 10, spineY - 10);
            ctx.closePath();
            ctx.fillStyle = spineColors[i % spineColors.length];
            ctx.fill();
        }

        // ดวงตาสีม่วงเรืองแสง
        ctx.beginPath();
        ctx.arc(-10, -10, 4, 0, Math.PI * 2);
        ctx.fillStyle = isCharging ? '#ffffff' : '#c084fc';
        ctx.fill();

        // ช่องปากชาร์จพลังงาน
        if (isCharging) {
            ctx.beginPath();
            ctx.arc(22, 12, 14 + Math.random() * 5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }

        ctx.restore();
    }

    function render() {
        ctx.clearRect(0, 0, width, height);

        // ----------------------------------------------------
        // 1. INTRO ANIMATION (ฉาก Godzilla ยิงลำแสงยักษ์เปิดตัว)
        // ----------------------------------------------------
        if (state !== 'READY') {
            const headY = height * 0.45;

            // ขั้นตอน 1: เดินเข้ามาในหน้าจอ
            if (state === 'ENTER') {
                godzillaX += (godzillaTargetX - godzillaX) * 0.04;
                drawGodzillaHead(godzillaX, headY, 1.8, false);

                if (Math.abs(godzillaX - godzillaTargetX) < 2) {
                    state = 'CHARGE';
                }
            } 
            // ขั้นตอน 2: ชาร์จพลังงาน Atomic Beam
            else if (state === 'CHARGE') {
                chargeEnergy += 0.025;
                drawGodzillaHead(godzillaX, headY, 1.8 + Math.sin(chargeEnergy * 12) * 0.04, true);

                const mouthX = godzillaX + 80;
                const mouthY = headY + 20;
                addParticles(mouthX + (Math.random() * 80 - 40), mouthY + (Math.random() * 80 - 40), 3, true);

                if (chargeEnergy >= 1) {
                    state = 'BEAM';
                    introProgress = 0;
                }
            } 
            // ขั้นตอน 3: ยิงลำแสงกวาดผ่านหน้าจอพร้อมรอยเผาไหม้
            else if (state === 'BEAM') {
                introProgress += 0.02;
                const mouthX = godzillaX + 80;
                const mouthY = headY + 20;

                drawGodzillaHead(godzillaX, headY, 1.85, true);

                const targetX = width * Math.min(introProgress * 1.25, 1);
                const targetY = headY + Math.sin(introProgress * Math.PI * 2) * 90;

                // ลำแสงขนาดยักษ์
                const bWidth = 40 + Math.random() * 15;
                ctx.save();
                ctx.shadowBlur = 45;
                ctx.shadowColor = '#c084fc';

                ctx.beginPath();
                ctx.moveTo(mouthX, mouthY);
                ctx.lineTo(targetX, targetY);
                ctx.strokeStyle = 'rgba(192, 132, 252, 0.6)';
                ctx.lineWidth = bWidth * 2.3;
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
                ctx.lineWidth = bWidth * 0.35;
                ctx.stroke();
                ctx.restore();

                // รอยเผาไหม้และสั่นหน้าจอ
                if (Math.random() < 0.7) {
                    addBurnMark(targetX, targetY);
                }
                addParticles(targetX, targetY, 8, true);

                canvas.style.transform = `translate(${(Math.random() - 0.5) * 12}px, ${(Math.random() - 0.5) * 12}px)`;

                if (introProgress >= 1) {
                    state = 'READY';
                    canvas.style.transform = 'none';
                }
            }
        }

        // ----------------------------------------------------
        // 2. BURN MARKS (รอยเผาไหม้สะสมบนหน้าจอ)
        // ----------------------------------------------------
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

        // ----------------------------------------------------
        // 3. INTERACTIVE MOUSE LASER (โหมดเลเซอร์ตามเมาส์)
        // ----------------------------------------------------
        if (state === 'READY' && mouse.active) {
            const startX = width;
            const startY = 0;

            const isClicking = mouse.isDown;
            const laserWidth = isClicking ? 20 + Math.random() * 8 : 6 + Math.random() * 2;

            ctx.save();
            ctx.shadowBlur = isClicking ? 35 : 15;
            ctx.shadowColor = '#c084fc';

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = 'rgba(192, 132, 252, 0.5)';
            ctx.lineWidth = laserWidth * 2.2;
            ctx.lineCap = 'round';
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

            if (isClicking && Math.random() < 0.4) {
                addBurnMark(mouse.x + (Math.random() * 12 - 6), mouse.y + (Math.random() * 12 - 6));
            }
        }

        // ----------------------------------------------------
        // 4. SPARKS PARTICLES (ละอองไฟ)
        // ----------------------------------------------------
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
