import Phaser from 'phaser';
import Bullets from './Bullets';
import Bonus, { TYPES as BONUS_TYPES } from './Bonus';
import { IMAGES, FOE_SPRITE_3, FOE_SPRITE_4, FOE_SPRITE_5, EXPLOSION_SOUND, EXPLOSION_SPRITE } from '../constants';

const foes = [FOE_SPRITE_3, FOE_SPRITE_4, FOE_SPRITE_5];

export default class Foe extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, { foe = null, bulletPool = null }) {
        if (!foe) {
            foe = foes[Phaser.Math.Between(0, foes.length - 1)];
        }
        super(scene, x, y, foe);
        // Needed to init scene and physics:
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(this.body.width * 0.75, this.body.height * 0.5);

        this.setOrigin(0.5, 1);

        this.bullets = bulletPool;
        this.bullets.propertyValueSet('angle', 180);

        this.firePropability = 2;
        this.bonusProbability = 100;
        // this.firePropability = 0.08;
        this.hitCount = 3;
    }

    static preload(scene) {
        scene.load.image(FOE_SPRITE_3, IMAGES.foe_3);
        scene.load.image(FOE_SPRITE_4, IMAGES.foe_4);
        scene.load.image(FOE_SPRITE_5, IMAGES.foe_5);
        Bullets.preload(scene);
        Bonus.preload(scene);
    }

    fire(time) {
        if (this.scene.gameRuns === true) {
            let x = this.parentContainer.x + this.x;
            let y = this.parentContainer.y + this.y;
            this.bullets.fireBullet(x, y, time);
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
        this.parentContainer.add(boom);

        this.scene.sound.play(EXPLOSION_SOUND);
        let parentContainer = this.parentContainer;
        boom.anims.currentAnim.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            parentContainer.remove(boom, true);
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
        let randomFire = Phaser.Math.FloatBetween(0, 100);
        if (randomFire <= this.firePropability) {
            this.fire(time);
        }
    }

    dropBonus() {
        let randomDrop = Phaser.Math.FloatBetween(0, 100);
        if (randomDrop <= this.bonusProbability) {
            let x = this.parentContainer.x + this.x;
            let y = this.parentContainer.y + this.y;

            let bonus = this.scene.createBonus();
            bonus.setPosition(x, y);
        }
    }
}
