document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const authContainer = document.getElementById("authContainer");
  const quizContainer = document.getElementById("quizContainer");
  const leaderboardContainer = document.getElementById("leaderboardContainer");
  const completedContainer = document.getElementById("completedContainer");
  const loginBtn = document.getElementById("loginBtn");
  const timerElement = document.getElementById("timer");
  const copyCodeBtn = document.getElementById("copyCode");
  const skipQuestionBtn = document.getElementById("skipQuestion");
  const submitAnswerBtn = document.getElementById("submitAnswer");
  const codeSnippetElement = document.getElementById("codeSnippet");
  const progressElement = document.getElementById("progress");
  const languageBadge = document.getElementById("languageBadge");
  const difficultyIndicator = document.getElementById("difficultyIndicator");
  const hintToggle = document.getElementById("hintToggle");
  const hintContainer = document.getElementById("hintContainer");
  const restartQuizBtn = document.getElementById("restartQuiz");
  const resultsElement = document.getElementById("results");
  const finalScoreElement = document.getElementById("finalScore");
  const leaderboardBody = document.getElementById("leaderboardBody");
  const navTabs = document.querySelectorAll(".nav-tab");
  const optionsContainer = document.getElementById("optionsContainer");
  const skipCounter = document.getElementById("skipCounter");

  // Quiz state
  let timerInterval;
  let timeLeft = 25 * 60; // 25 minutes in seconds
  let currentQuestion = 0;
  let userData = {};
  let startTime;
  let userScore = 0;
  let selectedOption = null;
  let skipsRemaining = 5;
  let currentLevel = "";

  // Leaderboard data (local for now; could be backend later)
  let leaderboardData =
    JSON.parse(localStorage.getItem("neocodeLeaderboard")) || [];

  // Question bank (keeping as-is)
  const questionsByLevel = {
    100: [
      {
        language: "Python",
        difficulty: "Easy",
        code: `# Python syntax issue  
  
def greet(name)  
print("Hello, " + name)  
  
greet("Alice")`,
        hint: "Check the function definition syntax.",
        options: [
          "Hello, Alice",
          "SyntaxError: invalid syntax",
          "NameError: name 'greet' is not defined",
          "Hello, name",
        ],
        correctAnswer: 1,
      },
      // ... rest of questions ...
    ],
    // 200, 300, 400 levels as before
  };

  // Navigation tabs
  navTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabName = this.getAttribute("data-tab");
      navTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      authContainer.style.display = "none";
      quizContainer.style.display = "none";
      leaderboardContainer.style.display = "none";
      completedContainer.style.display = "none";

      if (tabName === "auth") authContainer.style.display = "block";
      if (tabName === "quiz") quizContainer.style.display = "block";
      if (tabName === "leaderboard") {
        leaderboardContainer.style.display = "block";
        updateLeaderboard();
      }
    });
  });

  // 🔑 Login button handler (integrated with backend)
  loginBtn.addEventListener("click", async function () {
    const teamName = document.getElementById("teamName").value.trim();
    const teamLevel = document.getElementById("teamLevel").value.trim();
    const teamPassword = document.getElementById("teamPassword").value.trim();

    if (!teamName || !teamPassword) {
      alert("Please provide team codename and access code.");
      return;
    }

    try {
      const response = await fetch("auth/member/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ session cookie
        body: JSON.stringify({ codeName: teamName, accessCode: teamPassword, ugLevel: teamLevel }),
      });

      if (!response.ok) {
        const msg = await response.text();
        alert("Login failed: " + msg);
        return;
      }

      const msg = await response.text();
      alert(msg);

      // Save user session data
      userData = {
        team: teamName,
        level: teamLevel,
        startTime: new Date().toISOString(),
        answers: [],
      };
      currentLevel = teamLevel;

      // Switch UI
      authContainer.style.display = "none";
      quizContainer.style.display = "block";
      document.querySelector('[data-tab="quiz"]').style.display = "block";
      document.querySelector('[data-tab="auth"]').classList.remove("active");
      document.querySelector('[data-tab="quiz"]').classList.add("active");

      // Start quiz
      startTime = new Date();
      startTimer();
      loadQuestion(0);
    } catch (err) {
      console.error("Login error:", err);
      alert("An error occurred while logging in.");
    }
  });

  // ⏳ Timer
  function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(function () {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endQuiz();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
    if (timeLeft < 120) {
      timerElement.style.color = "var(--neon-red)";
      timerElement.style.animation = "glitch 0.5s infinite";
    }
  }

  // 📜 Load question
  function loadQuestion(index) {
    const questions = questionsByLevel[currentLevel];
    const question = questions[index];
    codeSnippetElement.textContent = question.code;
    progressElement.textContent = `Challenge ${index + 1} of ${
      questions.length
    }`;

    languageBadge.textContent = question.language;
    languageBadge.className =
      question.language === "Java"
        ? "language-badge java-badge"
        : "language-badge python-badge";

    difficultyIndicator.textContent = `DIFFICULTY: ${question.difficulty.toUpperCase()}`;
    difficultyIndicator.className = "difficulty-indicator";
    difficultyIndicator.classList.add(
      "difficulty-" + question.difficulty.toLowerCase()
    );

    hintContainer.innerHTML = `<strong>Hint:</strong> ${question.hint}`;

    optionsContainer.innerHTML = "";
    question.options.forEach((option, i) => {
      const optionElement = document.createElement("div");
      optionElement.className = "option";
      optionElement.textContent = `${String.fromCharCode(65 + i)}) ${option}`;
      optionElement.addEventListener("click", () => {
        document
          .querySelectorAll(".option")
          .forEach((opt) => opt.classList.remove("selected"));
        optionElement.classList.add("selected");
        selectedOption = i;
      });
      optionsContainer.appendChild(optionElement);
    });
  }

  // 💾 Leaderboard
  function updateLeaderboard() {
    const teamIndex = leaderboardData.findIndex(
      (entry) => entry.team === userData.team && entry.level === userData.level
    );

    if (teamIndex !== -1) {
      leaderboardData[teamIndex].score = userScore;
      leaderboardData[teamIndex].progress = `${currentQuestion + 1}/20`;
    } else {
      leaderboardData.push({
        team: userData.team,
        level: userData.level,
        score: userScore,
        progress: `${currentQuestion + 1}/20`,
      });
    }

    leaderboardData.sort((a, b) => b.score - a.score);
    localStorage.setItem("neocodeLeaderboard", JSON.stringify(leaderboardData));

    leaderboardBody.innerHTML = "";
    leaderboardData.forEach((entry, index) => {
      const row = document.createElement("tr");

      const rankCell = document.createElement("td");
      rankCell.textContent = `#${index + 1}`;
      if (index === 0) {
        rankCell.innerHTML = `<i class="fas fa-crown" style="color: var(--neon-yellow);"></i> #1`;
      }
      row.appendChild(rankCell);

      const teamCell = document.createElement("td");
      teamCell.textContent = entry.team;
      row.appendChild(teamCell);

      const levelCell = document.createElement("td");
      levelCell.textContent = `UG${entry.level[0]} - ${entry.level} Level`;
      row.appendChild(levelCell);

      const scoreCell = document.createElement("td");
      scoreCell.textContent = entry.score;
      scoreCell.style.color = "var(--neon-green)";
      row.appendChild(scoreCell);

      const progressCell = document.createElement("td");
      progressCell.textContent = entry.progress;
      row.appendChild(progressCell);

      leaderboardBody.appendChild(row);
    });
  }

  // 🚪 Logout (optional button)
  async function logoutMember() {
    try {
      const response = await fetch("auth/member/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        alert("Logged out successfully.");
        quizContainer.style.display = "none";
        authContainer.style.display = "block";
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  }
  window.logoutMember = logoutMember; // make callable globally
});
