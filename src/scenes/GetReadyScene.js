import Phaser from 'phaser';

import { SCENES } from '../constants';

export default class GetReadyScene extends Phaser.Scene {
    constructor() {
        super(SCENES.getready);
    }

    preload() {}

    create() {
        let { width, height } = this.sys.game.canvas;

        // Background dim
        this.bg = this.add.rectangle(0, 0, width, height, 0x000, 1);
        this.bg.setAlpha(0.5);
        this.bg.setOrigin(0, 0);

        // Create and start GetReady text:
        this.createGetReady();
        this.startGetReadySequence();
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
            tweens: [
                {
                    targets: [this.getReadyText],
                    y: height / 2,
                    duration: 500,
                    ease: 'Bounce.easeOut',
                    easeParams: [],
                    loop: 0,
                    yoyo: false,
                },
                {
                    targets: [this.getReadyText],
                    y: height + 120,
                    duration: 200,
                    offset: 1500,
                    ease: 'Sine',
                    easeParams: [],
                    loop: 0,
                    yoyo: false,
                },
                {
                    targets: this.bg,
                    alpha: 0,
                    duration: 200,
                    offset: 1500,
                    ease: 'Sine',
                    easeParams: [],
                    loop: 0,
                    yoyo: false,
                },
            ],
            onComplete: () => {
                this.events.emit('done');
            },
        });
    }
}
