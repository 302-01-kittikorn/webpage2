window.addEventListener('DOMContentLoaded', function() {
    let canvas = document.getElementById('laserCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'laserCanvas';
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width, height;
    let state = 'ENTER'; 
    let introProgress = 0; 
    let godzillaX = -380; 
    let godzillaTargetX = 110; 
    let chargeEnergy = 0;

    const introOverlay = document.getElementById('introOverlay');
    const introProgressBar = document.getElementById('introProgress');
    const percentText = document.getElementById('percentText');
    const loaderText = document.getElementById('loaderText');
    const startBtn = document.getElementById('startBtn');
    const introSound = document.getElementById('introSound');

    // อัปเดตหลอดโหลด
    function updateHUDProgress(percent) {
        const currentPercent = Math.min(100, Math.max(0, Math.floor(percent)));
        if (introProgressBar) introProgressBar.style.width = `${currentPercent}%`;
        if (percentText) percentText.innerText = `${currentPercent}%`;

        if (currentPercent >= 100) {
            if (loaderText) loaderText.style.display = 'none';
            if (startBtn) startBtn.style.display = 'inline-block';
        }
    }

    // ซ่อนฉากเปิด เพื่อเปิดเผยข้อมูลทั้งหมดในเว็บ
    function dismissOverlay() {
        if (introOverlay) {
            introOverlay.classList.add('fade-out');
            setTimeout(() => {
                introOverlay.style.display = 'none';
            }, 800);
        }
    }

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            state = 'BEAM';
            dismissOverlay();
            if (introSound) introSound.pause();
        });
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function render() {
        ctx.clearRect(0, 0, width, height);

        if (state !== 'READY') {
            const headY = height * 0.48;

            if (state === 'ENTER') {
                godzillaX += (godzillaTargetX - godzillaX) * 0.05;
                const enterProgress = Math.min(1, (godzillaX - (-380)) / (godzillaTargetX - (-380)));
                updateHUDProgress(enterProgress * 50);

                if (Math.abs(godzillaX - godzillaTargetX) < 2) {
                    state = 'CHARGE';
                }
            } 
            else if (state === 'CHARGE') {
                chargeEnergy += 0.02;
                const chargeProgress = 50 + Math.min(50, (chargeEnergy / 1.0) * 50);
                updateHUDProgress(chargeProgress);

                if (chargeEnergy >= 1.0) {
                    state = 'BEAM';
                    dismissOverlay();
                }
            }
            else if (state === 'BEAM') {
                introProgress += 0.02;
                if (introProgress >= 1) {
                    state = 'READY';
                }
            }
        }

        requestAnimationFrame(render);
    }

    render();
});
