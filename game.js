"use strict";


/* =====================================================
   CANVAS
===================================================== */

const canvas =
    document.getElementById("game");

const ctx =
    canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = 320;
const H = 180;


/* =====================================================
   FULLSCREEN
===================================================== */

const fullscreenButton =
    document.getElementById(
        "fullscreen-button"
    );

fullscreenButton.addEventListener(
    "pointerdown",
    async function(e) {

        e.preventDefault();

        try {

            if (!document.fullscreenElement) {

                await document
                    .documentElement
                    .requestFullscreen();

            } else {

                await document.exitFullscreen();

            }

        } catch(error) {

            console.log(error);

        }

    }
);


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
    c:false,

    run:false

};

const previous = {

    z:false,
    x:false,
    c:false

};


/* =====================================================
   KEYBOARD
===================================================== */

window.addEventListener(
    "keydown",
    function(e) {

        const k =
            e.key.toLowerCase();

        if (
            e.key === "ArrowUp" ||
            k === "w"
        )
            keys.up = true;

        if (
            e.key === "ArrowDown" ||
            k === "s"
        )
            keys.down = true;

        if (
            e.key === "ArrowLeft" ||
            k === "a"
        )
            keys.left = true;

        if (
            e.key === "ArrowRight" ||
            k === "d"
        )
            keys.right = true;

        if (k === "z")
            keys.z = true;

        if (k === "x")
            keys.x = true;

        if (k === "c")
            keys.c = true;

        e.preventDefault();

    },
    {passive:false}
);


window.addEventListener(
    "keyup",
    function(e) {

        const k =
            e.key.toLowerCase();

        if (
            e.key === "ArrowUp" ||
            k === "w"
        )
            keys.up = false;

        if (
            e.key === "ArrowDown" ||
            k === "s"
        )
            keys.down = false;

        if (
            e.key === "ArrowLeft" ||
            k === "a"
        )
            keys.left = false;

        if (
            e.key === "ArrowRight" ||
            k === "d"
        )
            keys.right = false;

        if (k === "z")
            keys.z = false;

        if (k === "x")
            keys.x = false;

        if (k === "c")
            keys.c = false;

        e.preventDefault();

    },
    {passive:false}
);


/* =====================================================
   MOBILE
===================================================== */

document
.querySelectorAll(".joy")
.forEach(function(button) {

    const key =
        button.dataset.key;

    button.addEventListener(
        "pointerdown",
        function(e) {

            e.preventDefault();

            keys[key] = true;

            button.setPointerCapture(
                e.pointerId
            );

        }
    );

    button.addEventListener(
        "pointerup",
        function(e) {

            e.preventDefault();

            keys[key] = false;

        }
    );

    button.addEventListener(
        "pointercancel",
        function() {

            keys[key] = false;

        }
    );

});


document
.querySelectorAll(".action-button")
.forEach(function(button) {

    const key =
        button.dataset.key;

    button.addEventListener(
        "pointerdown",
        function(e) {

            e.preventDefault();

            keys[key] = true;

            button.setPointerCapture(
                e.pointerId
            );

        }
    );

    button.addEventListener(
        "pointerup",
        function() {

            keys[key] = false;

        }
    );

    button.addEventListener(
        "pointercancel",
        function() {

            keys[key] = false;

        }
    );

});


/* =====================================================
   GAME
===================================================== */

const game = {

    mode:"title",

    room:"room1",

    dialogue:null,

    dialogueIndex:0,

    menuPage:"main",

    menuIndex:0,

    saveSlot:0,

    transition:0,

    battle:null,

    firstBattleDone:false,

    saved:false

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
        rd:0,
        maxRD:100,
        color:"#ffffff"
    },

    {
        name:"НЕМКА",
        hp:100,
        maxHP:100,
        atk:11,
        def:9,
        rd:0,
        maxRD:100,
        color:"#ff5555"
    },

    {
        name:"ЛИЧИ",
        hp:80,
        maxHP:80,
        atk:13,
        def:6,
        rd:0,
        maxRD:100,
        color:"#55aaff"
    },

    {
        name:"ПАНКЕЙК",
        hp:70,
        maxHP:70,
        atk:10,
        def:11,
        rd:0,
        maxRD:100,
        color:"#55dd66"
    },

    {
        name:"КАШТАН",
        hp:110,
        maxHP:110,
        atk:12,
        def:12,
        rd:0,
        maxRD:100,
        color:"#cc8844"
    }

];


/* =====================================================
   PLAYER
===================================================== */

const player = {

    x:145,
    y:120,

    width:10,
    height:14,

    direction:"down"

};


