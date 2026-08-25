"use strict";

/* =========================================================
   CANVAS
========================================================= */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = 960;
const H = 540;


/* =========================================================
   IMAGES
========================================================= */

const images = {};

const imageFiles = {

    wasteland: "images/wasteland.png",
    path: "images/path.png",

    delta: "images/delta.png",
    deltalef: "images/deltalef.png",
    deltaright: "images/deltaright.png",
    deltabach: "images/deltabach.png",

    error: "images/error.png"

};

let imagesLoaded = 0;

const imageNames = Object.keys(imageFiles);

imageNames.forEach(function(name) {

    const img = new Image();

    img.src = imageFiles[name];

    img.onload = function() {

        imagesLoaded++;

    };

    img.onerror = function() {

        console.warn(
            "Не найдено изображение:",
            imageFiles[name]
        );

    };

    images[name] = img;

});


/* =========================================================
   SOUND
========================================================= */

const music = new Audio("sounds/wonderland.mp3");

music.loop = true;
music.volume = 0.35;

let musicStarted = false;

function startMusic() {

    if (musicStarted)
        return;

    musicStarted = true;

    music.play().catch(function() {

        musicStarted = false;

    });

}


/* =========================================================
   FULLSCREEN
========================================================= */

document
    .getElementById("fullscreen")
    .addEventListener("pointerdown", function(e) {

        e.preventDefault();

        if (!document.fullscreenElement) {

            document.documentElement
                .requestFullscreen()
                .catch(function(){});

        } else {

            document.exitFullscreen()
                .catch(function(){});

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


function justPressed(key) {

    return keys[key] && !oldKeys[key];

}


/* =========================================================
   KEYBOARD
========================================================= */

window.addEventListener("keydown", function(e) {

    startMusic();

    const key = e.key.toLowerCase();

    if (e.key === "ArrowUp" || key === "w")
        keys.up = true;

    if (e.key === "ArrowDown" || key === "s")
        keys.down = true;

    if (e.key === "ArrowLeft" || key === "a")
        keys.left = true;

    if (e.key === "ArrowRight" || key === "d")
        keys.right = true;

    if (key === "z")
        keys.z = true;

    if (key === "x")
        keys.x = true;

    if (key === "c")
        keys.c = true;

    e.preventDefault();

}, {passive:false});


window.addEventListener("keyup", function(e) {

    const key = e.key.toLowerCase();

    if (e.key === "ArrowUp" || key === "w")
        keys.up = false;

    if (e.key === "ArrowDown" || key === "s")
        keys.down = false;

    if (e.key === "ArrowLeft" || key === "a")
        keys.left = false;

    if (e.key === "ArrowRight" || key === "d")
        keys.right = false;

    if (key === "z")
        keys.z = false;

    if (key === "x")
        keys.x = false;

    if (key === "c")
        keys.c = false;

    e.preventDefault();

}, {passive:false});


/* =========================================================
   MOBILE CONTROLS
========================================================= */

document.querySelectorAll(".joy, .action")
.forEach(function(button) {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", function(e) {

        e.preventDefault();

        startMusic();

        keys[key] = true;

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


/* =========================================================
   GAME STATE
========================================================= */

const game = {

    mode:"explore",

    scene:"wasteland",

    dialogue:null,

    dialogueIndex:0,

    introStep:0,

    cameraX:0,

    encounterTimer:0,

    encounterDistance:0,

    battle:null,

    menu:false

};


/* =========================================================
   PLAYER
========================================================= */

const player = {

    x:250,
    y:350,

    width:54,
    height:72,

    speed:3.2,

    direction:"down"

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
        def:8,
        color:"#ffffff"
    },

    {
        name:"ЛИЧИ",
        hp:80,
        maxHP:80,
        atk:13,
        def:6,
        color:"#65aaff"
    },

    {
        name:"ПАНКЕЙК",
        hp:70,
        maxHP:70,
        atk:10,
        def:11,
        color:"#66dd77"
    },

    {
        name:"КАШТАН",
        hp:110,
        maxHP:110,
        atk:12,
        def:12,
        color:"#cc8844"
    },

    {
        name:"ШАРЛОТА",
        hp:100,
        maxHP:100,
        atk:13,
        def:9,
        color:"#ff77cc"
    }

];


/* =========================================================
   INTRO
========================================================= */

const introDialogue = [

    {
        speaker:"ЛИЧИ",
        text:
        "Надо проверить Немку... Она изменилась."
    },

    {
        speaker:"ЛИЧИ",
        text:
        "Последний раз, когда мы пытались поговорить с ней, она была совсем не похожа на себя."
    },

    {
        speaker:"ДЕЛЬТА",
        text:
        "Так мы идём?"
    },

    {
        speaker:"ЛИЧИ",
        text:
        "Да. Только не отставай."
    },

    {
        speaker:"ПАНКЕЙК",
        text:
        "Надеюсь, мы найдём её раньше, чем она найдёт нас."
    },

    {
        speaker:"КАШТАН",
        text:
        "В этом месте даже воздух выглядит сломанным."
    },

    {
        speaker:"ШАРЛОТА",
        text:
        "Цифровая пустошь. Здесь всё может оказаться ошибкой."
    },

    {
        speaker:"ДЕЛЬТА",
        text:
        "Тогда идём прямо."
    }

];


/* =========================================================
   START
========================================================= */

function startGame() {

    game.mode = "explore";

    game.scene = "wasteland";

    game.dialogue = introDialogue;

    game.dialogueIndex = 0;

    game.introStep = 0;

    player.x = 250;
    player.y = 350;

}


/* =========================================================
   COLLISION
========================================================= */

function canMove(x,y) {

    return (
        x > 70 &&
        x < 890 &&
        y > 100 &&
        y < 465
    );

}


/* =========================================================
   MOVEMENT
========================================================= */

function updatePlayer() {

    if (game.mode !== "explore")
        return;

    if (game.dialogue)
        return;

    let dx = 0;
    let dy = 0;

    if (keys.up) {

        dy -= player.speed;

        player.direction = "back";

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

        dx *= .707;
        dy *= .707;

    }

    if (canMove(player.x + dx, player.y))
        player.x += dx;

    if (canMove(player.x, player.y + dy))
        player.y += dy;

    game.cameraX = player.x - W / 2;

    game.cameraX =
        Math.max(
            0,
            Math.min(
                1600 - W,
                game.cameraX
            )
        );


    /* Движение вперёд запускает встречу */

    if (
        Math.abs(dx) > 0 ||
        Math.abs(dy) > 0
    ) {

        game.encounterDistance++;

    }

}


/* =========================================================
   DIALOGUE
========================================================= */

function updateDialogue() {

    if (!game.dialogue)
        return;

    if (
        justPressed("z") ||
        justPressed("x")
    ) {

        if (justPressed("z")) {

            game.dialogueIndex++;

            if (
                game.dialogueIndex >=
                game.dialogue.length
            ) {

                game.dialogue = null;

            }

        } else {

            game.dialogue = null;

        }

    }

}


/* =========================================================
   RANDOM ENCOUNTERS
========================================================= */

function updateEncounters() {

    if (game.mode !== "explore")
        return;

    if (game.dialogue)
        return;

    if (game.encounterDistance < 500)
        return;

    /*
       Большой промежуток между боями.
    */

    if (Math.random() < 0.0035) {

        startBattle();

        game.encounterDistance = 0;

    }

}


/* =========================================================
   BATTLE
========================================================= */

function startBattle() {

    game.mode = "battle";

    game.battle = {

        enemy: {

            name:"ОШИБКА СИСТЕМЫ",

            hp:180,

            maxHP:180

        },

        actor:0,

        phase:"menu",

        menu:0,

        rd:0,

        bullets:[],

        lasers:[],

        explosions:[],

        soul: {

            x:480,

            y:390,

            size:9,

            speed:4

        },

        enemyTimer:0,

        message:
            "ОШИБКА СИСТЕМЫ появилась перед вами.",

        attackNumber:0

    };

}


/* =========================================================
   BATTLE MENU
========================================================= */

const battleOptions = [

    "FIGHT",
    "ACT",
    "MAGIC",
    "DEFEND"

];


function updateBattle() {

    const b = game.battle;

    if (!b)
        return;


    /* =============================================
       MENU
    ============================================= */

    if (b.phase === "menu") {

        if (justPressed("left")) {

            b.menu--;

            if (b.menu < 0)
                b.menu = 3;

        }

        if (justPressed("right")) {

            b.menu++;

            if (b.menu > 3)
                b.menu = 0;

        }

        if (justPressed("z")) {

            battleAction();

        }

        return;

    }


    /* =============================================
       ENEMY ATTACK
    ============================================= */

    if (b.phase === "enemy") {

        updateEnemyAttack();

        return;

    }


    /* =============================================
       VICTORY
    ============================================= */

    if (b.phase === "victory") {

        if (justPressed("z")) {

            game.mode = "explore";

            game.battle = null;

        }

        return;

    }


    /* =============================================
       GAME OVER
    ============================================= */

    if (b.phase === "defeat") {

        if (justPressed("z")) {

            party.forEach(function(p) {

                p.hp = p.maxHP;

            });

            game.mode = "explore";

            game.battle = null;

        }

    }

}


/* =========================================================
   BATTLE ACTION
========================================================= */

function battleAction() {

    const b = game.battle;

    const actor = party[b.actor];

    /* FIGHT */

    if (b.menu === 0) {

        const damage =
            actor.atk +
            Math.floor(Math.random() * 6);

        b.enemy.hp -= damage;

        b.message =
            actor.name +
            " атакует! Урон: " +
            damage;

        finishAllyTurn();

    }


    /* ACT */

    else if (b.menu === 1) {

        b.rd = Math.min(100, b.rd + 12);

        b.message =
            actor.name +
            " пытается понять структуру ошибки.";

        finishAllyTurn();

    }


    /* MAGIC */

    else if (b.menu === 2) {

        if (actor.name === "КАШТАН") {

            b.enemy.hp -= 25;

            b.message =
                "КАШТАН использует цифровую магию!";

        } else {

            b.message =
                actor.name +
                " не знает подходящего заклинания.";

        }

        finishAllyTurn();

    }


    /* DEFEND */

    else if (b.menu === 3) {

        /*
           ВАЖНО:
           Защита повышает RD.
        */

        b.rd = Math.min(100, b.rd + 25);

        b.message =
            actor.name +
            " принимает защитную стойку.";

        finishAllyTurn();

    }

}


/* =========================================================
   NEXT ALLY
========================================================= */

function finishAllyTurn() {

    const b = game.battle;

    if (b.enemy.hp <= 0) {

        b.enemy.hp = 0;

        b.phase = "victory";

        b.message =
            "ОШИБКА СИСТЕМЫ исчезает.";

        return;

    }


    /*
       Следующий союзник.
    */

    b.actor++;

    if (b.actor < party.length) {

        b.menu = 0;

        b.message =
            "Ход " +
            party[b.actor].name +
            ".";

        return;

    }


    /*
       Все 5 закончили ход.
       Теперь атака ошибки.
    */

    b.actor = 0;

    startEnemyAttack();

}


/* =========================================================
   ENEMY ATTACK START
========================================================= */

function startEnemyAttack() {

    const b = game.battle;

    b.phase = "enemy";

    b.enemyTimer = 600;

    b.attackNumber++;

    b.bullets = [];

    b.lasers = [];

    b.explosions = [];


    /*
       Если один враг:
       несколько лазеров.
    */

    const laserCount =
        3 + Math.floor(Math.random() * 3);


    for (
        let i = 0;
        i < laserCount;
        i++
    ) {

        b.lasers.push({

            x:
                300 +
                Math.random() * 360,

            warning:100,

            active:0,

            cooldown:0,

            width:4

        });

    }

}


/* =========================================================
   ENEMY ATTACK UPDATE
========================================================= */

function updateEnemyAttack() {

    const b = game.battle;

    const soul = b.soul;


    /* Душа */

    if (keys.up)
        soul.y -= soul.speed;

    if (keys.down)
        soul.y += soul.speed;

    if (keys.left)
        soul.x -= soul.speed;

    if (keys.right)
        soul.x += soul.speed;


    /*
       Границы как в Deltarune.
    */

    soul.x =
        Math.max(
            300,
            Math.min(
                660,
                soul.x
            )
        );

    soul.y =
        Math.max(
            270,
            Math.min(
                470,
                soul.y
            )
        );


    /*
       Лазеры
    */

    b.lasers.forEach(function(laser) {

        if (laser.warning > 0) {

            laser.warning--;

        } else {

            laser.active++;

        }

        /*
           После лазера он исчезает
        */

        if (laser.active > 35) {

            laser.warning = 100;

            laser.active = 0;

            laser.x =
                300 +
                Math.random() * 360;

        }


        /*
           Попадание.
        */

        if (
            laser.active > 0 &&
            laser.active < 30
        ) {

            if (
                Math.abs(
                    soul.x - laser.x
                ) < 12
            ) {

                damageSoul();

            }

        }

    });


    /*
       Иногда появляются дополнительные
       частицы.
    */

    if (
        Math.random() < .04
    ) {

        b.explosions.push({

            x:
                300 +
                Math.random() * 360,

            y:
                280 +
                Math.random() * 170,

            life:25

        });

    }


    b.explosions.forEach(function(explosion) {

        explosion.life--;

    });


    b.explosions =
        b.explosions.filter(function(explosion) {

            return explosion.life > 0;

        });


    b.enemyTimer--;

    if (b.enemyTimer <= 0) {

        endEnemyAttack();

    }

}


/* =========================================================
   DAMAGE
========================================================= */

let damageCooldown = 0;

function damageSoul() {

    if (damageCooldown > 0)
        return;

    damageCooldown = 45;

    const target =
        party[game.battle.actor];

    target.hp -= 8;

    if (target.hp < 0)
        target.hp = 0;

    game.battle.message =
        target.name +
        " получил 8 урона!";

    checkPartyDefeat();

}


/* =========================================================
   DAMAGE COOLDOWN
========================================================= */

function updateDamageCooldown() {

    if (damageCooldown > 0)
        damageCooldown--;

}


/* =========================================================
   END ENEMY ATTACK
========================================================= */

function endEnemyAttack() {

    const b = game.battle;

    b.phase = "menu";

    b.actor = 0;

    b.menu = 0;

    b.lasers = [];

    b.explosions = [];

    b.message =
        "Ход ДЕЛЬТЫ.";

}


/* =========================================================
   DEFEAT
========================================================= */

function checkPartyDefeat() {

    let alive = false;

    party.forEach(function(p) {

        if (p.hp > 0)
            alive = true;

    });


    if (!alive) {

        game.battle.phase = "defeat";

    }

}


/* =========================================================
   DRAW BACKGROUND
========================================================= */

function drawWasteland() {

    ctx.fillStyle = "#111";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /*
       Большой фон.
    */

    if (
        images.wasteland.complete &&
        images.wasteland.naturalWidth > 0
    ) {

        const bg =
            images.wasteland;

        const scale =
            H / bg.naturalHeight;

        const width =
            bg.naturalWidth * scale;

        ctx.drawImage(
            bg,
            -game.cameraX * .45,
            0,
            width,
            H
        );

    }


    /*
       Тропинка.
    */

    if (
        images.path.complete &&
        images.path.naturalWidth > 0
    ) {

        const path =
            images.path;

        ctx.globalAlpha = .95;

        ctx.drawImage(
            path,
            -game.cameraX,
            0,
            1600,
            H
        );

        ctx.globalAlpha = 1;

    }

}


/* =========================================================
   DRAW DELTA
========================================================= */

function getDeltaImage() {

    if (player.direction === "left")
        return images.deltalef;

    if (player.direction === "right")
        return images.deltaright;

    if (player.direction === "back")
        return images.deltabach;

    return images.delta;

}


function drawDelta() {

    const img =
        getDeltaImage();


    if (
        img.complete &&
        img.naturalWidth > 0
    ) {

        ctx.drawImage(
            img,
            player.x -
            player.width / 2 -
            game.cameraX,
            player.y -
            player.height / 2,
            player.width,
            player.height
        );

    } else {

        /*
           Запасной персонаж,
           чтобы экран никогда не был пустым.
        */

        ctx.fillStyle="#fff";

        ctx.fillRect(
            player.x -
            player.width / 2 -
            game.cameraX,

            player.y -
            player.height / 2,

            player.width,
            player.height
        );

    }

}


/* =========================================================
   DRAW ERROR
========================================================= */

function drawError(x,y) {

    if (
        images.error.complete &&
        images.error.naturalWidth > 0
    ) {

        ctx.drawImage(
            images.error,
            x,
            y,
            70,
            70
        );

    } else {

        ctx.fillStyle="#9933ff";

        ctx.fillRect(
            x,
            y,
            70,
            70
        );

        ctx.fillStyle="#fff";

        ctx.font="20px monospace";

        ctx.fillText(
            "ERR",
            x+10,
            y+42
        );

    }

}


/* =========================================================
   EXPLORE UI
========================================================= */

function drawExploreUI() {

    ctx.fillStyle="rgba(0,0,0,.65)";

    ctx.fillRect(
        20,
        20,
        250,
        45
    );

    ctx.strokeStyle="white";

    ctx.strokeRect(
        20,
        20,
        250,
        45
    );

    ctx.fillStyle="white";

    ctx.font="18px monospace";

    ctx.fillText(
        "ЦИФРОВАЯ ПУСТОШЬ",
        35,
        48
    );


    ctx.font="13px monospace";

    ctx.fillText(
        "C — меню",
        35,
        60
    );

}


/* =========================================================
   DRAW DIALOGUE
========================================================= */

function drawDialogue() {

    const d =
        game.dialogue[
            game.dialogueIndex
        ];


    ctx.fillStyle="rgba(0,0,0,.65)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle="#000";

    ctx.fillRect(
        40,
        365,
        880,
        135
    );


    ctx.strokeStyle="white";

    ctx.lineWidth=4;

    ctx.strokeRect(
        40,
        365,
        880,
        135
    );


    ctx.fillStyle="white";

    ctx.font="22px monospace";

    ctx.fillText(
        d.speaker,
        65,
        400
    );


    ctx.font="17px monospace";

    drawTextWrapped(
        d.text,
        65,
        435,
        820,
        25
    );


    ctx.font="14px monospace";

    ctx.fillText(
        "Z — далее",
        760,
        485
    );

}


/* =========================================================
   TEXT WRAP
========================================================= */

function drawTextWrapped(
    text,
    x,
    y,
    maxWidth,
    lineHeight
) {

    const words =
        text.split(" ");

    let line = "";

    for (
        let i = 0;
        i < words.length;
        i++
    ) {

        const test =
            line +
            words[i] +
            " ";

        if (
            ctx.measureText(test).width >
            maxWidth
            &&
            line !== ""
        ) {

            ctx.fillText(
                line,
                x,
                y
            );

            line =
                words[i] + " ";

            y += lineHeight;

        } else {

            line = test;

        }

    }

    ctx.fillText(
        line,
        x,
        y
    );

}


/* =========================================================
   BATTLE DRAW
========================================================= */

function drawBattle() {

    ctx.fillStyle="#080808";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /*
       Верхняя часть
    */

    ctx.fillStyle="#111";

    ctx.fillRect(
        0,
        0,
        W,
        170
    );


    drawError(
        445,
        45
    );


    ctx.fillStyle="white";

    ctx.font="20px monospace";

    ctx.fillText(
        "ОШИБКА СИСТЕМЫ",
        35,
        40
    );


    /*
       Enemy HP
    */

    ctx.font="15px monospace";

    ctx.fillText(
        "HP",
        680,
        40
    );


    ctx.strokeStyle="white";

    ctx.strokeRect(
        715,
        27,
        180,
        18
    );


    ctx.fillStyle="#fff";

    ctx.fillRect(
        718,
        30,
        174 *
        (
            game.battle.enemy.hp /
            game.battle.enemy.maxHP
        ),
        12
    );


    /*
       Сообщение
    */

    ctx.fillStyle="white";

    ctx.font="15px monospace";

    drawTextWrapped(
        game.battle.message,
        50,
        190,
        850,
        20
    );


    /*
       Боевое поле
    */

    ctx.strokeStyle="white";

    ctx.lineWidth=4;

    ctx.strokeRect(
        280,
        245,
        400,
        245
    );


    /*
       Лазеры
    */

    if (
        game.battle.phase === "enemy"
    ) {

        game.battle.lasers
        .forEach(function(laser) {

            if (laser.warning > 0) {

                ctx.strokeStyle =
                    "rgba(255,50,50,.45)";

                ctx.lineWidth=2;

                ctx.beginPath();

                ctx.moveTo(
                    laser.x,
                    250
                );

                ctx.lineTo(
                    laser.x,
                    485
                );

                ctx.stroke();


                ctx.fillStyle="#ff5555";

                ctx.font="14px monospace";

                ctx.fillText(
                    "!",
                    laser.x - 4,
                    270
                );

            } else {

                ctx.fillStyle="#ff4444";

                ctx.fillRect(
                    laser.x - 4,
                    250,
                    8,
                    240
                );

            }

        });


        /*
           Взрывы / частицы
        */

        game.battle.explosions
        .forEach(function(explosion) {

            ctx.fillStyle="#fff";

            for (
                let i=0;
                i<6;
                i++
            ) {

                const angle =
                    i *
                    Math.PI /
                    3;

                const distance =
                    20 -
                    explosion.life * .5;

                ctx.fillRect(
                    explosion.x +
                    Math.cos(angle) *
                    distance,

                    explosion.y +
                    Math.sin(angle) *
                    distance,

                    4,
                    4
                );

            }

        });

    }


    /*
       SOUL
    */

    ctx.fillStyle="#ff3030";

    ctx.fillRect(
        game.battle.soul.x - 8,
        game.battle.soul.y - 8,
        16,
        16
    );


    /*
       PARTY
    */

    ctx.fillStyle="#000";

    ctx.fillRect(
        20,
        250,
        235,
        250
    );

    ctx.strokeStyle="white";

    ctx.strokeRect(
        20,
        250,
        235,
        250
    );


    party.forEach(function(p,i) {

        const y =
            280 +
            i * 42;


        if (
            i ===
            game.battle.actor
        ) {

            ctx.fillStyle="#fff";

            ctx.font="18px monospace";

            ctx.fillText(
                "▶",
                32,
                y
            );

        }


        ctx.fillStyle=p.color;

        ctx.font="16px monospace";

        ctx.fillText(
            p.name,
            55,
            y
        );


        ctx.fillStyle="white";

        ctx.font="13px monospace";

        ctx.fillText(
            "HP " +
            p.hp +
            "/" +
            p.maxHP,
            55,
            y + 20
        );


        /*
           HP bar
        */

        ctx.strokeStyle="white";

        ctx.strokeRect(
            140,
            y - 12,
            90,
            10
        );

        ctx.fillStyle=p.color;

        ctx.fillRect(
            142,
            y - 10,
            86 *
            (
                p.hp /
                p.maxHP
            ),
            6
        );

    });


    /*
       RD
    */

    ctx.fillStyle="#111";

    ctx.fillRect(
        700,
        250,
        230,
        70
    );

    ctx.strokeStyle="white";

    ctx.strokeRect(
        700,
        250,
        230,
        70
    );


    ctx.fillStyle="#fff";

    ctx.font="16px monospace";

    ctx.fillText(
        "RD",
        720,
        275
    );


    ctx.strokeStyle="white";

    ctx.strokeRect(
        760,
        260,
        145,
        16
    );


    ctx.fillStyle="#ffd83d";

    ctx.fillRect(
        763,
        263,
        139 *
        (
            game.battle.rd /
            100
        ),
        10
    );


    ctx.fillStyle="white";

    ctx.font="13px monospace";

    ctx.fillText(
        Math.floor(
            game.battle.rd
        ) + "%",
        810,
        305
    );


    /*
       MENU
    */

    if (
        game.battle.phase === "menu"
    ) {

        battleOptions.forEach(
            function(option,i) {

                const x =
                    710 +
                    (i % 2) * 110;

                const y =
                    360 +
                    Math.floor(i / 2) * 55;


                if (
                    i ===
                    game.battle.menu
                ) {

                    ctx.strokeStyle="#fff";

                    ctx.strokeRect(
                        x - 12,
                        y - 25,
                        100,
                        40
                    );

                }


                ctx.fillStyle="#fff";

                ctx.font="16px monospace";

                ctx.fillText(
                    option,
                    x,
                    y
                );

            }
        );

    }


    /*
       Victory
    */

    if (
        game.battle.phase ===
        "victory"
    ) {

        ctx.fillStyle="rgba(0,0,0,.8)";

        ctx.fillRect(
            250,
            190,
            460,
            130
        );

        ctx.strokeStyle="white";

        ctx.strokeRect(
            250,
            190,
            460,
            130
        );

        ctx.fillStyle="white";

        ctx.font="28px monospace";

        ctx.fillText(
            "ПОБЕДА!",
            390,
            245
        );

        ctx.font="16px monospace";

        ctx.fillText(
            "Z — продолжить",
            390,
            285
        );

    }


    /*
       Defeat
    */

    if (
        game.battle.phase ===
        "defeat"
    ) {

        ctx.fillStyle="rgba(0,0,0,.9)";

        ctx.fillRect(
            250,
            190,
            460,
            130
        );

        ctx.strokeStyle="#ff4444";

        ctx.strokeRect(
            250,
            190,
            460,
            130
        );

        ctx.fillStyle="#ff4444";

        ctx.font="25px monospace";

        ctx.fillText(
            "ОТРЯД ПОБЕЖДЁН",
            350,
            245
        );

        ctx.fillStyle="white";

        ctx.font="15px monospace";

        ctx.fillText(
            "Z — восстановиться",
            385,
            285
        );

    }

}


/* =========================================================
   MAIN DRAW
========================================================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    if (game.mode === "battle") {

        drawBattle();

        return;

    }


    drawWasteland();

    drawDelta();

    drawExploreUI();


    if (game.dialogue) {

        drawDialogue();

    }

}


/* =========================================================
   UPDATE
========================================================= */

function update() {

    updateDamageCooldown();


    if (game.mode === "explore") {

        if (!game.dialogue) {

            updatePlayer();

            updateEncounters();

            /*
               C открывает меню
            */

            if (justPressed("c")) {

                game.menu = true;

            }

        } else {

            updateDialogue();

        }

    }


    else if (game.mode === "battle") {

        updateBattle();

    }


    /*
       Если меню пока не реализуем
       отдельным экраном — C просто
       показывает подсказку.
    */

    for (const key in keys) {

        oldKeys[key] = keys[key];

    }

}


/* =========================================================
   START
========================================================= */

startGame();


/* =========================================================
   LOOP
========================================================= */

function loop() {

    update();

    draw();

    requestAnimationFrame(loop);

}

loop();
