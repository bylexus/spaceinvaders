import Phaser from 'phaser';
import { LIVES_SPRITE, IMAGES } from '../constants';

export default class LiveContainer extends Phaser.GameObjects.Container {
    constructor(scene, x, y, nrOfLives) {
        super(scene, x, y);
        // Needed to init scene and physics:
        scene.add.existing(this);

        // this.gridWidth = gridWidth || this.scene.sys.gamee.canvas.width;
        this.addLiveSprites(nrOfLives);
        this.alive = nrOfLives;
    }

    static preload(scene) {
        scene.load.spritesheet(LIVES_SPRITE, IMAGES.lives, { frameWidth: 32, frameHeight: 33 });
    }

    addLiveSprites(nrOfLives) {
        for (let i = 0; i < nrOfLives; i++) {
            let liveSprite = this.scene.add.sprite(i * 36 + 16, 0, LIVES_SPRITE, i < this.alive ? 1 : 0);
            this.add(liveSprite);
        }
    }

    updateLives(lives) {
        for (let i = 0; i < this.list.length; i++) {
            if (i < lives) {
                this.getAt(i).setFrame(0);
            } else {
                this.getAt(i).setFrame(1);
            }
        }
    }

    preUpdate(time, delta) {
        // super.preUpdate(time, delta);
    }
}
