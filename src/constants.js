import foeImg1 from './assets/gegner-1.png';
import foeImg2 from './assets/gegner-2.png';
import foeImg3 from './assets/gegner-3.png';
import foeImg4 from './assets/gegner-4.png';
import foeImg5 from './assets/gegner-5.png';
import foeImg6 from './assets/gegner-6.png';
import foeImg7 from './assets/gegner-7.png';
import foeImg8 from './assets/gegner-8.png';

import space from './assets/space.png';
import stars_bg from './assets/stars-bg.jpg';
import explosion from './assets/explosion.png';
import explosion_sound_a from './assets/explosion-a.mp3';
import explosion_sound_j from './assets/explosion-j.mp3';
import explosion_sound_n from './assets/explosion-n.mp3';

import ship1 from './assets/ship-1.png';
import ship2 from './assets/ship-2.png';
import ship3 from './assets/ship-3.png';
import ship4 from './assets/ship-4.png';
import ship5 from './assets/ship-5.png';

import shoot_img from './assets/shoot.png';
import lives_img from './assets/lives.png';

import bonuses_img from './assets/bonuses.png';

export const FOE_SPRITE_1 = 'foeImg1';
export const FOE_SPRITE_2 = 'foeImg2';
export const FOE_SPRITE_3 = 'foeImg3';
export const FOE_SPRITE_4 = 'foeImg4';
export const FOE_SPRITE_5 = 'foeImg5';
export const FOE_SPRITE_6 = 'foeImg6';
export const FOE_SPRITE_7 = 'foeImg7';
export const FOE_SPRITE_8 = 'foeImg8';

export const SHIP_SPRITE_1 = 'ship-1';
export const SHIP_SPRITE_2 = 'ship-2';
export const SHIP_SPRITE_3 = 'ship-3';
export const SHIP_SPRITE_4 = 'ship-4';
export const SHIP_SPRITE_5 = 'ship-5';

export const EXPLOSION_SPRITE = 'explosion';
export const EXPLOSION_SOUND = 'explosion1';
export const SPACE_SPRITE = 'space';
export const STARS_BG_SPRITE = 'stars_bg';
export const BULLET_SPRITE = 'bullet';
export const LIVES_SPRITE = 'lives';
export const BONUS_SPRITE = 'bonus';

export const IMAGES = {
    foe_1: foeImg1,
    foe_2: foeImg2,
    foe_3: foeImg3,
    foe_4: foeImg4,
    foe_5: foeImg5,
    foe_6: foeImg6,
    foe_7: foeImg7,
    foe_8: foeImg8,

    ship1,
    ship2,
    ship3,
    ship4,
    ship5,

    space,
    starsBg: stars_bg,
    explosion,

    shoot: shoot_img,
    lives: lives_img,
    bonus: bonuses_img,
};

export const SOUNDS = {
    explosion_a: explosion_sound_a,
    explosion_j: explosion_sound_j,
    explosion_n: explosion_sound_n,
};

export const SCENES = {
    game: 'game',
    pause: 'pause',
    gameover: 'gameover',
};
