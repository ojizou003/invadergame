export class Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    // Basic AABB collision detection
    intersects(other: Rectangle): boolean {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }

    // Check if a point is inside the rectangle
    contains(x: number, y: number): boolean {
        return x >= this.x &&
               x < this.x + this.width &&
               y >= this.y &&
               y < this.y + this.height;
    }
}