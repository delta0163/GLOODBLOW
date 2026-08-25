"use strict";

/* =========================================================
   BLOOD GLOW
   ========================================================= */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = 320;
const H = 180;


/* =========================================================
   ИЗОБРАЖЕНИЯ
========================================================= */

const WASTELAND_IMAGE = "images/wasteland.png";
const PATH_IMAGE = "images/path.png";

const DELTA_DOWN = "images/delta.png";
const DELTA_LEFT = "images/deltalef.png";
const DELTA_RIGHT = "images/deltaright.png";
const DELTA_BACK = "images/deltabach.png";

const ERROR_IMAGE = "images/error.png";

const images = {};

function loadImage(name, src) {

    const img = new Image();

    img.src = src;

    images[name] = img;
}

loadImage("wasteland", WASTELAND_IMAGE);
loadImage("path", PATH_IMAGE);

loadImage("deltaDown", DELTA_DOWN);
loadImage("deltaLeft", DELTA_LEFT);
loadImage("deltaRight", DELTA_RIGHT);
loadImage("deltaBack", DELTA_BACK);

loadImage("error", ERROR_IMAGE);


/* =========================================================
   FULLSCREEN
========================================================= */

const fullscreenButton =
    document.getElementById("fullscreen-button");

fullscreenButton.addEventListener("pointerdown", async e => {

    e.preventDefault();

    try {

        if (!document.fullscreenElement) {

            await document.documentElement.requestFullscreen();

        } else {

            await document.exitFullscreen();

        }

    } catch(error) {

        console.log(error);

    }

});


/* =========================================================
   INPUT
========================================================= */

const keys = {

    up:false,
    down:false,
    left:false,
    right:false,

    z:false,
    x:false,
    c:false
};

const oldKeys = {

    up:false,
    down:false,
    left:false,
    right:false,

    z:false,
    x:false,
    c:false
};


function pressed(key) {
    return keys[key] && !oldKeys[key];
}


/* =========================================================
   KEYBOARD
========================================================= */

window.addEventListener("keydown", e => {

    const k = e.key.toLowerCase();

    if (e.key === "ArrowUp" || k === "w")
        keys.up = true;

    if (e.key === "ArrowDown" || k === "s")
        keys.down = true;

    if (e.key === "ArrowLeft" || k === "a")
        keys.left = true;

    if (e.key === "ArrowRight" || k === "d")
        keys.right = true;

    if (k === "z")
        keys.z = true;

    if (k === "x")
        keys.x = true;

    if (k === "c")
        keys.c = true;

    e.preventDefault();

}, {passive:false});


window.addEventListener("keyup", e => {

    const k = e.key.toLowerCase();

    if (e.key === "ArrowUp" || k === "w")
        keys.up = false;

    if (e.key === "ArrowDown" || k === "s")
        keys.down = false;

    if (e.key === "ArrowLeft" || k === "a")
        keys.left = false;

    if (e.key === "ArrowRight" || k === "d")
        keys.right = false;

    if (k === "z")
        keys.z = false;

    if (k === "x")
        keys.x = false;

    if (k === "c")
        keys.c = false;

    e.preventDefault();

}, {passive:false});


/* =========================================================
   MOBILE BUTTONS
========================================================= */

document.querySelectorAll(".joy").forEach(button => {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", e => {

        e.preventDefault();

        keys[key] = true;

        button.setPointerCapture(e.pointerId);

    });

    button.addEventListener("pointerup", e => {

        e.preventDefault();

        keys[key] = false;

    });

    button.addEventListener("pointercancel", () => {

        keys[key] = false;

    });

});


document.querySelectorAll(".action-button").forEach(button => {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", e => {

        e.preventDefault();

        keys[key] = true;

        button.setPointerCapture(e.pointerId);

    });

    button.addEventListener("pointerup", e => {

        e.preventDefault();

        keys[key] = false;

    });

    button.addEventListener("pointercancel", () => {

        keys[key] = false;

    });

});


/* =========================================================
   GAME
========================================================= */

