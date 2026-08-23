"use strict";

/* =====================================================
   CANVAS
===================================================== */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const W = 320;
const H = 180;

ctx.imageSmoothingEnabled = false;


/* =====================================================
   UI
===================================================== */

const mainMenu = document.getElementById("mainMenu");
const saveMenu = document.getElementById("saveMenu");

const startButton = document.getElementById("startButton");
const loadButton = document.getElementById("loadButton");
const saveBack = document.getElementById("saveBack");

const fullscreen = document.getElementById("fullscreen");


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


/* keyboard */

window.addEventListener("keydown", e => {

    const k = e.key.toLowerCase();

    if(k === "w" || e.key === "ArrowUp")
        keys.up = true;

    if(k === "s" || e.key === "ArrowDown")
        keys.down = true;

    if(k === "a" || e.key === "ArrowLeft")
        keys.left = true;

    if(k === "d" || e.key === "ArrowRight")
        keys.right = true;

    if(k === "z")
        keys.z = true;

    if(k === "x")
        keys.x = true;

    if(k === "c")
        keys.c = true;

});


window.addEventListener("keyup", e => {

    const k = e.key.toLowerCase();

    if(k === "w" || e.key === "ArrowUp")
        keys.up = false;

    if(k === "s" || e.key === "ArrowDown")
        keys.down = false;

    if(k === "a" || e.key === "ArrowLeft")
        keys.left = false;

    if(k === "d" || e.key === "ArrowRight")
        keys.right = false;

    if(k === "z")
        keys.z = false;

    if(k === "x")
        keys.x = false;

    if(k === "c")
        keys.c = false;

});


/* mobile buttons */

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


function actionButton(id,key) {

    const button = document.getElementById(id);

    button.addEventListener("pointerdown", e => {

        e.preventDefault();

        keys[key] = true;

        button.setPointerCapture(e.pointerId);

    });

    button.addEventListener("pointerup", () => {

        keys[key] = false;

    });

    button.addEventListener("pointercancel", () => {

        keys[key] = false;

    });

}

actionButton("zButton","z");
actionButton("xButton","x");
actionButton("cButton","c");


/* =====================================================
   GAME STATE
===================================================== */

let started = false;

let mode = "menu";

let previousZ = false;
let previousX = false;
let previousC = false;

let message = "";


/* =====================================================
   PLAYER
===================================================== */

const player = {

    x:150,
    y:125,

    w:10,
    h:14,

    speed:1.5
};


/* =====================================================
   PARTY
===================================================== */

const party = [

    {
        name:"ДЕЛЬТА",
        hp:100,
        maxHP:100,
        attack:15
    },

    {
        name:"НЕМКА",
        hp:100,
        maxHP:100,
        attack:12
    },

    {
        name:"ЛИЧИ",
        hp:80,
        maxHP:80,
        attack:13
    },

    {
        name:"ПАНКЕЙК",
        hp:90,
        maxHP:90,
        attack:10
    },

    {
        name:"КАШТАН",
        hp:120,
        maxHP:120,
        attack:14
    }

];


/* =====================================================
   BATTLE
===================================================== */

let battle = {

    enemyHP:300,

    enemyMaxHP:300,

    rd:0,

    actor:0,

    attacking:false,

    defending:false,

    attackTimer:0,

    damageTimer:0,

    message:"ТЕНЕВОЙ ЗВЕРЬ ПОЯВИЛСЯ!"

};


/* =====================================================
   ROOMS
===================================================== */

const room = {

    walls:[

        {x:0,y:0,w:320,h:8},
        {x:0,y:172,w:320,h:8},
        {x:0,y:0,w:8,h:180},
        {x:312,y:0,w:8,h:180}

    ],

    saveX:100,
    saveY:55

};


/* =====================================================
   START GAME
===================================================== */

startButton.addEventListener("click", () => {

    started = true;

    mode = "explore";

    mainMenu.style.display = "none";

});


