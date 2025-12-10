// index.js (โค้ดเดิมยังใช้งานได้)

document.addEventListener('DOMContentLoaded', () => {

    // Helper function to get element
    const get = (selector) => document.querySelector(selector);
    const getAll = (selector) => document.querySelectorAll(selector);

    // --- 4. Year in footer ---
    (() => {
        const yearSpan = get('#year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    })();

    // --- 4. Typing effect ---
    (() => {
        const typingElement = get('#typing');
        if (!typingElement) return;

        const textToType = typingElement.getAttribute('data-text');
        let index = 0;
        
        // Clear the initial text before starting the effect
        typingElement.textContent = ''; 

        function type() {
            if (index < textToType.length) {
                typingElement.textContent += textToType.charAt(index);
                index++;
                setTimeout(type, 100); // Speed of typing
            } else {
                // Keep cursor blinking at the end (controlled by CSS)
                typingElement.style.borderRight = '4px solid #e0e0e0';
            }
        }
        
        setTimeout(type, 500); // Initial delay
    })();

    // --- 4. Music Player + Equalizer ---
    (() => {
        const playBtn = get('#playBtn');
        const audio = get('#audio');
        const playerContainer = get('.music-player');

        if (!playBtn || !audio || !playerContainer) return;

        let isPlaying = false;

        playBtn.addEventListener('click', () => {
            if (isPlaying) {
                audio.pause();
                playBtn.innerHTML = '<i class="fas fa-play"></i> ▶️ Music Stream';
                playerContainer.classList.remove('playing');
                isPlaying = false;
            } else {
                audio.load(); 
                audio.play().then(() => {
                    playBtn.innerHTML = '<i class="fas fa-pause"></i> ⏸️ Music Stream';
                    playerContainer.classList.add('playing');
                    isPlaying = true;
                }).catch(error => {
                    console.error("Error playing audio:", error);
                    alert("ไม่สามารถเล่นเพลงได้: โปรดตรวจสอบการตั้งค่าเบราว์เซอร์เกี่ยวกับการเล่นอัตโนมัติ");
                    playBtn.innerHTML = '<i class="fas fa-play"></i> ▶️ Music Stream';
                    playerContainer.classList.remove('playing');
                    isPlaying = false;
                });
            }
        });

        audio.addEventListener('ended', () => {
            isPlaying = false;
            playBtn.innerHTML = '<i class="fas fa-play"></i> ▶️ Music Stream';
            playerContainer.classList.remove('playing');
        });
        audio.addEventListener('error', (e) => {
             console.error("Audio Error:", e);
             isPlaying = false;
             playBtn.innerHTML = '<i class="fas fa-play"></i> ▶️ Music Stream (Error)';
             playerContainer.classList.remove('playing');
        });
    })();
    
    // --- 4. Login + Protect contacts ---
    (() => {
        const loginModal = get('#loginModal');
        const loginBtn = get('#loginBtn');
        const loginCancel = get('#loginCancel');
        const loginForm = get('#loginForm');
        const loginErr = get('#loginErr');
        const emailInput = get('#email');
        const passwordInput = get('#password');
        const protectedLinks = getAll('[data-protect="contact"]');

        const CORRECT_EMAIL = '5460kg@gmail.com';
        const CORRECT_PASS = 'admin';

        // Function to open modal
        const openModal = (modal) => {
            modal.style.display = 'block';
            if(modal.id === 'loginModal'){
                emailInput.value = '';
                passwordInput.value = '';
                loginErr.textContent = '';
            }
        };

        // Function to close modal
        const closeModal = (modal) => {
            modal.style.display = 'none';
        };

        // --- Unlock Logic ---
        const unlockContacts = () => {
            protectedLinks.forEach(link => {
                const href = link.getAttribute('data-href');
                const label = link.getAttribute('data-label');
                
                link.href = href;
                link.textContent = label;
                link.classList.remove('locked-contact');
                link.style.color = '#28a745'; // Highlight unlocked link
                link.removeAttribute('data-protect');
            });
            
            if(loginBtn){
                 loginBtn.innerHTML = '<i class="fas fa-unlock"></i> ปลดล็อกแล้ว';
                 loginBtn.disabled = true;
                 loginBtn.style.backgroundColor = '#28a745';
                 loginBtn.style.cursor = 'default';
            }
        };

        // --- Event Listeners for Login Modal ---
        loginBtn.addEventListener('click', () => openModal(loginModal));
        loginCancel.addEventListener('click', () => closeModal(loginModal));
        
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                closeModal(loginModal);
            }
        });

        // Click on protected link opens login modal
        protectedLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if(link.hasAttribute('data-protect')){
                    e.preventDefault();
                    openModal(loginModal);
                }
            });
        });

        // --- Login Form Submission ---
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (email === CORRECT_EMAIL && password === CORRECT_PASS) {
                loginErr.style.color = 'lightgreen';
                loginErr.textContent = 'เข้าสู่ระบบสำเร็จ ✔';
                
                setTimeout(() => {
                    closeModal(loginModal);
                    unlockContacts();
                }, 1000); 
                
            } else {
                loginErr.style.color = 'red';
                loginErr.textContent = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
            }
        });
    })();

    // --- 4. QR Support Modal ---
    (() => {
        const qrModal = get('#qrModal');
        const supportQrBtn = get('#supportQrBtn');
        const qrClose = get('#qrClose');

        if (!qrModal || !supportQrBtn || !qrClose) return;

        const openModal = (modal) => {
            modal.style.display = 'block';
        };

        const closeModal = (modal) => {
            modal.style.display = 'none';
        };

        supportQrBtn.addEventListener('click', () => openModal(qrModal));
        qrClose.addEventListener('click', () => closeModal(qrModal));
        
        qrModal.addEventListener('click', (e) => {
            if (e.target === qrModal) {
                closeModal(qrModal);
            }
        });
    })();
});
