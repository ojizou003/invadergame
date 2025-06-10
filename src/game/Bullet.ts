import { Vector2 } from "../utils/Vector2";
import { Renderer } from "../graphics/Renderer";
import { Rectangle } from "../utils/Rectangle";

export class Bullet {
    position: Vector2;
    private velocity: Vector2;
    alive: boolean = false;
    private speed = 300; // Pixels per second
    private sprite: any; // Placeholder for sprite object
    private width: number = 1; // Placeholder width (original: 1x4 pixels)
    private height: number = 4; // Placeholder height

    constructor() {
        this.position = new Vector2(0, 0);
        this.velocity = new Vector2(0, 0);
        // TODO: Load bullet sprite
        // this.sprite = { width: 1, height: 4 }; // Placeholder size (original: 1x4 pixels)
    }

    fire(x: number, y: number, directionY: number): void {
        this.position.set(x - this.width / 2, y); // Adjust position to center bullet
        this.velocity.set(0, this.speed * directionY);
        this.alive = true;
    }

    update(deltaTime: number): void {
        if (!this.alive) return;

        this.position.x += this.velocity.x * deltaTime / 1000;
        this.position.y += this.velocity.y * deltaTime / 1000;

        // Deactivate if out of bounds
        if (this.position.y < 0 || this.position.y > 256) {
            this.alive = false;
        }
    }

    render(renderer: Renderer): void {
        if (this.alive) {
            renderer.drawRect(this.position.x, this.position.y, this.width, this.height, '#FFFFFF'); // Draw white rectangle placeholder
        }
    }

    getBounds(): Rectangle {
         return new Rectangle(this.position.x, this.position.y, this.width, this.height);
    }

    // Method to call when bullet hits something
    hit(): void {
        this.alive = false;
    }
}