/* =====================================================
   SAVE MENU
===================================================== */

loadButton.addEventListener("click", () => {

    mainMenu.style.display = "none";

    saveMenu.style.display = "flex";

    updateSaveSlots();

});


saveBack.addEventListener("click", () => {

    saveMenu.style.display = "none";

    mainMenu.style.display = "flex";

});


/* =====================================================
   SAVE SLOTS
===================================================== */

document.querySelectorAll(".saveSlot").forEach(slot => {

    slot.addEventListener("click", () => {

        const number = slot.dataset.slot;

        loadGame(number);

    });

});


function updateSaveSlots() {

    document.querySelectorAll(".saveSlot").forEach(slot => {

        const number = slot.dataset.slot;

        const data =
            localStorage.getItem(
                "bloodGlow_" + number
            );

        const span =
            slot.querySelector("span");

        if(data) {

            span.textContent = "СОХРАНЕНО";

        } else {

            span.textContent = "ПУСТО";

        }

    });

}


/* =====================================================
   SAVE GAME
===================================================== */

function saveGame(slot) {

    const data = {

        playerX:player.x,

        playerY:player.y,

        partyHP:party.map(p => p.hp)

    };

    localStorage.setItem(
        "bloodGlow_" + slot,
        JSON.stringify(data)
    );

}


/* =====================================================
   LOAD GAME
===================================================== */

function loadGame(slot) {

    const raw =
        localStorage.getItem(
            "bloodGlow_" + slot
        );

    if(!raw) {

        saveGame(slot);

        saveMenu.style.display = "none";

        started = true;

        mode = "explore";

        message = "СОЗДАН НОВЫЙ ФАЙЛ";

        return;

    }

    try {

        const data = JSON.parse(raw);

        player.x =
            data.playerX || 150;

        player.y =
            data.playerY || 125;

        if(data.partyHP) {

            data.partyHP.forEach((hp,i) => {

                if(party[i]) {

                    party[i].hp =
                        Math.max(
                            0,
                            Math.min(
                                party[i].maxHP,
                                hp
                            )
                        );

                }

            });

        }

        saveMenu.style.display = "none";

        started = true;

        mode = "explore";

        message = "ИГРА ЗАГРУЖЕНА";

    }

    catch {

        message = "ОШИБКА ФАЙЛА";

    }

}


/* =====================================================
   FULLSCREEN
===================================================== */

fullscreen.addEventListener("click", async () => {

    try {

        if(!document.fullscreenElement) {

            await document.documentElement.requestFullscreen();

        } else {

            await document.exitFullscreen();

        }

    }

    catch(e) {

        console.log(e);

    }

});


/* =====================================================
   COLLISION
===================================================== */

function collision(x,y) {

    if(x < 10)
        return true;

    if(y < 10)
        return true;

    if(x > 300)
        return true;

    if(y > 158)
        return true;

    return false;

}


/* =====================================================
   PLAYER UPDATE
===================================================== */

function updatePlayer() {

    if(mode !== "explore")
        return;

    let dx = 0;
    let dy = 0;

    if(keys.up)
        dy -= player.speed;

    if(keys.down)
        dy += player.speed;

    if(keys.left)
        dx -= player.speed;

    if(keys.right)
        dx += player.speed;


    if(!collision(
        player.x + dx,
        player.y
    )) {

        player.x += dx;

    }


    if(!collision(
        player.x,
        player.y + dy
    )) {

        player.y += dy;

    }


    /* пицца */

    const dist =
        Math.hypot(
            player.x-room.saveX,
            player.y-room.saveY
        );


    if(
        dist < 25 &&
        keys.z &&
        !previousZ
    ) {

        saveGame(0);

        message =
            "ИГРА СОХРАНЕНА!";

    }

}


/* =====================================================
   START BATTLE
===================================================== */

