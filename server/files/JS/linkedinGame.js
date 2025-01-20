document.getElementById("votingForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const selectedOption = document.querySelector('input[name="choice"]:checked').value;
    const correctOption = "1"; 

    const response = await fetch("/vote", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedOption, correctOption }),
    });

    const result = await response.json();
    document.getElementById("result").textContent = result.message;
    document.getElementById("result").style.color = result.message.includes("Correct") ? "green" : "red";
});