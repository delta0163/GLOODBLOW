"use strict";

/* =========================================================
   BLOOD GLOW
   НОВАЯ ВЕРСИЯ С НУЛЯ
========================================================= */

const canvas =
    document.getElementById("game");

const ctx =
    canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = 640;
const H = 360;


/* =========================================================
   ASSETS
========================================================= */

const images = {};

const imageList = {

    wasteland: "images/wasteland.png",
    trail: "images/trail.png",

    delta: "images/delta.png",
    left: "images/deltalef.png",
    right: "images/deltaright.png",
    back: "images/deltabach.png",

    error: "images/error.png",
    shop: "images/shop.png"

};

for (const name in imageList) {

    const img = new Image();

    img.src = imageList[name];

    images[name] = img;
}


/* =========================================================
   SOUND
========================================================= */

const sounds = {

    world:
        new Audio("sounds/wonderland.mp3"),

    battle:
        new Audio("sounds/battle.mp3"),

    cemetery:
        new Audio("sounds/cemetery.mp3")

};

sounds.world.loop = true;
sounds.battle.loop = true;
sounds.cemetery.loop = true;

sounds.world.volume = .35;
sounds.battle.volume = .35;
sounds.cemetery.volume = .35;

let audioStarted = false;


function music(name) {

    for (const key in sounds) {

        sounds[key].pause();

        sounds[key].currentTime = 0;

    }

    if (!sounds[name])
        return;

    sounds[name]
        .play()
        .catch(() => {});

}


function startAudio() {

    if (audioStarted)
        return;

    audioStarted = true;

    music("world");

}


/* =========================================================
   FULLSCREEN
========================================================= */