function startBattle() {

    mode = "battle";

    battle.enemyHP = 300;

    battle.rd = 0;

    battle.actor = 0;

    battle.attackTimer = 0;

    battle.damageTimer = 0;

    battle.attacking = false;

    battle.defending = false;

    battle.message =
        "ТЕНЕВОЙ ЗВЕРЬ НАПАДАЕТ!";

}


/* =====================================================
   BATTLE UPDATE
===================================================== */

function updateBattle() {

    /*
       Z = атака
    */

    if(
        keys.z &&
        !previousZ &&
        !battle.attacking
    ) {

        battle.attacking = true;

        battle.attackTimer = 30;

        battle.message =
            "ДЕЛЬТА ГОТОВИТ АТАКУ...";

    }


    /*
       X = защита

       Пока X зажат —
       РД НЕ РАСТЁТ.
    */

    battle.defending = keys.x;


    /*
       приближение атаки
    */

    if(!battle.defending) {

        battle.rd += 0.09;

    }


    /*
       атака противника
    */

    if(battle.rd >= 100) {

        battle.rd = 0;

        enemyAttack();

    }


    /*
       собственная атака
    */

    if(battle.attacking) {

        battle.attackTimer--;

        if(battle.attackTimer <= 0) {

            battle.attacking = false;

            const damage =
                12 +
                Math.floor(
                    Math.random()*8
                );

            battle.enemyHP -= damage;

            battle.message =
                "АТАКА! -"+
                damage+
                " HP";

            if(battle.enemyHP <= 0) {

                battle.enemyHP = 0;

                battle.message =
                    "ПОБЕДА!";

            }

        }

    }


    /*
       Если враг умер —
       возвращаемся в игру
    */

    if(
        battle.enemyHP <= 0 &&
        keys.z &&
        !previousZ
    ) {

        mode = "explore";

        message =
            "ТЕНЕВОЙ ЗВЕРЬ ПОБЕЖДЁН!";

    }

}


/* =====================================================
   ENEMY ATTACK
===================================================== */

function enemyAttack() {

    const target =
        party[battle.actor];


    if(!target)
        return;


    if(battle.defending) {

        battle.message =
            "ЗАЩИТА! УРОН СНИЖЕН.";

        return;

    }


    const damage =
        8 +
        Math.floor(
            Math.random()*7
        );


    target.hp -= damage;


    if(target.hp < 0)
        target.hp = 0;


    battle.message =
        target.name+
        " получил "+
        damage+
        " урона!";


    battle.actor++;

    if(
        battle.actor >= party.length
    ) {

        battle.actor = 0;

    }

}


/* =====================================================
   DRAW ROOM
===================================================== */

function drawRoom() {

    ctx.fillStyle = "#151515";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* пол */

    ctx.fillStyle = "#202020";

    for(let x=10;x<310;x+=20) {

        for(let y=10;y<170;y+=20) {

            ctx.fillRect(
                x,
                y,
                1,
                1
            );

        }

    }


    /* стены */

    ctx.fillStyle = "#555";

    room.walls.forEach(w => {

        ctx.fillRect(
            w.x,
            w.y,
            w.w,
            w.h
        );

    });


    drawPizzaTable(
        room.saveX,
        room.saveY
    );


    /* игрок */

    ctx.fillStyle = "#fff";

    ctx.fillRect(
        player.x,
        player.y,
        player.w,
        player.h
    );


    ctx.fillStyle = "#ff5555";

    ctx.fillRect(
        player.x+2,
        player.y+2,
        2,
        2
    );


    /* сообщение */

    if(message) {

        ctx.fillStyle = "#fff";

        ctx.font = "7px monospace";

        ctx.fillText(
            message,
            10,
            20
        );

    }


    /* подсказка */

    const distance =
        Math.hypot(
            player.x-room.saveX,
            player.y-room.saveY
        );


    if(distance < 30) {

        ctx.fillStyle = "#fff";

        ctx.font = "6px monospace";

        ctx.fillText(
            "Z — СОХРАНИТЬ",
            80,
            90
        );

    }


    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText(
        "C — МЕНЮ",
        245,
        20
    );

}


