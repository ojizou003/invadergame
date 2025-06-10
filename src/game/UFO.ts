import { Vector2 } from "../utils/Vector2";
import { Renderer } from "../graphics/Renderer";
import { Rectangle } from "../utils/Rectangle";

export class UFO {
    position: Vector2;
    alive: boolean = false; // Initially not alive
    private speed: number = 50; // Pixels per second
    private width: number = 16; // Placeholder width (original: 16x8 pixels)
    private height: number = 8; // Placeholder height

    constructor() {
        // UFOは画面外から出現するため、初期位置はゲーム開始時には設定しない
        this.position = new Vector2(-this.width, 30); // 画面左外に出現
    }

    update(deltaTime: number): void {
        if (!this.alive) return;

        // 右方向に移動
        this.position.x += this.speed * (deltaTime / 1000);

        // 画面右端を超えたら非アクティブにする
        if (this.position.x > 224) {
            this.alive = false;
        }
    }

    render(renderer: Renderer): void {
        if (!this.alive) return;

        // TODO: UFOスプライトを描画
        renderer.drawRect(this.position.x, this.position.y, this.width, this.height, '#FF00FF'); // 紫色の矩形で仮描画
    }

    getBounds(): Rectangle {
        return new Rectangle(this.position.x, this.position.y, this.width, this.height);
    }

    // UFOが出現する際に呼び出すメソッド
    spawn(): void {
        this.alive = true;
        this.position.x = -this.width; // 画面左外にリセット
        // TODO: ランダムな出現タイミングと速度調整
    }

    // UFOが撃破された際に呼び出すメソッド
    hit(): number {
        this.alive = false;
        console.log("UFO hit!");
        // ランダムなスコアを返す (50, 100, 150, 300)
        const possibleScores = [50, 100, 150, 300];
        const randomIndex = Math.floor(Math.random() * possibleScores.length);
        return possibleScores[randomIndex];
    }
}