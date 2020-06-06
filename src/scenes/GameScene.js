import Phaser from 'phaser';
import space from '../assets/space.png';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('game-scene');
    }

    preload() {
        this.load.image('space', space);
    }

    create() {
        let { width, height } = this.sys.game.canvas;
        this.bg = this.add.tileSprite(width / 2, height / 2, width * 1.5, width * 1.5, 'space').setOrigin(0.5, 0.5);
    }

    update(time, delta) {
        let perSecondFactor = delta / 1000;
        this.bg.tilePositionX -= perSecondFactor * 10;
        this.bg.tilePositionY -= perSecondFactor * 5;
        this.bg.angle = (this.bg.angle + 1 * perSecondFactor) % 360;
    }
}
