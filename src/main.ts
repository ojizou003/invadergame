import { Game } from "./game/Game";

document.addEventListener("DOMContentLoaded", () => {
    const game = new Game("gameCanvas");
    game.start();
});