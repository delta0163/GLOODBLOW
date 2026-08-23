"use strict";

/* =========================================================
   CANVAS
========================================================= */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const W = 320;
const H = 180;

ctx.imageSmoothingEnabled = false;


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

    } catch (err) {

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
    c:false,

    run:false

};

const prev = {

    z:false,
    x:false,
    c:false

};


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

    if (k === "z" || e.key === "Enter")
        keys.z = true;

    if (k === "x" || e.key === "Escape")
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

    if (k === "z" || e.key === "Enter")
        keys.z = false;

    if (k === "x" || e.key === "Escape")
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
   GAME STATE
========================================================= */

const game = {

    mode:"title",

    room:"start",

    dialogue:null,

    dialogueIndex:0,

    menuIndex:0,

    menuPage:"main",

    battle:null,

    saveMessage:"",

    saveTimer:0

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
        name:"НЕМКА",
        hp:100,
        maxHP:100,
        atk:11,
        def:9,
        color:"#ff5555"
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
        color:"#cc8844"
    }

];


/* =========================================================
   PLAYER
========================================================= */

const player = {

    x:70,
    y:120,

    width:10,
    height:14

};


/* =========================================================
   FOLLOWERS
========================================================= */

const followers = [

    {
        x:55,
        y:120,
        color:"#ff5555"
    },

    {
        x:40,
        y:120,
        color:"#55aaff"
    },

    {
        x:25,
        y:120,
        color:"#55dd66"
    },

    {
        x:15,
        y:135,
        color:"#cc8844"
    }

];


/* =========================================================
   ROOMS
========================================================= */

const rooms = {

    start: {

        floor:"#151515",

        walls:[

            {x:0,y:0,w:320,h:8},
            {x:0,y:172,w:320,h:8},
            {x:0,y:0,w:8,h:180},
            {x:312,y:0,w:8,h:180},

            {x:55,y:45,w:80,h:9},
            {x:200,y:45,w:65,h:9},
            {x:55,y:45,w:9,h:60},
            {x:256,y:45,w:9,h:60}

        ],

        exit:{
            x:292,
            y:70,
            w:20,
            h:38,
            target:"hall"
        },

        save:{
            x:145,
            y:70
        }

    },

    hall: {

        floor:"#10131b",

        walls:[

            {x:0,y:0,w:320,h:8},
            {x:0,y:172,w:320,h:8},
            {x:0,y:0,w:8,h:180},
            {x:312,y:0,w:8,h:180},

            {x:80,y:45,w:160,h:8},
            {x:80,y:45,w:8,h:70},
            {x:232,y:45,w:8,h:70}

        ],

        exit:{
            x:8,
            y:70,
            w:20,
            h:38,
            target:"start"
        },

        battleZone:true

    }

};


/* =========================================================
   SAVE SYSTEM
========================================================= */

function saveGame() {

    const data = {

        room:game.room,

        playerX:player.x,
        playerY:player.y,

        hp:party.map(p => p.hp)

    };

    localStorage.setItem(
        "blood_glow_save_1",
        JSON.stringify(data)
    );

    game.saveMessage =
        "ИГРА СОХРАНЕНА";

    game.saveTimer = 120;

}


function loadGame() {

    const raw =
        localStorage.getItem(
            "blood_glow_save_1"
        );

    if (!raw)
        return false;

    try {

        const data =
            JSON.parse(raw);

        game.room =
            data.room || "start";

        player.x =
            data.playerX ?? 70;

        player.y =
            data.playerY ?? 120;

        if (data.hp) {

            data.hp.forEach((hp,i) => {

                if (party[i])
                    party[i].hp = hp;

            });

        }

        return true;

    } catch {

        return false;

    }

}


function newGame() {

    game.room = "start";

    player.x = 70;
    player.y = 120;

    party.forEach(p => {

        p.hp = p.maxHP;

    });

}


/* =========================================================
   TITLE
========================================================= */

function updateTitle() {

    if (keys.z && !prev.z) {

        game.mode = "mainMenu";

    }

}