document
.getElementById("fullscreen-button")
.addEventListener("pointerdown", e => {

    e.preventDefault();

    startAudio();

    if (!document.fullscreenElement) {

        document.documentElement
            .requestFullscreen()
            .catch(() => {});

    } else {

        document
            .exitFullscreen()
            .catch(() => {});

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
    c:false,

    run:false

};

const previous = {

    up:false,
    down:false,
    left:false,
    right:false,

    z:false,
    x:false,
    c:false

};


function pressed(k) {

    return keys[k] &&
           !previous[k];

}


/* =========================================================
   KEYBOARD
========================================================= */

window.addEventListener(
    "keydown",
    e => {

        startAudio();

        switch(e.key.toLowerCase()) {

            case "w":
            case "arrowup":
                keys.up = true;
                break;

            case "s":
            case "arrowdown":
                keys.down = true;
                break;

            case "a":
            case "arrowleft":
                keys.left = true;
                break;

            case "d":
            case "arrowright":
                keys.right = true;
                break;

            case "z":
                keys.z = true;
                break;

            case "x":
                keys.x = true;
                break;

            case "c":
                keys.c = true;
                break;

            case "shift":
                keys.run = true;
                break;

        }

        e.preventDefault();

    },
    {passive:false}
);


window.addEventListener(
    "keyup",
    e => {

        switch(e.key.toLowerCase()) {

            case "w":
            case "arrowup":
                keys.up = false;
                break;

            case "s":
            case "arrowdown":
                keys.down = false;
                break;

            case "a":
            case "arrowleft":
                keys.left = false;
                break;

            case "d":
            case "arrowright":
                keys.right = false;
                break;

            case "z":
                keys.z = false;
                break;

            case "x":
                keys.x = false;
                break;

            case "c":
                keys.c = false;
                break;

            case "shift":
                keys.run = false;
                break;

        }

        e.preventDefault();

    },
    {passive:false}
);


/* =========================================================
   MOBILE BUTTONS
========================================================= */

document
.querySelectorAll(".joy, .action-button")
.forEach(button => {

    const key =
        button.dataset.key;

    button.addEventListener(
        "pointerdown",
        e => {

            e.preventDefault();

            startAudio();

            keys[key] = true;

            button.setPointerCapture(
                e.pointerId
            );

        }
    );

    button.addEventListener(
        "pointerup",
        e => {

            e.preventDefault();

            keys[key] = false;

        }
    );

    button.addEventListener(
        "pointercancel",
        () => {

            keys[key] = false;

        }
    );

});


/* =========================================================
   GAME
========================================================= */

const game = {

    started:false,

    room:"wasteland1",

    mode:"title",

    transition:0,

    transitionTarget:null,

    dialogue:null,

    dialogueIndex:0,

    battle:null,

    chase:null,

    puzzle:null,

    shopIndex:0,

    menuIndex:0,

    message:"",

    messageTime:0

};


/* =========================================================
   PLAYER
========================================================= */

const player = {

    x:80,
    y:260,

    w:24,
    h:30,

    direction:"right",

    walkFrame:0

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
        def:9
    }

];


/* =========================================================
   INVENTORY
========================================================= */

const inventory = {

    food:3,

    potions:3,

    weapons:0,

    armor:0

};

let gold = 100;


/* =========================================================
   FOLLOWERS
========================================================= */

const followers = [

    {
        x:40,
        y:260
    },

    {
        x:10,
        y:260
    },

    {
        x:-20,
        y:260
    },

    {
        x:-50,
        y:260
    }

];


/* =========================================================
   ROOMS
========================================================= */

const rooms = {

    wasteland1:
        "ЦИФРОВАЯ ПУСТОШЬ",

    shop:
        "МАГАЗИН",

    wasteland2:
        "ПУСТОШЬ",

    boxes:
        "СТАРЫЕ ВОРОТА",

    cemetery:
        "ЦИФРОВОЕ КЛАДБИЩЕ"

};


/* =========================================================
   DIALOGUE
========================================================= */

function beginDialogue() {

    game.mode = "dialogue";

    game.dialogue = [

        [
            "ЛИЧИ",
            "Надо проверить Немку... Она изменилась."
        ],

        [
            "ЛИЧИ",
            "Последний раз, когда мы пытались поговорить с ней, она была странной."
        ],

        [
            "ДЕЛЬТА",
            "Так мы идём?"
        ],

        [
            "ЛИЧИ",
            "Да."
        ],

        [
            "ПАНКЕЙК",
            "Тогда не будем задерживаться."
        ],

        [
            "КАШТАН",
            "Если с Немкой действительно что-то случилось, надо выяснить причину."
        ],

        [
            "ШАРЛОТА",
            "И держитесь рядом. Здесь слишком много системных ошибок."
        ]

    ];

    game.dialogueIndex = 0;

}


function nextDialogue() {

    game.dialogueIndex++;

    if (
        game.dialogueIndex >=
        game.dialogue.length
    ) {

        game.dialogue = null;

        game.mode = "explore";

    }

}


/* =========================================================
   START
========================================================= */

function startGame() {

    game.started = true;

    game.room =
        "wasteland1";

    player.x = 70;
    player.y = 265;

    beginDialogue();

    music("world");

}


/* =========================================================
   TRANSITION
========================================================= */

function transitionTo(room) {

    if (game.transition > 0)
        return;

    game.transition = 45;

    game.transitionTarget = room;

}


function finishTransition() {

    game.room =
        game.transitionTarget;

    game.transitionTarget = null;

    player.x = 45;
    player.y = 265;

    if (game.room === "shop") {

        player.x = 70;

    }

    if (game.room === "wasteland2") {

        player.x = 60;

    }

    if (game.room === "boxes") {

        player.x = 60;

        createPuzzle();

    }

    if (game.room === "cemetery") {

        music("cemetery");

    } else {

        music("world");

    }

}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function updatePlayer() {

    if (game.mode !== "explore")
        return;

    let dx = 0;
    let dy = 0;

    const speed =
        keys.run
            ? 4
            : 2.2;

    if (keys.left) {

        dx -= speed;

        player.direction =
            "left";

    }

    if (keys.right) {

        dx += speed;

        player.direction =
            "right";

    }

    if (keys.up) {

        dy -= speed;

        player.direction =
            "back";

    }

    if (keys.down) {

        dy += speed;

        player.direction =
            "front";

    }

    if (dx !== 0 &&
        dy !== 0) {

        dx *= .707;
        dy *= .707;

    }

    player.x += dx;
    player.y += dy;

    player.x =
        Math.max(
            20,
            Math.min(
                620,
                player.x
            )
        );

    player.y =
        Math.max(
            55,
            Math.min(
                325,
                player.y
            )
        );

    if (
        Math.abs(dx) +
        Math.abs(dy) > 0
    ) {

        player.walkFrame += .2;

    }

}


/* =========================================================
   FOLLOWERS
========================================================= */

function updateFollowers() {

    if (game.mode !== "explore")
        return;

    followers.forEach(
        (f,i) => {

            const targetX =
                player.x -
                30 -
                i*25;

            const targetY =
                player.y;

            f.x +=
                (targetX-f.x)*.1;

            f.y +=
                (targetY-f.y)*.1;

        }
    );

}


/* =========================================================
   EXITS
========================================================= */

function updateExits() {

    if (
        game.mode !==
        "explore"
    )
        return;

    if (player.x < 620)
        return;

    if (
        game.room ===
        "wasteland1"
    ) {

        transitionTo("shop");

    }

    else if (
        game.room ===
        "shop"
    ) {

        transitionTo("wasteland2");

    }

    else if (
        game.room ===
        "wasteland2"
    ) {

        startChase();

    }

    else if (
        game.room ===
        "boxes"
    ) {

        if (
            game.puzzle &&
            game.puzzle.solved
        ) {

            transitionTo(
                "cemetery"
            );

        } else {

            player.x = 600;

            message(
                "Ворота закрыты. Нужно поставить все коробки на кнопки."
            );

        }

    }

}


/* =========================================================
   RANDOM BATTLES
========================================================= */

let battleSteps = 0;

function randomBattle() {

    if (
        game.mode !== "explore" ||
        game.room === "shop" ||
        game.room === "boxes" ||
        game.room === "cemetery" ||
        game.room === "wasteland2"
    )
        return;

    const moving =
        keys.up ||
        keys.down ||
        keys.left ||
        keys.right;

    if (!moving)
        return;

    battleSteps++;

    /*
       Бой не каждые 2 секунды.
       Минимум примерно 25 секунд
       активного движения.
    */

    if (
        battleSteps > 900 &&
        Math.random() < .004
    ) {

        battleSteps = 0;

        startBattle();

    }

}


/* =========================================================
   BATTLE START
========================================================= */

function startBattle() {

    game.mode = "battle";

    game.battle = {

        enemyHP:180,

        enemyMax:180,

        menu:0,

        actor:0,

        phase:"menu",

        soulX:320,

        soulY:275,

        soulSpeed:3.4,

        attackTimer:0,

        attackDuration:420,

        attackType:
            Math.random() <
            .5
                ? "laser"
                : "explosion",

        laserX:320,

        laserWarning:0,

        explosions:[],

        hitCooldown:0,

        message:
            "Ошибка системы появилась из цифрового шума."

    };

    music("battle");

}


/* =========================================================
   BATTLE INPUT
========================================================= */

function updateBattle() {

    const b =
        game.battle;

    if (!b)
        return;


    if (b.phase === "menu") {

        if (pressed("left"))
            b.menu =
                Math.max(
                    0,
                    b.menu-1
                );

        if (pressed("right"))
            b.menu =
                Math.min(
                    3,
                    b.menu+1
                );

        if (pressed("up"))
            b.menu =
                Math.max(
                    0,
                    b.menu-2
                );

        if (pressed("down"))
            b.menu =
                Math.min(
                    3,
                    b.menu+2
                );

        if (pressed("z"))
            battleAction();

    }

    else if (
        b.phase ===
        "enemy"
    ) {

        updateSoul();

        updateEnemyAttack();

    }

}


/* =========================================================
   BATTLE ACTION
========================================================= */

function battleAction() {

    const b =
        game.battle;

    const p =
        party[b.actor];


    if (b.menu === 0) {

        const damage =
            p.atk +
            Math.floor(
                Math.random()*8
            );

        b.enemyHP =
            Math.max(
                0,
                b.enemyHP-damage
            );

        b.message =
            p.name+
            " атакует!  -"+
            damage+
            " HP";

    }


    else if (b.menu === 1) {

        b.enemyHP =
            Math.max(
                0,
                b.enemyHP-8
            );

        b.message =
            p.name+
            " изучает ошибку.";

    }


    else if (b.menu === 2) {

        if (
            inventory.potions > 0
        ) {

            inventory.potions--;

            p.hp =
                Math.min(
                    p.maxHP,
                    p.hp+35
                );

            b.message =
                p.name+
                " использует зелье. +35 HP";

        } else {

            b.message =
                "Зелий больше нет.";

        }

    }


    else if (b.menu === 3) {

        if (
            b.enemyHP <= 30
        ) {

            b.message =
                "Ошибка больше не сопротивляется.";

            endBattle();

            return;

        }

        b.message =
            "Пощада пока невозможна.";

    }


    if (
        b.enemyHP <= 0
    ) {

        endBattle();

        return;

    }


    /*
       Каждый союзник получает свой ход.
    */

    b.actor++;

    if (
        b.actor >=
        party.length
    ) {

        b.actor = 0;

        beginEnemyAttack();

    }

}


/* =========================================================
   ENEMY ATTACK START
========================================================= */

function beginEnemyAttack() {

    const b =
        game.battle;

    b.phase = "enemy";

    b.attackTimer =
        b.attackDuration;

    b.hitCooldown = 0;

    b.attackType =
        Math.random() <
        .5
            ? "laser"
            : "explosion";


    b.laserX =
        100 +
        Math.random()*440;

    b.laserWarning = 90;


    b.explosions = [];


    if (
        b.attackType ===
        "explosion"
    ) {

        for (
            let i=0;
            i<6;
            i++
        ) {

            b.explosions.push({

                x:
                    90+
                    Math.random()*450,

                y:
                    145+
                    Math.random()*150,

                radius:4,

                timer:
                    40+
                    Math.random()*90

            });

        }

    }

}


/* =========================================================
   SOUL
========================================================= */

function updateSoul() {

    const b =
        game.battle;

    let dx=0;
    let dy=0;


    if (keys.left)
        dx-=b.soulSpeed;

    if (keys.right)
        dx+=b.soulSpeed;

    if (keys.up)
        dy-=b.soulSpeed;

    if (keys.down)
        dy+=b.soulSpeed;


    b.soulX += dx;
    b.soulY += dy;


    b.soulX =
        Math.max(
            65,
            Math.min(
                575,
                b.soulX
            )
        );

    b.soulY =
        Math.max(
            125,
            Math.min(
                320,
                b.soulY
            )
        );


    if (
        b.hitCooldown > 0
    )
        b.hitCooldown--;

}


/* =========================================================
   DAMAGE
========================================================= */

function damageCurrentPlayer(
    damage
) {

    const b =
        game.battle;

    if (
        b.hitCooldown > 0
    )
        return;


    const p =
        party[b.actor];


    /*
       ЗАЩИТА УМЕНЬШАЕТ УРОН.
    */

    const realDamage =
        Math.max(
            1,
            damage -
            Math.floor(
                p.def/2
            )
        );


    p.hp =
        Math.max(
            0,
            p.hp-realDamage
        );


    /*
       ВОТ ЗДЕСЬ HP РЕАЛЬНО
       УМЕНЬШАЕТСЯ.
    */

    updateInventoryHUD();


    b.message =
        p.name+
        " получает "+
        realDamage+
        " урона!";


    b.hitCooldown = 50;


    /*
       Если HP закончились,
       союзник больше не может
       получать урон.
    */

    if (
        party.every(
            p => p.hp <= 0
        )
    ) {

        game.mode =
            "defeat";

    }

}


/* =========================================================
   ENEMY ATTACK UPDATE
========================================================= */

function updateEnemyAttack() {

    const b =
        game.battle;


    b.attackTimer--;


    if (
        b.attackType ===
        "laser"
    ) {

        /*
           Сначала появляется
           предупреждение.
        */

        if (
            b.laserWarning > 0
        ) {

            b.laserWarning--;

        }

        else {

            /*
               Лазер занимает всю
               высоту боевой зоны.
            */

            if (
                Math.abs(
                    b.soulX-
                    b.laserX
                ) < 13
            ) {

                damageCurrentPlayer(
                    18
                );

            }

        }

    }


    if (
        b.attackType ===
        "explosion"
    ) {

        b.explosions.forEach(
            e => {

                if (
                    e.timer > 0
                ) {

                    e.timer--;

                }
                else {

                    e.radius += .8;

                    const dx =
                        b.soulX-e.x;

                    const dy =
                        b.soulY-e.y;

                    const distance =
                        Math.sqrt(
                            dx*dx+
                            dy*dy
                        );

                    if (
                        distance <
                        e.radius+7
                    ) {

                        damageCurrentPlayer(
                            12
                        );

                    }

                    if (
                        e.radius > 32
                    ) {

                        e.radius = 4;

                        e.x =
                            80+
                            Math.random()*470;

                        e.y =
                            140+
                            Math.random()*160;

                        e.timer =
                            40+
                            Math.random()*80;

                    }

                }

            }
        );

    }


    if (
        b.attackTimer <= 0
    ) {

        b.phase = "menu";

        b.actor = 0;

        b.menu = 0;

        b.message =
            "Атака закончилась. Ход команды.";

    }

}


/* =========================================================
   END BATTLE
========================================================= */

function endBattle() {

    game.battle = null;

    game.mode = "explore";

    battleSteps = 0;

    music(
        game.room ===
        "cemetery"
            ? "cemetery"
            : "world"
    );

}


/* =========================================================
   CHASE
========================================================= */

function startChase() {

    game.mode = "chase";

    game.chase = {

        time:30,

        distance:0,

        scroll:0,

        qteIndex:0,

        sequence:
        [
            "z",
            "x",
            "z",
            "c",
            "z",
            "x",
            "c",
            "z"
        ],

        failed:false,

        success:false

    };

}


/* =========================================================
   CHASE UPDATE
========================================================= */

function updateChase() {

    const c =
        game.chase;


    /*
       ФОН ДВИГАЕТСЯ.
       Чем быстрее игрок нажимает
       нужные кнопки, тем быстрее
       двигается пустошь.
    */

    c.scroll += 3;


    /*
       Таймер 30 секунд.
    */

    c.time -=
        1/60;


    const need =
        c.sequence[
            c.qteIndex
        ];


    if (
        pressed(need)
    ) {

        c.qteIndex++;

        c.distance += 9;


        if (
            c.qteIndex >=
            c.sequence.length
        ) {

            c.success = true;

            /*
               После успешной погони
               переходим к коробкам.
            */

            game.room =
                "boxes";

            game.mode =
                "explore";

            player.x = 70;
            player.y = 265;

            createPuzzle();

        }

    }


    if (
        c.time <= 0 &&
        !c.success
    ) {

        c.time = 30;

        c.qteIndex = 0;

        c.distance = 0;

    }

}


/* =========================================================
   PUZZLE
========================================================= */

function createPuzzle() {

    game.puzzle = {

        solved:false,

        selected:-1,

        boxes:[

            {
                x:150,
                y:130,
                w:34,
                h:34
            },

            {
                x:270,
                y:210,
                w:34,
                h:34
            },

            {
                x:400,
                y:120,
                w:34,
                h:34
            }

        ],

        buttons:[

            {
                x:120,
                y:100,
                w:45,
                h:12
            },

            {
                x:350,
                y:250,
                w:45,
                h:12
            },

            {
                x:500,
                y:100,
                w:45,
                h:12
            }

        ]

    };

}


/* =========================================================
   PUZZLE UPDATE
========================================================= */

function updatePuzzle() {

    const p =
        game.puzzle;

    if (!p)
        return;


    /*
       Если отойти от коробки,
       она больше НЕ продолжает
       двигаться.
    */

    if (
        p.selected >= 0
    ) {

        const box =
            p.boxes[
                p.selected
            ];


        const dx =
            player.x-
            (
                box.x+
                box.w/2
            );

        const dy =
            player.y-
            (
                box.y+
                box.h/2
            );

        const distance =
            Math.sqrt(
                dx*dx+
                dy*dy
            );


        if (
            distance > 55
        ) {

            p.selected = -1;

        }

    }


    /*
       Z выбирает ближайшую
       коробку.
    */

    if (
        pressed("z")
    ) {

        if (
            p.selected < 0
        ) {

            let closest=-1;
            let best=9999;


            p.boxes.forEach(
                (box,i) => {

                    const dx =
                        player.x-
                        (
                            box.x+
                            box.w/2
                        );

                    const dy =
                        player.y-
                        (
                            box.y+
                            box.h/2
                        );

                    const d =
                        Math.sqrt(
                            dx*dx+
                            dy*dy
                        );


                    if (
                        d < 60 &&
                        d < best
                    ) {

                        best=d;
                        closest=i;

                    }

                }
            );


            if (
                closest >= 0
            ) {

                p.selected =
                    closest;

            }

        }

        else {

            pushSelectedBox();

        }

    }


    /*
       Коробка двигается только
       пока игрок рядом.
    */

    if (
        p.selected >= 0
    ) {

        const box =
            p.boxes[
                p.selected
            ];

        const moving =
            keys.left ||
            keys.right ||
            keys.up ||
            keys.down;


        if (moving) {

            const speed=2.5;

            if (keys.left)
                box.x -= speed;

            if (keys.right)
                box.x += speed;

            if (keys.up)
                box.y -= speed;

            if (keys.down)
                box.y += speed;

            box.x =
                Math.max(
                    20,
                    Math.min(
                        590,
                        box.x
                    )
                );

            box.y =
                Math.max(
                    70,
                    Math.min(
                        310,
                        box.y
                    )
                );

        }

    }


    checkPuzzle();

}


function pushSelectedBox() {

    const p =
        game.puzzle;

    if (
        p.selected < 0
    )
        return;

    const box =
        p.boxes[
            p.selected
        ];

    const distance =
        Math.hypot(
            player.x-
            box.x,
            player.y-
            box.y
        );

    if (
        distance > 65
    ) {

        p.selected=-1;

    }

}


/* =========================================================
   PUZZLE CHECK
========================================================= */

function checkPuzzle() {

    const p =
        game.puzzle;

    let correct=0;


    p.boxes.forEach(
        box => {

            p.buttons.forEach(
                button => {

                    const bx =
                        box.x+
                        box.w/2;

                    const by =
                        box.y+
                        box.h/2;

                    const px =
                        button.x+
                        button.w/2;

                    const py =
                        button.y+
                        button.h/2;


                    if (
                        Math.abs(
                            bx-px
                        ) < 25 &&
                        Math.abs(
                            by-py
                        ) < 20
                    ) {

                        correct++;

                    }

                }
            );

        }
    );


    if (
        correct ===
        p.buttons.length
    ) {

        p.solved = true;

        p.selected = -1;

        message(
            "Все кнопки загорелись зелёным. Ворота открыты!"
        );

    }

}


/* =========================================================
   SHOP
========================================================= */

function updateShop() {

    if (
        pressed("x")
    ) {

        game.mode =
            "explore";

        return;

    }


    if (
        pressed("up")
    ) {

        game.shopIndex--;

        if (
            game.shopIndex < 0
        )
            game.shopIndex=3;

    }


    if (
        pressed("down")
    ) {

        game.shopIndex++;

        if (
            game.shopIndex > 3
        )
            game.shopIndex=0;

    }


    if (
        pressed("z")
    ) {

        buyItem(
            game.shopIndex
        );

    }

}


function buyItem(index) {

    const prices =
        [10,20,45,40];

    const names =
        [
            "Еда",
            "Зелье",
            "Оружие",
            "Броня"
        ];


    if (
        gold <
        prices[index]
    ) {

        message(
            "Недостаточно денег."
        );

        return;

    }


    gold -=
        prices[index];


    if (index === 0)
        inventory.food++;

    if (index === 1)
        inventory.potions++;

    if (index === 2) {

        inventory.weapons++;

        party.forEach(
            p => p.atk++
        );

    }

    if (index === 3) {

        inventory.armor++;

        party.forEach(
            p => p.def++
        );

    }


    updateInventoryHUD();


    message(
        "Куплено: "+
        names[index]
    );

}


/* =========================================================
   INVENTORY MENU
========================================================= */

function updateMenu() {

    if (
        pressed("x") ||
        pressed("c")
    ) {

        game.mode =
            "explore";

    }

}


/* =========================================================
   MESSAGE
========================================================= */

function message(textValue) {

    game.message =
        textValue;

    game.messageTime =
        180;

}


/* =========================================================
   INVENTORY HUD
========================================================= */

function updateInventoryHUD() {

    document
        .getElementById("gold")
        .textContent =
        gold;

    document
        .getElementById("food")
        .textContent =
        inventory.food;

    document
        .getElementById("potions")
        .textContent =
        inventory.potions;

}


/* =========================================================
   DRAW HELPERS
========================================================= */

function txt(
    str,
    x,
    y,
    size=14,
    color="#fff"
) {

    ctx.fillStyle =
        color;

    ctx.font =
        size+
        "px monospace";

    ctx.fillText(
        str,
        x,
        y
    );

}


function bar(
    x,
    y,
    w,
    h,
    value,
    max,
    color="#fff"
) {

    ctx.fillStyle="#222";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );

    ctx.fillStyle =
        color;

    ctx.fillRect(
        x,
        y,
        w*
        Math.max(
            0,
            Math.min(
                1,
                value/max
            )
        ),
        h
    );

}