const game = {

    mode:"title",

    started:false,

    playerX:150,
    playerY:110,

    cameraX:0,

    direction:"down",

    storyStep:0,

    dialogue:null,
    dialogueIndex:0,

    menuIndex:0,

    battle:null
};


/* =========================================================
   PARTY
========================================================= */

const party = [

    {
        name:"ДЕЛЬТА",
        hp:90,
        maxHP:90,
        atk:14,
        def:8
    },

    {
        name:"ЛИЧИ",
        hp:80,
        maxHP:80,
        atk:13,
        def:6
    },

    {
        name:"ПАНКЕЙК",
        hp:70,
        maxHP:70,
        atk:10,
        def:11
    },

    {
        name:"КАШТАН",
        hp:110,
        maxHP:110,
        atk:12,
        def:12
    },

    {
        name:"ШАРЛОТА",
        hp:100,
        maxHP:100,
        atk:13,
        def:10
    }

];


/* =========================================================
   TEAM
========================================================= */

const team = [

    {
        name:"ЛИЧИ",
        x:105,
        y:112
    },

    {
        name:"ПАНКЕЙК",
        x:90,
        y:112
    },

    {
        name:"КАШТАН",
        x:75,
        y:112
    },

    {
        name:"ШАРЛОТА",
        x:60,
        y:112
    }

];


/* =========================================================
   WORLD
========================================================= */

const WORLD_WIDTH = 2200;

let worldReady = false;

if (images.wasteland) {

    images.wasteland.onload = () => {

        worldReady = true;

    };

}


/* =========================================================
   DIALOGUE
========================================================= */

const firstDialogue = [

    "ЛИЧИ",

    "Надо проверить Немку...",

    "Она изменилась.",

    "Последний раз, когда мы пытались поговорить с ней,",

    "она была какой-то странной.",

    "ДЕЛЬТА",

    "Так мы идём?",

    "ЛИЧИ",

    "Да.",

    "Лучше не будем терять время.",

    "ШАРЛОТА",

    "Тогда держимся вместе.",

    "КАШТАН",

    "Если Немка действительно изменилась...",

    "нам стоит быть осторожнее."

];


/* =========================================================
   START
========================================================= */

function startGame() {

    game.mode = "explore";

    game.started = true;

    game.playerX = 150;

    game.playerY = 112;

    game.cameraX = 0;

    game.direction = "right";

    game.storyStep = 0;

}


/* =========================================================
   TITLE
========================================================= */

function updateTitle() {

    if (pressed("z")) {

        startGame();

    }

}


function drawTitle() {

    ctx.fillStyle="#050505";

    ctx.fillRect(0,0,W,H);

    ctx.strokeStyle="#fff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        45,
        25,
        230,
        125
    );

    ctx.fillStyle="#fff";

    ctx.font="18px monospace";

    ctx.fillText(
        "BLOOD GLOW",
        82,
        60
    );

    ctx.font="8px monospace";

    ctx.fillText(
        "DIGITAL WASTELAND",
        91,
        78
    );

    ctx.font="7px monospace";

    ctx.fillText(
        "▶ НАЧАТЬ",
        115,
        110
    );

    ctx.fillText(
        "Z — выбрать",
        118,
        135
    );

}


/* =========================================================
   WORLD DRAW
========================================================= */

function drawWorldBackground() {

    const bg = images.wasteland;

    if (!bg || !bg.complete || !bg.naturalWidth) {

        ctx.fillStyle="#111";

        ctx.fillRect(0,0,W,H);

        ctx.fillStyle="#fff";

        ctx.font="8px monospace";

        ctx.fillText(
            "Загрузка пустоши...",
            105,
            90
        );

        return;

    }


    const scale =
        H / bg.naturalHeight;

    const width =
        bg.naturalWidth * scale;


    let x =
        -game.cameraX;


    while (x < W) {

        ctx.drawImage(
            bg,
            x,
            0,
            width,
            H
        );

        x += width;

    }

}


/* =========================================================
   PATH
========================================================= */

