import Phaser from 'phaser';
import { IMAGES, BULLET_SPRITE } from '../constants';

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, BULLET_SPRITE);
        // Needed to init scene and physics:
        // scene.add.existing(this);
        // scene.physics.add.existing(this);

        this.boundsCache = new Phaser.Geom.Rectangle();
    }

    static preload(scene) {
        scene.load.image(BULLET_SPRITE, IMAGES.shoot);
    }

    set velocity(velocity) {
        this._velocity = velocity;
        this.setVelocityY(velocity);
    }

    get velocity() {
        return this._velocity;
    }

    fire(x, y) {
        this.setPosition(x, y);

        this.setActive(true);
        this.setVisible(true);
        this.setVelocityY(this.velocity);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        this.getBounds(this.boundsCache);
        // When within camera view, set the bullet active, else stop it
        if (
            this.scene.cameras.main.worldView.contains(this.boundsCache.left, this.boundsCache.top) ||
            this.scene.cameras.main.worldView.contains(this.boundsCache.right, this.boundsCache.bottom)
        ) {
            this.setActive(true);
            this.setVisible(true);
        } else {
            this.setActive(false);
            this.setVisible(false);
            this.setVelocityY(0);
        }
    }
}
