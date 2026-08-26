"use strict";

/* =====================================================
   CANVAS
===================================================== */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const W = 480;
const H = 270;

ctx.imageSmoothingEnabled = false;


/* =====================================================
   IMAGES
===================================================== */

const images = {
    wasteland: new Image(),
    error: new Image(),
    delta: new Image(),
    left: new Image(),
    right: new Image(),
    back: new Image()
};

images.wasteland.src = "images/wasteland.png";
images.error.src = "images/error.png";
images.delta.src = "images/delta.png";
images.left.src = "images/deltalef.png";
images.right.src = "images/deltaright.png";
images.back.src = "images/deltabach.png";


/* =====================================================
   SAFE IMAGE DRAW
===================================================== */

function drawImageSafe(img,x,y,w,h) {

    if (img.complete && img.naturalWidth > 0) {

        ctx.drawImage(
            img,
            x,
            y,
            w,
            h
        );

        return true;
    }

    return false;
}


/* =====================================================
   MUSIC
===================================================== */

const music = document.getElementById("music");

function startMusic() {

    if (!music) return;

    music.volume = 0.35;

    music.play().catch(() => {});
}

window.addEventListener("pointerdown", startMusic, {
    once:true
});


/* =====================================================
   INPUT
===================================================== */

const keys = {

    up:false,
    down:false,
    left:false,
    right:false,

    z:false,
    x:false,
    c:false
};

const pressed = {

    up:false,
    down:false,
    left:false,
    right:false,

    z:false,
    x:false,
    c:false
};


/* =====================================================
   KEYBOARD
===================================================== */

