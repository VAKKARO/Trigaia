document.addEventListener('DOMContentLoaded', () => {
    const continentHitbox = document.getElementById('continent-hitbox');
    const passwordModal = document.getElementById('password-modal');
    const submitButton = document.getElementById('submit-button');
    const passwordInput = document.getElementById('password-input');
    const errorMessage = document.getElementById('error-message');
    
    // --- Audio Setup ---
    const bgAudioElement = document.getElementById('bg-audio');
    const destelloAudio = new Audio('public/assets/destello.mp3');
    const finalAudio = new Audio('public/assets/finaljime.mp3');
    let hasInteracted = false;

    // Iniciar sonido al primer clic en CUALQUIER parte de la página
    document.addEventListener('click', () => {
        if (!hasInteracted) {
            bgAudioElement.play().catch(e => console.log(e));
            hasInteracted = true;
        }
    });

    // Show modal on continent click
    continentHitbox.addEventListener('click', () => {
        
        passwordModal.classList.remove('hidden');
        passwordInput.value = '';
        errorMessage.classList.add('hidden');
        passwordInput.focus();
    });

    // Close modal if clicked outside
    document.addEventListener('click', (e) => {
        if (!passwordModal.classList.contains('hidden')) {
            if (!passwordModal.contains(e.target) && e.target !== continentHitbox) {
                passwordModal.classList.add('hidden');
            }
        }
    });

    const sceneMap = document.getElementById('scene-map');
    const sceneEgg = document.getElementById('scene-egg');

    function checkPassword() {
        const pass = passwordInput.value.trim().toUpperCase();
        if (pass === "CONEXION" || pass === "CONEXIÓN") {
            passwordModal.classList.add('hidden');
            errorMessage.classList.add('hidden');
            
            sceneMap.classList.remove('active');
            sceneEgg.classList.add('active');
        } else {
            errorMessage.textContent = "Contraseña incorrecta";
            errorMessage.classList.remove('hidden');
        }
    }

    submitButton.addEventListener('click', checkPassword);
    
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });

    // --- Task 3, 4, 5, 6, 7 & 8: Egg, Dragon, Audio, Reset, Routes ---
    const eggHitbox = document.getElementById('egg-hitbox');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const dragonContainer = document.getElementById('dragon-container');
    const resetButton = document.getElementById('reset-button');
    
    let currentProgress = 0;
    const maxProgress = 100;
    const clickAmount = 10; // 10 clicks to fill
    let hasHatched = false;
    let flightCount = 0;

    eggHitbox.addEventListener('click', () => {
        if (hasHatched) return; 
        
        // Play destello sound on click
        destelloAudio.currentTime = 0;
        destelloAudio.play().catch(e => console.log(e));
        
        if (currentProgress === 0) {
            progressContainer.classList.add('visible');
        }
        
        currentProgress += clickAmount;
        if (currentProgress > maxProgress) currentProgress = maxProgress;
        
        progressBar.style.height = currentProgress + '%';
        
        if (currentProgress === maxProgress) {
            hasHatched = true;
            
            // Play final audio (roar/epic)
            finalAudio.currentTime = 0;
            finalAudio.play().catch(e => console.log(e));
            
            setTimeout(() => {
                progressContainer.classList.remove('visible');
            }, 800);
            
            setTimeout(() => {
                // Glow removed as per request
                
                // Determine flight route
                const route = (flightCount % 3) + 1; // 1, 2, or 3
                dragonContainer.className = 'dragon-container'; // reset classes
                dragonContainer.classList.add(`fly-${route}`);
                flightCount++;
                
                // Show "Volver" button after dragon finishes passing (approx 11 seconds)
                setTimeout(() => {
                    resetButton.classList.remove('hidden');
                }, 11000);
                
            }, 600);
        }
    });

    // Reset logic
    resetButton.addEventListener('click', () => {
        sceneEgg.classList.remove('active');
        sceneMap.classList.add('active');
        passwordInput.value = '';
        currentProgress = 0;
        hasHatched = false;
        progressBar.style.height = '0%';
        resetButton.classList.add('hidden');
        
        dragonContainer.className = 'dragon-container';
        void dragonContainer.offsetWidth; // trigger reflow
    });
});
