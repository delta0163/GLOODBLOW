"use strict";

/* =====================================================
   CANVAS
===================================================== */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = 640;
const H = 360;


/* =====================================================
   IMAGES
===================================================== */

const images = {};

function loadImage(name, src) {

    const img = new Image();

    img.src = src;

    images[name] = img;
}

loadImage("wasteland", "images/wasteland.png");

loadImage("delta", "images/delta.png");
loadImage("deltaLeft", "images/deltalef.png");
loadImage("deltaRight", "images/deltaright.png");
loadImage("deltaBack", "images/deltabach.png");

loadImage("error", "images/error.png");


/* =====================================================
   MUSIC
===================================================== */

const music = new Audio("sounds/wonderland.mp3");

music.loop = true;
music.volume = 0.35;

let musicStarted = false;

function startMusic() {

    if (musicStarted)
        return;

    musicStarted = true;

    music.play().catch(() => {
        musicStarted = false;
    });
}

window.addEventListener("pointerdown", startMusic, {
    once: false
});


/* =====================================================
   FULLSCREEN
===================================================== */

document
    .getElementById("fullscreen")
    .addEventListener("pointerdown", function(e) {

        e.preventDefault();

        if (!document.fullscreenElement) {

            document.documentElement
                .requestFullscreen()
                .catch(() => {});

        } else {

            document.exitFullscreen()
                .catch(() => {});

        }

    });


/* =====================================================
   INPUT
===================================================== */

const keys = {

    up: false,
    down: false,
    left: false,
    right: false,

    z: false,
    x: false,
    c: false
};

const oldKeys = {

    up: false,
    down: false,
    left: false,
    right: false,

    z: false,
    x: false,
    c: false
};


function pressed(key) {

    return keys[key] && !oldKeys[key];
}


/* =====================================================
   KEYBOARD
===================================================== */

window.addEventListener("keydown", function(e) {

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

    startMusic();

    e.preventDefault();

}, { passive:false });


window.addEventListener("keyup", function(e) {

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

}, { passive:false });


/* =====================================================
   MOBILE INPUT
===================================================== */

document.querySelectorAll(".joy").forEach(button => {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", function(e) {

        e.preventDefault();

        keys[key] = true;

        startMusic();

        button.setPointerCapture(e.pointerId);

    });

    button.addEventListener("pointerup", function(e) {

        e.preventDefault();

        keys[key] = false;

    });

    button.addEventListener("pointercancel", function() {

        keys[key] = false;

    });

});


document.querySelectorAll(".action").forEach(button => {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", function(e) {

        e.preventDefault();

        keys[key] = true;

        startMusic();

        button.setPointerCapture(e.pointerId);

    });

    button.addEventListener("pointerup", function() {

        keys[key] = false;

    });

    button.addEventListener("pointercancel", function() {

        keys[key] = false;

    });

});


/* =====================================================
   GAME STATE
===================================================== */

const game = {

    screen: "world",

    room: 1,

    dialogue: null,

    dialogueIndex: 0,

    transition: 0,

    transitionTarget: 0,

    encounterSteps: 0,

    encounterCooldown: 0,

    shopIndex: 0,

    shopMessage: "",

    menuIndex: 0

};


/* =====================================================
   PARTY
===================================================== */

const party = [

    {
        name: "ДЕЛЬТА",
        hp: 90,
        maxHP: 90,
        atk: 14,
        def: 8,
        color: "#fff"
    },

    {
        name: "ЛИЧИ",
        hp: 80,
        maxHP: 80,
        atk: 13,
        def: 6,
        color: "#66aaff"
    },

    {
        name: "ПАНКЕЙК",
        hp: 70,
        maxHP: 70,
        atk: 10,
        def: 11,
        color: "#66dd77"
    },

    {
        name: "КАШТАН",
        hp: 110,
        maxHP: 110,
        atk: 12,
        def: 12,
        color: "#cc8844"
    },

    {
        name: "ШАРЛОТА",
        hp: 100,
        maxHP: 100,
        atk: 13,
        def: 9,
        color: "#ff77cc"
    }

];


/* =====================================================
   PLAYER
===================================================== */

const player = {

    x: 110,
    y: 265,

    speed: 2.2,

    direction: "down"
};


/* =====================================================
   PARTY FOLLOWERS
===================================================== */

const followers = [

    {
        x: 85,
        y: 265,
        color: "#66aaff"
    },

    {
        x: 65,
        y: 265,
        color: "#66dd77"
    },

    {
        x: 45,
        y: 265,
        color: "#cc8844"
    },

    {
        x: 25,
        y: 265,
        color: "#ff77cc"
    }

];


/* =====================================================
   WORLD
===================================================== */

