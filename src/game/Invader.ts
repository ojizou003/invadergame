import { Vector2 } from "../utils/Vector2";
import { Renderer } from "../graphics/Renderer"; // パス修正
import { Rectangle } from "../utils/Rectangle";
import { INVADER_SPRITES } from "../utils/Constants";

export enum InvaderType { // exportを追加
    Small = 30, // Points
    Medium = 20,
    Large = 10,
}

export class Invader {
    position: Vector2;
    type: InvaderType;
    alive: boolean = true;
    private currentFrame: number = 0; // 0 or 1 for animation
    private readonly width: number = 8;
    private readonly height: number = 8;

    constructor(type: InvaderType, x: number, y: number) {
        this.type = type;
        this.position = new Vector2(x, y);
    }

    // アニメーションフレームを更新
    setFrame(frame: number): void {
        this.currentFrame = frame % 2;
    }

    render(renderer: Renderer): void {
        if (!this.alive) return;

        let spriteData;
        switch(this.type) {
            case InvaderType.Small:
                spriteData = INVADER_SPRITES.SMALL[this.currentFrame];
                break;
            case InvaderType.Medium:
                spriteData = INVADER_SPRITES.MEDIUM[this.currentFrame];
                break;
            case InvaderType.Large:
                spriteData = INVADER_SPRITES.LARGE[this.currentFrame];
                break;
            default:
                return;
        }

        // スプライトを描画
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (spriteData[y][x]) {
                    renderer.drawRect(
                        this.position.x + x,
                        this.position.y + y,
                        1, 1, '#FFFFFF'
                    );
                }
            }
        }
    }

    getBounds(): Rectangle {
        return new Rectangle(this.position.x, this.position.y, this.width, this.height);
    }

    hit(): void {
        this.alive = false;
        // スコア加算処理はGameクラスで行う
    }

    // インベーダーの種類に応じた得点を返す
    getScoreValue(): number {
        return this.type; // InvaderType enumの値がそのまま得点
    }
}