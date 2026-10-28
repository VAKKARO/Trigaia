document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ASSET PRELOADER ---
    const audioDestello = new Audio('public/assets/destello.mp3');
    const audioFinal = new Audio('public/assets/finaljime.mp3');
    const bgAudioElement = document.getElementById('bg-audio');
    audioDestello.preload = 'auto';
    audioFinal.preload = 'auto';

    const imagesToPreload = [
        'public/assets/map_new.png',
        'public/assets/sakurania_bg_new.jpg',
        'public/assets/dragon_f1.png',
        'public/assets/dragon_f2.png',
        'public/assets/dragon_f3.png',
        'public/assets/dragon_f4.png',
        'public/assets/sakurania_neutral.png',
        'public/assets/sakurania_happy.png',
        'public/assets/bowl.png',
        'public/assets/bowl_full.png',
        'public/assets/nayadia_bowl.png',
        'public/assets/sakura_flower.png',
        'public/assets/nayadia_tree.png',
        'public/assets/nayadia_neutral.png',
        'public/assets/nayadia_happy.png',
        'public/assets/nayadia_flower.png',
        'public/assets/nayadia_bar_frame.png',
        'public/assets/dragon_nayadia_1.png',
        'public/assets/dragon_nayadia_2.png',
        'public/assets/dragon_nayadia_3.png',
        'public/assets/dragon_nayadia_4.png',
        'public/assets/dragon_nayadia_5.png',
        'public/assets/narcisa_neutral.png',
        'public/assets/narcisa_happy.png',
        'public/assets/narcisa_flower.png'
    ];
    imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // --- 2. STATE MACHINE ---
    const scenes = {
        MAP: document.getElementById('scene-map'),
        SAKURANIA: document.getElementById('scene-sakurania'),
        NAYADIA: document.getElementById('scene-nayadia'),
        NARCISA: document.getElementById('scene-narcisa')
    };
    
    function changeScene(newScene) {
        Object.values(scenes).forEach(scene => {
            if (scene) scene.classList.remove('active');
        });
        if (scenes[newScene]) scenes[newScene].classList.add('active');
    }

    // --- 3. GLOBAL AUDIO ---
    let hasInteracted = false;
    document.addEventListener('pointerdown', () => {
        if (!hasInteracted) {
            bgAudioElement.play().catch(e => console.log(e));
            hasInteracted = true;
        }
    });

    // --- 4. MAP HITBOXES ---
    const sakuraniaHitbox = document.getElementById('sakurania-hitbox');
    if (sakuraniaHitbox) {
        sakuraniaHitbox.addEventListener('click', () => {
            bgAudioElement.pause();
            changeScene('SAKURANIA');
        });
    }

    const nayadiaHitbox = document.getElementById('nayadia-hitbox');
    if (nayadiaHitbox) {
        nayadiaHitbox.addEventListener('click', () => {
            bgAudioElement.pause();
            changeScene('NAYADIA');
        });
    }

    const narcisaHitbox = document.getElementById('narcisa-hitbox');
    if (narcisaHitbox) {
        narcisaHitbox.addEventListener('click', () => {
            bgAudioElement.pause();
            changeScene('NARCISA');
        });
    }

    // --- 5. SAKURANIA LOGIC ---
    const sakuraniaResetButton = document.getElementById('sakurania-reset-button');
    const sakuraniaCharacter = document.getElementById('sakurania-character');
    const sakuraniaProgressBar = document.getElementById('sakurania-progress-bar');
    const sakuBowl = document.getElementById('sakurania-bowl');
    const sakuraRainContainer = document.getElementById('sakura-rain-container');
    const sakuFlowers = document.querySelectorAll('#scene-sakurania .draggable-flower');
    let sakuraProgress = 0;

    if (sakuraniaResetButton) {
        sakuraniaResetButton.addEventListener('click', () => {
            bgAudioElement.currentTime = 0;
            bgAudioElement.play().catch(e => console.log(e));
            changeScene('MAP');
            sakuraProgress = 0;
            sakuraniaProgressBar.style.width = '0%';
            sakuraniaCharacter.src = 'public/assets/sakurania_neutral.png';
            sakuBowl.src = 'public/assets/nayadia_bowl.png';
            sakuraRainContainer.innerHTML = '';
            sakuraniaResetButton.classList.add('hidden');
            sakuFlowers.forEach(f => {
                f.classList.remove('dropped');
                f.style.removeProperty('left');
                f.style.removeProperty('top');
                f.style.removeProperty('transform');
                f.style.transform = 'translate(0px, 0px)';
                f.dataset.x = 0;
                f.dataset.y = 0;
            });
            const sakuDragon = document.getElementById('sakurania-dragon-container');
            if (sakuDragon) sakuDragon.className = 'dragon-container';
        });
    }

    let activeSakuFlower = null;
    let sakuInitX, sakuInitY, sakuCurX, sakuCurY;
    let sakuAnimFrameId = null;

    sakuFlowers.forEach(flower => {
        flower.dataset.x = 0;
        flower.dataset.y = 0;
        flower.dataset.origLeft = flower.style.left || window.getComputedStyle(flower).left;
        flower.dataset.origTop = flower.style.top || window.getComputedStyle(flower).top;
        flower.addEventListener('pointerdown', e => {
            if (sakuraProgress >= 4 || e.target.classList.contains('dropped')) return;
            activeSakuFlower = e.target;
            sakuInitX = e.clientX - parseFloat(activeSakuFlower.dataset.x);
            sakuInitY = e.clientY - parseFloat(activeSakuFlower.dataset.y);
            activeSakuFlower.setPointerCapture(e.pointerId);
        });
    });

    document.addEventListener('pointermove', e => {
        if (activeSakuFlower) {
            e.preventDefault();
            sakuCurX = e.clientX - sakuInitX;
            sakuCurY = e.clientY - sakuInitY;
            activeSakuFlower.dataset.x = sakuCurX;
            activeSakuFlower.dataset.y = sakuCurY;
            
            if (!sakuAnimFrameId) {
                sakuAnimFrameId = requestAnimationFrame(() => {
                    if (activeSakuFlower) {
                        activeSakuFlower.style.transform = `translate(${sakuCurX}px, ${sakuCurY}px)`;
                        const fRect = activeSakuFlower.getBoundingClientRect();
                        const bRect = sakuBowl.getBoundingClientRect();
                        if (
                            fRect.left < bRect.right &&
                            fRect.right > bRect.left &&
                            fRect.top < bRect.bottom &&
                            fRect.bottom > bRect.top
                        ) {
                            dropSakuraFlower(activeSakuFlower);
                            activeSakuFlower = null;
                        }
                    }
                    sakuAnimFrameId = null;
                });
            }
        }
    });

    document.addEventListener('pointerup', () => {
        if (activeSakuFlower) {
            const fRect = activeSakuFlower.getBoundingClientRect();
            const bRect = sakuBowl.getBoundingClientRect();
            if (
                fRect.left < bRect.right &&
                fRect.right > bRect.left &&
                fRect.top < bRect.bottom &&
                fRect.bottom > bRect.top
            ) {
                dropSakuraFlower(activeSakuFlower);
            }
            activeSakuFlower = null;
        }
    });

    function dropSakuraFlower(flower) {
        audioDestello.currentTime = 0;
        audioDestello.play().catch(e => console.log(e));
        
        flower.classList.add('dropped');
        flower.dataset.x = 0;
        flower.dataset.y = 0;
        const bRect = sakuBowl.getBoundingClientRect();
        const sRect = scenes.SAKURANIA.getBoundingClientRect();
        
        const flowerSlots = [
            { xPct: 0.16, yPct: 0.32, rot: -16, scale: 0.68 },
            { xPct: 0.52, yPct: 0.35, rot: 18,  scale: 0.68 },
            { xPct: 0.34, yPct: 0.18, rot: -6,  scale: 0.72 },
            { xPct: 0.36, yPct: 0.02, rot: 10,  scale: 0.78 }
        ];
        
        const slot = flowerSlots[sakuraProgress] || flowerSlots[0];
        const flWidth = flower.offsetWidth || 65;
        const flHeight = flower.offsetHeight || 65;
        
        const targetX = (bRect.left - sRect.left) + (bRect.width * slot.xPct) - (flWidth * (1 - slot.scale) / 2);
        const targetY = (bRect.top - sRect.top) + (bRect.height * slot.yPct) - (flHeight * (1 - slot.scale) / 2);
        
        flower.style.setProperty('left', targetX + 'px', 'important');
        flower.style.setProperty('top', targetY + 'px', 'important');
        flower.style.setProperty('transform', `scale(${slot.scale}) rotate(${slot.rot}deg)`, 'important');
        
        sakuraProgress++;
        sakuraniaProgressBar.style.width = (sakuraProgress * 25) + '%';
        sakuraniaCharacter.src = 'public/assets/sakurania_happy.png';
        
        if (sakuraProgress < 4) {
            setTimeout(() => {
                if (sakuraProgress < 4) sakuraniaCharacter.src = 'public/assets/sakurania_neutral.png';
            }, 1000);
        } else {
            setTimeout(() => {
                sakuraniaResetButton.classList.remove('hidden');
                startSakuraRain();
                
                audioFinal.currentTime = 0;
                audioFinal.play().catch(e => console.log(e));
                
                const sakuDragon = document.getElementById('sakurania-dragon-container');
                if (sakuDragon) sakuDragon.className = 'dragon-container fly-sakurania';
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


    // --- 6. NAYADIA LOGIC ---
    const nayadiaResetButton = document.getElementById('nayadia-reset-button');
    const nayadiaCharacter = document.getElementById('nayadia-character');
    const nayadiaProgressBar = document.getElementById('nayadia-progress-bar');
    const nayaBowl = document.getElementById('nayadia-bowl');
    const nayadiaRainContainer = document.getElementById('nayadia-rain-container');
    const nayaFlowers = document.querySelectorAll('#scene-nayadia .nayadia-flower');
    let nayadiaProgress = 0;

    if (nayadiaResetButton) {
        nayadiaResetButton.addEventListener('click', () => {
            bgAudioElement.currentTime = 0;
            bgAudioElement.play().catch(e => console.log(e));
            changeScene('MAP');
            nayadiaProgress = 0;
            nayadiaProgressBar.style.width = '0%';
            nayadiaCharacter.src = 'public/assets/nayadia_neutral.png';
            nayaBowl.src = 'public/assets/nayadia_bowl.png';
            nayadiaRainContainer.innerHTML = '';
            nayadiaResetButton.classList.add('hidden');
            nayaFlowers.forEach(f => {
                f.classList.remove('dropped');
                f.style.removeProperty('left');
                f.style.removeProperty('top');
                f.style.removeProperty('transform');
                f.style.transform = 'translate(0px, 0px)';
                f.dataset.x = 0;
                f.dataset.y = 0;
            });
            const nayaDragon = document.getElementById('nayadia-dragon-container');
            if (nayaDragon) nayaDragon.className = 'dragon-container';
        });
    }

    let activeNayaFlower = null;
    let nayaInitX, nayaInitY, nayaCurX, nayaCurY;
    let nayaAnimFrameId = null;

    nayaFlowers.forEach(flower => {
        flower.dataset.x = 0;
        flower.dataset.y = 0;
        flower.dataset.origLeft = flower.style.left || window.getComputedStyle(flower).left;
        flower.dataset.origTop = flower.style.top || window.getComputedStyle(flower).top;
        flower.addEventListener('pointerdown', e => {
            if (nayadiaProgress >= 4 || e.target.classList.contains('dropped')) return;
            activeNayaFlower = e.target;
            nayaInitX = e.clientX - parseFloat(activeNayaFlower.dataset.x);
            nayaInitY = e.clientY - parseFloat(activeNayaFlower.dataset.y);
            activeNayaFlower.setPointerCapture(e.pointerId);
        });
    });

    document.addEventListener('pointermove', e => {
        if (activeNayaFlower) {
            e.preventDefault();
            nayaCurX = e.clientX - nayaInitX;
            nayaCurY = e.clientY - nayaInitY;
            activeNayaFlower.dataset.x = nayaCurX;
            activeNayaFlower.dataset.y = nayaCurY;
            
            if (!nayaAnimFrameId) {
                nayaAnimFrameId = requestAnimationFrame(() => {
                    if (activeNayaFlower) {
                        activeNayaFlower.style.transform = `translate(${nayaCurX}px, ${nayaCurY}px)`;
                        const fRect = activeNayaFlower.getBoundingClientRect();
                        const bRect = nayaBowl.getBoundingClientRect();
                        if (
                            fRect.left < bRect.right &&
                            fRect.right > bRect.left &&
                            fRect.top < bRect.bottom &&
                            fRect.bottom > bRect.top
                        ) {
                            dropNayadiaFlower(activeNayaFlower);
                            activeNayaFlower = null;
                        }
                    }
                    nayaAnimFrameId = null;
                });
            }
        }
    });

    document.addEventListener('pointerup', () => {
        if (activeNayaFlower) {
            const fRect = activeNayaFlower.getBoundingClientRect();
            const bRect = nayaBowl.getBoundingClientRect();
            if (
                fRect.left < bRect.right &&
                fRect.right > bRect.left &&
                fRect.top < bRect.bottom &&
                fRect.bottom > bRect.top
            ) {
                dropNayadiaFlower(activeNayaFlower);
            }
            activeNayaFlower = null;
        }
    });

    function dropNayadiaFlower(flower) {
        audioDestello.currentTime = 0;
        audioDestello.play().catch(e => console.log(e));
        
        flower.classList.add('dropped');
        flower.dataset.x = 0;
        flower.dataset.y = 0;
        const bRect = nayaBowl.getBoundingClientRect();
        const sRect = scenes.NAYADIA.getBoundingClientRect();
        
        // Progressive flower bouquet stacking inside the celestial bowl
        const flowerSlots = [
            { xPct: 0.16, yPct: 0.32, rot: -16, scale: 0.68 }, // 1st flower: bottom-left
            { xPct: 0.52, yPct: 0.35, rot: 18,  scale: 0.68 }, // 2nd flower: bottom-right
            { xPct: 0.34, yPct: 0.18, rot: -6,  scale: 0.72 }, // 3rd flower: center nestled
            { xPct: 0.36, yPct: 0.02, rot: 10,  scale: 0.78 }  // 4th flower: blooming on top rim
        ];
        
        const slot = flowerSlots[nayadiaProgress] || flowerSlots[0];
        const flWidth = flower.offsetWidth || 78;
        const flHeight = flower.offsetHeight || 78;
        
        const targetX = (bRect.left - sRect.left) + (bRect.width * slot.xPct) - (flWidth * (1 - slot.scale) / 2);
        const targetY = (bRect.top - sRect.top) + (bRect.height * slot.yPct) - (flHeight * (1 - slot.scale) / 2);
        
        flower.style.setProperty('left', targetX + 'px', 'important');
        flower.style.setProperty('top', targetY + 'px', 'important');
        flower.style.setProperty('transform', `scale(${slot.scale}) rotate(${slot.rot}deg)`, 'important');
        
        nayadiaProgress++;
        nayadiaProgressBar.style.width = (nayadiaProgress * 25) + '%';
        nayadiaCharacter.src = 'public/assets/nayadia_happy.png';
        
        if (nayadiaProgress < 4) {
            setTimeout(() => {
                if (nayadiaProgress < 4) nayadiaCharacter.src = 'public/assets/nayadia_neutral.png';
            }, 1000);
        } else {
            setTimeout(() => {
                nayadiaResetButton.classList.remove('hidden');
                startNayadiaRain();
                
                audioFinal.currentTime = 0;
                audioFinal.play().catch(e => console.log(e));
                
                const nayaDragon = document.getElementById('nayadia-dragon-container');
                if (nayaDragon) nayaDragon.className = 'dragon-container fly-nayadia';
            }, 1000);
        }
    }

    function startNayadiaRain() {
        for (let i = 0; i < 24; i++) {
            const spark = document.createElement('div');
            spark.classList.add('falling-nayadia');
            spark.style.left = Math.random() * 100 + 'vw';
            spark.style.animationDuration = (Math.random() * 2.5 + 2) + 's';
            spark.style.animationDelay = (Math.random() * 2) + 's';
            nayadiaRainContainer.appendChild(spark);
        }
    }


    // --- 7. NARCISA LOGIC ---
    const narcisaResetButton = document.getElementById('narcisa-reset-button');
    const narcisaCharacter = document.getElementById('narcisa-character');
    const narcisaProgressBar = document.getElementById('narcisa-progress-bar');
    const narcBowl = document.getElementById('narcisa-bowl');
    const narcisaRainContainer = document.getElementById('narcisa-rain-container');
    const narcFlowers = document.querySelectorAll('#scene-narcisa .narcisa-flower');
    let narcisaProgress = 0;

    if (narcisaResetButton) {
        narcisaResetButton.addEventListener('click', () => {
            bgAudioElement.currentTime = 0;
            bgAudioElement.play().catch(e => console.log(e));
            changeScene('MAP');
            narcisaProgress = 0;
            narcisaProgressBar.style.width = '0%';
            narcisaCharacter.src = 'public/assets/narcisa_neutral.png';
            narcBowl.src = 'public/assets/nayadia_bowl.png';
            narcisaRainContainer.innerHTML = '';
            narcisaResetButton.classList.add('hidden');
            narcFlowers.forEach(f => {
                f.classList.remove('dropped');
                f.style.removeProperty('left');
                f.style.removeProperty('top');
                f.style.removeProperty('transform');
                f.style.transform = 'translate(0px, 0px)';
                f.dataset.x = 0;
                f.dataset.y = 0;
            });
            const narcDragon = document.getElementById('narcisa-dragon-container');
            if (narcDragon) narcDragon.className = 'dragon-container';
        });
    }

    let activeNarcFlower = null;
    let narcInitX, narcInitY, narcCurX, narcCurY;
    let narcAnimFrameId = null;

    narcFlowers.forEach(flower => {
        flower.dataset.x = 0;
        flower.dataset.y = 0;
        flower.dataset.origLeft = flower.style.left || window.getComputedStyle(flower).left;
        flower.dataset.origTop = flower.style.top || window.getComputedStyle(flower).top;
        flower.addEventListener('pointerdown', e => {
            if (narcisaProgress >= 4 || e.target.classList.contains('dropped')) return;
            activeNarcFlower = e.target;
            narcInitX = e.clientX - parseFloat(activeNarcFlower.dataset.x);
            narcInitY = e.clientY - parseFloat(activeNarcFlower.dataset.y);
            activeNarcFlower.setPointerCapture(e.pointerId);
        });
    });

    document.addEventListener('pointermove', e => {
        if (activeNarcFlower) {
            e.preventDefault();
            narcCurX = e.clientX - narcInitX;
            narcCurY = e.clientY - narcInitY;
            activeNarcFlower.dataset.x = narcCurX;
            activeNarcFlower.dataset.y = narcCurY;
            
            if (!narcAnimFrameId) {
                narcAnimFrameId = requestAnimationFrame(() => {
                    if (activeNarcFlower) {
                        activeNarcFlower.style.transform = `translate(${narcCurX}px, ${narcCurY}px)`;
                        const fRect = activeNarcFlower.getBoundingClientRect();
                        const bRect = narcBowl.getBoundingClientRect();
                        if (
                            fRect.left < bRect.right &&
                            fRect.right > bRect.left &&
                            fRect.top < bRect.bottom &&
                            fRect.bottom > bRect.top
                        ) {
                            dropNarcisaFlower(activeNarcFlower);
                            activeNarcFlower = null;
                        }
                    }
                    narcAnimFrameId = null;
                });
            }
        }
    });

    document.addEventListener('pointerup', () => {
        if (activeNarcFlower) {
            const fRect = activeNarcFlower.getBoundingClientRect();
            const bRect = narcBowl.getBoundingClientRect();
            if (
                fRect.left < bRect.right &&
                fRect.right > bRect.left &&
                fRect.top < bRect.bottom &&
                fRect.bottom > bRect.top
            ) {
                dropNarcisaFlower(activeNarcFlower);
            }
            activeNarcFlower = null;
        }
    });

    function dropNarcisaFlower(flower) {
        audioDestello.currentTime = 0;
        audioDestello.play().catch(e => console.log(e));
        
        flower.classList.add('dropped');
        flower.dataset.x = 0;
        flower.dataset.y = 0;
        const bRect = narcBowl.getBoundingClientRect();
        const sRect = scenes.NARCISA.getBoundingClientRect();
        
        const flowerSlots = [
            { xPct: 0.16, yPct: 0.32, rot: -16, scale: 0.68 },
            { xPct: 0.52, yPct: 0.35, rot: 18,  scale: 0.68 },
            { xPct: 0.34, yPct: 0.18, rot: -6,  scale: 0.72 },
            { xPct: 0.36, yPct: 0.02, rot: 10,  scale: 0.78 }
        ];
        
        const slot = flowerSlots[narcisaProgress] || flowerSlots[0];
        const flWidth = flower.offsetWidth || 78;
        const flHeight = flower.offsetHeight || 78;
        
        const targetX = (bRect.left - sRect.left) + (bRect.width * slot.xPct) - (flWidth * (1 - slot.scale) / 2);
        const targetY = (bRect.top - sRect.top) + (bRect.height * slot.yPct) - (flHeight * (1 - slot.scale) / 2);
        
        flower.style.setProperty('left', targetX + 'px', 'important');
        flower.style.setProperty('top', targetY + 'px', 'important');
        flower.style.setProperty('transform', `scale(${slot.scale}) rotate(${slot.rot}deg)`, 'important');
        
        narcisaProgress++;
        narcisaProgressBar.style.width = (narcisaProgress * 25) + '%';
        narcisaCharacter.src = 'public/assets/narcisa_happy.png';
        
        if (narcisaProgress < 4) {
            setTimeout(() => {
                if (narcisaProgress < 4) narcisaCharacter.src = 'public/assets/narcisa_neutral.png';
            }, 1000);
        } else {
            setTimeout(() => {
                narcisaResetButton.classList.remove('hidden');
                startNarcisaRain();
                
                audioFinal.currentTime = 0;
                audioFinal.play().catch(e => console.log(e));
                
                const narcDragon = document.getElementById('narcisa-dragon-container');
                if (narcDragon) narcDragon.className = 'dragon-container fly-narcisa';
            }, 1000);
        }
    }

    function startNarcisaRain() {
        for (let i = 0; i < 24; i++) {
            const spark = document.createElement('div');
            spark.classList.add('falling-narcisa');
            spark.style.left = Math.random() * 100 + 'vw';
            spark.style.animationDuration = (Math.random() * 2.5 + 2) + 's';
            spark.style.animationDelay = (Math.random() * 2) + 's';
            narcisaRainContainer.appendChild(spark);
        }
    }
});
