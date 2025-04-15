import { MultiplayerGame } from "./MultiplayerGame";
import { apollosLocalMessage, getCurrentUserId } from "./utils";

const SIDE_INDEXES = {
    top: 0,
    bottom: 1,
    left: 2,
    right: 3
};

// Interface to define the structure of data for each square
interface SquareData {
    sides: [number, number, number, number]; // top, bottom, left, right (0: empty, 1: p1, 2: p2)
    owner: number; // 0: none, 1: p1, 2: p2
}

export class CaptureBoard extends MultiplayerGame {

    protected rows: number = 5;
    protected cols: number = 5;
    protected player1Id: string | number | null = null;
    protected player2Id: string | number | null = null;
    private squareArrays: Array<SquareData>; // Store state for each square
    private gameOver: boolean = false;
    private player1Score: number = 0;
    private player2Score: number = 0;
    private data: any; // Store server data for turn logic

    constructor(app: HTMLElement, board: HTMLElement, data: HTMLElement) {
        super(app, board, data);
        this.data = data; // Store the initial data element

        // Initialize square data structure
        this.squareArrays = new Array(this.rows * this.cols).fill(null).map(() => ({
            sides: [0, 0, 0, 0], // Initialize all sides as not captured
            owner: 0 // Initialize owner as none
        }));

        // --- Load initial state from context data ---
        if (this.contextData?.dataset.squareArrays) {
            try {
                const loadedArrays = JSON.parse(this.contextData.dataset.squareArrays);
                // Basic validation
                if (Array.isArray(loadedArrays) && loadedArrays.length === this.rows * this.cols &&
                    loadedArrays.every((sq: any) => sq && Array.isArray(sq.sides) && sq.sides.length === 4 && typeof sq.owner === 'number')) {
                    this.squareArrays = loadedArrays;
                } else {
                    console.error("Invalid squareArrays data loaded from context.");
                    apollosLocalMessage("Failed to load board state correctly.", "error");
                }
            } catch (e) {
                console.error("Failed to parse squareArrays data:", e);
                apollosLocalMessage("Failed to parse board state.", "error");
            }
        }
        this.player1Score = parseInt(this.contextData?.dataset.player1Score || '0', 10);
        this.player2Score = parseInt(this.contextData?.dataset.player2Score || '0', 10);
        this.gameOver = this.contextData?.dataset.gameOver === 'true';
        // Ensure round is initialized from context if available, else default from MultiplayerGame
        if (this.contextData?.dataset.round) {
             this.round = parseInt(this.contextData.dataset.round, 10);
        }
        this.currentRound.textContent = `Round: ${this.round}`;

        // Initialize player IDs from context data
        if (this.contextData?.dataset.player1Id) {
            this.player1Id = this.contextData.dataset.player1Id;
        }
        if (this.contextData?.dataset.player2Id) {
            this.player2Id = this.contextData.dataset.player2Id;
        }

        this.boardArea.innerHTML = ''; // Clear existing board content
        this.boardArea.classList.add('capture-board-area'); // Add specific styling class

        // --- Build the visual board (dots and clickable lines) ---
        // Use CSS Grid for layout if possible, otherwise adjust calculation
        // Assuming boardArea has a defined size for this calculation
        let boardWidth = this.boardArea.clientWidth || 400; // Provide a fallback width
        let spacing = boardWidth / (this.cols * 2); // Example spacing based on width

        for (let j = 0; j <= this.rows; j++) {
            let dotRow = document.createElement('div');
            dotRow.classList.add('capture-row');
            for (let i = 0; i <= this.cols; i++) {
                let dot = document.createElement('div');
                dot.classList.add('capture-dot');
                dotRow.append(dot);

                // Add horizontal line area between dots
                if (i < this.cols) {
                    let hSpace = document.createElement('div');
                    hSpace.classList.add('capture-h-space');
                    // Size might be better controlled by CSS Grid/Flexbox gaps
                    // hSpace.style.width = `${spacing}px`;
                    hSpace.dataset.rowIndex = `${j}`;
                    hSpace.dataset.colIndex = `${i}`;
                    hSpace.dataset.type = 'horizontal';
                    dotRow.append(hSpace);
                }
            }
            this.boardArea.append(dotRow);

            // Add vertical line areas and square placeholders in between dot rows
            if (j < this.rows) {
                let verticalRow = document.createElement('div');
                verticalRow.classList.add('capture-row');
                for (let i = 0; i <= this.cols; i++) {
                    let vSpace = document.createElement('div');
                    vSpace.classList.add('capture-v-space');
                    // vSpace.style.height = `${spacing}px`;
                    vSpace.dataset.rowIndex = `${j}`;
                    vSpace.dataset.colIndex = `${i}`;
                    vSpace.dataset.type = 'vertical';
                    verticalRow.append(vSpace);

                    // The actual square area (for background/ownership visuals)
                    if (i < this.cols) {
                        let squareArea = document.createElement('div');
                        squareArea.classList.add('capture-square-area');
                        // Size controlled by CSS
                        squareArea.id = `square${j * this.cols + i}`;
                        verticalRow.append(squareArea);
                    } else {
                        // Add a spacer to align the last vertical line if using flexbox/inline-block
                        let spacer = document.createElement('div');
                         spacer.classList.add('capture-dot'); // Use dot's style for spacing
                         spacer.style.visibility = 'hidden'; // Make it invisible
                         verticalRow.append(spacer);
                    }
                }
                this.boardArea.append(verticalRow);
            }
        }

        this.updateScores();
        this.drawBoardState(); // Draw initial lines and ownership based on loaded state
        if (!this.gameOver) {
            this.setUpLineEventListeners();
            this.updateTurnIndicator(this.data); // Set initial turn indicator using initial data
        } else {
            this.handleGameOverUI(this.contextData?.dataset.winner); // Apply game over styling if loaded in that state
        }

        // Multiplayer restart is handled by server/lobby actions, not a simple button click
        // this.restartButton.addEventListener('click', () => { ... });
    }