const world = {

    room1: {

        name: "ЦИФРОВАЯ ПУСТОШЬ",

        background: "wasteland",

        startX: 110,

        startY: 265,

        transitionX: 570,

        transitionY: 130,

        transitionW: 60,

        transitionH: 110,

        teamX: 260,

        teamY: 175

    },

    room2: {

        name: "ПУСТОШЬ — ТОРГОВЫЙ ПОСТ",

        background: "wasteland",

        startX: 80,

        startY: 250,

        transitionX: 0,

        transitionY: 130,

        transitionW: 40,

        transitionH: 110,

        shopX: 430,

        shopY: 120

    }

};


/* =====================================================
   DIALOGUE
===================================================== */

const introDialogue = [

    {
        name: "ЛИЧИ",
        text: "Надо проверить Немку... Она изменилась."
    },

    {
        name: "ЛИЧИ",
        text: "Последний раз, когда мы пытались поговорить с ней, она была очень странной."
    },

    {
        name: "ДЕЛЬТА",
        text: "Так мы идём?"
    },

    {
        name: "ЛИЧИ",
        text: "Да."
    },

    {
        name: "ПАНКЕЙК",
        text: "Тогда не будем терять время."
    },

    {
        name: "КАШТАН",
        text: "Надеюсь, с Немкой всё ещё можно поговорить."
    },

    {
        name: "ШАРЛОТА",
        text: "Если она действительно изменилась... нам нужно быть осторожнее."
    },

    {
        name: "ЛИЧИ",
        text: "Идём через пустошь."
    }

];


/* =====================================================
   START
===================================================== */

let introStarted = false;

function startIntro() {

    if (introStarted)
        return;

    introStarted = true;

    game.dialogue = introDialogue;
    game.dialogueIndex = 0;

    game.screen = "dialogue";

}


/* =====================================================
   WORLD UPDATE
===================================================== */

function updateWorld() {

    if (game.transition > 0)
        return;


    let dx = 0;
    let dy = 0;

    if (keys.up) {

        dy -= player.speed;

        player.direction = "up";

    }

    if (keys.down) {

        dy += player.speed;

        player.direction = "down";

    }

    if (keys.left) {

        dx -= player.speed;

        player.direction = "left";

    }

    if (keys.right) {

        dx += player.speed;

        player.direction = "right";

    }


    if (dx !== 0 && dy !== 0) {

        dx *= 0.707;
        dy *= 0.707;

    }


    player.x += dx;
    player.y += dy;


    player.x =
        Math.max(
            25,
            Math.min(
                W - 25,
                player.x
            )
        );

    player.y =
        Math.max(
            75,
            Math.min(
                H - 35,
                player.y
            )
        );


    if (dx !== 0 || dy !== 0) {

        game.encounterSteps++;

    }


    if (game.encounterCooldown > 0) {

        game.encounterCooldown--;

    }


    /*
       БОИ НЕ КАЖДЫЕ 2 ШАГА.

       Первый возможный бой только после
       достаточно долгого движения.
    */

    if (
        game.encounterSteps > 180 &&
        game.encounterCooldown <= 0
    ) {

        const chance =
            0.0025;

        if (Math.random() < chance) {

            startBattle();

            game.encounterSteps = 0;

            game.encounterCooldown = 420;

            return;

        }

    }


    const room =
        game.room === 1
            ? world.room1
            : world.room2;


    /*
       ПЕРЕХОД В СЛЕДУЮЩУЮ КОМНАТУ
    */

    if (
        player.x >
        room.transitionX &&
        player.x <
        room.transitionX +
        room.transitionW &&

        player.y >
        room.transitionY &&
        player.y <
        room.transitionY +
        room.transitionH
    ) {

        if (game.room === 1) {

            beginTransition(2);

        }

        else {

            beginTransition(1);

        }

    }


    /*
       МАГАЗИН
    */

    if (
        game.room === 2 &&
        distance(
            player.x,
            player.y,
            world.room2.shopX,
            world.room2.shopY
        ) < 45
    ) {

        if (pressed("z")) {

            game.screen = "shop";

            game.shopIndex = 0;

            game.shopMessage = "";

        }

    }


    /*
       C = меню
    */

    if (pressed("c")) {

        game.screen = "menu";

        game.menuIndex = 0;

    }

}


/* =====================================================
   FOLLOWERS
===================================================== */

function updateFollowers() {

    if (game.screen !== "world")
        return;


    const targets = [

        {
            x: player.x - 18,
            y: player.y
        },

        {
            x: player.x - 36,
            y: player.y
        },

        {
            x: player.x - 54,
            y: player.y
        },

        {
            x: player.x - 72,
            y: player.y
        }

    ];


    followers.forEach((f, i) => {

        const target = targets[i];

        f.x +=
            (target.x - f.x) * 0.08;

        f.y +=
            (target.y - f.y) * 0.08;

    });

}


/* =====================================================
   TRANSITION
===================================================== */

function beginTransition(target) {

    game.transitionTarget = target;

    game.transition = 60;

}


function updateTransition() {

    if (game.transition <= 0)
        return;


    game.transition--;

    if (game.transition === 30) {

        game.room =
            game.transitionTarget;

        const room =
            game.room === 1
                ? world.room1
                : world.room2;

        player.x = room.startX;
        player.y = room.startY;

        followers.forEach((f, i) => {

            f.x =
                player.x -
                20 -
                i * 20;

            f.y =
                player.y;

        });

    }

}


