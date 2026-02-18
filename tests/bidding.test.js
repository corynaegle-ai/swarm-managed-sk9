describe('BiddingManager', () => {
    let biddingManager;
    let mockGameState;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <div id="round-number"></div>
            <div id="available-hands"></div>
            <div id="player-bids"></div>
            <button id="confirm-bids-btn"></button>
            <button id="edit-bids-btn"></button>
            <div id="bid-review"></div>
            <div id="bid-summary"></div>
            <form id="bidding-form"></form>
            <button id="back-to-game-btn"></button>
        `;

        // Mock gameState
        mockGameState = {
            getCurrentRound: () => 3,
            getPlayers: () => [
                { name: 'Player 1' },
                { name: 'Player 2' }
            ],
            setCurrentRoundBids: jest.fn()
        };
        window.gameState = mockGameState;
    });

    test('should display current round and available hands', () => {
        biddingManager = new BiddingManager();
        
        expect(document.getElementById('round-number').textContent).toBe('3');
        expect(document.getElementById('available-hands').textContent).toBe('3');
    });

    test('should generate input fields with proper min/max attributes', () => {
        biddingManager = new BiddingManager();
        
        const inputs = document.querySelectorAll('input[type="number"]');
        expect(inputs).toHaveLength(2);
        
        inputs.forEach(input => {
            expect(input.getAttribute('min')).toBe('0');
            expect(input.getAttribute('max')).toBe('3');
        });
    });

    test('should validate bids do not exceed available hands', () => {
        biddingManager = new BiddingManager();
        
        const input = document.getElementById('bid-player-0');
        input.value = '5';
        
        const isValid = biddingManager.handleBidInput(input);
        expect(isValid).toBe(false);
        expect(input.classList.contains('error')).toBe(true);
    });

    test('should show bid review before final confirmation', () => {
        biddingManager = new BiddingManager();
        
        // Set valid bids
        document.getElementById('bid-player-0').value = '1';
        document.getElementById('bid-player-1').value = '2';
        
        biddingManager.showBidReview();
        
        expect(document.getElementById('bid-review').style.display).toBe('block');
        expect(document.getElementById('edit-bids-btn').style.display).toBe('inline-block');
    });

    test('should allow editing bids before final submission', () => {
        biddingManager = new BiddingManager();
        
        // Go to review mode
        biddingManager.isEditMode = false;
        biddingManager.enableEditMode();
        
        expect(biddingManager.isEditMode).toBe(true);
        expect(document.getElementById('bidding-form').style.display).toBe('block');
        expect(document.getElementById('bid-review').style.display).toBe('none');
    });
});