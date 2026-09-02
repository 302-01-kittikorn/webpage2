// Godzilla Atomic Beam Laser System (Original Style)
(function() {
    function initLaser() {
        const canvas = document.getElementById('laserCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width, height;
        let mouse = { x: -100, y: -100, isDown: false, active: false };
        let burnMarks = [];
        let particles = [];

        let state = 'INIT';
        let introProgress = 0;

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
        window.addEventListener('mouseup', () => { mouse.isDown = false; });

        function addBurnMark(x, y) {
            burnMarks.push({
                x: x, y: y,
                radius: Math.random() * 12 + 15,
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
                    alpha: 1, life: isIntro ? 40 : 25
                });
            }
        }

        // เริ่มแอนิเมชันชาร์จและยิงเปิดตัว
        setTimeout(() => { state = 'CHARGE'; }, 300);
        setTimeout(() => { state = 'BEAM'; introProgress = 0; }, 1400);

        function render() {
            ctx.clearRect(0, 0, width, height);

            // 1. ฉากชาร์จและยิง Atomic Beam ครั้งแรก
            const startX = width;
            const startY = 0;

            if (state === 'CHARGE') {
                const chargeX = width - 60;
                const chargeY = 60;
                addParticles(chargeX + (Math.random() * 40 - 20), chargeY + (Math.random() * 40 - 20), 3, true);

                ctx.save();
                ctx.shadowBlur = 40;
                ctx.shadowColor = '#c084fc';
                ctx.beginPath();
                ctx.arc(chargeX, chargeY, 20 + Math.random() * 10, 0, Math.PI * 2);
                ctx.fillStyle = '#a855f7';
                ctx.fill();
                ctx.restore();
            } 
            else if (state === 'BEAM') {
                introProgress += 0.018;

                const targetX = width - (width * Math.min(introProgress * 1.2, 1));
                const targetY = height * Math.min(introProgress * 1.1, 1);
                const bWidth = 40 + Math.random() * 15;

                ctx.save();
                ctx.shadowBlur = 50;
                ctx.shadowColor = '#c084fc';

                // ออร่าภายนอก
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(targetX, targetY);
                ctx.strokeStyle = 'rgba(192, 132, 252, 0.5)';
                ctx.lineWidth = bWidth * 2;
                ctx.stroke();

                // แกนกลางสีม่วง
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(targetX, targetY);
                ctx.strokeStyle = '#a855f7';
                ctx.lineWidth = bWidth;
                ctx.stroke();

                // แกนในสีขาว
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(targetX, targetY);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = bWidth * 0.3;
                ctx.stroke();
                ctx.restore();

                if (Math.random() < 0.8) addBurnMark(targetX, targetY);
                addParticles(targetX, targetY, 8, true);

                if (introProgress >= 1) {
                    state = 'READY';
                }
            }

            // 2. วาดรอยเผาไหม้ (Burn Marks)
            for (let i = burnMarks.length - 1; i >= 0; i--) {
                const b = burnMarks[i];
                ctx.save();
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                const grad = ctx.createRadialGradient(b.x, b.y, 1, b.x, b.y, b.radius);
                grad.addColorStop(0, `rgba(255, 69, 0, ${b.alpha})`);
                grad.addColorStop(0.5, `rgba(168, 85, 247, ${b.alpha * 0.7})`);
                grad.addColorStop(1, `rgba(0, 0, 0, 0)`);
                ctx.fillStyle = grad;
                ctx.fill();
                ctx.restore();

                b.life--;
                b.alpha = b.life / 200;
                if (b.life <= 0) burnMarks.splice(i, 1);
            }

            // 3. เลเซอร์ยิงตามเมาส์ (Mouse Laser)
            if (state === 'READY' && mouse.active) {
                const isClicking = mouse.isDown;
                const laserWidth = isClicking ? 18 + Math.random() * 6 : 4 + Math.random() * 2;

                ctx.save();
                ctx.shadowBlur = isClicking ? 30 : 10;
                ctx.shadowColor = '#c084fc';

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = 'rgba(192, 132, 252, 0.4)';
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

            // 4. วาดประกายไฟ (Particles)
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