function drawTitle() {

    ctx.fillStyle = "#000";

    ctx.fillRect(0,0,W,H);

    ctx.fillStyle = "#fff";

    ctx.font = "18px monospace";

    ctx.textAlign = "center";

    ctx.fillText(
        "BLOOD GLOW",
        160,
        62
    );

    ctx.font = "13px monospace";

    ctx.fillText(
        "NIGHT RPG",
        160,
        82
    );

    ctx.font = "7px monospace";

    ctx.fillText(
        "Z — НАЧАТЬ",
        160,
        120
    );

    ctx.fillText(
        "пиксельная RPG",
        160,
        145
    );

    ctx.textAlign = "left";

}


/* =========================================================
   MAIN MENU
========================================================= */

const mainItems = [

    "НОВАЯ ИГРА",
    "ПРОДОЛЖИТЬ",
    "ФАЙЛЫ",
    "НАСТРОЙКИ"

];


function updateMainMenu() {

    if (keys.up && !prev.upLock) {

        game.menuIndex--;

        if (game.menuIndex < 0)
            game.menuIndex = mainItems.length-1;

        prev.upLock = true;

    }

    if (!keys.up)
        prev.upLock = false;


    if (keys.down && !prev.downLock) {

        game.menuIndex++;

        if (game.menuIndex >= mainItems.length)
            game.menuIndex = 0;

        prev.downLock = true;

    }

    if (!keys.down)
        prev.downLock = false;


    if (keys.z && !prev.z) {

        const item =
            mainItems[game.menuIndex];

        if (item === "НОВАЯ ИГРА") {

            newGame();

            game.mode = "explore";

        }

        if (item === "ПРОДОЛЖИТЬ") {

            if (loadGame())
                game.mode = "explore";

        }

        if (item === "ФАЙЛЫ") {

            game.mode = "files";

        }

        if (item === "НАСТРОЙКИ") {

            game.mode = "settings";

        }

    }

}


function drawMainMenu() {

    ctx.fillStyle = "#000";

    ctx.fillRect(0,0,W,H);

    ctx.strokeStyle = "#fff";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        30,
        15,
        260,
        150
    );

    ctx.fillStyle = "#fff";

    ctx.font = "13px monospace";

    ctx.fillText(
        "ГЛАВНОЕ МЕНЮ",
        52,
        35
    );

    ctx.font = "8px monospace";

    mainItems.forEach((item,i) => {

        const y = 62 + i*22;

        if (i === game.menuIndex) {

            ctx.fillText(
                "▶",
                55,
                y
            );

        }

        ctx.fillText(
            item,
            72,
            y
        );

    });

    ctx.font = "6px monospace";

    ctx.fillText(
        "Z — выбрать",
        45,
        153
    );

}


/* =========================================================
   FILE MENU
========================================================= */

function updateFiles() {

    if (keys.x && !prev.x) {

        game.mode = "mainMenu";

        return;

    }

    if (keys.z && !prev.z) {

        saveGame();

    }

}


function drawFiles() {

    ctx.fillStyle = "#000";

    ctx.fillRect(0,0,W,H);

    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        25,
        15,
        270,
        150
    );

    ctx.fillStyle = "#fff";

    ctx.font = "11px monospace";

    ctx.fillText(
        "ФАЙЛЫ СОХРАНЕНИЯ",
        42,
        34
    );

    const save =
        localStorage.getItem(
            "blood_glow_save_1"
        );

    ctx.font = "8px monospace";

    ctx.fillText(
        "FILE 01",
        45,
        60
    );

    if (save) {

        ctx.fillText(
            "СОХРАНЕНИЕ НАЙДЕНО",
            100,
            60
        );

    } else {

        ctx.fillText(
            "ПУСТО",
            100,
            60
        );

    }

    ctx.fillText(
        "Z — СОХРАНИТЬ",
        45,
        95
    );

    ctx.fillText(
        "X — НАЗАД",
        45,
        115
    );

    if (game.saveTimer > 0) {

        ctx.fillText(
            game.saveMessage,
            45,
            140
        );

        game.saveTimer--;

    }

}


/* =========================================================
   SETTINGS
========================================================= */

function updateSettings() {

    if (keys.x && !prev.x)
        game.mode = "mainMenu";

}


