// Regular Log In
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    signupForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form from submitting the traditional way

        // check if passwords match
        if (passwordInput.value !== confirmPasswordInput.value) {
        alert('Passwords do not match!');
        return;
        }

        // Collect form data
        const formData = {
            email: document.getElementById('email').value,
            username: document.getElementById('username').value,
            firstname: document.getElementById('firstname').value,
            lastname: document.getElementById('lastname').value,
            password: passwordInput.value,
            phoneNumber: document.getElementById('phone-number').value || null // handle optional phone number
        };

        // send form data to server
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/sign_up', true);
        xhr.setRequestHeader('Content-type', 'application/json');

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    alert('Sign Up Successful');
                    window.location.href = '/landing_page.html';
                } else if (xhr.status === 409) {
                    alert('User with this email already exists.');
                } else {
                    alert('An error occurred. Please try again.');
                }
            }
        };

        xhr.send(JSON.stringify(formData));
    });
});

// Google Sign Up
function do_google_login(response) {
    let req = new XMLHttpRequest();

    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            if (req.status == 200) {
                alert('Logged in with Google successfully');
                window.location.href = '/landing_page.html';
            } else if (req.status == 401) {
                alert('Login FAILED');
            } else if (req.status == 403) {
                alert('Please Login with Google');
            } else {
                alert('An error occurred. Please try again.');
            }
        }
    };

    req.open('POST', '/log_in');
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify({ credential: response.credential }));
}