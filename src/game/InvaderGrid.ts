import { Renderer } from "../graphics/Renderer";
import { Rectangle } from "../utils/Rectangle";
import { Invader, InvaderType } from "./Invader";
import { Bullet } from "./Bullet"; // Bulletクラスをインポート
import { Barrier } from "./Barrier"; // Barrierクラスをインポート
import { Difficulty, DIFFICULTY_MULTIPLIERS } from "../utils/Constants"; // Difficulty, DIFFICULTY_MULTIPLIERSをインポート

export class InvaderGrid {
    private invaders: Invader[][] = [];
    private rows = 5;
    private cols = 11;
    private invaderSpacing = { x: 12, y: 12 };
    private startX = 30;
    private startY = 50;

    private direction: number = 1; // 1: right, -1: left
    private moveDistanceX: number = 8; // Horizontal move distance in pixels per step
    private dropDistanceY: number = 16; // Vertical drop distance in pixels
    private timeSinceLastMove = 0;
    private baseMoveInterval = 1000; // Milliseconds per move step (slower initially)
    private currentMoveInterval = this.baseMoveInterval;
    private horizontalMoveTimer = 0;
    private moveToggle = 0; // Used to alternate sprite frames for animation

    private shootTimer = 0; // インベーダーの弾発射用タイマー
    private readonly BASE_SHOOT_INTERVAL = 1000; // 弾発射の基本間隔 (ms)
    private currentShootInterval = this.BASE_SHOOT_INTERVAL; // 現在の弾発射間隔
    private timeSinceLastShoot = 0; // 最後に弾を発射してからの時間

    private spawnedBullets: Bullet[] = []; // 発射された弾を一時的に保持するリスト
    private difficulty: Difficulty; // 難易度レベルを保持

    constructor(difficulty: Difficulty) {
        this.difficulty = difficulty; // 難易度を設定
        this.createInvaders();
        this.resetShootTimer(); // 最初の弾発射タイマーを設定
        this.updateMoveInterval(); // Calculate initial move interval based on difficulty
    }

    private createInvaders(): void {
        for (let row = 0; row < this.rows; row++) {
            this.invaders[row] = [];
            let invaderType = InvaderType.Large;
            if (row === 0) {
                invaderType = InvaderType.Small;
            } else if (row < 3) {
                invaderType = InvaderType.Medium;
            } else {
                 invaderType = InvaderType.Large;
            }

            for (let col = 0; col < this.cols; col++) {
                const x = this.startX + col * this.invaderSpacing.x;
                const y = this.startY + row * this.invaderSpacing.y;
                this.invaders[row][col] = new Invader(invaderType, x, y);
            }
        }
    }

