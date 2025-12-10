// Regular Log In Responses
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    const loginButton = document.getElementById('signInButton');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form from submitting the traditional way
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/log_in', true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    alert('Log In Successful');
                    window.location.href = '/landing_page.html';
                } else if (xhr.status == 401) {
                    alert('Invalid username or password');
                } else if (xhr.status == 403) {
                    alert('Invalid username or password');
                } else {
                    alert('An error occurred. Please try again.');
                }
            }
        };

        xhr.send(JSON.stringify({ username, password }));
    });
});

// Google Log In
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