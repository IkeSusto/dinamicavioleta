// File: /dynamic-game-project/dynamic-game-project/frontend/script.js

document.addEventListener('DOMContentLoaded', () => {
    const qrCodeElement = document.getElementById('qr-code');
    const startButton = document.getElementById('start-game');
    const playerNameInput = document.getElementById('player-name');
    const countrySelect = document.getElementById('country-select');
    const gameArea = document.getElementById('game-area');

    startButton.addEventListener('click', () => {
        const playerName = playerNameInput.value;
        const selectedCountry = countrySelect.value;

        if (playerName && selectedCountry) {
            connectToGame(playerName, selectedCountry);
        } else {
            alert('Please enter your name and select a country.');
        }
    });

    function connectToGame(playerName, selectedCountry) {
        // Placeholder for WebSocket connection to the backend
        const socket = new WebSocket('ws://localhost:5000/game');

        socket.onopen = () => {
            socket.send(JSON.stringify({ action: 'join', name: playerName, country: selectedCountry }));
            gameArea.innerHTML = `<h2>Welcome, ${playerName} from ${selectedCountry}!</h2>`;
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleGameUpdates(data);
        };

        socket.onclose = () => {
            console.log('Disconnected from the game.');
        };
    }

    function handleGameUpdates(data) {
        // Handle game updates from the backend
        if (data.type === 'new_round') {
            gameArea.innerHTML += `<p>New round started! You have ${data.time} seconds to produce cookies.</p>`;
            startTimer(data.time);
        }
    }

    function startTimer(seconds) {
        let timeLeft = seconds;
        const timerDisplay = document.createElement('div');
        timerDisplay.id = 'timer';
        gameArea.appendChild(timerDisplay);

        const timerInterval = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerDisplay.innerHTML = 'Time is up!';
                // Notify backend that time is up
            } else {
                timerDisplay.innerHTML = `Time left: ${timeLeft} seconds`;
                timeLeft--;
            }
        }, 1000);
    }
});