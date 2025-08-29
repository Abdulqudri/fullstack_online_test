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

  // Leaderboard data
  let leaderboardData =
    JSON.parse(localStorage.getItem("neocodeLeaderboard")) || [];

  // Authentication passwords for each level (in a real app, this would be server-side)
  const levelPasswords = {
    100: "python101",
    200: "java202",
    300: "mix303",
    400: "hard404",
  };

  // Question bank organized by level with multiple-choice options
  const questionsByLevel = {
    100: [
      // UG1 - Python basics (20 questions)
      // Question 1
      {
        language: "Python",
        difficulty: "Easy",
        code: `# Python syntax issue  
  
def greet(name)  
print("Hello, " + name)  
  
greet("Alice"),   hint: "Check the function definition syntax.",   options: [   "Hello, Alice",   "SyntaxError: invalid syntax",   "NameError: name 'greet' is not defined",   "Hello, name"   ],   correctAnswer: 1   },   // Question 2   {   language: "Python",   difficulty: "Easy",   code: # Python loop issue  
for i in range(5)  
print(i),   hint: "Check the loop syntax.",   options: [   "0 1 2 3 4",   "SyntaxError: invalid syntax",   "0\n1\n2\n3\n4",   "1 2 3 4 5"   ],   correctAnswer: 1   },   // Add 18 more questions for UG1 here...   // Placeholder for additional questions   {   language: "Python",   difficulty: "Easy",   code: # Python variable issue  
x = 5  
y = "10"  
print(x + y),   hint: "Check data types compatibility.",   options: [   "15",   "510",   "TypeError: unsupported operand type(s) for +: 'int' and 'str'",   "510"   ],   correctAnswer: 2   },   // Add more questions as needed...   ],   "200": [ // UG2 - Java basics (20 questions)   {   language: "Java",   difficulty: "Easy",   code: // Java syntax issue  
public class HelloWorld {  
public static void main(String[] args) {  
System.out.println("Hello, World!")  
}  
},   hint: "Check the statement termination.",   options: [   "Hello, World!",   "Compilation error: missing semicolon",   "Runtime error",   "No output"   ],   correctAnswer: 1   },   {   language: "Java",   difficulty: "Easy",   code: // Java variable scope issue  
public class ScopeExample {  
public static void main(String[] args) {  
int x = 10;  
if (x > 5) {  
int y = 20;  
}  
System.out.println(y);  
}  
},   hint: "Check where variable y is defined.",   options: [   "20",   "10",   "Compilation error: cannot find symbol",   "0"   ],   correctAnswer: 2   },   // Add 18 more questions for UG2 here...   ],   "300": [ // UG3 - Mixed Java/Python (20 questions)   {   language: "Java",   difficulty: "Medium",   code: // Java string comparison issue  
public class StringCompare {  
public static void main(String[] args) {  
String s1 = "hello";  
String s2 = new String("hello");  
  
if (s1 == s2) {    
        System.out.println("Equal");    
    } else {    
        System.out.println("Not equal");    
    }    
}  
  
},   hint: "How does == work with objects in Java?",   options: [   "Equal",   "Not equal",   "Compilation error",   "Runtime exception"   ],   correctAnswer: 1   },   {   language: "Python",   difficulty: "Medium",   code: # Python string manipulation issue  
s = "hello"  
s[0] = "H"  
print(s),   hint: "Are strings mutable in Python?",   options: [   "Hello",   "hello",   "TypeError: 'str' object does not support item assignment",   "H"   ],   correctAnswer: 2   },   // Add 18 more questions for UG3 here...   ],   "400": [ // UG4 - Advanced topics (20 questions)   {   language: "Java",   difficulty: "Impossible",   code: // Java multithreading issue  
public class ThreadExample extends Thread {  
public void run() {  
System.out.println("Thread is running");  
}  
  
public static void main(String[] args) {    
    ThreadExample t = new ThreadExample();    
    t.run();    
}  
  
},   hint: "How do you start a thread in Java?",   options: [   "Thread is running",   "No output",   "Compilation error",   "Runtime exception"   ],   correctAnswer: 0   },   {   language: "Python",   difficulty: "Impossible",   code: # Python generator issue  
def number_generator(n):  
for i in range(n):  
yield i  
  
gen = number_generator(5)  
print(gen[0])`,
        hint: "How do you access values from a generator?",
        options: [
          "0",
          "TypeError: 'generator' object is not subscriptable",
          "1",
          "5",
        ],
        correctAnswer: 1,
      },
      // Add 18 more questions for UG4 here...
    ],
  };

  // Navigation tabs handler
  navTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabName = this.getAttribute("data-tab");

      // Remove active class from all tabs
      navTabs.forEach((t) => t.classList.remove("active"));

      // Add active class to clicked tab
      this.classList.add("active");

      // Show the corresponding section
      if (tabName === "auth") {
        authContainer.style.display = "block";
        quizContainer.style.display = "none";
        leaderboardContainer.style.display = "none";
        completedContainer.style.display = "none";
      } else if (tabName === "quiz") {
        authContainer.style.display = "none";
        quizContainer.style.display = "block";
        leaderboardContainer.style.display = "none";
        completedContainer.style.display = "none";
      } else if (tabName === "leaderboard") {
        authContainer.style.display = "none";
        quizContainer.style.display = "none";
        leaderboardContainer.style.display = "block";
        completedContainer.style.display = "none";
        updateLeaderboard();
      }
    });
  });

  // Login button handler
  loginBtn.addEventListener("click", function () {
    const teamName = document.getElementById("teamName").value;
    const teamLevel = document.getElementById("teamLevel").value;
    const teamPassword = document.getElementById("teamPassword").value;

    if (!teamName || !teamPassword) {
      alert("Please provide team name and access code.");
      return;
    }

    // Check password (in a real app, this would be server-side)
    if (teamPassword !== levelPasswords[teamLevel]) {
      alert("Invalid access code for this level.");
      return;
    }

    // Set user data
    userData = {
      team: teamName,
      level: teamLevel,
      startTime: new Date().toISOString(),
      answers: [],
    };

    currentLevel = teamLevel;

    // Show quiz tab and hide auth tab
    authContainer.style.display = "none";
    quizContainer.style.display = "block";
    document.querySelector('[data-tab="quiz"]').style.display = "block";
    document.querySelector('[data-tab="auth"]').classList.remove("active");
    document.querySelector('[data-tab="quiz"]').classList.add("active");

    // Start the quiz
    startTime = new Date();
    startTimer();
    loadQuestion(0);
  });

  // Hint toggle handler
  hintToggle.addEventListener("click", function () {
    hintContainer.style.display =
      hintContainer.style.display === "block" ? "none" : "block";
  });

  // Copy code button handler
  copyCodeBtn.addEventListener("click", function () {
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = codeSnippetElement.textContent;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextArea);

    // Visual feedback for copy
    const originalText = copyCodeBtn.textContent;
    copyCodeBtn.textContent = "CODE COPIED!";
    setTimeout(() => {
      copyCodeBtn.textContent = originalText;
    }, 2000);
  });

  // Skip question button handler
  skipQuestionBtn.addEventListener("click", function () {
    if (skipsRemaining <= 0) {
      alert("No skips remaining!");
      return;
    }

    skipsRemaining--;
    skipCounter.textContent = `Skips remaining: ${skipsRemaining}`;

    userData.answers.push({
      question: currentQuestion + 1,
      selectedOption: -1,
      correct: false,
      timestamp: new Date().toISOString(),
      timeSpent: Math.round((new Date() - startTime) / 1000),
      score: 0,
    });

    if (currentQuestion < questionsByLevel[currentLevel].length - 1) {
      currentQuestion++;
      startTime = new Date();
      loadQuestion(currentQuestion);
      hintContainer.style.display = "none";
      selectedOption = null;
    } else {
      endQuiz();
    }
  });

  // Submit answer button handler
  submitAnswerBtn.addEventListener("click", function () {
    if (selectedOption === null) {
      alert("Please select an answer.");
      return;
    }

    const currentQ = questionsByLevel[currentLevel][currentQuestion];
    const isCorrect = selectedOption === currentQ.correctAnswer;
    const questionScore = isCorrect ? calculateScore(currentQ.difficulty) : 0;

    if (isCorrect) {
      userScore += questionScore;
    }

    userData.answers.push({
      question: currentQuestion + 1,
      selectedOption: selectedOption,
      correct: isCorrect,
      timestamp: new Date().toISOString(),
      timeSpent: Math.round((new Date() - startTime) / 1000),
      score: questionScore,
    });

    // Update leaderboard in real-time
    updateLeaderboard();

    if (currentQuestion < questionsByLevel[currentLevel].length - 1) {
      currentQuestion++;
      startTime = new Date();
      loadQuestion(currentQuestion);
      hintContainer.style.display = "none";
      selectedOption = null;
    } else {
      endQuiz();
    }
  });

  // Restart quiz button handler
  restartQuizBtn.addEventListener("click", function () {
    completedContainer.style.display = "none";
    authContainer.style.display = "block";
    timeLeft = 25 * 60;
    currentQuestion = 0;
    userScore = 0;
    skipsRemaining = 5;
    updateTimerDisplay();
    timerElement.style.color = "var(--neon-pink)";
    timerElement.style.animation = "none";

    // Clear form fields
    document.getElementById("teamName").value = "";
    document.getElementById("teamLevel").value = "100";
    document.getElementById("teamPassword").value = "";

    // Reset UI
    skipCounter.textContent = `Skips remaining: ${skipsRemaining}`;
  });

  // Calculate score based on difficulty
  function calculateScore(difficulty) {
    switch (difficulty) {
      case "Easy":
        return 10;
      case "Medium":
        return 20;
      case "Hard":
        return 30;
      case "Impossible":
        return 50;
      default:
        return 10;
    }
  }

  // Timer function
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

    // Change color when time is running out
    if (timeLeft < 120) {
      timerElement.style.color = "var(--neon-red)";
      timerElement.style.animation = "glitch 0.5s infinite";
    }
  }

  // Load question function
  function loadQuestion(index) {
    const questions = questionsByLevel[currentLevel];
    const question = questions[index];
    codeSnippetElement.textContent = question.code;
    progressElement.textContent = `Challenge ${index + 1} of ${
      questions.length
    }`;

    // Update language badge
    languageBadge.textContent = question.language;
    if (question.language === "Java") {
      languageBadge.className = "language-badge java-badge";
    } else {
      languageBadge.className = "language-badge python-badge";
    }

    // Update difficulty indicator
    difficultyIndicator.textContent = `DIFFICULTY: ${question.difficulty.toUpperCase()}`;
    difficultyIndicator.className = "difficulty-indicator ";

    if (question.difficulty === "Easy") {
      difficultyIndicator.classList.add("difficulty-easy");
    } else if (question.difficulty === "Medium") {
      difficultyIndicator.classList.add("difficulty-medium");
    } else if (question.difficulty === "Hard") {
      difficultyIndicator.classList.add("difficulty-hard");
    } else if (question.difficulty === "Impossible") {
      difficultyIndicator.classList.add("difficulty-impossible");
    }

    // Update hint
    hintContainer.innerHTML = `<strong>Hint:</strong> ${question.hint}`;

    // Clear and update options
    optionsContainer.innerHTML = "";
    question.options.forEach((option, i) => {
      const optionElement = document.createElement("div");
      optionElement.className = "option";
      optionElement.textContent = `${String.fromCharCode(65 + i)}) ${option}`;
      optionElement.addEventListener("click", () => {
        // Remove selected class from all options
        document.querySelectorAll(".option").forEach((opt) => {
          opt.classList.remove("selected");
        });
        // Add selected class to clicked option
        optionElement.classList.add("selected");
        selectedOption = i;
      });
      optionsContainer.appendChild(optionElement);
    });
  }

  // Update leaderboard
  function updateLeaderboard() {
    // Check if team already exists in leaderboard
    const teamIndex = leaderboardData.findIndex(
      (entry) => entry.team === userData.team && entry.level === userData.level
    );

    if (teamIndex !== -1) {
      // Update existing team entry
      leaderboardData[teamIndex].score = userScore;
      leaderboardData[teamIndex].progress = `${currentQuestion + 1}/20`;
    } else {
      // Add new team entry
      leaderboardData.push({
        team: userData.team,
        level: userData.level,
        score: userScore,
        progress: `${currentQuestion + 1}/20`,
      });
    }

    // Sort leaderboard data by score (descending)
    leaderboardData.sort((a, b) => b.score - a.score);

    // Save to local storage
    localStorage.setItem("neocodeLeaderboard", JSON.stringify(leaderboardData));

    // Clear current leaderboard
    leaderboardBody.innerHTML = "";

    // Add rows to leaderboard
    leaderboardData.forEach((entry, index) => {
      const row = document.createElement("tr");

      // Add rank
      const rankCell = document.createElement("td");
      rankCell.textContent = `#${index + 1}`;
      if (index === 0) {
        rankCell.innerHTML = `<i class="fas fa-crown" style="color: var(--neon-yellow);"></i> #1`;
      }
      row.appendChild(rankCell);

      // Add team name
      const teamCell = document.createElement("td");
      teamCell.textContent = entry.team;
      row.appendChild(teamCell);

      // Add level
      const levelCell = document.createElement("td");
      levelCell.textContent = `UG${entry.level[0]} - ${entry.level} Level`;
      row.appendChild(levelCell);

      // Add score
      const scoreCell = document.createElement("td");
      scoreCell.textContent = entry.score;
      scoreCell.style.color = "var(--neon-green)";
      row.appendChild(scoreCell);

      // Add progress
      const progressCell = document.createElement("td");
      progressCell.textContent = entry.progress;
      row.appendChild(progressCell);

      leaderboardBody.appendChild(row);
    });
  }

  // End quiz function
  function endQuiz() {
    clearInterval(timerInterval);

    // Calculate total time
    const endTime = new Date();
    userData.totalTime = Math.round((endTime - startTime) / 1000);
    userData.endTime = endTime.toISOString();
    userData.score = userScore;

    // Update leaderboard with final score
    updateLeaderboard();

    // Update final score
    finalScoreElement.textContent = userScore;

    // Display results
    const answered = userData.answers.filter((a) => a.correct).length;
    resultsElement.innerHTML = `    
                <p>You answered ${answered} out of ${
      questionsByLevel[currentLevel].length
    } questions correctly</p>    
                <p>Total time: ${Math.floor(userData.totalTime / 60)}:${(
      userData.totalTime % 60
    )
      .toString()
      .padStart(2, "0")}</p>    
            `;

    // Show completion screen
    quizContainer.style.display = "none";
    completedContainer.style.display = "block";
  }
});