    // Add click listeners to the line elements
    private setUpLineEventListeners(): void {
        const lines = this.boardArea.querySelectorAll('.capture-h-space, .capture-v-space');
        lines.forEach(line => {
            // Use a named function for easier removal if needed (though replacing node is safer)
            const listener = (event: Event) => this.handleLineClick(event);
            line.addEventListener('click', listener);
            // Store listener ref if needed for specific removal later
            // (line as any)._captureClickListener = listener;
        });
        console.log("Capture board listeners added.");
    }

    // Handle clicks on lines
    private handleLineClick(event: Event): void {
        if (this.gameOver || this.app.classList.contains('turn-disable')) {
             console.log("Click ignored: Game over or not player's turn.");
            return; // Ignore clicks if game over or not player's turn
        }

        const element = event.target as HTMLElement;
        const type = element.dataset.type;
        const rowIndex = parseInt(element.dataset.rowIndex || '-1', 10);
        const colIndex = parseInt(element.dataset.colIndex || '-1', 10);

        if (rowIndex === -1 || colIndex === -1 || !type) {
            console.error("Invalid line data attributes on clicked element:", element.dataset);
            apollosLocalMessage("Error detecting move.", "error");
            return;
        }

        // Send the identified line coordinates to the server
        this.makeMove({ type: type, row: rowIndex, col: colIndex });
    }


    // Method to send move data to the server via WebSocket
    protected makeMove(data: { type: string, row: number, col: number }): void {
        let move = {
            'type': 'move',
            'message': {
                'game_id': this.gameId,
                'user_id': getCurrentUserId(this.contextData?.dataset), // Use optional chaining
                'line_type': data.type, // e.g., 'horizontal' or 'vertical'
                'row_index': data.row,
                'col_index': data.col
            }
        };
        console.log("Sending move:", move);
        this.socket.send(JSON.stringify(move));
        // Optionally, provide immediate visual feedback (e.g., dim the line)
        // This feedback should be reverted/confirmed by the handleMove update
    }