/* =========================================================
   BACKGROUND
========================================================= */

function drawWasteland() {

    if (
        images.wasteland.complete &&
        images.wasteland.naturalWidth
    ) {

        ctx.drawImage(
            images.wasteland,
            0,
            0,
            W,
            H
        );

    }
    else {

        ctx.fillStyle="#151522";

        ctx.fillRect(
            0,
            0,
            W,
            H
        );

    }


    if (
        images.trail.complete &&
        images.trail.naturalWidth
    ) {

        ctx.globalAlpha=.9;

        ctx.drawImage(
            images.trail,
            0,
            150,
            W,
            210
        );

        ctx.globalAlpha=1;

    }

}


/* =========================================================
   DRAW PLAYER
========================================================= */

function playerSprite() {

    if (
        player.direction ===
        "left"
    )
        return images.left;

    if (
        player.direction ===
        "right"
    )
        return images.right;

    if (
        player.direction ===
        "back"
    )
        return images.back;

    return images.delta;

}


function drawPlayer() {

    const img =
        playerSprite();


    if (
        img.complete &&
        img.naturalWidth
    ) {

        ctx.drawImage(
            img,
            player.x-18,
            player.y-28,
            36,
            44
        );

    }
    else {

        ctx.fillStyle="#fff";

        ctx.fillRect(
            player.x-10,
            player.y-20,
            20,
            30
        );

    }

}