/* =====================================================
   FOLLOWERS
===================================================== */

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
        color:"#cc8844"
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

            {x:0,y:0,w:320,h:8},
            {x:0,y:172,w:320,h:8},
            {x:0,y:0,w:8,h:180},
            {x:312,y:0,w:8,h:180},

            {x:55,y:45,w:80,h:10},
            {x:200,y:45,w:60,h:10},

            {x:55,y:45,w:10,h:60},
            {x:255,y:45,w:10,h:60}

        ],

        npc: {

            x:225,
            y:110,

            width:10,
            height:14,

            color:"#ffff55",

            name:"Странный человек"

        },

        savePoint: {

            x:155,
            y:55,

            w:30,
            h:20

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

            {x:0,y:0,w:320,h:8},
            {x:0,y:172,w:320,h:8},
            {x:0,y:0,w:8,h:180},
            {x:312,y:0,w:8,h:180}

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
   SAVE SYSTEM
===================================================== */

function saveGame(slot) {

    const data = {

        room:game.room,

        playerX:player.x,

        playerY:player.y,

        firstBattleDone:
            game.firstBattleDone,

        party:party.map(function(p) {

            return {

                name:p.name,

                hp:p.hp,

                rd:p.rd

            };

        })

    };

    localStorage.setItem(
        "blood_glow_save_" + slot,
        JSON.stringify(data)
    );

    game.saved = true;

}


function loadGame(slot) {

    const raw =
        localStorage.getItem(
            "blood_glow_save_" + slot
        );

    if (!raw)
        return false;

    try {

        const data =
            JSON.parse(raw);

        game.room =
            data.room || "room1";

        player.x =
            data.playerX || 145;

        player.y =
            data.playerY || 120;

        game.firstBattleDone =
            !!data.firstBattleDone;

        if (data.party) {

            data.party.forEach(
                function(saved,i) {

                    if (!party[i])
                        return;

                    party[i].hp =
                        Math.max(
                            0,
                            Math.min(
                                party[i].maxHP,
                                saved.hp
                            )
                        );

                    party[i].rd =
                        Math.max(
                            0,
                            Math.min(
                                party[i].maxRD,
                                saved.rd || 0
                            )
                        );

                }
            );

        }

        return true;

    } catch(e) {

        return false;

    }

}


function hasSave(slot) {

    return !!localStorage.getItem(
        "blood_glow_save_" + slot
    );

}


/* =====================================================
   SAVE POINT
===================================================== */

function nearSavePoint() {

    const p =
        rooms.room1.savePoint;

    return (

        player.x < p.x+p.w &&
        player.x+player.width > p.x &&
        player.y < p.y+p.h &&
        player.y+player.height > p.y

    );

}


function useSavePoint() {

    saveGame(game.saveSlot);

    game.dialogue = [

        "Ты остановился у стола.",

        "Пицца всё ещё тёплая.",

        "Команда немного отдохнула.",

        "Игра сохранена."

    ];

    game.dialogueIndex = 0;

    game.mode = "dialogue";

}


/* =====================================================
   COLLISION
===================================================== */

function overlap(a,b) {

    return (

        a.x < b.x+b.w &&
        a.x+a.width > b.x &&
        a.y < b.y+b.h &&
        a.y+a.height > b.y

    );

}


function canMove(x,y) {

    const test = {

        x:x,
        y:y,

        width:player.width,
        height:player.height

    };

    for (
        const wall of rooms[game.room].walls
    ) {

        if (overlap(test,wall))
            return false;

    }

    return true;

}


/* =====================================================
   PLAYER
===================================================== */

function updatePlayer() {

    if (game.mode !== "explore")
        return;

    let dx=0;
    let dy=0;

    const speed =
        keys.run ? 2.7 : 1.4;

    if (keys.up) {

        dy -= speed;
        player.direction="up";

    }

    if (keys.down) {

        dy += speed;
        player.direction="down";

    }

    if (keys.left) {

        dx -= speed;
        player.direction="left";

    }

    if (keys.right) {

        dx += speed;
        player.direction="right";

    }

    if (dx !== 0 && dy !== 0) {

        dx *= .707;
        dy *= .707;

    }

    if (
        canMove(
            player.x+dx,
            player.y
        )
    )
        player.x += dx;

    if (
        canMove(
            player.x,
            player.y+dy
        )
    )
        player.y += dy;

}


/* =====================================================
   FOLLOWERS
===================================================== */

function updateFollowers() {

    if (game.mode !== "explore")
        return;

    const targets=[

        {x:player.x-15,y:player.y},
        {x:player.x-30,y:player.y},
        {x:player.x-45,y:player.y},
        {x:player.x-60,y:player.y}

    ];

    followers.forEach(
        function(f,i) {

            const t=targets[i];

            const dx=t.x-f.x;
            const dy=t.y-f.y;

            const d=Math.sqrt(
                dx*dx+dy*dy
            );

            if (d>2) {

                f.x += dx*.08;
                f.y += dy*.08;

            }

        }
    );

}


/* =====================================================
   NPC
===================================================== */

function npcDistance() {

    const npc =
        rooms[game.room].npc;

    const dx =
        player.x-npc.x;

    const dy =
        player.y-npc.y;

    return Math.sqrt(
        dx*dx+dy*dy
    );

}


function updateNPC() {

    if (game.mode !== "explore")
        return;

    if (
        npcDistance()<25 &&
        keys.z &&
        !previous.z
    ) {

        startDialogue(
            rooms[game.room].npc.name
        );

    }

}


/* =====================================================
   DIALOGUE
===================================================== */

const dialogues = {

    "Странный человек":[

        "Эй...",

        "Дельта.",

        "Так это ты ведёшь этот отряд?",

        "Немка, Личи, Панкейк и Каштан.",

        "Интересная команда.",

        "Вам лучше идти дальше."

    ],

    "Таинственная девушка":[

        "Вы наконец пришли.",

        "Я ждала именно вас.",

        "Дельта...",

        "Ты ещё не знаешь, что происходит.",

        "Но скоро узнаешь."

    ]

};


function startDialogue(name) {

    if (!dialogues[name])
        return;

    game.mode="dialogue";

    game.dialogue =
        dialogues[name];

    game.dialogueIndex=0;

}


function updateDialogue() {

    if (game.mode !== "dialogue")
        return;

    if (
        keys.x &&
        !previous.x
    ) {

        closeDialogue();

        return;

    }

    if (
        keys.z &&
        !previous.z
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

    game.dialogue=null;

    game.dialogueIndex=0;

    game.mode="explore";

}


/* =====================================================
   EXIT
===================================================== */

function updateExit() {

    if (game.mode !== "explore")
        return;

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

        game.transition=20;

        if (game.room==="room1") {

            player.x=275;
            player.y=90;

        } else {

            player.x=30;
            player.y=90;

            if (
                !game.firstBattleDone
            ) {

                setTimeout(
                    startFirstBattle,
                    400
                );

            }

        }

    }

}


/* =====================================================
   FIRST BATTLE
===================================================== */

function startFirstBattle() {

    if (game.firstBattleDone)
        return;

    startBattle(true);

}


function startBattle(first=false) {

    game.mode="battle";

    game.battle={

        enemy:{

            name:"ТЕНЕВОЙ ЗВЕРЬ",

            hp:250,

            maxHP:250,

            attack:10,

            color:"#693a99"

        },

        phase:"menu",

        actor:0,

        menu:0,

        actIndex:0,

        message:
            first ?
            "Теневой зверь появился." :
            "Враг преграждает путь.",

        soul:{

            x:160,
            y:125,

            size:5,

            speed:2.5,

            damageCooldown:0

        },

        bullets:[],

        enemyTimer:0,

        firstBattle:first

    };

}


/* =====================================================
   BATTLE UPDATE
===================================================== */

function updateBattle() {

    const b =
        game.battle;

    if (!b)
        return;


    /* MENU */

    if (b.phase==="menu") {

        if (
            keys.up &&
            !previous.x
        ) {

            b.menu =
                (b.menu+3)%4;

        }

        if (
            keys.down &&
            !previous.x
        ) {

            b.menu =
                (b.menu+1)%4;

        }

        if (
            keys.left &&
            !previous.x
        ) {

            b.menu =
                b.menu===0 ?
                3 :
                b.menu-1;

        }

        if (
            keys.right &&
            !previous.x
        ) {

            b.menu =
                b.menu===3 ?
                0 :
                b.menu+1;

        }

        if (
            keys.z &&
            !previous.z
        ) {

            chooseBattleAction();

        }

    }


    /* ACT */

    else if (b.phase==="act") {

        if (
            keys.up &&
            !previous.z
        ) {

            b.actIndex--;

            if (b.actIndex<0)
                b.actIndex=2;

        }

        if (
            keys.down &&
            !previous.z
        ) {

            b.actIndex++;

            if (b.actIndex>2)
                b.actIndex=0;

        }

        if (
            keys.z &&
            !previous.z
        ) {

            doAct();

        }

        if (
            keys.x &&
            !previous.x
        ) {

            b.phase="menu";

        }

    }


    /* ITEM */

    else if (b.phase==="item") {

        if (
            keys.z &&
            !previous.z
        ) {

            const p =
                party[b.actor];

            p.hp =
                Math.min(
                    p.maxHP,
                    p.hp+35
                );

            b.message =
                p.name+
                " восстановил 35 HP.";

            nextTurn();

        }

        if (
            keys.x &&
            !previous.x
        ) {

            b.phase="menu";

        }

    }


    /* MERCY */

    else if (b.phase==="mercy") {

        if (
            keys.z &&
            !previous.z
        ) {

            if (
                b.enemy.hp<=60
            ) {

                b.enemy.hp=0;

                b.message=
                    "Враг отступил.";

                b.phase="victory";

            } else {

                b.message=
                    "Враг пока не хочет сдаваться.";

                nextTurn();

            }

        }

        if (
            keys.x &&
            !previous.x
        ) {

            b.phase="menu";

        }

    }


    /* DEFEND */

    else if (b.phase==="defend") {

        if (
            keys.z &&
            !previous.z
        ) {

            const p =
                party[b.actor];

            b.message =
                p.name+
                " защищается.";

            /*
              ВАЖНО:
              RD НЕ увеличивается.
            */

            nextTurn();

        }

        if (
            keys.x &&
            !previous.x
        ) {

            b.phase="menu";

        }

    }


    /* ENEMY */

    else if (b.phase==="enemy") {

        updateSoul();

        updateBullets();

        if (b.enemyTimer>0) {

            b.enemyTimer--;

        } else {

            endEnemyPhase();

        }

    }


    /* VICTORY */

    else if (b.phase==="victory") {

        if (
            keys.z &&
            !previous.z
        ) {

            game.mode="explore";

            game.battle=null;

        }

    }


    /* DEFEAT */

    else if (b.phase==="defeat") {

        if (
            keys.z &&
            !previous.z
        ) {

            resetParty();

            game.mode="explore";

            game.battle=null;

        }

    }

}


/* =====================================================
   CHOOSE ACTION
===================================================== */

function chooseBattleAction() {

    const b =
        game.battle;

    const actor =
        party[b.actor];


    if (b.menu===0) {

        const damage =
            actor.atk+
            Math.floor(
                Math.random()*7
            );

        b.enemy.hp -= damage;

        /*
           Атака увеличивает RD.
        */

        actor.rd =
            Math.min(
                actor.maxRD,
                actor.rd+20
            );

        b.message =
            actor.name+
            " атакует! -"+
            damage+
            " HP";

        nextTurn();

    }


    else if (b.menu===1) {

        b.phase="act";

        b.actIndex=0;

    }


    else if (b.menu===2) {

        b.phase="item";

    }


    else if (b.menu===3) {

        b.phase="mercy";

    }


    /* ЗАЩИТА */

    else if (b.menu===4) {

        b.phase="defend";

    }

}


/* =====================================================
   ACT
===================================================== */

function doAct() {

    const b =
        game.battle;

    const p =
        party[b.actor];

    if (b.actIndex===0) {

        b.message =
            "Теневой зверь внимательно смотрит.";

        /*
           ACT тоже немного заполняет RD.
        */

        p.rd =
            Math.min(
                p.maxRD,
                p.rd+12
            );

    }

    else if (b.actIndex===1) {

        b.message =
            "Зверь выглядит уставшим.";

        p.rd =
            Math.min(
                p.maxRD,
                p.rd+12
            );

    }

    else {

        b.message =
            "Дельта изучил противника.";

        p.rd =
            Math.min(
                p.maxRD,
                p.rd+12
            );

    }

    nextTurn();

}


/* =====================================================
   NEXT TURN
===================================================== */

function nextTurn() {

    const b =
        game.battle;

    if (b.enemy.hp<=0) {

        b.enemy.hp=0;

        b.phase="victory";

        game.firstBattleDone=true;

        return;

    }

    b.actor++;

    if (
        b.actor>=party.length
    ) {

        b.actor=0;

        startEnemyPhase();

    } else {

        b.phase="menu";

        b.menu=0;

        b.message=
            "Ход: "+
            party[b.actor].name;

    }

}


/* =====================================================
   ENEMY PHASE
===================================================== */

function startEnemyPhase() {

    const b =
        game.battle;

    b.phase="enemy";

    b.enemyTimer=420;

    b.bullets=[];

    b.soul.x=160;
    b.soul.y=125;

    for (
        let i=0;
        i<8;
        i++
    ) {

        b.bullets.push({

            x:
                55+
                Math.random()*210,

            y:
                -10-
                Math.random()*100,

            speed:
                1+
                Math.random()*1.6,

            size:4

        });

    }

}


/* =====================================================
   SOUL
===================================================== */

function updateSoul() {

    const b =
        game.battle;

    const s =
        b.soul;

    if (keys.up)
        s.y-=s.speed;

    if (keys.down)
        s.y+=s.speed;

    if (keys.left)
        s.x-=s.speed;

    if (keys.right)
        s.x+=s.speed;

    s.x=Math.max(
        65,
        Math.min(255,s.x)
    );

    s.y=Math.max(
        88,
        Math.min(155,s.y)
    );

    if (s.damageCooldown>0)
        s.damageCooldown--;

}


/* =====================================================
   BULLETS
===================================================== */

function updateBullets() {

    const b =
        game.battle;

    const s =
        b.soul;

    b.bullets.forEach(
        function(bullet) {

            bullet.y+=
                bullet.speed;

            if (
                bullet.y>165
            ) {

                bullet.y=-10;

                bullet.x=
                    55+
                    Math.random()*210;

            }

            const dx=
                bullet.x-s.x;

            const dy=
                bullet.y-s.y;

            const d=
                Math.sqrt(
                    dx*dx+
                    dy*dy
                );

            if (
                d<
                bullet.size+s.size
            ) {

                if (
                    s.damageCooldown<=0
                ) {

                    const p=
                        party[b.actor];

                    p.hp=
                        Math.max(
                            0,
                            p.hp-10
                        );

                    s.damageCooldown=40;

                    b.message=
                        p.name+
                        " получил 10 урона.";

                    checkDefeat();

                }

            }

        }
    );

}


/* =====================================================
   END ENEMY
===================================================== */

function endEnemyPhase() {

    const b=
        game.battle;

    b.actor=0;

    b.phase="menu";

    b.menu=0;

    b.message=
        "Ход: ДЕЛЬТА";

}


/* =====================================================
   DEFEAT
===================================================== */

function checkDefeat() {

    let alive=false;

    party.forEach(
        function(p) {

            if (p.hp>0)
                alive=true;

        }
    );

    if (!alive) {

        game.battle.phase=
            "defeat";

    }

}


function resetParty() {

    party.forEach(
        function(p) {

            p.hp=p.maxHP;

            p.rd=0;

        }
    );

}


/* =====================================================
   DRAW CHARACTER
===================================================== */

function drawCharacter(
    x,
    y,
    color
) {

    x=Math.round(x);
    y=Math.round(y);

    ctx.fillStyle="#000";

    ctx.fillRect(
        x-1,
        y-1,
        12,
        16
    );

    ctx.fillStyle=color;

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
        2
    );

    ctx.fillRect(
        x+6,
        y+13,
        3,
        2
    );

}


