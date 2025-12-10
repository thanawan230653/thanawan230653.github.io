// index.js

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
                typingElement.style.borderRight = '3px solid #4dc4ff';
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
                playBtn.innerHTML = '<i class="fas fa-play"></i> ▶️ เล่นเพลง';
                playerContainer.classList.remove('playing');
                isPlaying = false;
            } else {
                audio.load(); // Reload the stream to ensure it starts fresh
                audio.play().then(() => {
                    playBtn.innerHTML = '<i class="fas fa-pause"></i> ⏸️ หยุดชั่วคราว';
                    playerContainer.classList.add('playing');
                    isPlaying = true;
                }).catch(error => {
                    console.error("Error playing audio:", error);
                    // Handle browser autoplay restrictions if needed
                    alert("ไม่สามารถเล่นเพลงได้: โปรดตรวจสอบการตั้งค่าเบราว์เซอร์เกี่ยวกับการเล่นอัตโนมัติ");
                    playBtn.innerHTML = '<i class="fas fa-play"></i> ▶️ เล่นเพลง';
                    playerContainer.classList.remove('playing');
                    isPlaying = false;
                });
            }
        });

        // Reset state if audio ends (though a stream shouldn't) or errors
        audio.addEventListener('ended', () => {
            isPlaying = false;
            playBtn.innerHTML = '<i class="fas fa-play"></i> ▶️ เล่นเพลง';
            playerContainer.classList.remove('playing');
        });
        audio.addEventListener('error', (e) => {
             console.error("Audio Error:", e);
             isPlaying = false;
             playBtn.innerHTML = '<i class="fas fa-play"></i> ▶️ เล่นเพลง (Error)';
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
            // Clear inputs and error when opening
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
                link.removeAttribute('data-protect');
            });
            
            // Disable login button
            if(loginBtn){
                 loginBtn.innerHTML = '<i class="fas fa-unlock"></i> ล็อกอินสำเร็จ';
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
                // Only prevent default if it's still locked
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
                // Success
                loginErr.style.color = 'lightgreen';
                loginErr.textContent = 'เข้าสู่ระบบสำเร็จ ✔';
                
                setTimeout(() => {
                    closeModal(loginModal);
                    unlockContacts();
                }, 1000); // Close after 1 second
                
            } else {
                // Error
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

        // Function to open modal
        const openModal = (modal) => {
            modal.style.display = 'block';
        };

        // Function to close modal
        const closeModal = (modal) => {
            modal.style.display = 'none';
        };

        // Open when button is clicked
        supportQrBtn.addEventListener('click', () => openModal(qrModal));

        // Close when close button is clicked
        qrClose.addEventListener('click', () => closeModal(qrModal));
        
        // Close when background is clicked
        qrModal.addEventListener('click', (e) => {
            if (e.target === qrModal) {
                closeModal(qrModal);
            }
        });
    })();
});
