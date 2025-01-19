document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Login successful');
            // Redirect to the index page or any other page after successful login
            window.location.href = '/';
        } else {
            // Handle error messages from server, such as incorrect credentials
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error while logging in. Please try again.');
    }
});