import Phaser from 'phaser';

import PlayerShip from '../components/PlayerShip.js';
import FoeContainer from '../components/FoeContainer.js';
import Bonus, { TYPES as BONUS_TYPES } from '../components/Bonus';
import {
    IMAGES,
    SCENES,
    SOUNDS,
    SPACE_SPRITE,
    STARS_BG_SPRITE,
    // SHIP_SPRITE_3,
    SHIP_SPRITE_4,
    SHIP_SPRITE_5,
    EXPLOSION_SOUND,
    EXPLOSION_SPRITE,
} from '../constants';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super(SCENES.game);
        this.bg = null;
        this.player1 = null;
        this.player2 = null;
        this.foeContainer = null;
        this.keys = {};
        this.gameRuns = false;
    }

    preload() {
        this.load.image(SPACE_SPRITE, IMAGES.space);
        this.load.image(STARS_BG_SPRITE, IMAGES.starsBg);
        PlayerShip.preload(this);
        FoeContainer.preload(this);
        this.load.spritesheet(EXPLOSION_SPRITE, IMAGES.explosion, { frameWidth: 64, frameHeight: 64, endFrame: 15 });
        this.load.audio(EXPLOSION_SOUND, SOUNDS.explosion_a);
    }

    create() {
        let { width, height } = this.sys.game.canvas;

        // Background stars
        this.bg = this.add
            .tileSprite(width / 2, height / 2, width * 1.5, width * 1.5, SPACE_SPRITE)
            .setOrigin(0.5, 0.5);
        this.foes = this.add.group();

        // Create animations:
        this.createAnimations();

        // Bonus group:
        this.bonusGroup = this.add.group();

        // Create game items
        this.createPlayers();
        this.createKeysForPlayers();
        this.createFoes(this.foes);

        // Create colliders for players and bonuses:
        this.physics.add.overlap(this.player1, this.bonusGroup, this.onBonusHit, null, this);
        this.physics.add.overlap(this.player2, this.bonusGroup, this.onBonusHit, null, this);

        // Animate Foes
        this.tweens.add({
            targets: this.foeContainer,
            x: '+= 300',
            duration: 2000,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: true,
        });
        this.tweens.add({
            targets: this.foeContainer,
            y: '+= 40',
            duration: 5000,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: true,
        });

        // Place live indicators:
        this.liveGroup = this.add.group([this.player1.liveContainer, this.player2.liveContainer]);
        this.player1.liveContainer.x = 5;
        this.player1.liveContainer.y = 16;
        this.player2.liveContainer.x = width - this.player2.liveContainer.getBounds().width;
        this.player2.liveContainer.y = 16;
        this.children.bringToTop(this.liveGroup);

        // Create and start GetReady text:
        this.createGetReady();
        this.startGetReadySequence();
    }

    createPlayers() {
        let { width, height } = this.sys.game.canvas;
        this.player1 = new PlayerShip(this, 0, 0, SHIP_SPRITE_4);
        this.player2 = new PlayerShip(this, 0, 0, SHIP_SPRITE_5);
        let bounds1 = this.player1.getBounds();
        let bounds2 = this.player2.getBounds();
        this.player1.setPosition(50 + bounds1.width / 2, height - bounds1.height / 2 - 10);
        this.player2.setPosition(width - 50 - bounds2.width / 2, height - bounds2.height / 2 - 10);
    }

    createFoes() {
        let { width } = this.sys.game.canvas;
        this.foeContainer = new FoeContainer(this, -200, 100, width + 200);

        // create colliders for foes:
        this.foeContainer.each((foe) => {
            this.physics.add.overlap(this.player1.bullets, foe, this.onFoeHit, null, this);
            this.physics.add.overlap(this.player2.bullets, foe, this.onFoeHit, null, this);
        });

        // Create colliders for players:
        this.physics.add.overlap(this.foeContainer.bulletPool, this.player1, this.onPlayerHit, null, this);
        this.physics.add.overlap(this.foeContainer.bulletPool, this.player2, this.onPlayerHit, null, this);
    }

    createKeysForPlayers() {
        this.player1.keys = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.S,
            shoot: Phaser.Input.Keyboard.KeyCodes.Q,
        });
        this.player2.keys = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.K,
            right: Phaser.Input.Keyboard.KeyCodes.L,
            shoot: Phaser.Input.Keyboard.KeyCodes.U,
        });

        this.input.keyboard.on('keydown-P', (e) => {
            if (this.gameRuns) {
                e.stopPropagation();
                this.scene.pause(SCENES.game);
                this.scene.run(SCENES.pause);
            }
        });
    }

    update(time, delta) {
        let perSecondFactor = delta / 1000;
        this.updateBG(time, delta, perSecondFactor);
        this.updatePlayers(time, delta, perSecondFactor);
    }

    updateBG(time, delta, perSecondFactor) {
        this.bg.tilePositionX -= perSecondFactor * 10;
        this.bg.tilePositionY -= perSecondFactor * 5;
        this.bg.angle = (this.bg.angle + 1 * perSecondFactor) % 360;
    }

    updatePlayers(time, delta, perSecondFactor) {
        this.handleKeyInputForPlayer(this.player1, time, delta, perSecondFactor);
        this.handleKeyInputForPlayer(this.player2, time, delta, perSecondFactor);
    }

    createBonus() {
        let types = Object.values(BONUS_TYPES);
        let type = types[Phaser.Math.Between(0, types.length - 1)];
        let bonus = new Bonus(this, 0, 0, { type });
        this.bonusGroup.add(bonus);
        return bonus;
    }

    handleKeyInputForPlayer(player, time, delta, perSecondFactor) {
        let velocity = 200;

        if (player.keys.left.isDown) {
            player.setVelocityX(-1 * velocity);
        }
        if (player.keys.right.isDown) {
            player.setVelocityX(velocity);
        }
        if (!player.keys.left.isDown && !player.keys.right.isDown) {
            player.setVelocityX(0);
        }

        if (player.keys.shoot.isDown) {
            player.fire(time);
        }
    }

    onFoeHit(bullet, foe) {
        if (bullet.active) {
            this.foeContainer.hit(foe);
            bullet.setActive(false);
            bullet.setVisible(false);
        }
    }

    onPlayerHit(bullet, player) {
        if (bullet.active) {
            player.hit();
            bullet.setActive(false);
            bullet.setVisible(false);
            // If both players are death, game over!
            if (this.player1.lives <= 0 && this.player2.lives <= 0) {
                this.initiateGameOver();
            }
        }
    }

    onBonusHit(player, bonus) {
        if (player.active) {
            bonus.applyBonus(player);
            bonus.setActive(false);
            bonus.setVisible(false);
            bonus.destroy(true);
            console.log('bonus!');
        }
    }

    createAnimations() {
        if (!this.anims.exists(EXPLOSION_SPRITE)) {
            this.anims.create({
                key: EXPLOSION_SPRITE,
                frames: this.anims.generateFrameNumbers(EXPLOSION_SPRITE, { start: 0, end: 15, first: 0 }),
                frameRate: 10,
            });
        }
    }

    createGetReady() {
        let { width, height } = this.sys.game.canvas;
        this.getReadyText = this.add.dom(
            width / 2,
            -120,
            'h1',
            'color:white;font:Courier;font-size:72pt;text-shadow: -5px 0 10px white, 5px 0 10px white;',
            'Get Ready!'
        );
    }

    startGetReadySequence() {
        let { height } = this.sys.game.canvas;
        this.getReadyText.y = -120;
        this.gameRuns = false;
        this.tweens.timeline({
            targets: [this.getReadyText],
            tweens: [
                {
                    y: height / 2,
                    duration: 500,
                    ease: 'Bounce.easeOut',
                    easeParams: [],
                    loop: 0,
                    yoyo: false,
                },
                {
                    y: height + 120,
                    duration: 500,
                    delay: 1000,
                    ease: 'Sine',
                    easeParams: [],
                    loop: 0,
                    yoyo: false,
                },
            ],
            onComplete: () => {
                this.gameRuns = true;
            },
        });
    }

    initiateGameOver() {
        if (this.gameRuns) {
            this.gameRuns = false;
            this.scene.run(SCENES.gameover);
        }
    }
}
