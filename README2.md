

## `TransitionX` Class Documentation

### Overview
`TransitionX` is a class that allows managing states with transition-based changes. It provides mechanisms for saving, rolling back, and redoing state transitions, while optionally logging each operation for debugging purposes.

### Constructor

```javascript
constructor(initialState = {}, transitions = {}, debug = false);
```

#### Parameters:
- `initialState` (Object): The initial state of the system. Default is an empty object (`{}`).
- `transitions` (Object): A set of transitions where each key is the name of the transition and the value is a function that modifies the state.
- `debug` (Boolean): If set to `true`, debug logs will be printed to the console. Default is `false`.

#### Example:

```javascript
const initialState = { hunger: "hungry", energy: "low" };
const transitions = { 
  eat: (state) => { /* logic */ },
  rest: (state) => { /* logic */ }
};
const tx = new TransitionX(initialState, transitions, true);
```

---

### Methods

#### `log(message, data = null)`
Logs a message to the console, if `debug` is set to `true`.

- `message` (String): The message to log.
- `data` (Object, optional): Additional data to log.

#### `saveState()`
Saves the current state to a history stack for potential rollback. Clears the redo stack after saving a new state.

#### `rollbackState()`
Rolls back to the most recent saved state in the history stack. If no history exists, throws an error.

#### `redoState()`
Redoes the most recently rolled-back state from the redo stack. If no state is available to redo, throws an error.

#### `wrap(fn)`
Wraps a function to provide state management functionality, including transitions, state saving, and rollback/redo operations. 

- `fn` (Function): The function to wrap, which will receive an object containing the following properties:
  - `state`: The current state object.
  - `transition`: A function to execute state transitions.
  - `saveState`: A function to save the current state.
  - `rollbackState`: A function to rollback to the most recent state.
  - `redoState`: A function to redo the most recent rollback.

- Returns a new asynchronous function that calls the wrapped function with state and utility methods.

#### `createTransition()`
Creates a transition handler for applying state transitions. The handler function can be invoked to change the state according to the defined transitions.

---

## Usage Example

### Initializing State and Transitions

```javascript
const initialState = {
    hunger: "hungry",
    energy: "low",
};

const transitions = {
    eat: (state) => {
        if (state.hunger === "hungry") {
            state.hunger = "satisfied";
            console.log("You ate. Now you're satisfied.");
        } else {
            console.log("You're not hungry.");
        }
    },
    rest: (state) => {
        if (state.energy === "low") {
            state.energy = "high";
            console.log("You rested. Now you have high energy.");
        } else {
            console.log("You already have enough energy.");
        }
    },
};
```

### Creating a `TransitionX` Instance

```javascript
const tx = new TransitionX(initialState, transitions, true);
```

This initializes a `TransitionX` instance with the provided `initialState`, `transitions`, and `debug` set to `true`, enabling detailed logging of actions.

---

### Wrapping Transition Functions

The `wrap` method can be used to wrap a function and provide access to the state and transition utilities, including the ability to save, rollback, and redo states.

#### Example 1: `eatFunction`

```javascript
const eatFunction = tx.wrap(async ({ state, transition, saveState, rollbackState, redoState }) => {
    console.log("Current Hunger State:", state.hunger);
    saveState(); // Save the current state
    await transition("eat");  // Transition eat asynchronously
    console.log("After eating:", state.hunger);
    rollbackState(); // Rollback to the saved state
    console.log("After rollback:", state.hunger); // Explicitly fetch updated state
    redoState(); // Redo the previously rolled-back state
    console.log("After redo:", state.hunger); // Explicitly fetch updated state
});
```

- This function:
  - Logs the current hunger state.
  - Saves the state.
  - Executes the `eat` transition (changing the hunger state).
  - Logs the state after the transition.
  - Rolls back to the saved state and logs the rollback.
  - Redoes the previous rollback and logs the state after redoing.

#### Example 2: `restFunction`

```javascript
const restFunction = tx.wrap(async ({ state, transition, saveState }) => {
    console.log("Current Energy State:", state.energy);
    saveState(); // Save the current state
    await transition("rest");  // Transition rest asynchronously
    console.log("After resting:", state.energy);
});
```

- This function:
  - Logs the current energy state.
  - Saves the state.
  - Executes the `rest` transition (increasing the energy).
  - Logs the energy state after the transition.

---

### Executing Wrapped Functions

To execute the wrapped functions, simply call them like regular functions:

```javascript
eatFunction();  // Executes the wrapped 'eat' function and performs the transition
restFunction(); // Executes the wrapped 'rest' function and performs the transition
```

---

## Error Handling
- If an invalid transition name is provided to `transition()`, an error is thrown.
- If a rollback or redo operation is attempted when no state is available to do so, an error is thrown.
- All errors in the wrapped function or transitions are logged and can be handled via `try-catch` blocks within the wrapped function.

---

## Notes
- The `wrap` function returns an asynchronous function, ensuring that transitions can be handled properly if they involve asynchronous tasks (e.g., network requests or delays).
- Transitions can either be synchronous or asynchronous, depending on the logic you define within the transition functions.

