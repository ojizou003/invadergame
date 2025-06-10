// Web Audio API を使用したサウンド生成エンジン
export class SoundEngine {
    private audioContext: AudioContext;

    constructor() {
        // AudioContextの作成 (ブラウザ互換性を考慮)
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // 短いビープ音を生成して再生
    private playBeep(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        // フェードアウト
        gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // 射撃音
    playShootSound(): void {
        this.playBeep(800, 0.1, 'square'); // 高めの短い音
    }

    // インベーダー移動音 (4段階)
    playInvaderMoveSound(step: number): void {
        const frequencies = [120, 100, 80, 60]; // 低い音から高い音へ (オリジナルとは逆かも？要確認)
        const frequency = frequencies[step % frequencies.length];
        this.playBeep(frequency, 0.05, 'square'); // 短い低音
    }

    // 爆発音 (短いノイズなど)
    playExplosionSound(): void {
        // TODO: より複雑な爆発音を実装
        this.playBeep(50, 0.2, 'sawtooth'); // 仮の爆発音
    }

    // UFO音 (連続的な音)
    playUFOSound(): void {
        // TODO: 連続的な音を実装
        this.playBeep(400, 0.5, 'sine'); // 仮のUFO音
    }

    // プレイヤー死亡音
    playPlayerDeathSound(): void {
        // TODO: オリジナルに近いプレイヤー死亡音を実装
        this.playBeep(100, 0.3, 'triangle'); // 仮のプレイヤー死亡音
    }

    // AudioContextを解放 (必要に応じて)
    close(): void {
        this.audioContext.close();
    }
}