import Phaser from 'phaser';
import Bullet from './Bullet.js';
import { BULLET_SPRITE } from '../constants';

export default class Bullets extends Phaser.GameObjects.Group {
    constructor(scene, nrOfBullets = 16, velocity = -400) {
        super(scene);

        this.createMultiple({
            frameQuantity: nrOfBullets,
            key: BULLET_SPRITE,
            active: false,
            visible: false,
            classType: Bullet,
        });

        this.lastShoot = 0;
        this.fireRate = 2; // per second
        this.propertyValueSet('velocity', velocity);
    }

    static preload(scene) {
        Bullet.preload(scene);
    }

    set fireRate(ratePerSec) {
        this.fireDelay = 1000 / ratePerSec;
    }

    get fireRate() {
        if (this.fireDelay > 0) {
            return 1000 / this.fireDelay;
        }
        return 1;
    }

    fireBullet(x, y, time) {
        if (time - this.lastShoot > this.fireDelay) {
            this.lastShoot = time;
            let bullet = this.getFirstDead(false);

            if (bullet) {
                bullet.fire(x, y);
            }
        }
    }
}
