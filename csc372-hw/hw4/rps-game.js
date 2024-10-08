document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('start-game').addEventListener('click', handleUsernameInput);
});

async function handleUsernameInput() {
    const popup = document.getElementById('user-login');
    const username = document.getElementById('username').value.trim();
    const inputValidity = document.getElementById('input-validity');
    const welcomeText = document.querySelector('#welcome #name'); // Optimized DOM selection

    if (!username) {
        inputValidity.textContent = "Please enter a valid User Name to start the game.";
        return;
    }

    welcomeText.textContent = username;
    welcomeText.closest('#welcome').style.display = 'block'; // Use closest to update welcome text's parent display

    try {
        const userCredential = await firebase.auth().signInAnonymously();
        const userId = userCredential.user.uid;
        
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

    document.querySelector('#user-wins').textContent = gameData.wins;
    document.querySelector('#computer-wins').textContent = gameData.losses;
    document.querySelector('#ties').textContent = gameData.ties;

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

        console.log(`Game data saved for user ${userId}: Wins: ${userWins}, Losses: ${computerWins}, Ties: ${ties}`);
    } catch (error) {
        console.error("Error saving game data:", error);
    }
}

function setUpClickEvents() {
    const userChoices = document.querySelectorAll('.user-choices img');
    let currentChoice = null;
    let isComputerPicking = false;

    userChoices.forEach(choice => {
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
    let resultValue = document.querySelector('#results');

    let index = 0;
    resultValue.textContent = "";

    // Reset computer's selection style before starting the shuffle
    computerChoice.parentElement.classList.replace('computer-final-pick', 'computer-pick');

    await shuffleComputerChoice(computerChoice, choices, 3000);

    computerChoice.src = choices[Math.floor(Math.random() * choices.length)];
    computerChoice.parentElement.classList.add('computer-final-pick');
    await determineResults(userChoice, computerChoice, resultValue);
}

async function shuffleComputerChoice(computerChoice, choices, duration) {
    let index = 0;
    return new Promise(resolve => {
        const intervalId = setInterval(() => {
            computerChoice.src = choices[index];
            index = (index + 1) % choices.length;
        }, 500);

        setTimeout(() => {
            clearInterval(intervalId);
            resolve();
        }, duration);
    });
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
        ties++;
        tie.textContent = ties.toString();
    } else if (winConditions[userChoice] === computerChoice) {
        resultValue.textContent = "You Win!";
        userWins++;
        win.textContent = userWins.toString();
    } else {
        resultValue.textContent = "You Lose!";
        computerWins++;
        lose.textContent = computerWins.toString();
    }

    await saveGameData(userWins, computerWins, ties);
}

function extractChoice(src) {
    if (src.includes("rock")) return "rock";
    if (src.includes("paper")) return "paper";
    return "scissors";
}