/* =====================================================
   DRAW ROOM
===================================================== */

function drawRoom() {

    const room =
        rooms[game.room];

    ctx.fillStyle=
        room.floor;

    ctx.fillRect(
        0,0,W,H
    );


    ctx.fillStyle="#252525";

    for (
        let y=10;
        y<172;
        y+=16
    ) {

        for (
            let x=10;
            x<312;
            x+=16
        ) {

            ctx.fillRect(
                x,y,1,1
            );

        }

    }


    ctx.fillStyle="#555";

    room.walls.forEach(
        function(w) {

            ctx.fillRect(
                w.x,
                w.y,
                w.w,
                w.h
            );

        }
    );


    ctx.fillStyle="#663333";

    ctx.fillRect(
        room.exit.x,
        room.exit.y,
        room.exit.w,
        room.exit.h
    );


    /* SAVE TABLE */

    if (room.savePoint) {

        const p=
            room.savePoint;

        /* table */

        ctx.fillStyle="#57351f";

        ctx.fillRect(
            p.x,
            p.y,
            p.w,
            p.h
        );

        /* pizza */

        ctx.fillStyle="#d99b43";

        ctx.fillRect(
            p.x+7,
            p.y+4,
            16,
            10
        );

        ctx.fillStyle="#b83225";

        ctx.fillRect(
            p.x+10,
            p.y+5,
            3,
            3
        );

        ctx.fillRect(
            p.x+17,
            p.y+9,
            3,
            3
        );

        ctx.fillStyle="#fff";

        ctx.font="5px monospace";

        ctx.fillText(
            "SAVE",
            p.x+5,
            p.y-3
        );

    }

}