function drawPath() {

    const path = images.path;

    if (!path ||
        !path.complete ||
        !path.naturalWidth)
        return;


    const scale =
        0.65;

    const width =
        path.naturalWidth * scale;

    const height =
        path.naturalHeight * scale;


    let x =
        -game.cameraX * 0.75;


    while (x < W) {

        ctx.drawImage(
            path,
            x,
            75,
            width,
            height
        );

        x += width;

    }

}


/* =========================================================
   DELTA SPRITE
========================================================= */

function getDeltaSprite() {

    if (game.direction === "left")
        return images.deltaLeft;

    if (game.direction === "right")
        return images.deltaRight;

    if (game.direction === "up")
        return images.deltaBack;

    return images.deltaDown;

}


function drawDelta() {

    const img = getDeltaSprite();

    if (!img ||
        !img.complete ||
        !img.naturalWidth) {

        ctx.fillStyle="#fff";

        ctx.fillRect(
            game.playerX-game.cameraX,
            game.playerY,
            10,
            14
        );

        return;

    }


    const size = 22;

    ctx.drawImage(
        img,
        game.playerX-game.cameraX-size/2,
        game.playerY-size+8,
        size,
        size
    );

}


/* =========================================================
   TEAM
========================================================= */

function drawTeam() {

    team.forEach((member,i) => {

        const x =
            member.x -
            game.cameraX;

        const y =
            member.y;

        if (x < -30 || x > W+30)
            return;


        const colors = [
            "#55aaff",
            "#55dd66",
            "#cc8844",
            "#ff77cc"
        ];

        ctx.fillStyle=colors[i];

        ctx.fillRect(
            x,
            y,
            9,
            13
        );

        ctx.fillStyle="#000";

        ctx.fillRect(
            x+2,
            y+3,
            2,
            2
        );

        ctx.fillRect(
            x+6,
            y+3,
            2,
            2
        );

    });

}


/* =========================================================
   MOVE
========================================================= */

function updatePlayer() {

    if (game.mode !== "explore")
        return;


    let dx=0;
    let dy=0;

    const speed=1.7;


    if (keys.left) {

        dx-=speed;

        game.direction="left";

    }

    if (keys.right) {

        dx+=speed;

        game.direction="right";

    }

    if (keys.up) {

        dy-=speed;

        game.direction="up";

    }

    if (keys.down) {

        dy+=speed;

        game.direction="down";

    }


    game.playerX += dx;

    game.playerY += dy;


    game.playerX =
        Math.max(
            30,
            Math.min(
                WORLD_WIDTH-30,
                game.playerX
            )
        );


    game.playerY =
        Math.max(
            75,
            Math.min(
                145,
                game.playerY
            )
        );


    game.cameraX =
        game.playerX-120;


    game.cameraX =
        Math.max(
            0,
            Math.min(
                WORLD_WIDTH-W,
                game.cameraX
            )
        );


    /* Дельта выходит из группы */

    if (
        game.storyStep===0 &&
        game.playerX>220
    ) {

        game.storyStep=1;

        startFirstDialogue();

    }

}


/* =========================================================
   FIRST DIALOGUE
========================================================= */

function startFirstDialogue() {

    game.mode="dialogue";

    game.dialogue=firstDialogue;

    game.dialogueIndex=0;

}


function updateDialogue() {

    if (pressed("z")) {

        game.dialogueIndex++;


        if (
            game.dialogueIndex >=
            game.dialogue.length
        ) {

            game.dialogue=null;

            game.mode="explore";

            game.storyStep=2;

        }

    }


    if (pressed("x")) {

        game.dialogue=null;

        game.mode="explore";

        game.storyStep=2;

    }

}


/* =========================================================
   RANDOM BATTLE
========================================================= */

let battleDistance = 0;

function randomBattleCheck() {

    if (game.mode !== "explore")
        return;

    if (game.storyStep < 2)
        return;


    if (game.playerX > 400 &&
        Math.random() < 0.0012) {

        startBattle();

    }

}


