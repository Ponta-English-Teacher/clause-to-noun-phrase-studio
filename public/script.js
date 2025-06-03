const SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyyQ51iuEfmlY2jptmI-I5jkAnEWCQyH9n5VoRfvkRUp-OZkgiufzeP5moHtqtJNFV92A/exec";
const VERCEL_API_PROXY_URL = "/api/record"; // This is the endpoint for your Vercel serverless function

let currentQuestionIndex = 0;
let questions = [];

// Load questions from JSON
async function loadQuestions() {
  try {
    const response = await fetch("questions.json"); // Corrected path for Vercel serving
    questions = await response.json();
    showQuestion();
  } catch (error) {
    console.error("Failed to load questions:", error);
    document.getElementById("prompt").textContent = "Failed to load questions.";
  }
}

// Display the current question
function showQuestion() {
  const question = questions[currentQuestionIndex];
  if (!question) return;

  document.getElementById("question-number").textContent = `Question ${question.id}`;
  document.getElementById("context").textContent = `Context: ${question.context}`;
  document.getElementById("prompt").textContent = question.prompt;
  document.getElementById("cue").textContent = `Cue: ${question.cue}`;
  document.getElementById("input-answer").value = "";
  document.getElementById("feedback").style.display = "none";
  document.getElementById("feedback").textContent = "";
}

// Show the correct answer and explanation
function showAnswer() {
  const question = questions[currentQuestionIndex];
  const correct = question.answers ? question.answers.join(" / ") : "(No answer available)";
  const explanation = question.explanation || "(No explanation provided.)";

  document.getElementById("feedback").innerHTML =
    `<strong>Answer:</strong> ${correct}<br><strong>Explanation:</strong> ${explanation}`;
  document.getElementById("feedback").style.display = "block";
}

// Submit the user's answer
function submitAnswer() {
  const userInputRaw = document.getElementById("input-answer").value.trim();
  const userInputLower = userInputRaw.toLowerCase();
  const question = questions[currentQuestionIndex];
  const correctAnswers = question.answers
    ? question.answers.map(ans => ans.trim().toLowerCase())
    : [];

  const isCorrect = correctAnswers.includes(userInputLower);
  const message = isCorrect
    ? "✅ Correct!"
    : "❌ Not quite. Try again or click 'Show Answer'.";

  document.getElementById("feedback").innerHTML = message;
  document.getElementById("feedback").style.display = "block";

  // Send answer to Google Sheet via Vercel proxy
  recordAnswer(question.id, userInputRaw, isCorrect);
}

// Go to the next question
function nextQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  } else {
    document.getElementById("prompt").textContent = "🎉 You've completed all the questions!";
    document.getElementById("context").textContent = "Well done!";
    document.getElementById("cue").textContent = "";
    document.getElementById("question-number").textContent = "Done!";
    document.getElementById("input-answer").value = "";
    document.getElementById("feedback").style.display = "none";
  }
}

// Send data to backend (API proxy) - Declared async to use await
async function recordAnswer(questionId, userAnswer, isCorrect) {
  try {
    const payload = {
      questionId,
      userAnswer,
      isCorrect
    };

    // Correctly using the Vercel API proxy URL
    const response = await fetch(VERCEL_API_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log("RecordAnswer response:", result);
  } catch (error) {
    console.error("recordAnswer() failed:", error);
  }
}

// Hook up buttons and load questions on page load
window.onload = () => {
  loadQuestions();
  document.getElementById("btn-submit").onclick = submitAnswer;
  document.getElementById("btn-show-answer").onclick = showAnswer;
  document.getElementById("btn-next").onclick = nextQuestion;
};