/* =====================================================
   EXPLORE
===================================================== */

function drawExplore() {

    drawRoom();

    const npc=
        rooms[game.room].npc;

    drawCharacter(
        npc.x,
        npc.y,
        npc.color
    );


    followers.forEach(
        function(f) {

            drawCharacter(
                f.x,
                f.y,
                f.color
            );

        }
    );


    drawCharacter(
        player.x,
        player.y,
        "#fff"
    );


    ctx.fillStyle="#fff";

    ctx.font="6px monospace";

    ctx.fillText(
        rooms[game.room].name,
        12,
        18
    );


    if (
        nearSavePoint()
    ) {

        ctx.fillStyle="#000";

        ctx.fillRect(
            80,
            142,
            160,
            20
        );

        ctx.strokeStyle="#fff";

        ctx.strokeRect(
            80,
            142,
            160,
            20
        );

        ctx.fillStyle="#fff";

        ctx.fillText(
            "Z — СОХРАНИТЬ",
            112,
            154
        );

    }
    else if (
        npcDistance()<25
    ) {

        ctx.fillStyle="#000";

        ctx.fillRect(
            95,
            145,
            130,
            18
        );

        ctx.strokeStyle="#fff";

        ctx.strokeRect(
            95,
            145,
            130,
            18
        );

        ctx.fillStyle="#fff";

        ctx.fillText(
            "Z — ГОВОРИТЬ",
            115,
            156
        );

    }

}