/* =========================================================
   BATTLE
========================================================= */

function startBattle() {

    game.mode="battle";

    game.battle={

        enemy:{

            name:"SYSTEM ERROR",

            hp:180,

            maxHP:180,

            mercy:0

        },

        menu:0,

        actor:0,

        phase:"menu",

        rd:0,

        attackPower:0,

        soul:{

            x:160,
            y:135,

            speed:2.3,

            invincible:0
        },

        bullets:[],

        laser:null,

        enemyTimer:0,

        attackType:""

    };

}


/* =========================================================
   BATTLE MENU
========================================================= */

const battleMenu = [

    "FIGHT",
    "ACT",
    "DEFEND",
    "MERCY"
];


function updateBattle() {

    const b=game.battle;

    if (!b)
        return;


    if (b.phase==="menu") {

        if (pressed("left")) {

            b.menu--;

            if (b.menu<0)
                b.menu=3;

        }

        if (pressed("right")) {

            b.menu++;

            if (b.menu>3)
                b.menu=0;

        }


        if (pressed("z")) {

            battleChoose();

        }

    }


    else if (b.phase==="act") {

        if (pressed("x")) {

            b.phase="menu";

        }

        if (pressed("z")) {

            b.enemy.mercy =
                Math.min(
                    100,
                    b.enemy.mercy+20
                );

            b.message =
                "Ты изучил ошибку системы.";

            enemyTurn();

        }

    }


    else if (b.phase==="mercy") {

        if (pressed("x")) {

            b.phase="menu";

        }

        if (pressed("z")) {

            if (b.enemy.mercy>=100) {

                b.phase="victory";

                b.message =
                    "Ошибка исчезла.";

            } else {

                b.message =
                    "Она ещё не готова исчезнуть.";

                enemyTurn();

            }

        }

    }


    else if (b.phase==="enemy") {

        updateEnemyAttack();

    }


    else if (b.phase==="victory") {

        if (pressed("z")) {

            game.mode="explore";

            game.battle=null;

        }

    }


    else if (b.phase==="defeat") {

        if (pressed("z")) {

            resetParty();

            game.mode="explore";

            game.battle=null;

        }

    }

}


/* =========================================================
   CHOOSE
========================================================= */

function battleChoose() {

    const b=game.battle;


    if (b.menu===0) {

        const damage =
            party[b.actor].atk +
            Math.floor(Math.random()*6);


        b.enemy.hp -= damage;


        b.message =
            party[b.actor].name+
            " атакует!  "+
            damage+
            " урона.";


        if (b.enemy.hp<=0) {

            b.enemy.hp=0;

            b.phase="victory";

            return;

        }


        /*
           ВАЖНО:
           АТАКА НЕ ДАЁТ RD
        */

        enemyTurn();

    }


    else if (b.menu===1) {

        b.phase="act";

    }


    else if (b.menu===2) {

        /*
           ЗАЩИТА:
           RD растёт.
        */

        b.rd =
            Math.min(
                100,
                b.rd+25
            );

        b.message =
            party[b.actor].name+
            " встал в защиту.";

        enemyTurn();

    }


    else if (b.menu===3) {

        b.phase="mercy";

    }

}


/* =========================================================
   ENEMY TURN
========================================================= */

function enemyTurn() {

    const b=game.battle;

    b.phase="enemy";

    b.enemyTimer=420;

    b.bullets=[];

    b.laser=null;


    const count =
        Math.random()<0.6
        ? 1
        : 2+Math.floor(Math.random()*2);


    if (count===1) {

        b.attackType="laser";

        b.laser={

            x:
                70+
                Math.random()*180,

            warning:100,

            active:0

        };

    }

    else {

        b.attackType="explosion";

        for (
            let i=0;
            i<count;
            i++
        ) {

            b.bullets.push({

                x:
                    80+
                    Math.random()*160,

                y:
                    100+
                    Math.random()*45,

                radius:4,

                timer:
                    60+
                    Math.random()*80,

                active:40

            });

        }

    }


    b.soul.x=160;

    b.soul.y=135;

}


