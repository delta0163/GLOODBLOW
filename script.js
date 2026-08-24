"use strict";

/* =========================================
   CANVAS
========================================= */

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = 320;
const H = 180;


/* =========================================
   INPUT
========================================= */

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
    c: false
};


/* =========================================
   KEYBOARD
========================================= */

window.addEventListener("keydown", function(e) {

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

}, { passive: false });


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

}, { passive: false });


/* =========================================
   MOBILE BUTTONS
========================================= */

document.querySelectorAll("[data-key]").forEach(function(button) {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", function(e) {

        e.preventDefault();

        keys[key] = true;

    });

    button.addEventListener("pointerup", function(e) {

        e.preventDefault();

        keys[key] = false;

    });

    button.addEventListener("pointercancel", function() {

        keys[key] = false;

    });

    button.addEventListener("pointerleave", function() {

        if (
            key === "up" ||
            key === "down" ||
            key === "left" ||
            key === "right"
        ) {
            keys[key] = false;
        }

    });

});


/* =========================================
   FULLSCREEN
========================================= */

document
    .getElementById("fullscreen")
    .addEventListener("click", function() {

        if (!document.fullscreenElement) {

            document.documentElement
                .requestFullscreen()
                .catch(function() {});

        } else {

            document.exitFullscreen();

        }

    });


/* =========================================
   GAME
========================================= */

const game = {

    screen: "title",

    dialogueIndex: 0,

    player: {
        x: 150,
        y: 120,
        speed: 1.5
    },

    dialogue: [],

    battle: {
        hp: 100,
        maxHP: 100,
        rd: 0,
        enemyHP: 100,
        menu: 0
    }

};


/* =========================================
   PARTY
========================================= */

const party = [

    {
        name: "ДЕЛЬТА",
        hp: 90,
        maxHP: 90
    },

    {
        name: "ЛИЧИ",
        hp: 80,
        maxHP: 80
    },

    {
        name: "ПАНКЕЙК",
        hp: 70,
        maxHP: 70
    },

    {
        name: "КАШТАН",
        hp: 110,
        maxHP: 110
    },

    {
        name: "ШАРЛОТА",
        hp: 100,
        maxHP: 100
    }

];


/* =========================================
   START
========================================= */

function startGame() {

    game.screen = "intro";

    game.dialogue = [

        "Дельта просыпается в своей комнате.",

        "За окном находится цифровая пустошь.",

        "Сегодня команда должна была проверить Немку.",

        "Дельта выходит из комнаты.",

        "Остальные уже ждут его снаружи."

    ];

    game.dialogueIndex = 0;

}


/* =========================================
   TEAM DIALOGUE
========================================= */

function startTeamDialogue() {

    game.screen = "dialogue";

    game.dialogue = [

        "ЛИЧИ: Надо проверить Немку...",

        "ЛИЧИ: Она изменилась.",

        "ЛИЧИ: Последний раз, когда мы пытались поговорить с ней,",

        "ЛИЧИ: она была странной.",

        "ДЕЛЬТА: Так мы идём?",

        "ЛИЧИ: Да.",

        "ПАНКЕЙК: Тогда не будем терять время.",

        "КАШТАН: Держимся вместе.",

        "ШАРЛОТА: Я надеюсь, мы найдём её раньше, чем она найдёт нас."

    ];

    game.dialogueIndex = 0;

}


/* =========================================
   NEXT DIALOGUE
========================================= */

function nextDialogue() {

    game.dialogueIndex++;

    if (
        game.dialogueIndex >=
        game.dialogue.length
    ) {

        game.dialogue = [];

        game.screen = "wasteland";

        game.player.x = 160;
        game.player.y = 125;

    }

}


/* =========================================
   MOVEMENT
========================================= */

function updatePlayer() {

    if (game.screen !== "wasteland")
        return;

    let dx = 0;
    let dy = 0;

    if (keys.up)
        dy--;

    if (keys.down)
        dy++;

    if (keys.left)
        dx--;

    if (keys.right)
        dx++;

    if (dx !== 0 && dy !== 0) {

        dx *= 0.707;
        dy *= 0.707;

    }

    game.player.x +=
        dx * game.player.speed;

    game.player.y +=
        dy * game.player.speed;


    game.player.x =
        Math.max(
            12,
            Math.min(
                308,
                game.player.x
            )
        );

    game.player.y =
        Math.max(
            25,
            Math.min(
                155,
                game.player.y
            )
        );

}


/* =========================================
   BATTLE START
========================================= */

function startBattle() {

    game.screen = "battle";

    game.battle.enemyHP = 100;

    game.battle.rd = 0;

    game.battle.menu = 0;

}


/* =========================================
   BATTLE
========================================= */

