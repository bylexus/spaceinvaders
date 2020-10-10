import Phaser from 'phaser';
import Bullets from './Bullets';
import LiveContainer from './LiveContainer';

const EXPLOSION = 'explosion';
const EXPLOSION_SOUND = 'explosion1';

import { IMAGES, SHIP_SPRITE_1, SHIP_SPRITE_2, SHIP_SPRITE_3, SHIP_SPRITE_4, SHIP_SPRITE_5 } from '../constants';

export default class PlayerShip extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, player) {
        super(scene, x, y, player);
        // Needed to init scene and physics:
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setBounce(0.2);
        this.setOrigin(0.5, 0);
        this.setCollideWorldBounds(true);

        this.bullets = new Bullets(scene);
        this.autoFire = true;

        this.maxLives = 3;
        this.lives = 3;
    }

    static preload(scene) {
        scene.load.image(SHIP_SPRITE_1, IMAGES.ship1);
        scene.load.image(SHIP_SPRITE_2, IMAGES.ship2);
        scene.load.image(SHIP_SPRITE_3, IMAGES.ship3);
        scene.load.image(SHIP_SPRITE_4, IMAGES.ship4);
        scene.load.image(SHIP_SPRITE_5, IMAGES.ship5);
        Bullets.preload(scene);
        LiveContainer.preload(scene);
    }

    get lives() {
        return this._lives || 0;
    }

    set lives(lives) {
        this._lives = Math.min(this.maxLives, Number(lives));
        this.updateLivesContainer(this._lives);
        console.log(this._lives);
    }

    fire(time) {
        if (this.scene.gameRuns === true && this.active) {
            this.bullets.fireBullet(this.x, this.y, time);
        }
    }

    async hit() {
        if (!this.active) {
            return;
        }
        this.lives--;
        this.setActive(false);
        this.playExplosionAnimation();
        // The player is deactivated for some time, when he has still lives:
        if (this.lives > 0) {
            await this.playHitAnimation();
            this.setActive(true);
        } else {
            this.setVisible(false);
        }
    }

    updateLivesContainer(lives) {
        if (!this.liveContainer) {
            this.liveContainer = new LiveContainer(this.scene, 0, 0, this.lives);
        }
        this.liveContainer.updateLives(lives);
    }

    playExplosionAnimation() {
        let boom = this.scene.add.sprite(this.x, this.y, EXPLOSION);
        boom.setOrigin(this.originX, this.originY);
        boom.anims.play(EXPLOSION);
        this.scene.sound.play(EXPLOSION_SOUND);

        boom.anims.currentAnim.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            boom.destroy(true);
        });
    }

    playHitAnimation() {
        return new Promise((resolve, reject) => {
            this.scene.tweens.add({
                targets: this,
                alpha: 0.1,
                duration: 50,
                ease: 'Sine',
                repeat: 10,
                yoyo: true,
                onComplete: resolve,
            });
        });
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (this.autoFire) {
            this.fire(time);
        }
    }
}