/* =========================================================
   ENEMY ATTACK
========================================================= */

function updateEnemyAttack() {

    const b=game.battle;


    if (b.soul.invincible>0)
        b.soul.invincible--;


    let dx=0;
    let dy=0;


    if (keys.left)
        dx-=b.soul.speed;

    if (keys.right)
        dx+=b.soul.speed;

    if (keys.up)
        dy-=b.soul.speed;

    if (keys.down)
        dy+=b.soul.speed;


    b.soul.x += dx;

    b.soul.y += dy;


    /*
       ГРАНИЦЫ КАК В DELTARUNE
    */

    b.soul.x =
        Math.max(
            70,
            Math.min(
                250,
                b.soul.x
            )
        );


    b.soul.y =
        Math.max(
            96,
            Math.min(
                160,
                b.soul.y
            )
        );


    if (b.attackType==="laser") {

        updateLaser();

    }

    else {

        updateExplosions();

    }


    b.enemyTimer--;


    if (b.enemyTimer<=0) {

        b.phase="menu";

        b.actor++;

        if (b.actor>=party.length)
            b.actor=0;

        b.menu=0;

    }

}


/* =========================================================
   LASER
========================================================= */

function updateLaser() {

    const b=game.battle;

    if (!b.laser)
        return;


    const laser=b.laser;


    if (laser.warning>0) {

        laser.warning--;

        return;

    }


    laser.active++;


    const dx =
        Math.abs(
            b.soul.x-laser.x
        );


    if (
        dx<8 &&
        b.soul.invincible<=0
    ) {

        takeBattleDamage(12);

    }

}


/* =========================================================
   EXPLOSIONS
========================================================= */

function updateExplosions() {

    const b=game.battle;


    b.bullets.forEach(explosion => {

        if (explosion.timer>0) {

            explosion.timer--;

        }

        else {

            explosion.active--;

            explosion.radius += .8;


            const dx =
                b.soul.x-
                explosion.x;

            const dy =
                b.soul.y-
                explosion.y;

            const distance =
                Math.sqrt(
                    dx*dx+
                    dy*dy
                );


            if (
                distance<
                explosion.radius+4 &&
                b.soul.invincible<=0
            ) {

                takeBattleDamage(10);

            }

        }

    });


    b.bullets =
        b.bullets.filter(
            e => e.active>0
        );


    if (b.bullets.length===0 &&
        b.enemyTimer<320) {

        /*
           создаём ещё одну волну
        */

        for (
            let i=0;
            i<3;
            i++
        ) {

            b.bullets.push({

                x:
                    70+
                    Math.random()*180,

                y:
                    100+
                    Math.random()*50,

                radius:4,

                timer:
                    15+
                    Math.random()*40,

                active:35

            });

        }

    }

}


/* =========================================================
   DAMAGE
========================================================= */

function takeBattleDamage(amount) {

    const b=game.battle;

    const target =
        party[b.actor];


    /*
       Защита влияет на урон.
    */

    const reduced =
        Math.max(
            1,
            amount -
            Math.floor(
                target.def/3
            )
        );


    target.hp -= reduced;


    b.soul.invincible=45;


    if (target.hp<=0)
        target.hp=0;


    if (
        party.every(
            p => p.hp<=0
        )
    ) {

        b.phase="defeat";

    }

}


/* =========================================================
   DRAW BATTLE
========================================================= */

