import Phaser from 'phaser';
import { getFoeBulletGroup } from './BulletGroup';
import Bonus from './Bonus';
import { EXPLOSION_SOUND, EXPLOSION_SPRITE } from '../constants';

export default class Foe extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, frame) {
        super(scene, x, y, key, frame);

        // Needed to init scene and physics:
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(this.body.width * 0.75, this.body.height);

        this.setOrigin(0.5, 1);

        this.bullets = getFoeBulletGroup(scene, 100);
        this.bonusProbability = 5;
        this.firePropability = 20;
        this.fireRate = 2; // per second
        this.hitCount = 1;

        this.lastShoot = 0;

        if (!scene.sound.get(EXPLOSION_SOUND)) {
            scene.sound.add(EXPLOSION_SOUND);
        }
    }

    static preload(scene) {
        // Spritesheet created with TexturePacker:
        scene.load.multiatlas(
            'foes',
            './assets/mapeditor/spritesheets/foe-spritesheet.json',
            './assets/mapeditor/spritesheets/'
        );

        Bonus.preload(scene);
    }

    fire(time) {
        if (this.scene.gameRuns === true) {
            if (time - this.lastShoot > this.fireDelay) {
                this.lastShoot = time;
                let randomFire = Phaser.Math.FloatBetween(0, 100);
                if (randomFire <= this.firePropability) {
                    this.bullets.fireBullet(this.x, this.y, time);
                }
            }
        }
    }

    async hit() {
        if (!this.active) {
            return;
        }
        this.setActive(false);
        this.hitCount--;
        if (this.hitCount > 0) {
            await this.playHitAnimation();
            this.setActive(true);
        } else {
            this.playExplosionAnimation();
            this.setVisible(false);
            this.dropBonus();
            this.destroy(true);
        }
    }

    playExplosionAnimation() {
        let boom = this.scene.add.sprite(this.x, this.y, EXPLOSION_SPRITE);
        boom.setOrigin(this.originX, this.originY);
        boom.anims.play(EXPLOSION_SPRITE);
        // this.parentContainer.add(boom);

        this.scene.sound.play(EXPLOSION_SOUND);
        // let parentContainer = this.parentContainer;
        boom.anims.currentAnim.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            // parentContainer.remove(boom, true);
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
        this.fire(time);
        // Is foe out of sight (bottom)? then destroy it to save resources:
        if (
            this.scene.gameRuns &&
            this.getBounds().top > this.scene.cameras.main.worldView.y + this.scene.cameras.main.worldView.height
        ) {
            console.log('destroy foea');
            this.destroy();
        }
    }

    dropBonus() {
        let randomDrop = Phaser.Math.FloatBetween(0, 100);
        if (randomDrop <= this.bonusProbability) {
            let bonus = this.scene.createBonus();
            bonus.setPosition(this.x, this.y);
        }
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
}
