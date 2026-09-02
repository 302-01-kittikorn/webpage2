// Shin Godzilla & Burning City Background System
(function() {
    function initLaser() {
        const canvas = document.getElementById('laserCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width, height;
        let mouse = { x: -100, y: -100, isDown: false, active: false };
        let burnMarks = [];
        let particles = [];
        let embers = [];
        let buildings = [];

        let state = 'INIT';
        let introProgress = 0;
        let auraOpacity = 0;

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            generateCity();
            generateEmbers();
        }

        // สร้างเงาตึกด้านล่าง (จำกัดความสูงไม่ให้เกิน 15% ของจอ เพื่อไม่ให้บังเนื้อหา)
        function generateCity() {
            buildings = [];
            let curX = 0;
            while (curX < width) {
                const bWidth = Math.random() * 40 + 30;
                const bHeight = Math.random() * (height * 0.12) + (height * 0.05);
                buildings.push({
                    x: curX,
                    y: height - bHeight,
                    w: bWidth,
                    h: bHeight
                });
                curX += bWidth - 2;
            }
        }

        function generateEmbers() {
            embers = [];
            for (let i = 0; i < 65; i++) {
                embers.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 2 + 0.8,
                    speedY: Math.random() * 0.7 + 0.3,
                    speedX: (Math.random() - 0.5) * 0.5,
                    color: Math.random() > 0.4 ? '#ff5500' : '#c084fc',
                    alpha: Math.random() * 0.8 + 0.2
                });
            }
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

        // วาดเงาร่าง Godzilla (Shin Godzilla Silhouette)
        function drawGodzilla(gx, gy, scale) {
            ctx.save();
            ctx.translate(gx, gy);
            ctx.scale(scale, scale);

            // ออร่าสีม่วงเรืองแสงด้านหลังครีบหลัง Godzilla
            ctx.shadowBlur = 40;
            ctx.shadowColor = '#a855f7';
            ctx.fillStyle = '#11051c';

            ctx.beginPath();
            // หัวและคอ
            ctx.moveTo(0, -180);
            ctx.quadraticCurveTo(20, -170, 35, -140);
            ctx.quadraticCurveTo(50, -100, 65, -40);
            
            // ลำตัวและขาขวา
            ctx.quadraticCurveTo(90, 20, 110, 80);
            ctx.lineTo(80, 120);
            ctx.lineTo(40, 110);
            
            // หางยาวม้วนโค้งขึ้น (ลักษณะเฉพาะของ Shin Godzilla)
            ctx.quadraticCurveTo(120, 100, 180, 60);
            ctx.quadraticCurveTo(240, 0, 220, -80);
            ctx.quadraticCurveTo(190, -130, 210, -160);
            ctx.quadraticCurveTo(230, -140, 250, -50);
            ctx.quadraticCurveTo(260, 40, 170, 130);
            ctx.quadraticCurveTo(90, 160, 0, 150);
            
            // ลำตัวฝั่งซ้ายและหัว
            ctx.quadraticCurveTo(-60, 120, -70, 40);
            ctx.quadraticCurveTo(-60, -40, -40, -100);
            ctx.quadraticCurveTo(-30, -150, -15, -175);
            ctx.closePath();
            ctx.fill();

            // ครีบหนามบนหลังเรืองแสงสีม่วง (Dorsal Plates)
            ctx.fillStyle = '#c084fc';
            ctx.shadowBlur = 15;
            for (let i = -120; i <= 60; i += 22) {
                ctx.beginPath();
                ctx.moveTo(-15 + (i * 0.1), i);
                ctx.lineTo(-45 - Math.random() * 15, i - 10);
                ctx.lineTo(-20, i + 15);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();
        }

        setTimeout(() => { state = 'CHARGE'; }, 300);
        setTimeout(() => { state = 'BEAM'; introProgress = 0; }, 1500);

        function render() {
            ctx.clearRect(0, 0, width, height);

            // 1. เปลวเพลิงสีส้มแดงลุกโชนที่ฐานล่าง
            const fireGrad = ctx.createLinearGradient(0, height, 0, height - 180);
            fireGrad.addColorStop(0, 'rgba(255, 69, 0, 0.5)');
            fireGrad.addColorStop(0.5, 'rgba(255, 140, 0, 0.2)');
            fireGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = fireGrad;
            ctx.fillRect(0, height - 200, width, 200);

            // 2. ออร่าสีม่วงสว่างพุ่งขึ้นฟ้า
            if (state === 'BEAM' || state === 'READY') {
                if (auraOpacity < 0.35) auraOpacity += 0.003;
            }

            if (auraOpacity > 0) {
                const purpleAura = ctx.createRadialGradient(width * 0.5, height * 0.4, 50, width * 0.5, height * 0.5, width * 0.6);
                purpleAura.addColorStop(0, `rgba(168, 85, 247, ${auraOpacity * 1.2})`);
                purpleAura.addColorStop(0.6, `rgba(147, 51, 234, ${auraOpacity * 0.4})`);
                purpleAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = purpleAura;
                ctx.fillRect(0, 0, width, height);
            }

            // 3. วาดตัว GODZILLA ตรงกลางค่อนไปทางซ้ายของจอ
            const gzX = width * 0.35;
            const gzY = height * 0.72;
            const gzScale = Math.min(width, height) / 800;
            drawGodzilla(gzX, gzY, gzScale);

            // 4. เงาตึกเมืองแถบล่างสุด
            ctx.fillStyle = '#07090e';
            buildings.forEach(b => {
                ctx.fillRect(b.x, b.y, b.w, b.h);
            });

            // 5. ละอองเถ้าถ่านไฟปลิว
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

            // 6. ฉากยิง Atomic Beam จากปาก Godzilla
            const mouthX = gzX;
            const mouthY = gzY - (175 * gzScale);

            if (state === 'CHARGE') {
                addParticles(mouthX + (Math.random() * 30 - 15), mouthY + (Math.random() * 30 - 15), 4, true);

                ctx.save();
                ctx.shadowBlur = 50;
                ctx.shadowColor = '#c084fc';
                ctx.beginPath();
                ctx.arc(mouthX, mouthY, 18 + Math.random() * 10, 0, Math.PI * 2);
                ctx.fillStyle = '#a855f7';
                ctx.fill();
                ctx.restore();
            } 
            else if (state === 'BEAM') {
                introProgress += 0.016;

                const targetX = width * Math.min(introProgress * 1.2, 1);
                const targetY = (height * 0.3) + Math.sin(introProgress * Math.PI * 2) * (height * 0.15);
                const bWidth = 35 + Math.random() * 15;

                ctx.save();
                ctx.shadowBlur = 50;
                ctx.shadowColor = '#c084fc';

                ctx.beginPath();
                ctx.moveTo(mouthX, mouthY);
                ctx.lineTo(targetX, targetY);
                ctx.strokeStyle = 'rgba(192, 132, 252, 0.55)';
                ctx.lineWidth = bWidth * 2.2;
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

                if (Math.random() < 0.85) addBurnMark(targetX, targetY);
                addParticles(targetX, targetY, 8, true);

                if (introProgress >= 1) {
                    state = 'READY';
                }
            }

            // 7. รอยเผาไหม้
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

            // 8. เลเซอร์ตามเมาส์
            if (state === 'READY' && mouse.active) {
                const isClicking = mouse.isDown;
                const laserWidth = isClicking ? 18 + Math.random() * 6 : 4 + Math.random() * 2;

                ctx.save();
                ctx.shadowBlur = isClicking ? 30 : 10;
                ctx.shadowColor = '#c084fc';

                ctx.beginPath();
                ctx.moveTo(mouthX, mouthY);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = 'rgba(192, 132, 252, 0.4)';
                ctx.lineWidth = laserWidth * 2;
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(mouthX, mouthY);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = '#a855f7';
                ctx.lineWidth = laserWidth;
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(mouthX, mouthY);
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

            // 9. ประกายไฟ
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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLaser);
    } else {
        initLaser();
    }
})();