/* =====================================================
   PIZZA TABLE
===================================================== */

function drawPizzaTable(x,y) {

    /* ножки */

    ctx.fillStyle = "#3a2115";

    ctx.fillRect(
        x+5,
        y+15,
        5,
        12
    );

    ctx.fillRect(
        x+27,
        y+15,
        5,
        12
    );


    /* стол */

    ctx.fillStyle = "#774422";

    ctx.fillRect(
        x,
        y+5,
        37,
        13
    );


    ctx.fillStyle = "#a86635";

    ctx.fillRect(
        x+2,
        y+3,
        33,
        7
    );


    /* тарелка */

    ctx.fillStyle = "#ddd";

    ctx.fillRect(
        x+8,
        y,
        21,
        5
    );


    /* пицца */

    ctx.fillStyle = "#d87925";

    ctx.fillRect(
        x+10,
        y-2,
        17,
        6
    );


    /* сыр */

    ctx.fillStyle = "#ffd84a";

    ctx.fillRect(
        x+12,
        y-1,
        13,
        4
    );


    /* пепперони */

    ctx.fillStyle = "#a52a2a";

    ctx.fillRect(
        x+14,
        y,
        3,
        2
    );

    ctx.fillRect(
        x+21,
        y+1,
        3,
        2
    );


    /* звёздочки */

    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText("*",x-6,y+3);
    ctx.fillText("*",x+38,y+5);

}


/* =====================================================
   DRAW BATTLE
===================================================== */

function drawBattle() {

    ctx.fillStyle = "#050505";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* враг */

    ctx.fillStyle = "#552277";

    ctx.fillRect(
        135,
        20,
        50,
        45
    );


    ctx.fillStyle = "#fff";

    ctx.fillRect(
        146,
        35,
        6,
        6
    );

    ctx.fillRect(
        168,
        35,
        6,
        6
    );


    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText(
        "ТЕНЕВОЙ ЗВЕРЬ",
        20,
        18
    );


    /*
       HP врага
    */

    drawBar(
        215,
        14,
        80,
        7,
        battle.enemyHP,
        300,
        "#fff"
    );


    /*
       СООБЩЕНИЕ
    */

    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText(
        battle.message,
        20,
        80
    );


    /*
       БОЕВАЯ ЗОНА
    */

    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        75,
        90,
        170,
        65
    );


    /*
       РД СБОКУ
    */

    drawRD();


    /*
       СЕРДЦЕ
    */

    if(battle.enemyHP > 0) {

        ctx.fillStyle =
            battle.defending
                ? "#55aaff"
                : "#ff3333";

        ctx.fillRect(
            155,
            120,
            10,
            10
        );

    }


    /*
       Атака
    */

    if(battle.attacking) {

        ctx.strokeStyle = "#fff";

        ctx.strokeRect(
            105,
            108,
            110,
            30
        );

    }


    /*
       партия
    */

    ctx.font = "5.5px monospace";

    party.forEach((p,i) => {

        const y =
            105 + i*10;

        ctx.fillStyle =
            i === battle.actor
                ? "#fff"
                : "#aaa";

        ctx.fillText(
            (i === battle.actor ? "▶ " : "  ") +
            p.name,
            5,
            y
        );

        ctx.fillText(
            p.hp+"/"+p.maxHP,
            35,
            y
        );

    });


    /*
       подсказки
    */

    ctx.fillStyle =
        battle.defending
            ? "#55aaff"
            : "#fff";

    ctx.font = "6px monospace";

    ctx.fillText(
        "Z — АТАКА",
        190,
        165
    );

    ctx.fillText(
        "X — ЗАЩИТА",
        250,
        165
    );

}


