import Phaser from 'phaser';
import { IMAGES, BONUS_SPRITE } from '../constants';

/**
 * Bonus Types:
 *
 *
 * Shoot: (F)
 * - faster
 * - 1 / 3 / spread
 *
 * Lives (L):
 * + 1 up
 *
 * Speed of Player (U)
 * - increases horizontal speed
 *
 * Shield (S):
 * - invulnerable for some seconds
 *
 * Bad Bonus:
 *
 * - vertical speed increase
 * - freeze for 2 seconds
 * - foe shoot probability increase
 */

export const TYPES = {
    upgrade: 0,
    shield: 1,
    live: 2,
    shoot: 3,
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
        scene.load.spritesheet(BONUS_SPRITE, IMAGES.bonus, { frameWidth: 50, frameHeight: 34, endFrame: 3 });
    }

    applyBonus(playerObj) {
        switch (this.type) {
            case TYPES.live:
                playerObj.lives++;
                break;
            case TYPES.shoot:
                playerObj.increaseFire();
                break;
        }
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        let minY = this.scene.cameras.main.scrollY;
        let maxY = minY + this.scene.cameras.main.height;

        if (this.y > maxY + 35) {
            this.destroy(true);
        }
    }
}
