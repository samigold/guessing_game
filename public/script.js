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
const copyGameIdBtn = document.getElementById('copyGameId');
const shareGameLinkBtn = document.getElementById('shareGameLink');

let currentGameId = null;
let isGameMaster = false;
let currentQuestionCount = 1;

// Background Animation Setup
function createFloatingElements() {
    const animatedBackground = document.getElementById('animatedBackground');
    const elementCount = window.innerWidth < 768 ? 15 : 30; // Fewer elements on mobile
    const shapes = ['⭐', '❓', '💭', '🎮', '🎯', '💡', '🎲', '✨', '❔', '🧩', '💬'];
    
    // Clear existing elements
    animatedBackground.innerHTML = '';
    
    // Generate question marks and shapes with different animations
    for (let i = 0; i < elementCount; i++) {
        // Random properties
        const isShape = Math.random() > 0.5;
        const size = Math.random() * 25 + 15; // 15-40px
        const leftPos = Math.random() * 100; // 0-100%
        const delay = Math.random() * 10; // 0-10s delay
        const duration = Math.random() * 10 + 15; // 15-25s animation duration
        
        // Create element
        const element = document.createElement('div');
        
        if (isShape) {
            // Create shape element (emoji or geometric shape)
            element.className = 'shape';
            
            if (Math.random() > 0.5) {
                // Use emoji
                element.textContent = shapes[Math.floor(Math.random() * shapes.length)];
                element.style.fontSize = `${size}px`;
            } else {
                // Create geometric shape
                const shapeType = Math.floor(Math.random() * 3);
                element.style.width = `${size}px`;
                element.style.height = `${size}px`;
                
                // Random color from our theme
                const colors = [
                    'var(--primary-color)', 
                    'var(--success-color)', 
                    'var(--warning-color)'
                ];
                const color = colors[Math.floor(Math.random() * colors.length)];
                element.style.backgroundColor = color;
                element.style.opacity = '0.2';
                
                // Apply different shapes
                if (shapeType === 0) {
                    element.style.borderRadius = '50%'; // Circle
                } else if (shapeType === 1) {
                    element.style.transform = 'rotate(45deg)'; // Diamond
                }
                // Default is square
            }
            
            // Apply different animation
            if (Math.random() > 0.5) {
                element.style.animation = `floatSideways ${duration}s linear ${delay}s infinite`;
            } else {
                element.style.animation = `float ${duration}s linear ${delay}s infinite`;
            }
        } else {
            // Create question mark
            element.className = 'question-mark';
            element.textContent = '?';
            element.style.fontSize = `${size}px`;
            element.style.opacity = '0.2';
            element.style.color = `var(--question-mark-color-${Math.ceil(Math.random() * 3)})`;
            element.style.animation = `float ${duration}s linear ${delay}s infinite`;
            
            // Add secondary animation
            const secondaryAnimation = Math.floor(Math.random() * 3);
            if (secondaryAnimation === 0) {
                element.style.animation += `, wobble ${Math.random() * 2 + 3}s ease-in-out infinite`;
            } else if (secondaryAnimation === 1) {
                element.style.animation += `, pulse ${Math.random() * 2 + 2}s ease-in-out infinite`;
            } else {
                element.style.animation += `, spin ${Math.random() * 5 + 5}s linear infinite`;
            }
        }
        
        // Set position
        element.style.left = `${leftPos}%`;
        // Add some randomness to the bottom position to create staggering
        element.style.bottom = `${Math.random() * 30 - 50}px`; 
        
        // Add to the background
        animatedBackground.appendChild(element);
    }
    
    // Add interactive elements that follow cursor with parallax effect
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        const elements = document.querySelectorAll('.shape, .question-mark');
        elements.forEach((el, index) => {
            // Only affect some elements for performance
            if (index % 3 === 0) {
                const moveFactor = (index % 5) * 0.01;
                const translateX = (mouseX - 0.5) * 20 * moveFactor;
                const translateY = (mouseY - 0.5) * 20 * moveFactor;
                
                el.style.transform = `translate(${translateX}px, ${translateY}px)`;
            }
        });
    });
}

// Initialize animations when window loads or resizes
window.addEventListener('load', createFloatingElements);
window.addEventListener('resize', createFloatingElements);

// Event Listeners
createGameBtn.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
        addMessage('Please enter your name first', 'wrong-answer');
        return;
    }
    socket.emit('createGame', { playerName });
    playerSetup.classList.add('hide');
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
        playerSetup.classList.add('hide');
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