/* =====================================================
   DISTANCE
===================================================== */

function distance(x1,y1,x2,y2) {

    const dx=x1-x2;
    const dy=y1-y2;

    return Math.sqrt(
        dx*dx+dy*dy
    );

}


/* =====================================================
   DIALOGUE
===================================================== */

function updateDialogue() {

    if (pressed("z")) {

        game.dialogueIndex++;

        if (
            game.dialogueIndex >=
            game.dialogue.length
        ) {

            game.dialogue = null;

            game.screen = "world";

            player.x = 120;
            player.y = 260;

        }

    }


    if (pressed("x")) {

        game.dialogue = null;

        game.screen = "world";

    }

}


/* =====================================================
   BATTLE
===================================================== */

function startBattle() {

    const enemyCount =
        Math.random() < 0.65
            ? 1
            : 2 + Math.floor(Math.random() * 2);


    const enemies = [];


    for (let i=0; i<enemyCount; i++) {

        enemies.push({

            hp: 45 + Math.floor(Math.random()*20),

            maxHP: 45 + Math.floor(Math.random()*20),

            x: 180 + i*75,

            y: 80,

            alive: true

        });

    }


    game.battle = {

        enemies: enemies,

        actor: 0,

        phase: "menu",

        menu: 0,

        act: 0,

        message:
            "Ошибка системы появилась в пустоши.",

        soul: {

            x: 320,

            y: 255,

            speed: 3.2,

            invincible: 0

        },

        bullets: [],

        attackTimer: 0,

        laserWarning: [],

        explosions: [],

        defense: false

    };


    game.screen = "battle";

}


/* =====================================================
   BATTLE UPDATE
===================================================== */

function updateBattle() {

    const b = game.battle;

    if (!b)
        return;


    if (b.phase === "menu") {

        if (pressed("left")) {

            b.menu--;

            if (b.menu < 0)
                b.menu = 3;

        }

        if (pressed("right")) {

            b.menu++;

            if (b.menu > 3)
                b.menu = 0;

        }


        if (pressed("z")) {

            battleChoose();

        }

    }


    else if (b.phase === "act") {

        if (pressed("up")) {

            b.act--;

            if (b.act < 0)
                b.act = 2;

        }

        if (pressed("down")) {

            b.act++;

            if (b.act > 2)
                b.act = 0;

        }

        if (pressed("x")) {

            b.phase = "menu";

        }

        if (pressed("z")) {

            b.message =
                "Вы изучили ошибку. Она нестабильна.";

            nextBattleActor();

        }

    }


    else if (b.phase === "defend") {

        updateSoul();

        if (pressed("z")) {

            b.message =
                "Отряд защищается.";

            b.phase = "enemy";

            beginEnemyAttack();

        }

    }


    else if (b.phase === "enemy") {

        updateEnemyAttack();

    }


    else if (b.phase === "victory") {

        if (pressed("z")) {

            game.screen = "world";

            game.battle = null;

        }

    }


    else if (b.phase === "defeat") {

        if (pressed("z")) {

            party.forEach(p => {

                p.hp = p.maxHP;

            });

            game.screen = "world";

            game.battle = null;

        }

    }

}


/* =====================================================
   BATTLE CHOICE
===================================================== */

function battleChoose() {

    const b = game.battle;

    const actor = party[b.actor];


    /*
       FIGHT
    */

    if (b.menu === 0) {

        const alive =
            b.enemies.filter(e => e.alive);


        if (alive.length === 0)
            return;


        const enemy =
            alive[0];


        const damage =
            actor.atk +
            Math.floor(
                Math.random()*7
            );


        enemy.hp -= damage;


        if (enemy.hp <= 0) {

            enemy.hp = 0;

            enemy.alive = false;

            b.message =
                actor.name +
                " уничтожает ошибку!";

        }

        else {

            b.message =
                actor.name +
                " атакует! Урон: " +
                damage;

        }


        if (
            b.enemies.every(e => !e.alive)
        ) {

            b.phase = "victory";

            b.message =
                "Все ошибки исчезли.";

            return;

        }


        nextBattleActor();

    }


    /*
       ACT
    */

    else if (b.menu === 1) {

        b.phase = "act";

        b.act = 0;

    }


    /*
       DEFEND
    */

    else if (b.menu === 2) {

        /*
           ВАЖНО:

           защита НЕ увеличивает RD.

           RD здесь вообще не связан
           с защитой.
        */

        b.defense = true;

        b.message =
            actor.name +
            " готовится защищаться.";

        nextBattleActor();

    }


    /*
       MERCY
    */

    else if (b.menu === 3) {

        b.message =
            "Отказаться от боя пока нельзя.";

        nextBattleActor();

    }

}


/* =====================================================
   NEXT ACTOR
===================================================== */

