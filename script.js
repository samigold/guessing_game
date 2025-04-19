// ...existing code...

// Socket event handlers
// ...existing event handlers...

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
        attemptsLeft.textContent = '3';
        addMessage('Game started! Try to guess the answer.', 'system-message');
    } else {
        gameMasterControls.style.display = 'none';
    }
});

// ...rest of the code...