/* =========================================================
   DRAW WORLD
========================================================= */

function drawWorld() {

    if (
        game.room ===
        "wasteland1" ||
        game.room ===
        "wasteland2"
    ) {

        drawWasteland();

    }


    else if (
        game.room ===
        "shop"
    ) {

        if (
            images.shop.complete &&
            images.shop.naturalWidth
        ) {

            ctx.drawImage(
                images.shop,
                0,
                0,
                W,
                H
            );

        }
        else {

            ctx.fillStyle="#202020";

            ctx.fillRect(
                0,
                0,
                W,
                H
            );

            txt(
                "МАГАЗИН",
                260,
                120,
                28
            );

        }

    }


    else if (
        game.room ===
        "boxes"
    ) {

        drawBoxes();

    }


    else if (
        game.room ===
        "cemetery"
    ) {

        drawCemetery();

    }


    txt(
        rooms[game.room],
        20,
        35,
        15
    );


    /*
       Союзники
    */

    if (
        game.room !==
        "shop"
    ) {

        followers.forEach(
            (f,i) => {

                ctx.fillStyle =
                    [
                        "#55aaff",
                        "#55dd66",
                        "#cc8844",
                        "#ff66cc"
                    ][i];

                ctx.fillRect(
                    f.x-8,
                    f.y-15,
                    16,
                    25
                );

            }
        );

    }


    drawPlayer();

}


