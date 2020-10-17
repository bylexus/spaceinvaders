import Phaser from 'phaser';

import { SCENES } from '../constants';

export default class PauseScene extends Phaser.Scene {
    constructor() {
        super(SCENES.pause);
    }

    preload() {}

    create() {
        let { width, height } = this.sys.game.canvas;

        // Background dim
        let rect = this.add.rectangle(0, 0, width, height, 0x000, 1);
        rect.setAlpha(0);
        rect.setOrigin(0, 0);

        // Create Pause text:
        this.createPauseText();

        // Outer tween: Fade in pause screen
        this.tweens.timeline({
            tweens: [
                {
                    targets: rect,
                    alpha: 0.5,
                },
                {
                    offset: 0,
                    targets: this.pauseText,
                    y: height / 2,
                    ease: 'Bounce.easeOut',
                    easeParams: [],
                },
            ],
            duration: 500,
            repeat: 0,
            onComplete: () => {
                // Add Key handler for P key to unpause:
                this.input.keyboard.on('keydown-P', (e) => {
                    // inner tween: fade out pause screen and close scene after:
                    this.tweens.timeline({
                        tweens: [
                            {
                                targets: rect,
                                alpha: 0,
                            },
                            {
                                offset: 0,
                                targets: this.pauseText,
                                y: height + 120,
                                ease: 'Sine',
                                easeParams: [],
                            },
                        ],
                        duration: 250,
                        repeat: 0,
                        onComplete: () => {
                            this.scene.resume(SCENES.infinitescroll);
                            this.scene.stop(SCENES.pause);
                        },
                    });
                });
            },
        });
    }

    createPauseText() {
        let { width, height } = this.sys.game.canvas;
        this.pauseText = this.add.dom(
            width / 2,
            -120,
            'h1',
            'color:white;font:Courier;font-size:72pt;text-shadow: -5px 0 10px white, 5px 0 10px white;',
            'Pause'
        );
    }
}