/* =====================================================
   TEXT
===================================================== */

function drawWrappedText(
    text,
    x,
    y,
    maxWidth,
    lineHeight
) {

    const words=
        text.split(" ");

    let line="";

    for (
        let i=0;
        i<words.length;
        i++
    ) {

        const test=
            line+
            words[i]+" ";

        if (
            ctx.measureText(test).width>
            maxWidth &&
            i>0
        ) {

            ctx.fillText(
                line,
                x,
                y
            );

            line=
                words[i]+" ";

            y+=lineHeight;

        } else {

            line=test;

        }

    }

    ctx.fillText(
        line,
        x,
        y
    );

}


/* =====================================================
   DIALOGUE
===================================================== */

function drawDialogue() {

    ctx.fillStyle=
        "rgba(0,0,0,.55)";

    ctx.fillRect(
        0,0,W,H
    );


    ctx.fillStyle="#000";

    ctx.fillRect(
        12,
        112,
        296,
        55
    );


    ctx.strokeStyle="#fff";

    ctx.lineWidth=2;

    ctx.strokeRect(
        12,
        112,
        296,
        55
    );


    ctx.fillStyle="#fff";

    ctx.font="7px monospace";

    drawWrappedText(
        game.dialogue[
            game.dialogueIndex
        ],
        23,
        132,
        270,
        10
    );


    ctx.font="6px monospace";

    ctx.fillText(
        "Z — далее",
        230,
        157
    );

}


