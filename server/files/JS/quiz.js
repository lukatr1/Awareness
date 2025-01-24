document.getElementById("check-btn").addEventListener("click", function () {
    const answers = {
        q1: "b", // Correct answer for question 1
        q2: "b", // Correct answer for question 2
        q3: "b", // Correct answer for question 3
        q4: "a", // Correct answer for question 4
        q5: "b"  // Correct answer for question 5
    };

    let score = 0;
    let feedback = '';

    // Check the users answers
    for (let question in answers) {
        let userAnswer = document.querySelector(`input[name="${question}"]:checked`);

        if (userAnswer && userAnswer.value === answers[question]) {
            score++;
        } else {
            feedback += `<br>Question ${question.slice(1)}: Incorrect. Correct answer: ${answers[question].toUpperCase()}`;
        }
    }

    // Show result and feedback
    const resultDiv = document.getElementById("result");
    const feedbackDiv = document.getElementById("feedback");

    if (score === 5) {
        feedbackDiv.innerHTML = `🎉 Congratulations! You answered all questions correctly!`;
    } else {
        feedbackDiv.innerHTML = `You got ${score} out of 5 questions right.<br>${feedback}`;
    }

    resultDiv.style.display = 'block'; 

   
});