function nextBattleActor() {

    const b = game.battle;

    b.actor++;


    /*
       ВСЕ ПЯТЬ СОЮЗНИКОВ ХОДЯТ.
    */

    if (b.actor >= party.length) {

        b.actor = 0;

        b.phase = "enemy";

        beginEnemyAttack();

    }

    else {

        b.phase = "menu";

        b.menu = 0;

        b.message =
            "Ход: " +
            party[b.actor].name;

    }

}


/* =====================================================
   ENEMY ATTACK
===================================================== */

function beginEnemyAttack() {

    const b = game.battle;

    b.attackTimer = 420;

    b.bullets = [];

    b.laserWarning = [];

    b.explosions = [];


    /*
       ОДНА ОШИБКА = ЛАЗЕРЫ
    */

    if (
        b.enemies.filter(e => e.alive).length === 1
    ) {

        for (let i=0; i<4; i++) {

            b.laserWarning.push({

                x: 100 + Math.random()*440,

                timer:
                    50 +
                    Math.random()*100,

                fired: false

            });

        }

    }


    /*
       2+ ОШИБКИ = ВЗРЫВЫ
    */

    else {

        for (let i=0; i<9; i++) {

            b.explosions.push({

                x: 100 + Math.random()*440,

                y: 170 + Math.random()*120,

                timer:
                    80 +
                    Math.random()*200,

                active: false,

                radius: 0

            });

        }

    }

}


/* =====================================================
   SOUL
===================================================== */

function updateSoul() {

    const b = game.battle;

    const soul = b.soul;


    if (keys.up)
        soul.y -= soul.speed;

    if (keys.down)
        soul.y += soul.speed;

    if (keys.left)
        soul.x -= soul.speed;

    if (keys.right)
        soul.x += soul.speed;


    /*
       ГРАНИЦЫ БОЕВОГО ПОЛЯ
    */

    soul.x =
        Math.max(
            190,
            Math.min(
                450,
                soul.x
            )
        );


    soul.y =
        Math.max(
            185,
            Math.min(
                315,
                soul.y
            )
        );


    if (soul.invincible > 0)
        soul.invincible--;

}


/* =====================================================
   ENEMY ATTACK UPDATE
===================================================== */

function updateEnemyAttack() {

    const b = game.battle;

    updateSoul();


    if (b.attackTimer > 0)
        b.attackTimer--;


    /*
       ЛАЗЕРЫ
    */

    b.laserWarning.forEach(laser => {

        laser.timer--;


        if (laser.timer <= 0) {

            laser.fired = true;

        }


        if (
            laser.fired &&
            laser.timer > -28
        ) {

            const hit =
                Math.abs(
                    b.soul.x - laser.x
                ) < 7;


            if (hit) {

                damageSoul();

            }

        }

    });


    /*
       ВЗРЫВЫ
    */

    b.explosions.forEach(explosion => {

        explosion.timer--;


        if (explosion.timer <= 0) {

            explosion.active = true;

            explosion.radius += 2;


            if (explosion.radius > 30) {

                explosion.timer = 70;

                explosion.radius = 0;

                explosion.active = false;

            }

        }


        if (explosion.active) {

            const d =
                distance(
                    b.soul.x,
                    b.soul.y,
                    explosion.x,
                    explosion.y
                );


            if (
                d <
                explosion.radius + 5
            ) {

                damageSoul();

            }

        }

    });


    if (b.attackTimer <= 0) {

        b.phase = "menu";

        b.defense = false;

        b.message =
            "Ошибка закончила атаку.";

    }

}


/* =====================================================
   DAMAGE
===================================================== */

function damageSoul() {

    const b = game.battle;


    if (b.soul.invincible > 0)
        return;


    /*
       При защите урон меньше.
    */

    const actor =
        party[b.actor];


    let damage = 8;


    if (b.defense)
        damage = 4;


    actor.hp =
        Math.max(
            0,
            actor.hp - damage
        );


    /*
       HP сразу исчезает после попадания.
    */

    b.message =
        actor.name +
        " получил " +
        damage +
        " урона!";


    b.soul.invincible = 45;


    if (
        actor.hp <= 0
    ) {

        b.message =
            actor.name +
            " больше не может сражаться.";

    }


    if (
        party.every(
            p => p.hp <= 0
        )
    ) {

        b.phase = "defeat";

    }

}


/* =====================================================
   DRAW IMAGE BACKGROUND
===================================================== */

function drawBackground() {

    const img =
        images.wasteland;


    if (
        img &&
        img.complete &&
        img.naturalWidth > 0
    ) {

        /*
           Фон немного уменьшаем,
           чтобы он не выглядел слишком приближённым.
        */

        const scale = 0.72;

        const iw =
            img.naturalWidth * scale;

        const ih =
            img.naturalHeight * scale;

        const x =
            (W - iw) / 2;

        const y =
            (H - ih) / 2;

        ctx.drawImage(
            img,
            x,
            y,
            iw,
            ih
        );

    }

    else {

        ctx.fillStyle="#15151c";

        ctx.fillRect(
            0,
            0,
            W,
            H
        );

        ctx.fillStyle="#292936";

        for (let i=0;i<30;i++) {

            ctx.fillRect(
                Math.random()*W,
                80+Math.random()*240,
                2,
                2
            );

        }

    }

}


