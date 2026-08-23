"use strict";

/* =====================================================
   PIXEL RPG
   320x180
===================================================== */

const canvas =
    document.getElementById("game");

const ctx =
    canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = 320;
const H = 180;


/* =====================================================
   CONSTANTS
===================================================== */

const WALK_SPEED = 1.4;
const RUN_SPEED = 2.7;


/* =====================================================
   GAME STATE
===================================================== */

const game = {

    room: "room1",

    mode: "explore",

    time: 0,

    transition: 0,

    dialogue: null,

    dialogueIndex: 0,

    menuPage: "main",

    menuIndex: 0,

    menuOpen: false,

    lastZ: false,

    lastX: false,

    lastC: false

};


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
    c: false,

    run: false

};


/* =====================================================
   KEYBOARD
===================================================== */

window.addEventListener(
    "keydown",
    e => {

        const key =
            e.key.toLowerCase();

        if (
            e.key === "ArrowUp" ||
            key === "w"
        ) {

            keys.up = true;
        }

        if (
            e.key === "ArrowDown" ||
            key === "s"
        ) {

            keys.down = true;
        }

        if (
            e.key === "ArrowLeft" ||
            key === "a"
        ) {

            keys.left = true;
        }

        if (
            e.key === "ArrowRight" ||
            key === "d"
        ) {

            keys.right = true;
        }

        if (key === "z") {

            keys.z = true;
        }

        if (key === "x") {

            keys.x = true;
        }

        if (key === "c") {

            keys.c = true;
        }

        e.preventDefault();

    },
    { passive:false }
);


window.addEventListener(
    "keyup",
    e => {

        const key =
            e.key.toLowerCase();

        if (
            e.key === "ArrowUp" ||
            key === "w"
        ) {

            keys.up = false;
        }

        if (
            e.key === "ArrowDown" ||
            key === "s"
        ) {

            keys.down = false;
        }

        if (
            e.key === "ArrowLeft" ||
            key === "a"
        ) {

            keys.left = false;
        }

        if (
            e.key === "ArrowRight" ||
            key === "d"
        ) {

            keys.right = false;
        }

        if (key === "z") {

            keys.z = false;
        }

        if (key === "x") {

            keys.x = false;
        }

        if (key === "c") {

            keys.c = false;
        }

        e.preventDefault();

    },
    { passive:false }
);


/* =====================================================
   MOBILE BUTTONS
===================================================== */