function drawSettings() {

    ctx.fillStyle = "#000";

    ctx.fillRect(0,0,W,H);

    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        25,
        15,
        270,
        150
    );

    ctx.fillStyle = "#fff";

    ctx.font = "11px monospace";

    ctx.fillText(
        "НАСТРОЙКИ",
        45,
        35
    );

    ctx.font = "7px monospace";

    ctx.fillText(
        "ПИКСЕЛЬНАЯ ГРАФИКА : ON",
        45,
        65
    );

    ctx.fillText(
        "УПРАВЛЕНИЕ : Z X C",
        45,
        82
    );

    ctx.fillText(
        "FULLSCREEN : ON",
        45,
        99
    );

    ctx.fillText(
        "X — НАЗАД",
        45,
        130
    );

}


/* =========================================================
   MOVEMENT
========================================================= */

function collide(x,y) {

    const room =
        rooms[game.room];

    const box = {

        x,
        y,

        w:player.width,
        h:player.height

    };

    for (const wall of room.walls) {

        if (

            box.x < wall.x + wall.w &&
            box.x + box.w > wall.x &&
            box.y < wall.y + wall.h &&
            box.y + box.h > wall.y

        )
            return true;

    }

    return false;

}


function updatePlayer() {

    if (game.mode !== "explore")
        return;

    let dx = 0;
    let dy = 0;

    const speed =
        keys.run ? 2.6 : 1.35;

    if (keys.up)
        dy -= speed;

    if (keys.down)
        dy += speed;

    if (keys.left)
        dx -= speed;

    if (keys.right)
        dx += speed;

    if (dx && dy) {

        dx *= .707;
        dy *= .707;

    }

    if (!collide(
        player.x + dx,
        player.y
    ))
        player.x += dx;

    if (!collide(
        player.x,
        player.y + dy
    ))
        player.y += dy;

    player.x =
        Math.max(
            10,
            Math.min(
                300,
                player.x
            )
        );

    player.y =
        Math.max(
            12,
            Math.min(
                158,
                player.y
            )
        );

}


/* =========================================================
   FOLLOWERS
========================================================= */

function updateFollowers() {

    if (game.mode !== "explore")
        return;

    const targets = [

        [player.x-14,player.y],
        [player.x-28,player.y],
        [player.x-42,player.y],
        [player.x-56,player.y]

    ];

    followers.forEach((f,i) => {

        const target = targets[i];

        f.x +=
            (target[0]-f.x) * .1;

        f.y +=
            (target[1]-f.y) * .1;

    });

}


/* =========================================================
   SAVE STAR / PIZZA TABLE
========================================================= */

function nearSave() {

    const s =
        rooms.start.save;

    const dx =
        player.x-s.x;

    const dy =
        player.y-s.y;

    return Math.sqrt(
        dx*dx+dy*dy
    ) < 25;

}


function updateSave() {

    if (
        game.mode === "explore" &&
        game.room === "start" &&
        nearSave() &&
        keys.z &&
        !prev.z
    ) {

        saveGame();

    }

}


/* =========================================================
   EXIT
========================================================= */

function updateExit() {

    if (game.mode !== "explore")
        return;

    const room =
        rooms[game.room];

    const e =
        room.exit;

    if (

        player.x < e.x+e.w &&
        player.x+player.width > e.x &&
        player.y < e.y+e.h &&
        player.y+player.height > e.y

    ) {

        game.room = e.target;

        if (game.room === "hall") {

            player.x = 30;
            player.y = 90;

        } else {

            player.x = 275;
            player.y = 90;

        }

    }

}


/* =========================================================
   RANDOM BATTLE
========================================================= */

let steps = 0;

function updateRandomBattle() {

    if (
        game.mode !== "explore" ||
        game.room !== "hall"
    )
        return;

    if (
        keys.up ||
        keys.down ||
        keys.left ||
        keys.right
    ) {

        steps++;

        if (
            steps > 650
        ) {

            steps = 0;

            if (
                Math.random() < .3
            ) {

                startBattle();

            }

        }

    }

}


/* =========================================================
   BATTLE
========================================================= */