function updateBattle() {

    if (game.screen !== "battle")
        return;


    if (
        keys.left &&
        !pressed.left
    ) {

        game.battle.menu--;

        if (game.battle.menu < 0)
            game.battle.menu = 3;

    }


    if (
        keys.right &&
        !pressed.right
    ) {

        game.battle.menu++;

        if (game.battle.menu > 3)
            game.battle.menu = 0;

    }


    if (
        keys.z &&
        !pressed.z
    ) {

        const option =
            game.battle.menu;


        /* FIGHT */

        if (option === 0) {

            game.battle.enemyHP -= 25;

            if (game.battle.enemyHP <= 0) {

                game.battle.enemyHP = 0;

                game.screen = "victory";

            }

        }


        /* ACT */

        if (option === 1) {

            game.battle.rd =
                Math.min(
                    100,
                    game.battle.rd + 10
                );

        }


        /* MAGIC */

        if (option === 2) {

            game.battle.enemyHP -= 15;

        }


        /* DEFEND */

        if (option === 3) {

            /*
               RD увеличивается
               только от защиты.
            */

            game.battle.rd =
                Math.min(
                    100,
                    game.battle.rd + 25
                );

        }

    }

}


/* =========================================
   UPDATE
========================================= */

function update() {

    if (
        game.screen === "title"
    ) {

        if (
            keys.z &&
            !pressed.z
        ) {

            startGame();

        }

    }

    else if (
        game.screen === "intro"
    ) {

        if (
            keys.z &&
            !pressed.z
        ) {

            if (
                game.dialogueIndex <
                game.dialogue.length - 1
            ) {

                nextDialogue();

            } else {

                startTeamDialogue();

            }

        }

    }

    else if (
        game.screen === "dialogue"
    ) {

        if (
            keys.z &&
            !pressed.z
        ) {

            nextDialogue();

        }

    }

    else if (
        game.screen === "wasteland"
    ) {

        updatePlayer();

        /*
           Для проверки:
           нажми C — бой.
        */

        if (
            keys.c &&
            !pressed.c
        ) {

            startBattle();

        }

    }

    else if (
        game.screen === "battle"
    ) {

        updateBattle();

    }

    else if (
        game.screen === "victory"
    ) {

        if (
            keys.z &&
            !pressed.z
        ) {

            game.screen = "wasteland";

        }

    }


    pressed.z = keys.z;
    pressed.x = keys.x;
    pressed.c = keys.c;

}


/* =========================================
   DRAW TITLE
========================================= */

function drawTitle() {

    ctx.fillStyle = "#050505";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle = "#fff";

    ctx.textAlign = "center";


    ctx.font = "18px monospace";

    ctx.fillText(
        "BLOOD GLOW",
        160,
        55
    );


    ctx.font = "7px monospace";

    ctx.fillText(
        "DIGITAL WORLD",
        160,
        70
    );


    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        105,
        105,
        110,
        27
    );


    ctx.fillText(
        "НАЧАТЬ",
        160,
        122
    );


    ctx.font = "6px monospace";

    ctx.fillText(
        "Z — выбрать",
        160,
        150
    );


    ctx.textAlign = "left";

}


/* =========================================
   DRAW INTRO
========================================= */

function drawIntro() {

    ctx.fillStyle = "#10141b";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    drawRoom();


    drawDialogueBox();

}


/* =========================================
   ROOM
========================================= */

function drawRoom() {

    ctx.fillStyle = "#171717";

    ctx.fillRect(
        25,
        20,
        270,
        135
    );


    ctx.strokeStyle = "#555";

    ctx.strokeRect(
        25,
        20,
        270,
        135
    );


    ctx.fillStyle = "#252525";

    ctx.fillRect(
        55,
        50,
        80,
        35
    );


    ctx.fillStyle = "#333";

    ctx.fillRect(
        65,
        55,
        60,
        8
    );


    drawCharacter(
        game.player.x,
        game.player.y,
        "#ffffff"
    );

}


/* =========================================
   DRAW WASTELAND
========================================= */

function drawWasteland() {

    ctx.fillStyle = "#101820";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* цифровые помехи */

    for (
        let i = 0;
        i < 70;
        i++
    ) {

        const x =
            (i * 47) % W;

        const y =
            (i * 29) % H;

        ctx.fillStyle =
            i % 3 === 0
            ? "#26333c"
            : "#1a252c";

        ctx.fillRect(
            x,
            y,
            2,
            2
        );

    }


    /* земля */

    ctx.fillStyle = "#18242a";

    for (
        let i = 0;
        i < 9;
        i++
    ) {

        ctx.fillRect(
            i * 40,
            140 + (i % 2) * 6,
            28,
            3
        );

    }


    /* команда */

    drawCharacter(
        game.player.x,
        game.player.y,
        "#ffffff"
    );

    drawCharacter(
        game.player.x - 13,
        game.player.y,
        "#55aaff"
    );

    drawCharacter(
        game.player.x - 26,
        game.player.y,
        "#55dd66"
    );

    drawCharacter(
        game.player.x - 39,
        game.player.y,
        "#cc8844"
    );

    drawCharacter(
        game.player.x - 52,
        game.player.y,
        "#ff66cc"
    );


    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText(
        "ЦИФРОВАЯ ПУСТОШЬ",
        10,
        14
    );


    ctx.font = "6px monospace";

    ctx.fillText(
        "C — вызвать бой",
        10,
        174
    );

}