/* =====================================================
   BATTLE DRAW
===================================================== */

function drawBattle() {

    const b=
        game.battle;


    ctx.fillStyle="#050505";

    ctx.fillRect(
        0,0,W,H
    );


    /*
       ВРАГ СПРАВА
    */

    ctx.strokeStyle="#777";

    ctx.strokeRect(
        170,
        10,
        135,
        65
    );


    drawEnemy(
        238,
        42,
        b.enemy.color
    );


    ctx.fillStyle="#fff";

    ctx.font="6px monospace";

    ctx.fillText(
        b.enemy.name,
        178,
        21
    );

    ctx.fillText(
        "HP "+
        b.enemy.hp+
        "/"+
        b.enemy.maxHP,
        178,
        31
    );

    drawHPBar(
        178,
        36,
        65,
        6,
        b.enemy.hp,
        b.enemy.maxHP
    );


    /*
       СООБЩЕНИЕ
    */

    ctx.fillStyle="#fff";

    ctx.font="6px monospace";

    drawWrappedText(
        b.message,
        20,
        82,
        130,
        8
    );


    /*
       БОЕВАЯ ОБЛАСТЬ
    */

    if (b.phase==="enemy") {

        drawEnemyBox();

    }


    /*
       ОТРЯД СЛЕВА
    */

    drawBattleParty();


    /*
       МЕНЮ
    */

    drawBattleMenu();


    /*
       VICTORY
    */

    if (
        b.phase==="victory"
    ) {

        ctx.fillStyle="#fff";

        ctx.font="11px monospace";

        ctx.fillText(
            "ПОБЕДА!",
            112,
            105
        );

        ctx.font="6px monospace";

        ctx.fillText(
            "Z — продолжить",
            102,
            120
        );

    }


    /*
       DEFEAT
    */

    if (
        b.phase==="defeat"
    ) {

        ctx.fillStyle="#fff";

        ctx.font="9px monospace";

        ctx.fillText(
            "ОТРЯД ПОБЕЖДЁН",
            82,
            105
        );

        ctx.font="6px monospace";

        ctx.fillText(
            "Z — восстановиться",
            95,
            120
        );

    }

}


/* =====================================================
   ENEMY
===================================================== */

function drawEnemy(
    x,
    y,
    color
) {

    ctx.fillStyle="#000";

    ctx.fillRect(
        x-18,
        y-22,
        36,
        44
    );

    ctx.fillStyle=color;

    ctx.fillRect(
        x-14,
        y-18,
        28,
        32
    );

    ctx.fillStyle="#fff";

    ctx.fillRect(
        x-8,
        y-8,
        5,
        5
    );

    ctx.fillRect(
        x+3,
        y-8,
        5,
        5
    );

}


/* =====================================================
   HP
===================================================== */

function drawHPBar(
    x,
    y,
    w,
    h,
    hp,
    max
) {

    ctx.fillStyle="#222";

    ctx.fillRect(
        x,y,w,h
    );

    const amount=
        Math.max(
            0,
            Math.min(
                1,
                hp/max
            )
        );

    ctx.fillStyle="#fff";

    ctx.fillRect(
        x,
        y,
        w*amount,
        h
    );

}


/* =====================================================
   RD BAR
===================================================== */

function drawRDBar(
    x,
    y,
    h,
    value
) {

    /*
       Вертикальная шкала RD.
       Чем больше действий —
       тем выше заполнение.
    */

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        x,
        y,
        7,
        h
    );


    const amount=
        Math.max(
            0,
            Math.min(
                1,
                value/100
            )
        );


    ctx.fillStyle="#fff";

    ctx.fillRect(
        x+2,
        y+h-2-
        (h-4)*amount,
        3,
        (h-4)*amount
    );


    ctx.font="5px monospace";

    ctx.save();

    ctx.translate(
        x+14,
        y+h
    );

    ctx.rotate(
        -Math.PI/2
    );

    ctx.fillText(
        "RD",
        0,
        0
    );

    ctx.restore();

}


/* =====================================================
   BATTLE PARTY
===================================================== */

function drawBattleParty() {

    /*
       Имена слева.
       Стрелка теперь непосредственно
       возле имени текущего персонажа.
    */

    party.forEach(
        function(p,i) {

            const y=
                96+i*15;


            if (
                i===
                game.battle.actor &&
                game.battle.phase!=="enemy"
            ) {

                ctx.fillStyle="#fff";

                ctx.font="6px monospace";

                ctx.fillText(
                    "▶",
                    4,
                    y
                );

            }


            ctx.fillStyle=
                p.color;

            ctx.font="5.5px monospace";

            ctx.fillText(
                p.name,
                12,
                y
            );


            ctx.fillStyle="#fff";

            ctx.fillText(
                "HP",
                58,
                y
            );


            drawHPBar(
                70,
                y-5,
                34,
                5,
                p.hp,
                p.maxHP
            );


            ctx.fillText(
                p.hp+
                "/"+
                p.maxHP,
                108,
                y
            );


            /*
               RD каждого героя
            */

            drawRDBar(
                137,
                y-11,
                13,
                p.rd
            );

        }
    );

}


