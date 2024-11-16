const TransitionX = require('./transitionx'); 
describe('TransitionX', () => {
    const initialState = { hunger: 'hungry', energy: 'low' };

    // Transition definitions
    const transitions = {
        eat: (state) => {
            state.hunger = 'satisfied';
        },
        rest: (state) => new Promise((resolve) => {
            setTimeout(() => {
                state.energy = 'high';
                resolve();
            }, 500); // Simulating async behavior with delay
        })
    };

    let tx;

    beforeEach(() => {
        tx = new TransitionX(initialState, transitions, false); // Disable debug logging for tests
    });

    test('synchronous transition modifies state immediately', () => {
        tx.createTransition()('eat');
        expect(tx.state.hunger).toBe('satisfied'); // Immediately after transition
    });

    test('asynchronous transition modifies state after delay', async () => {
        // Test for asynchronous behavior (rest)
        await tx.createTransition()('rest');
        expect(tx.state.energy).toBe('high'); // After delay, the energy should be high
    });

    test('saveState and rollbackState restore previous state for synchronous transitions', () => {
        tx.saveState(); // Save the state before transitioning
        tx.createTransition()('eat'); // Apply the eat transition
        expect(tx.state.hunger).toBe('satisfied'); // After transition
        tx.rollbackState(); // Rollback to saved state
        expect(tx.state.hunger).toBe('hungry'); // Should be back to initial state
    });

    test('saveState and rollbackState restore previous state for asynchronous transitions', async () => {
        tx.saveState(); // Save the state before transitioning
        await tx.createTransition()('rest'); // Apply the rest transition
        expect(tx.state.energy).toBe('high'); // After async transition
        tx.rollbackState(); // Rollback to saved state
        expect(tx.state.energy).toBe('low'); // Should be back to initial state
    });

    test('redoState re-applies rolled-back state for synchronous transitions', async () => {
        tx.saveState(); // Save the state before transitioning
        tx.createTransition()('eat'); // Apply the eat transition
        tx.rollbackState(); // Rollback to saved state
        expect(tx.state.hunger).toBe('hungry'); // Should be back to initial state
        tx.redoState(); // Redo the transition
        expect(tx.state.hunger).toBe('satisfied'); // Should have reapplied the eat transition
    });

    test('redoState re-applies rolled-back state for asynchronous transitions', async () => {
        tx.saveState(); // Save the state before transitioning
        await tx.createTransition()('rest'); // Apply the rest transition
        tx.rollbackState(); // Rollback to saved state
        expect(tx.state.energy).toBe('low'); // Should be back to initial state
        tx.redoState(); // Redo the transition
        expect(tx.state.energy).toBe('high'); // Should have reapplied the rest transition
    });

    test('rollback with no history throws error', () => {
        expect(() => tx.rollbackState()).toThrow('No saved state to rollback to.');
    });

    test('redo with no redo stack throws error', () => {
        expect(() => tx.redoState()).toThrow('No state to redo.');
    });
});
