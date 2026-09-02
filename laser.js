// High-Detail Godzilla Intro & Laser Script
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

    // สถานะ Animation: 'ENTER', 'CHARGE', 'BEAM', 'READY'
    let state = 'ENTER';
    let introProgress = 0; 
    let godzillaX = -380; 
    let godzillaTargetX = 110; 
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
            const speed = Math.random() * (isIntro ? 10 : 5) + 2;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * (isIntro ? 5 : 3) + 1,
                color: Math.random() > 0.3 ? '#c084fc' : (Math.random() > 0.5 ? '#e9d5ff' : '#ff4500'),
                alpha: 1,
                life: isIntro ? 45 : 25
            });
        }
    }

    // วาดรูปทรงก๊อตซิลล่าแบบละเอียด (Detailed Godzilla Vector Art)
    function drawDetailedGodzilla(x, y, scale = 1, isCharging = false, chargeRatio = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        // 1. วาดครีบหลังแหลมคม 3 ชั้น (High-Detail Dorsal Spines)
        const spineSparks = isCharging ? chargeRatio : 0;
        const spines = [
            // แถบหลักด้านหลัง
            { path: [[-120, 60], [-170, 20], [-130, -10], [-100, 30]], color: '#a855f7' },
            { path: [[-95, 30], [-145, -20], [-105, -45], [-75, 0]], color: '#c084fc' },
            { path: [[-70, 0], [-120, -60], [-80, -75], [-50, -25]], color: '#e9d5ff' },
            { path: [[-45, -25], [-85, -85], [-55, -95], [-30, -45]], color: '#ffffff' },
            // แถบสำรองซ้อนชั้น
            { path: [[-140, 80], [-185, 50], [-150, 25], [-125, 55]], color: '#7e22ce' },
            { path: [[-110, 50], [-155, 10], [-120, -15], [-95, 20]], color: '#a855f7' }
        ];

        spines.forEach((spine, idx) => {
            ctx.beginPath();
            ctx.moveTo(spine.path[0][0], spine.path[0][1]);
            ctx.lineTo(spine.path[1][0], spine.path[1][1]);
            ctx.lineTo(spine.path[2][0], spine.path[2][1]);
            ctx.lineTo(spine.path[3][0], spine.path[3][1]);
            ctx.closePath();

            ctx.shadowBlur = isCharging ? 20 + idx * 5 : 5;
            ctx.shadowColor = '#c084fc';
            ctx.fillStyle = isCharging ? (Math.random() > 0.2 ? spine.color : '#ffffff') : '#1e1b4b';
            ctx.fill();
        });

        // 2. วาดลำตัว หัว และกรามขรุขระรายละเอียดสูง (High-Detail Body & Head Silhouette)
        ctx.shadowBlur = isCharging ? 25 : 8;
        ctx.shadowColor = '#c084fc';
        ctx.fillStyle = '#090a10'; // สีดำเข้มเน้นโครงเงา Kaiju

        ctx.beginPath();
        ctx.moveTo(-160, 200); // ฐานคอหลัง
        ctx.quadraticCurveTo(-140, 100, -100, 40);
        ctx.lineTo(-70, -15); // ช่วงท้ายทอย
        ctx.lineTo(-50, -40); // โหนกศีรษะ
        ctx.lineTo(-20, -55); // สันหัวบน
        ctx.lineTo(15, -45);  // โหนกคิ้ว
        ctx.lineTo(40, -35);  // สันจมูก
        ctx.lineTo(75, -20);  // ปลายจมูก
        ctx.lineTo(80, -10);  // ริมฝีปากบน
        
        // ฟันบน (Upper Teeth)
        ctx.lineTo(70, -5); ctx.lineTo(65, -12);
        ctx.lineTo(55, -3); ctx.lineTo(50, -10);
        ctx.lineTo(40, 0);  ctx.lineTo(35, -8);
        ctx.lineTo(20, 5);  // เพดานปากใน

        // ช่องปากด้านใน (Mouth Cavity)
        ctx.lineTo(10, 15);

        // ฟันล่างและกราม (Lower Jaw & Teeth)
        ctx.lineTo(25, 20); ctx.lineTo(30, 12);
        ctx.lineTo(42, 22); ctx.lineTo(48, 14);
        ctx.lineTo(60, 25); ctx.lineTo(68, 15);
        ctx.lineTo(78, 28); // ปลายคาง
        
        ctx.lineTo(50, 45);  // รอยหยักคาง
        ctx.lineTo(20, 60);  // ใต้คาง
        ctx.lineTo(-20, 95); // เหนียงคอ
        ctx.quadraticCurveTo(-60, 140, -90, 200); // อกและลำตัวหน้า
        ctx.closePath();
        ctx.fill();

        // 3. ดวงตาสีม่วงพิฆาต (Glowing Kaiju Eye)
        ctx.beginPath();
        ctx.ellipse(20, -30, 5, 3, Math.PI / 6, 0, Math.PI * 2);
        ctx.fillStyle = isCharging ? '#ffffff' : '#c084fc';
        ctx.shadowBlur = isCharging ? 15 : 5;
        ctx.shadowColor = '#ffffff';
        ctx.fill();

        // 4. เอฟเฟกต์พลังงานในช่องปาก (Mouth Core Glow)
        if (isCharging) {
            ctx.beginPath();
            ctx.arc(35, 5, 16 + Math.random() * 6, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#c084fc';
            ctx.fill();
        }

        ctx.restore();
    }

    function render() {
        ctx.clearRect(0, 0, width, height);

        // ----------------------------------------------------
        // 1. INTRO ANIMATION (ฉากเปิดตัว Godzilla รายละเอียดสูง)
        // ----------------------------------------------------
        if (state !== 'READY') {
            const headY = height * 0.48;

            // เดินเข้ามาในหน้าจอ
            if (state === 'ENTER') {
                godzillaX += (godzillaTargetX - godzillaX) * 0.045;
                drawDetailedGodzilla(godzillaX, headY, 1.6, false, 0);

                if (Math.abs(godzillaX - godzillaTargetX) < 2) {
                    state = 'CHARGE';
                }
            } 
            // ชาร์จพลังงาน Atomic Breath
            else if (state === 'CHARGE') {
                chargeEnergy += 0.022;
                drawDetailedGodzilla(godzillaX, headY, 1.6 + Math.sin(chargeEnergy * 14) * 0.03, true, chargeEnergy);

                const mouthX = godzillaX + 115;
                const mouthY = headY + 8;
                addParticles(mouthX + (Math.random() * 90 - 45), mouthY + (Math.random() * 90 - 45), 4, true);

                if (chargeEnergy >= 1) {
                    state = 'BEAM';
                    introProgress = 0;
                }
            } 
            // ยิงลำแสง Atomic Beam
            else if (state === 'BEAM') {
                introProgress += 0.018;
                const mouthX = godzillaX + 115;
                const mouthY = headY + 8;

                drawDetailedGodzilla(godzillaX, headY, 1.65, true, 1);

                const targetX = width * Math.min(introProgress * 1.25, 1);
                const targetY = headY + Math.sin(introProgress * Math.PI * 2) * 85;

                // ลำแสง Atomic Beam พิฆาต
                const bWidth = 42 + Math.random() * 16;
                ctx.save();
                ctx.shadowBlur = 50;
                ctx.shadowColor = '#c084fc';

                ctx.beginPath();
                ctx.moveTo(mouthX, mouthY);
                ctx.lineTo(targetX, targetY);
                ctx.strokeStyle = 'rgba(192, 132, 252, 0.6)';
                ctx.lineWidth = bWidth * 2.4;
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

                // รอยเผาไหม้บนหน้าจอ
                if (Math.random() < 0.75) {
                    addBurnMark(targetX, targetY);
                }
                addParticles(targetX, targetY, 9, true);

                // สั่นหน้าจอ
                canvas.style.transform = `translate(${(Math.random() - 0.5) * 14}px, ${(Math.random() - 0.5) * 14}px)`;

                if (introProgress >= 1) {
                    state = 'READY';
                    canvas.style.transform = 'none';
                }
            }
        }

        // ----------------------------------------------------
        // 2. BURN MARKS (รอยไหม้สะสม)
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
        // 3. INTERACTIVE MOUSE LASER (โหมดเล่นเมาส์ตามปกติ)
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