function startBattle() {

    game.mode = "battle";

    game.battle = {

        enemy:{

            name:"ТЕНЕВОЙ ЗВЕРЬ",

            hp:250,
            maxHP:250,

            color:"#7435a8"

        },

        phase:"menu",

        actor:0,

        command:0,

        actIndex:0,

        itemIndex:0,

        mercyIndex:0,

        message:
            "* Теневой зверь преграждает путь.",

        tp:0,

        maxTP:100,

        defend:false,

        soul:{

            x:160,
            y:125,

            size:4,

            speed:2.5,

            inv:0

        },

        bullets:[],

        timer:0

    };

}


/* =========================================================
   BATTLE INPUT
========================================================= */

function battleInput() {

    const b = game.battle;

    if (!b)
        return;


    /* COMMANDS */

    if (b.phase === "menu") {

        if (keys.left && !prev.leftBattle) {

            b.command--;

            if (b.command < 0)
                b.command = 3;

            prev.leftBattle = true;

        }

        if (!keys.left)
            prev.leftBattle = false;


        if (keys.right && !prev.rightBattle) {

            b.command++;

            if (b.command > 3)
                b.command = 0;

            prev.rightBattle = true;

        }

        if (!keys.right)
            prev.rightBattle = false;


        if (keys.z && !prev.z) {

            if (b.command === 0)
                battleFight();

            if (b.command === 1)
                b.phase = "act";

            if (b.command === 2)
                b.phase = "item";

            if (b.command === 3)
                b.phase = "mercy";

        }

        return;

    }


    /* ACT */

    if (b.phase === "act") {

        if (keys.up && !prev.actUp) {

            b.actIndex--;

            if (b.actIndex < 0)
                b.actIndex = 1;

            prev.actUp = true;

        }

        if (!keys.up)
            prev.actUp = false;


        if (keys.down && !prev.actDown) {

            b.actIndex++;

            if (b.actIndex > 1)
                b.actIndex = 0;

            prev.actDown = true;

        }

        if (!keys.down)
            prev.actDown = false;


        if (keys.x && !prev.x) {

            b.phase = "menu";

            return;

        }


        if (keys.z && !prev.z) {

            if (b.actIndex === 0) {

                b.tp =
                    Math.min(
                        100,
                        b.tp + 18
                    );

                b.message =
                    "* Дельта заговорил с врагом.";

            } else {

                b.tp =
                    Math.min(
                        100,
                        b.tp + 12
                    );

                b.message =
                    "* Вы внимательно осмотрели врага.";

            }

            nextActor();

        }

        return;

    }


    /* ITEM */

    if (b.phase === "item") {

        if (keys.x && !prev.x) {

            b.phase = "menu";

            return;

        }

        if (keys.z && !prev.z) {

            const p =
                party[b.actor];

            p.hp =
                Math.min(
                    p.maxHP,
                    p.hp + 35
                );

            b.message =
                "* " +
                p.name +
                " восстановил 35 HP.";

            nextActor();

        }

        return;

    }


    /* MERCY */

    if (b.phase === "mercy") {

        if (keys.x && !prev.x) {

            b.phase = "menu";

            return;

        }

        if (keys.z && !prev.z) {

            if (b.tp >= 100) {

                b.message =
                    "* Враг был пощажён.";

                b.phase = "victory";

            } else {

                b.message =
                    "* Пощада пока недоступна.";

                nextActor();

            }

        }

        return;

    }


    /* ENEMY */

    if (b.phase === "enemy") {

        updateSoul();

    }


    /* VICTORY */

    if (b.phase === "victory") {

        if (keys.z && !prev.z) {

            game.mode = "explore";

            game.battle = null;

        }

    }


    /* DEFEAT */

    if (b.phase === "defeat") {

        if (keys.z && !prev.z) {

            party.forEach(p => p.hp=p.maxHP);

            game.mode = "explore";

            game.battle = null;

        }

    }

}


/* =========================================================
   FIGHT
========================================================= */

