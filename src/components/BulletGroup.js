import Phaser from 'phaser';
import Bullet from './Bullet';
import { IMAGES, BULLET_SPRITE } from '../constants';

export default class BulletGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene, nrOfBullets, rotation = 0) {
        super(scene.physics.world, scene);
        // Needed to init scene and physics:
        // scene.add.existing(this);
        // scene.physics.add.existing(this);

        this.velocity = 400;

        this.createMultiple({
            quantity: nrOfBullets,
            key: BULLET_SPRITE,
            active: false,
            visible: false,
            setRotation: { value: rotation },
            classType: Bullet,
        });
    }

    static preload(scene) {
        Bullet.preload(scene);
    }

    fireBullet(x, y, time) {
        let bullet = this.getFirstDead(false, x, y);
        if (bullet) {
            bullet.velocity = this.velocity;
            bullet.fire(x, y);
            return bullet;
        }
        return null;
    }
}

let foeBulletGroup = null;
let playerBulletGroup = null;

export function getFoeBulletGroup(scene) {
    if (!foeBulletGroup) {
        foeBulletGroup = new BulletGroup(scene, 200);
        foeBulletGroup.velocity = 400;
    }
    return foeBulletGroup;
}

export function getPlayerBulletGroup(scene) {
    if (!playerBulletGroup) {
        playerBulletGroup = new BulletGroup(scene, 200, Math.PI);
        playerBulletGroup.velocity = -400;
    }
    return playerBulletGroup;
}