function drawBattle() {

    const b=game.battle;


    ctx.fillStyle="#000";

    ctx.fillRect(0,0,W,H);


    /*
       ВРАГ
    */

    ctx.strokeStyle="#fff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        50,
        8,
        220,
        55
    );


    drawError();


    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    ctx.fillText(
        "ERROR",
        60,
        20
    );


    drawHPBar(
        180,
        14,
        70,
        6,
        b.enemy.hp,
        b.enemy.maxHP
    );


    /*
       СООБЩЕНИЕ
    */

    if (b.message) {

        ctx.fillStyle="#fff";

        ctx.font="6px monospace";

        ctx.fillText(
            b.message,
            20,
            75
        );

    }


    /*
       RD
    */

    drawRD();


    /*
       БОЕВАЯ ОБЛАСТЬ
    */

    if (b.phase==="enemy") {

        drawSoulBox();

    }


    /*
       ПАРТИЯ
    */

    drawBattleParty();


    /*
       МЕНЮ
    */

    if (b.phase==="menu") {

        drawBattleMenu();

    }


    if (b.phase==="act") {

        drawActMenu();

    }


    if (b.phase==="mercy") {

        drawMercyMenu();

    }


    if (b.phase==="victory") {

        drawBattleEnd(
            "ПОБЕДА",
            "Z — продолжить"
        );

    }


    if (b.phase==="defeat") {

        drawBattleEnd(
            "ОТРЯД ПОБЕЖДЁН",
            "Z — вернуться"
        );

    }

}


/* =========================================================
   ERROR
========================================================= */

function drawError() {

    const img=images.error;

    if (
        img &&
        img.complete &&
        img.naturalWidth
    ) {

        ctx.drawImage(
            img,
            145,
            20,
            30,
            30
        );

        return;

    }


    ctx.fillStyle="#fff";

    ctx.fillRect(
        145,
        20,
        30,
        30
    );

    ctx.fillStyle="#000";

    ctx.fillRect(
        150,
        28,
        5,
        5
    );

    ctx.fillRect(
        165,
        28,
        5,
        5
    );

}


/* =========================================================
   SOUL BOX
========================================================= */

function drawSoulBox() {

    const b=game.battle;


    ctx.strokeStyle="#fff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        60,
        90,
        200,
        72
    );


    /*
       ЛАЗЕР
    */

    if (
        b.attackType==="laser" &&
        b.laser
    ) {

        const laser=b.laser;


        if (laser.warning>0) {

            ctx.fillStyle="#ff5555";

            ctx.globalAlpha=.35;

            ctx.fillRect(
                laser.x-3,
                92,
                6,
                68
            );

            ctx.globalAlpha=1;


            ctx.fillStyle="#ff5555";

            ctx.font="6px monospace";

            ctx.fillText(
                "!",
                laser.x-2,
                102
            );

        }

        else {

            ctx.fillStyle="#ff2222";

            ctx.fillRect(
                laser.x-4,
                92,
                8,
                68
            );

        }

    }


    /*
       ВЗРЫВЫ
    */

    b.bullets.forEach(explosion => {

        if (explosion.timer>0) {

            ctx.strokeStyle="#fff";

            ctx.beginPath();

            ctx.arc(
                explosion.x,
                explosion.y,
                8,
                0,
                Math.PI*2
            );

            ctx.stroke();

        }

        else {

            ctx.fillStyle="#fff";

            ctx.beginPath();

            ctx.arc(
                explosion.x,
                explosion.y,
                explosion.radius,
                0,
                Math.PI*2
            );

            ctx.fill();

        }

    });


    /*
       ДУША
    */

    if (
        b.soul.invincible===0 ||
        Math.floor(
            b.soul.invincible/4
        )%2===0
    ) {

        ctx.fillStyle="#ff3333";

        ctx.beginPath();

        ctx.moveTo(
            b.soul.x,
            b.soul.y-5
        );

        ctx.lineTo(
            b.soul.x+5,
            b.soul.y
        );

        ctx.lineTo(
            b.soul.x,
            b.soul.y+5
        );

        ctx.lineTo(
            b.soul.x-5,
            b.soul.y
        );

        ctx.closePath();

        ctx.fill();

    }

}


/* =========================================================
   RD
========================================================= */