function battleFight() {

    const b = game.battle;

    const p = party[b.actor];

    const damage =
        p.atk +
        Math.floor(
            Math.random()*7
        );

    b.enemy.hp =
        Math.max(
            0,
            b.enemy.hp-damage
        );

    /*
       Атака заполняет TP.
       Защита TP не получает.
    */

    b.tp =
        Math.min(
            100,
            b.tp+10
        );

    b.message =
        "* " +
        p.name +
        " атакует! -" +
        damage +
        " HP.";

    if (b.enemy.hp <= 0) {

        b.phase = "victory";

        return;

    }

    nextActor();

}


/* =========================================================
   NEXT ACTOR
========================================================= */

function nextActor() {

    const b = game.battle;

    b.actor++;

    if (
        b.actor >= party.length
    ) {

        b.actor = 0;

        startEnemyTurn();

    } else {

        b.phase = "menu";

    }

}


/* =========================================================
   DEFEND
========================================================= */

function defend() {

    const b = game.battle;

    /*
       Защита НЕ увеличивает TP.
    */

    b.defend = true;

    b.message =
        "* " +
        party[b.actor].name +
        " защищается.";

    nextActor();

}


/* =========================================================
   ENEMY TURN
========================================================= */

function startEnemyTurn() {

    const b = game.battle;

    b.phase = "enemy";

    b.timer = 420;

    b.defend = false;

    b.bullets = [];

    for (
        let i=0;
        i<8;
        i++
    ) {

        b.bullets.push({

            x:55+Math.random()*210,

            y:-10-Math.random()*80,

            speed:
                1+
                Math.random()*1.5

        });

    }

    b.soul.x = 160;
    b.soul.y = 125;

}


/* =========================================================
   SOUL
========================================================= */

function updateSoul() {

    const b = game.battle;

    if (!b)
        return;

    if (keys.up)
        b.soul.y -= b.soul.speed;

    if (keys.down)
        b.soul.y += b.soul.speed;

    if (keys.left)
        b.soul.x -= b.soul.speed;

    if (keys.right)
        b.soul.x += b.soul.speed;


    b.soul.x =
        Math.max(
            55,
            Math.min(
                265,
                b.soul.x
            )
        );

    b.soul.y =
        Math.max(
            92,
            Math.min(
                157,
                b.soul.y
            )
        );


    if (b.soul.inv > 0)
        b.soul.inv--;


    b.bullets.forEach(bullet => {

        bullet.y += bullet.speed;

        if (bullet.y > 165) {

            bullet.y = -8;

            bullet.x =
                55+
                Math.random()*210;

        }

        const dx =
            bullet.x-b.soul.x;

        const dy =
            bullet.y-b.soul.y;

        if (
            Math.sqrt(
                dx*dx+dy*dy
            ) < 7
        ) {

            if (b.soul.inv <= 0) {

                const p =
                    party[b.actor];

                let damage = 8;

                if (b.defend)
                    damage = 4;

                p.hp =
                    Math.max(
                        0,
                        p.hp-damage
                    );

                b.soul.inv = 40;

                b.message =
                    "* " +
                    p.name +
                    " получил " +
                    damage +
                    " урона.";

                if (party.every(
                    p=>p.hp<=0
                )) {

                    b.phase =
                        "defeat";

                }

            }

        }

    });


    b.timer--;

    if (b.timer <= 0) {

        b.phase = "menu";

        b.command = 0;

        b.message =
            "* Ход ДЕЛЬТЫ.";

    }

}


/* =========================================================
   DRAW CHARACTER
========================================================= */

function drawCharacter(
    x,
    y,
    color
) {

    x = Math.round(x);
    y = Math.round(y);

    ctx.fillStyle = "#000";

    ctx.fillRect(
        x-2,
        y-2,
        14,
        18
    );

    ctx.fillStyle = color;

    ctx.fillRect(
        x+2,
        y,
        6,
        6
    );

    ctx.fillRect(
        x+1,
        y+6,
        8,
        7
    );

    ctx.fillRect(
        x+1,
        y+13,
        3,
        3
    );

    ctx.fillRect(
        x+6,
        y+13,
        3,
        3
    );

}


/* =========================================================
   ROOM
========================================================= */

