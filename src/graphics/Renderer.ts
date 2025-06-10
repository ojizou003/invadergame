import { Rectangle } from "../utils/Rectangle";
import { BITMAP_FONT, FONT_CHAR_WIDTH, FONT_CHAR_HEIGHT, FONT_SPACING_X } from "../utils/Constants"; // Constantsからインポート

export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private canvasWidth: number;
    private canvasHeight: number;

    constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
        this.ctx = ctx;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    clear(): void {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    drawRect(x: number, y: number, width: number, height: number, color: string): void {
        this.ctx.fillStyle = color;
        // ピクセルパーフェクト描画のため整数座標に丸める
        const pixelX = Math.floor(x);
        const pixelY = Math.floor(y);
        this.ctx.fillRect(pixelX, pixelY, width, height);
    }

    // ビットマップフォントでテキストを描画
    drawBitmapText(text: string, x: number, y: number, color: string = '#FFFFFF'): void {
        let currentX = x;
        const charHeight = FONT_CHAR_HEIGHT;
        const charSpacingX = FONT_SPACING_X;

        for (let i = 0; i < text.length; i++) {
            const char = text[i].toUpperCase(); // 大文字に変換
            const fontData = BITMAP_FONT[char as keyof typeof BITMAP_FONT];

            if (fontData) {
                for (let row = 0; row < charHeight; row++) {
                    for (let col = 0; col < FONT_CHAR_WIDTH; col++) {
                        if (fontData[row][col]) {
                            this.drawRect(
                                currentX + col,
                                y + row,
                                1, 1, color
                            );
                        }
                    }
                }
                currentX += FONT_CHAR_WIDTH + charSpacingX; // 次の文字の位置へ移動
            } else {
                // 定義されていない文字の場合はスペースとして扱う
                currentX += FONT_CHAR_WIDTH + charSpacingX;
            }
        }
    }

    // TODO: drawImageなどのメソッドを追加

    getContext(): CanvasRenderingContext2D {
        return this.ctx;
    }
}