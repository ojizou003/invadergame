import { Renderer } from "../graphics/Renderer";

export class ScoreDisplay {
    private score: number = 0;
    private hiScore: number = 0; // TODO: Implement saving/loading high score

    constructor() {
        // Initialize score display positions/properties
    }

    addScore(points: number): void {
        this.score += points;
        if (this.score > this.hiScore) {
            this.hiScore = this.score;
        }
        console.log(`Current Score: ${this.score}, High Score: ${this.hiScore}`); // Debugging
    }

    render(renderer: Renderer): void {
        // ビットマップフォントでスコアとハイスコアを描画
        renderer.drawBitmapText(`SCORE<1>`, 10, 10); // SCORE<1> の位置
        renderer.drawBitmapText(this.score.toString().padStart(4, '0'), 10, 20); // スコアの値の位置
        renderer.drawBitmapText(`HI-SCORE`, 120, 10); // HI-SCORE の位置
        renderer.drawBitmapText(this.hiScore.toString().padStart(4, '0'), 120, 20); // ハイスコアの値の位置
    }
}