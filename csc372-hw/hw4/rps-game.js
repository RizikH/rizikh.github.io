document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('start-game').addEventListener('click', handleUsernameInput);
});

async function handleUsernameInput() {
    const popup = document.getElementById('user-login');
    const username = document.getElementById('username').value.trim();
    const inputValidity = document.getElementById('input-validity');
    const welcomeText = document.querySelector('#welcome');

    if (!username) {
        inputValidity.textContent = "Please enter a valid User Name to start the game.";
        return;
    }

    welcomeText.querySelector('#name').textContent = username;
    welcomeText.style.display = 'block';

    try {
        const userCredential = await firebase.auth().signInAnonymously();
        const userId = userCredential.user.uid;

        const usernameIsAvailable = await checkUsernameAvailability(username, userId);
        if (!usernameIsAvailable) {
            inputValidity.textContent = "Username is already taken. Please choose another name.";
            return;
        }

        await initializeGame(popup, username, userId);
    } catch (error) {
        console.error("Error during authentication or loading game data:", error);
        inputValidity.textContent = "An error occurred. Please try again.";
    }
}

async function checkUsernameAvailability(username, userId) {
    const usernameRef = firestore.collection('usernames').doc(username);
    const snapshot = await usernameRef.get();
    
    if (snapshot.exists && snapshot.data().uid !== userId) {
        return false;
    }

    await usernameRef.set({ uid: userId });
    return true;
}

async function initializeGame(popup, username, userId) {
    popup.style.display = 'none';
    window.currentUserId = userId;
    window.currentUsername = username;

    const gameData = await loadGameData(userId);
    updateGameStats(gameData);

    setUpClickEvents();
}

async function loadGameData(userId) {
    try {
        const gameDataRef = firestore.collection('results').doc(userId);
        const snapshot = await gameDataRef.get();

        if (snapshot.exists) {
            const data = snapshot.data();
            return {
                wins: data.userWins || 0,
                losses: data.computerWins || 0,
                ties: data.ties || 0
            };
        } else {
            return { wins: 0, losses: 0, ties: 0 };
        }
    } catch (error) {
        console.error("Error loading game data:", error);
        return { wins: 0, losses: 0, ties: 0 };
    }
}

function updateGameStats(gameData) {
    document.querySelector('#user-wins').textContent = gameData.wins;
    document.querySelector('#computer-wins').textContent = gameData.losses;
    document.querySelector('#ties').textContent = gameData.ties;
}

function setUpClickEvents() {
    const userChoices = document.querySelectorAll('.user-choices img');
    let currentChoice = null;
    let isComputerPicking = false;

    userChoices.forEach((choice) => {
        choice.addEventListener('click', async () => {
            if (!isComputerPicking) {
                if (currentChoice) {
                    currentChoice.classList.remove('selected');
                }
                choice.classList.add('selected');
                currentChoice = choice;

                isComputerPicking = true;
                await simulateComputerChoice(currentChoice);
                isComputerPicking = false;
            }
        });
    });
}

async function simulateComputerChoice(userChoice) {
    const choices = ["res/rock.PNG", "res/paper.PNG", "res/scissors.PNG"];
    const computerChoice = document.querySelector('.computer-pick img');
    const resultValue = document.querySelector('#results');
    resultValue.textContent = "";

    let index = 0;

    if (computerChoice.parentElement.classList.contains('computer-final-pick')) {
        computerChoice.parentElement.classList.replace('computer-final-pick', 'computer-pick');
    }

    await new Promise((picked) => {
        const shuffleInterval = setInterval(() => {
            computerChoice.src = choices[index];
            index = (index + 1) % choices.length;
        }, 500);

        setTimeout(() => {
            clearInterval(shuffleInterval);
            picked();
        }, 3000);
    });

    computerChoice.src = choices[Math.floor(Math.random() * choices.length)];
    computerChoice.parentElement.classList.add('computer-final-pick');
    
    await determineResults(userChoice, computerChoice, resultValue);
}

async function determineResults(user, computer, resultValue) {
    const win = document.getElementById('user-wins');
    const lose = document.getElementById('computer-wins');
    const tie = document.getElementById('ties');

    const userChoice = extractChoice(user.src);
    const computerChoice = extractChoice(computer.src);

    const winConditions = {
        rock: "scissors",
        paper: "rock",
        scissors: "paper"
    };

    let userWins = parseInt(win.textContent);
    let computerWins = parseInt(lose.textContent);
    let ties = parseInt(tie.textContent);

    if (userChoice === computerChoice) {
        resultValue.textContent = "It's a Tie!";
        tie.textContent = (++ties).toString();
    } else if (winConditions[userChoice] === computerChoice) {
        resultValue.textContent = "You Win!";
        win.textContent = (++userWins).toString();
    } else {
        resultValue.textContent = "You Lose!";
        lose.textContent = (++computerWins).toString();
    }

    await saveGameData(userWins, computerWins, ties);
}

async function saveGameData(userWins, computerWins, ties) {
    const userId = window.currentUserId;
    if (!userId) {
        console.error("No user ID found to save the data.");
        return;
    }

    try {
        const gameDataRef = firestore.collection('results').doc(userId);
        await gameDataRef.set({
            userWins: Number(userWins),
            computerWins: Number(computerWins),
            ties: Number(ties)
        });
    } catch (error) {
        console.error("Error saving game data:", error);
    }
}

function extractChoice(src) {
    if (src.includes("rock")) return "rock";
    if (src.includes("paper")) return "paper";
    return "scissors";
}
