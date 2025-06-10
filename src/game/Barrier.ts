import { Vector2 } from "../utils/Vector2";
import { Renderer } from "./Renderer";
import { Rectangle } from "../utils/Rectangle"; // Import Rectangle

export class Barrier {
    // Placeholder class for a single barrier block
    // Original game had destructible barriers built from multiple blocks/pixels
    private pixels: boolean[][]; // Simple representation of pixels
    private pixelSize: number = 2; // Size of each 'pixel' in the barrier

    position: Vector2;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.position = new Vector2(x, y);
        this.width = width;
        this.height = height;
        // Initialize a simple grid of pixels (placeholder)
        const pixelGridWidth = Math.floor(width / this.pixelSize);
        const pixelGridHeight = Math.floor(height / this.pixelSize);

        this.pixels = Array(pixelGridHeight).fill(0).map(() => Array(pixelGridWidth).fill(true));

         // Apply initial shape (simple rectangle for now)
         for(let y = 0; y < pixelGridHeight; y++) {
            for(let x = 0; x < pixelGridWidth; x++) {
                 this.pixels[y][x] = true;
            }
         }
    }

    // Damage the barrier at a specific point (bullet hit)
    takeDamage(hitX: number, hitY: number): void {
        // Convert hit coordinates to local pixel coordinates
        const localX = Math.floor((hitX - this.position.x) / this.pixelSize);
        const localY = Math.floor((hitY - this.position.y) / this.pixelSize);

        // Simple damage: remove a block of pixels around the hit point
        const damageRadius = 2; // Pixels
        const pixelGridWidth = Math.floor(this.width / this.pixelSize);
        const pixelGridHeight = Math.floor(this.height / this.pixelSize);

        for (let dy = -damageRadius; dy <= damageRadius; dy++) {
            for (let dx = -damageRadius; dx <= damageRadius; dx++) {
                const targetY = localY + dy;
                const targetX = localX + dx;
                if (targetY >= 0 && targetY < pixelGridHeight && targetX >= 0 && targetX < pixelGridWidth) {
                    this.pixels[targetY][targetX] = false;
                }
            }
        }
         console.log("Barrier hit!"); // Placeholder
    }

    render(renderer: Renderer): void {
        // Render the barrier based on remaining pixels
        renderer.getContext().fillStyle = '#00FF00'; // Green color placeholder
        const pixelGridWidth = Math.floor(this.width / this.pixelSize);
        const pixelGridHeight = Math.floor(this.height / this.pixelSize);

        for (let y = 0; y < pixelGridHeight; y++) {
            for (let x = 0; x < pixelGridWidth; x++) {
                if (this.pixels[y][x]) {
                    // Draw each alive pixel
                    const pixelRenderX = this.position.x + x * this.pixelSize;
                    const pixelRenderY = this.position.y + y * this.pixelSize;
                    renderer.getContext().fillRect(pixelRenderX, pixelRenderY, this.pixelSize, this.pixelSize);
                }
            }
        }
    }

    getBounds(): Rectangle {
        // Return the overall barrier bounds for initial broadphase collision
        return new Rectangle(this.position.x, this.position.y, this.width, this.height);
    }

    // Check if a point (e.g., bullet tip) intersects with any alive pixel in the barrier
    checkPixelCollision(hitX: number, hitY: number): boolean {
        // Convert hit coordinates to local pixel coordinates
        const localX = Math.floor((hitX - this.position.x) / this.pixelSize);
        const localY = Math.floor((hitY - this.position.y) / this.pixelSize);

        const pixelGridWidth = Math.floor(this.width / this.pixelSize);
        const pixelGridHeight = Math.floor(this.height / this.pixelSize);

        // Check if the local coordinates are within the pixel grid bounds
        if (localY >= 0 && localY < pixelGridHeight && localX >= 0 && localX < pixelGridWidth) {
            // Check if the pixel at these coordinates is alive
            return this.pixels[localY][localX];
        }
        return false; // Hit point is outside the barrier pixel grid
    }

     isDestroyed(): boolean {
        const pixelGridWidth = Math.floor(this.width / this.pixelSize);
        const pixelGridHeight = Math.floor(this.height / this.pixelSize);

        for (let y = 0; y < pixelGridHeight; y++) {
            for (let x = 0; x < pixelGridWidth; x++) {
                if (this.pixels[y][x]) {
                    return false; // Still has some pixels left
                }
            }
        }
        return true; // All pixels destroyed
    }
}