// Event Listeners for copying and sharing
copyGameIdBtn.addEventListener('click', copyGameId);
shareGameLinkBtn.addEventListener('click', shareGameLink);
gameIdDisplay.addEventListener('click', copyGameId);

// Check for game ID in URL when page loads
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('game');
    if (gameId) {
        gameIdInput.value = gameId;
    }
});

// Copy and Share functions
function copyGameId() {
    if (!currentGameId) return;
    
    navigator.clipboard.writeText(currentGameId).then(() => {
        showCopyFeedback('Game ID copied!');
    }).catch(() => {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = currentGameId;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showCopyFeedback('Game ID copied!');
        } catch (err) {
            showCopyFeedback('Failed to copy');
        }
        document.body.removeChild(textArea);
    });
}

function shareGameLink() {
    if (!currentGameId) return;
    
    const gameUrl = `${window.location.origin}?game=${currentGameId}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Join my Guessing Game!',
            text: 'Click to join my game session!',
            url: gameUrl
        }).catch(() => {
            copyToClipboard(gameUrl);
        });
    } else {
        copyToClipboard(gameUrl);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback('Game link copied!');
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showCopyFeedback('Game link copied!');
        } catch (err) {
            showCopyFeedback('Failed to copy');
        }
        document.body.removeChild(textArea);
    });
}

function showCopyFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'copy-feedback';
    feedback.textContent = message;
    document.body.appendChild(feedback);
    
    // Remove the feedback after animation completes
    setTimeout(() => {
        feedback.remove();
    }, 2000);
}

// Socket event handlers
socket.on('gameCreated', ({ gameId, isMaster }) => {
    currentGameId = gameId;
    isGameMaster = isMaster;
    gameIdDisplay.textContent = gameId;
    gameInfo.classList.remove('hide');
    gameArea.classList.remove('hide');
    questionSection.classList.remove('hide');
    messages.classList.remove('hide'); // Show messages when game is created
    scoreboard.classList.remove('hide'); // Show scoreboard when game is created
    if (isMaster) {
        gameMasterControls.classList.remove('hide');
        addMessage('Game created! Share this Game ID with other players: ' + gameId, 'system-message');
        addMessage('Add your questions and wait for at least 2 more players to join.', 'system-message');
        startGameBtn.disabled = true;
    }
});

socket.on('gameJoined', ({ gameId, isMaster }) => {
    currentGameId = gameId;
    isGameMaster = isMaster;
    gameIdDisplay.textContent = gameId;
    gameInfo.classList.remove('hide');
    gameArea.classList.remove('hide');
    questionSection.classList.remove('hide');
    messages.classList.remove('hide'); // Show messages when joining game
    scoreboard.classList.remove('hide'); // Show scoreboard when joining game
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
        playerControls.classList.remove('hide');
        gameMasterControls.classList.add('hide');
        submitGuessBtn.disabled = false;
        guessInput.disabled = false;
        guessInput.value = '';
        attemptsLeft.textContent = '3';
        addMessage('Game started! Try to guess the answer.', 'system-message');
    } else {
        gameMasterControls.classList.add('hide');
        playerControls.classList.add('hide');
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
    // Create and show the popup
    const popup = document.createElement('div');
    popup.className = 'win-popup';
    popup.textContent = winner.id === socket.id ? 
        '🎉 You won this round!' : 
        `🎉 ${winner.name} won this round!`;
    document.body.appendChild(popup);

    // Remove popup after animation
    setTimeout(() => {
        popup.remove();
    }, 5000);
    
    // Add to message history
    addMessage(`${winner.name} won this round! The answer was: ${answer}`, 'correct-answer');
    
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
    playerControls.classList.add('hide');
    gameMasterControls.classList.add('hide');
    isGameMaster = socket.id === newMaster;
    
    if (isGameMaster) {
        setTimeout(() => {
            gameMasterControls.classList.remove('hide');
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
        gameMasterControls.classList.remove('hide');
        playerControls.classList.add('hide');
        questionInputs.innerHTML = `
            <div class="question-input-group">
                <input type="text" class="questionInput" placeholder="Enter your question">
                <input type="text" class="answerInput" placeholder="Enter the answer">
            </div>
        `;
        currentQuestionCount = 1;
        addMessage('You are now the game master. Create new questions!', 'system-message');
    } else {
        playerControls.classList.add('hide');
        gameMasterControls.classList.add('hide');
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

    // Show scoreboard using CSS class
    scoreboard.classList.remove('hide');
}