/* =====================================================
   CHARACTER SPRITE
===================================================== */

function drawDelta(x,y) {

    let img = images.delta;


    if (
        player.direction === "left" &&
        images.deltaLeft.complete
    )
        img = images.deltaLeft;

    if (
        player.direction === "right" &&
        images.deltaRight.complete
    )
        img = images.deltaRight;

    if (
        player.direction === "up" &&
        images.deltaBack.complete
    )
        img = images.deltaBack;


    if (
        img &&
        img.complete &&
        img.naturalWidth > 0
    ) {

        ctx.drawImage(
            img,
            x-20,
            y-32,
            40,
            40
        );

    }

    else {

        ctx.fillStyle="#fff";

        ctx.fillRect(
            x-7,
            y-18,
            14,
            22
        );

    }

}


/* =====================================================
   FOLLOWER
===================================================== */

function drawFollower(x,y,color) {

    ctx.fillStyle="#000";

    ctx.fillRect(
        x-7,
        y-20,
        15,
        24
    );

    ctx.fillStyle=color;

    ctx.fillRect(
        x-5,
        y-18,
        10,
        17
    );

}


/* =====================================================
   WORLD DRAW
===================================================== */

function drawWorld() {

    drawBackground();


    /*
       ТРОПИНКА
    */

    ctx.fillStyle="rgba(40,35,30,.75)";

    ctx.beginPath();

    ctx.moveTo(0,285);

    ctx.lineTo(640,250);

    ctx.lineTo(640,340);

    ctx.lineTo(0,340);

    ctx.closePath();

    ctx.fill();


    /*
       ПЕРЕХОД
    */

    const room =
        game.room === 1
            ? world.room1
            : world.room2;


    ctx.fillStyle="#111";

    ctx.fillRect(
        room.transitionX,
        room.transitionY,
        room.transitionW,
        room.transitionH
    );


    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        room.transitionX,
        room.transitionY,
        room.transitionW,
        room.transitionH
    );


    ctx.fillStyle="#fff";

    ctx.font="10px monospace";

    if (game.room === 1) {

        ctx.fillText(
            "ДАЛЬШЕ",
            535,
            125
        );

    }


    /*
       МАГАЗИН
    */

    if (game.room === 2) {

        ctx.fillStyle="#241b16";

        ctx.fillRect(
            390,
            75,
            100,
            100
        );

        ctx.strokeStyle="#fff";

        ctx.strokeRect(
            390,
            75,
            100,
            100
        );

        ctx.fillStyle="#fff";

        ctx.font="12px monospace";

        ctx.fillText(
            "МАГАЗИН",
            402,
            100
        );

        ctx.font="7px monospace";

        ctx.fillText(
            "ЕДА • ОРУЖИЕ • БРОНЯ",
            397,
            120
        );

        ctx.fillText(
            "Z — войти",
            412,
            155
        );

    }


    /*
       КОМАНДА
    */

    if (
        game.room === 1 &&
        !introStarted
    ) {

        ctx.fillStyle="#fff";

        ctx.font="8px monospace";

        ctx.fillText(
            "▶ Z — поговорить с командой",
            210,
            150
        );

    }


    followers.forEach(f => {

        drawFollower(
            f.x,
            f.y,
            f.color
        );

    });


    drawDelta(
        player.x,
        player.y
    );


    ctx.fillStyle="#fff";

    ctx.font="9px monospace";

    ctx.fillText(
        room.name,
        15,
        25
    );


    ctx.font="7px monospace";

    ctx.fillText(
        "C — меню",
        15,
        42
    );


    /*
       ПЕРВАЯ ВСТРЕЧА С КОМАНДОЙ
    */

    if (
        game.room === 1 &&
        !introStarted &&
        distance(
            player.x,
            player.y,
            world.room1.teamX,
            world.room1.teamY
        ) < 55
    ) {

        ctx.fillStyle="#fff";

        ctx.font="8px monospace";

        ctx.fillText(
            "Z — поговорить",
            225,
            170
        );


        if (pressed("z")) {

            startIntro();

        }

    }

}


/* =====================================================
   DIALOGUE DRAW
===================================================== */

function drawDialogue() {

    drawWorld();


    ctx.fillStyle="rgba(0,0,0,.62)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    const d =
        game.dialogue[
            game.dialogueIndex
        ];


    ctx.fillStyle="#000";

    ctx.fillRect(
        30,
        230,
        580,
        105
    );


    ctx.strokeStyle="#fff";

    ctx.lineWidth=3;

    ctx.strokeRect(
        30,
        230,
        580,
        105
    );


    ctx.fillStyle="#fff";

    ctx.font="13px monospace";

    ctx.fillText(
        d.name,
        50,
        255
    );


    ctx.font="11px monospace";

    wrapText(
        d.text,
        50,
        280,
        530,
        15
    );


    ctx.font="8px monospace";

    ctx.fillText(
        "Z — далее",
        490,
        320
    );

    ctx.fillText(
        "X — пропустить",
        390,
        320
    );

}