window.addEventListener("keydown", e => {

    let k = e.key.toLowerCase();

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

    let k = e.key.toLowerCase();

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


/* =====================================================
   MOBILE BUTTONS
===================================================== */

document.querySelectorAll(".joy, .action")
.forEach(button => {

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


/* =====================================================
   PRESS DETECTION
===================================================== */

function updatePressed() {

    for (const k in keys) {

        pressed[k] =
            keys[k] && !pressed[k];

    }
}


/*
   Отдельная функция для одноразового
   нажатия.
*/

const oldKeys = {
    up:false,
    down:false,
    left:false,
    right:false,
    z:false,
    x:false,
    c:false
};

function justPressed(k) {

    return keys[k] && !oldKeys[k];
}

function saveKeyState() {

    for (const k in keys) {

        oldKeys[k] = keys[k];

    }
}


/* =====================================================
   FULLSCREEN
===================================================== */

document.getElementById("fullscreen")
.addEventListener("click", async () => {

    try {

        if (!document.fullscreenElement) {

            await document.documentElement.requestFullscreen();

        } else {

            await document.exitFullscreen();

        }

    } catch(e) {}

});


/* =====================================================
   GAME STATE
===================================================== */

const game = {

    mode:"explore",

    room:"wasteland1",

    started:false,

    dialogue:null,

    dialogueIndex:0,

    transition:0,

    transitionTarget:null,

    battle:null,

    shopIndex:0,

    inventoryOpen:false,

    chase:null,

    puzzle:null

};


/* =====================================================
   PARTY
===================================================== */

const party = [

    {
        name:"ДЕЛЬТА",
        hp:90,
        maxHP:90,
        atk:14,
        def:8,
        color:"#fff"
    },

    {
        name:"ЛИЧИ",
        hp:80,
        maxHP:80,
        atk:13,
        def:6,
        color:"#55aaff"
    },

    {
        name:"ПАНКЕЙК",
        hp:70,
        maxHP:70,
        atk:10,
        def:11,
        color:"#55dd66"
    },

    {
        name:"КАШТАН",
        hp:110,
        maxHP:110,
        atk:12,
        def:12,
        color:"#cc8844",
        mp:60,
        maxMP:60
    },

    {
        name:"ШАРЛОТТА",
        hp:100,
        maxHP:100,
        atk:11,
        def:9,
        color:"#ff77aa"
    }

];


/* =====================================================
   PLAYER
===================================================== */

const player = {

    x:120,
    y:185,

    speed:1.6,

    direction:"down"

};


/* =====================================================
   WORLD
===================================================== */

const rooms = {

    wasteland1: {

        name:"ЦИФРОВАЯ ПУСТОШЬ",

        x:0,

        width:1800,

        exitX:1650,

        next:"wasteland2"

    },

    wasteland2: {

        name:"ПУСТОШЬ — МАГАЗИН",

        x:0,

        width:1800,

        exitX:1650,

        next:"shop"

    },

    shop: {

        name:"МАГАЗИН",

        x:0,

        width:900,

        exitX:820,

        next:"wasteland3"

    },

    wasteland3: {

        name:"ПУСТОШЬ",

        x:0,

        width:2000,

        exitX:1850,

        next:"chase"

    }

};


/* =====================================================
   CAMERA
===================================================== */

let cameraX = 0;

function updateCamera() {

    cameraX =
        player.x - W / 2;

    cameraX =
        Math.max(
            0,
            Math.min(
                cameraX,
                rooms[game.room].width - W
            )
        );

}


/* =====================================================
   START SCREEN
===================================================== */

function drawStart() {

    ctx.fillStyle="#050505";
    ctx.fillRect(0,0,W,H);

    ctx.fillStyle="#fff";

    ctx.font="26px monospace";

    ctx.fillText(
        "BLOOD GLOW",
        145,
        80
    );

    ctx.font="9px monospace";

    ctx.fillText(
        "DIGITAL WORLD",
        178,
        98
    );

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        165,
        135,
        150,
        35
    );

    ctx.fillText(
        "Z — НАЧАТЬ",
        195,
        157
    );

    ctx.font="7px monospace";

    ctx.fillStyle="#777";

    ctx.fillText(
        "WASD / СТРЕЛКИ — движение",
        155,
        200
    );

    ctx.fillText(
        "Z — действие    X — назад    C — меню",
        130,
        215
    );

}


/* =====================================================
   START
===================================================== */

function startGame() {

    game.started = true;

    game.mode = "dialogue";

    game.dialogue = [

        "Дельта открывает глаза.",

        "Вокруг — цифровая пустошь.",

        "Где-то впереди уже ждёт команда.",

        "Личи: Надо проверить Немку...",

        "Личи: Она изменилась.",

        "Личи: Последний раз, когда мы пытались поговорить с ней, она была странной.",

        "Дельта: Так мы идём?",

        "Личи: Да.",

        "Панкейк: Тогда не будем задерживаться.",

        "Каштан: Надеюсь, это обычный системный сбой.",

        "Шарлотта: В цифровом мире ничего не бывает обычным.",

        "Впереди начинается пустошь."

    ];

    game.dialogueIndex = 0;

}


/* =====================================================
   DIALOGUE
===================================================== */

function updateDialogue() {

    if (justPressed("z")) {

        game.dialogueIndex++;

        if (
            game.dialogueIndex >=
            game.dialogue.length
        ) {

            game.dialogue = null;

            game.mode = "explore";

        }

    }

    if (justPressed("x")) {

        game.dialogue = null;

        game.mode = "explore";

    }

}


function drawDialogue() {

    ctx.fillStyle="rgba(0,0,0,.72)";
    ctx.fillRect(0,0,W,H);

    ctx.fillStyle="#000";

    ctx.fillRect(
        25,
        185,
        430,
        65
    );

    ctx.strokeStyle="#fff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        25,
        185,
        430,
        65
    );

    ctx.fillStyle="#fff";

    ctx.font="10px monospace";

    wrapText(
        game.dialogue[
            game.dialogueIndex
        ],
        42,
        210,
        390,
        14
    );

    ctx.font="7px monospace";

    ctx.fillStyle="#aaa";

    ctx.fillText(
        "Z — продолжить",
        330,
        240
    );

}


/* =====================================================
   TEXT WRAP
===================================================== */

function wrapText(text,x,y,maxWidth,lineHeight) {

    const words = text.split(" ");

    let line = "";

    for (let word of words) {

        const test = line + word + " ";

        if (
            ctx.measureText(test).width >
            maxWidth
        ) {

            ctx.fillText(
                line,
                x,
                y
            );

            line = word + " ";

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


/* =====================================================
   MOVEMENT
===================================================== */

function updatePlayer() {

    if (game.mode !== "explore")
        return;

    let dx=0;
    let dy=0;

    if (keys.left) {

        dx=-player.speed;

        player.direction="left";

    }

    if (keys.right) {

        dx=player.speed;

        player.direction="right";

    }

    if (keys.up) {

        dy=-player.speed;

        player.direction="back";

    }

    if (keys.down) {

        dy=player.speed;

        player.direction="down";

    }

    player.x += dx;
    player.y += dy;

    const room =
        rooms[game.room];

    player.x =
        Math.max(
            30,
            Math.min(
                room.width-30,
                player.x
            )
        );

    player.y =
        Math.max(
            100,
            Math.min(
                210,
                player.y
            )
        );

}


/* =====================================================
   EXIT / TRANSITION
===================================================== */

function checkExit() {

    if (game.mode !== "explore")
        return;

    const room =
        rooms[game.room];

    if (
        player.x >= room.exitX
    ) {

        beginTransition(
            room.next
        );

    }

}


function beginTransition(target) {

    game.mode="transition";

    game.transition=0;

    game.transitionTarget=target;

}


function updateTransition() {

    game.transition += 0.025;

    if (game.transition >= 1) {

        game.transition = 1;

        game.room =
            game.transitionTarget;

        player.x=60;

        player.y=185;

        setTimeout(() => {

            game.mode="explore";

        },700);

    }

}


/* =====================================================
   DRAW TRANSITION
===================================================== */

function drawTransition() {

    if (game.transition <= 0)
        return;

    ctx.fillStyle="#000";

    let alpha =
        game.transition < .5
        ? game.transition*2
        : (1-game.transition)*2;

    ctx.globalAlpha =
        Math.max(0,Math.min(1,alpha));

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    ctx.globalAlpha=1;

}


/* =====================================================
   WASTELAND
===================================================== */

function drawWasteland() {

    const room =
        rooms[game.room];

    /*
       Уменьшенный фон.
    */

    if (
        images.wasteland.complete &&
        images.wasteland.naturalWidth>0
    ) {

        const scale =
            0.52;

        const fw =
            images.wasteland.naturalWidth *
            scale;

        const fh =
            images.wasteland.naturalHeight *
            scale;

        const y =
            H - fh;

        ctx.drawImage(
            images.wasteland,
            -cameraX*.45,
            y,
            fw,
            fh
        );

        /*
           второй слой для длинной пустоши
        */

        if (fw < room.width) {

            let x=fw;

            while (x < room.width+W) {

                ctx.drawImage(
                    images.wasteland,
                    x-cameraX*.45,
                    y,
                    fw,
                    fh
                );

                x += fw;

            }

        }

    }

    else {

        ctx.fillStyle="#202028";

        ctx.fillRect(
            0,
            0,
            W,
            H
        );

        drawFallbackWasteland();

    }


    /*
       земля
    */

    ctx.fillStyle="rgba(0,0,0,.22)";

    ctx.fillRect(
        0,
        205,
        W,
        65
    );


    /*
       тропинка
    */

    ctx.fillStyle="#3b3030";

    ctx.beginPath();

    ctx.moveTo(
        -cameraX,
        220
    );

    ctx.lineTo(
        room.width-cameraX,
        220
    );

    ctx.lineTo(
        room.width-cameraX,
        270
    );

    ctx.lineTo(
        -cameraX,
        270
    );

    ctx.fill();


    /*
       переход
    */

    const exitX =
        room.exitX-cameraX;

    if (
        exitX>-100 &&
        exitX<W+100
    ) {

        ctx.fillStyle="#000";

        ctx.fillRect(
            exitX,
            170,
            18,
            55
        );

        ctx.strokeStyle="#fff";

        ctx.strokeRect(
            exitX,
            170,
            18,
            55
        );

        ctx.fillStyle="#fff";

        ctx.font="7px monospace";

        ctx.fillText(
            "ДАЛЬШЕ",
            exitX-10,
            158
        );

    }

}


/* =====================================================
   FALLBACK BACKGROUND
===================================================== */

function drawFallbackWasteland() {

    ctx.fillStyle="#333";

    for (
        let x=0;
        x<W;
        x+=30
    ) {

        ctx.fillRect(
            x,
            150+(x%20),
            2,
            2
        );

    }

}


/* =====================================================
   DELTA SPRITE
===================================================== */

function drawDelta() {

    let sprite = images.delta;

    if (player.direction==="left")
        sprite=images.left;

    if (player.direction==="right")
        sprite=images.right;

    if (player.direction==="back")
        sprite=images.back;

    const sx =
        player.x-cameraX-16;

    const sy =
        player.y-40;

    if (
        !drawImageSafe(
            sprite,
            sx,
            sy,
            32,
            48
        )
    ) {

        /*
           запасной Дельта,
           чтобы игра не стала пустой
        */

        ctx.fillStyle="#fff";

        ctx.fillRect(
            sx+10,
            sy+8,
            12,
            14
        );

        ctx.fillStyle="#222";

        ctx.fillRect(
            sx+8,
            sy+22,
            16,
            18
        );

    }

}


/* =====================================================
   TEAM
===================================================== */

function drawTeam() {

    if (game.room !== "wasteland1")
        return;

    const names = [
        ["Личи","#55aaff"],
        ["Панкейк","#55dd66"],
        ["Каштан","#cc8844"],
        ["Шарлотта","#ff77aa"]
    ];

    names.forEach((n,i) => {

        const x =
            300 + i*42-cameraX;

        if (
            x<-40 ||
            x>W+40
        )
            return;

        ctx.fillStyle=n[1];

        ctx.fillRect(
            x,
            165,
            18,
            25
        );

        ctx.fillStyle="#111";

        ctx.fillRect(
            x+4,
            169,
            10,
            8
        );

    });

}


/* =====================================================
   RANDOM BATTLE TIMER
===================================================== */

let encounterSteps = 0;

function updateRandomBattle() {

    if (
        game.room !== "wasteland1" &&
        game.room !== "wasteland2"
    )
        return;

    if (game.mode !== "explore")
        return;

    if (
        Math.abs(player.x % 1) > 0
    ) {

        encounterSteps++;

    }

    /*
       Очень редкий шанс.
    */

    if (
        encounterSteps > 900 &&
        Math.random() < 0.002
    ) {

        encounterSteps=0;

        startBattle();

    }

}


/* =====================================================
   SHOP
===================================================== */

const shopItems = [

    {
        name:"ХЛЕБ",
        price:20,
        type:"food"
    },

    {
        name:"ЦИФРОВОЙ МЕЧ",
        price:80,
        type:"weapon"
    },

    {
        name:"СТАРАЯ БРОНЯ",
        price:70,
        type:"armor"
    },

    {
        name:"МЕД-ПАК",
        price:35,
        type:"food"
    }

];

let money = 150;

function enterShop() {

    if (
        game.room === "shop" &&
        player.x > 400 &&
        player.x < 700 &&
        justPressed("z")
    ) {

        game.mode="shop";

    }

}


function updateShop() {

    if (justPressed("x")) {

        game.mode="explore";

        return;

    }

    if (justPressed("up")) {

        game.shopIndex--;

        if (game.shopIndex<0)
            game.shopIndex =
                shopItems.length-1;

    }

    if (justPressed("down")) {

        game.shopIndex++;

        if (
            game.shopIndex>=
            shopItems.length
        )
            game.shopIndex=0;

    }

    if (justPressed("z")) {

        const item =
            shopItems[
                game.shopIndex
            ];

        if (money>=item.price) {

            money -= item.price;

        }

    }

}


function drawShop() {

    ctx.fillStyle="#171717";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        50,
        25,
        380,
        220
    );

    ctx.fillStyle="#fff";

    ctx.font="15px monospace";

    ctx.fillText(
        "МАГАЗИН",
        190,
        52
    );

    ctx.font="8px monospace";

    ctx.fillText(
        "МОНЕТЫ: "+money,
        65,
        75
    );

    shopItems.forEach((item,i) => {

        const y =
            100+i*28;

        if (
            i===game.shopIndex
        ) {

            ctx.fillText(
                "▶",
                75,
                y
            );

        }

        ctx.fillText(
            item.name,
            95,
            y
        );

        ctx.fillText(
            item.price+" G",
            320,
            y
        );

    });

    ctx.fillText(
        "Z — купить",
        75,
        225
    );

    ctx.fillText(
        "X — выйти",
        330,
        225
    );

}


/* =====================================================
   CHASE
===================================================== */

function startChase() {

    game.mode="chase";

    game.chase={

        time:30,

        current:"z",

        nextChange:0,

        speed:2,

        mistake:0,

        success:0

    };

}


function updateChase() {

    const c=game.chase;

    c.time -= 1/60;

    if (c.time <= 0) {

        startPuzzle();

        return;

    }

    c.nextChange--;

    if (c.nextChange<=0) {

        const buttons=[
            "z",
            "x",
            "c"
        ];

        c.current =
            buttons[
                Math.floor(
                    Math.random()*3
                )
            ];

        c.nextChange =
            45+
            Math.floor(
                Math.random()*70
            );

    }


    /*
       правильная кнопка
    */

    if (
        justPressed(c.current)
    ) {

        c.success++;

        c.speed += .05;

        c.nextChange=0;

    }


    /*
       неправильная кнопка
    */

    if (
        justPressed("z") &&
        c.current!=="z"
    ) {

        chaseMistake();

    }

    if (
        justPressed("x") &&
        c.current!=="x"
    ) {

        chaseMistake();

    }

    if (
        justPressed("c") &&
        c.current!=="c"
    ) {

        chaseMistake();

    }

}


function chaseMistake() {

    game.chase.mistake++;

    game.chase.speed =
        Math.max(
            .7,
            game.chase.speed-.25
        );

}


function drawChase() {

    drawWasteland();

    /*
       Дельта
    */

    ctx.fillStyle="#fff";

    ctx.fillRect(
        110,
        175,
        22,
        32
    );

    /*
       зверь
    */

    if (
        !drawImageSafe(
            images.error,
            320,
            135,
            70,
            70
        )
    ) {

        ctx.fillStyle="#aa33ff";

        ctx.fillRect(
            320,
            145,
            70,
            60
        );

        ctx.fillStyle="#fff";

        ctx.fillRect(
            335,
            160,
            10,
            10
        );

        ctx.fillRect(
            365,
            160,
            10,
            10
        );

    }


    ctx.fillStyle="#000";

    ctx.fillRect(
        55,
        30,
        370,
        90
    );

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        55,
        30,
        370,
        90
    );

    ctx.fillStyle="#fff";

    ctx.font="11px monospace";

    ctx.fillText(
        "ГЛЮКНУВШИЙ ЗВЕРЬ ДОГОНЯЕТ!",
        85,
        53
    );

    ctx.font="8px monospace";

    ctx.fillText(
        "НАЖМИТЕ НУЖНУЮ КНОПКУ",
        140,
        70
    );

    ctx.font="30px monospace";

    ctx.fillText(
        game.chase.current.toUpperCase(),
        225,
        105
    );

    ctx.font="8px monospace";

    ctx.fillText(
        "ВРЕМЯ: "+
        Math.ceil(game.chase.time),
        75,
        105
    );

    ctx.fillText(
        "ОШИБКИ: "+
        game.chase.mistake,
        330,
        105
    );

}


/* =====================================================
   PUZZLE
===================================================== */

function startPuzzle() {

    game.mode="puzzle";

    const buttons=[
        "z",
        "x",
        "c"
    ];

    const sequence=[];

    for(let i=0;i<6;i++) {

        sequence.push(
            buttons[
                Math.floor(
                    Math.random()*3
                )
            ]
        );

    }

    game.puzzle={

        sequence,

        index:0,

        wrong:0

    };

}


function updatePuzzle() {

    const p=game.puzzle;

    for (
        const k of ["z","x","c"]
    ) {

        if (
            justPressed(k)
        ) {

            if (
                k===p.sequence[p.index]
            ) {

                p.index++;

                if (
                    p.index>=
                    p.sequence.length
                ) {

                    startBattle();

                }

            }

            else {

                p.wrong++;

                p.index=0;

            }

        }

    }

}


function drawPuzzle() {

    drawWasteland();

    ctx.fillStyle="rgba(0,0,0,.8)";

    ctx.fillRect(
        40,
        30,
        400,
        205
    );

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        40,
        30,
        400,
        205
    );

    ctx.fillStyle="#fff";

    ctx.font="14px monospace";

    ctx.fillText(
        "СИСТЕМА ЗАБЛОКИРОВАНА",
        115,
        58
    );

    ctx.font="8px monospace";

    ctx.fillText(
        "ПОВТОРИТЕ ПОСЛЕДОВАТЕЛЬНОСТЬ",
        135,
        78
    );

    /*
       sequence
    */

    game.puzzle.sequence.forEach(
        (k,i) => {

            const x =
                100+i*48;

            ctx.strokeStyle =
                i < game.puzzle.index
                ? "#55ff55"
                : "#777";

            ctx.strokeRect(
                x,
                105,
                32,
                32
            );

            ctx.fillStyle="#fff";

            ctx.font="13px monospace";

            ctx.fillText(
                k.toUpperCase(),
                x+11,
                127
            );

        }
    );

    ctx.font="8px monospace";

    ctx.fillText(
        "ПРОГРЕСС: "+
        game.puzzle.index+
        " / "+
        game.puzzle.sequence.length,
        180,
        165
    );

    ctx.fillText(
        "ОШИБОК: "+
        game.puzzle.wrong,
        205,
        182
    );

    ctx.fillStyle="#aaa";

    ctx.fillText(
        "Z / X / C — выбрать кнопку",
        150,
        215
    );

}


/* =====================================================
   BATTLE
===================================================== */

function startBattle() {

    game.mode="battle";

    game.battle={

        enemy:{

            name:"СИСТЕМНАЯ ОШИБКА",

            hp:300,

            maxHP:300

        },

        actor:0,

        menu:0,

        phase:"menu",

        defend:false,

        magicMenu:false,

        mercy:0,

        enemyAttack:0,

        soul:{

            x:240,

            y:170,

            speed:3,

            hp:10,

            maxHP:10,

            invul:0

        },

        lasers:[],

        message:"Ошибка системы преградила путь."

    };

}


/* =====================================================
   BATTLE UPDATE
===================================================== */

function updateBattle() {

    const b=game.battle;

    if (!b)
        return;


    /*
       победа
    */

    if (b.enemy.hp<=0) {

        b.phase="victory";

    }


    if (
        b.phase==="victory"
    ) {

        if (justPressed("z")) {

            game.mode="explore";

            game.battle=null;

        }

        return;

    }


    /*
       обычное меню
    */

    if (b.phase==="menu") {

        if (justPressed("left")) {

            b.menu--;

            if (b.menu<0)
                b.menu=5;

        }

        if (justPressed("right")) {

            b.menu++;

            if (b.menu>5)
                b.menu=0;

        }

        if (justPressed("z")) {

            battleChoose();

        }

    }


    /*
       магия
    */

    if (b.phase==="magic") {

        if (justPressed("x")) {

            b.phase="menu";

        }

        if (justPressed("z")) {

            useMagic();

        }

    }


    /*
       enemy attack
    */

    if (b.phase==="enemy") {

        updateEnemyAttack();

    }


    /*
       остальные команды
    */

    saveKeyState();

}


/* =====================================================
   BATTLE MENU
===================================================== */

function battleChoose() {

    const b=game.battle;

    /*
       FIGHT
    */

    if (b.menu===0) {

        const actor =
            party[b.actor];

        const damage =
            actor.atk+
            Math.floor(
                Math.random()*8
            );

        b.enemy.hp -= damage;

        b.message =
            actor.name+
            " атакует!  -"+
            damage+
            " HP";

        nextActor();

    }


    /*
       ACT
    */

    else if (b.menu===1) {

        b.mercy =
            Math.min(
                100,
                b.mercy+20
            );

        b.message =
            "Дельта пытается понять ошибку.";

        nextActor();

    }


    /*
       ITEM
    */

    else if (b.menu===2) {

        const target =
            party[b.actor];

        target.hp =
            Math.min(
                target.maxHP,
                target.hp+30
            );

        b.message =
            target.name+
            " восстановил 30 HP.";

        nextActor();

    }


    /*
       DEFEND
    */

    else if (b.menu===3) {

        b.defend=true;

        b.message =
            party[b.actor].name+
            " защищается.";

        nextActor();

    }


    /*
       MAGIC
    */

    else if (b.menu===4) {

        if (
            party[3].mp>=15
        ) {

            b.phase="magic";

        } else {

            b.message =
                "У Каштана недостаточно MP.";

        }

    }


    /*
       MERCY
    */

    else if (b.menu===5) {

        if (b.mercy>=100) {

            b.enemy.hp=0;

            b.message =
                "Ошибка отключена.";

        } else {

            b.message =
                "Система ещё не готова к пощаде.";

            nextActor();

        }

    }

}


/* =====================================================
   NEXT ACTOR
===================================================== */

function nextActor() {

    const b=game.battle;

    b.actor++;

    /*
       ВСЕ союзники ходят.
    */

    if (
        b.actor>=party.length
    ) {

        b.actor=0;

        b.defend=false;

        startEnemyAttack();

        return;

    }

    b.menu=0;

}


/* =====================================================
   MAGIC
===================================================== */

function useMagic() {

    const b=game.battle;

    const kastan=party[3];

    if (kastan.mp<15)
        return;

    kastan.mp-=15;

    const damage=30;

    b.enemy.hp -= damage;

    b.message =
        "КАШТАН использует MAGIC: ИМПУЛЬС!  -"+
        damage+
        " HP";

    nextActor();

}


/* =====================================================
   ENEMY ATTACK
===================================================== */

function startEnemyAttack() {

    const b=game.battle;

    b.phase="enemy";

    b.enemyAttack=360;

    b.lasers=[];

    /*
       несколько лазеров
    */

    const amount =
        Math.random()<.5
        ? 2
        : 3;

    for (
        let i=0;
        i<amount;
        i++
    ) {

        b.lasers.push({

            x:
                80+
                Math.random()*320,

            warning:90,

            active:0,

            duration:90,

            width:5,

            damage:7

        });

    }

}


/* =====================================================
   ENEMY ATTACK UPDATE
===================================================== */

function updateEnemyAttack() {

    const b=game.battle;

    b.enemyAttack--;

    /*
       движение души
    */

    if (keys.left)
        b.soul.x -= b.soul.speed;

    if (keys.right)
        b.soul.x += b.soul.speed;

    if (keys.up)
        b.soul.y -= b.soul.speed;

    if (keys.down)
        b.soul.y += b.soul.speed;


    b.soul.x =
        Math.max(
            75,
            Math.min(
                405,
                b.soul.x
            )
        );

    b.soul.y =
        Math.max(
            115,
            Math.min(
                235,
                b.soul.y
            )
        );


    if (b.soul.invul>0)
        b.soul.invul--;


    /*
       лазеры
    */

    b.lasers.forEach(laser => {

        if (laser.warning>0) {

            laser.warning--;

        }

        else {

            laser.active++;

            /*
               попадание
            */

            if (
                Math.abs(
                    b.soul.x-laser.x
                ) <
                laser.width+5
            ) {

                if (
                    b.soul.invul<=0
                ) {

                    let damage =
                        laser.damage;

                    if (b.defend)
                        damage=3;

                    const target =
                        party[b.actor];

                    target.hp =
                        Math.max(
                            0,
                            target.hp-damage
                        );

                    b.soul.invul=35;

                    b.message =
                        target.name+
                        " получил "+
                        damage+
                        " урона!";

                    checkBattleDefeat();

                }

            }

        }

    });


    if (b.enemyAttack<=0) {

        b.phase="menu";

        b.actor=0;

        b.menu=0;

        b.lasers=[];

        b.message =
            "Ход Дельты.";

    }

}


/* =====================================================
   DEFEAT
===================================================== */

function checkBattleDefeat() {

    let alive=false;

    party.forEach(p => {

        if (p.hp>0)
            alive=true;

    });

    if (!alive) {

        game.battle.phase="defeat";

    }

}


/* =====================================================
   DRAW BATTLE
===================================================== */

function drawBattle() {

    const b=game.battle;

    ctx.fillStyle="#050505";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /*
       enemy
    */

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        110,
        10,
        260,
        75
    );


    if (
        !drawImageSafe(
            images.error,
            210,
            20,
            60,
            60
        )
    ) {

        ctx.fillStyle="#8833cc";

        ctx.fillRect(
            220,
            25,
            40,
            45
        );

    }


    ctx.fillStyle="#fff";

    ctx.font="8px monospace";

    ctx.fillText(
        b.enemy.name,
        120,
        22
    );


    ctx.fillText(
        "HP",
        300,
        22
    );


    drawBar(
        320,
        16,
        40,
        6,
        b.enemy.hp,
        b.enemy.maxHP
    );


    /*
       message
    */

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        20,
        90,
        440,
        45
    );

    ctx.fillStyle="#fff";

    ctx.font="8px monospace";

    wrapText(
        b.message,
        35,
        108,
        410,
        11
    );


    /*
       party
    */

    drawBattleParty();


    /*
       menu
    */

    if (
        b.phase==="menu"
    ) {

        drawBattleMenu();

    }


    /*
       magic
    */

    if (
        b.phase==="magic"
    ) {

        drawMagicMenu();

    }


    /*
       enemy attack
    */

    if (
        b.phase==="enemy"
    ) {

        drawEnemyAttack();

    }


    /*
       victory
    */

    if (
        b.phase==="victory"
    ) {

        ctx.fillStyle="#fff";

        ctx.font="20px monospace";

        ctx.fillText(
            "ПОБЕДА",
            195,
            160
        );

        ctx.font="8px monospace";

        ctx.fillText(
            "Z — продолжить",
            185,
            185
        );

    }


    /*
       defeat
    */

    if (
        b.phase==="defeat"
    ) {

        ctx.fillStyle="#fff";

        ctx.font="15px monospace";

        ctx.fillText(
            "ОТРЯД ПОБЕЖДЁН",
            155,
            160
        );

        ctx.font="8px monospace";

        ctx.fillText(
            "Z — начать заново",
            170,
            185
        );

    }

}


