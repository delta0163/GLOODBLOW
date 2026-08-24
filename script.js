"use strict";

/* =========================================================
   BLOOD GLOW
   Полностью новая стабильная версия
========================================================= */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = 320;
const H = 180;


/* =========================================================
   INPUT
========================================================= */

const keys = {
    up: false,
    down: false,
    left: false,
    right: false,

    z: false,
    x: false,
    c: false
};

const pressed = {
    z: false,
    x: false,
    c: false,

    up: false,
    down: false,
    left: false,
    right: false
};


/* =========================
   KEYBOARD
========================= */

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


/* =========================
   MOBILE
========================= */

document.querySelectorAll("#joystick button, #buttons button")
.forEach(button => {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", e => {

        e.preventDefault();

        keys[key] = true;

        try {
            button.setPointerCapture(e.pointerId);
        } catch {}

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
   FULLSCREEN
========================================================= */

document.getElementById("fullscreen")
.addEventListener("click", async () => {

    try {

        if (!document.fullscreenElement) {

            await document.documentElement.requestFullscreen();

        } else {

            await document.exitFullscreen();

        }

    } catch {}

});


/* =========================================================
   GAME
========================================================= */

const game = {

    state: "title",

    room: "start",

    dialogue: null,
    dialogueIndex: 0,

    battle: null,

    encounterTimer: 0,

    steps: 0,

    partyJoined: false,

    wastelandStarted: false,

    wastelandFinished: false,

    menuIndex: 0,

    saveIndex: 0

};


/* =========================================================
   PARTY
========================================================= */

const party = [

    {
        name: "ДЕЛЬТА",
        hp: 90,
        maxHP: 90,
        atk: 14,
        def: 8,
        color: "#ffffff",
        magic: null
    },

    {
        name: "ЛИЧИ",
        hp: 80,
        maxHP: 80,
        atk: 13,
        def: 6,
        color: "#55aaff",
        magic: null
    },

    {
        name: "ПАНКЕЙК",
        hp: 70,
        maxHP: 70,
        atk: 10,
        def: 11,
        color: "#55dd66",
        magic: null
    },

    {
        name: "КАШТАН",
        hp: 110,
        maxHP: 110,
        atk: 12,
        def: 12,
        color: "#cc8844",

        magic: {
            name: "ЦИФРОВОЙ ИМПУЛЬС",
            cost: 20
        }
    },

    {
        name: "ШАРЛОТТА",
        hp: 100,
        maxHP: 100,
        atk: 11,
        def: 9,
        color: "#ff77cc",
        magic: null
    }

];


/* =========================================================
   PLAYER
========================================================= */

const player = {

    x: 40,
    y: 125,

    w: 8,
    h: 12,

    speed: 1.4
};


/* =========================================================
   ROOMS
========================================================= */

const rooms = {

    start: {

        name: "КОМНАТА ДЕЛЬТЫ",

        color: "#11151d",

        walls: [
            {x:0,y:0,w:320,h:8},
            {x:0,y:172,w:320,h:8},
            {x:0,y:0,w:8,h:180},
            {x:312,y:0,w:8,h:180}
        ],

        door: {
            x:285,
            y:65,
            w:20,
            h:45
        }

    },

    wasteland: {

        name: "ЦИФРОВАЯ ПУСТОШЬ",

        color: "#111018",

        walls: [
            {x:0,y:0,w:320,h:8},
            {x:0,y:172,w:320,h:8},
            {x:0,y:0,w:8,h:180},
            {x:312,y:0,w:8,h:180}
        ],

        exit: {
            x:300,
            y:70,
            w:12,
            h:40
        }

    }

};


/* =========================================================
   DIALOGUES
========================================================= */

const dialogueStart = [

    "Дельта просыпается.",

    "Комната кажется непривычно тихой.",

    "За окном мерцают странные цифровые огни.",

    "Похоже, сегодня что-то не так.",

    "Дельта выходит наружу..."
];


const dialogueTeam = [

    "Личи: Надо проверить Немку...",

    "Личи: Она изменилась.",

    "Личи: Последний раз, когда мы пытались поговорить с ней,",

    "Личи: она была странной.",

    "Дельта: Так мы идём?",

    "Личи: Да.",

    "Панкейк: Тогда не будем терять время.",

    "Каштан: Только держитесь вместе.",

    "Шарлотта: Что-то мне подсказывает, что впереди нас ждёт неприятный сюрприз.",

    "Личи: Цифровая пустошь огромна.",

    "Личи: Не отходите далеко."
];


/* =========================================================
   DIALOGUE
========================================================= */

function startDialogue(lines, callback) {

    game.state = "dialogue";

    game.dialogue = lines;

    game.dialogueIndex = 0;

    game.dialogueCallback = callback || null;
}


function updateDialogue() {

    if (keys.z && !pressed.z) {

        game.dialogueIndex++;

        if (game.dialogueIndex >= game.dialogue.length) {

            const callback = game.dialogueCallback;

            game.dialogue = null;

            game.dialogueIndex = 0;

            game.state = "explore";

            game.dialogueCallback = null;

            if (callback)
                callback();
        }
    }

    if (keys.x && !pressed.x) {

        game.dialogue = null;

        game.dialogueIndex = 0;

        game.state = "explore";

    }

}


/* =========================================================
   COLLISION
========================================================= */

function collides(x, y) {

    const p = {
        x:x,
        y:y,
        w:player.w,
        h:player.h
    };

    const room = rooms[game.room];

    for (const wall of room.walls) {

        if (
            p.x < wall.x + wall.w &&
            p.x + p.w > wall.x &&
            p.y < wall.y + wall.h &&
            p.y + p.h > wall.y
        ) {

            return true;
        }
    }

    return false;
}


/* =========================================================
   MOVEMENT
========================================================= */

function updatePlayer() {

    let dx = 0;
    let dy = 0;

    if (keys.up)
        dy -= player.speed;

    if (keys.down)
        dy += player.speed;

    if (keys.left)
        dx -= player.speed;

    if (keys.right)
        dx += player.speed;

    if (dx && dy) {

        dx *= .707;
        dy *= .707;

    }

    if (!collides(player.x + dx, player.y))
        player.x += dx;

    if (!collides(player.x, player.y + dy))
        player.y += dy;


    if (dx || dy) {

        game.steps++;

    }

}


/* =========================================================
   START ROOM
========================================================= */

function updateStart() {

    updatePlayer();

    const door = rooms.start.door;

    if (
        player.x < door.x + door.w &&
        player.x + player.w > door.x &&
        player.y < door.y + door.h &&
        player.y + player.h > door.y
    ) {

        if (keys.z && !pressed.z) {

            game.room = "wasteland";

            player.x = 25;
            player.y = 125;

            game.state = "explore";

            startDialogue(dialogueStart, () => {

                game.partyJoined = true;

                startDialogue(dialogueTeam, () => {

                    game.wastelandStarted = true;

                    game.encounterTimer = 0;

                });

            });

        }

    }

}


/* =========================================================
   WASTELAND
========================================================= */

function updateWasteland() {

    updatePlayer();


    /* длинный интервал между боями */

    if (game.wastelandStarted && !game.wastelandFinished) {

        game.encounterTimer++;

        /*
           Первый бой только после достаточно
           долгого продвижения.
        */

        if (
            game.encounterTimer > 900 &&
            game.steps > 180
        ) {

            game.encounterTimer = 0;

            startGlitchBattle();

        }

    }


    const exit = rooms.wasteland.exit;

    if (
        player.x < exit.x + exit.w &&
        player.x + player.w > exit.x &&
        player.y < exit.y + exit.h &&
        player.y + player.h > exit.y
    ) {

        game.wastelandFinished = true;

    }

}


/* =========================================================
   BATTLE
========================================================= */

function startGlitchBattle() {

    const count =
        Math.random() < .65 ? 1 :
        Math.random() < .85 ? 2 : 3;


    game.state = "battle";

    game.battle = {

        enemies: [],

        count: count,

        turn: 0,

        menu: 0,

        actor: 0,

        phase: "menu",

        rd: 0,

        message: "ОШИБКА СИСТЕМЫ появилась!",

        soul: {
            x:160,
            y:132,
            speed:2.2,
            invincible:0
        },

        lasers: [],

        explosions: [],

        particles: [],

        timer:0

    };


    for (let i=0;i<count;i++) {

        game.battle.enemies.push({

            x: 105 + i*55,

            y: 48,

            hp: 55,

            maxHP: 55,

            alive:true

        });

    }

}


/* =========================================================
   BATTLE UPDATE
========================================================= */

function updateBattle() {

    const b = game.battle;


    if (!b)
        return;


    if (b.phase === "menu") {

        if (keys.left && !pressed.left)
            b.menu = (b.menu + 3) % 4;

        if (keys.right && !pressed.right)
            b.menu = (b.menu + 1) % 4;


        if (keys.z && !pressed.z) {

            battleChoose();

        }

        return;
    }


    if (b.phase === "magic") {

        if (keys.x && !pressed.x) {

            b.phase = "menu";

        }

        if (keys.z && !pressed.z) {

            castMagic();

        }

        return;
    }


    if (b.phase === "act") {

        if (keys.x && !pressed.x) {

            b.phase = "menu";

        }

        if (keys.z && !pressed.z) {

            b.message =
                "Вы внимательно изучили ошибку.";

            b.rd = Math.min(100, b.rd + 12);

            enemyTurn();

        }

        return;
    }


    if (b.phase === "defend") {

        updateSoul();

        updateEnemyAttack();

        return;
    }


    if (b.phase === "victory") {

        if (keys.z && !pressed.z) {

            game.state = "explore";

            game.battle = null;

        }

        return;
    }

}


/* =========================================================
   BATTLE MENU
========================================================= */

function battleChoose() {

    const b = game.battle;

    /*
       FIGHT
    */

    if (b.menu === 0) {

        const target =
            b.enemies.find(e => e.alive);

        if (target) {

            const damage =
                party[b.actor].atk +
                Math.floor(Math.random()*5);

            target.hp -= damage;

            b.message =
                party[b.actor].name +
                " атакует!  -" +
                damage +
                " HP";

            if (target.hp <= 0) {

                target.hp = 0;
                target.alive = false;

            }

        }

        enemyTurn();

    }


    /*
       ACT
    */

    else if (b.menu === 1) {

        b.phase = "act";

    }


    /*
       MAGIC
    */

    else if (b.menu === 2) {

        if (party[b.actor].magic) {

            b.phase = "magic";

        } else {

            b.message =
                party[b.actor].name +
                " не знает магии.";

        }

    }


    /*
       DEFEND
    */

    else if (b.menu === 3) {

        b.message =
            party[b.actor].name +
            " защищается.";

        /*
           ВАЖНО:
           RD растёт именно от защиты.
        */

        b.rd = Math.min(
            100,
            b.rd + 18
        );

        b.phase = "defend";

        createEnemyAttack();

    }

}


/* =========================================================
   MAGIC
========================================================= */

function castMagic() {

    const b = game.battle;

    const caster = party[b.actor];

    if (!caster.magic)
        return;


    b.message =
        caster.name +
        " использует " +
        caster.magic.name + "!";


    b.enemies.forEach(enemy => {

        if (enemy.alive) {

            enemy.hp -= 25;

            if (enemy.hp <= 0) {

                enemy.hp = 0;
                enemy.alive = false;

            }

        }

    });


    enemyTurn();

}


/* =========================================================
   ENEMY TURN
========================================================= */

function enemyTurn() {

    const b = game.battle;

    if (!b.enemies.some(e => e.alive)) {

        b.phase = "victory";

        b.message =
            "Ошибка системы рассыпалась на пиксели.";

        return;

    }


    b.actor++;

    if (b.actor >= party.length)
        b.actor = 0;


    b.phase = "defend";

    createEnemyAttack();

}


/* =========================================================
   CREATE ATTACK
========================================================= */

function createEnemyAttack() {

    const b = game.battle;

    b.lasers = [];
    b.explosions = [];
    b.particles = [];

    b.timer = 0;


    /*
       ОДИН ГЛИТЧ
       ЛАЗЕР.
       Сначала показывается линия,
       затем происходит выстрел.
    */

    if (b.count === 1) {

        b.lasers.push({

            x:
                65 +
                Math.random()*190,

            warning:90,

            active:35

        });

    }


    /*
       ДВА И БОЛЕЕ
       ВЗРЫВЫ + ЧАСТИЦЫ.
    */

    else {

        for (let i=0;i<b.count+1;i++) {

            b.explosions.push({

                x:60 + Math.random()*200,

                y:105 + Math.random()*45,

                timer:60,

                radius:5

            });

        }

    }

}


/* =========================================================
   SOUL
========================================================= */

function updateSoul() {

    const b = game.battle;

    const s = b.soul;


    if (keys.up)
        s.y -= s.speed;

    if (keys.down)
        s.y += s.speed;

    if (keys.left)
        s.x -= s.speed;

    if (keys.right)
        s.x += s.speed;


    /*
       ГРАНИЦЫ АРЕНЫ
    */

    s.x = Math.max(57, Math.min(263, s.x));

    s.y = Math.max(95, Math.min(157, s.y));


    if (s.invincible > 0)
        s.invincible--;

}


/* =========================================================
   ENEMY ATTACK
========================================================= */

function updateEnemyAttack() {

    const b = game.battle;

    b.timer++;

    updateSoul();


    /* =========================
       ЛАЗЕР
    ========================= */

    for (const laser of b.lasers) {

        if (laser.warning > 0) {

            laser.warning--;

        } else {

            laser.active--;

            if (
                Math.abs(b.soul.x - laser.x) < 5 &&
                b.soul.y > 94 &&
                b.soul.y < 158
            ) {

                damagePlayer();

            }

        }

    }


    /* =========================
       ВЗРЫВЫ
    ========================= */

    for (const ex of b.explosions) {

        if (ex.timer > 0) {

            ex.timer--;

            if (ex.timer < 25)
                ex.radius += .5;

            const dx =
                b.soul.x - ex.x;

            const dy =
                b.soul.y - ex.y;

            const dist =
                Math.sqrt(dx*dx + dy*dy);


            if (
                dist <
                ex.radius + 5
            ) {

                damagePlayer();

            }

        }

    }


    if (b.timer > 240) {

        /*
           Успешное уклонение/защита.
           RD растёт.

           Атака НЕ увеличивает RD.
        */

        b.rd = Math.min(
            100,
            b.rd + 10
        );

        b.phase = "menu";

        b.message =
            "Ты выдержал атаку.";

    }

}


/* =========================================================
   DAMAGE
========================================================= */

function damagePlayer() {

    const b = game.battle;

    if (b.soul.invincible > 0)
        return;


    const target =
        party[b.actor];


    target.hp -= 8;

    if (target.hp < 0)
        target.hp = 0;


    b.soul.invincible = 50;


    b.message =
        target.name +
        " получил 8 урона!";


    if (target.hp <= 0) {

        target.hp = 1;

        b.message =
            target.name +
            " едва удержался на ногах.";

    }

}


/* =========================================================
   DRAW
========================================================= */

function draw() {

    ctx.clearRect(0,0,W,H);


    if (game.state === "title")
        drawTitle();

    else if (game.state === "explore")
        drawExplore();

    else if (game.state === "dialogue")
        drawDialogue();

    else if (game.state === "battle")
        drawBattle();


    requestAnimationFrame(draw);

}


/* =========================================================
   TITLE
========================================================= */

function drawTitle() {

    ctx.fillStyle = "#050509";

    ctx.fillRect(0,0,W,H);


    ctx.fillStyle = "#fff";

    ctx.font = "18px monospace";

    ctx.fillText(
        "BLOOD GLOW",
        92,
        62
    );


    ctx.font = "7px monospace";

    ctx.fillStyle = "#aaa";

    ctx.fillText(
        "DIGITAL WASTELAND",
        104,
        76
    );


    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        105,
        105,
        110,
        25
    );


    ctx.fillStyle = "#fff";

    ctx.font = "8px monospace";

    ctx.fillText(
        "Z  НАЧАТЬ",
        122,
        121
    );


    ctx.font = "5px monospace";

    ctx.fillStyle = "#777";

    ctx.fillText(
        "WASD / ДЖОЙСТИК — движение",
        90,
        150
    );

}


/* =========================================================
   EXPLORE DRAW
========================================================= */

function drawExplore() {

    const room = rooms[game.room];


    ctx.fillStyle = room.color;

    ctx.fillRect(0,0,W,H);


    /*
       ЦИФРОВЫЕ ЧАСТИЦЫ
    */

    ctx.fillStyle = "#28233a";

    for (let y=15;y<170;y+=14) {

        for (let x=15;x<315;x+=18) {

            ctx.fillRect(
                x,
                y,
                1,
                1
            );

        }

    }


    /*
       стены
    */

    ctx.fillStyle = "#333";

    room.walls.forEach(w => {

        ctx.fillRect(
            w.x,
            w.y,
            w.w,
            w.h
        );

    });


    /*
       дверь
    */

    if (game.room === "start") {

        ctx.fillStyle = "#663366";

        ctx.fillRect(
            room.door.x,
            room.door.y,
            room.door.w,
            room.door.h
        );

    }


    /*
       выход пустоши
    */

    if (game.room === "wasteland") {

        ctx.fillStyle = "#442244";

        ctx.fillRect(
            300,
            70,
            12,
            40
        );

    }


    /*
       Дельта
    */

    drawCharacter(
        player.x,
        player.y,
        "#fff"
    );


    /*
       команда
    */

    if (game.partyJoined) {

        drawCharacter(
            player.x-18,
            player.y,
            "#55aaff"
        );

        drawCharacter(
            player.x-32,
            player.y,
            "#55dd66"
        );

        drawCharacter(
            player.x-46,
            player.y,
            "#cc8844"
        );

        drawCharacter(
            player.x-60,
            player.y,
            "#ff77cc"
        );

    }


    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText(
        room.name,
        12,
        18
    );


    /*
       подсказка
    */

    if (game.room === "start") {

        ctx.fillStyle = "#fff";

        ctx.font = "6px monospace";

        ctx.fillText(
            "Z — выйти",
            132,
            155
        );

    }


    if (
        game.room === "wasteland" &&
        game.wastelandStarted
    ) {

        ctx.fillStyle = "#888";

        ctx.font = "5px monospace";

        ctx.fillText(
            "Цифровая пустошь продолжается...",
            80,
            25
        );

    }

}


/* =========================================================
   CHARACTER
========================================================= */

function drawCharacter(x,y,color) {

    x = Math.round(x);
    y = Math.round(y);


    ctx.fillStyle = "#000";

    ctx.fillRect(
        x-2,
        y-2,
        12,
        16
    );


    ctx.fillStyle = color;

    ctx.fillRect(
        x+1,
        y,
        7,
        6
    );

    ctx.fillRect(
        x,
        y+6,
        9,
        7
    );


    ctx.fillRect(
        x+1,
        y+13,
        3,
        2
    );

    ctx.fillRect(
        x+6,
        y+13,
        3,
        2
    );

}


/* =========================================================
   DIALOGUE DRAW
========================================================= */

function drawDialogue() {

    drawExplore();


    ctx.fillStyle = "rgba(0,0,0,.6)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle = "#000";

    ctx.fillRect(
        10,
        105,
        300,
        62
    );


    ctx.strokeStyle = "#fff";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        10,
        105,
        300,
        62
    );


    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";


    const text =
        game.dialogue[
            game.dialogueIndex
        ];


    wrapText(
        text,
        22,
        125,
        275,
        10
    );


    ctx.font = "5px monospace";

    ctx.fillText(
        "Z — далее",
        235,
        158
    );

}


