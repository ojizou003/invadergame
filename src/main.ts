import { Game } from "./game/Game";

console.log("main.ts script started"); // デバッグログ

// Service Worker の登録
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        }).catch(error => {
            console.log('Service Worker registration failed:', error);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // ゲームの内部解像度
    const GAME_WIDTH = 224;
    const GAME_HEIGHT = 256;

    const game = new Game("gameCanvas"); // Gameクラスのコンストラクタは1つの引数しか受け取らない

    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;

    const resizeCanvas = () => {
        // Canvasの表示サイズに合わせて描画バッファサイズを更新
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        // Gameクラス経由でRendererに新しいCanvasサイズを通知
        game.setCanvasSize(canvas.width, canvas.height);
    };

    // 初期ロード時とウィンドウリサイズ時にCanvasサイズを調整
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    console.log("Calling game.start()"); // デバッグログ
    game.start();
    console.log("game.start() called"); // デバッグログ
});