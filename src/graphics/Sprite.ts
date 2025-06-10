import { Renderer } from "./Renderer";

export class Sprite {
    // Placeholder class for sprite management
    // Will be used later for drawing actual invader/player images
    private image: HTMLImageElement | null = null;
    public width: number = 0;
    public height: number = 0;

    constructor(src: string) {
        this.image = new Image();
        this.image.onload = () => {
            this.width = this.image!.width;
            this.height = this.image!.height;
        };
        this.image.src = src;
    }

    // Basic draw method - will be more sophisticated later
    draw(renderer: Renderer, x: number, y: number): void {
        if (this.image && this.image.complete) {
            // Ensure drawing at integer coordinates for pixel-perfect rendering
            const pixelX = Math.floor(x);
            const pixelY = Math.floor(y);
            renderer.getContext().drawImage(this.image, pixelX, pixelY, this.width, this.height);
        }
    }
}