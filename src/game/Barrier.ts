import { Vector2 } from "../utils/Vector2";
import { Rectangle } from "../utils/Rectangle";
import { Renderer } from "../graphics/Renderer";
import { BARRIER_PIXELS } from "../utils/Constants"; // 防御壁ピクセルデータをインポート

export class Barrier {
    position: Vector2;
    private width: number;
    private height: number;
    private pixelState: boolean[][]; // ピクセル単位の破壊管理 (true: 存在する, false: 破壊済み)
    // private destroyed: boolean = false; // このフラグは不要になる可能性が高い

    constructor(x: number, y: number, width: number, height: number) {
        this.position = new Vector2(x, y);
        this.width = width;
        this.height = height;
        
        // 初期ピクセルデータをコピーして使用
        // BARRIER_PIXELSは24x18を想定
        this.pixelState = BARRIER_PIXELS.map(row => [...row]);
    }

    // 指定されたワールド座標がバリアの描画ピクセルと衝突するか判定
    checkPixelCollision(pointX: number, pointY: number): boolean {
        // ワールド座標をバリアのローカルピクセル座標に変換
        const localX = Math.floor(pointX - this.position.x);
        const localY = Math.floor(pointY - this.position.y);

        // ローカル座標がバリアの範囲内かチェック
        if (localX >= 0 && localX < this.width && localY >= 0 && localY < this.height) {
            // そのピクセルがまだ「生きている」（破壊されていない）かチェック
            return this.pixelState[localY]?.[localX] === true;
        }
        return false; // ポイントがバリアの範囲外
    }

    // ヒットポイント周辺のピクセルを破壊（バリアのローカル座標を基準）
    takeDamage(pointX: number, pointY: number): void {
        const localX = Math.floor(pointX - this.position.x);
        const localY = Math.floor(pointY - this.position.y); // 修正

        // 小さな半径（例: 3x3 または 5x5 エリア）でピクセルを破壊
        const radius = 2; // 破壊サイズを調整
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const pixelY = localY + dy;
                const pixelX = localX + dx;

                // 破壊する前に範囲をチェック
                if (pixelX >= 0 && pixelX < this.width && pixelY >= 0 && pixelY < this.height) {
                    this.pixelState[pixelY][pixelX] = false;
                }
            }
        }
    }

    render(renderer: Renderer): void {
        // ピクセルデータに基づいてバリアを描画
        renderer.getContext().fillStyle = '#00FF00'; // バリアの色は緑
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.pixelState[y][x]) {
                    renderer.drawRect(
                        this.position.x + x,
                        this.position.y + y,
                        1, 1, '#00FF00' // バリアの色は緑
                    );
                }
            }
        }
    }

    getBounds(): Rectangle {
        return new Rectangle(this.position.x, this.position.y, this.width, this.height);
    }

    // 破壊されたピクセルがあるか（完全に破壊されたかどうかの判定に使用）
    isDestroyed(): boolean {
        // すべてのピクセルがfalse（破壊済み）ならtrueを返す
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.pixelState[y][x]) {
                    return false; // 生きているピクセルが見つかった
                }
            }
        }
        return true; // 生きているピクセルが見つからなかった（完全に破壊された）
    }
}