/* =====================================================
   TEXT WRAP
===================================================== */

function wrapText(text,x,y,width,lineHeight) {

    const words =
        text.split(" ");

    let line="";


    for (
        let i=0;
        i<words.length;
        i++
    ) {

        const test =
            line +
            words[i] +
            " ";


        if (
            ctx.measureText(test).width >
            width &&
            line
        ) {

            ctx.fillText(
                line,
                x,
                y
            );

            line =
                words[i] +
                " ";

            y += lineHeight;

        }

        else {

            line = test;

        }

    }


    ctx.fillText(
        line,
        x,
        y
    );

}


/* =====================================================
   BATTLE DRAW
===================================================== */

function drawBattle() {

    ctx.fillStyle="#050505";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    const b =
        game.battle;


    /*
       ВРАГИ
    */

    b.enemies.forEach((enemy, i) => {

        if (!enemy.alive)
            return;


        drawError(
            enemy.x,
            enemy.y
        );


        ctx.fillStyle="#fff";

        ctx.font="8px monospace";

        ctx.fillText(
            "ERROR",
            enemy.x-25,
            enemy.y-45
        );


        drawBar(
            enemy.x-25,
            enemy.y-38,
            50,
            5,
            enemy.hp,
            enemy.maxHP
        );

    });


    /*
       ТЕКСТ
    */

    ctx.fillStyle="#fff";

    ctx.font="10px monospace";

    wrapText(
        b.message,
        35,
        160,
        570,
        13
    );


    /*
       БОЕВОЕ ПОЛЕ
    */

    ctx.strokeStyle="#fff";

    ctx.lineWidth=3;

    ctx.strokeRect(
        170,
        180,
        300,
        145
    );


    /*
       ВРАЖЕСКАЯ АТАКА
    */

    if (
        b.phase === "enemy"
    ) {

        drawEnemyAttack();

    }


    /*
       SOUL
    */

    if (
        b.phase === "enemy"
    ) {

        ctx.fillStyle="#ff3333";

        ctx.fillRect(
            b.soul.x-6,
            b.soul.y-6,
            12,
            12
        );

    }


    /*
       PARTY
    */

    drawPartyHP();


    /*
       МЕНЮ
    */

    if (
        b.phase === "menu"
    ) {

        drawBattleMenu();

    }


    if (
        b.phase === "act"
    ) {

        drawActMenu();

    }


    if (
        b.phase === "victory"
    ) {

        ctx.fillStyle="#fff";

        ctx.font="22px monospace";

        ctx.fillText(
            "ПОБЕДА",
            255,
            165
        );

        ctx.font="9px monospace";

        ctx.fillText(
            "Z — продолжить",
            255,
            190
        );

    }


    if (
        b.phase === "defeat"
    ) {

        ctx.fillStyle="#fff";

        ctx.font="18px monospace";

        ctx.fillText(
            "ОТРЯД ПОБЕЖДЁН",
            220,
            165
        );

        ctx.font="9px monospace";

        ctx.fillText(
            "Z — восстановиться",
            250,
            190
        );

    }

}


/* =====================================================
   ERROR SPRITE
===================================================== */

function drawError(x,y) {

    const img =
        images.error;


    if (
        img &&
        img.complete &&
        img.naturalWidth > 0
    ) {

        ctx.drawImage(
            img,
            x-35,
            y-35,
            70,
            70
        );

    }

    else {

        ctx.fillStyle="#8a2be2";

        ctx.fillRect(
            x-25,
            y-25,
            50,
            50
        );

        ctx.fillStyle="#fff";

        ctx.fillRect(
            x-12,
            y-7,
            7,
            7
        );

        ctx.fillRect(
            x+5,
            y-7,
            7,
            7
        );

    }

}


/* =====================================================
   HP
===================================================== */

function drawBar(
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


    const percent =
        Math.max(
            0,
            hp / max
        );


    ctx.fillStyle="#fff";

    ctx.fillRect(
        x,
        y,
        w * percent,
        h
    );

}


/* =====================================================
   PARTY HP
===================================================== */

function drawPartyHP() {

    const b =
        game.battle;


    party.forEach((p,i) => {

        const y =
            35 + i*25;


        ctx.fillStyle=p.color;

        ctx.font="8px monospace";

        ctx.fillText(
            p.name,
            15,
            y
        );


        drawBar(
            80,
            y-7,
            55,
            7,
            p.hp,
            p.maxHP
        );


        ctx.fillStyle="#fff";

        ctx.fillText(
            p.hp+"/"+p.maxHP,
            140,
            y
        );


        if (
            i === b.actor &&
            b.phase === "menu"
        ) {

            ctx.fillText(
                "▶",
                5,
                y
            );

        }

    });

}