function drawRoom() {

    const room =
        rooms[game.room];

    ctx.fillStyle =
        room.floor;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* PIXEL FLOOR */

    ctx.fillStyle = "#202020";

    for (
        let y=12;
        y<170;
        y+=12
    ) {

        for (
            let x=12;
            x<312;
            x+=12
        ) {

            ctx.fillRect(
                x,
                y,
                1,
                1
            );

        }

    }


    /* WALLS */

    ctx.fillStyle = "#555";

    room.walls.forEach(w => {

        ctx.fillRect(
            w.x,
            w.y,
            w.w,
            w.h
        );

    });


    /* EXIT */

    ctx.fillStyle = "#733";

    ctx.fillRect(
        room.exit.x,
        room.exit.y,
        room.exit.w,
        room.exit.h
    );


    /* SAVE TABLE */

    if (game.room === "start") {

        /* TABLE */

        ctx.fillStyle = "#633d25";

        ctx.fillRect(
            125,
            48,
            55,
            35
        );

        ctx.fillStyle = "#3d2416";

        ctx.fillRect(
            132,
            80,
            6,
            25
        );

        ctx.fillRect(
            168,
            80,
            6,
            25
        );


        /* PIZZA */

        ctx.fillStyle = "#d69a32";

        ctx.fillRect(
            137,
            56,
            32,
            20
        );

        ctx.fillStyle = "#b42d2d";

        ctx.fillRect(
            143,
            60,
            5,
            5
        );

        ctx.fillRect(
            155,
            67,
            5,
            5
        );

        ctx.fillRect(
            161,
            58,
            4,
            4
        );


        /* STAR */

        ctx.fillStyle = "#ffff66";

        ctx.font = "10px monospace";

        ctx.fillText(
            "*",
            149,
            42
        );

    }


    /* PARTY */

    followers.forEach(f => {

        drawCharacter(
            f.x,
            f.y,
            f.color
        );

    });


    drawCharacter(
        player.x,
        player.y,
        "#fff"
    );


    /* SAVE MESSAGE */

    if (
        game.room === "start" &&
        nearSave()
    ) {

        ctx.fillStyle = "#000";

        ctx.fillRect(
            82,
            143,
            156,
            20
        );

        ctx.strokeStyle = "#fff";

        ctx.strokeRect(
            82,
            143,
            156,
            20
        );

        ctx.fillStyle = "#fff";

        ctx.font = "6px monospace";

        ctx.fillText(
            "Z — СОХРАНИТЬ У ПИЦЦЫ",
            95,
            156
        );

    }

}


/* =========================================================
   BATTLE DRAW
========================================================= */

function drawBattle() {

    const b =
        game.battle;

    ctx.fillStyle = "#000";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* ENEMY */

    drawEnemy(
        220,
        35,
        b.enemy.color
    );


    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText(
        b.enemy.name,
        25,
        15
    );


    ctx.fillText(
        "HP",
        25,
        25
    );


    drawBar(
        42,
        20,
        80,
        6,
        b.enemy.hp,
        b.enemy.maxHP
    );


    ctx.fillText(
        b.enemy.hp +
        "/" +
        b.enemy.maxHP,
        125,
        26
    );


    /* MESSAGE */

    ctx.font = "7px monospace";

    drawWrapped(
        b.message,
        20,
        65,
        275,
        9
    );


    /* TP */

    drawTP();


    /* PARTY */

    drawBattleParty();


    /* ATTACK */

    if (
        b.phase === "enemy"
    ) {

        drawEnemyAttack();

    } else {

        drawBattleCommands();

    }


    if (b.phase === "victory") {

        ctx.fillStyle = "#fff";

        ctx.font = "12px monospace";

        ctx.fillText(
            "ПОБЕДА!",
            120,
            100
        );

        ctx.font = "7px monospace";

        ctx.fillText(
            "Z — продолжить",
            105,
            120
        );

    }


    if (b.phase === "defeat") {

        ctx.fillStyle = "#fff";

        ctx.font = "10px monospace";

        ctx.fillText(
            "ОТРЯД ПОБЕЖДЁН",
            85,
            105
        );

        ctx.font = "7px monospace";

        ctx.fillText(
            "Z — восстановиться",
            95,
            125
        );

    }

}