/* =====================================================
   BATTLE PARTY
===================================================== */

function drawBattleParty() {

    const b=game.battle;

    party.forEach((p,i) => {

        const y =
            150+i*19;

        ctx.fillStyle =
            i===b.actor
            ? "#fff"
            : p.color;

        if (
            i===b.actor &&
            b.phase==="menu"
        ) {

            ctx.fillText(
                "▶",
                10,
                y
            );

        }

        ctx.fillStyle=p.color;

        ctx.font="7px monospace";

        ctx.fillText(
            p.name,
            25,
            y
        );

        ctx.fillStyle="#fff";

        ctx.fillText(
            "HP",
            105,
            y
        );

        drawBar(
            125,
            y-6,
            45,
            6,
            p.hp,
            p.maxHP
        );

        ctx.fillText(
            p.hp+"/"+p.maxHP,
            175,
            y
        );

        if (i===3) {

            ctx.fillText(
                "MP "+p.mp+"/"+p.maxMP,
                225,
                y
            );

        }

    });

}


/* =====================================================
   BATTLE MENU DRAW
===================================================== */

function drawBattleMenu() {

    const labels = [

        "FIGHT",
        "ACT",
        "ITEM",
        "DEFEND",
        "MAGIC",
        "MERCY"

    ];

    labels.forEach((label,i) => {

        const x =
            295+(i%3)*55;

        const y =
            160+
            Math.floor(i/3)*28;

        if (
            i===game.battle.menu
        ) {

            ctx.strokeStyle="#fff";

            ctx.strokeRect(
                x-5,
                y-10,
                50,
                18
            );

        }

        ctx.fillStyle="#fff";

        ctx.font="6px monospace";

        ctx.fillText(
            label,
            x,
            y+2
        );

    });

}


