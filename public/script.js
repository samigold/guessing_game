const socket = io();

// DOM Elements
const createGameBtn = document.getElementById('createGameBtn');
const joinGameSection = document.getElementById('joinGameSection');
const joinGameBtn = document.getElementById('joinGameBtn');
const gameIdInput = document.getElementById('gameIdInput');
const gameIdDisplay = document.getElementById('gameIdDisplay');
const playerCount = document.getElementById('playerCount');
const gameInfo = document.getElementById('gameInfo');
const gameArea = document.getElementById('gameArea');
const questionSection = document.getElementById('questionSection');
const questionDisplay = document.getElementById('questionDisplay');
const gameMasterControls = document.getElementById('gameMasterControls');
const playerControls = document.getElementById('playerControls');
const questionInput = document.getElementById('questionInput');
const answerInput = document.getElementById('answerInput');
const startGameBtn = document.getElementById('startGameBtn');
const guessInput = document.getElementById('guessInput');
const submitGuessBtn = document.getElementById('submitGuessBtn');
const attemptsLeft = document.getElementById('attemptsLeft');
const messages = document.getElementById('messages');
const scoreboard = document.getElementById('scoreboard');
const scores = document.getElementById('scores');

// Add new DOM elements
const playerNameInput = document.getElementById('playerNameInput');
const playerSetup = document.getElementById('playerSetup');
const playersContainer = document.getElementById('playersContainer');
const questionInputs = document.getElementById('questionInputs');
const addQuestionBtn = document.getElementById('addQuestionBtn');
const questionNumber = document.getElementById('questionNumber');

let currentGameId = null;
let isGameMaster = false;
let currentQuestionCount = 1;

// Event Listeners
createGameBtn.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
        addMessage('Please enter your name first', 'wrong-answer');
        return;
    }
    socket.emit('createGame', { playerName });
    playerSetup.style.display = 'none';
});

joinGameBtn.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    const gameId = gameIdInput.value.trim();
    if (!playerName) {
        addMessage('Please enter your name first', 'wrong-answer');
        return;
    }
    if (gameId) {
        socket.emit('joinGame', { gameId, playerName });
        playerSetup.style.display = 'none';
    }
});

addQuestionBtn.addEventListener('click', () => {
    const questionGroup = document.createElement('div');
    questionGroup.className = 'question-input-group';
    questionGroup.innerHTML = `
        <input type="text" class="questionInput" placeholder="Enter your question">
        <input type="text" class="answerInput" placeholder="Enter the answer">
    `;
    questionInputs.appendChild(questionGroup);
});

startGameBtn.addEventListener('click', () => {
    const questions = [];
    const questionGroups = document.querySelectorAll('.question-input-group');
    
    questionGroups.forEach(group => {
        const question = group.querySelector('.questionInput').value.trim();
        const answer = group.querySelector('.answerInput').value.trim();
        if (question && answer) {
            questions.push({ question, answer });
        }
    });

    if (questions.length === 0) {
        addMessage('Please add at least one question and answer', 'wrong-answer');
        return;
    }

    socket.emit('addQuestions', { gameId: currentGameId, questions });
    socket.emit('startGame', { gameId: currentGameId });
});

submitGuessBtn.addEventListener('click', () => {
    const guess = guessInput.value.trim();
    if (guess) {
        socket.emit('makeGuess', { gameId: currentGameId, guess });
        addMessage('You guessed: ' + guess, 'player-message');
        guessInput.value = '';
    }
});

// Socket event handlers
socket.on('gameCreated', ({ gameId, isMaster }) => {
    currentGameId = gameId;
    isGameMaster = isMaster;
    gameIdDisplay.textContent = gameId;
    gameInfo.style.display = 'block';
    gameArea.style.display = 'block';
    questionSection.style.display = 'block';
    if (isMaster) {
        gameMasterControls.style.display = 'block';
        addMessage('Game created! Share this Game ID with other players: ' + gameId, 'system-message');
        addMessage('Add your questions and wait for at least 2 more players to join.', 'system-message');
        startGameBtn.disabled = true;
    }
});

socket.on('gameJoined', ({ gameId, isMaster }) => {
    currentGameId = gameId;
    isGameMaster = isMaster;
    gameIdDisplay.textContent = gameId;
    gameInfo.style.display = 'block';
    gameArea.style.display = 'block';
    questionSection.style.display = 'block';
    addMessage('You joined the game!', 'system-message');
    addMessage('Waiting for the game to start...', 'system-message');
});

socket.on('updatePlayers', (players) => {
    updatePlayersList(players);
    if (isGameMaster && players.length > 2) {
        startGameBtn.disabled = false;
    }
});

socket.on('questionsAdded', ({ count }) => {
    addMessage(`${count} questions added successfully`, 'system-message');
});