document
.querySelectorAll(".joy")
.forEach(button => {

    const key =
        button.dataset.key;

    button.addEventListener(
        "pointerdown",
        e => {

            e.preventDefault();

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


document
.querySelectorAll(".action-button")
.forEach(button => {

    const key =
        button.dataset.key;

    button.addEventListener(
        "pointerdown",
        e => {

            e.preventDefault();

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


/* =====================================================
   RUN
===================================================== */

const runIndicator =
    document.getElementById(
        "run-indicator"
    );

let runPointer = null;


canvas.addEventListener(
    "pointerdown",
    e => {

        runPointer =
            e.pointerId;

        keys.run = true;

        runIndicator
            .classList
            .add("active");

    }
);


canvas.addEventListener(
    "pointerup",
    e => {

        if (
            e.pointerId !==
            runPointer
        ) {
            return;
        }

        runPointer = null;

        keys.run = false;

        runIndicator
            .classList
            .remove("active");

    }
);


canvas.addEventListener(
    "pointercancel",
    () => {

        runPointer = null;

        keys.run = false;

        runIndicator
            .classList
            .remove("active");

    }
);


/* =====================================================
   FULLSCREEN
===================================================== */

async function fullscreen() {

    try {

        if (
            !document.fullscreenElement
        ) {

            await document
                .documentElement
                .requestFullscreen();

        }

        if (
            screen.orientation &&
            screen.orientation.lock
        ) {

            try {

                await screen.orientation
                    .lock("landscape");

            } catch {}

        }

    } catch (error) {

        console.log(
            "Fullscreen:",
            error
        );

    }

}


document.addEventListener(
    "pointerdown",
    () => {

        fullscreen();

    },
    {
        once:true
    }
);


/* =====================================================
   PLAYER
===================================================== */

const player = {

    x: 145,
    y: 120,

    width: 10,
    height: 14,

    direction: "down",

    moving: false

};


/* =====================================================
   PARTY
===================================================== */

const party = [

    {
        name:"Игрок",

        color:"#ffffff",

        hp:100,
        maxHP:100,

        atk:10,
        def:8
    },

    {
        name:"Напарник 1",

        color:"#ff5555",

        hp:90,
        maxHP:90,

        atk:8,
        def:7
    },

    {
        name:"Напарник 2",

        color:"#55aaff",

        hp:110,
        maxHP:110,

        atk:12,
        def:5
    },

    {
        name:"Напарник 3",

        color:"#55dd66",

        hp:80,
        maxHP:80,

        atk:7,
        def:10
    },

    {
        name:"Напарник 4",

        color:"#cc66ff",

        hp:120,
        maxHP:120,

        atk:9,
        def:12
    }

];


const followers = [

    {
        x:130,
        y:120,
        color:"#ff5555"
    },

    {
        x:115,
        y:120,
        color:"#55aaff"
    },

    {
        x:100,
        y:120,
        color:"#55dd66"
    },

    {
        x:85,
        y:120,
        color:"#cc66ff"
    }

];


/* =====================================================
   ROOMS
===================================================== */

const rooms = {

    room1: {

        name:"НАЧАЛО",

        floor:"#181818",

        walls:[

            {
                x:0,
                y:0,
                w:320,
                h:8
            },

            {
                x:0,
                y:172,
                w:320,
                h:8
            },

            {
                x:0,
                y:0,
                w:8,
                h:180
            },

            {
                x:312,
                y:0,
                w:8,
                h:180
            },

            {
                x:55,
                y:45,
                w:80,
                h:10
            },

            {
                x:200,
                y:45,
                w:60,
                h:10
            },

            {
                x:55,
                y:45,
                w:10,
                h:60
            },

            {
                x:255,
                y:45,
                w:10,
                h:60
            }

        ],

        npc: {

            x:225,
            y:110,

            width:10,
            height:14,

            color:"#ffff55",

            name:"Странный человек"

        },

        exit: {

            x:295,
            y:75,

            w:17,
            h:30,

            target:"room2"

        }

    },


    room2: {

        name:"ТЁМНАЯ КОМНАТА",

        floor:"#0d1018",

        walls:[

            {
                x:0,
                y:0,
                w:320,
                h:8
            },

            {
                x:0,
                y:172,
                w:320,
                h:8
            },

            {
                x:0,
                y:0,
                w:8,
                h:180
            },

            {
                x:312,
                y:0,
                w:8,
                h:180
            }

        ],

        npc: {

            x:160,
            y:65,

            width:10,
            height:14,

            color:"#ff66cc",

            name:"Таинственная девушка"

        },

        exit: {

            x:8,
            y:75,

            w:17,
            h:30,

            target:"room1"

        }

    }

};


/* =====================================================
   DIALOGUES
===================================================== */

const dialogues = {

    "Странный человек":[

        "Эй...",

        "Вы четверо тоже его сопровождаете?",

        "Странно.",

        "Вам лучше идти дальше.",

        "Впереди вас ждёт кое-что интересное..."

    ],

    "Таинственная девушка":[

        "Вы наконец пришли.",

        "Я ждала именно вас.",

        "Но сначала...",

        "вам нужно кое-что узнать."

    ]

};


/* =====================================================
   COLLISION
===================================================== */

function overlap(a,b) {

    return (

        a.x <
        b.x + b.w &&

        a.x + a.width >
        b.x &&

        a.y <
        b.y + b.h &&

        a.y + a.height >
        b.y

    );

}


function canMove(x,y) {

    const test = {

        x:x,
        y:y,

        width:player.width,
        height:player.height

    };

    const room =
        rooms[game.room];

    for (
        const wall of room.walls
    ) {

        if (
            overlap(test,wall)
        ) {

            return false;

        }

    }

    return true;

}


/* =====================================================
   PLAYER UPDATE
===================================================== */

function updatePlayer() {

    if (
        game.mode !== "explore"
    ) {
        return;
    }

    let dx = 0;
    let dy = 0;

    const speed =
        keys.run
        ? RUN_SPEED
        : WALK_SPEED;

    if (keys.up) {

        dy -= speed;

        player.direction =
            "up";

    }

    if (keys.down) {

        dy += speed;

        player.direction =
            "down";

    }

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

    player.moving =
        dx !== 0 ||
        dy !== 0;

    if (
        dx !== 0 &&
        dy !== 0
    ) {

        dx *= 0.707;

        dy *= 0.707;

    }

    if (
        canMove(
            player.x + dx,
            player.y
        )
    ) {

        player.x += dx;

    }

    if (
        canMove(
            player.x,
            player.y + dy
        )
    ) {

        player.y += dy;

    }

}


/* =====================================================
   FOLLOWERS
===================================================== */

function updateFollowers() {

    if (
        game.mode !== "explore"
    ) {
        return;
    }

    const targets = [

        {
            x:player.x - 15,
            y:player.y
        },

        {
            x:player.x - 30,
            y:player.y
        },

        {
            x:player.x - 45,
            y:player.y
        },

        {
            x:player.x - 60,
            y:player.y
        }

    ];

    followers.forEach(
        (member,index) => {

            const target =
                targets[index];

            const dx =
                target.x -
                member.x;

            const dy =
                target.y -
                member.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            if (
                distance > 2
            ) {

                member.x +=
                    dx * 0.08;

                member.y +=
                    dy * 0.08;

            }

        }
    );

}


/* =====================================================
   NPC
===================================================== */

function distanceToNPC() {

    const npc =
        rooms[game.room].npc;

    const dx =
        player.x - npc.x;

    const dy =
        player.y - npc.y;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );

}


function updateNPC() {

    if (
        game.mode !== "explore"
    ) {
        return;
    }

    if (
        distanceToNPC() < 25 &&
        keys.z &&
        !game.lastZ
    ) {

        startDialogue(
            rooms[
                game.room
            ].npc.name
        );

    }

}


/* =====================================================
   DIALOGUE
===================================================== */

function startDialogue(name) {

    if (!dialogues[name]) {
        return;
    }

    game.mode =
        "dialogue";

    game.dialogue =
        dialogues[name];

    game.dialogueIndex = 0;

}


function updateDialogue() {

    if (
        game.mode !== "dialogue"
    ) {
        return;
    }

    /* X сразу закрывает диалог */

    if (
        keys.x &&
        !game.lastX
    ) {

        closeDialogue();

        return;

    }

    /* Z следующий текст */

    if (
        keys.z &&
        !game.lastZ
    ) {

        game.dialogueIndex++;

        if (
            game.dialogueIndex >=
            game.dialogue.length
        ) {

            closeDialogue();

        }

    }

}


function closeDialogue() {

    game.dialogue = null;

    game.dialogueIndex = 0;

    game.mode =
        "explore";

}


/* =====================================================
   MENU
===================================================== */

const menuItems = [

    "ITEM",

    "STATUS",

    "EQUIPMENT",

    "SETTINGS"

];


function openMenu() {

    game.mode =
        "menu";

    game.menuOpen =
        true;

    game.menuPage =
        "main";

    game.menuIndex =
        0;

}


function closeMenu() {

    game.mode =
        "explore";

    game.menuOpen =
        false;

}


function updateMenu() {

    if (
        game.mode !== "menu"
    ) {
        return;
    }

    if (
        keys.x &&
        !game.lastX
    ) {

        if (
            game.menuPage !==
            "main"
        ) {

            game.menuPage =
                "main";

        } else {

            closeMenu();

        }

        return;

    }


    if (
        keys.up &&
        !game.menuUpLock
    ) {

        game.menuIndex--;

        if (
            game.menuIndex < 0
        ) {

            game.menuIndex =
                menuItems.length - 1;

        }

        game.menuUpLock = true;

    }


    if (!keys.up) {

        game.menuUpLock =
            false;

    }


    if (
        keys.down &&
        !game.menuDownLock
    ) {

        game.menuIndex++;

        if (
            game.menuIndex >=
            menuItems.length
        ) {

            game.menuIndex = 0;

        }

        game.menuDownLock = true;

    }


    if (!keys.down) {

        game.menuDownLock =
            false;

    }


    if (
        keys.z &&
        !game.lastZ
    ) {

        const selected =
            menuItems[
                game.menuIndex
            ];

        game.menuPage =
            selected;

        game.menuIndex = 0;

    }

}


/* =====================================================
   C BUTTON
===================================================== */

function updateC() {

    if (
        keys.c &&
        !game.lastC
    ) {

        if (
            game.mode ===
            "explore"
        ) {

            openMenu();

        }

        else if (
            game.mode ===
            "menu"
        ) {

            closeMenu();

        }

    }

}


/* =====================================================
   EXIT
===================================================== */

function updateExit() {

    if (
        game.mode !== "explore"
    ) {
        return;
    }

    const room =
        rooms[game.room];

    if (
        overlap(
            player,
            room.exit
        )
    ) {

        game.room =
            room.exit.target;

        game.transition =
            20;

        if (
            game.room ===
            "room1"
        ) {

            player.x = 275;
            player.y = 90;

        } else {

            player.x = 30;
            player.y = 90;

        }

        followers.forEach(
            (member,index) => {

                member.x =
                    player.x -
                    15 *
                    (index + 1);

                member.y =
                    player.y;

            }
        );

    }

}


/* =====================================================
   DRAW ROOM
===================================================== */

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

    ctx.fillStyle =
        "#252525";

    for (
        let y = 10;
        y < 172;
        y += 16
    ) {

        for (
            let x = 10;
            x < 312;
            x += 16
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

    ctx.fillStyle =
        "#555";

    room.walls.forEach(
        wall => {

            ctx.fillRect(
                wall.x,
                wall.y,
                wall.w,
                wall.h
            );

        }
    );


    /* EXIT */

    ctx.fillStyle =
        "#663333";

    ctx.fillRect(
        room.exit.x,
        room.exit.y,
        room.exit.w,
        room.exit.h
    );

}


/* =====================================================
   CHARACTER
===================================================== */

function drawCharacter(
    x,
    y,
    color
) {

    x = Math.round(x);
    y = Math.round(y);

    ctx.fillStyle =
        "#000";

    ctx.fillRect(
        x - 1,
        y - 1,
        12,
        16
    );

    ctx.fillStyle =
        color;

    /* HEAD */

    ctx.fillRect(
        x + 2,
        y,
        6,
        6
    );

    /* BODY */

    ctx.fillRect(
        x + 1,
        y + 6,
        8,
        7
    );

    /* LEGS */

    ctx.fillRect(
        x + 1,
        y + 13,
        3,
        2
    );

    ctx.fillRect(
        x + 6,
        y + 13,
        3,
        2
    );

}


/* =====================================================
   DRAW NPC
===================================================== */

function drawNPC() {

    const npc =
        rooms[game.room].npc;

    drawCharacter(
        npc.x,
        npc.y,
        npc.color
    );

}


/* =====================================================
   DRAW PARTY
===================================================== */

function drawFollowers() {

    followers.forEach(
        member => {

            drawCharacter(
                member.x,
                member.y,
                member.color
            );

        }
    );

}


/* =====================================================
   DRAW PLAYER
===================================================== */

function drawPlayer() {

    drawCharacter(
        player.x,
        player.y,
        "#ffffff"
    );

}


/* =====================================================
   ROOM NAME
===================================================== */

function drawRoomName() {

    ctx.font =
        "6px monospace";

    ctx.fillStyle =
        "#ffffff";

    ctx.fillText(
        rooms[
            game.room
        ].name,
        12,
        18
    );

}


/* =====================================================
   NPC PROMPT
===================================================== */

function drawPrompt() {

    if (
        game.mode !== "explore"
    ) {
        return;
    }

    if (
        distanceToNPC() < 25
    ) {

        ctx.fillStyle =
            "#000";

        ctx.fillRect(
            100,
            145,
            120,
            18
        );

        ctx.strokeStyle =
            "#fff";

        ctx.strokeRect(
            100,
            145,
            120,
            18
        );

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "6px monospace";

        ctx.fillText(
            "Z — ГОВОРИТЬ",
            120,
            156
        );

    }

}


/* =====================================================
   DIALOGUE
===================================================== */

function drawDialogue() {

    if (
        game.mode !== "dialogue"
    ) {
        return;
    }

    ctx.fillStyle =
        "rgba(0,0,0,0.45)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.fillStyle =
        "#000";

    ctx.fillRect(
        12,
        112,
        296,
        55
    );


    ctx.strokeStyle =
        "#fff";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        12,
        112,
        296,
        55
    );


    const text =
        game.dialogue[
            game.dialogueIndex
        ];


    ctx.fillStyle =
        "#fff";

    ctx.font =
        "7px monospace";


    drawWrappedText(
        text,
        23,
        132,
        270,
        10
    );


    ctx.font =
        "6px monospace";

    ctx.fillText(
        "Z — далее",
        238,
        157
    );

    ctx.fillText(
        "X — закрыть",
        238,
        164
    );

}


/* =====================================================
   WRAPPED TEXT
===================================================== */

function drawWrappedText(
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

        const width =
            ctx.measureText(
                test
            ).width;

        if (
            width > maxWidth &&
            i > 0
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


/* =====================================================
   MENU
===================================================== */

function drawMenu() {

    if (
        game.mode !== "menu"
    ) {
        return;
    }


    ctx.fillStyle =
        "rgba(0,0,0,0.85)";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    ctx.strokeStyle =
        "#fff";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        25,
        15,
        270,
        150
    );


    /* MAIN */

    if (
        game.menuPage ===
        "main"
    ) {

        ctx.fillStyle =
            "#fff";

        ctx.font =
            "10px monospace";

        ctx.fillText(
            "MENU",
            45,
            35
        );


        menuItems.forEach(
            (item,index) => {

                const y =
                    58 +
                    index * 22;

                if (
                    index ===
                    game.menuIndex
                ) {

                    ctx.fillText(
                        "▶",
                        55,
                        y
                    );

                }

                ctx.fillText(
                    item,
                    70,
                    y
                );

            }
        );

    }


    /* ITEM */

    if (
        game.menuPage ===
        "ITEM"
    ) {

        drawMenuTitle(
            "ITEM"
        );

        drawTextList([

            "Potion       x3",

            "Candy        x2",

            "Dark Food    x1",

            "Key          x1"

        ]);

    }


    /* STATUS */

    if (
        game.menuPage ===
        "STATUS"
    ) {

        drawMenuTitle(
            "STATUS"
        );

        party.forEach(
            (member,index) => {

                const y =
                    45 +
                    index * 22;

                ctx.fillStyle =
                    member.color;

                ctx.fillText(
                    member.name,
                    45,
                    y
                );

                ctx.fillStyle =
                    "#fff";

                ctx.fillText(
                    "HP " +
                    member.hp +
                    "/" +
                    member.maxHP,
                    155,
                    y
                );

            }
        );

    }


    /* EQUIPMENT */

    if (
        game.menuPage ===
        "EQUIPMENT"
    ) {

        drawMenuTitle(
            "EQUIPMENT"
        );

        drawTextList([

            "PLAYER",

            "WEAPON   Wooden Sword",

            "ARMOR    Old Clothes",

            "",

            "Оружие и броня пока",
            "находятся в разработке."

        ]);

    }


    /* SETTINGS */

    if (
        game.menuPage ===
        "SETTINGS"
    ) {

        drawMenuTitle(
            "SETTINGS"
        );

        drawTextList([

            "FULLSCREEN",

            "PIXEL MODE",

            "SOUND",

            "LANGUAGE"

        ]);

    }


    ctx.font =
        "6px monospace";

    ctx.fillStyle =
        "#aaa";

    ctx.fillText(
        "Z — выбрать",
        40,
        155
    );

    ctx.fillText(
        "X — назад",
        210,
        155
    );

}


function drawMenuTitle(title) {

    ctx.fillStyle =
        "#fff";

    ctx.font =
        "10px monospace";

    ctx.fillText(
        title,
        45,
        35
    );

}


function drawTextList(list) {

    ctx.font =
        "7px monospace";

    ctx.fillStyle =
        "#fff";

    list.forEach(
        (text,index) => {

            ctx.fillText(
                text,
                45,
                52 +
                index * 18
            );

        }
    );

}


/* =====================================================
   TRANSITION
===================================================== */

function drawTransition() {

    if (
        game.transition <= 0
    ) {
        return;
    }

    ctx.fillStyle =
        "#000";

    ctx.globalAlpha =
        game.transition / 20;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    ctx.globalAlpha = 1;

    game.transition--;

}


/* =====================================================
   EDGE INPUT
===================================================== */

function updateInputMemory() {

    game.lastZ =
        keys.z;

    game.lastX =
        keys.x;

    game.lastC =
        keys.c;

}


/* =====================================================
   UPDATE
===================================================== */

function update() {

    game.time++;


    /* C */

    updateC();


    /* MENU */

    if (
        game.mode === "menu"
    ) {

        updateMenu();

    }


    /* DIALOGUE */

    else if (
        game.mode === "dialogue"
    ) {

        updateDialogue();

    }


    /* EXPLORE */

    else {

        updatePlayer();

        updateFollowers();

        updateNPC();

        updateExit();

    }


    updateInputMemory();

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


    drawRoom();

    drawNPC();

    drawFollowers();

    drawPlayer();

    drawRoomName();

    drawPrompt();

    drawDialogue();

    drawMenu();

    drawTransition();

}


/* =====================================================
   LOOP
===================================================== */

function loop() {

    update();

    draw();

    requestAnimationFrame(
        loop
    );

}


loop();
