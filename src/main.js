import Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import PauseScene from './scenes/PauseScene';
import GameOverScene from './scenes/GameOverScene';
import './css/styles.css';

const config = {
    type: Phaser.AUTO,
    parent: 'app',
    width: 1024,
    height: 768,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            // debug: true,
            // debugShowBody: true,
            // debugShowStaticBody: true,
            // debugShowVelocity: true,
            // debugVelocityColor: 0xffff00,
            // debugBodyColor: 0x0000ff,
            // debugStaticBodyColor: 0xffffff
        },
    },
    scene: [GameScene, PauseScene, GameOverScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    dom: {
        createContainer: true,
    },
};

export default new Phaser.Game(config);