socket.on('wrongGuess', ({ remainingAttempts, message }) => {
    addMessage(message, 'wrong-answer');
    attemptsLeft.textContent = remainingAttempts;
    if (remainingAttempts === 0) {
        submitGuessBtn.disabled = true;
        guessInput.disabled = true;
    }
});

socket.on('playerGuessed', ({ playerName, remainingAttempts }) => {
    addMessage(`${playerName} made a wrong guess (${remainingAttempts} attempts left)`, 'system-message');
});

socket.on('gameStarted', ({ question }) => {
    questionDisplay.textContent = question;
    questionNumber.textContent = `${currentQuestionCount}`;
    
    if (!isGameMaster) {
        playerControls.style.display = 'block';
        gameMasterControls.style.display = 'none';
        submitGuessBtn.disabled = false;
        guessInput.disabled = false;
        guessInput.value = '';
        attemptsLeft.textContent = '3';
        addMessage('Game started! Try to guess the answer.', 'system-message');
    } else {
        gameMasterControls.style.display = 'none';
        playerControls.style.display = 'none';
        addMessage('Your question has been sent to the players!', 'system-message');
    }
});

socket.on('timerUpdate', ({ timeLeft }) => {
    const timeLeftElement = document.getElementById('timeLeft');
    timeLeftElement.textContent = timeLeft;
    if (timeLeft <= 10) {
        timeLeftElement.style.color = '#dc3545';
    }
});

socket.on('roundEnded', ({ winner, answer, scores }) => {
    // Show the result message
    const winMessage = winner.id === socket.id ? 
        'You won this round!' : 
        `${winner.name} won this round!`;
    addMessage(winMessage + ` The answer was: ${answer}`, 'correct-answer');
    
    currentQuestionCount++;
    updatePlayersList(scores);

    // Disable controls during intermission
    guessInput.disabled = true;
    submitGuessBtn.disabled = true;
});

socket.on('gameEnded', ({ winner, finalScores, newMaster }) => {
    const winnerAnnouncement = document.createElement('div');
    winnerAnnouncement.className = 'winner-announcement';
    winnerAnnouncement.textContent = `🏆 ${winner.name} wins the game with ${winner.score} points! 🏆`;
    messages.appendChild(winnerAnnouncement);
    
    updatePlayersList(finalScores);
    playerControls.style.display = 'none';
    gameMasterControls.style.display = 'none';
    isGameMaster = socket.id === newMaster;
    
    if (isGameMaster) {
        setTimeout(() => {
            gameMasterControls.style.display = 'block';
            questionInputs.innerHTML = `
                <div class="question-input-group">
                    <input type="text" class="questionInput" placeholder="Enter your question">
                    <input type="text" class="answerInput" placeholder="Enter the answer">
                </div>
            `;
            currentQuestionCount = 1;
            addMessage('You won! You are now the game master. Create new questions!', 'system-message');
        }, 3000);
    } else {
        addMessage(`${winner.name} is now the game master!`, 'system-message');
    }
});

socket.on('newGameMaster', ({ masterId, masterName }) => {
    isGameMaster = socket.id === masterId;
    
    if (isGameMaster) {
        gameMasterControls.style.display = 'block';
        playerControls.style.display = 'none';
        questionInputs.innerHTML = `
            <div class="question-input-group">
                <input type="text" class="questionInput" placeholder="Enter your question">
                <input type="text" class="answerInput" placeholder="Enter the answer">
            </div>
        `;
        currentQuestionCount = 1;
        addMessage('You are now the game master. Create new questions!', 'system-message');
    } else {
        playerControls.style.display = 'none';
        gameMasterControls.style.display = 'none';
        addMessage(`${masterName} is now the game master`, 'system-message');
    }
});

socket.on('playerLeft', ({ name }) => {
    addMessage(`${name} has left the game`, 'system-message');
});

socket.on('error', (message) => {
    addMessage(message, 'wrong-answer');
});

// Helper functions
function addMessage(text, className) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${className}`;
    messageDiv.textContent = text;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

function updatePlayersList(players) {
    // Update players list
    playersContainer.innerHTML = '';
    scores.innerHTML = ''; // Clear scoreboard

    // Sort players by score in descending order
    const sortedPlayers = players.sort((a, b) => b.score - a.score);

    sortedPlayers.forEach(player => {
        // Update players list
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-item';
        playerDiv.innerHTML = `
            <span class="player-name">
                ${player.name}
                ${player.isMaster ? '<span class="game-master-badge">Game Master</span>' : ''}
            </span>
            <span class="player-score">${player.score} points</span>
        `;
        playersContainer.appendChild(playerDiv);

        // Update scoreboard
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'score-item';
        scoreDiv.innerHTML = `
            <span class="player-name">
                ${player.name}
                ${player.isMaster ? '👑' : ''}
            </span>
            <span class="player-score">${player.score} points</span>
        `;
        scores.appendChild(scoreDiv);
    });

    // Make scoreboard visible
    scoreboard.style.display = 'block';
}