import Phaser from 'phaser';

import PlayerShip from '../components/PlayerShip.js';
import Foe from '../components/Foe';
import Bonus, { TYPES as BONUS_TYPES } from '../components/Bonus';
import { getFoeBulletGroup, getPlayerBulletGroup } from '../components/BulletGroup';
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
    LEVEL_FILES,
} from '../constants';

export default class InfiniteScrollScene extends Phaser.Scene {
    constructor() {
        super(SCENES.infinitescroll);
        this.bg = null;
        this.player1 = null;
        this.player2 = null;
        this.keys = {};
        this.gameRuns = false;
    }

    preload() {
        this.load.image(SPACE_SPRITE, IMAGES.space);
        this.load.image(STARS_BG_SPRITE, IMAGES.starsBg);

        this.load.spritesheet(EXPLOSION_SPRITE, IMAGES.explosion, { frameWidth: 64, frameHeight: 64, endFrame: 15 });
        this.load.audio(EXPLOSION_SOUND, SOUNDS.explosion_a);
        this.load.tilemapTiledJSON('map', LEVEL_FILES.level00001);

        PlayerShip.preload(this);
        Foe.preload(this);
    }

    create() {
        let { width: gameWidth, height: gameHeight } = this.sys.game.canvas;

        let map = this.make.tilemap({ key: 'map' });

        let worldBound = map.findObject('metadata', (o) => o.name === 'worldbound');
        let start = map.findObject('metadata', (o) => o.name === 'start');

        this.physics.world.setBounds(
            worldBound.x,
            worldBound.y,
            worldBound.width,
            worldBound.height,
            true,
            true,
            false,
            false
        );

        let width = worldBound.width;
        let height = Math.abs(worldBound.height);

        // Background stars
        this.bg = this.add.tileSprite(0, 0, gameWidth, gameHeight, SPACE_SPRITE).setOrigin(0, 0);

        // this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // this.cameras.main.setScroll(0, start.y - 900);

        // Create animations:
        this.createAnimations();

        // Bonus group:
        this.bonusGroup = this.add.group();

        // Create game items
        this.createPlayers(width, start);
        this.createKeysForPlayers();
        let foeGroup = this.createFoes(map.getObjectLayer('foes').objects);

        // Create colliders for players and bonuses:
        this.physics.add.overlap(this.player1, this.bonusGroup, this.onBonusHit, null, this);
        this.physics.add.overlap(this.player2, this.bonusGroup, this.onBonusHit, null, this);

        // Create colliders for players and foe bullets:
        let foeBullets = getFoeBulletGroup(this);
        this.physics.add.overlap(this.player1, foeBullets, this.onPlayerHit, null, this);
        this.physics.add.overlap(this.player2, foeBullets, this.onPlayerHit, null, this);

        // Create colliders for foes and player bullets:
        let playerBullets = getPlayerBulletGroup(this);
        this.physics.add.overlap(foeGroup, playerBullets, this.onFoeHit, null, this);

        // // Place live indicators:
        this.liveGroup = this.add.group([this.player1.liveContainer, this.player2.liveContainer]);
        this.player1.liveContainer.setScrollFactor(0);
        this.player1.liveContainer.x = 5;
        this.player1.liveContainer.y = 18;
        this.player2.liveContainer.setScrollFactor(0);
        this.player2.liveContainer.x = width - this.player2.liveContainer.getBounds().width;
        this.player2.liveContainer.y = 18;
        this.children.bringToTop(this.liveGroup);

        this.cameras.main.setBounds(worldBound.x, worldBound.y, worldBound.width, worldBound.height);
        this.cameras.main.useBounds = true;
        this.cameras.main.startFollow(this.player1, true, 1, 1, 0, this.game.config.height / 2 - this.player1.height);

        // Start GetReady Scene, and wait for its done event:
        let getReadyScene = this.scene.get(SCENES.getready);
        getReadyScene.events.once('done', () => {
            this.scene.stop(getReadyScene);
            this.gameRuns = true;
            this.player1.setVelocityY(-50);
            this.player2.setVelocityY(-50);
        });
        this.scene.run(SCENES.getready);
    }

    createPlayers(worldWidth, startPoint) {
        this.player1 = new PlayerShip(this, 0, 0, SHIP_SPRITE_4);
        this.player2 = new PlayerShip(this, 0, 0, SHIP_SPRITE_5);
        let bounds1 = this.player1.getBounds();
        let bounds2 = this.player2.getBounds();
        this.player1.setPosition(50 + bounds1.width / 2, startPoint.y - bounds1.height / 2 - 10);
        this.player2.setPosition(worldWidth - 50 - bounds2.width / 2, startPoint.y - bounds2.height / 2 - 10);
    }

    createFoes(foeConfigs) {
        this.foeGroup = this.physics.add.group();
        foeConfigs.forEach((config) => {
            let foe = new Foe(this, config.x, config.y, 'foes', config.name);
            Object.assign(foe, config);
            this.foeGroup.add(foe, true);
        });
        return this.foeGroup;
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
                this.scene.pause(SCENES.infinitescroll);
                this.scene.run(SCENES.pause);
            }
        });
    }

    update(time, delta) {
        let perSecondFactor = delta / 1000;
        this.updateBG(time, delta, perSecondFactor || 0);
        if (this.gameRuns) {
            this.updatePlayers(time, delta, perSecondFactor);
        }
    }

    updateBG(time, delta, perSecondFactor) {
        // sync bg position with camera scroll position:
        this.bg.setPosition(0, this.cameras.main.scrollY);
        this.bg.tilePositionX -= perSecondFactor * 10;
        this.bg.tilePositionY -= perSecondFactor * 100;
        // this.bg.angle = (this.bg.angle + 1 * perSecondFactor) % 360;
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
        if (player.keys.left.isDown) {
            player.setVelocityX(-1 * player.moveSpeed);
        }
        if (player.keys.right.isDown) {
            player.setVelocityX(player.moveSpeed);
        }
        if (!player.keys.left.isDown && !player.keys.right.isDown) {
            player.setVelocityX(0);
        }
    }

    onFoeHit(foe, bullet) {
        if (bullet.active) {
            foe.hit(foe);
            bullet.setActive(false);
            bullet.setVisible(false);
        }
    }

    onPlayerHit(player, bullet) {
        if (bullet.active) {
            player.hit();
            bullet.setActive(false);
            bullet.setVisible(false);
            // If both players are death, game over!
            if (this.player1.lives <= 0 && this.player2.lives <= 0) {
                this.initiateGameOver();
            }
        }
        return true;
    }

    onBonusHit(player, bonus) {
        if (player.active) {
            bonus.applyBonus(player);
            bonus.setActive(false);
            bonus.setVisible(false);
            bonus.destroy(true);
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

    initiateGameOver() {
        if (this.gameRuns) {
            this.gameRuns = false;
            this.scene.run(SCENES.gameover);
        }
    }
}
