import Phaser from 'phaser';
import { getFoeBulletGroup } from './BulletGroup';
import Bonus from './Bonus';
import { EXPLOSION_SOUND, EXPLOSION_SPRITE } from '../constants';

export default class Foe extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, frame, config = {}) {
        super(scene, x, y, key, frame);

        config = config || {};

        this.boundsCache = new Phaser.Geom.Rectangle();

        // Needed to init scene and physics:
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(this.body.width * 0.75, this.body.height);

        this.setOrigin(0.5, 1);

        // Defaults:
        this.bullets = getFoeBulletGroup(scene);
        this.bonusProbability = 5;
        this.fireProbability = 20;
        this.fireRate = 2; // per second
        this.hitCount = 1;

        /**
         * Supported movement algorithms:
         * - moveAlgo = 'left-right': swipes from left to right
         *   - moveDistance, moveDuration
         * - moveAlgo = 'velocityX': moves in one x direction with the given velocity
         *   - applyVelocity
         * - moveAlgo = 'verticalAttack': swipes down an up again
         *   - moveDistance, moveDuration
         */
        this.moveAlgo = null;
        this.moveDistance = 0;
        this.moveDuration = 0;

        this.applyCustomProperties(config.properties || []);
        this.initAnimations();

        this.lastShoot = 0;

        if (!scene.sound.get(EXPLOSION_SOUND)) {
            scene.sound.add(EXPLOSION_SOUND);
        }
    }

    applyCustomProperties(props) {
        props.forEach((item) => {
            if (item.name) {
                this[item.name] = item.value;
            }
        });
    }

    initAnimations() {
        if (this.moveAlgo === 'left-right') {
            this.initLeftRightMoveAnim(this.moveDistance, this.moveDuration);
        }
        if (this.moveAlgo === 'verticalAttack') {
            this.initVerticalAttackAnim(this.moveDistance, this.moveDuration);
        }
        if (this.moveAlgo === 'velocityX') {
            this.setVelocityX(0);
            // we create an animation-like object here, to use the same methods later on:
            this.moveAnimation = {
                play: () => this.setVelocityX(this.applyVelocity || 200),
                isPlaying: () => this.velocityX < 0 || this.velocityX > 0,
                stop: () => this.setVelocityX(0),
                pause: () => this.setVelocityX(0),
            };
        }
    }

    initLeftRightMoveAnim(moveDistance, moveDuration) {
        this.moveAnimation = this.scene.tweens.timeline({
            targets: this,
            totalDuration: moveDuration,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: true,
            tweens: [
                {
                    x: this.x + moveDistance,
                },
            ],
        });
        // If timeline starts with paused config = true, it will never start. So we set it after initialization...
        setTimeout(() => {
            this.moveAnimation.pause();
        }, 0);
    }

    initVerticalAttackAnim(moveDistance, moveDuration) {
        this.moveAnimation = this.scene.tweens.timeline({
            targets: this,
            totalDuration: moveDuration,
            ease: 'Sine.easeOut',
            repeat: -1,
            delay: 1000,
            repeatDelay: 2000,
            yoyo: true,
            tweens: [
                {
                    y: this.y + moveDistance,
                },
            ],
        });
        // If timeline starts with paused config = true, it will never start. So we set it after initialization...
        setTimeout(() => {
            this.moveAnimation.pause();
        }, 0);
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
                if (randomFire <= this.fireProbability) {
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
        // When in sight, start animation, if necessary:
        this.getBounds(this.boundsCache);
        if (
            this.scene.cameras.main.worldView.contains(this.boundsCache.left, this.boundsCache.top) ||
            this.scene.cameras.main.worldView.contains(this.boundsCache.right, this.boundsCache.bottom)
        ) {
            if (this.moveAnimation && !this.moveAnimation.isPlaying()) {
                this.moveAnimation.play();
            }
        }
        // Is foe out of sight (bottom)? then destroy it to save resources:
        if (
            this.scene.gameRuns &&
            this.boundsCache.top > this.scene.cameras.main.worldView.y + this.scene.cameras.main.worldView.height + 200
        ) {
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