/* =========================================================
   BOX PUZZLE DRAW
========================================================= */

function drawBoxes() {

    ctx.fillStyle="#12151d";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    for (
        let x=0;
        x<W;
        x+=40
    ) {

        ctx.strokeStyle=
            "#1d222d";

        ctx.strokeRect(
            x,
            60,
            40,
            300
        );

    }


    txt(
        "ВОРОТА НА КЛАДБИЩЕ",
        205,
        35,
        18
    );


    /*
       Ворота
    */

    ctx.fillStyle =
        game.puzzle &&
        game.puzzle.solved
            ? "#31663b"
            : "#30333b";

    ctx.fillRect(
        570,
        70,
        45,
        250
    );


    /*
       Кнопки.
       При правильной коробке
       становятся зелёными.
    */

    game.puzzle.buttons.forEach(
        button => {

            const active =
                game.puzzle.boxes.some(
                    box => {

                        const bx =
                            box.x+
                            box.w/2;

                        const by =
                            box.y+
                            box.h/2;

                        const px =
                            button.x+
                            button.w/2;

                        const py =
                            button.y+
                            button.h/2;

                        return (
                            Math.abs(
                                bx-px
                            ) < 25 &&
                            Math.abs(
                                by-py
                            ) < 20
                        );

                    }
                );


            ctx.fillStyle =
                active
                    ? "#32cc55"
                    : "#cc3030";

            ctx.fillRect(
                button.x,
                button.y,
                button.w,
                button.h
            );

        }
    );


    /*
       Коробки
    */

    game.puzzle.boxes.forEach(
        (box,i) => {

            ctx.fillStyle =
                game.puzzle.selected === i
                    ? "#ffd94d"
                    : "#996633";

            ctx.fillRect(
                box.x,
                box.y,
                box.w,
                box.h
            );

            ctx.strokeStyle="#e5ad70";

            ctx.strokeRect(
                box.x,
                box.y,
                box.w,
                box.h
            );

        }
    );


    txt(
        "Подойди к коробке и нажми Z",
        190,
        335,
        13
    );

}


