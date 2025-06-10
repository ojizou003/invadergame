import { Vector2 } from "../utils/Vector2";
import { Renderer } from "../graphics/Renderer";
import { EXPLOSION_SPRITES, EXPLOSION_FRAME_DURATION, EXPLOSION_WIDTH, EXPLOSION_HEIGHT } from "../utils/Constants";

export class Explosion {
    position: Vector2;
    alive: boolean = true;
    private currentFrameIndex: number = 0;
    private timeSinceLastFrame: number = 0;
    private readonly totalFrames: number = EXPLOSION_SPRITES.length;
    private readonly frameDuration: number = EXPLOSION_FRAME_DURATION; // ms
    private readonly width: number = EXPLOSION_WIDTH;
    private readonly height: number = EXPLOSION_HEIGHT;

    constructor(x: number, y: number) {
        // 爆発の中心を基準に位置を調整
        this.position = new Vector2(x - this.width / 2, y - this.height / 2);
    }

    update(deltaTime: number): void {
        if (!this.alive) return;

        this.timeSinceLastFrame += deltaTime;

        // フレームを進める
        if (this.timeSinceLastFrame >= this.frameDuration) {
            this.currentFrameIndex++;
            this.timeSinceLastFrame = 0;

            // 全フレーム表示したら非アクティブにする
            if (this.currentFrameIndex >= this.totalFrames) {
                this.alive = false;
            }
        }
    }

    render(renderer: Renderer): void {
        if (!this.alive) return;

        const spriteData = EXPLOSION_SPRITES[this.currentFrameIndex];

        // スプライトを描画
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (spriteData[y]?.[x]) { // 範囲外アクセスを防ぐ
                    renderer.drawRect(
                        this.position.x + x,
                        this.position.y + y,
                        1, 1, '#FFFFFF' // 爆発の色は白
                    );
                }
            }
        }
    }
}