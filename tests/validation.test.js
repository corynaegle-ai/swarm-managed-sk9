// Tests for real-time input validation functionality

describe('GameFormValidator', () => {
    let validator;
    let mockInput;
    let mockErrorElement;

    beforeEach(() => {
        // Setup DOM elements
        document.body.innerHTML = `
            <input type="text" id="playerName" name="playerName">
            <span class="error-message" id="playerName-error"></span>
            <input type="number" id="bidAmount" name="bidAmount">
            <span class="error-message" id="bidAmount-error"></span>
        `;
        
        validator = new GameFormValidator();
        mockInput = document.getElementById('playerName');
        mockErrorElement = document.getElementById('playerName-error');
    });

    describe('Name Validation', () => {
        test('should show error for empty required name', () => {
            const result = validator.validateName('', true);
            expect(result.isValid).toBe(false);
            expect(result.message).toBe('Player name is required');
        });

        test('should show error for name too short', () => {
            const result = validator.validateName('A');
            expect(result.isValid).toBe(false);
            expect(result.message).toBe('Name must be at least 2 characters');
        });

        test('should show error for name with invalid characters', () => {
            const result = validator.validateName('Player123');
            expect(result.isValid).toBe(false);
            expect(result.message).toBe('Name can only contain letters and spaces');
        });

        test('should pass validation for valid name', () => {
            const result = validator.validateName('John Doe');
            expect(result.isValid).toBe(true);
        });
    });

    describe('Bid Amount Validation', () => {
        test('should show error for empty bid amount', () => {
            const result = validator.validateBidAmount('');
            expect(result.isValid).toBe(false);
            expect(result.message).toBe('Bid amount is required');
        });

        test('should show error for negative bid amount', () => {
            const result = validator.validateBidAmount('-1');
            expect(result.isValid).toBe(false);
            expect(result.message).toBe('Bid amount cannot be negative');
        });

        test('should show error for bid amount exceeding 13', () => {
            const result = validator.validateBidAmount('14');
            expect(result.isValid).toBe(false);
            expect(result.message).toBe('Bid amount cannot exceed 13');
        });

        test('should pass validation for valid bid amount', () => {
            const result = validator.validateBidAmount('7');
            expect(result.isValid).toBe(true);
        });
    });

    describe('Error Display', () => {
        test('should add invalid class and show error message', () => {
            validator.showInputError(mockInput, 'Test error message');
            
            expect(mockInput.classList.contains('invalid')).toBe(true);
            expect(mockErrorElement.textContent).toBe('Test error message');
            expect(mockErrorElement.classList.contains('show')).toBe(true);
        });

        test('should remove invalid class and hide error message', () => {
            // First add error
            mockInput.classList.add('invalid');
            mockErrorElement.textContent = 'Error';
            mockErrorElement.classList.add('show');
            
            // Then clear error
            validator.clearInputError(mockInput);
            
            expect(mockInput.classList.contains('invalid')).toBe(false);
            expect(mockErrorElement.textContent).toBe('');
            expect(mockErrorElement.classList.contains('show')).toBe(false);
        });
    });

    describe('Real-time Validation', () => {
        test('should validate on input event', (done) => {
            mockInput.value = 'A';
            
            const inputEvent = new Event('input');
            mockInput.dispatchEvent(inputEvent);
            
            // Use setTimeout to allow for async processing
            setTimeout(() => {
                expect(mockInput.classList.contains('invalid')).toBe(true);
                done();
            }, 10);
        });

        test('should clear errors when input becomes valid', (done) => {
            // First make input invalid
            mockInput.value = 'A';
            mockInput.dispatchEvent(new Event('input'));
            
            setTimeout(() => {
                expect(mockInput.classList.contains('invalid')).toBe(true);
                
                // Then make it valid
                mockInput.value = 'Valid Name';
                mockInput.dispatchEvent(new Event('input'));
                
                setTimeout(() => {
                    expect(mockInput.classList.contains('invalid')).toBe(false);
                    done();
                }, 10);
            }, 10);
        });
    });
});