/* =========================================================
   TEXT WRAP
========================================================= */

function wrapText(text,x,y,maxWidth,lineHeight) {

    const words = text.split(" ");

    let line = "";

    for (const word of words) {

        const test =
            line +
            word +
            " ";

        if (
            ctx.measureText(test).width > maxWidth &&
            line
        ) {

            ctx.fillText(
                line,
                x,
                y
            );

            line =
                word + " ";

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

    const b = game.battle;


    ctx.fillStyle = "#000";

    ctx.fillRect(0,0,W,H);


    /*
       верхняя часть
    */

    ctx.fillStyle = "#111";

    ctx.fillRect(
        0,
        0,
        W,
        70
    );


    ctx.strokeStyle = "#555";

    ctx.strokeRect(
        18,
        8,
        284,
        58
    );


    /*
       ГЛИТЧИ
    */

    b.enemies.forEach((enemy,index) => {

        if (!enemy.alive)
            return;


        drawGlitch(
            enemy.x,
            enemy.y
        );

    });


    /*
       имя врага
    */

    ctx.fillStyle = "#fff";

    ctx.font = "6px monospace";

    ctx.fillText(
        "ОШИБКА СИСТЕМЫ",
        25,
        18
    );


    /*
       сообщение
    */

    ctx.font = "6px monospace";

    wrapText(
        b.message,
        25,
        80,
        270,
        8
    );


    /*
       RD
    */

    drawRD();


    /*
       бой
    */

    if (b.phase === "defend") {

        drawBattleArena();

    } else {

        drawBattleParty();

        drawBattleCommands();

    }


    if (b.phase === "act")
        drawAct();

    if (b.phase === "magic")
        drawMagic();


    if (b.phase === "victory") {

        ctx.fillStyle = "#fff";

        ctx.font = "12px monospace";

        ctx.fillText(
            "ПОБЕДА!",
            125,
            115
        );

        ctx.font = "6px monospace";

        ctx.fillText(
            "Z — продолжить",
            110,
            132
        );

    }

}


/* =========================================================
   GLITCH
========================================================= */

function drawGlitch(x,y) {

    ctx.fillStyle = "#000";

    ctx.fillRect(
        x-16,
        y-14,
        32,
        28
    );


    ctx.fillStyle = "#aa55ff";

    ctx.fillRect(
        x-12,
        y-10,
        24,
        20
    );


    ctx.fillStyle = "#fff";

    ctx.fillRect(
        x-7,
        y-4,
        5,
        4
    );

    ctx.fillRect(
        x+3,
        y-4,
        5,
        4
    );


    ctx.fillStyle = "#ff55ff";

    ctx.fillRect(
        x-16,
        y+8,
        8,
        2
    );

    ctx.fillRect(
        x+8,
        y-9,
        8,
        2
    );

}


/* =========================================================
   RD
========================================================= */

function drawRD() {

    const b = game.battle;


    ctx.fillStyle = "#fff";

    ctx.font = "6px monospace";

    ctx.fillText(
        "RD",
        175,
        91
    );


    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        195,
        85,
        105,
        8
    );


    ctx.fillStyle = "#55ff55";

    ctx.fillRect(
        196,
        86,
        103 * (b.rd/100),
        6
    );


    ctx.fillStyle = "#fff";

    ctx.fillText(
        Math.floor(b.rd) + "%",
        260,
        103
    );

}


/* =========================================================
   BATTLE PARTY
========================================================= */

function drawBattleParty() {

    ctx.font = "5px monospace";


    party.forEach((p,i) => {

        const y = 108 + i*12;


        if (i === game.battle.actor) {

            ctx.fillStyle = "#fff";

            ctx.fillText(
                "▶",
                3,
                y
            );

        }


        ctx.fillStyle = p.color;

        ctx.fillText(
            p.name,
            12,
            y
        );


        ctx.fillStyle = "#fff";

        ctx.fillText(
            "HP",
            68,
            y
        );


        ctx.fillStyle = "#333";

        ctx.fillRect(
            82,
            y-5,
            34,
            5
        );


        ctx.fillStyle = "#fff";

        ctx.fillRect(
            82,
            y-5,
            34*(p.hp/p.maxHP),
            5
        );


        ctx.fillText(
            p.hp + "/" + p.maxHP,
            120,
            y
        );

    });

}


/* =========================================================
   COMMANDS
========================================================= */

function drawBattleCommands() {

    const b = game.battle;


    const commands = [

        "FIGHT",
        "ACT",
        "MAGIC",
        "DEFEND"

    ];


    commands.forEach((text,i) => {

        const x =
            175 +
            (i%2)*65;

        const y =
            120 +
            Math.floor(i/2)*24;


        if (b.menu === i) {

            ctx.strokeStyle = "#fff";

            ctx.strokeRect(
                x-8,
                y-10,
                58,
                17
            );

        }


        ctx.fillStyle = "#fff";

        ctx.font = "6px monospace";

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

function drawAct() {

    ctx.fillStyle = "#000";

    ctx.fillRect(
        170,
        105,
        140,
        65
    );


    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        170,
        105,
        140,
        65
    );


    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText(
        "ACT",
        185,
        120
    );


    ctx.font = "6px monospace";

    ctx.fillText(
        "▶ ОСМОТРЕТЬ",
        182,
        135
    );

    ctx.fillText(
        "Z — выбрать",
        182,
        153
    );

    ctx.fillText(
        "X — назад",
        230,
        163
    );

}


/* =========================================================
   MAGIC
========================================================= */

function drawMagic() {

    ctx.fillStyle = "#000";

    ctx.fillRect(
        165,
        103,
        145,
        67
    );


    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        165,
        103,
        145,
        67
    );


    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText(
        "MAGIC",
        180,
        118
    );


    ctx.font = "6px monospace";

    ctx.fillStyle = "#cc8844";

    ctx.fillText(
        "▶ ЦИФРОВОЙ ИМПУЛЬС",
        175,
        135
    );


    ctx.fillStyle = "#aaa";

    ctx.fillText(
        "20 RD",
        180,
        147
    );


    ctx.fillStyle = "#fff";

    ctx.fillText(
        "Z — использовать",
        180,
        160
    );

}


/* =========================================================
   BATTLE ARENA
========================================================= */

function drawBattleArena() {

    const b = game.battle;


    /*
       Именно прямоугольная арена,
       как в классических RPG-боях.
    */

    ctx.strokeStyle = "#fff";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        48,
        95,
        224,
        65
    );


    /*
       лазерное предупреждение
    */

    b.lasers.forEach(laser => {

        if (laser.warning > 0) {

            ctx.strokeStyle = "#ff4444";

            ctx.lineWidth = 1;

            ctx.beginPath();

            ctx.moveTo(
                laser.x,
                95
            );

            ctx.lineTo(
                laser.x,
                160
            );

            ctx.stroke();

            ctx.fillStyle = "#ff4444";

            ctx.font = "5px monospace";

            ctx.fillText(
                "!",
                laser.x-2,
                100
            );

        } else {

            ctx.fillStyle = "#ff4444";

            ctx.fillRect(
                laser.x-3,
                95,
                6,
                65
            );

        }

    });


    /*
       взрывы
    */

    b.explosions.forEach(ex => {

        if (ex.timer <= 0)
            return;


        ctx.strokeStyle = "#ff66ff";

        ctx.beginPath();

        ctx.arc(
            ex.x,
            ex.y,
            ex.radius,
            0,
            Math.PI*2
        );

        ctx.stroke();


        ctx.fillStyle = "#fff";

        ctx.fillRect(
            ex.x-1,
            ex.y-1,
            2,
            2
        );

    });


    /*
       душа
    */

    ctx.fillStyle = "#ff3333";

    ctx.fillRect(
        b.soul.x-3,
        b.soul.y-3,
        6,
        6
    );

}


/* =========================================================
   PRESSED STATE
========================================================= */

function updatePressed() {

    pressed.z = keys.z;
    pressed.x = keys.x;
    pressed.c = keys.c;

    pressed.up = keys.up;
    pressed.down = keys.down;
    pressed.left = keys.left;
    pressed.right = keys.right;

}


/* =========================================================
   UPDATE
========================================================= */

function update() {

    if (game.state === "title") {

        if (keys.z && !pressed.z) {

            game.state = "explore";

            game.room = "start";

            player.x = 40;
            player.y = 125;

            startDialogue(
                dialogueStart,
                () => {

                    /* после текста остаёмся
                       в комнате Дельты */

                }
            );

        }

    }


    else if (game.state === "explore") {

        if (game.room === "start") {

            updateStart();

        }

        else if (game.room === "wasteland") {

            updateWasteland();

        }


        /*
           C открывает меню
        */

        if (keys.c && !pressed.c) {

            /*
               Пока меню простое:
               C возвращает/открывает
               информационную панель.
            */

            startDialogue([
                "ИНВЕНТАРЬ",
                "Пока здесь пусто.",
                "Но это скоро изменится."
            ]);

        }

    }


    else if (game.state === "dialogue") {

        updateDialogue();

    }


    else if (game.state === "battle") {

        updateBattle();

    }


    updatePressed();

}


/* =========================================================
   LOOP
========================================================= */

function loop() {

    update();

    draw();

}


setInterval(loop, 1000/60);


/* =========================================================
   STARTUP CHECK
========================================================= */

console.log("Blood Glow запущен.");
console.log("Canvas:", canvas.width, canvas.height);