/* =====================================================
   MAGIC MENU
===================================================== */

function drawMagicMenu() {

    ctx.fillStyle="#000";

    ctx.fillRect(
        275,
        145,
        190,
        75
    );

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        275,
        145,
        190,
        75
    );

    ctx.fillStyle="#fff";

    ctx.font="8px monospace";

    ctx.fillText(
        "MAGIC — КАШТАН",
        290,
        163
    );

    ctx.font="7px monospace";

    ctx.fillText(
        "Z — ИМПУЛЬС  15 MP",
        290,
        183
    );

    ctx.fillText(
        "УРОН: 30",
        290,
        198
    );

    ctx.fillText(
        "X — назад",
        370,
        212
    );

}


/* =====================================================
   ENEMY ATTACK DRAW
===================================================== */

function drawEnemyAttack() {

    /*
       границы как в Deltarune
    */

    ctx.strokeStyle="#fff";

    ctx.lineWidth=3;

    ctx.strokeRect(
        65,
        105,
        350,
        130
    );


    const b=game.battle;

    b.lasers.forEach(laser => {

        if (laser.warning>0) {

            /*
               предупреждение
            */

            ctx.fillStyle =
                Math.floor(
                    laser.warning/8
                )%2
                ? "#ff3333"
                : "#ff7777";

            ctx.fillRect(
                laser.x-1,
                108,
                3,
                124
            );

            ctx.fillStyle="#fff";

            ctx.font="6px monospace";

            ctx.fillText(
                "!",
                laser.x-2,
                120
            );

        }

        else {

            /*
               настоящий лазер
            */

            ctx.fillStyle="#ff3333";

            ctx.fillRect(
                laser.x-3,
                108,
                6,
                124
            );

        }

    });


    /*
       soul
    */

    ctx.fillStyle="#ff4444";

    ctx.fillRect(
        b.soul.x-5,
        b.soul.y-5,
        10,
        10
    );

    /*
       маленькое сердце
    */

    ctx.fillStyle="#fff";

    ctx.fillRect(
        b.soul.x-2,
        b.soul.y-6,
        4,
        12
    );

    ctx.fillRect(
        b.soul.x-6,
        b.soul.y-2,
        12,
        4
    );

}