/* =========================================
   CHARACTER
========================================= */

function drawCharacter(
    x,
    y,
    color
) {

    x = Math.round(x);
    y = Math.round(y);


    ctx.fillStyle = "#000";

    ctx.fillRect(
        x - 5,
        y - 10,
        10,
        18
    );


    ctx.fillStyle = color;

    ctx.fillRect(
        x - 3,
        y - 8,
        6,
        6
    );


    ctx.fillRect(
        x - 4,
        y - 2,
        8,
        7
    );

}


/* =========================================
   DIALOGUE BOX
========================================= */

function drawDialogueBox() {

    ctx.fillStyle = "rgba(0,0,0,.75)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle = "#000";

    ctx.fillRect(
        15,
        108,
        290,
        52
    );


    ctx.strokeStyle = "#fff";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        15,
        108,
        290,
        52
    );


    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";


    drawText(
        game.dialogue[
            game.dialogueIndex
        ],
        27,
        128,
        265
    );


    ctx.font = "6px monospace";

    ctx.fillText(
        "Z — далее",
        235,
        153
    );

}


/* =========================================
   TEXT
========================================= */

function drawText(
    text,
    x,
    y,
    maxWidth
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
            maxWidth &&
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

            y += 9;

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


/* =========================================
   BATTLE DRAW
========================================= */

function drawBattle() {

    const b = game.battle;


    ctx.fillStyle = "#000";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* враг */

    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        15,
        10,
        290,
        55
    );


    ctx.fillStyle = "#713b99";

    ctx.fillRect(
        145,
        20,
        30,
        32
    );


    ctx.fillStyle = "#fff";

    ctx.fillRect(
        151,
        28,
        5,
        5
    );

    ctx.fillRect(
        164,
        28,
        5,
        5
    );


    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText(
        "ОШИБКА СИСТЕМЫ",
        25,
        22
    );


    ctx.fillText(
        "HP " + b.enemyHP + "/100",
        220,
        22
    );


    /* battle box */

    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        165,
        95,
        145,
        70
    );


    /* soul */

    ctx.fillStyle = "#ff3344";

    ctx.fillRect(
        235,
        130,
        6,
        6
    );


    /* party */

    party.forEach(
        function(p,i) {

            const y =
                105 + i * 12;


            if (
                i === 0
            ) {

                ctx.fillStyle = "#fff";

                ctx.fillText(
                    "▶",
                    5,
                    y
                );

            }


            ctx.fillStyle = "#fff";

            ctx.font = "6px monospace";

            ctx.fillText(
                p.name,
                16,
                y
            );


            ctx.fillText(
                "HP " +
                p.hp +
                "/" +
                p.maxHP,
                70,
                y
            );

        }
    );


    /* меню */

    const options = [
        "FIGHT",
        "ACT",
        "MAGIC",
        "DEFEND"
    ];


    const pos = [
        [175,108],
        [245,108],
        [175,137],
        [245,137]
    ];


    options.forEach(
        function(name,i) {

            const x =
                pos[i][0];

            const y =
                pos[i][1];


            if (
                i === b.menu
            ) {

                ctx.strokeStyle = "#fff";

                ctx.strokeRect(
                    x - 7,
                    y - 9,
                    62,
                    16
                );

            }


            ctx.fillStyle = "#fff";

            ctx.font = "7px monospace";

            ctx.fillText(
                name,
                x,
                y + 2
            );

        }
    );


    /* RD */

    ctx.font = "6px monospace";

    ctx.fillText(
        "RD",
        270,
        78
    );


    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        270,
        81,
        35,
        7
    );


    ctx.fillStyle = "#55aaff";

    ctx.fillRect(
        271,
        82,
        33 * b.rd / 100,
        5
    );


    ctx.fillStyle = "#aaa";

    ctx.font = "5px monospace";

    ctx.fillText(
        "DEFEND → RD",
        170,
        174
    );

}


/* =========================================
   VICTORY
========================================= */

function drawVictory() {

    ctx.fillStyle = "#000";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle = "#fff";

    ctx.textAlign = "center";

    ctx.font = "16px monospace";

    ctx.fillText(
        "ПОБЕДА",
        160,
        75
    );


    ctx.font = "7px monospace";

    ctx.fillText(
        "Ошибка системы исчезла.",
        160,
        95
    );


    ctx.fillText(
        "Z — продолжить",
        160,
        125
    );


    ctx.textAlign = "left";

}


/* =========================================
   MAIN DRAW
========================================= */

function draw() {

    if(game.screen === "title") {

        drawTitle();

    }

    else if(game.screen === "intro") {

        drawIntro();

    }

    else if(game.screen === "dialogue") {

        drawWasteland();

        drawDialogueBox();

    }

    else if(game.screen === "wasteland") {

        drawWasteland();

    }

    else if(game.screen === "battle") {

        drawBattle();

    }

    else if(game.screen === "victory") {

        drawVictory();

    }

}


/* =========================================
   LOOP
========================================= */

function loop() {

    update();

    draw();

    requestAnimationFrame(loop);

}


/* =========================================
   START
========================================= */

loop();