    update(deltaTime: number): void {
        this.timeSinceLastMove += deltaTime;
        this.horizontalMoveTimer += deltaTime;
        this.timeSinceLastShoot += deltaTime; // 弾発射タイマーを更新

        // Check if it's time for the invaders to move horizontally
        if (this.horizontalMoveTimer >= this.currentMoveInterval) {
            this.moveHorizontal();
            this.horizontalMoveTimer = 0; // Reset timer
            this.moveToggle = 1 - this.moveToggle; // Toggle animation frame
            // Update animation frame for all alive invaders
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    if (this.invaders[row][col].alive) {
                        this.invaders[row][col].setFrame(this.moveToggle);
                    }
                }
            }
        }

        // Check if it's time for an invader to shoot
        if (this.timeSinceLastShoot >= this.currentShootInterval) {
            this.attemptToShoot(); // 弾発射を試みる
            this.resetShootTimer(); // 次の弾発射タイマーを設定
        }

        // Individual invader update is not needed for movement in this grid-based system.
        // Keep if needed for other per-invader logic (like shooting).
        // for (let row = 0; row < this.rows; row++) {
        //     for (let col = 0; col < this.cols; col++) {
        //         if (this.invaders[row][col].alive) {
        //             this.invaders[row][col].update(deltaTime);
        //         }
        //     }
        // }
    }

    private moveHorizontal(): void {
        let hitBoundary = false;
        // Move all alive invaders horizontally in the current direction
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const invader = this.invaders[row][col];
                if (invader.alive) {
                    invader.position.x += this.moveDistanceX * this.direction;

                    // Check if any invader hit the screen boundary (224 pixels width)
                    if (invader.position.x < 0 || invader.position.x + invader.getBounds().width > 224) {
                        hitBoundary = true;
                    }
                }
            }
        }

        // If any invader hit the boundary, drop down and reverse direction
        if (hitBoundary) {
            this.dropDown();
            this.direction *= -1; // Reverse direction
            this.updateMoveInterval(); // Update speed after dropping/reversing
        }
    }

    private dropDown(): void {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const invader = this.invaders[row][col];
                if (invader.alive) {
                    invader.position.y += this.dropDistanceY;
                }
            }
        }
        // TODO: Check for game over if invaders reach the bottom after dropping (判定はGameクラスで行う)
    }

    // インベーダーが画面最下端に到達したか判定
    hasReachedBottom(): boolean {
        const canvasHeight = 256; // Canvasの高さ (Constantsに移動しても良い)
        const invaderHeight = 8; // インベーダーの高さ (Constantsに移動しても良い)

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const invader = this.invaders[row][col];
                if (invader.alive && invader.position.y + invaderHeight >= canvasHeight) {
                    return true; // いずれかのインベーダーが最下端に到達
                }
            }
        }
        return false; // どのインベーダーも最下端に到達していない
    }

    render(renderer: Renderer): void {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.invaders[row][col].alive) {
                    this.invaders[row][col].render(renderer);
                }
            }
        }
    }

    // Check for collision with a bullet's bounds
    checkBulletCollision(bulletBounds: Rectangle): Invader | null {
        // Iterate through invaders to check for intersection
        // Check from bottom to top for more accurate classic invader behavior (lowest invader in a column is hit first)
        for (let col = 0; col < this.cols; col++) {
            for (let row = this.rows - 1; row >= 0; row--) { // Iterate rows from bottom up
                const invader = this.invaders[row][col];
                if (invader.alive && invader.getBounds().intersects(bulletBounds)) {
                    return invader; // Return the first living invader that was hit
                }
            }
        }
        return null; // No invader was hit
    }

    // Check for collision with barriers and damage them
    checkBarrierCollision(barriers: Barrier[]): void {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const invader = this.invaders[row][col];
                if (invader.alive) {
                    const invaderBounds = invader.getBounds();
                    for (const barrier of barriers) {
                        // Check if invader bounds intersect with barrier bounds
                        if (barrier.getBounds().intersects(invaderBounds)) {
                            // If they intersect, check pixel-by-pixel within the invader's bounds
                            // to see which barrier pixels are hit.
                            for (let y = Math.floor(invaderBounds.y); y < Math.ceil(invaderBounds.y + invaderBounds.height); y++) {
                                for (let x = Math.floor(invaderBounds.x); x < Math.ceil(invaderBounds.x + invaderBounds.width); x++) {
                                    // Check if this pixel is within the barrier's bounds and is still "alive"
                                    if (barrier.getBounds().contains(x, y) && barrier.checkPixelCollision(x, y)) {
                                        // If it is, damage the barrier at this pixel location
                                        barrier.takeDamage(x, y);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Calculate the current number of alive invaders
    private countAliveInvaders(): number {
        let count = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.invaders[row][col].alive) {
                    count++;
                }
            }
        }
        return count;
    }

    // Update the movement interval based on the number of alive invaders
    private updateMoveInterval(): void {
        const aliveCount = this.countAliveInvaders();
        // オリジナルのスペースインベーダーの速度変化を模倣
        // 残存数に応じた基本移動間隔 (ms) - 参考値
        let baseInterval = 1000; // 初期値 (55体)

        if (aliveCount <= 1) {
            baseInterval = 50; // 1体以下で最速
        } else if (aliveCount <= 10) {
            baseInterval = 100;
        } else if (aliveCount <= 20) {
            baseInterval = 200;
        } else if (aliveCount <= 30) {
            baseInterval = 400;
        } else if (aliveCount <= 40) {
            baseInterval = 600;
        } else if (aliveCount <= 50) {
            baseInterval = 800;
        }

        // 難易度に応じた倍率を適用
        const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[this.difficulty].invaderMoveInterval;
        this.currentMoveInterval = baseInterval * difficultyMultiplier;

        console.log("Alive Invaders: " + aliveCount + ", Move Interval: " + this.currentMoveInterval.toFixed(2) + "ms" + " (Difficulty: " + Difficulty[this.difficulty] + ")");
    }

    // ランダムなインベーダーに弾を発射させる
    private attemptToShoot(): void {
        const aliveInvaders: { row: number, col: number }[] = [];
        // 生きているインベーダーの中で、各列の最下段のインベーダーを探す
        const lowestInvaders: { row: number, col: number }[] = [];
        for (let col = 0; col < this.cols; col++) {
            for (let row = this.rows - 1; row >= 0; row--) {
                if (this.invaders[row][col].alive) {
                    lowestInvaders.push({ row, col });
                    break; // その列の最下段を見つけたら次の列へ
                }
            }
        }

        if (lowestInvaders.length === 0) {
            return; // 生きているインベーダーがいない
        }

        // 最下段のインベーダーの中からランダムに1体選ぶ
        const randomIndex = Math.floor(Math.random() * lowestInvaders.length);
        const shooter = this.invaders[lowestInvaders[randomIndex].row][lowestInvaders[randomIndex].col];

        // 弾を生成し、リストに追加
        const bullet = new Bullet(shooter.position.x + shooter.getBounds().width / 2, shooter.position.y + shooter.getBounds().height);
        bullet.setVelocity(0, 5); // 下向きに速度を設定 (仮)
        this.spawnedBullets.push(bullet);
        console.log(`Invader at [${lowestInvaders[randomIndex].row}, ${lowestInvaders[randomIndex].col}] shot a bullet.`);
    }

    // 次の弾発射までの時間をランダムに設定
    private resetShootTimer(): void {
        // 基本の発射間隔に難易度に応じた倍率とランダム性を適用
        const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[this.difficulty].invaderShootInterval;
        // ランダムな間隔を基本間隔に加算 (例: 基本間隔の0%から100%の間でランダムに加算)
        const randomDelay = Math.random() * this.BASE_SHOOT_INTERVAL;
        this.currentShootInterval = (this.BASE_SHOOT_INTERVAL + randomDelay) * difficultyMultiplier;
        this.timeSinceLastShoot = 0;
        console.log("Next invader shoot interval: " + this.currentShootInterval.toFixed(2) + "ms" + " (Difficulty: " + Difficulty[this.difficulty] + ")");
    }

    // Gameクラスから呼び出して、発射された弾のリストを取得するメソッド
    getInvaderBullets(): Bullet[] {
        const bullets = [...this.spawnedBullets];
        this.spawnedBullets = []; // リストをクリア
        return bullets;
    }
}