    // Method to handle game state updates received from the server
    public handleMove(data: any): void {
        console.log("Received game update:", data); // Log received server data
        this.data = data; // Store the latest server data

        // --- Update Core Game State ---
        this.round = data.round ?? this.round;
        this.gameOver = data.game_over ?? this.gameOver;
        this.player1Score = data.scores?.p1 ?? this.player1Score;
        this.player2Score = data.scores?.p2 ?? this.player2Score;

        // --- Update Detailed Board State (squareArrays) ---
        if (data.square_arrays) {
             // Basic validation before assignment
             if (Array.isArray(data.square_arrays) && data.square_arrays.length === this.rows * this.cols) {
                 this.squareArrays = data.square_arrays;
                 console.log("Updated squareArrays from server.");
             } else {
                 console.error("Received invalid square_arrays data from server:", data.square_arrays);
                 apollosLocalMessage("Received invalid board state.", "warning");
                 // Avoid updating if data is clearly wrong
             }
        } else {
            // This case means the server didn't send the full state.
            // We cannot reliably update the board without the full state or
            // a very specific delta update mechanism.
             console.warn("Received move data without full square_arrays. Board state might be inconsistent.");
             apollosLocalMessage("Board update may be incomplete.", "warning");
             // If the game continues, request a full state refresh?
        }


        // --- Update UI Elements ---
        this.currentRound.textContent = `Round: ${this.round}`;
        this.updateScores();
        this.drawBoardState(); // Redraw lines and ownership based on the NEW squareArrays

        if (this.gameOver) {
            this.handleGameOverUI(data.winner); // Pass winner ID if available
        } else {
            // Only update turn indicator if game is not over
            this.updateTurnIndicator(this.data); // Pass current server data
        }
    }

    // Update the score display elements
    private updateScores(): void {
        this.playerOneContent.textContent = `${this.player1Score}`;
        // Ensure class is correctly set (might be changed by win/lose state)
        this.playerOneContent.className = 'player-content capture-score-player1';
        this.playerTwoContent.textContent = `${this.player2Score}`;
        this.playerTwoContent.className = 'player-content capture-score-player2';
    }

