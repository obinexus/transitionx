# TransitionX

TransitionX is a JavaScript class that allows you to manage state transitions with undo (rollback) and redo functionality. It enables tracking of state changes, saving and restoring previous states, and reapplying changes for a smooth workflow. This is ideal for applications where you need to maintain and manipulate complex states, such as a game or simulation.

## Features

- **State Transitions**: Define custom transitions that modify the state.
- **State History**: Track and save the state for easy rollback and redo operations.
- **Rollback**: Revert the state to a previously saved version.
- **Redo**: Reapply the last rolled-back state.
- **Debugging**: Optionally log state changes and transition operations for debugging purposes.

## Installation

Install the package via npm:

```bash
npm install @obinexus/transitionx
```

## Usage

### Creating a `TransitionX` Instance

To create a `TransitionX` instance, you need to provide an initial state and the available transitions.

```javascript
const TransitionX = require('transitionx');

const initialState = {
    hunger: 'hungry',
    energy: 'low',
};

const transitions = {
    eat: (state) => { state.hunger = 'satisfied'; },
    rest: (state) => { state.energy = 'high'; },
};

const tx = new TransitionX(initialState, transitions, true); // Enable debug logging
```

### Wrapping Functions

You can wrap functions with `TransitionX` to automatically manage state transitions.

```javascript
const eatFunction = tx.wrap(({ state, transition, saveState, rollbackState, redoState }) => {
    console.log("Current Hunger State:", state.hunger);
    saveState(); // Save the current state
    transition('eat'); // Trigger the 'eat' transition
    console.log("After eating:", state.hunger);
    rollbackState(); // Rollback to the saved state
    console.log("After rollback:", state.hunger);
    redoState(); // Redo the transition
    console.log("After redo:", state.hunger);
});
eatFunction();
```

### Example Test Cases

You can use this in unit tests to verify the correct behavior of state transitions, rollbacks, and redos.

```javascript
const TransitionX = require('./transitionx');

describe('TransitionX', () => {
    const initialState = { hunger: 'hungry', energy: 'low' };
    const transitions = {
        eat: (state) => { state.hunger = 'satisfied'; },
        rest: (state) => { state.energy = 'high'; },
    };

    let tx;

    beforeEach(() => {
        tx = new TransitionX(initialState, transitions, false); // Disable debug logging for tests
    });

    test('transition modifies state', () => {
        tx.createTransition()('eat');
        expect(tx.state.hunger).toBe('satisfied');
    });

    test('saveState and rollbackState restore previous state', () => {
        tx.saveState();
        tx.createTransition()('eat');
        expect(tx.state.hunger).toBe('satisfied');
        tx.rollbackState();
        expect(tx.state.hunger).toBe('hungry');
    });

    test('redoState re-applies rolled-back state', () => {
        tx.saveState();
        tx.createTransition()('eat');
        tx.rollbackState();
        expect(tx.state.hunger).toBe('hungry');
        tx.redoState();
        expect(tx.state.hunger).toBe('satisfied');
    });

    test('rollback with no history throws error', () => {
        expect(() => tx.rollbackState()).toThrow('No saved state to rollback to.');
    });

    test('redo with no redo stack throws error', () => {
        expect(() => tx.redoState()).toThrow('No state to redo.');
    });
});
```

## API

### `new TransitionX(initialState, transitions, debug)`

- `initialState`: An object representing the initial state of your system.
- `transitions`: An object where each key is a transition name, and each value is a function that modifies the state.
- `debug`: (optional) A boolean that enables or disables debug logging.

### `saveState()`

Saves the current state to the history stack for later rollback.

### `rollbackState()`

Reverts the state to the last saved state. Throws an error if no state history exists.

### `redoState()`

Reapplies the most recently rolled-back state. Throws an error if no state is available to redo.

### `createTransition()`

Returns a transition function that allows you to trigger a named transition and modify the state.

### `wrap(fn)`

Wraps a function to provide access to the current state, transition, and history management methods (`saveState`, `rollbackState`, `redoState`).

## Example

```javascript
const initialState = { hunger: 'hungry', energy: 'low' };
const transitions = {
    eat: (state) => { state.hunger = 'satisfied'; },
    rest: (state) => { state.energy = 'high'; },
};

const tx = new TransitionX(initialState, transitions, true);

const eatFunction = tx.wrap(({ state, transition, saveState, rollbackState, redoState }) => {
    console.log("Current Hunger:", state.hunger);
    saveState();
    transition('eat');
    console.log("After Eating:", state.hunger);
    rollbackState();
    console.log("After Rollback:", state.hunger);
    redoState();
    console.log("After Redo:", state.hunger);
});

eatFunction();
```

## Contributing

If you find bugs or would like to improve the library, feel free to submit a pull request or open an issue on GitHub.

## License

This project is licensed under the MIT License.

---

For more information, feel free to check the [documentation](https://github.com/obinexus/TransitionX).