/* =====================================================
   BATTLE MENU
===================================================== */

function drawBattleMenu() {

    const b =
        game.battle;


    const options = [

        "FIGHT",
        "ACT",
        "DEFEND",
        "MERCY"

    ];


    options.forEach((text,i) => {

        const x =
            185 +
            (i % 2) * 140;

        const y =
            345 -
            Math.floor(i/2)*30;


        if (i === b.menu) {

            ctx.strokeStyle="#fff";

            ctx.strokeRect(
                x-10,
                y-16,
                110,
                23
            );

        }


        ctx.fillStyle="#fff";

        ctx.font="10px monospace";

        ctx.fillText(
            text,
            x,
            y
        );

    });

}


/* =====================================================
   ACT MENU
===================================================== */

function drawActMenu() {

    const b =
        game.battle;


    ctx.fillStyle="#000";

    ctx.fillRect(
        185,
        260,
        250,
        55
    );


    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        185,
        260,
        250,
        55
    );


    const acts = [

        "ОСМОТРЕТЬ",
        "ПОГОВОРИТЬ",
        "ПОМЕШАТЬ"

    ];


    acts.forEach((text,i) => {

        ctx.fillStyle="#fff";

        ctx.font="8px monospace";

        if (i === b.act) {

            ctx.fillText(
                "▶",
                195,
                278+i*12
            );

        }

        ctx.fillText(
            text,
            210,
            278+i*12
        );

    });


    ctx.fillText(
        "X — назад",
        350,
        307
    );

}


/* =====================================================
   ENEMY ATTACK DRAW
===================================================== */

function drawEnemyAttack() {

    const b =
        game.battle;


    /*
       ОДНА ОШИБКА:
       ПРЕДУПРЕЖДЕНИЕ ЛАЗЕРА
    */

    b.laserWarning.forEach(laser => {

        if (
            !laser.fired
        ) {

            ctx.fillStyle="#ff4444";

            ctx.globalAlpha=.35;

            ctx.fillRect(
                laser.x-2,
                180,
                4,
                145
            );

            ctx.globalAlpha=1;

        }

        else {

            ctx.fillStyle="#fff";

            ctx.fillRect(
                laser.x-4,
                180,
                8,
                145
            );

        }

    });


    /*
       2+ ОШИБКИ:
       ВЗРЫВЫ
    */

    b.explosions.forEach(explosion => {

        if (!explosion.active)
            return;


        ctx.strokeStyle="#fff";

        ctx.lineWidth=2;

        ctx.beginPath();

        ctx.arc(
            explosion.x,
            explosion.y,
            explosion.radius,
            0,
            Math.PI*2
        );

        ctx.stroke();


        ctx.fillStyle="#fff";

        for (
            let i=0;
            i<8;
            i++
        ) {

            const a =
                i * Math.PI / 4;

            const px =
                explosion.x +
                Math.cos(a) *
                explosion.radius;

            const py =
                explosion.y +
                Math.sin(a) *
                explosion.radius;

            ctx.fillRect(
                px-2,
                py-2,
                4,
                4
            );

        }

    });

}


/* =====================================================
   SHOP
===================================================== */

const shopItems = [

    {
        name:"ЕДА",
        description:"Восстанавливает 25 HP.",
        price:10
    },

    {
        name:"ОРУЖИЕ",
        description:"+3 к атаке Дельты.",
        price:30
    },

    {
        name:"БРОНЯ",
        description:"+3 к защите Дельты.",
        price:25
    }

];


let money = 100;


function updateShop() {

    if (pressed("up")) {

        game.shopIndex--;

        if (game.shopIndex < 0)
            game.shopIndex =
                shopItems.length-1;

    }


    if (pressed("down")) {

        game.shopIndex++;

        if (
            game.shopIndex >=
            shopItems.length
        )
            game.shopIndex = 0;

    }


    if (pressed("x")) {

        game.screen="world";

        return;

    }


    if (pressed("z")) {

        const item =
            shopItems[
                game.shopIndex
            ];


        if (money < item.price) {

            game.shopMessage =
                "Недостаточно денег.";

            return;

        }


        money -= item.price;


        if (
            game.shopIndex === 0
        ) {

            party.forEach(p => {

                p.hp =
                    Math.min(
                        p.maxHP,
                        p.hp + 25
                    );

            });

        }


        if (
            game.shopIndex === 1
        ) {

            party[0].atk += 3;

        }


        if (
            game.shopIndex === 2
        ) {

            party[0].def += 3;

        }


        game.shopMessage =
            item.name +
            " куплено!";

    }

}


/* =====================================================
   SHOP DRAW
===================================================== */