/* =========================================================
   CEMETERY
========================================================= */

function drawCemetery() {

    ctx.fillStyle="#080b13";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle="#ddd";

    ctx.beginPath();

    ctx.arc(
        510,
        60,
        32,
        0,
        Math.PI*2
    );

    ctx.fill();


    ctx.fillStyle="#10131b";

    ctx.fillRect(
        0,
        220,
        W,
        140
    );


    for (
        let i=0;
        i<9;
        i++
    ) {

        const x =
            30+i*70;

        const y =
            175+
            (i%2)*30;


        ctx.fillStyle="#3b3f4c";

        ctx.fillRect(
            x,
            y,
            30,
            48
        );

        ctx.fillRect(
            x-5,
            y+10,
            40,
            7
        );

    }


    txt(
        "ЦИФРОВОЕ КЛАДБИЩЕ",
        210,
        35,
        18
    );

}


/* =========================================================
   CHASE DRAW
========================================================= */

function drawChase() {

    /*
       ДВИГАЮЩИЙСЯ ФОН.
       Рисуем несколько копий
       картинки рядом и смещаем их.
    */

    ctx.save();

    const offset =
        -(game.chase.scroll % W);


    for (
        let i=-1;
        i<=1;
        i++
    ) {

        if (
            images.wasteland.complete &&
            images.wasteland.naturalWidth
        ) {

            ctx.drawImage(
                images.wasteland,
                offset+i*W,
                0,
                W,
                H
            );

        }
        else {

            ctx.fillStyle="#151522";

            ctx.fillRect(
                offset+i*W,
                0,
                W,
                H
            );

        }

    }


    /*
       Тропинка тоже движется.
    */

    if (
        images.trail.complete &&
        images.trail.naturalWidth
    ) {

        for (
            let i=-1;
            i<=1;
            i++
        ) {

            ctx.drawImage(
                images.trail,
                offset+i*W,
                150,
                W,
                210
            );

        }

    }


    ctx.restore();


    /*
       Затемнение движения.
    */

    ctx.fillStyle=
        "rgba(0,0,0,.2)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    txt(
        "ГЛЮЧНЫЙ ЗВЕРЬ!",
        235,
        40,
        23,
        "#ff4444"
    );


    txt(
        "БЕГИ!",
        290,
        70,
        18
    );


    /*
       Зверь сзади.
    */

    if (
        images.error.complete &&
        images.error.naturalWidth
    ) {

        ctx.drawImage(
            images.error,
            40,
            175,
            80,
            80
        );

    }


    /*
       Дельта впереди.
    */

    drawPlayer();


    /*
       QTE.
    */

    const need =
        game.chase.sequence[
            game.chase.qteIndex
        ];


    ctx.fillStyle=
        "rgba(0,0,0,.8)";

    ctx.fillRect(
        220,
        105,
        200,
        120
    );


    txt(
        "НАЖМИ",
        280,
        135,
        15
    );


    txt(
        need.toUpperCase(),
        300,
        180,
        38,
        "#fff"
    );


    txt(
        "Время: "+
        Math.ceil(
            game.chase.time
        ),
        275,
        205,
        13
    );


    txt(
        (
            game.chase.qteIndex+
            1
        )+
        "/"+
        game.chase.sequence.length,
        300,
        225,
        12
    );

}


