import { Rectangle } from "../utils/Rectangle";
import { BITMAP_FONT, FONT_CHAR_WIDTH, FONT_CHAR_HEIGHT, FONT_SPACING_X } from "../utils/Constants"; // Constantsからインポート

export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private gameWidth: number; // ゲームの内部解像度 幅
    private gameHeight: number; // ゲームの内部解像度 高さ
    private canvasWidth: number; // 現在のCanvas要素の幅
    private canvasHeight: number; // 現在のCanvas要素の高さ

    constructor(ctx: CanvasRenderingContext2D, gameWidth: number, gameHeight: number) {
        this.ctx = ctx;
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        // 初期Canvasサイズは後で設定されるか、ここで取得する
        this.canvasWidth = ctx.canvas.width;
        this.canvasHeight = ctx.canvas.height;
    }

    // Canvas要素のサイズが変更された際に呼び出す
    setCanvasSize(width: number, height: number): void {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }

    clear(): void {
        // Canvas全体のクリアは現在のCanvasサイズを使用
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    drawRect(x: number, y: number, width: number, height: number, color: string): void {
        this.ctx.fillStyle = color;
        
        // ゲーム座標からCanvas座標への変換とスケーリング
        const scale = Math.min(this.canvasWidth / this.gameWidth, this.canvasHeight / this.gameHeight);
        const scaledWidth = this.gameWidth * scale;
        const scaledHeight = this.gameHeight * scale;
        const offsetX = (this.canvasWidth - scaledWidth) / 2;
        const offsetY = (this.canvasHeight - scaledHeight) / 2;

        const canvasX = offsetX + x * scale;
        const canvasY = offsetY + y * scale;
        const canvasWidth = width * scale;
        const canvasHeight = height * scale;

        // ピクセルパーフェクト描画のため整数座標に丸める (スケーリング後)
        const pixelX = Math.floor(canvasX);
        const pixelY = Math.floor(canvasY);
        const pixelWidth = Math.ceil(canvasX + canvasWidth) - pixelX;
        const pixelHeight = Math.ceil(canvasY + canvasHeight) - pixelY;

        // デバッグログ
        console.log(`drawRect - Canvas Coords: pixelX=${pixelX}, pixelY=${pixelY}, pixelWidth=${pixelWidth}, pixelHeight=${pixelHeight}, scale=${scale}, offsetX=${offsetX}, offsetY=${offsetY}`);

        this.ctx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);
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
                            // drawRect内でスケーリングと座標変換が行われる
                            this.drawRect(
                                currentX + col, // ゲーム座標でのX
                                y + row,      // ゲーム座標でのY
                                1, 1, color   // 1x1ピクセルの描画
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