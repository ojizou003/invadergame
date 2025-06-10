export class InputManager {
    private keyStates: Map<string, boolean>;

    constructor() {
        this.keyStates = new Map();
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    private handleKeyDown(event: KeyboardEvent): void {
        this.keyStates.set(event.key, true);
    }

    private handleKeyUp(event: KeyboardEvent): void {
        this.keyStates.set(event.key, false);
    }

    isKeyDown(key: string): boolean {
        return this.keyStates.get(key) === true;
    }
}