/* =========================================================
   DIALOGUE DRAW
========================================================= */

function drawDialogue() {

    drawWorld();


    ctx.fillStyle=
        "rgba(0,0,0,.6)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle="#050505";

    ctx.fillRect(
        25,
        235,
        590,
        105
    );


    ctx.strokeStyle="#fff";

    ctx.lineWidth=3;

    ctx.strokeRect(
        25,
        235,
        590,
        105
    );


    const d =
        game.dialogue[
            game.dialogueIndex
        ];


    txt(
        d[0],
        45,
        265,
        18,
        d[0] ===
        "ДЕЛЬТА"
            ? "#fff"
            : "#66bbff"
    );


    ctx.font=
        "16px monospace";

    ctx.fillStyle="#fff";


    const words =
        d[1].split(" ");

    let line="";
    let y=290;


    words.forEach(
        word => {

            const test =
                line+
                word+
                " ";

            if (
                ctx.measureText(
                    test
                ).width > 530
            ) {

                ctx.fillText(
                    line,
                    45,
                    y
                );

                y+=22;

                line =
                    word+
                    " ";

            }
            else {

                line=test;

            }

        }
    );


    ctx.fillText(
        line,
        45,
        y
    );


    txt(
        "Z — далее",
        510,
        325,
        12
    );

}


/* =========================================================
   BATTLE DRAW
========================================================= */

function drawBattle() {

    const b =
        game.battle;


    ctx.fillStyle="#050509";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /*
       Враг
    */

    if (
        images.error.complete &&
        images.error.naturalWidth
    ) {

        ctx.drawImage(
            images.error,
            260,
            20,
            120,
            120
        );

    }


    txt(
        "ОШИБКА СИСТЕМЫ",
        35,
        35,
        18
    );


    txt(
        "HP",
        480,
        30,
        14
    );


    bar(
        515,
        20,
        100,
        12,
        b.enemyHP,
        b.enemyMax
    );


    txt(
        b.enemyHP+
        " / "+
        b.enemyMax,
        515,
        52,
        12
    );


    /*
       Боевая зона
    */

    ctx.strokeStyle="#fff";

    ctx.lineWidth=3;

    ctx.strokeRect(
        45,
        105,
        360,
        215
    );


    /*
       Атака врага
    */

    if (
        b.phase ===
        "enemy"
    ) {

        if (
            b.attackType ===
            "laser"
        ) {

            if (
                b.laserWarning > 0
            ) {

                ctx.fillStyle=
                    "rgba(255,40,40,.35)";

                ctx.fillRect(
                    b.laserX-8,
                    108,
                    16,
                    209
                );

                txt(
                    "!",
                    b.laserX-6,
                    170,
                    30,
                    "#ff3333"
                );

            }
            else {

                ctx.fillStyle=
                    "#ff2222";

                ctx.fillRect(
                    b.laserX-7,
                    108,
                    14,
                    209
                );

            }

        }


        if (
            b.attackType ===
            "explosion"
        ) {

            b.explosions.forEach(
                e => {

                    if (
                        e.timer <= 0
                    ) {

                        ctx.strokeStyle=
                            "#ff7733";

                        ctx.lineWidth=3;

                        ctx.beginPath();

                        ctx.arc(
                            e.x,
                            e.y,
                            e.radius,
                            0,
                            Math.PI*2
                        );

                        ctx.stroke();

                    }

                }
            );

        }


        /*
           Душа
        */

        ctx.fillStyle=
            b.hitCooldown > 0
                ? "#ffffff"
                : "#ff3045";

        ctx.fillRect(
            b.soulX-7,
            b.soulY-7,
            14,
            14
        );

    }


    /*
       HP команды.
       Теперь они всегда видны.
       При попадании значения меняются
       непосредственно здесь.
    */

    party.forEach(
        (p,i) => {

            const y =
                125+i*40;

            txt(
                p.name,
                430,
                y,
                13
            );

            bar(
                500,
                y-12,
                105,
                10,
                p.hp,
                p.maxHP,
                p.hp >
                p.maxHP*.5
                    ? "#55dd66"
                    : "#ff4444"
            );

            txt(
                p.hp+
                "/"+
                p.maxHP,
                510,
                y+15,
                11
            );

        }
    );


    /*
       Сообщение
    */

    txt(
        b.message,
        55,
        335,
        12
    );


    /*
       Меню
    */

    if (
        b.phase ===
        "menu"
    ) {

        const options = [
            "FIGHT",
            "ACT",
            "ITEM",
            "MERCY"
        ];


        options.forEach(
            (name,i) => {

                const x =
                    50+
                    (i%2)*160;

                const y =
                    145+
                    Math.floor(
                        i/2
                    )*65;


                if (
                    b.menu === i
                ) {

                    ctx.strokeStyle=
                        "#fff";

                    ctx.strokeRect(
                        x-12,
                        y-25,
                        130,
                        42
                    );

                }


                txt(
                    name,
                    x,
                    y,
                    18
                );

            }
        );

    }

}


/* =========================================================
   SHOP DRAW
========================================================= */

function drawShopMenu() {

    drawWorld();


    ctx.fillStyle=
        "rgba(0,0,0,.9)";

    ctx.fillRect(
        100,
        45,
        440,
        275
    );


    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        100,
        45,
        440,
        275
    );


    txt(
        "МАГАЗИН",
        270,
        80,
        25
    );


    const items = [
        ["Еда",10],
        ["Зелье",20],
        ["Оружие",45],
        ["Броня",40]
    ];


    items.forEach(
        (item,i) => {

            const y =
                125+
                i*40;


            if (
                game.shopIndex === i
            ) {

                txt(
                    "▶",
                    130,
                    y,
                    16
                );

            }


            txt(
                item[0],
                160,
                y,
                16
            );


            txt(
                item[1]+
                " G",
                420,
                y,
                16,
                "#ffd84d"
            );

        }
    );


    txt(
        "Z — купить",
        130,
        295,
        13
    );


    txt(
        "X — выйти",
        410,
        295,
        13
    );

}


