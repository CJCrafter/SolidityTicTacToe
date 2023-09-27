let ticTacToeContract; // Declare it here at a higher scope.

function logToConsole(message) {
    console.log(message);
    const consoleDiv = document.getElementById('console');
    const p = document.createElement('p');
    p.textContent = message;
    consoleDiv.appendChild(p);
    consoleDiv.scrollTop = consoleDiv.scrollHeight; // Auto-scroll to the latest log
}

let gameComplete = false;

// Connect to Ethereum
if (typeof window.ethereum !== 'undefined') {
    const provider = new Web3.providers.WebsocketProvider("ws://localhost:9545");
    const web3 = new Web3(provider);

    fetch('./build/contracts/TicTacToe.json')
        .then(response => response.json())
        .then(contractJson => {
            const contractAddress = contractJson.networks[Object.keys(contractJson.networks)[0]].address;
            ticTacToeContract = new web3.eth.Contract(contractJson.abi, contractAddress);  // Assign to it here.

            // Start listening for events
            ticTacToeContract.events.OnWin().on('data', function(event) {
                let winningPlayer = event.returnValues.player;
                let player = winningPlayer === '1' ? "Player X" : "Player O";
                gameComplete = true;
                document.getElementById("whoseTurn").textContent = `${player} won!`;
                logToConsole("The winning player is: " + winningPlayer);  // Fixed string concatenation here
            }).on('error', console.error);

            // Check whose turn it is
            updateWhoseTurn();
        });

    window.play = function(x, y) {
        if (gameComplete) {
            window.reset();
            return;
        }

        web3.eth.getAccounts().then(accounts => {
            const userAddress = accounts[0];
            ticTacToeContract.methods.play(x, y).send({from: userAddress})
                .on('receipt', function(receipt) {
                    console.log('Move made!', receipt);
                    updateWhoseTurn();
                    let button = document.getElementById(`button_${x}_${y}`);
                    logToConsole(`Called x=${x} y=${y}`);
                    ticTacToeContract.methods.board(y, x).call()
                        .then(result => {
                            logToConsole(`^Button should now be: ${result}`);
                            if (result === '1') {
                                button.innerText = "X";
                            } else if (result === '2') {
                                button.innerText = "O";
                            }
                        })
                        .catch(err => {
                            logToConsole("Error fetching board cell value:", err);
                        });
                }).on('error', function(error) {
                logToConsole('Error making move:', error);
            });
        });
    };

    window.reset = function() {
        gameComplete = false;
        web3.eth.getAccounts().then(accounts => {
            const userAddress = accounts[0];
            ticTacToeContract.methods.reset().send({from: userAddress});
        });

        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                document.getElementById("button_" + x + "_" + y).innerText = "";
            }
        }
    };

    function updateWhoseTurn() {
        ticTacToeContract.methods.whoseTurn().call()
            .then(result => {
                document.getElementById("whoseTurn").textContent = result === '1' ? "Player X" : "Player O";
            });
    }

} else {
    alert("Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!");
}
