window.addEventListener('load', function() {
    // สร้าง Canvas อัตโนมัติหากยังไม่มีในหน้า
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

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resize);
    resize();

    // ดักจับการเคลื่อนที่และการคลิกของเมาส์
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });

    window.addEventListener('mousedown', (e) => {
        mouse.isDown = true;
        addBurnMark(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
        mouse.isDown = false;
    });

    // เพิ่มรอยเผาไหม้
    function addBurnMark(x, y) {
        burnMarks.push({
            x: x,
            y: y,
            radius: Math.random() * 10 + 15,
            alpha: 1,
            life: 180 // ระยะเวลาที่รอยเผาติดอยู่บนหน้าจอ
        });
    }

    // เพิ่มประกายไฟเลเซอร์
    function addParticles(x, y, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 3 + 1,
                color: Math.random() > 0.3 ? '#c084fc' : '#ff4500',
                alpha: 1,
                life: 25
            });
        }
    }

    // ลูปการวาดกราฟิกเลเซอร์
    function render() {
        ctx.clearRect(0, 0, width, height);

        // 1. วาดรอยเผาไหม้ที่สะสมบนหน้าจอ (Screen Burn Marks)
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
            b.alpha = b.life / 180;
            if (b.life <= 0) burnMarks.splice(i, 1);
        }

        // 2. วาดแสงเลเซอร์ Atomic Beam สดๆ ตามหัวเมาส์
        if (mouse.active) {
            // จุดกำเนิดแสงจากขอบหน้าจอบนขวา
            const startX = width;
            const startY = 0;

            const isClicking = mouse.isDown;
            const laserWidth = isClicking ? 18 + Math.random() * 6 : 6 + Math.random() * 2;

            ctx.save();
            
            // แสงเรืองรองรอบนอก (Glow Effect)
            ctx.shadowBlur = isClicking ? 30 : 15;
            ctx.shadowColor = '#c084fc';

            // เส้นเลเซอร์สีม่วงด้านนอก
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = 'rgba(192, 132, 252, 0.5)';
            ctx.lineWidth = laserWidth * 2.2;
            ctx.lineCap = 'round';
            ctx.stroke();

            // เส้นเลเซอร์หลักสีม่วงเข้ม
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = laserWidth;
            ctx.stroke();

            // แกนเลเซอร์สีขาวสว่างตรงกลาง
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = laserWidth * 0.3;
            ctx.stroke();

            ctx.restore();

            // สร้างประกายไฟที่ปลายเลเซอร์
            addParticles(mouse.x, mouse.y, isClicking ? 5 : 2);

            // ถ้ากดเมาส์ค้างไว้ ให้เพิ่มรอยเผาไหม้รัวๆ
            if (isClicking && Math.random() < 0.4) {
                addBurnMark(mouse.x + (Math.random() * 12 - 6), mouse.y + (Math.random() * 12 - 6));
            }
        }

        // 3. วาดละอองประกายไฟ (Spark Particles)
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
            p.alpha = p.life / 25;

            if (p.life <= 0) particles.splice(i, 1);
        }

        requestAnimationFrame(render);
    }

    render();
});
