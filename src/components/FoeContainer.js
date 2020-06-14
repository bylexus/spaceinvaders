import Phaser from 'phaser';
import Foe from '../components/Foe.js';
import Bullets from './Bullets.js';

import { EXPLOSION_SOUND } from '../constants';

export default class FoeContainer extends Phaser.GameObjects.Container {
    constructor(scene, x, y, gridWidth) {
        super(scene, x, y);
        // Needed to init scene and physics:
        scene.add.existing(this);

        this.rows = 3;
        this.gridWidth = gridWidth || this.scene.sys.gamee.canvas.width;
        this.marginX = 5;
        this.marginY = 5;
        this._bulletPool = new Bullets(scene, 50, 400);
        this.createFoes(this._bulletPool);

        if (!scene.sound.get(EXPLOSION_SOUND)) {
            scene.sound.add(EXPLOSION_SOUND);
        }
    }

    static preload(scene) {
        Foe.preload(scene);
    }

    get bulletPool() {
        return this._bulletPool;
    }

    createFoes(bulletPool) {
        let row = 0;
        let actX = 0;
        let actY = 0;

        while (row < this.rows) {
            let foe = new Foe(this.scene, actX, actY, { bulletPool });
            if (actX + this.marginX + foe.width > this.gridWidth) {
                actX = 0;
                row++;
                actY += this.marginY + foe.height;
            }
            foe.setPosition(actX, actY);
            actX += this.marginX + foe.width;
            this.add(foe);
        }
    }

    hit(foe) {
        foe.hit();
        if (foe.hitCount <= 0) {
            this.remove(foe, true);
        }
    }

    preUpdate(time, delta) {
        // super.preUpdate(time, delta);
    }
}
