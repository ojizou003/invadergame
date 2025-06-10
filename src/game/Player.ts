import { Vector2 } from "../utils/Vector2";
import { Renderer } from "../graphics/Renderer";
import { Rectangle } from "../utils/Rectangle"; // Assuming a Rectangle class for bounds
import { Bullet } from "./Bullet"; // Import Bullet

export class Player {
    position: Vector2;
    private speed = 100; // Player movement speed (pixels per second)
    private sprite: any; // Placeholder for sprite object
    private shooting = false;
    private shootCooldown = 0.5; // seconds
    private timeSinceLastShot = 0;
    private bullet: Bullet; // Player's bullet
    private width: number = 13; // Placeholder width (original: 13x8 pixels)
    private height: number = 8; // Placeholder height
    private lives: number = 3; // プレイヤーの残機
    private isHit: boolean = false; // 被弾状態フラグ
    private hitTimer: number = 0; // 被弾後の無敵時間タイマー
    private readonly HIT_COOLDOWN: number = 2000; // 被弾後の無敵時間 (ms)

    constructor(x: number, y: number, bullet: Bullet) {
        this.position = new Vector2(x, y);
        this.bullet = bullet; // Assign the bullet instance
        // TODO: Load player sprite
        // this.sprite = { width: 13, height: 8 }; // Placeholder size (original: 13x8 pixels)
    }

    update(deltaTime: number, input: any): void {
        // 無敵時間中の処理
        if (this.isHit) {
            this.hitTimer += deltaTime;
            if (this.hitTimer >= this.HIT_COOLDOWN) {
                this.isHit = false;
                this.hitTimer = 0;
            }
            // 無敵時間中は移動と射撃のみ可能、描画は点滅させるなど後で実装
        }

        // Handle movement input (apply speed with deltaTime)
        if (input.isKeyDown('ArrowLeft') || input.isKeyDown('a')) {
            this.position.x -= this.speed * deltaTime / 1000;
        }
        if (input.isKeyDown('ArrowRight') || input.isKeyDown('d')) {
            this.position.x += this.speed * deltaTime / 1000;
        }

        // Clamp player position to screen bounds (assuming 224x256 canvas)
        this.position.x = Math.max(0, Math.min(this.position.x, 224 - this.width));

        // Handle shooting input
        this.timeSinceLastShot += deltaTime / 1000; // Convert ms to seconds
        // Only shoot if bullet is not alive and cooldown is ready
        if (!this.bullet.alive && (input.isKeyDown(' ') || input.isKeyDown('Space')) && this.timeSinceLastShot >= this.shootCooldown) {
            this.shoot();
            this.timeSinceLastShot = 0;
        }
    }

    render(renderer: Renderer): void {
        // TODO: Draw player sprite (無敵時間中は点滅させるなど)
        // 仮の描画: 無敵時間中は半透明にする
        const originalAlpha = renderer.getContext().globalAlpha;
        if (this.isHit) {
            renderer.getContext().globalAlpha = 0.5 + Math.sin(this.hitTimer / 50) * 0.5; // 点滅効果
        }
        renderer.drawRect(this.position.x, this.position.y, this.width, this.height, '#00FF00'); // Draw a green rectangle placeholder
        renderer.getContext().globalAlpha = originalAlpha; // アルファ値を戻す
    }

    getBounds(): Rectangle {
        return new Rectangle(this.position.x, this.position.y, this.width, this.height);
    }

    shoot(): void {
        console.log("Player shoots!");
        // Fire the bullet from the player's position (adjust offset as needed)
        // Bullet starts from the top center of the player
        this.bullet.fire(this.position.x + this.width / 2, this.position.y, -1); // -1 for upwards direction
    }

    // Method to call when player is hit
    hit(): void {
        if (this.isHit) return; // 無敵時間中は被弾しない

        this.lives--;
        this.isHit = true;
        this.hitTimer = 0;
        console.log("Player hit! Lives remaining: " + this.lives);

        // 残機が0になったらゲームオーバー
        if (this.lives <= 0) {
            // TODO: ゲームオーバー状態への遷移をGameクラスに通知
            console.log("Game Over!");
        }
    }

    getLives(): number {
        return this.lives;
    }
}