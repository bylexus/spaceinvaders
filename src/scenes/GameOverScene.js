import Phaser from 'phaser';

import { SCENES } from '../constants';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super(SCENES.gameover);
    }

    preload() {}

    create() {
        let { width, height } = this.sys.game.canvas;

        // Background dim
        let rect = this.add.rectangle(0, 0, width, height, 0x000, 1);
        rect.setAlpha(0);
        rect.setOrigin(0, 0);

        // Create text:
        let gameText = this.createGameText();
        let overText = this.createOverText();

        // Outer tween: Fade in pause screen
        this.tweens.timeline({
            tweens: [
                {
                    targets: rect,
                    alpha: 0.5,
                },
                {
                    offset: 0,
                    targets: gameText,
                    x: width / 2,
                    ease: 'Bounce.easeOut',
                    easeParams: [],
                },
                {
                    offset: 0,
                    targets: overText,
                    x: width / 2,
                    ease: 'Bounce.easeOut',
                    easeParams: [],
                },
            ],
            duration: 500,
            repeat: 0,
            onComplete: () => {},
        });
    }

    createGameText() {
        let { width, height } = this.sys.game.canvas;
        return this.add
            .dom(
                -100,
                height / 3,
                'h1',
                'color:white;font:Courier;font-size:72pt;text-shadow: -5px 0 10px white, 5px 0 10px white;',
                'Game'
            )
            .setOrigin(1.07, 0.5);
    }

    createOverText() {
        let { width, height } = this.sys.game.canvas;
        return this.add
            .dom(
                width + 20,
                height / 3,
                'h1',
                'color:white;font:Courier;font-size:72pt;text-shadow: -5px 0 10px white, 5px 0 10px white;',
                'Over!'
            )
            .setOrigin(-0.03, 0.5);
    }
}