/* =====================================================
   RD BAR
===================================================== */

function drawRD() {

    const x = 292;
    const y = 55;

    const w = 12;
    const h = 100;


    /*
       фон
    */

    ctx.fillStyle = "#111";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );


    /*
       рамка
    */

    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        x,
        y,
        w,
        h
    );


    /*
       заполнение снизу вверх
    */

    const amount =
        Math.max(
            0,
            Math.min(
                100,
                battle.rd
            )
        ) / 100;


    ctx.fillStyle =
        battle.defending
            ? "#3388ff"
            : "#ff3333";


    ctx.fillRect(
        x+2,
        y+h-2-(h-4)*amount,
        w-4,
        (h-4)*amount
    );


    /*
       надпись
    */

    ctx.save();

    ctx.translate(
        x+8,
        y-5
    );

    ctx.rotate(
        -Math.PI/2
    );

    ctx.fillStyle = "#fff";

    ctx.font = "6px monospace";

    ctx.fillText(
        "РД",
        0,
        0
    );

    ctx.restore();


    /*
       процент
    */

    ctx.fillStyle = "#fff";

    ctx.font = "5px monospace";

    ctx.fillText(
        Math.floor(battle.rd)+"%",
        286,
        164
    );


    /*
       предупреждение
    */

    if(battle.rd >= 80) {

        ctx.fillStyle = "#ff5555";

        ctx.font = "5px monospace";

        ctx.fillText(
            "!",
            296,
            50
        );

    }

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
    max,
    color
) {

    ctx.fillStyle = "#222";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );


    ctx.fillStyle = color;

    ctx.fillRect(
        x,
        y,
        w * Math.max(
            0,
            value/max
        ),
        h
    );


    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        x,
        y,
        w,
        h
    );

}


/* =====================================================
   MENU
===================================================== */

function drawMenu() {

    ctx.fillStyle =
        "rgba(0,0,0,.95)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        25,
        15,
        270,
        150
    );


    ctx.fillStyle = "#fff";

    ctx.font = "12px monospace";

    ctx.fillText(
        "МЕНЮ",
        45,
        35
    );


    ctx.font = "8px monospace";

    ctx.fillText(
        "▶ ФАЙЛЫ СОХРАНЕНИЯ",
        50,
        65
    );

    ctx.fillText(
        "СТАТУС ОТРЯДА",
        50,
        90
    );

    ctx.fillText(
        "ДЕЛЬТА",
        50,
        115
    );

    ctx.fillText(
        "HP "+party[0].hp+
        "/"+party[0].maxHP,
        150,
        115
    );


    ctx.fillText(
        "C — ЗАКРЫТЬ МЕНЮ",
        50,
        145
    );

}


/* =====================================================
   UPDATE MENU
===================================================== */

function updateMenu() {

    if(
        keys.c &&
        !previousC
    ) {

        mode = "explore";

    }

}


/* =====================================================
   MAIN UPDATE
===================================================== */

function update() {

    if(!started)
        return;


    if(mode === "explore") {

        updatePlayer();


        /*
           C — открыть меню
        */

        if(
            keys.c &&
            !previousC
        ) {

            mode = "menu";

        }


        /*
           Для теста боя:
           Z возле центра комнаты.
        */

        if(
            keys.z &&
            !previousZ &&
            player.x > 140 &&
            player.x < 180 &&
            player.y > 100
        ) {

            startBattle();

        }

    }


    else if(mode === "battle") {

        updateBattle();

    }


    else if(mode === "menu") {

        updateMenu();

    }


    previousZ = keys.z;
    previousX = keys.x;
    previousC = keys.c;

}


/* =====================================================
   DRAW
===================================================== */

function draw() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    if(mode === "battle") {

        drawBattle();

    }

    else {

        drawRoom();

        if(mode === "menu") {

            drawMenu();

        }

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
