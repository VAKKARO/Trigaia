document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ASSET PRELOADER ---
    const audioDestello = new Audio('public/assets/destello.mp3');
    const audioFinal = new Audio('public/assets/finaljime.mp3');
    const bgAudioElement = document.getElementById('bg-audio');
    audioDestello.preload = 'auto';
    audioFinal.preload = 'auto';

    // Precargar imágenes pesadas
    const imagesToPreload = [
        'public/assets/egg_scene.jpg',
        'public/assets/sakurania_bg.jpg',
        'public/assets/dragon_f1.png',
        'public/assets/sakurania_happy.png'
    ];
    imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // --- 2. STATE MACHINE ---
    const scenes = {
        MAP: document.getElementById('scene-map'),
        EGG: document.getElementById('scene-egg'),
        SAKURANIA: document.getElementById('scene-sakurania')
    };
    
    function changeScene(newScene) {
        Object.values(scenes).forEach(scene => scene.classList.remove('active'));
        scenes[newScene].classList.add('active');
    }

    // --- 3. GLOBAL AUDIO ---
    let hasInteracted = false;
    document.addEventListener('pointerdown', () => {
        if (!hasInteracted) {
            bgAudioElement.play().catch(e => console.log(e));
            hasInteracted = true;
        }
    });

    // --- 4. MAP LOGIC ---
    const continentHitbox = document.getElementById('continent-hitbox');
    const sakuraniaHitbox = document.getElementById('sakurania-hitbox');
    const passwordModal = document.getElementById('password-modal');
    const submitButton = document.getElementById('submit-button');
    const passwordInput = document.getElementById('password-input');
    const errorMessage = document.getElementById('error-message');

    continentHitbox.addEventListener('click', () => {
        passwordModal.classList.remove('hidden');
        passwordInput.value = '';
        errorMessage.classList.add('hidden');
        passwordInput.focus();
    });

    sakuraniaHitbox.addEventListener('click', () => {
        changeScene('SAKURANIA');
    });

    document.addEventListener('click', (e) => {
        if (!passwordModal.classList.contains('hidden')) {
            if (!passwordModal.contains(e.target) && e.target !== continentHitbox) {
                passwordModal.classList.add('hidden');
            }
        }
    });

    function checkPassword() {
        const pass = passwordInput.value.trim().toUpperCase();
        if (pass === "CONEXION" || pass === "CONEXIÓN") {
            passwordModal.classList.add('hidden');
            errorMessage.classList.add('hidden');
            changeScene('EGG');
        } else {
            errorMessage.textContent = "Contraseña incorrecta";
            errorMessage.classList.remove('hidden');
        }
    }
    
    submitButton.addEventListener('click', checkPassword);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPassword();
    });

    // --- 5. EGG LOGIC ---
    const eggHitbox = document.getElementById('egg-hitbox');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const dragonContainer = document.getElementById('dragon-container');
    const resetButton = document.getElementById('reset-button');
    
    let eggProgress = 0;
    let eggHatched = false;

    eggHitbox.addEventListener('click', () => {
        if (eggHatched) return; 
        
        audioDestello.currentTime = 0;
        audioDestello.play().catch(e => console.log(e));
        
        if (eggProgress === 0) progressContainer.classList.add('visible');
        
        eggProgress += 10;
        if (eggProgress > 100) eggProgress = 100;
        
        progressBar.style.height = eggProgress + '%';
        
        if (eggProgress === 100) {
            eggHatched = true;
            audioFinal.currentTime = 0;
            audioFinal.play().catch(e => console.log(e));
            dragonContainer.classList.add('fly-1');
            setTimeout(() => {
                resetButton.classList.remove('hidden');
            }, 3000);
        }
    });

    resetButton.addEventListener('click', () => {
        changeScene('MAP');
        eggProgress = 0;
        eggHatched = false;
        progressBar.style.height = '0%';
        resetButton.classList.add('hidden');
        progressContainer.classList.remove('visible');
        dragonContainer.className = 'dragon-container';
        void dragonContainer.offsetWidth; // trigger reflow
    });

    // --- 6. SAKURANIA LOGIC (Optimized Drag) ---
    const sakuraniaResetButton = document.getElementById('sakurania-reset-button');
    const sakuraniaCharacter = document.getElementById('sakurania-character');
    const sakuraniaProgressBar = document.getElementById('sakurania-progress-bar');
    const bowl = document.getElementById('sakurania-bowl');
    const sakuraRainContainer = document.getElementById('sakura-rain-container');
    const flowers = document.querySelectorAll('.draggable-flower');
    let sakuraProgress = 0;

    sakuraniaResetButton.addEventListener('click', () => {
        changeScene('MAP');
        sakuraProgress = 0;
        sakuraniaProgressBar.style.width = '0%';
        sakuraniaCharacter.src = 'public/assets/sakurania_neutral.png';
        sakuraRainContainer.innerHTML = '';
        sakuraniaResetButton.classList.add('hidden');
        flowers.forEach(f => {
            f.classList.remove('dropped');
            f.style.transform = 'translate(0px, 0px)';
            f.style.left = f.dataset.origLeft;
            f.style.top = f.dataset.origTop;
            f.dataset.x = 0;
            f.dataset.y = 0;
        });
        const sakuDragon = document.getElementById('sakurania-dragon-container');
        if(sakuDragon) sakuDragon.className = 'dragon-container';
    });

    // RequestAnimationFrame Drag Logic
    let activeFlower = null;
    let initialX, initialY, currentX, currentY;
    let animationFrameId = null;

    flowers.forEach(flower => {
        flower.dataset.x = 0;
        flower.dataset.y = 0;
        // Store original positioning for reset
        flower.dataset.origLeft = flower.style.left || window.getComputedStyle(flower).left;
        flower.dataset.origTop = flower.style.top || window.getComputedStyle(flower).top;
        
        flower.addEventListener('pointerdown', dragStart);
    });

    document.addEventListener('pointermove', drag);
    document.addEventListener('pointerup', dragEnd);

    function dragStart(e) {
        if (sakuraProgress >= 4 || e.target.classList.contains('dropped')) return;
        activeFlower = e.target;
        initialX = e.clientX - parseFloat(activeFlower.dataset.x);
        initialY = e.clientY - parseFloat(activeFlower.dataset.y);
        activeFlower.setPointerCapture(e.pointerId);
    }

    function renderDrag() {
        if (!activeFlower) return;
                activeFlower.style.transform = `translate(${currentX}px, ${currentY}px)`;
        
        const flowerRect = activeFlower.getBoundingClientRect();
        const bowlRect = bowl.getBoundingClientRect();
        
        if (
            flowerRect.left < bowlRect.right &&
            flowerRect.right > bowlRect.left &&
            flowerRect.top < bowlRect.bottom &&
            flowerRect.bottom > bowlRect.top
        ) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            dropFlower(activeFlower);
            activeFlower = null;
            return;
        }
        
        animationFrameId = requestAnimationFrame(renderDrag);
    }

    function drag(e) {
        if (activeFlower) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            activeFlower.dataset.x = currentX;
            activeFlower.dataset.y = currentY;
            
            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(renderDrag);
            }
        }
    }

    function dragEnd(e) {
        if (!activeFlower) return;
        
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        const flowerRect = activeFlower.getBoundingClientRect();
        const bowlRect = bowl.getBoundingClientRect();
        if (
            flowerRect.left < bowlRect.right &&
            flowerRect.right > bowlRect.left &&
            flowerRect.top < bowlRect.bottom &&
            flowerRect.bottom > bowlRect.top
        ) {
            dropFlower(activeFlower);
        }
        
        activeFlower = null;
    }

    function dropFlower(flower) {
        audioDestello.currentTime = 0;
        audioDestello.play().catch(e => console.log(e));
        
        flower.classList.add('dropped');
        
        const bowlRect = bowl.getBoundingClientRect();
        const sceneRect = scenes.SAKURANIA.getBoundingClientRect();
        
        const targetX = bowlRect.left - sceneRect.left + (bowlRect.width / 2) - 15 + (Math.random() * 20 - 10);
        const targetY = bowlRect.top - sceneRect.top + (bowlRect.height / 2) - 10 + (Math.random() * 20 - 10);
        
        flower.style.left = targetX + 'px';
        flower.style.top = targetY + 'px';
        flower.style.transform = 'scale(0.5)';
        
        sakuraProgress++;
        sakuraniaProgressBar.style.width = (sakuraProgress * 25) + '%';
        sakuraniaCharacter.src = 'public/assets/sakurania_happy.png';
        
        if (sakuraProgress < 4) {
            setTimeout(() => {
                if(sakuraProgress < 4) sakuraniaCharacter.src = 'public/assets/sakurania_neutral.png';
            }, 1000);
        } else {
            setTimeout(() => {
                sakuraniaResetButton.classList.remove('hidden');
                startSakuraRain();
                
                audioFinal.currentTime = 0;
                audioFinal.play().catch(e => console.log(e));
                
                const sakuDragon = document.getElementById('sakurania-dragon-container');
                if(sakuDragon) sakuDragon.className = 'dragon-container fly-sakurania';
            }, 1000);
        }
    }

    function startSakuraRain() {
        for (let i = 0; i < 20; i++) {
            const petal = document.createElement('div');
            petal.classList.add('falling-sakura');
            petal.style.left = Math.random() * 100 + 'vw';
            petal.style.animationDuration = (Math.random() * 2 + 2) + 's';
            petal.style.animationDelay = (Math.random() * 2) + 's';
            sakuraRainContainer.appendChild(petal);
        }
    }
});
