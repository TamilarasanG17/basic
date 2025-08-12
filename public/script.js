// public/script.js
const API_BASE_URL = 'https://basic-9wbh.onrender.com/api/auth';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const otpForm = document.getElementById('otpForm');
    const detailsForm = document.getElementById('detailsForm');

    // Handle Registration
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const messageDiv = document.getElementById('register-message');

            try {
                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();
                
                if (response.ok) {
                    messageDiv.className = 'message success';
                    messageDiv.textContent = data.message;
                    localStorage.setItem('verificationEmail', email);
                    setTimeout(() => {
                        window.location.href = `/verify?email=${email}`;
                    }, 2000);
                } else {
                    messageDiv.className = 'message error';
                    messageDiv.textContent = data.error || data.message;
                }
            } catch (error) {
                messageDiv.className = 'message error';
                messageDiv.textContent = 'An error occurred. Please try again.';
            }
        });
    }

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const messageDiv = document.getElementById('login-message');

            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    messageDiv.className = 'message success';
                    messageDiv.textContent = data.message;
                    localStorage.setItem('verificationEmail', email);
                    setTimeout(() => {
                        window.location.href = `/verify?email=${email}`;
                    }, 2000);
                } else {
                    messageDiv.className = 'message error';
                    messageDiv.textContent = data.message;
                }
            } catch (error) {
                messageDiv.className = 'message error';
                messageDiv.textContent = 'An error occurred. Please try again.';
            }
        });
    }

    // Handle OTP Verification
    if (otpForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        const otpEmailInput = document.getElementById('otpEmail');
        
        if (email && otpEmailInput) {
            otpEmailInput.value = email;
        } else {
            const storedEmail = localStorage.getItem('verificationEmail');
            if (storedEmail) {
                otpEmailInput.value = storedEmail;
            } else {
                window.location.href = '/';
            }
        }

        otpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const otp = document.getElementById('otpInput').value;
            const messageDiv = document.getElementById('otp-message');

            try {
                const response = await fetch(`${API_BASE_URL}/verify-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: otpEmailInput.value, otp })
                });

                const data = await response.json();

                if (response.ok) {
                    messageDiv.className = 'message success';
                    messageDiv.textContent = data.message;
                    
                    if (data.token) {
                        localStorage.setItem('token', data.token);
                        setTimeout(() => {
                            window.location.href = '/home';
                        }, 2000);
                    } else {
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 2000);
                    }
                } else {
                    messageDiv.className = 'message error';
                    messageDiv.textContent = data.message;
                }
            } catch (error) {
                messageDiv.className = 'message error';
                messageDiv.textContent = 'An error occurred. Please try again.';
            }
        });
    }

    // Handle details form submission on the home page
    if (detailsForm) {
        detailsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('title').value;
            const content = document.getElementById('content').value;

            const detailsDisplay = document.getElementById('details-display');
            const newEntry = document.createElement('div');
            newEntry.classList.add('detail-entry');
            newEntry.innerHTML = `
                <h4>${title}</h4>
                <p>${content}</p>
            `;
            detailsDisplay.appendChild(newEntry);

            // Clear the form fields
            document.getElementById('title').value = '';
            document.getElementById('content').value = '';
        });
    }
});