function drawRD() {

    const b=game.battle;


    const x=272;
    const y=90;

    const width=30;
    const height=70;


    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        x,
        y,
        width,
        height
    );


    ctx.fillStyle="#111";

    ctx.fillRect(
        x+2,
        y+2,
        width-4,
        height-4
    );


    const amount =
        b.rd/100;


    ctx.fillStyle="#55ddff";

    ctx.fillRect(
        x+5,
        y+height-5-
        ((height-10)*amount),
        width-10,
        (height-10)*amount
    );


    ctx.fillStyle="#fff";

    ctx.font="6px monospace";

    ctx.save();

    ctx.translate(
        x+25,
        y+65
    );

    ctx.rotate(
        -Math.PI/2
    );

    ctx.fillText(
        "RD",
        0,
        0
    );

    ctx.restore();


    ctx.font="5px monospace";

    ctx.fillText(
        Math.floor(b.rd)+"%",
        273,
        84
    );

}


/* =========================================================
   HP
========================================================= */

function drawHPBar(
    x,
    y,
    w,
    h,
    hp,
    max
) {

    ctx.fillStyle="#222";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );


    ctx.fillStyle="#fff";

    ctx.fillRect(
        x,
        y,
        w*Math.max(
            0,
            hp/max
        ),
        h
    );

}


/* =========================================================
   PARTY
========================================================= */

function drawBattleParty() {

    const b=game.battle;


    party.forEach((p,i) => {

        const y=103+i*11;


        if (
            i===b.actor &&
            b.phase==="menu"
        ) {

            ctx.fillStyle="#fff";

            ctx.font="6px monospace";

            ctx.fillText(
                "▶",
                3,
                y
            );

        }


        ctx.fillStyle="#fff";

        ctx.font="5px monospace";

        ctx.fillText(
            p.name,
            11,
            y
        );


        ctx.fillText(
            "HP",
            50,
            y
        );


        drawHPBar(
            62,
            y-5,
            35,
            5,
            p.hp,
            p.maxHP
        );


        ctx.fillText(
            p.hp+"/"+p.maxHP,
            102,
            y
        );

    });

}


/* =========================================================
   BATTLE MENU
========================================================= */

function drawBattleMenu() {

    const b=game.battle;


    battleMenu.forEach((text,i) => {

        const x =
            130 +
            (i%2)*65;

        const y =
            105 +
            Math.floor(i/2)*25;


        if (i===b.menu) {

            ctx.strokeStyle="#fff";

            ctx.strokeRect(
                x-7,
                y-9,
                58,
                17
            );

        }


        ctx.fillStyle="#fff";

        ctx.font="7px monospace";

        ctx.fillText(
            text,
            x,
            y+2
        );

    });

}


/* =========================================================
   ACT
========================================================= */

function drawActMenu() {

    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    ctx.fillText(
        "ACT",
        135,
        105
    );

    ctx.font="6px monospace";

    ctx.fillText(
        "ПОГОВОРИТЬ",
        135,
        120
    );

    ctx.fillText(
        "ОСМОТРЕТЬ",
        135,
        132
    );

    ctx.fillText(
        "X — назад",
        135,
        150
    );

}


/* =========================================================
   MERCY
========================================================= */

function drawMercyMenu() {

    const b=game.battle;


    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    ctx.fillText(
        "MERCY",
        135,
        105
    );


    ctx.font="6px monospace";

    ctx.fillText(
        "ПОЩАДИТЬ",
        135,
        120
    );


    ctx.fillText(
        "RD: "+
        Math.floor(b.rd)+"%",
        135,
        132
    );


    ctx.fillText(
        "ПОЩАДА: "+
        Math.floor(b.enemy.mercy)+"%",
        135,
        143
    );


    ctx.fillText(
        "X — назад",
        135,
        155
    );

}


/* =========================================================
   END
========================================================= */

function drawBattleEnd(title,subtitle) {

    ctx.fillStyle="#fff";

    ctx.font="12px monospace";

    ctx.fillText(
        title,
        105,
        110
    );

    ctx.font="7px monospace";

    ctx.fillText(
        subtitle,
        105,
        130
    );

}


/* =========================================================
   MENU C
========================================================= */

function updateMenu() {

    if (pressed("x")) {

        game.mode="explore";

        return;

    }

}


