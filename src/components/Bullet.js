import Phaser from 'phaser';
import { IMAGES, BULLET_SPRITE } from '../constants';

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, BULLET_SPRITE);
        // Needed to init scene and physics:
        // scene.add.existing(this);
        scene.physics.add.existing(this);
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
        let { height } = this.scene.sys.game.canvas;
        super.preUpdate(time, delta);

        if (this.y <= -32 || this.y >= height + 32) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}
