// File: /dynamic-game-project/dynamic-game-project/frontend/script.js

document.addEventListener('DOMContentLoaded', () => {
    const qrCodeElement = document.getElementById('qr-code');
    const startButton = document.getElementById('start-game');
    const playerNameInput = document.getElementById('player-name');
    const countrySelect = document.getElementById('country-select');
    const gameArea = document.getElementById('game-area');
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    
    document.getElementById('submitDrawing').addEventListener('click', () => {
        const accuracy = calculateAccuracy(/* playerDrawing */, /* targetShape */);
        const result = accuracy >= 95 ? 'success' : 'failure';
    
        socket.send(JSON.stringify({
            action: 'submit_drawing',
            accuracy: accuracy,
            result: result
        }));
    
        if (result === 'success') {
            alert('Success! Your cookie was produced correctly.');
        } else {
            alert('Failed! Your cookie broke.');
        }
    });

    document.getElementById('autoclicker').addEventListener('click', () => {
        const points = parseInt(document.getElementById('points').value, 10);
        socket.send(JSON.stringify({
            action: 'auction_action',
            name: playerName,
            country: selectedCountry,
            actionType: 'autoclicker',
            points: points
        }));
    });
    
    document.getElementById('stabilizer').addEventListener('click', () => {
        const points = parseInt(document.getElementById('points').value, 10);
        socket.send(JSON.stringify({
            action: 'auction_action',
            name: playerName,
            country: selectedCountry,
            actionType: 'stabilizer',
            points: points
        }));
    });
    
    document.getElementById('sellBrokenCookies').addEventListener('click', () => {
        const points = parseInt(document.getElementById('points').value, 10);
        socket.send(JSON.stringify({
            action: 'auction_action',
            name: playerName,
            country: selectedCountry,
            actionType: 'sell_broken_cookies',
            points: points
        }));
    });

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'auction_update') {
            const auctionResults = document.getElementById('auction-results');
            auctionResults.innerHTML += `
                <p>${data.player} (${data.country}) invested ${data.points} points in ${data.action}.</p>
            `;
        }
        if (data.type === 'round_start') {
            const conditionsArea = document.getElementById('conditions-area');
            conditionsArea.innerHTML = `<h3>Country Conditions:</h3>`;
            Object.keys(data.countries).forEach(country => {
                const details = data.countries[country];
                conditionsArea.innerHTML += `
                    <p>${country}: Consumption = ${details.C}, Government = ${details.G}</p>
                `;
            });
        }
        if (data.type === 'game_end') {
            const gameArea = document.getElementById('game-area');
            gameArea.innerHTML = `<h2>${data.message}</h2>`;
        }
        if (data.type === 'final_results') {
            const finalResultsArea = document.getElementById('final-results');
            finalResultsArea.innerHTML = `<h3>${data.message}</h3>`;
            data.results.forEach(result => {
                finalResultsArea.innerHTML += `
                    <p>${result.country}: GDP = ${result.GDP}</p>
                    <p>Details: Consumption = ${result.details.C}, Investment = ${result.details.I}, Government = ${result.details.G}</p>
                `;
            });
        }
    };
    
    document.getElementById('restart-game').addEventListener('click', () => {
        socket.send(JSON.stringify({ action: 'restart_game' }));
    });

    // Initialize the canvas for drawing
    canvas.addEventListener('mousedown', () => {
        isDrawing = true;
        ctx.beginPath();
    });

    canvas.addEventListener('mousemove', (event) => {
        if (isDrawing) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
    });

    canvas.addEventListener('mouseout', () => {
        isDrawing = false;
    });

    // Generate QR Code for the game link
    const gameLink = 'http://localhost:5000'; // Replace with your backend URL
    QRCode.toCanvas(qrCodeElement, gameLink, function (error) {
        if (error) {
            console.error('Error generating QR Code:', error);
        } else {
            console.log('QR Code generated successfully!');
            qrCodeElement.insertAdjacentHTML('afterend', '<p>Scan the QR Code to join the game!</p>');
        }
    });

    startButton.addEventListener('click', () => {
        const playerName = playerNameInput.value;
        const selectedCountry = countrySelect.value;
    
        if (playerName && selectedCountry) {
            connectToGame(playerName, selectedCountry);
        } else {
            alert('Please enter your name and select a country.');
        }
    });

    function drawRandomShape(ctx) {
        const shapes = ['circle', 'triangle', 'square'];
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
    
        ctx.beginPath();
        if (randomShape === 'circle') {
            ctx.arc(200, 200, 100, 0, Math.PI * 2);
        } else if (randomShape === 'triangle') {
            ctx.moveTo(200, 100);
            ctx.lineTo(300, 300);
            ctx.lineTo(100, 300);
            ctx.closePath();
        } else if (randomShape === 'square') {
            ctx.rect(100, 100, 200, 200);
        }
        ctx.stroke();
    
        return randomShape; // Retorna a forma gerada
    }

    function calculateAccuracy(playerDrawing, targetShape) {
        // Placeholder: Implementar lógica para comparar o desenho do jogador com a forma gerada
        // Exemplo: Comparar pixels ou áreas desenhadas
        const accuracy = Math.random() * 100; // Simulação de precisão
        return accuracy;
    }

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

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            alert('Failed to connect to the game server. Please try again later.');
        };

        socket.onopen = () => {
            socket.send(JSON.stringify({ action: 'join', name: playerName, country: selectedCountry }));
            gameArea.style.display = 'block';
            gameArea.innerHTML = `<h2>Welcome, ${playerName} from ${selectedCountry}!</h2>`;
        };
    }

    function handleGameUpdates(data) {
        if (data.type === 'update_players') {
            const playersList = document.getElementById('players');
            playersList.innerHTML = ''; // Limpa a lista antes de atualizar
            data.players.forEach(player => {
                const playerItem = document.createElement('li');
                playerItem.textContent = `${player.name} (${player.country})`;
                playersList.appendChild(playerItem);
            });
        }
        if (data.type === 'round_results') {
            const resultsArea = document.getElementById('results-area');
            resultsArea.innerHTML = `<h3>Round Results:</h3>`;
            data.results.forEach(result => {
                resultsArea.innerHTML += `<p>${result.name} (${result.country}): ${result.cookiesProduced} cookies</p>`;
            });
        }
        if (data.type === 'round_results') {
            const resultsArea = document.getElementById('results-area');
            resultsArea.innerHTML = `<h3>Round Results:</h3>`;
            data.results.forEach(result => {
                resultsArea.innerHTML += `
                    <p>${result.country}: GDP = ${result.GDP}</p>
                    <p>Details: Consumption = ${result.details.C}, Investment = ${result.details.I}, Government = ${result.details.G}</p>
                `;
            });
        }
        if (data.type === 'round_results') {
            const resultsArea = document.getElementById('results-area');
            resultsArea.innerHTML = `<h3>Round Results:</h3>`;
            data.results.forEach(result => {
                resultsArea.innerHTML += `
                    <p>${result.country}: GDP = ${result.GDP}</p>
                    <p>Details: Consumption = ${result.details.C}, Investment = ${result.details.I}, Government = ${result.details.G}</p>
                    <p>News: ${result.message}</p>
                `;
            });
        }
        if (data.type === 'journal_update') {
            const journalArea = document.getElementById('journal-area');
            const journalMessages = document.getElementById('journal-messages');
            journalMessages.innerHTML = ''; // Limpa as mensagens anteriores
    
            data.messages.forEach(message => {
                const messageItem = document.createElement('li');
                messageItem.textContent = message;
                journalMessages.appendChild(messageItem);
            });
    
            const resultsArea = document.getElementById('results-area');
            resultsArea.innerHTML = `<h3>Yearly Results:</h3>`;
            data.results.forEach(result => {
                resultsArea.innerHTML += `
                    <p>${result.country}: GDP = ${result.GDP}</p>
                    <p>Details: Consumption = ${result.details.C}, Investment = ${result.details.I}, Government = ${result.details.G}</p>
                `;
            });
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
                socket.send(JSON.stringify({ action: 'end_round' })); // Notifica o backend
            } else {
                timerDisplay.innerHTML = `Time left: ${timeLeft} seconds`;
                timeLeft--;
            }
        }, 1000);
    }
});