import Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import './css/styles.css';

const config = {
    type: Phaser.AUTO,
    parent: 'app',
    width: 1024,
    height: 768,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
        },
    },
    scene: [GameScene],
};

export default new Phaser.Game(config);
