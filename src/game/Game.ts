import { Renderer } from "../graphics/Renderer";
import { InputManager } from "../input/InputManager";
import { Player } from "./Player";
import { InvaderGrid } from "./InvaderGrid";
import { Bullet } from "./Bullet";
import { Barrier } from "./Barrier";
import { Rectangle } from "../utils/Rectangle";
import { UFO } from "./UFO"; // UFOクラスをインポート
import { ScoreDisplay } from "./ScoreDisplay"; // ScoreDisplayクラスをインポート
import { GameState } from "../utils/Constants"; // GameState enumをインポート
import { SoundEngine } from "../audio/SoundEngine"; // SoundEngineクラスをインポート
import { Explosion } from "./Explosion"; // Explosionクラスをインポート
import { ScorePopup } from "./ScorePopup"; // ScorePopupクラスをインポート

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private renderer: Renderer;
    private inputManager: InputManager;
    private player: Player;
    private invaderGrid: InvaderGrid;
    private playerBullet: Bullet; // Player's bullet instance
    private barriers: Barrier[] = []; // Array to hold barrier instances
    private ufo: UFO; // UFOインスタンスを追加
    private scoreDisplay: ScoreDisplay; // ScoreDisplayインスタンスを追加
    private soundEngine: SoundEngine; // SoundEngineインスタンスを追加
    private explosions: Explosion[] = []; // 爆発エフェクトのリストを追加
    private scorePopups: ScorePopup[] = []; // スコアポップアップのリストを追加
    private invaderBullets: Bullet[] = []; // インベーダーの弾のリストを追加

    private ufoSpawnTimer: number = 0; // UFO出現用タイマー
    private readonly UFO_SPAWN_INTERVAL_MIN: number = 15000; // UFO出現最小間隔 (ms)
    private readonly UFO_SPAWN_INTERVAL_MAX: number = 30000; // UFO出現最大間隔 (ms)
    private nextUfoSpawnTime: number = 0; // 次回UFO出現までの時間

    private lastTime = 0;
    private readonly TARGET_FPS = 60;
    private readonly FRAME_TIME = 1000 / this.TARGET_FPS;

    private gameState: GameState = GameState.PLAYING; // ゲーム状態を追加

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;
        // Set canvas size based on original specs
        this.canvas.width = 224;
        this.canvas.height = 256;

        // Rendererにcanvasサイズを渡す
        this.renderer = new Renderer(this.ctx, this.canvas.width, this.canvas.height);
        this.inputManager = new InputManager();
        this.soundEngine = new SoundEngine(); // SoundEngineインスタンスを作成
        
        // Create game objects
        this.playerBullet = new Bullet(); // Create player's bullet
        this.player = new Player(224 / 2, 256 - 20, this.playerBullet); // Center horizontally, near bottom
        this.invaderGrid = new InvaderGrid();
        this.ufo = new UFO(); // UFOインスタンスを作成
        this.scoreDisplay = new ScoreDisplay(); // ScoreDisplayインスタンスを作成

        // Create barriers (placeholder positions and sizes)
        const barrierWidth = 24;
        const barrierHeight = 18;
        const numberOfBarriers = 4;
        const totalBarrierWidth = numberOfBarriers * barrierWidth + (numberOfBarriers - 1) * 40; // 40 is spacing
        const startX = (224 - totalBarrierWidth) / 2; // Center the group of barriers
        const barrierY = 256 - 60;

        for (let i = 0; i < numberOfBarriers; i++) {
            const barrierX = startX + i * (barrierWidth + 40);
            this.barriers.push(new Barrier(barrierX, barrierY, barrierWidth, barrierHeight));
        }
    }

    start(): void {
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    private gameLoop(currentTime: number): void {
        const deltaTime = currentTime - this.lastTime;

        if (deltaTime >= this.FRAME_TIME) {
            this.update(deltaTime);
            this.render();
            this.lastTime = currentTime;
        }

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    private update(deltaTime: number): void {
        // ゲームオーバー状態でのリスタートチェック
        if (this.gameState === GameState.GAME_OVER) {
            if (this.inputManager.isKeyDown('r')) { // Rキーでリスタート
                this.resetGame();
            }
            return; // ゲームオーバー中は更新しない
        }

        if (this.gameState !== GameState.PLAYING) {
            // ゲームプレイ中以外は更新しない (ゲームオーバー以外にも状態が増える可能性を考慮)
            return;
        }

        // Update game objects
        this.player.update(deltaTime, this.inputManager);
        this.invaderGrid.update(deltaTime);
        this.playerBullet.update(deltaTime);
        this.ufo.update(deltaTime); // UFOを更新

        // インベーダーの弾を更新
        this.invaderBullets.forEach(bullet => bullet.update(deltaTime));
        // 画面外に出たインベーダーの弾を削除
        this.invaderBullets = this.invaderBullets.filter(bullet => bullet.alive);

        // InvaderGridから新しく発射された弾を取得して追加
        const newInvaderBullets = this.invaderGrid.getInvaderBullets();
        this.invaderBullets.push(...newInvaderBullets);


        // UFO出現ロジック
        if (!this.ufo.alive) {
            this.ufoSpawnTimer += deltaTime;
            if (this.ufoSpawnTimer >= this.nextUfoSpawnTime) {
                this.ufo.spawn();
                this.ufoSpawnTimer = 0;
                this.nextUfoSpawnTime = Math.random() * (this.UFO_SPAWN_INTERVAL_MAX - this.UFO_SPAWN_INTERVAL_MIN) + this.UFO_SPAWN_INTERVAL_MIN;
            }
        }

        // Check for collisions
        this.checkCollisions();

        // Check for invader-barrier collisions and damage barriers
        this.invaderGrid.checkBarrierCollision(this.barriers);

        // Remove destroyed barriers
        this.barriers = this.barriers.filter(barrier => !barrier.isDestroyed());


        // 爆発エフェクトの更新と不要なエフェクトの削除
        this.explosions.forEach(explosion => explosion.update(deltaTime));
        this.explosions = this.explosions.filter(explosion => explosion.alive);

        // スコアポップアップの更新と不要なポップアップの削除
        this.scorePopups.forEach(popup => popup.update(deltaTime));
        this.scorePopups = this.scorePopups.filter(popup => popup.alive);

        // 敗北条件判定
        if (this.invaderGrid.hasReachedBottom() || this.player.getLives() <= 0) {
            this.gameState = GameState.GAME_OVER; // ゲームオーバー状態へ遷移
            console.log("Game Over!");
        }

        // TODO: Check for win condition (all invaders killed)
    }

    private render(): void {
        // Clear canvas
        this.renderer.clear();

        // ゲーム状態に応じた描画
        switch (this.gameState) {
            case GameState.PLAYING:
                // ゲームプレイ中の描画
                this.player.render(this.renderer);
                this.invaderGrid.render(this.renderer);
                this.playerBullet.render(this.renderer);
                this.invaderBullets.forEach(bullet => bullet.render(this.renderer)); // インベーダーの弾を描画
                this.barriers.forEach(barrier => barrier.render(this.renderer));
                this.ufo.render(this.renderer); // UFOを描画

                // 爆発エフェクトを描画
                this.explosions.forEach(explosion => explosion.render(this.renderer));

                // スコアポップアップを描画
                this.scorePopups.forEach(popup => popup.render(this.renderer));

                // スコア表示
                this.scoreDisplay.render(this.renderer);

                // 残機表示 (画面左下)
                const livesText = `LIVES ${this.player.getLives()}`;
                this.renderer.drawBitmapText(livesText, 10, 240); // 仮の位置
                break;

            case GameState.GAME_OVER:
                // ゲームオーバー画面の描画
                this.renderer.drawBitmapText("GAME OVER", 70, 120); // 仮の表示位置
                this.scoreDisplay.render(this.renderer); // ゲームオーバー画面でもスコアは表示
                this.renderer.drawBitmapText("PRESS 'R' TO RESTART", 30, 140); // リスタート指示
                break;

            // TODO: 他のゲーム状態 (MENU, PAUSED) の描画
        }
    }

    private checkCollisions(): void {
        // Player bullet vs Invaders
        if (this.playerBullet.alive) {
            const hitInvader = this.invaderGrid.checkBulletCollision(this.playerBullet.getBounds());
            if (hitInvader) {
                this.playerBullet.hit();
                hitInvader.hit();
                // スコア加算
                this.scoreDisplay.addScore(hitInvader.getScoreValue());
                this.soundEngine.playExplosionSound(); // 爆発音再生
                // 爆発エフェクト生成
                this.explosions.push(new Explosion(hitInvader.position.x + hitInvader.getBounds().width / 2, hitInvader.position.y + hitInvader.getBounds().height / 2));
            }
        }

        // Player bullet vs Barriers
        if (this.playerBullet.alive) {
             for (const barrier of this.barriers) {
                if (barrier.getBounds().intersects(this.playerBullet.getBounds())) {
                     // Check pixel-perfect collision with the barrier
                     // Find the point on the barrier the bullet hit (approximate)
                     const hitX = this.playerBullet.position.x + this.playerBullet.getBounds().width / 2;
                     const hitY = this.playerBullet.position.y;

                     if (barrier.checkPixelCollision(hitX, hitY)) {
                        barrier.takeDamage(hitX, hitY);
                        this.playerBullet.hit();
                        // TODO: バリア破壊音
                        // TODO: バリア破壊エフェクト
                        break; // Bullet can only hit one barrier
                     }
                }
            }
        }

        // Player bullet vs UFO
        if (this.playerBullet.alive && this.ufo.alive) {
            if (this.ufo.getBounds().intersects(this.playerBullet.getBounds())) {
                this.playerBullet.hit();
                const score = this.ufo.hit();
                // スコア加算
                this.scoreDisplay.addScore(score);
                this.soundEngine.playUFOSound(); // UFO音再生 (撃破時だが、仮で)
                // 爆発エフェクト生成
                this.explosions.push(new Explosion(this.ufo.position.x + this.ufo.getBounds().width / 2, this.ufo.position.y + this.ufo.getBounds().height / 2));
                // スコアポップアップ生成
                this.scorePopups.push(new ScorePopup(this.ufo.position.x + this.ufo.getBounds().width / 2, this.ufo.position.y + this.ufo.getBounds().height / 2, score));
            }
        }

        // Invader bullets vs Player
        for (const invaderBullet of this.invaderBullets) {
            if (invaderBullet.alive && this.player.getBounds().intersects(invaderBullet.getBounds())) {
                invaderBullet.hit();
                this.player.hit(); // プレイヤーが被弾
                this.soundEngine.playPlayerDeathSound(); // プレイヤー死亡音再生 (TODO: 要実装)
                // TODO: プレイヤー被弾エフェクト
                break; // Player can only be hit by one bullet at a time (simplification)
            }
        }

        // Invader bullets vs Barriers
        for (const invaderBullet of this.invaderBullets) {
            if (invaderBullet.alive) {
                for (const barrier of this.barriers) {
                    if (barrier.getBounds().intersects(invaderBullet.getBounds())) {
                        // Check pixel-perfect collision
                        const hitX = invaderBullet.position.x + invaderBullet.getBounds().width / 2;
                        const hitY = invaderBullet.position.y + invaderBullet.getBounds().height; // Check bottom of invader bullet

                        if (barrier.checkPixelCollision(hitX, hitY)) {
                            barrier.takeDamage(hitX, hitY);
                            invaderBullet.hit();
                            // TODO: バリア破壊音
                            // TODO: バリア破壊エフェクト
                            break; // Bullet can only hit one barrier
                        }
                    }
                }
            }
        }


        // TODO: Invaders vs Player (game over condition)
        // TODO: Invaders vs Barriers
    }

    // ゲームの状態を初期化してリスタート
    private resetGame(): void {
        console.log("Resetting Game...");
        this.gameState = GameState.PLAYING; // ゲーム状態をプレイ中に戻す

        // ゲームオブジェクトを初期状態に戻す
        // 既存のインスタンスを再利用または新しく作成
        this.player = new Player(224 / 2, 256 - 20, this.playerBullet); // プレイヤーを初期位置に戻す (新しいインスタンスを作成)
        this.invaderGrid = new InvaderGrid(); // インベーダーグリッドを再作成
        this.ufo = new UFO(); // UFOを再作成
        this.scoreDisplay = new ScoreDisplay(); // スコアディスプレイを再作成 (スコアがリセットされる)

        // バリアを再作成
        this.barriers = []; // 既存のバリアをクリア
        const barrierWidth = 24;
        const barrierHeight = 18;
        const numberOfBarriers = 4;
        const totalBarrierWidth = numberOfBarriers * barrierWidth + (numberOfBarriers - 1) * 40;
        const startX = (224 - totalBarrierWidth) / 2;
        const barrierY = 256 - 60;
        for (let i = 0; i < numberOfBarriers; i++) {
            const barrierX = startX + i * (barrierWidth + 40);
            this.barriers.push(new Barrier(barrierX, barrierY, barrierWidth, barrierHeight));
        }

        // 必要に応じてタイマーなどもリセット
        this.ufoSpawnTimer = 0;
        this.nextUfoSpawnTime = Math.random() * (this.UFO_SPAWN_INTERVAL_MAX - this.UFO_SPAWN_INTERVAL_MIN) + this.UFO_SPAWN_INTERVAL_MIN;

        // 爆発エフェクトリストをクリア
        this.explosions = [];

        // スコアポップアップリストをクリア
        this.scorePopups = [];

        // インベーダーの弾リストをクリア
        this.invaderBullets = [];

        // TODO: サウンドのリセットなど
    }
}