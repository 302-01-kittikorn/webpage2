// High-Detail Godzilla Intro, Web Audio SFX & Heat Vent Mode
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
    let fireEmbers = [];

    let state = 'ENTER';
    let introProgress = 0; 
    let godzillaX = -380; 
    let godzillaTargetX = 110; 
    let chargeEnergy = 0;

    // ----------------------------------------------------
    // WEB AUDIO API SYSTEM (สร้างเสียงสังเคราะห์โดยไม่ต้องใช้ไฟล์ MP3)
    // ----------------------------------------------------
    let audioCtx = null;
    let isSoundEnabled = false;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // เสียงเดินก้าวหนักๆ (Footstep)
    function playFootstepSFX() {
        if (!isSoundEnabled || !audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    }

    // เสียงชาร์จพลังงานความถี่สูง (Charge Hum)
    let chargeOsc = null;
    let chargeGain = null;
    function startChargeSFX() {
        if (!isSoundEnabled || !audioCtx || chargeOsc) return;
        chargeOsc = audioCtx.createOscillator();
        chargeGain = audioCtx.createGain();
        
        chargeOsc.type = 'sawtooth';
        chargeOsc.frequency.setValueAtTime(150, audioCtx.currentTime);
        chargeOsc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 2.5);

        chargeGain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        chargeGain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 2.5);

        chargeOsc.connect(chargeGain);
        chargeGain.connect(audioCtx.destination);
        chargeOsc.start();
    }

    function stopChargeSFX() {
        if (chargeOsc) {
            chargeGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
            setTimeout(() => {
                if (chargeOsc) { chargeOsc.stop(); chargeOsc = null; }
            }, 200);
        }
    }

    // เสียงยิง Atomic Beam (Laser Blast)
    function playBeamSFX() {
        if (!isSoundEnabled || !audioCtx) return;
        const bufferSize = audioCtx.sampleRate * 0.5;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1; // Noise
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
        filter.frequency.linearRampToValueAtTime(200, audioCtx.currentTime + 0.5);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        noise.start();
    }

    // ----------------------------------------------------
    // CONTROLS HANDLERS (Heat Vent & Sound Buttons)
    // ----------------------------------------------------
    const soundBtn = document.getElementById('soundToggleBtn');
    if (soundBtn) {
        soundBtn.addEventListener('click', () => {
            initAudio();
            isSoundEnabled = !isSoundEnabled;
            const icon = document.getElementById('soundIcon');
            const label = document.getElementById('soundLabel');
            if (isSoundEnabled) {
                icon.textContent = '🔊';
                label.textContent = 'SFX ON';
                soundBtn.classList.add('active');
            } else {
                icon.textContent = '🔇';
                label.textContent = 'SFX OFF';
                soundBtn.classList.remove('active');
            }
        });
    }

    const heatVentBtn = document.getElementById('heatVentBtn');
    if (heatVentBtn) {
        heatVentBtn.addEventListener('click', () => {
            document.body.classList.toggle('heat-vent-active');
            heatVentBtn.classList.toggle('active');
        });
    }

    // ----------------------------------------------------
    // SETUP CANVAS & PARTICLES
    // ----------------------------------------------------
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initFireEmbers();
    }

    function initFireEmbers() {
        fireEmbers = [];
        const count = Math.floor(width / 15);
        for (let i = 0; i < count; i++) {
            fireEmbers.push({
                x: Math.random() * width,
                y: height + Math.random() * 50,
                radius: Math.random() * 2.5 + 1,
                speedY: Math.random() * 1.5 + 0.6,
                speedX: (Math.random() - 0.5) * 0.8,
                color: Math.random() > 0.35 ? '#ff4500' : (Math.random() > 0.5 ? '#ff8c00' : '#c084fc'),
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
        if (state === 'READY') {
            addBurnMark(e.clientX, e.clientY);
            playBeamSFX();
        }
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
                color: Math.random() > 0.3 ? '#c084fc' : (Math.random() > 0.5 ? '#e9d5ff' : '#ff4500'),
                alpha: 1, life: isIntro ? 45 : 25
            });
        }
    }

    function interactWithDOM(laserX, laserY) {
        const elements = document.elementsFromPoint(laserX, laserY);
        elements.forEach(el => {
            if (el === canvas || el === document.body || el === document.documentElement) return;
            const tag = el.tagName.toLowerCase();
            if (tag === 'button' || el.classList.contains('btn') || tag === 'a') {
                el.classList.add('godzilla-burned');
                setTimeout(() => el.classList.remove('godzilla-burned'), 400);
            } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'].includes(tag)) {
                el.classList.add('godzilla-shake');
                setTimeout(() => el.classList.remove('godzilla-shake'), 300);
            }
        });
    }

    // Godzilla Model
    function drawDetailedGodzilla(x, y, scale = 1, isCharging = false, chargeRatio = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        const spines = [
            { path: [[-120, 60], [-170, 20], [-130, -10], [-100, 30]], color: '#a855f7' },
            { path: [[-95, 30], [-145, -20], [-105, -45], [-75, 0]], color: '#c084fc' },
            { path: [[-70, 0], [-120, -60], [-80, -75], [-50, -25]], color: '#e9d5ff' },
            { path: [[-45, -25], [-85, -85], [-55, -95], [-30, -45]], color: '#ffffff' },
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

        ctx.shadowBlur = isCharging ? 25 : 8;
        ctx.shadowColor = '#c084fc';
        ctx.fillStyle = '#090a10';

        ctx.beginPath();
        ctx.moveTo(-160, 200);
        ctx.quadraticCurveTo(-140, 100, -100, 40);
        ctx.lineTo(-70, -15); ctx.lineTo(-50, -40); ctx.lineTo(-20, -55);
        ctx.lineTo(15, -45); ctx.lineTo(40, -35); ctx.lineTo(75, -20);
        ctx.lineTo(80, -10); ctx.lineTo(70, -5); ctx.lineTo(65, -12);
        ctx.lineTo(55, -3); ctx.lineTo(50, -10); ctx.lineTo(40, 0); ctx.lineTo(35, -8);
        ctx.lineTo(20, 5); ctx.lineTo(10, 15); ctx.lineTo(25, 20); ctx.lineTo(30, 12);
        ctx.lineTo(42, 22); ctx.lineTo(48, 14); ctx.lineTo(60, 25); ctx.lineTo(68, 15);
        ctx.lineTo(78, 28); ctx.lineTo(50, 45); ctx.lineTo(20, 60); ctx.lineTo(-20, 95);
        ctx.quadraticCurveTo(-60, 140, -90, 200);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(20, -30, 5, 3, Math.PI / 6, 0, Math.PI * 2);
        ctx.fillStyle = isCharging ? '#ffffff' : '#c084fc';
        ctx.shadowBlur = isCharging ? 15 : 5;
        ctx.shadowColor = '#ffffff';
        ctx.fill();

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

    let stepTimer = 0;

    function render() {
        ctx.clearRect(0, 0, width, height);

        // 1. เปลวเพลิงเรืองแสงด้านล่าง
        const fireGrad = ctx.createLinearGradient(0, height, 0, height - 160);
        fireGrad.addColorStop(0, 'rgba(255, 69, 0, 0.4)');
        fireGrad.addColorStop(0.5, 'rgba(255, 120, 0, 0.15)');
        fireGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = fireGrad;
        ctx.fillRect(0, height - 180, width, 180);

        // 2. GODZILLA INTRO ANIMATION
        if (state !== 'READY') {
            const headY = height * 0.48;

            if (state === 'ENTER') {
                godzillaX += (godzillaTargetX - godzillaX) * 0.045;
                drawDetailedGodzilla(godzillaX, headY, 1.6, false, 0);

                // เล่นเสียงเดินก้าวหนักๆ
                stepTimer++;
                if (stepTimer % 28 === 0) playFootstepSFX();

                if (Math.abs(godzillaX - godzillaTargetX) < 2) {
                    state = 'CHARGE';
                    startChargeSFX();
                }
            } 
            else if (state === 'CHARGE') {
                chargeEnergy += 0.022;
                drawDetailedGodzilla(godzillaX, headY, 1.6 + Math.sin(chargeEnergy * 14) * 0.03, true, chargeEnergy);

                const mouthX = godzillaX + 115;
                const mouthY = headY + 8;
                addParticles(mouthX + (Math.random() * 90 - 45), mouthY + (Math.random() * 90 - 45), 4, true);

                if (chargeEnergy >= 1) {
                    stopChargeSFX();
                    playBeamSFX();
                    state = 'BEAM';
                    introProgress = 0;
                }
            } 
            else if (state === 'BEAM') {
                introProgress += 0.018;
                const mouthX = godzillaX + 115;
                const mouthY = headY + 8;

                drawDetailedGodzilla(godzillaX, headY, 1.65, true, 1);

                const targetX = width * Math.min(introProgress * 1.25, 1);
                const targetY = headY + Math.sin(introProgress * Math.PI * 2) * 85;

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

                interactWithDOM(targetX, targetY);

                if (Math.random() < 0.75) addBurnMark(targetX, targetY);
                addParticles(targetX, targetY, 9, true);

                canvas.style.transform = `translate(${(Math.random() - 0.5) * 12}px, ${(Math.random() - 0.5) * 12}px)`;

                if (introProgress >= 1) {
                    state = 'READY';
                    canvas.style.transform = 'none';
                }
            }
        }

        // 3. Bottom Embers
        fireEmbers.forEach(e => {
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
                e.y = height + Math.random() * 20;
                e.x = Math.random() * width;
            }
        });

        // 4. Burn Marks
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

        // 5. Interactive Mouse Laser
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

            interactWithDOM(mouse.x, mouse.y);
            addParticles(mouse.x, mouse.y, isClicking ? 6 : 2);

            if (isClicking && Math.random() < 0.4) {
                addBurnMark(mouse.x + (Math.random() * 12 - 6), mouse.y + (Math.random() * 12 - 6));
            }
        }

        // 6. Sparks Particles
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