function drawMenu() {

    ctx.fillStyle="rgba(0,0,0,.94)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        25,
        15,
        270,
        145
    );


    ctx.fillStyle="#fff";

    ctx.font="12px monospace";

    ctx.fillText(
        "MENU",
        45,
        35
    );


    ctx.font="7px monospace";

    ctx.fillText(
        "СТАТУС",
        55,
        60
    );

    ctx.fillText(
        "ДЕЛЬТА   HP "+
        party[0].hp+
        "/"+
        party[0].maxHP,
        55,
        75
    );

    ctx.fillText(
        "ЛИЧИ     HP "+
        party[1].hp+
        "/"+
        party[1].maxHP,
        55,
        87
    );

    ctx.fillText(
        "ПАНКЕЙК  HP "+
        party[2].hp+
        "/"+
        party[2].maxHP,
        55,
        99
    );

    ctx.fillText(
        "КАШТАН   HP "+
        party[3].hp+
        "/"+
        party[3].maxHP,
        55,
        111
    );

    ctx.fillText(
        "ШАРЛОТА  HP "+
        party[4].hp+
        "/"+
        party[4].maxHP,
        55,
        123
    );


    ctx.fillText(
        "X — закрыть",
        55,
        145
    );

}


/* =========================================================
   WORLD DRAW
========================================================= */

function drawExplore() {

    drawWorldBackground();

    drawPath();

    drawTeam();

    drawDelta();


    /*
       ТЕКСТ
    */

    ctx.fillStyle="#fff";

    ctx.font="6px monospace";

    ctx.fillText(
        "ЦИФРОВАЯ ПУСТОШЬ",
        10,
        14
    );


    if (game.storyStep===0) {

        ctx.fillText(
            "Иди к команде...",
            110,
            25
        );

    }


    if (game.storyStep>=2) {

        ctx.fillText(
            "Найдите Немку.",
            110,
            25
        );

    }

}


/* =========================================================
   UPDATE
========================================================= */

function update() {

    if (game.mode==="title") {

        updateTitle();

    }

    else if (game.mode==="explore") {

        updatePlayer();

        randomBattleCheck();


        if (pressed("c")) {

            game.mode="menu";

        }

    }

    else if (game.mode==="dialogue") {

        updateDialogue();

    }

    else if (game.mode==="battle") {

        updateBattle();

    }

    else if (game.mode==="menu") {

        updateMenu();

    }


    /*
       Сохраняем старые кнопки
    */

    oldKeys.up=keys.up;
    oldKeys.down=keys.down;
    oldKeys.left=keys.left;
    oldKeys.right=keys.right;

    oldKeys.z=keys.z;
    oldKeys.x=keys.x;
    oldKeys.c=keys.c;

}


/* =========================================================
   DRAW
========================================================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    if (game.mode==="title") {

        drawTitle();

    }

    else if (game.mode==="explore") {

        drawExplore();

    }

    else if (game.mode==="dialogue") {

        drawExplore();

        ctx.fillStyle="rgba(0,0,0,.6)";

        ctx.fillRect(
            0,
            0,
            W,
            H
        );


        ctx.fillStyle="#000";

        ctx.fillRect(
            15,
            105,
            290,
            60
        );


        ctx.strokeStyle="#fff";

        ctx.lineWidth=2;

        ctx.strokeRect(
            15,
            105,
            290,
            60
        );


        ctx.fillStyle="#fff";

        ctx.font="7px monospace";

        ctx.fillText(
            game.dialogue[
                game.dialogueIndex
            ],
            28,
            128
        );


        ctx.font="6px monospace";

        ctx.fillText(
            "Z — далее",
            220,
            153
        );

        ctx.fillText(
            "X — пропустить",
            210,
            161
        );

    }

    else if (game.mode==="battle") {

        drawBattle();

    }

    else if (game.mode==="menu") {

        drawMenu();

    }

}


/* =========================================================
   LOOP
========================================================= */

function loop() {

    update();

    draw();

    requestAnimationFrame(loop);

}

loop();