/* =====================================================
   BATTLE MENU
===================================================== */

function drawBattleMenu() {

    const b=
        game.battle;


    if (
        b.phase==="menu"
    ) {

        const labels=[

            "АТАКА",
            "ACT",
            "ITEM",
            "ЗАЩИТА"

        ];


        labels.forEach(
            function(label,i) {

                const x=
                    168+
                    (i%2)*68;

                const y=
                    110+
                    Math.floor(i/2)*23;


                if (
                    i===b.menu
                ) {

                    ctx.strokeStyle="#fff";

                    ctx.strokeRect(
                        x-5,
                        y-9,
                        60,
                        16
                    );

                }


                ctx.fillStyle="#fff";

                ctx.font=
                    "6px monospace";

                ctx.fillText(
                    label,
                    x,
                    y+2
                );

            }
        );

    }


    if (
        b.phase==="act"
    ) {

        ctx.fillStyle="#fff";

        ctx.font="6px monospace";

        ctx.fillText(
            "ACT",
            180,
            103
        );


        const acts=[

            "ПОГОВОРИТЬ",
            "ОСМОТРЕТЬ",
            "НАБЛЮДАТЬ"

        ];


        acts.forEach(
            function(a,i) {

                if (
                    i===b.actIndex
                ) {

                    ctx.fillText(
                        "▶",
                        178,
                        118+i*12
                    );

                }

                ctx.fillText(
                    a,
                    190,
                    118+i*12
                );

            }
        );


        ctx.fillText(
            "X — назад",
            190,
            156
        );

    }


    if (
        b.phase==="item"
    ) {

        ctx.fillStyle="#fff";

        ctx.font="6px monospace";

        ctx.fillText(
            "ITEM",
            180,
            105
        );

        ctx.fillText(
            "▶ POTION +35 HP",
            180,
            121
        );

        ctx.fillText(
            "X — назад",
            190,
            150
        );

    }


    if (
        b.phase==="mercy"
    ) {

        ctx.fillStyle="#fff";

        ctx.font="6px monospace";

        ctx.fillText(
            "MERCY",
            180,
            105
        );

        ctx.fillText(
            "▶ ПОЩАДИТЬ",
            180,
            121
        );

        ctx.fillText(
            "X — назад",
            190,
            150
        );

    }


    if (
        b.phase==="defend"
    ) {

        ctx.fillStyle="#fff";

        ctx.font="6px monospace";

        ctx.fillText(
            "ЗАЩИТА",
            180,
            105
        );

        ctx.fillText(
            "▶ ЗАЩИЩАТЬСЯ",
            180,
            121
        );

        ctx.fillText(
            "RD НЕ РАСТЁТ",
            180,
            135
        );

        ctx.fillText(
            "Z — выбрать",
            180,
            150
        );

    }

}


/* =====================================================
   ENEMY ATTACK BOX
===================================================== */

function drawEnemyBox() {

    const b=
        game.battle;

    ctx.strokeStyle="#fff";

    ctx.strokeRect(
        50,
        88,
        105,
        72
    );


    b.bullets.forEach(
        function(bullet) {

            ctx.fillStyle="#fff";

            ctx.fillRect(
                bullet.x-2,
                bullet.y-2,
                4,
                4
            );

        }
    );


    ctx.fillStyle="#fff";

    ctx.fillRect(
        b.soul.x-3,
        b.soul.y-3,
        6,
        6
    );

}


/* =====================================================
   MAIN MENU
===================================================== */

function updateMainMenu() {

    if (
        keys.up &&
        !previous.z
    ) {

        game.menuIndex--;

        if (game.menuIndex<0)
            game.menuIndex=2;

    }

    if (
        keys.down &&
        !previous.z
    ) {

        game.menuIndex++;

        if (game.menuIndex>2)
            game.menuIndex=0;

    }

    if (
        keys.z &&
        !previous.z
    ) {

        if (game.menuIndex===0) {

            game.mode="explore";

        }

        else if (
            game.menuIndex===1
        ) {

            game.mode="saveMenu";

        }

        else {

            game.mode="credits";

        }

    }

}


/* =====================================================
   SAVE MENU
===================================================== */

function updateSaveMenu() {

    if (
        keys.up &&
        !previous.z
    ) {

        game.saveSlot--;

        if (game.saveSlot<0)
            game.saveSlot=2;

    }

    if (
        keys.down &&
        !previous.z
    ) {

        game.saveSlot++;

        if (game.saveSlot>2)
            game.saveSlot=0;

    }


    if (
        keys.z &&
        !previous.z
    ) {

        if (
            hasSave(game.saveSlot)
        ) {

            loadGame(
                game.saveSlot
            );

            game.mode="explore";

        } else {

            saveGame(
                game.saveSlot
            );

            game.mode="explore";

        }

    }


    if (
        keys.x &&
        !previous.x
    ) {

        game.mode="title";

    }

}


/* =====================================================
   TITLE DRAW
===================================================== */