/* =========================================================
   MENU
========================================================= */

function drawMenu() {

    ctx.fillStyle=
        "rgba(0,0,0,.95)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    txt(
        "ИНВЕНТАРЬ",
        50,
        55,
        28
    );


    txt(
        "Еда: "+
        inventory.food,
        60,
        105,
        18
    );


    txt(
        "Зелья: "+
        inventory.potions,
        60,
        135,
        18
    );


    txt(
        "Оружие: "+
        inventory.weapons,
        60,
        165,
        18
    );


    txt(
        "Броня: "+
        inventory.armor,
        60,
        195,
        18
    );


    txt(
        "Деньги: "+
        gold,
        60,
        235,
        18,
        "#ffd84d"
    );


    txt(
        "X / C — назад",
        60,
        300,
        14
    );

}


/* =========================================================
   DEFEAT
========================================================= */

function drawDefeat() {

    ctx.fillStyle="#000";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    txt(
        "ОТРЯД ПОВЕРЖЕН",
        190,
        150,
        25,
        "#ff4444"
    );


    txt(
        "Z — начать заново",
        235,
        200,
        15
    );

}


/* =========================================================
   UPDATE
========================================================= */

function update() {

    if (
        game.mode ===
        "title"
    ) {

        if (
            pressed("z")
        ) {

            startGame();

        }

    }

    else if (
        game.transition > 0
    ) {

        game.transition--;

        if (
            game.transition <= 0
        ) {

            finishTransition();

        }

    }

    else if (
        game.mode ===
        "dialogue"
    ) {

        if (
            pressed("z")
        ) {

            nextDialogue();

        }

        if (
            pressed("x")
        ) {

            game.dialogue=null;

            game.mode=
                "explore";

        }

    }

    else if (
        game.mode ===
        "explore"
    ) {

        updatePlayer();

        updateFollowers();

        updateExits();

        randomBattle();


        if (
            pressed("c")
        ) {

            game.mode =
                "menu";

        }


        if (
            game.room ===
            "boxes"
        ) {

            updatePuzzle();

        }


        if (
            game.room ===
            "shop" &&
            player.x > 100 &&
            player.x < 300 &&
            player.y > 200 &&
            pressed("z")
        ) {

            game.mode =
                "shop";

        }

    }

    else if (
        game.mode ===
        "battle"
    ) {

        updateBattle();

    }

    else if (
        game.mode ===
        "chase"
    ) {

        updateChase();

    }

    else if (
        game.mode ===
        "shop"
    ) {

        updateShop();

    }

    else if (
        game.mode ===
        "menu"
    ) {

        updateMenu();

    }

    else if (
        game.mode ===
        "defeat"
    ) {

        if (
            pressed("z")
        ) {

            party.forEach(
                p =>
                    p.hp=p.maxHP
            );

            game.mode =
                "explore";

            music("world");

        }

    }


    if (
        game.messageTime > 0
    ) {

        game.messageTime--;

    }


    /*
       Запоминаем клавиши
       только после обработки.
    */

    for (const k in previous) {

        previous[k] =
            keys[k];

    }

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


    if (
        game.mode ===
        "title"
    ) {

        ctx.fillStyle="#050509";

        ctx.fillRect(
            0,
            0,
            W,
            H
        );


        txt(
            "BLOOD GLOW",
            205,
            125,
            38
        );


        txt(
            "DIGITAL WASTELAND",
            225,
            155,
            14,
            "#7777ff"
        );


        txt(
            "Z — НАЧАТЬ",
            270,
            225,
            18
        );


        txt(
            "WASD / ДЖОЙСТИК — движение",
            205,
            270,
            12
        );

        return;

    }


    if (
        game.mode ===
        "battle"
    ) {

        drawBattle();

    }

    else if (
        game.mode ===
        "chase"
    ) {

        drawChase();

    }

    else if (
        game.mode ===
        "shop"
    ) {

        drawShopMenu();

    }

    else if (
        game.mode ===
        "menu"
    ) {

        drawMenu();

    }

    else if (
        game.mode ===
        "defeat"
    ) {

        drawDefeat();

    }

    else {

        drawWorld();


        if (
            game.mode ===
            "dialogue"
        ) {

            drawDialogue();

        }

    }


    /*
       Сообщение.
    */

    if (
        game.messageTime > 0 &&
        game.mode !==
        "battle"
    ) {

        ctx.fillStyle=
            "rgba(0,0,0,.8)";

        ctx.fillRect(
            100,
            55,
            440,
            45
        );


        txt(
            game.message,
            120,
            83,
            13
        );

    }


    /*
       Переход.
    */

    if (
        game.transition > 0
    ) {

        const alpha =
            game.transition < 23
                ? 1-
                  game.transition/23
                : (
                    45-
                    game.transition
                  )/22;


        ctx.fillStyle =
            "rgba(0,0,0,"+
            Math.max(
                0,
                Math.min(
                    1,
                    alpha
                )
            )+
            ")";


        ctx.fillRect(
            0,
            0,
            W,
            H
        );

    }

}


/* =========================================================
   LOOP
========================================================= */

function loop() {

    update();

    draw();

    requestAnimationFrame(
        loop
    );

}


updateInventoryHUD();

loop();
