"use strict";

/* =========================================================
   CANVAS
========================================================= */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = 320;
const H = 180;


/* =========================================================
   IMAGES
========================================================= */

const images = {};

function loadImage(name, src) {

    const img = new Image();

    img.src = src;

    images[name] = img;

}

loadImage("wasteland", "images/wasteland.png");
loadImage("error", "images/error.png");
loadImage("delta", "images/delta.png");
loadImage("left", "images/deltalef.png");
loadImage("right", "images/deltaright.png");
loadImage("back", "images/deltabach.png");


/* =========================================================
   MUSIC
========================================================= */

const music = document.getElementById("music");

document.addEventListener("pointerdown", () => {

    if (music.paused) {

        music.volume = 0.35;

        music.play().catch(() => {});

    }

}, { once:true });


/* =========================================================
   FULLSCREEN
========================================================= */

document
    .getElementById("fullscreen")
    .addEventListener("pointerdown", async e => {

        e.preventDefault();

        try {

            if (!document.fullscreenElement) {

                await document.documentElement.requestFullscreen();

            } else {

                await document.exitFullscreen();

            }

        } catch(err) {

            console.log(err);

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


function pressKey(key) {

    if (key in keys)
        keys[key] = true;

}

function releaseKey(key) {

    if (key in keys)
        keys[key] = false;

}


window.addEventListener("keydown", e => {

    const k = e.key.toLowerCase();

    if (e.key === "ArrowUp" || k === "w")
        pressKey("up");

    if (e.key === "ArrowDown" || k === "s")
        pressKey("down");

    if (e.key === "ArrowLeft" || k === "a")
        pressKey("left");

    if (e.key === "ArrowRight" || k === "d")
        pressKey("right");

    if (k === "z")
        pressKey("z");

    if (k === "x")
        pressKey("x");

    if (k === "c")
        pressKey("c");

    e.preventDefault();

}, { passive:false });


window.addEventListener("keyup", e => {

    const k = e.key.toLowerCase();

    if (e.key === "ArrowUp" || k === "w")
        releaseKey("up");

    if (e.key === "ArrowDown" || k === "s")
        releaseKey("down");

    if (e.key === "ArrowLeft" || k === "a")
        releaseKey("left");

    if (e.key === "ArrowRight" || k === "d")
        releaseKey("right");

    if (k === "z")
        releaseKey("z");

    if (k === "x")
        releaseKey("x");

    if (k === "c")
        releaseKey("c");

    e.preventDefault();

}, { passive:false });


/* =========================================================
   MOBILE CONTROLS
========================================================= */

document.querySelectorAll(".joy, .action")
    .forEach(button => {

        const key = button.dataset.key;

        button.addEventListener("pointerdown", e => {

            e.preventDefault();

            pressKey(key);

            try {
                button.setPointerCapture(e.pointerId);
            } catch {}

        });

        button.addEventListener("pointerup", e => {

            e.preventDefault();

            releaseKey(key);

        });

        button.addEventListener("pointercancel", () => {

            releaseKey(key);

        });

        button.addEventListener("lostpointercapture", () => {

            releaseKey(key);

        });

    });


/* =========================================================
   GAME STATE
========================================================= */

const game = {

    scene:"wasteland",

    started:true,

    transition:0,

    message:"",

    messageTimer:0,

    battleCooldown:500,

    randomSteps:0,

    qteTime:0,

    qteTotal:30,

    qteSuccess:false,

    puzzleComplete:false,

    cameraX:0

};


/* =========================================================
   PLAYER
========================================================= */

const player = {

    x:55,
    y:125,

    w:10,
    h:14,

    speed:1.45,

    direction:"right",

    anim:0

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
   BOX PUZZLE
========================================================= */

const boxes = [

    {
        x:85,
        y:72,
        w:12,
        h:12
    },

    {
        x:145,
        y:100,
        w:12,
        h:12
    },

    {
        x:205,
        y:72,
        w:12,
        h:12
    }

];


const buttons = [

    {
        x:70,
        y:45,
        w:18,
        h:12,
        pressed:false
    },

    {
        x:150,
        y:45,
        w:18,
        h:12,
        pressed:false
    },

    {
        x:230,
        y:45,
        w:18,
        h:12,
        pressed:false
    }

];


/* =========================================================
   SCENES
========================================================= */

const scenes = {

    wasteland: {

        name:"ЦИФРОВАЯ ПУСТОШЬ",

        exitX:295

    },

    wasteland2: {

        name:"ПУСТОШЬ — МАГАЗИН",

        exitX:295

    },

    cemetery: {

        name:"ВОРОТА КЛАДБИЩА"

    }

};


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(text, time=180) {

    game.message = text;
    game.messageTimer = time;

}


/* =========================================================
   COLLISION
========================================================= */

function rectsOverlap(a,b) {

    return (

        a.x < b.x+b.w &&
        a.x+a.w > b.x &&
        a.y < b.y+b.h &&
        a.y+a.h > b.y

    );

}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function updatePlayer() {

    if (
        game.scene === "qte" ||
        game.scene === "battle" ||
        game.scene === "dialogue"
    )
        return;

    let dx = 0;
    let dy = 0;

    if (keys.up) {

        dy -= player.speed;
        player.direction = "back";

    }

    if (keys.down) {

        dy += player.speed;
        player.direction = "delta";

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

    if (
        game.scene === "cemetery"
    ) {

        movePuzzlePlayer(dx,dy);

        return;

    }

    player.x += dx;
    player.y += dy;

    player.x =
        Math.max(
            10,
            Math.min(
                308,
                player.x
            )
        );

    player.y =
        Math.max(
            20,
            Math.min(
                160,
                player.y
            )
        );

    if (dx !== 0 || dy !== 0) {

        player.anim++;

    }

}


/* =========================================================
   PUZZLE PLAYER
========================================================= */

function movePuzzlePlayer(dx,dy) {

    const oldX = player.x;
    const oldY = player.y;

    player.x += dx;
    player.y += dy;

    player.x =
        Math.max(
            15,
            Math.min(
                305,
                player.x
            )
        );

    player.y =
        Math.max(
            25,
            Math.min(
                160,
                player.y
            )
        );

    /*
       Коробка толкается только Z.
    */

    if (
        keys.z &&
        !oldKeys.z
    ) {

        tryPushBox();

    }

}


/* =========================================================
   BOX PUSH
========================================================= */

function tryPushBox() {

    let nearest = null;
    let nearestDistance = 999;

    boxes.forEach(box => {

        const cx =
            box.x + box.w/2;

        const cy =
            box.y + box.h/2;

        const dx =
            player.x - cx;

        const dy =
            player.y - cy;

        const distance =
            Math.sqrt(dx*dx + dy*dy);

        if (
            distance < nearestDistance &&
            distance < 25
        ) {

            nearest = box;
            nearestDistance = distance;

        }

    });

    if (!nearest)
        return;


    let dx = 0;
    let dy = 0;

    if (keys.left)
        dx = -15;

    else if (keys.right)
        dx = 15;

    else if (keys.up)
        dy = -15;

    else if (keys.down)
        dy = 15;

    else {

        /*
           Если направление уже
           сохранено — используем его.
        */

        if (player.direction === "left")
            dx = -15;

        else if (player.direction === "right")
            dx = 15;

        else if (player.direction === "back")
            dy = -15;

        else
            dy = 15;

    }


    const next = {

        x:nearest.x+dx,
        y:nearest.y+dy,
        w:nearest.w,
        h:nearest.h

    };


    if (
        next.x < 35 ||
        next.x > 275 ||
        next.y < 35 ||
        next.y > 145
    ) {

        return;

    }


    /*
       Коробка не может проходить
       сквозь другие коробки.
    */

    for (const other of boxes) {

        if (other === nearest)
            continue;

        if (rectsOverlap(next,other))
            return;

    }


    nearest.x = next.x;
    nearest.y = next.y;

    checkPuzzle();

}


/* =========================================================
   PUZZLE CHECK
========================================================= */

function checkPuzzle() {

    let count = 0;

    buttons.forEach(button => {

        button.pressed = false;

        boxes.forEach(box => {

            const boxCenterX =
                box.x + box.w/2;

            const boxCenterY =
                box.y + box.h/2;

            const buttonCenterX =
                button.x + button.w/2;

            const buttonCenterY =
                button.y + button.h/2;

            const distance =
                Math.sqrt(
                    Math.pow(
                        boxCenterX-buttonCenterX,
                        2
                    ) +
                    Math.pow(
                        boxCenterY-buttonCenterY,
                        2
                    )
                );

            if (distance < 13) {

                button.pressed = true;

            }

        });

        if (button.pressed)
            count++;

    });


    if (count === buttons.length) {

        if (!game.puzzleComplete) {

            game.puzzleComplete = true;

            showMessage(
                "Все кнопки активированы. Ворота открываются...",
                240
            );

        }

    }

}


/* =========================================================
   TRANSITION
========================================================= */

function changeScene(scene) {

    game.transition = 40;

    setTimeout(() => {

        game.scene = scene;

        if (scene === "wasteland2") {

            player.x = 30;
            player.y = 120;

        }

        if (scene === "cemetery") {

            player.x = 25;
            player.y = 125;

            boxes[0].x = 85;
            boxes[0].y = 72;

            boxes[1].x = 145;
            boxes[1].y = 100;

            boxes[2].x = 205;
            boxes[2].y = 72;

            game.puzzleComplete = false;

        }

    }, 500);

}


/* =========================================================
   SCENE EXIT
========================================================= */

function updateExit() {

    if (
        game.scene === "wasteland" &&
        player.x > 290
    ) {

        changeScene("wasteland2");

        return;

    }


    if (
        game.scene === "wasteland2" &&
        player.x > 290
    ) {

        startChase();

        return;

    }


    if (
        game.scene === "cemetery" &&
        game.puzzleComplete &&
        player.x > 285
    ) {

        showMessage(
            "Ворота открыты. Путь на кладбище свободен.",
            240
        );

    }

}


/* =========================================================
   QTE CHASE
========================================================= */

function startChase() {

    game.scene = "qte";

    game.qteTime = game.qteTotal;

    game.qteSuccess = false;

    showMessage(
        "ГЛЮЧНЫЙ ЗВЕРЬ НАСТИГНУЛ ВАС!",
        120
    );

}


/* =========================================================
   QTE
========================================================= */

function updateQTE() {

    if (
        keys.z &&
        !oldKeys.z
    ) {

        game.qteTime -= 1.5;

    }

    /*
       X тоже помогает ускориться.
    */

    if (
        keys.x &&
        !oldKeys.x
    ) {

        game.qteTime -= 1;

    }


    game.qteTime -= 1/60;


    if (game.qteTime <= 0) {

        game.qteSuccess = true;

        changeScene("cemetery");

        showMessage(
            "Вы оторвались от зверя. Впереди ворота кладбища.",
            240
        );

    }

}


/* =========================================================
   RARE BATTLES
========================================================= */

function updateRandomBattle() {

    if (
        game.scene !== "wasteland" &&
        game.scene !== "wasteland2"
    )
        return;

    if (
        game.transition > 0
    )
        return;

    if (
        keys.up ||
        keys.down ||
        keys.left ||
        keys.right
    ) {

        game.randomSteps++;

    }

    /*
       Очень редкие бои.
       Не каждые пару шагов.
    */

    if (
        game.randomSteps > 700
    ) {

        if (
            Math.random() < 0.003
        ) {

            game.randomSteps = 0;

            startBattle();

        }

    }

}


/* =========================================================
   SIMPLE BATTLE
========================================================= */

let battle = null;


function startBattle() {

    game.scene = "battle";

    battle = {

        enemyHP:250,
        maxHP:250,

        turn:0,

        phase:"menu",

        soul:{
            x:160,
            y:130
        },

        lasers:[],

        timer:0,

        message:"ГЛИТЧ СИСТЕМЫ появился перед вами."

    };

}


function updateBattle() {

    if (!battle)
        return;


    if (battle.phase === "menu") {

        /*
           Z = атака.
           X = защита.
        */

        if (
            keys.z &&
            !oldKeys.z
        ) {

            const actor =
                party[battle.turn];

            const damage =
                actor.atk +
                Math.floor(
                    Math.random()*6
                );

            battle.enemyHP -= damage;

            battle.message =
                actor.name+
                " атакует! -"+
                damage+
                " HP";

            nextBattleTurn();

        }


        if (
            keys.x &&
            !oldKeys.x
        ) {

            battle.message =
                party[battle.turn].name+
                " защищается.";

            /*
               Защита пропускает ход,
               но уменьшает будущий урон.
            */

            nextBattleTurn();

        }

    }


    if (
        battle.phase === "enemy"
    ) {

        updateBattleSoul();

        updateLasers();

        battle.timer--;

        if (battle.timer <= 0) {

            battle.phase = "menu";

            battle.turn = 0;

            battle.message =
                "Ход Дельты.";

        }

    }


    if (
        battle.enemyHP <= 0
    ) {

        battle.phase = "win";

    }


    if (
        battle.phase === "win" &&
        keys.z &&
        !oldKeys.z
    ) {

        battle = null;

        game.scene = "wasteland2";

        player.x = 80;

    }

}


/* =========================================================
   NEXT BATTLE TURN
========================================================= */

function nextBattleTurn() {

    battle.turn++;

    /*
       Все союзники ходят по очереди.
    */

    if (
        battle.turn < party.length
    ) {

        battle.message =
            "Ход: "+
            party[battle.turn].name;

        return;

    }

    /*
       После всех союзников
       начинает атаковать ошибка.
    */

    battle.turn = 0;

    startEnemyAttack();

}


/* =========================================================
   ENEMY ATTACK
========================================================= */

function startEnemyAttack() {

    battle.phase = "enemy";

    battle.timer = 300;

    battle.lasers = [];

    /*
       Несколько лазеров.
    */

    for (let i=0; i<4; i++) {

        battle.lasers.push({

            x:
                45+
                Math.random()*230,

            warning:60,

            active:30,

            fired:false,

            y:90+
                Math.random()*65

        });

    }

}


/* =========================================================
   SOUL
========================================================= */

function updateBattleSoul() {

    const speed = 2.2;

    if (keys.up)
        battle.soul.y -= speed;

    if (keys.down)
        battle.soul.y += speed;

    if (keys.left)
        battle.soul.x -= speed;

    if (keys.right)
        battle.soul.x += speed;


    battle.soul.x =
        Math.max(
            55,
            Math.min(
                265,
                battle.soul.x
            )
        );

    battle.soul.y =
        Math.max(
            95,
            Math.min(
                155,
                battle.soul.y
            )
        );

}


/* =========================================================
   LASERS
========================================================= */

function updateLasers() {

    battle.lasers.forEach(laser => {

        laser.warning--;

        if (
            laser.warning <= 0 &&
            !laser.fired
        ) {

            laser.fired = true;

        }


        if (
            laser.fired
        ) {

            laser.active--;

            const distance =
                Math.abs(
                    battle.soul.x-laser.x
                );

            if (
                distance < 6
            ) {

                party[0].hp =
                    Math.max(
                        0,
                        party[0].hp-3
                    );

            }

        }

    });

}


/* =========================================================
   DRAW BACKGROUND
========================================================= */

function drawBackground() {

    ctx.fillStyle="#111";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    if (
        images.wasteland.complete &&
        game.scene !== "cemetery" &&
        game.scene !== "qte" &&
        game.scene !== "battle"
    ) {

        ctx.drawImage(
            images.wasteland,
            0,
            0,
            W,
            H
        );

    }


    if (
        game.scene === "cemetery"
    ) {

        drawCemetery();

    }

}


/* =========================================================
   PATH
========================================================= */

function drawPath() {

    ctx.fillStyle="#4a3d32";

    ctx.fillRect(
        0,
        112,
        320,
        48
    );

    ctx.fillStyle="#625144";

    for (
        let x=0;
        x<320;
        x+=25
    ) {

        ctx.fillRect(
            x,
            120+(x%3)*4,
            15,
            2
        );

    }

}


/* =========================================================
   CEMETERY
========================================================= */

function drawCemetery() {

    ctx.fillStyle="#11151c";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    drawPath();

    /*
       Ворота.
    */

    ctx.fillStyle =
        game.puzzleComplete
        ? "#777"
        : "#333";

    ctx.fillRect(
        285,
        35,
        20,
        105
    );

    ctx.fillStyle="#111";

    ctx.fillRect(
        288,
        40,
        5,
        100
    );

    ctx.fillRect(
        297,
        40,
        5,
        100
    );


    /*
       Могилы.
    */

    ctx.fillStyle="#555";

    for (let i=0;i<7;i++) {

        const x =
            20+
            i*38;

        ctx.fillRect(
            x,
            25,
            15,
            20
        );

        ctx.fillRect(
            x+3,
            20,
            9,
            25
        );

    }


    /*
       Кнопки.
    */

    buttons.forEach(button => {

        ctx.fillStyle =
            button.pressed
            ? "#55ff66"
            : "#772222";

        ctx.fillRect(
            button.x,
            button.y,
            button.w,
            button.h
        );

    });


    /*
       Коробки.
    */

    boxes.forEach(box => {

        ctx.fillStyle="#8b5a32";

        ctx.fillRect(
            box.x,
            box.y,
            box.w,
            box.h
        );

        ctx.strokeStyle="#d89b5b";

        ctx.strokeRect(
            box.x,
            box.y,
            box.w,
            box.h
        );

        ctx.beginPath();

        ctx.moveTo(
            box.x,
            box.y
        );

        ctx.lineTo(
            box.x+box.w,
            box.y+box.h
        );

        ctx.moveTo(
            box.x+box.w,
            box.y
        );

        ctx.lineTo(
            box.x,
            box.y+box.h
        );

        ctx.stroke();

    });


    if (!game.puzzleComplete) {

        ctx.fillStyle="#fff";

        ctx.font="6px monospace";

        ctx.fillText(
            "ПЕРЕДВИНЬТЕ КОРОБКИ НА КНОПКИ",
            65,
            15
        );

    }

}


/* =========================================================
   DELTA SPRITE
========================================================= */

function drawDelta() {

    let img = images.delta;

    if (
        player.direction === "left" &&
        images.left.complete
    )
        img = images.left;

    if (
        player.direction === "right" &&
        images.right.complete
    )
        img = images.right;

    if (
        player.direction === "back" &&
        images.back.complete
    )
        img = images.back;


    if (
        img &&
        img.complete &&
        img.naturalWidth > 0
    ) {

        ctx.drawImage(
            img,
            Math.round(player.x-8),
            Math.round(player.y-10),
            18,
            22
        );

    }

    else {

        ctx.fillStyle="#fff";

        ctx.fillRect(
            player.x,
            player.y,
            10,
            14
        );

    }

}


/* =========================================================
   QTE DRAW
========================================================= */

function drawQTE() {

    ctx.fillStyle="#080808";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /*
       Фон немного движется,
       создавая ощущение погони.
    */

    ctx.fillStyle="#222";

    for (
        let i=0;
        i<15;
        i++
    ) {

        const x =
            (i*37+
             performance.now()/8)%340;

        ctx.fillRect(
            x,
            20+(i*17)%130,
            25,
            2
        );

    }


    /*
       Зверь.
    */

    if (
        images.error.complete &&
        images.error.naturalWidth>0
    ) {

        ctx.drawImage(
            images.error,
            220,
            65,
            65,
            65
        );

    }

    else {

        ctx.fillStyle="#ff2244";

        ctx.fillRect(
            235,
            70,
            45,
            55
        );

    }


    ctx.fillStyle="#fff";

    ctx.font="9px monospace";

    ctx.fillText(
        "БЕГИТЕ!",
        20,
        25
    );


    ctx.font="7px monospace";

    ctx.fillText(
        "НАЖИМАЙТЕ Z!",
        20,
        40
    );


    /*
       Полоса QTE.
    */

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        20,
        145,
        180,
        12
    );

    ctx.fillStyle="#ff4444";

    const amount =
        Math.max(
            0,
            game.qteTime/game.qteTotal
        );

    ctx.fillRect(
        22,
        147,
        176*amount,
        8
    );

}


/* =========================================================
   BATTLE DRAW
========================================================= */

function drawBattle() {

    ctx.fillStyle="#050505";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    ctx.fillText(
        "ГЛИТЧ СИСТЕМЫ",
        15,
        15
    );


    ctx.fillText(
        "HP "+
        battle.enemyHP+
        "/"+
        battle.maxHP,
        220,
        15
    );


    /*
       Enemy
    */

    if (
        images.error.complete &&
        images.error.naturalWidth>0
    ) {

        ctx.drawImage(
            images.error,
            135,
            20,
            50,
            50
        );

    }


    /*
       Battle box.
    */

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        40,
        82,
        240,
        78
    );


    if (
        battle.phase === "enemy"
    ) {

        battle.lasers.forEach(laser => {

            if (
                laser.warning > 0
            ) {

                ctx.strokeStyle="#ff3333";

                ctx.beginPath();

                ctx.moveTo(
                    laser.x,
                    88
                );

                ctx.lineTo(
                    laser.x,
                    158
                );

                ctx.stroke();

            }

            else if (
                laser.active > 0
            ) {

                ctx.fillStyle="#ff2222";

                ctx.fillRect(
                    laser.x-3,
                    85,
                    6,
                    75
                );

            }

        });


        ctx.fillStyle="#fff";

        ctx.fillRect(
            battle.soul.x-4,
            battle.soul.y-4,
            8,
            8
        );

    }


    /*
       Party HP.
    */

    ctx.font="5px monospace";

    party.forEach((p,i) => {

        ctx.fillStyle =
            i===battle.turn
            ? "#ffff66"
            : "#fff";

        ctx.fillText(
            p.name,
            5,
            85+i*12
        );

        ctx.fillText(
            p.hp+"/"+p.maxHP,
            35,
            85+i*12
        );

    });


    /*
       Menu.
    */

    ctx.font="7px monospace";

    ctx.fillText(
        "Z — АТАКА",
        170,
        120
    );

    ctx.fillText(
        "X — ЗАЩИТА",
        170,
        135
    );

    ctx.fillText(
        "C — МАГИЯ",
        170,
        150
    );


    ctx.fillStyle="#fff";

    ctx.font="6px monospace";

    ctx.fillText(
        battle.message,
        90,
        72
    );


    if (
        battle.phase==="win"
    ) {

        ctx.fillStyle="#55ff66";

        ctx.font="10px monospace";

        ctx.fillText(
            "ПОБЕДА!",
            125,
            110
        );

        ctx.font="6px monospace";

        ctx.fillText(
            "Z — продолжить",
            110,
            125
        );

    }

}


/* =========================================================
   WORLD DRAW
========================================================= */

function drawWorld() {

    drawBackground();

    drawPath();

    /*
       Магазин обозначаем вывеской.
    */

    if (
        game.scene === "wasteland2"
    ) {

        ctx.fillStyle="#222";

        ctx.fillRect(
            205,
            25,
            80,
            45
        );

        ctx.strokeStyle="#fff";

        ctx.strokeRect(
            205,
            25,
            80,
            45
        );

        ctx.fillStyle="#fff";

        ctx.font="7px monospace";

        ctx.fillText(
            "МАГАЗИН",
            220,
            48
        );

    }


    drawDelta();


    /*
       Подсказки.
    */

    const hint =
        document.getElementById("hint");


    if (
        game.scene === "cemetery"
    ) {

        if (!game.puzzleComplete) {

            hint.textContent =
                "Подойдите к коробке и нажмите Z";

        }

        else {

            hint.textContent =
                "Ворота открыты — идите вправо";

        }

    }

    else if (
        game.scene === "wasteland2"
    ) {

        hint.textContent =
            "Идите вправо";

    }

    else {

        hint.textContent = "";

    }

}


/* =========================================================
   UI
========================================================= */

function drawUI() {

    ctx.fillStyle="#fff";

    ctx.font="6px monospace";

    if (
        game.scene === "wasteland"
    ) {

        ctx.fillText(
            "ЦИФРОВАЯ ПУСТОШЬ",
            8,
            12
        );

    }

    if (
        game.scene === "wasteland2"
    ) {

        ctx.fillText(
            "ПУСТОШЬ — МАГАЗИН",
            8,
            12
        );

    }

    if (
        game.scene === "cemetery"
    ) {

        ctx.fillText(
            "ВОРОТА КЛАДБИЩА",
            8,
            12
        );

    }


    if (
        game.messageTimer > 0
    ) {

        ctx.fillStyle="rgba(0,0,0,.8)";

        ctx.fillRect(
            35,
            145,
            250,
            25
        );

        ctx.strokeStyle="#fff";

        ctx.strokeRect(
            35,
            145,
            250,
            25
        );

        ctx.fillStyle="#fff";

        ctx.font="6px monospace";

        ctx.fillText(
            game.message,
            45,
            160
        );

    }

}


/* =========================================================
   UPDATE
========================================================= */

function update() {

    if (
        game.transition > 0
    ) {

        game.transition--;

    }


    if (
        game.messageTimer > 0
    ) {

        game.messageTimer--;

    }


    if (
        game.scene === "qte"
    ) {

        updateQTE();

    }

    else if (
        game.scene === "battle"
    ) {

        updateBattle();

    }

    else {

        updatePlayer();

        updateExit();

        updateRandomBattle();

    }


    /*
       Сохраняем предыдущие состояния
       только после обработки.
    */

    oldKeys.up = keys.up;
    oldKeys.down = keys.down;
    oldKeys.left = keys.left;
    oldKeys.right = keys.right;

    oldKeys.z = keys.z;
    oldKeys.x = keys.x;
    oldKeys.c = keys.c;

}


/* =========================================================
   TRANSITION DRAW
========================================================= */

function drawTransition() {

    if (
        game.transition <= 0
    )
        return;

    ctx.fillStyle="#000";

    const alpha =
        game.transition / 40;

    ctx.globalAlpha = alpha;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    ctx.globalAlpha = 1;

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
        game.scene === "qte"
    ) {

        drawQTE();

    }

    else if (
        game.scene === "battle"
    ) {

        drawBattle();

    }

    else {

        drawWorld();

        drawUI();

    }


    drawTransition();

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
