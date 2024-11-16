
/**
 * @class TransisitonX
 */
class TransitionX {
    constructor(initialState = {}, transitions = {}, debug = false) {
        this.state = { ...initialState };
        this.transitions = { ...transitions };
        this.debug = debug;
        this.stateHistory = []; // Stack for rollback
        this.redoStack = []; // Stack for redo
    }

    // Log utility
    log(message, data = null) {
        if (this.debug) {
            console.log(`[TransitionX] ${message}`);
            if (data) {
                console.log(data);
            }
        }
    }

    // Save the current state to history
    saveState() {
        this.stateHistory.push({ ...this.state });
        this.redoStack = []; // Clear redo stack after new save
        this.log("State saved to history", { ...this.state });
    }

    // Rollback to the most recent saved state
    rollbackState() {
        if (this.stateHistory.length > 0) {
            const previousState = this.stateHistory.pop();
            this.redoStack.push({ ...this.state }); // Save current state to redo stack
            this.state = { ...previousState };
            this.log("State rolled back to previous state", { ...this.state });
        } else {
            this.log("No saved state to rollback to.");
            throw new Error("No saved state to rollback to.");
        }
    }

    // Redo the most recently rolled-back state
    redoState() {
        if (this.redoStack.length > 0) {
            const nextState = this.redoStack.pop();
            this.stateHistory.push({ ...this.state }); // Save current state to history stack
            this.state = { ...nextState };
            this.log("State redone to next state", { ...this.state });
        } else {
            this.log("No state to redo.");
            throw new Error("No state to redo.");
        }
    }

    // Wrap a function with state and transition properties
    wrap(fn) {
        const context = this;
        return async function (...args) {
            context.log("Executing wrapped function", { functionName: fn.name || "anonymous" });
            try {
                await fn.apply(null, [
                    {
                        state: context.state,
                        transition: context.createTransition(),
                        saveState: context.saveState.bind(context),
                        rollbackState: context.rollbackState.bind(context),
                        redoState: context.redoState.bind(context),
                    },
                    ...args,
                ]);
            } catch (error) {
                context.log(`Error in wrapped function: ${error.message}`);
                throw error; // Re-throw the error to let caller handle it
            }
        };
    }

    // Create a transition handler for state changes
    createTransition() {
        const context = this;
        return async function (name, ...args) {
            context.log(`Attempting transition: "${name}"`, { args });
            if (context.transitions[name]) {
                context.log("State before transition", { ...context.state });
                try {
                    await context.transitions[name](context.state, ...args);  // Await async transitions
                } catch (error) {
                    context.log(`Error during transition "${name}": ${error.message}`);
                    throw error; // Re-throw the error for caller to handle
                }
                context.log("State after transition", { ...context.state });
            } else {
                const errorMessage = `Transition "${name}" is not defined.`;
                context.log(errorMessage);
                throw new Error(errorMessage);
            }
        };
    }
}


module.exports =  TransitionX