function drawShop() {

    drawBackground();


    ctx.fillStyle="rgba(0,0,0,.8)";

    ctx.fillRect(
        80,
        35,
        480,
        290
    );


    ctx.strokeStyle="#fff";

    ctx.lineWidth=3;

    ctx.strokeRect(
        80,
        35,
        480,
        290
    );


    ctx.fillStyle="#fff";

    ctx.font="18px monospace";

    ctx.fillText(
        "ТОРГОВЫЙ ПОСТ",
        215,
        70
    );


    ctx.font="10px monospace";

    ctx.fillText(
        "Деньги: " + money,
        100,
        95
    );


    shopItems.forEach((item,i) => {

        const y =
            125+i*55;


        if (
            i === game.shopIndex
        ) {

            ctx.strokeStyle="#fff";

            ctx.strokeRect(
                105,
                y-20,
                430,
                42
            );

            ctx.fillText(
                "▶",
                115,
                y+5
            );

        }


        ctx.fillStyle="#fff";

        ctx.font="11px monospace";

        ctx.fillText(
            item.name,
            140,
            y
        );


        ctx.font="8px monospace";

        ctx.fillText(
            item.description,
            230,
            y
        );


        ctx.fillText(
            item.price + " G",
            480,
            y
        );

    });


    ctx.font="8px monospace";

    ctx.fillText(
        "Z — купить",
        110,
        305
    );

    ctx.fillText(
        "X — выйти",
        450,
        305
    );


    if (game.shopMessage) {

        ctx.fillText(
            game.shopMessage,
            250,
            285
        );

    }

}


/* =====================================================
   MENU
===================================================== */

function updateMenu() {

    if (pressed("x")) {

        game.screen="world";

        return;

    }


    if (pressed("up")) {

        game.menuIndex--;

        if (game.menuIndex < 0)
            game.menuIndex=2;

    }


    if (pressed("down")) {

        game.menuIndex++;

        if (game.menuIndex > 2)
            game.menuIndex=0;

    }

}


/* =====================================================
   MENU DRAW
===================================================== */

function drawMenu() {

    ctx.fillStyle="#050505";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.strokeStyle="#fff";

    ctx.lineWidth=3;

    ctx.strokeRect(
        50,
        25,
        540,
        310
    );


    ctx.fillStyle="#fff";

    ctx.font="18px monospace";

    ctx.fillText(
        "BLOOD GLOW",
        80,
        60
    );


    const options = [

        "СТАТУС",
        "ПРЕДМЕТЫ",
        "ВЫХОД"

    ];


    options.forEach((text,i) => {

        const y =
            115+i*45;


        if (
            i === game.menuIndex
        ) {

            ctx.fillText(
                "▶",
                100,
                y
            );

        }


        ctx.fillText(
            text,
            130,
            y
        );

    });


    ctx.font="9px monospace";

    ctx.fillText(
        "ДЕЛЬТА ATK " + party[0].atk,
        350,
        115
    );

    ctx.fillText(
        "ДЕЛЬТА DEF " + party[0].def,
        350,
        135
    );

    ctx.fillText(
        "GOLD " + money,
        350,
        155
    );


    ctx.fillText(
        "X — закрыть",
        470,
        310
    );

}


/* =====================================================
   DRAW TRANSITION
===================================================== */

function drawTransition() {

    if (game.transition <= 0)
        return;


    const progress =
        game.transition / 60;


    let alpha;


    if (progress > .5) {

        alpha =
            1-progress;

    }

    else {

        alpha =
            progress;

    }


    ctx.fillStyle =
        "rgba(0,0,0," +
        Math.min(1,alpha*2) +
        ")";


    ctx.fillRect(
        0,
        0,
        W,
        H
    );

}


/* =====================================================
   MAIN UPDATE
===================================================== */

function update() {

    if (game.screen === "world") {

        updateWorld();

        updateFollowers();

    }


    else if (
        game.screen === "dialogue"
    ) {

        updateDialogue();

    }


    else if (
        game.screen === "battle"
    ) {

        updateBattle();

    }


    else if (
        game.screen === "shop"
    ) {

        updateShop();

    }


    else if (
        game.screen === "menu"
    ) {

        updateMenu();

    }


    updateTransition();


    /*
       СОХРАНЯЕМ СОСТОЯНИЕ КЛАВИШ
    */

    Object.keys(keys).forEach(key => {

        oldKeys[key] = keys[key];

    });

}


/* =====================================================
   MAIN DRAW
===================================================== */

function draw() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    if (
        game.screen === "world"
    ) {

        drawWorld();

    }


    else if (
        game.screen === "dialogue"
    ) {

        drawDialogue();

    }


    else if (
        game.screen === "battle"
    ) {

        drawBattle();

    }


    else if (
        game.screen === "shop"
    ) {

        drawShop();

    }


    else if (
        game.screen === "menu"
    ) {

        drawMenu();

    }


    drawTransition();

}


/* =====================================================
   START
===================================================== */

function loop() {

    update();

    draw();

    requestAnimationFrame(loop);

}


/*
   Небольшая задержка перед началом,
   чтобы картинки успели загрузиться.
*/

setTimeout(() => {

    startIntro();

}, 400);


loop();
