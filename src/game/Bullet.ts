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

    constructor(x?: number, y?: number, vx?: number, vy?: number) {
        this.position = new Vector2(x || 0, y || 0);
        this.velocity = new Vector2(vx || 0, vy || 0);
        this.alive = (x !== undefined && y !== undefined); // 位置が指定されていれば生存状態
        // TODO: Load bullet sprite
        // this.sprite = { width: 1, height: 4 }; // Placeholder size (original: 1x4 pixels)
    }

    // プレイヤーの弾発射用
    fire(x: number, y: number, directionY: number): void {
        this.position.set(x - this.width / 2, y); // Adjust position to center bullet
        this.velocity.set(0, this.speed * directionY);
        this.alive = true;
    }

    // 速度を設定するメソッド
    setVelocity(vx: number, vy: number): void {
        this.velocity.set(vx, vy);
    }

    update(deltaTime: number): void {
        if (!this.alive) return;

        this.position.x += this.velocity.x * deltaTime / 1000;
        this.position.y += this.velocity.y * deltaTime / 1000;

        // Deactivate if out of bounds
        // 画面外に出たら非アクティブにする
        const canvasHeight = 256; // Constantsに移動しても良い
        const canvasWidth = 224; // Constantsに移動しても良い

        if (this.position.y < -this.height || this.position.y > canvasHeight ||
            this.position.x < -this.width || this.position.x > canvasWidth) {
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