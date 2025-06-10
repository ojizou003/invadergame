import { Vector2 } from "../utils/Vector2";
import { Renderer } from "../graphics/Renderer";
import { FONT_CHAR_WIDTH, FONT_CHAR_HEIGHT, FONT_SPACING_X } from "../utils/Constants";

export class ScorePopup {
    position: Vector2;
    score: number;
    alive: boolean = true;
    private duration: number = 1000; // 表示時間 (ms)
    private elapsed: number = 0;

    constructor(x: number, y: number, score: number) {
        // スコア表示の中心を基準に位置を調整 (仮)
        const textWidth = score.toString().length * (FONT_CHAR_WIDTH + FONT_SPACING_X);
        this.position = new Vector2(x - textWidth / 2, y - FONT_CHAR_HEIGHT / 2);
        this.score = score;
    }

    update(deltaTime: number): void {
        if (!this.alive) return;

        this.elapsed += deltaTime;

        // 表示時間を超えたら非アクティブにする
        if (this.elapsed >= this.duration) {
            this.alive = false;
        }
    }

    render(renderer: Renderer): void {
        if (!this.alive) return;

        // ビットマップフォントでスコアを描画
        renderer.drawBitmapText(this.score.toString(), this.position.x, this.position.y, '#FFFFFF'); // 白で描画
    }
}