/* =========================================================
   TP BAR
========================================================= */

function drawTP() {

    const b =
        game.battle;

    /*
       Шкала находится сбоку.
       Она заполняется действиями.
    */

    const x = 7;
    const y = 75;
    const w = 10;
    const h = 85;


    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        x,
        y,
        w,
        h
    );


    const fill =
        h * (b.tp / 100);


    ctx.fillStyle = "#fff";

    ctx.fillRect(
        x+2,
        y+h-2-fill,
        w-4,
        fill
    );


    ctx.font = "5px monospace";

    ctx.save();

    ctx.translate(
        4,
        70
    );

    ctx.rotate(
        -Math.PI/2
    );

    ctx.fillText(
        "TP " +
        Math.floor(b.tp) +
        "%",
        0,
        0
    );

    ctx.restore();

}


/* =========================================================
   BATTLE PARTY
========================================================= */

function drawBattleParty() {

    const b =
        game.battle;

    ctx.font = "6px monospace";


    party.forEach((p,i) => {

        const y =
            87 + i*13;


        /* TURN ARROW NEAR NAME */

        if (
            i === b.actor &&
            b.phase !== "victory" &&
            b.phase !== "defeat"
        ) {

            ctx.fillStyle = "#fff";

            ctx.fillText(
                "▶",
                22,
                y
            );

        }


        /* NAME */

        ctx.fillStyle =
            p.color;

        ctx.fillText(
            p.name,
            31,
            y
        );


        /* HP */

        ctx.fillStyle = "#fff";

        ctx.fillText(
            "HP",
            75,
            y
        );


        drawBar(
            89,
            y-5,
            35,
            5,
            p.hp,
            p.maxHP
        );


        ctx.fillText(
            p.hp +
            "/" +
            p.maxHP,
            128,
            y
        );

    });

}


/* =========================================================
   COMMANDS
========================================================= */

function drawBattleCommands() {

    const b =
        game.battle;


    if (b.phase === "menu") {

        const commands = [

            "FIGHT",
            "ACT",
            "ITEM",
            "MERCY"

        ];


        commands.forEach((cmd,i) => {

            const x =
                175 +
                (i%2)*68;

            const y =
                91 +
                Math.floor(i/2)*28;


            if (i === b.command) {

                ctx.strokeStyle = "#fff";

                ctx.strokeRect(
                    x-6,
                    y-10,
                    58,
                    17
                );

            }


            ctx.fillStyle = "#fff";

            ctx.font = "7px monospace";

            ctx.fillText(
                cmd,
                x,
                y+2
            );

        });

        /* DEFEND */

        ctx.font = "6px monospace";

        ctx.fillText(
            "X = ЗАЩИТА",
            177,
            153
        );

        return;

    }


    if (b.phase === "act") {

        ctx.fillStyle = "#fff";

        ctx.font = "7px monospace";

        ctx.fillText(
            "ACT",
            180,
            93
        );

        ctx.fillText(
            b.actIndex === 0 ?
            "▶ ПОГОВОРИТЬ" :
            "  ПОГОВОРИТЬ",
            180,
            112
        );

        ctx.fillText(
            b.actIndex === 1 ?
            "▶ ОСМОТРЕТЬ" :
            "  ОСМОТРЕТЬ",
            180,
            130
        );

        ctx.font = "6px monospace";

        ctx.fillText(
            "Z — выбрать",
            180,
            148
        );

        ctx.fillText(
            "X — назад",
            180,
            158
        );

        return;

    }


    if (b.phase === "item") {

        ctx.fillStyle = "#fff";

        ctx.font = "7px monospace";

        ctx.fillText(
            "ITEM",
            180,
            93
        );

        ctx.fillText(
            "▶ ПИЦЦА +35 HP",
            180,
            115
        );

        ctx.font = "6px monospace";

        ctx.fillText(
            "Z — использовать",
            180,
            135
        );

        ctx.fillText(
            "X — назад",
            180,
            150
        );

        return;

    }


    if (b.phase === "mercy") {

        ctx.fillStyle = "#fff";

        ctx.font = "7px monospace";

        ctx.fillText(
            "MERCY",
            180,
            93
        );

        ctx.fillText(
            b.tp >= 100 ?
            "▶ ПОЩАДИТЬ" :
            "▶ ПОКА РАНО",
            180,
            115
        );

        ctx.font = "6px monospace";

        ctx.fillText(
            "TP: " +
            Math.floor(b.tp) +
            "%",
            180,
            135
        );

        ctx.fillText(
            "X — назад",
            180,
            150
        );

    }

}


