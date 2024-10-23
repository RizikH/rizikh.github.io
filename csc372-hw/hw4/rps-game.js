document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('start-game').addEventListener('click', handleUsernameInput);
    document.getElementById('google-signin').addEventListener('click', handleGoogleSignIn);
});

// Handle Username Input (Anonymous Auth)
async function handleUsernameInput() {
    const username = getInputValue('#username');
    const popup = document.getElementById('user-login');
    const inputValidity = document.getElementById('input-validity');
    
    if (!validateUsername(username, inputValidity)) return;

    try {
        const userCredential = await firebase.auth().signInAnonymously();
        await handleGameFlow(userCredential, username, popup);
    } catch (error) {
        displayError(inputValidity, "Authentication failed. Please try again.");
    }
}

// Handle Google Sign-In
async function handleGoogleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const inputValidity = document.getElementById('input-validity');
    const popup = document.getElementById('user-login');

    try {
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;
        await handleGameFlow(result, user.displayName, popup);
    } catch (error) {
        displayError(inputValidity, "Google Sign-In failed. Please try again.");
    }
}

// Common Game Flow after Authentication
async function handleGameFlow(userCredential, username, popup) {
    const userId = userCredential.user.uid;
    const inputValidity = document.getElementById('input-validity');

    const isAvailable = await checkUsernameAvailability(username, userId);
    if (!isAvailable) {
        displayError(inputValidity, "Username is already taken. Choose another.");
        return;
    }

    // Initialize the game
    await initializeGame(popup, username, userId);
}

// Check if Username is Available or Already Taken
async function checkUsernameAvailability(username, userId) {
    const usernameRef = firestore.collection('usernames').doc(username);
    const snapshot = await usernameRef.get();

    if (snapshot.exists && snapshot.data().uid !== userId) {
        return false;
    }

    await usernameRef.set({ uid: userId });
    return true;
}

// Initialize Game and Load Game Data
async function initializeGame(popup, username, userId) {
    popup.style.display = 'none';
    window.currentUserId = userId;
    window.currentUsername = username;

    const gameData = await loadGameData(userId);

    updateScoreboard(gameData);
    setUpClickEvents();
}

// Load Game Data from Firestore
async function loadGameData(userId) {
    const gameDataRef = firestore.collection('results').doc(userId);
    const snapshot = await gameDataRef.get();
    return snapshot.exists ? snapshot.data() : { wins: 0, losses: 0, ties: 0 };
}

// Save Game Data to Firestore
async function saveGameData(userWins, computerWins, ties) {
    const userId = window.currentUserId;
    if (!userId) return;

    const gameDataRef = firestore.collection('results').doc(userId);
    await gameDataRef.set({ userWins, computerWins, ties });
}

// Update the UI with the Scoreboard Data
function updateScoreboard(data) {
    document.querySelector('#user-wins').textContent = data.wins;
    document.querySelector('#computer-wins').textContent = data.losses;
    document.querySelector('#ties').textContent = data.ties;
}

// Set Up Event Listeners for Game Choices
function setUpClickEvents() {
    const userChoices = document.querySelectorAll('.user-choices img');
    let isComputerPicking = false;

    userChoices.forEach((choice) => {
        choice.addEventListener('click', () => {
            if (!isComputerPicking) handleUserChoice(choice, isComputerPicking);
        });
    });
}

// Handle User Choice and Simulate Computer's Choice
async function handleUserChoice(choice, isComputerPicking) {
    choice.classList.add('selected');

    isComputerPicking = true;
    await simulateComputerChoice(choice);
    isComputerPicking = false;
}

// Simulate Computer Choice and Determine the Results
async function simulateComputerChoice(userChoice) {
    const choices = ["res/rock.PNG", "res/paper.PNG", "res/scissors.PNG"];
    const computerChoice = document.querySelector('.computer-pick img');
    const resultValue = document.querySelector('#results');

    await animateComputerChoice(computerChoice, choices);

    const computerFinalChoice = choices[Math.floor(Math.random() * choices.length)];
    computerChoice.src = computerFinalChoice;
    computerChoice.parentElement.classList.add('computer-final-pick');

    determineResults(userChoice, computerChoice, resultValue);
}

// Animates Computer's Choice Picking Process
async function animateComputerChoice(computerChoice, choices) {
    return new Promise((resolve) => {
        let index = 0;
        const interval = setInterval(() => {
            computerChoice.src = choices[index];
            index = (index + 1) % choices.length;
        }, 500);

        setTimeout(() => {
            clearInterval(interval);
            resolve();
        }, 3000);
    });
}

// Determine Game Results (Win, Lose, or Tie)
async function determineResults(user, computer, resultValue) {
    const win = document.getElementById('user-wins');
    const lose = document.getElementById('computer-wins');
    const tie = document.getElementById('ties');

    const userChoice = extractChoice(user.src);
    const computerChoice = extractChoice(computer.src);
    const winConditions = { rock: "scissors", paper: "rock", scissors: "paper" };

    let userWins = parseInt(win.textContent);
    let computerWins = parseInt(lose.textContent);
    let ties = parseInt(tie.textContent);

    if (userChoice === computerChoice) {
        resultValue.textContent = "It's a Tie!";
        ties++;
    } else if (winConditions[userChoice] === computerChoice) {
        resultValue.textContent = "You Win!";
        userWins++;
    } else {
        resultValue.textContent = "You Lose!";
        computerWins++;
    }

    // Update the scoreboard and save data
    tie.textContent = ties;
    win.textContent = userWins;
    lose.textContent = computerWins;

    await saveGameData(userWins, computerWins, ties);
}

// Helper function to extract rock/paper/scissors from image src
function extractChoice(src) {
    if (src.includes("rock")) return "rock";
    if (src.includes("paper")) return "paper";
    if (src.includes("scissors")) return "scissors";
}

// Utility: Get Input Value and Display Error if Invalid
function getInputValue(selector) {
    return document.querySelector(selector).value.trim();
}

function displayError(inputValidity, message) {
    inputValidity.textContent = message;
}

function validateUsername(username, inputValidity) {
    if (!username) {
        displayError(inputValidity, "Please enter a valid User Name to start the game.");
        return false;
    }
    return true;
}
