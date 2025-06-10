import { Renderer } from "../graphics/Renderer"; // パス修正
import { Rectangle } from "../utils/Rectangle"; // パス修正
import { Invader } from "./Invader";
import { InvaderType } from "./Invader";

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


    constructor() {
        this.createInvaders();
        this.updateMoveInterval(); // Calculate initial move interval
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
        // 残存数に応じた移動間隔 (ms) - 参考値
        let interval = 1000; // 初期値 (55体)

        if (aliveCount <= 1) {
            interval = 50; // 1体以下で最速
        } else if (aliveCount <= 10) {
            interval = 100;
        } else if (aliveCount <= 20) {
            interval = 200;
        } else if (aliveCount <= 30) {
            interval = 400;
        } else if (aliveCount <= 40) {
            interval = 600;
        } else if (aliveCount <= 50) {
            interval = 800;
        }

        this.currentMoveInterval = interval;
        console.log("Alive Invaders: " + aliveCount + ", Move Interval: " + this.currentMoveInterval.toFixed(2) + "ms");
    }
}