    // Redraws lines and square ownership based on the current squareArrays state
    private drawBoardState(): void {
        console.log("Drawing board state based on:", this.squareArrays);
        // Clear existing line styles first
        const lines = this.boardArea.querySelectorAll('.capture-h-space, .capture-v-space');
        lines.forEach(line => line.classList.remove('capture-line-player1', 'capture-line-player2'));

        // Draw lines based on squareArrays side data
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const index = r * this.cols + c;
                const squareData = this.squareArrays[index];
                if (!squareData || !squareData.sides) {
                    // console.warn(`Missing square data or sides for index ${index}`);
                    continue; // Skip if data is missing/invalid for this square
                }

                const topSideOwner = squareData.sides[SIDE_INDEXES.top];
                const bottomSideOwner = squareData.sides[SIDE_INDEXES.bottom];
                const leftSideOwner = squareData.sides[SIDE_INDEXES.left];
                const rightSideOwner = squareData.sides[SIDE_INDEXES.right];

                // Find corresponding line elements and apply player classes
                const topLine = this.boardArea.querySelector(`.capture-h-space[data-row-index='${r}'][data-col-index='${c}']`);
                if (topLine && topSideOwner) topLine.classList.add(`capture-line-player${topSideOwner}`);

                const bottomLine = this.boardArea.querySelector(`.capture-h-space[data-row-index='${r + 1}'][data-col-index='${c}']`);
                if (bottomLine && bottomSideOwner) bottomLine.classList.add(`capture-line-player${bottomSideOwner}`);

                const leftLine = this.boardArea.querySelector(`.capture-v-space[data-row-index='${r}'][data-col-index='${c}']`);
                if (leftLine && leftSideOwner) leftLine.classList.add(`capture-line-player${leftSideOwner}`);

                const rightLine = this.boardArea.querySelector(`.capture-v-space[data-row-index='${r}'][data-col-index='${c + 1}']`);
                if (rightLine && rightSideOwner) rightLine.classList.add(`capture-line-player${rightSideOwner}`);
            }
        }

        // Update square ownership visuals
        for (let index = 0; index < this.squareArrays.length; index++) {
            const squareElement = document.getElementById(`square${index}`);
            const squareData = this.squareArrays[index];
             if (squareElement && squareData) {
                 // Clear previous ownership and win/loss styles
                 squareElement.classList.remove('capture-owned-player1', 'capture-owned-player2', 'winners-glow', 'capture-faded-player1', 'capture-faded-player2');
                 if (squareData.owner !== 0) {
                     squareElement.classList.add(`capture-owned-player${squareData.owner}`);
                 }
             } else if (squareElement && !squareData) {
                 console.warn(`Square element found for index ${index}, but no squareData.`);
             }
        }
    }

    // Updates whose turn it is visually and enables/disables the board
    private updateTurnIndicator(data: any): void { // Accept data argument
        const myId = getCurrentUserId(this.contextData?.dataset); // Use optional chaining
        if (!myId) {
            console.warn("Could not get current user ID, disabling board.");
            this.app.classList.add('turn-disable');
            return;
        }

        // Determine current player based on server data if available, otherwise use round number
        // Capture allows multiple moves if a square is completed.
        // Rely on server sending 'current_player_id' for accuracy.
        const expectedPlayerId = data?.current_player_id ?? (this.round % 2 !== 0 ? this.player1Id : this.player2Id);

        console.log(`Updating turn: Round ${this.round}, My ID ${myId}, Expected Player ${expectedPlayerId}, P1 ID ${this.player1Id}, P2 ID ${this.player2Id}`);


         if (expectedPlayerId == myId) {
            this.app.classList.remove('turn-disable'); // My turn
            if (this.player1Id === myId) {
                this.playerOneElement.classList.remove('disabled');
                this.playerTwoElement.classList.add('disabled');
            } else {
                this.playerTwoElement.classList.remove('disabled');
                this.playerOneElement.classList.add('disabled');
            }
        } else {
            this.app.classList.add('turn-disable'); // Opponent's turn
            // Visually indicate who's turn it is, even if disabled for current user
            if (expectedPlayerId == this.player1Id) {
                 this.playerOneElement.classList.remove('disabled');
                 this.playerTwoElement.classList.add('disabled');
             } else if (expectedPlayerId == this.player2Id) {
                 this.playerTwoElement.classList.remove('disabled');
                 this.playerOneElement.classList.add('disabled');
             } else {
                 // Fallback or if observer
                 this.playerOneElement.classList.add('disabled');
                 this.playerTwoElement.classList.add('disabled');
             }
        }
    }

    // Handles the UI updates when the game ends
    private handleGameOverUI(winnerId?: number | string | null): void {
        console.log(`Handling Game Over UI. Winner ID: ${winnerId}`);
        this.app.classList.add('turn-disable'); // Ensure board is disabled
        this.removeLineEventListeners(); // Remove click listeners

        // Determine winner based on IDs, converting winnerId to string for comparison if necessary
        const winnerIdStr = winnerId?.toString();
        const p1IdStr = this.player1Id?.toString();
        const p2IdStr = this.player2Id?.toString();

        const p1Wins = winnerIdStr && p1IdStr && winnerIdStr === p1IdStr;
        const p2Wins = winnerIdStr && p2IdStr && winnerIdStr === p2IdStr;
        // Check explicit tie status from server if available, otherwise infer
        const tie = this.data?.is_tie ?? (!p1Wins && !p2Wins && this.gameOver); // Infer tie only if game is over


        // --- Apply visual styles for win/loss/tie to squares ---
        for (let i = 0; i < this.squareArrays.length; i++) {
            const squareData = this.squareArrays[i];
            const space = document.getElementById(`square${i}`);
            if (!space || !squareData) continue;

            // Clear previous win/loss styles first
            space.classList.remove('winners-glow', 'capture-faded-player1', 'capture-faded-player2');

            if (p1Wins) {
                if (squareData.owner === 1) space.classList.add('winners-glow');
                else if (squareData.owner === 2) space.classList.add('capture-faded-player2');
                // else leave neutral squares alone
            } else if (p2Wins) {
                if (squareData.owner === 2) space.classList.add('winners-glow');
                else if (squareData.owner === 1) space.classList.add('capture-faded-player1');
                 // else leave neutral squares alone
            } else if (tie) {
                 // Optional: Style for a tie game (e.g., fade both players equally)
                if (squareData.owner === 1) space.classList.add('capture-faded-player1');
                else if (squareData.owner === 2) space.classList.add('capture-faded-player2');
            }
        }

        // --- Update player area text/styles for game over ---
        // Clear existing content/styles first
        this.playerOneElement.classList.remove('winners-glow', 'disabled');
        this.playerTwoElement.classList.remove('winners-glow', 'disabled');
        this.updateScores(); // Reset score text before potentially overwriting with WIN/TIE

         if (p1Wins) {
            this.playerOneElement.classList.add('winners-glow');
            this.playerTwoElement.classList.add('disabled'); // Dim loser
            this.playerOneContent.textContent = "WINS!";
         } else if (p2Wins) {
            this.playerTwoElement.classList.add('winners-glow');
            this.playerOneElement.classList.add('disabled'); // Dim loser
            this.playerTwoContent.textContent = "WINS!";
         } else if (tie) {
             this.playerOneContent.textContent = "TIE";
             this.playerTwoContent.textContent = "TIE";
             // Keep both active or apply a specific tie style
             // this.playerOneElement.classList.add('tie-style');
             // this.playerTwoElement.classList.add('tie-style');
         } else {
             // Handle case where game is over but no winner ID provided (e.g., aborted?)
             console.log("Game over, but no winner determined or it's a tie.");
             this.playerOneElement.classList.add('disabled');
             this.playerTwoElement.classList.add('disabled');
             // Consider adding a message like "Game Over" or "Draw" if it's a tie without explicit winner ID
              if (this.gameOver && this.player1Score === this.player2Score) { // Infer tie if scores equal and game is over
                  this.playerOneContent.textContent = "TIE";
                  this.playerTwoContent.textContent = "TIE";
              }
         }
    }

    // Removes event listeners from lines to prevent clicks after game over
    private removeLineEventListeners(): void {
        const lines = this.boardArea.querySelectorAll('.capture-h-space, .capture-v-space');
        // Cloning and replacing nodes is the most reliable way to remove all listeners
        lines.forEach(line => {
            const oldElement = line;
            const newElement = oldElement.cloneNode(true);
            oldElement?.parentNode?.replaceChild(newElement, oldElement);

            // If specific listener removal was implemented:
            // if ((line as any)._captureClickListener) {
            //    line.removeEventListener('click', (line as any)._captureClickListener);
            //    delete (line as any)._captureClickListener;
            // }
        });
        console.log("Capture board listeners removed.");
    }
}

// --- CSS Requirements ---
// You will need to define styles for the following classes in your CSS:
// .capture-board-area { /* Container styling, maybe CSS Grid */ }
// .capture-row { display: flex; /* Or similar layout */ }
// .capture-dot { /* Style for the dots */ }
// .capture-h-space { /* Style for horizontal lines, clickable area */ }
// .capture-v-space { /* Style for vertical lines, clickable area */ }
// .capture-square-area { /* Background area for owned squares */ }
// .capture-line-player1, .capture-line-player2 { /* Style for captured lines (e.g., color) */ }
// .capture-owned-player1, .capture-owned-player2 { /* Style for owned square backgrounds */ }
// .capture-score-player1, .capture-score-player2 { /* Player score area styling */ }
// .winners-glow { /* Style for winner highlight */ }
// .capture-faded-player1, .capture-faded-player2 { /* Style for fading opponent's squares on loss */ }
// /* Plus .turn-disable, .disabled from shared styles */