/* =====================================================
   BAR
===================================================== */

function drawBar(
    x,
    y,
    w,
    h,
    value,
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
        w*
        Math.max(
            0,
            value/max
        ),
        h
    );

}


/* =====================================================
   DRAW EXPLORE
===================================================== */

function drawExplore() {

    updateCamera();

    drawWasteland();

    drawTeam();

    drawDelta();

    /*
       подсказка
    */

    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    ctx.fillText(
        rooms[game.room].name,
        15,
        20
    );


    /*
       магазин
    */

    if (
        game.room==="shop"
    ) {

        ctx.fillText(
            "Z — открыть магазин",
            180,
            40
        );

    }

}


/* =====================================================
   GLOBAL UPDATE
===================================================== */

function update() {

    if (!game.started) {

        if (justPressed("z")) {

            startGame();

        }

        return;

    }


    if (game.mode==="dialogue") {

        updateDialogue();

    }

    else if (game.mode==="explore") {

        updatePlayer();

        checkExit();

        updateRandomBattle();

        enterShop();

        /*
           после третьей пустоши
           запускаем погоню
        */

        if (
            game.room==="wasteland3" &&
            player.x>1000
        ) {

            startChase();

        }

    }

    else if (game.mode==="transition") {

        updateTransition();

    }

    else if (game.mode==="shop") {

        updateShop();

    }

    else if (game.mode==="chase") {

        updateChase();

    }

    else if (game.mode==="puzzle") {

        updatePuzzle();

    }

    else if (game.mode==="battle") {

        updateBattle();

    }


    saveKeyState();

}


/* =====================================================
   GLOBAL DRAW
===================================================== */

function draw() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    if (!game.started) {

        drawStart();

        return;

    }


    if (
        game.mode==="explore"
    ) {

        drawExplore();

    }

    else if (
        game.mode==="dialogue"
    ) {

        drawExplore();

        drawDialogue();

    }

    else if (
        game.mode==="transition"
    ) {

        drawExplore();

        drawTransition();

    }

    else if (
        game.mode==="shop"
    ) {

        drawShop();

    }

    else if (
        game.mode==="chase"
    ) {

        drawChase();

    }

    else if (
        game.mode==="puzzle"
    ) {

        drawPuzzle();

    }

    else if (
        game.mode==="battle"
    ) {

        drawBattle();

    }

}


/* =====================================================
   LOOP
===================================================== */

function loop() {

    update();

    draw();

    requestAnimationFrame(loop);

}

loop();