/* =========================================================
   DEFEND BY X
========================================================= */

function handleDefend() {

    const b =
        game.battle;

    if (
        b &&
        b.phase === "menu" &&
        keys.x &&
        !prev.x
    ) {

        defend();

        return true;

    }

    return false;

}


/* =========================================================
   ENEMY DRAW
========================================================= */

function drawEnemy(
    x,
    y,
    color
) {

    ctx.fillStyle = "#000";

    ctx.fillRect(
        x-23,
        y-20,
        46,
        44
    );


    ctx.fillStyle =
        color;

    ctx.fillRect(
        x-18,
        y-15,
        36,
        32
    );


    ctx.fillStyle = "#fff";

    ctx.fillRect(
        x-11,
        y-5,
        6,
        6
    );

    ctx.fillRect(
        x+5,
        y-5,
        6,
        6
    );

}


/* =========================================================
   ENEMY ATTACK DRAW
========================================================= */

function drawEnemyAttack() {

    const b =
        game.battle;

    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        145,
        82,
        160,
        78
    );


    b.bullets.forEach(bullet => {

        ctx.fillStyle = "#fff";

        ctx.fillRect(
            bullet.x-3,
            bullet.y-3,
            6,
            6
        );

    });


    ctx.fillStyle = "#fff";

    ctx.fillRect(
        b.soul.x-4,
        b.soul.y-4,
        8,
        8
    );

}


/* =========================================================
   BAR
========================================================= */

function drawBar(
    x,
    y,
    w,
    h,
    value,
    max
) {

    ctx.fillStyle = "#252525";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );

    const amount =
        Math.max(
            0,
            Math.min(
                1,
                value/max
            )
        );

    ctx.fillStyle = "#fff";

    ctx.fillRect(
        x,
        y,
        w*amount,
        h
    );

}


/* =========================================================
   TEXT
========================================================= */

function drawWrapped(
    text,
    x,
    y,
    width,
    lineHeight
) {

    const words =
        text.split(" ");

    let line = "";

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
            width
            &&
            line !== ""
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
   C MENU
========================================================= */

function handleC() {

    if (
        keys.c &&
        !prev.c &&
        game.mode === "explore"
    ) {

        game.mode = "mainMenu";

        game.menuIndex = 0;

    }

}


/* =========================================================
   UPDATE
========================================================= */

function update() {

    if (game.mode === "title") {

        updateTitle();

    }

    else if (game.mode === "mainMenu") {

        updateMainMenu();

    }

    else if (game.mode === "files") {

        updateFiles();

    }

    else if (game.mode === "settings") {

        updateSettings();

    }

    else if (game.mode === "explore") {

        updatePlayer();

        updateFollowers();

        updateSave();

        updateExit();

        updateRandomBattle();

        handleC();

    }

    else if (game.mode === "battle") {

        /*
           X сначала используется как защита.
           В ACT/ITEM/MERCY он остаётся кнопкой назад.
        */

        if (!handleDefend()) {

            battleInput();

        }

    }


    /* SAVE MESSAGE TIMER */

    if (game.saveTimer > 0)
        game.saveTimer--;


    /* PREVIOUS */

    prev.z = keys.z;
    prev.x = keys.x;
    prev.c = keys.c;

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


    if (game.mode === "title") {

        drawTitle();

    }

    else if (game.mode === "mainMenu") {

        drawMainMenu();

    }

    else if (game.mode === "files") {

        drawFiles();

    }

    else if (game.mode === "settings") {

        drawSettings();

    }

    else if (game.mode === "explore") {

        drawRoom();

    }

    else if (game.mode === "battle") {

        drawBattle();

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
