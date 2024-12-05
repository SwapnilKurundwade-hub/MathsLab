document.addEventListener("DOMContentLoaded", () => {
    const setupDiv = document.getElementById("setup");
    const gameAreaDiv = document.getElementById("gameArea");
    const resultsDiv = document.getElementById("results");
    const startButton = document.getElementById("startGame");
    const nextButton = document.getElementById("next");
    const playerName = document.getElementById("playerName");
    const questionElement = document.getElementById("question");
    const answerInput = document.getElementById("answer");
    const timerElement = document.getElementById("timer");
    const scoreElement = document.getElementById("score");
    const reviewTableBody = document.getElementById("review");
    const resultUserName = document.getElementById("resultUserName");

    let questions = [];
    let currentQuestionIndex = 0;
    let correctAnswers = 0;
    let timer;
    let history = [];
    let askedQuestions = new Set();

    startButton.addEventListener("click", startGame);

    function startGame() {
        const userName = document.getElementById("userName").value;
        const categories = Array.from(
            document.getElementById("categories").selectedOptions
        ).map(option => option.value);
        const difficulty = document.getElementById("difficulty").value;
        const numQuestions = parseInt(document.getElementById("numQuestions").value, 10);
        const timePerQuestion = parseInt(document.getElementById("timePerQuestion").value, 10);

        if (!userName || !categories.length || !numQuestions || !timePerQuestion) {
            alert("Please fill all the fields!");
            return;
        }

        playerName.textContent = `Player: ${userName}`;
        resultUserName.textContent = userName;

        questions = shuffle(generateQuestions(categories, difficulty, numQuestions));
        currentQuestionIndex = 0;
        correctAnswers = 0;
        history = [];
        askedQuestions.clear();

        setupDiv.style.display = "none";
        gameAreaDiv.style.display = "block";

        showQuestion(questions[currentQuestionIndex], timePerQuestion);
    }

    function generateQuestions(categories, difficulty, numQuestions) {
        const questions = [];
        const maxRange = difficulty === "easy" ? 20 : difficulty === "medium" ? 100 : 1000;

        while (questions.length < numQuestions) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            let question, answer;

            switch (category) {
                case "addition":
                    const add1 = randomNumber(maxRange);
                    const add2 = randomNumber(maxRange);
                    question = `${add1} + ${add2}`;
                    answer = add1 + add2;
                    break;

                case "subtraction":
                    const sub1 = randomNumber(maxRange);
                    const sub2 = randomNumber(maxRange);
                    question = `${Math.max(sub1, sub2)} - ${Math.min(sub1, sub2)}`;
                    answer = Math.max(sub1, sub2) - Math.min(sub1, sub2);
                    break;

                case "multiplication":
                    const mul1 = randomNumber(Math.sqrt(maxRange));
                    const mul2 = randomNumber(Math.sqrt(maxRange));
                    question = `${mul1} × ${mul2}`;
                    answer = mul1 * mul2;
                    break;

                case "division":
                    const div1 = randomNumber(maxRange);
                    const div2 = randomNumber(maxRange - 1) + 1;
                    question = `${div1 * div2} ÷ ${div2}`;
                    answer = div1;
                    break;

                case "squares":
                    const squareNum = randomNumber(Math.sqrt(maxRange));
                    question = `Square of ${squareNum}`;
                    answer = squareNum ** 2;
                    break;

                case "series":
                    const startNum = randomNumber(maxRange);
                    const diff = randomNumber(10) + 1;
                    const series = Array.from({ length: 5 }, (_, i) => startNum + i * diff);
                    const missingIndex = randomNumber(5);
                    answer = series[missingIndex];
                    series[missingIndex] = "...";
                    question = `Complete the series: ${series.join(", ")}`;
                    break;

                case "ascending":
                    const ascNums = Array.from({ length: 5 }, () => randomNumber(maxRange));
                    ascNums.sort(() => Math.random() - 0.5);
                    question = `Sort in ascending order: ${ascNums.join(", ")}`;
                    answer = ascNums.sort((a, b) => a - b).join(", ");
                    break;

                case "descending":
                    const descNums = Array.from({ length: 5 }, () => randomNumber(maxRange));
                    descNums.sort(() => Math.random() - 0.5);
                    question = `Sort in descending order: ${descNums.join(", ")}`;
                    answer = descNums.sort((a, b) => b - a).join(", ");
                    break;
            }

            questions.push({ question, answer });
        }

        return questions;
    }

    function showQuestion(questionObj, time) {
        if (askedQuestions.has(questionObj.question)) {
            nextQuestion();
            return;
        }

        askedQuestions.add(questionObj.question);

        questionElement.textContent = questionObj.question;
        answerInput.value = "";
        answerInput.focus();

        let timeLeft = time;
        timerElement.textContent = `Time: ${timeLeft}s`;

        if (timer) clearInterval(timer);

        timer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = `Time: ${timeLeft}s`;

            if (timeLeft <= 0) {
                clearInterval(timer);
                recordAnswer(answerInput.value.trim() !== "", answerInput.value.trim());
                nextQuestion();
            }
        }, 1000);
    }

    function nextQuestion() {
        clearInterval(timer);

        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            showQuestion(questions[currentQuestionIndex], parseInt(document.getElementById("timePerQuestion").value, 10));
        } else {
            endGame();
        }
    }

    function recordAnswer(isAnswered, userInput = "") {
        if (currentQuestionIndex >= history.length) {
            const currentQuestion = questions[currentQuestionIndex];
            const userAnswer = isAnswered ? userInput : "Unanswered";
            const correct = parseFloat(userAnswer) === parseFloat(currentQuestion.answer);

            if (correct) correctAnswers++;

            history.push({
                question: currentQuestion.question,
                correctAnswer: currentQuestion.answer,
                userAnswer
            });
        }
    }

    function endGame() {
        gameAreaDiv.style.display = "none";
        resultsDiv.style.display = "block";

        scoreElement.textContent = `Score: ${correctAnswers}/${questions.length} (${((correctAnswers / questions.length) * 100).toFixed(2)}%)`;

        reviewTableBody.innerHTML = "";

        history.forEach(({ question, correctAnswer, userAnswer }) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${question}</td>
                <td>${correctAnswer}</td>
                <td>${userAnswer}</td>
            `;
            reviewTableBody.appendChild(row);
        });
    }

    function randomNumber(max) {
        return Math.floor(Math.random() * max) + 1;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});
