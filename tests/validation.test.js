// Tests for real-time input validation

describe('Real-time Input Validation', () => {
    let validator;
    let mockForm, mockInput, mockErrorElement;
    
    beforeEach(() => {
        // Setup DOM elements
        document.body.innerHTML = `
            <form id="testForm">
                <input type="text" id="testInput" name="testInput">
                <span class="error-message" id="testInput-error"></span>
                <button type="submit">Submit</button>
            </form>
        `;
        
        // Setup validation utils
        window.ValidationUtils = {
            validatePlayerName: jest.fn(),
            validateBidAmount: jest.fn(),
            validateTricksAmount: jest.fn(),
            validateBonusPoints: jest.fn(),
            validateBonusReason: jest.fn()
        };
        
        validator = new GameFormValidator();
        mockForm = document.getElementById('testForm');
        mockInput = document.getElementById('testInput');
        mockErrorElement = document.getElementById('testInput-error');
    });
    
    afterEach(() => {
        document.body.innerHTML = '';
        delete window.ValidationUtils;
    });
    
    test('should show error message immediately when input is invalid', () => {
        window.ValidationUtils.validatePlayerName.mockReturnValue({
            isValid: false,
            message: 'Player name is required'
        });
        
        mockInput.name = 'playerName';
        mockInput.value = '';
        
        const inputEvent = new Event('input');
        mockInput.dispatchEvent(inputEvent);
        
        expect(mockInput.classList.contains('invalid')).toBe(true);
        expect(mockErrorElement.textContent).toBe('Player name is required');
        expect(mockErrorElement.classList.contains('show')).toBe(true);
    });
    
    test('should clear error message when input becomes valid', () => {
        // First make input invalid
        mockInput.classList.add('invalid');
        mockErrorElement.textContent = 'Error message';
        mockErrorElement.classList.add('show');
        
        window.ValidationUtils.validatePlayerName.mockReturnValue({
            isValid: true,
            message: ''
        });
        
        mockInput.name = 'playerName';
        mockInput.value = 'Valid Name';
        
        const inputEvent = new Event('input');
        mockInput.dispatchEvent(inputEvent);
        
        expect(mockInput.classList.contains('invalid')).toBe(false);
        expect(mockErrorElement.textContent).toBe('');
        expect(mockErrorElement.classList.contains('show')).toBe(false);
    });
    
    test('should disable submit button when form has errors', () => {
        window.ValidationUtils.validatePlayerName.mockReturnValue({
            isValid: false,
            message: 'Error message'
        });
        
        mockInput.name = 'playerName';
        mockInput.value = '';
        
        const inputEvent = new Event('input');
        mockInput.dispatchEvent(inputEvent);
        
        const submitButton = mockForm.querySelector('button[type="submit"]');
        expect(submitButton.disabled).toBe(true);
    });
    
    test('should enable submit button when all errors are cleared', () => {
        const submitButton = mockForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        
        window.ValidationUtils.validatePlayerName.mockReturnValue({
            isValid: true,
            message: ''
        });
        
        mockInput.name = 'playerName';
        mockInput.value = 'Valid Name';
        
        const inputEvent = new Event('input');
        mockInput.dispatchEvent(inputEvent);
        
        expect(submitButton.disabled).toBe(false);
    });
    
    test('should prevent form submission when validation fails', () => {
        window.ValidationUtils.validatePlayerName.mockReturnValue({
            isValid: false,
            message: 'Player name is required'
        });
        
        mockInput.name = 'playerName';
        mockInput.value = '';
        
        const submitEvent = new Event('submit');
        const preventDefaultSpy = jest.spyOn(submitEvent, 'preventDefault');
        
        mockForm.dispatchEvent(submitEvent);
        
        expect(preventDefaultSpy).toHaveBeenCalled();
    });
    
    test('should allow form submission when validation passes', () => {
        window.ValidationUtils.validatePlayerName.mockReturnValue({
            isValid: true,
            message: ''
        });
        
        mockInput.name = 'playerName';
        mockInput.value = 'Valid Name';
        
        const submitEvent = new Event('submit');
        const preventDefaultSpy = jest.spyOn(submitEvent, 'preventDefault');
        
        mockForm.dispatchEvent(submitEvent);
        
        expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
});