function drawTitle() {

    ctx.fillStyle="#000";

    ctx.fillRect(
        0,0,W,H
    );


    ctx.fillStyle="#fff";

    ctx.font="16px monospace";

    ctx.fillText(
        "BLOOD GLOW",
        87,
        45
    );


    ctx.font="7px monospace";

    ctx.fillText(
        "A PIXEL RPG",
        125,
        58
    );


    const items=[

        "НАЧАТЬ ИГРУ",
        "СОХРАНЕНИЯ",
        "ВЫХОД"

    ];


    items.forEach(
        function(item,i) {

            const y=
                88+i*20;


            if (
                i===game.menuIndex
            ) {

                ctx.fillText(
                    "▶",
                    95,
                    y
                );

            }

            ctx.fillText(
                item,
                110,
                y
            );

        }
    );


    ctx.font="5px monospace";

    ctx.fillText(
        "Z — выбрать",
        125,
        155
    );

}


/* =====================================================
   TITLE UPDATE
===================================================== */

function updateTitle() {

    if (
        keys.up &&
        !previous.z
    ) {

        game.menuIndex--;

        if (game.menuIndex<0)
            game.menuIndex=2;

    }


    if (
        keys.down &&
        !previous.z
    ) {

        game.menuIndex++;

        if (game.menuIndex>2)
            game.menuIndex=0;

    }


    if (
        keys.z &&
        !previous.z
    ) {

        if (game.menuIndex===0) {

            game.mode="explore";

        }

        else if (
            game.menuIndex===1
        ) {

            game.mode="saveMenu";

        }

        else {

            game.mode="credits";

        }

    }

}


/* =====================================================
   SAVE MENU DRAW
===================================================== */

function drawSaveMenu() {

    ctx.fillStyle="#000";

    ctx.fillRect(
        0,0,W,H
    );


    ctx.fillStyle="#fff";

    ctx.font="11px monospace";

    ctx.fillText(
        "СОХРАНЕНИЯ",
        90,
        30
    );


    for (
        let i=0;
        i<3;
        i++
    ) {

        const y=
            60+i*30;


        if (
            i===game.saveSlot
        ) {

            ctx.fillText(
                "▶",
                55,
                y
            );

        }


        ctx.font="7px monospace";

        ctx.fillText(
            "ФАЙЛ "+(i+1),
            70,
            y
        );


        ctx.fillText(
            hasSave(i) ?
            "СОХРАНЕНО" :
            "ПУСТО",
            160,
            y
        );

    }


    ctx.font="6px monospace";

    ctx.fillText(
        "Z — загрузить / создать",
        75,
        145
    );

    ctx.fillText(
        "X — назад",
        120,
        157
    );

}


/* =====================================================
   CREDITS
===================================================== */

function drawCredits() {

    ctx.fillStyle="#000";

    ctx.fillRect(
        0,0,W,H
    );

    ctx.fillStyle="#fff";

    ctx.font="10px monospace";

    ctx.fillText(
        "BLOOD GLOW RPG",
        92,
        45
    );

    ctx.font="6px monospace";

    ctx.fillText(
        "ДЕЛЬТА",
        130,
        70
    );

    ctx.fillText(
        "НЕМКА • ЛИЧИ",
        110,
        82
    );

    ctx.fillText(
        "ПАНКЕЙК • КАШТАН",
        100,
        94
    );

    ctx.fillText(
        "Z — назад",
        120,
        145
    );

}


/* =====================================================
   UPDATE
===================================================== */

function update() {

    if (
        game.mode==="title"
    ) {

        updateTitle();

    }

    else if (
        game.mode==="saveMenu"
    ) {

        updateSaveMenu();

    }

    else if (
        game.mode==="credits"
    ) {

        if (
            keys.z &&
            !previous.z
        )
            game.mode="title";

    }

    else if (
        game.mode==="explore"
    ) {

        updatePlayer();

        updateFollowers();

        updateNPC();

        updateExit();


        if (
            nearSavePoint() &&
            keys.z &&
            !previous.z
        ) {

            useSavePoint();

        }

        if (
            keys.c &&
            !previous.c
        ) {

            game.mode="title";

        }

    }

    else if (
        game.mode==="dialogue"
    ) {

        updateDialogue();

    }

    else if (
        game.mode==="battle"
    ) {

        updateBattle();

    }


    previous.z=keys.z;
    previous.x=keys.x;
    previous.c=keys.c;

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


    if (
        game.mode==="title"
    ) {

        drawTitle();

    }

    else if (
        game.mode==="saveMenu"
    ) {

        drawSaveMenu();

    }

    else if (
        game.mode==="credits"
    ) {

        drawCredits();

    }

    else if (
        game.mode==="battle"
    ) {

        drawBattle();

    }

    else {

        drawExplore();

        if (
            game.mode==="dialogue"
        ) {

            drawDialogue();

        }

    }


    if (
        game.transition>0
    ) {

        ctx.fillStyle="#000";

        ctx.globalAlpha=
            game.transition/20;

        ctx.fillRect(
            0,0,W,H
        );

        ctx.globalAlpha=1;

        game.transition--;

    }

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
