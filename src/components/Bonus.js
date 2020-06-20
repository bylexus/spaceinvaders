import Phaser from 'phaser';
import { IMAGES, BONUS_SPRITE } from '../constants';

export const TYPES = {
    upgrade: 0,
    shield: 1,
    live: 2,
};

export default class Foe extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, { type }) {
        super(scene, x, y, BONUS_SPRITE, type);
        // Needed to init scene and physics:
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setVelocityY(150);
        this.type = type;
    }

    static preload(scene) {
        scene.load.spritesheet(BONUS_SPRITE, IMAGES.bonus, { frameWidth: 50, frameHeight: 34, endFrame: 2 });
    }

    applyBonus(playerObj) {
        switch (this.type) {
            case TYPES.live:
                playerObj.lives++;
                break;
        }
    }

    preUpdate(time, delta) {
        let { height } = this.scene.sys.game.canvas;
        super.preUpdate(time, delta);
        if (this.y > height + 34) {
            this.destroy(true);
        }
    }
}
