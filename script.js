"use strict";

/* =========================================================
   CANVAS
========================================================= */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const W = 480;
const H = 270;

ctx.imageSmoothingEnabled = false;


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

function press(key) {
    if (!keys[key]) {
        pressed[key] = true;
    }

    keys[key] = true;
}

function release(key) {
    keys[key] = false;
}


/* клавиатура */

window.addEventListener("keydown", e => {

    let key = null;

    if (e.key === "ArrowUp" || e.key.toLowerCase() === "w")
        key = "up";

    if (e.key === "ArrowDown" || e.key.toLowerCase() === "s")
        key = "down";

    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a")
        key = "left";

    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d")
        key = "right";

    if (e.key.toLowerCase() === "z")
        key = "z";

    if (e.key.toLowerCase() === "x")
        key = "x";

    if (e.key.toLowerCase() === "c")
        key = "c";

    if (key) {
        e.preventDefault();
        press(key);
    }
}, {passive:false});


window.addEventListener("keyup", e => {

    let key = null;

    if (e.key === "ArrowUp" || e.key.toLowerCase() === "w")
        key = "up";

    if (e.key === "ArrowDown" || e.key.toLowerCase() === "s")
        key = "down";

    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a")
        key = "left";

    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d")
        key = "right";

    if (e.key.toLowerCase() === "z")
        key = "z";

    if (e.key.toLowerCase() === "x")
        key = "x";

    if (e.key.toLowerCase() === "c")
        key = "c";

    if (key) {
        e.preventDefault();
        release(key);
    }
}, {passive:false});


/* телефон */

document.querySelectorAll("[data-key]").forEach(button => {

    const key = button.dataset.key;

    button.addEventListener("pointerdown", e => {
        e.preventDefault();

        press(key);

        try {
            button.setPointerCapture(e.pointerId);
        } catch {}
    });

    button.addEventListener("pointerup", e => {
        e.preventDefault();
        release(key);
    });

    button.addEventListener("pointercancel", () => {
        release(key);
    });

    button.addEventListener("pointerleave", () => {
        release(key);
    });
});


/* =========================================================
   FULLSCREEN
========================================================= */

document.getElementById("fullscreen").addEventListener(
    "pointerdown",
    async e => {

        e.preventDefault();

        try {

            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }

        } catch {}
    }
);


/* =========================================================
   GAME STATE
========================================================= */

const game = {

    state: "title",

    scene: "room",

    dialogue: null,
    dialogueIndex: 0,

    menuIndex: 0,

    transition: 0,

    firstBattleFinished: false,

    encounterTimer: 0,

    battle: null
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
        color: "#ffffff"
    },

    {
        name: "ЛИЧИ",
        hp: 80,
        maxHP: 80,
        atk: 13,
        def: 6,
        color: "#55aaff"
    },

    {
        name: "ПАНКЕЙК",
        hp: 70,
        maxHP: 70,
        atk: 10,
        def: 11,
        color: "#55dd77"
    },

    {
        name: "КАШТАН",
        hp: 110,
        maxHP: 110,
        atk: 12,
        def: 12,
        color: "#cc8844"
    },

    {
        name: "ШАРЛОТА",
        hp: 100,
        maxHP: 100,
        atk: 13,
        def: 10,
        color: "#dd66cc"
    }

];


/* =========================================================
   PLAYER
========================================================= */

const player = {

    x: 240,
    y: 150,

    speed: 1.5,

    w: 12,
    h: 16,

    direction: "down"
};


/* =========================================================
   TEAM
========================================================= */

const team = [

    {x:220, y:150, color:"#55aaff"},
    {x:202, y:150, color:"#55dd77"},
    {x:184, y:150, color:"#cc8844"},
    {x:166, y:150, color:"#dd66cc"}

];


/* =========================================================
   TITLE
========================================================= */

function updateTitle() {

    if (pressed.z) {

        game.state = "intro";

    }

}


/* =========================================================
   INTRO
========================================================= */

function updateIntro() {

    if (pressed.z) {

        game.state = "dialogue";

        game.dialogue = [
            "Личи: Надо проверить Немку...",
            "Личи: Она изменилась.",
            "Личи: Последний раз, когда мы пытались поговорить с ней, она была странной.",
            "Дельта: Так мы идём?",
            "Личи: Да."
        ];

        game.dialogueIndex = 0;

    }

}


/* =========================================================
   DIALOGUE
========================================================= */

function updateDialogue() {

    if (pressed.z) {

        game.dialogueIndex++;

        if (
            game.dialogueIndex >=
            game.dialogue.length
        ) {

            game.state = "wasteland";

            player.x = 240;
            player.y = 130;

            team[0].x = 215;
            team[0].y = 130;

            team[1].x = 195;
            team[1].y = 130;

            team[2].x = 175;
            team[2].y = 130;

            team[3].x = 155;
            team[3].y = 130;
        }
    }

}


/* =========================================================
   WASTELAND
========================================================= */

function updateWasteland() {

    let dx = 0;
    let dy = 0;

    if (keys.up) {
        dy -= player.speed;
        player.direction = "up";
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

    if (dx && dy) {
        dx *= .707;
        dy *= .707;
    }

    player.x += dx;
    player.y += dy;

    player.x = Math.max(20, Math.min(460, player.x));
    player.y = Math.max(40, Math.min(235, player.y));


    /* команда идёт за Дельтой */

    team.forEach((member, i) => {

        const targetX =
            player.x - 20 - i * 18;

        const targetY =
            player.y;

        member.x +=
            (targetX - member.x) * .08;

        member.y +=
            (targetY - member.y) * .08;
    });


    /* случайные встречи */

    game.encounterTimer++;

    /*
       Встречи не происходят каждые пару шагов.
       После движения должно пройти довольно
       много времени.
    */

    if (
        game.encounterTimer > 900 &&
        Math.random() < 0.003
    ) {

        game.encounterTimer = 0;

        startBattle();

    }


    /* X пропускает движение */

    if (pressed.x) {

        player.x += 25;

    }


    /* C — меню */

    if (pressed.c) {

        game.state = "menu";

    }

}


/* =========================================================
   MENU
========================================================= */

function updateMenu() {

    if (pressed.x) {

        game.state = "wasteland";
        return;

    }

    if (pressed.up) {

        game.menuIndex--;

        if (game.menuIndex < 0)
            game.menuIndex = 2;

    }

    if (pressed.down) {

        game.menuIndex++;

        if (game.menuIndex > 2)
            game.menuIndex = 0;

    }

}


/* =========================================================
   BATTLE
========================================================= */

function startBattle() {

    const amount =
        Math.random() < .55 ? 1 : 2;

    game.state = "battle";

    game.battle = {

        enemyCount: amount,

        enemies: [],

        phase: "menu",

        menu: 0,

        actor: 0,

        rd: 0,

        maxRD: 100,

        message: "ОШИБКА СИСТЕМЫ появилась перед вами.",

        soul: {
            x: 240,
            y: 190,
            size: 5,
            speed: 2.5,
            invincible: 0
        },

        attackTimer: 0,

        lasers: [],

        explosions: [],

        attackLength: 0

    };


    for (let i = 0; i < amount; i++) {

        game.battle.enemies.push({

            x: 170 + i * 140,
            y: 70,

            hp: 55,
            maxHP: 55
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


    /* меню */

    if (b.phase === "menu") {

        if (pressed.left) {

            b.menu--;

            if (b.menu < 0)
                b.menu = 3;

        }

        if (pressed.right) {

            b.menu++;

            if (b.menu > 3)
                b.menu = 0;

        }

        if (pressed.z) {

            if (b.menu === 0) {

                /* FIGHT */

                b.phase = "fight";

            }

            else if (b.menu === 1) {

                /* ACT */

                b.message =
                    "ДЕЛЬТА пытается понять структуру ошибки.";

                b.rd =
                    Math.min(
                        b.maxRD,
                        b.rd + 12
                    );

                nextActor();

            }

            else if (b.menu === 2) {

                /* ITEM */

                party[b.actor].hp =
                    Math.min(
                        party[b.actor].maxHP,
                        party[b.actor].hp + 20
                    );

                b.message =
                    party[b.actor].name +
                    " восстановил немного HP.";

                nextActor();

            }

            else if (b.menu === 3) {

                /*
                   ЗАЩИТА

                   Главное:
                   RD увеличивается именно
                   от защиты.
                */

                b.rd =
                    Math.min(
                        b.maxRD,
                        b.rd + 25
                    );

                b.message =
                    party[b.actor].name +
                    " встал в защиту. RD +25.";

                nextActor();

            }

        }

        return;
    }


    /* FIGHT */

    if (b.phase === "fight") {

        if (pressed.z) {

            const enemy =
                b.enemies[0];

            const damage =
                party[b.actor].atk +
                Math.floor(Math.random() * 6);

            enemy.hp -= damage;

            b.message =
                party[b.actor].name +
                " атакует!  -" +
                damage +
                " HP";

            /*
               От удара RD НЕ растёт.
            */

            if (enemy.hp <= 0) {

                enemy.hp = 0;

                b.enemies.shift();

            }

            if (b.enemies.length === 0) {

                b.phase = "victory";

            }
            else {

                nextActor();

            }

        }

        if (pressed.x) {

            b.phase = "menu";

        }

        return;
    }


    /* атака врага */

    if (b.phase === "enemy") {

        updateEnemyAttack();

        return;
    }


    /* победа */

    if (b.phase === "victory") {

        if (pressed.z) {

            game.firstBattleFinished = true;

            game.state = "wasteland";

            game.battle = null;

        }

        return;
    }


    /* поражение */

    if (b.phase === "defeat") {

        if (pressed.z) {

            party.forEach(p => {
                p.hp = p.maxHP;
            });

            game.state = "wasteland";
            game.battle = null;

        }

    }

}


/* =========================================================
   NEXT ACTOR
========================================================= */

function nextActor() {

    const b = game.battle;

    b.actor++;

    if (b.actor >= party.length) {

        b.actor = 0;

        startEnemyAttack();

    }

}


/* =========================================================
   ENEMY ATTACK
========================================================= */

function startEnemyAttack() {

    const b = game.battle;

    b.phase = "enemy";

    b.attackTimer = 0;

    b.attackLength = 500;

    b.lasers = [];

    b.explosions = [];


    if (b.enemyCount === 1) {

        /*
           Один глитч = лазер.
        */

        b.lasers.push({

            x: 100 + Math.random() * 280,

            warning: 80,

            active: 0

        });

    }

    else {

        /*
           Несколько глитчей = взрывы.
        */

        for (let i = 0; i < 6; i++) {

            b.explosions.push({

                x: 90 + Math.random() * 300,

                y: 150 + Math.random() * 65,

                timer: i * 45

            });

        }

    }

}


/* =========================================================
   ENEMY ATTACK UPDATE
========================================================= */

function updateEnemyAttack() {

    const b = game.battle;

    b.attackTimer++;


    /* движение души */

    const s = b.soul;

    if (keys.up)
        s.y -= s.speed;

    if (keys.down)
        s.y += s.speed;

    if (keys.left)
        s.x -= s.speed;

    if (keys.right)
        s.x += s.speed;


    s.x = Math.max(70, Math.min(410, s.x));
    s.y = Math.max(135, Math.min(225, s.y));


    if (s.invincible > 0)
        s.invincible--;


    /* лазер */

    b.lasers.forEach(laser => {

        if (laser.warning > 0) {

            laser.warning--;

        }
        else {

            laser.active++;

            const distance =
                Math.abs(s.x - laser.x);

            if (
                distance < 7 &&
                s.invincible <= 0
            ) {

                hurtSoul();

            }

        }

    });


    /* взрывы */

    b.explosions.forEach(explosion => {

        if (explosion.timer > 0) {

            explosion.timer--;
            return;

        }

        const dx =
            s.x - explosion.x;

        const dy =
            s.y - explosion.y;

        const distance =
            Math.sqrt(dx * dx + dy * dy);


        if (
            distance < 28 &&
            s.invincible <= 0
        ) {

            hurtSoul();

        }

    });


    if (
        b.attackTimer >=
        b.attackLength
    ) {

        b.phase = "menu";

        b.message =
            "ОШИБКА системы отступила.";

    }

}


/* =========================================================
   DAMAGE
========================================================= */

function hurtSoul() {

    const b = game.battle;

    b.soul.invincible = 45;

    const target = party[b.actor];

    target.hp -= 8;

    b.message =
        target.name +
        " получил 8 урона!";

    if (target.hp <= 0) {

        target.hp = 0;

        let alive = false;

        party.forEach(p => {

            if (p.hp > 0)
                alive = true;

        });

        if (!alive) {

            b.phase = "defeat";

        }

    }

}


/* =========================================================
   DRAW TITLE
========================================================= */

function drawTitle() {

    ctx.fillStyle = "#050509";
    ctx.fillRect(0,0,W,H);

    ctx.fillStyle = "#ffffff";
    ctx.font = "30px monospace";

    ctx.textAlign = "center";

    ctx.fillText(
        "BLOOD GLOW",
        W / 2,
        85
    );

    ctx.font = "12px monospace";

    ctx.fillText(
        "DIGITAL WORLD",
        W / 2,
        110
    );

    ctx.font = "11px monospace";

    ctx.fillText(
        "Z — НАЧАТЬ",
        W / 2,
        180
    );

    ctx.font = "8px monospace";

    ctx.fillText(
        "WASD / СТРЕЛКИ — движение",
        W / 2,
        205
    );

    ctx.fillText(
        "C — меню",
        W / 2,
        218
    );

    ctx.textAlign = "left";
}


/* =========================================================
   DRAW INTRO
========================================================= */

function drawIntro() {

    ctx.fillStyle = "#090b12";
    ctx.fillRect(0,0,W,H);

    ctx.fillStyle = "#151a27";

    for (let i=0;i<30;i++) {

        ctx.fillRect(
            (i*83)%W,
            30 + ((i*47)%190),
            2,
            2
        );

    }

    drawPlayer(
        230,
        125,
        "#ffffff"
    );

    ctx.fillStyle = "#ffffff";
    ctx.font = "9px monospace";
    ctx.textAlign = "center";

    ctx.fillText(
        "ДЕЛЬТА просыпается в цифровом мире.",
        W/2,
        60
    );

    ctx.fillText(
        "Где-то впереди уже ждёт команда.",
        W/2,
        75
    );

    ctx.fillText(
        "Z — продолжить",
        W/2,
        220
    );

    ctx.textAlign = "left";
}


/* =========================================================
   DRAW WASTELAND
========================================================= */

function drawWasteland() {

    ctx.fillStyle = "#11151b";
    ctx.fillRect(0,0,W,H);


    /* цифровая пустошь */

    for (let y=35;y<250;y+=22) {

        for (let x=0;x<W;x+=24) {

            ctx.fillStyle =
                ((x+y)/24)%2 === 0
                    ? "#161c22"
                    : "#13181e";

            ctx.fillRect(
                x,
                y,
                18,
                1
            );

        }

    }


    /* глитчи */

    for (let i=0;i<22;i++) {

        const x =
            (i * 97) % W;

        const y =
            50 + ((i * 53) % 180);

        ctx.fillStyle =
            i%3===0
                ? "#27384a"
                : "#202830";

        ctx.fillRect(
            x,
            y,
            5 + i%9,
            2
        );

    }


    /* команда */

    team.forEach(member => {

        drawPlayer(
            member.x,
            member.y,
            member.color
        );

    });


    drawPlayer(
        player.x,
        player.y,
        "#ffffff"
    );


    ctx.fillStyle = "#ffffff";
    ctx.font = "8px monospace";

    ctx.fillText(
        "ЦИФРОВАЯ ПУСТОШЬ",
        15,
        22
    );


    ctx.font = "7px monospace";

    ctx.fillStyle = "#aaa";

    ctx.fillText(
        "Идите вперёд...",
        15,
        35
    );


    /* подсказка */

    if (
        Math.floor(game.encounterTimer / 30) % 2 === 0
    ) {

        ctx.fillStyle = "#777";

        ctx.fillText(
            "C — МЕНЮ",
            15,
            255
        );

    }

}


/* =========================================================
   DRAW PLAYER
========================================================= */

function drawPlayer(x,y,color) {

    x = Math.round(x);
    y = Math.round(y);

    ctx.fillStyle = "#000";

    ctx.fillRect(
        x-2,
        y-2,
        16,
        20
    );

    ctx.fillStyle = color;

    ctx.fillRect(
        x+2,
        y,
        8,
        7
    );

    ctx.fillRect(
        x+1,
        y+7,
        10,
        9
    );

    ctx.fillRect(
        x+1,
        y+16,
        3,
        3
    );

    ctx.fillRect(
        x+7,
        y+16,
        3,
        3
    );

}


/* =========================================================
   DRAW DIALOGUE
========================================================= */

function drawDialogue() {

    drawWasteland();

    ctx.fillStyle = "rgba(0,0,0,.7)";
    ctx.fillRect(0,0,W,H);


    ctx.fillStyle = "#000";
    ctx.fillRect(
        25,
        160,
        430,
        80
    );

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;

    ctx.strokeRect(
        25,
        160,
        430,
        80
    );


    ctx.fillStyle = "#fff";

    ctx.font = "10px monospace";

    drawTextWrapped(
        game.dialogue[game.dialogueIndex],
        45,
        190,
        390,
        14
    );


    ctx.font = "7px monospace";

    ctx.fillText(
        "Z — продолжить",
        45,
        225
    );

}


/* =========================================================
   TEXT
========================================================= */

function drawTextWrapped(text,x,y,maxWidth,lineHeight) {

    const words = text.split(" ");

    let line = "";

    for (let word of words) {

        const test =
            line + word + " ";

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


/* =========================================================
   BATTLE DRAW
========================================================= */

function drawBattle() {

    const b = game.battle;

    ctx.fillStyle = "#000";
    ctx.fillRect(0,0,W,H);


    /* враги */

    b.enemies.forEach(enemy => {

        drawGlitchEnemy(
            enemy.x,
            enemy.y
        );

    });


    ctx.fillStyle = "#fff";
    ctx.font = "9px monospace";

    ctx.fillText(
        "ОШИБКА СИСТЕМЫ",
        25,
        22
    );


    /* сообщение */

    ctx.fillStyle = "#fff";

    ctx.font = "8px monospace";

    drawTextWrapped(
        b.message,
        25,
        48,
        430,
        11
    );


    /* HP команды */

    drawPartyBattle();


    /* RD */

    drawRD();


    /* меню */

    if (b.phase === "menu") {

        drawBattleMenu();

    }


    if (b.phase === "fight") {

        ctx.strokeStyle = "#fff";

        ctx.strokeRect(
            130,
            145,
            220,
            80
        );

        ctx.fillStyle = "#fff";

        ctx.font = "8px monospace";

        ctx.fillText(
            "Z — нанести удар",
            150,
            215
        );

        ctx.fillText(
            "X — назад",
            280,
            215
        );

    }


    if (b.phase === "enemy") {

        drawEnemyAttack();

    }


    if (b.phase === "victory") {

        ctx.fillStyle = "#fff";
        ctx.font = "18px monospace";

        ctx.fillText(
            "ПОБЕДА",
            195,
            155
        );

        ctx.font = "8px monospace";

        ctx.fillText(
            "Z — продолжить",
            190,
            180
        );

    }


    if (b.phase === "defeat") {

        ctx.fillStyle = "#ff5555";
        ctx.font = "15px monospace";

        ctx.fillText(
            "СИСТЕМА ОТРЯДА ПОВРЕЖДЕНА",
            95,
            155
        );

        ctx.fillStyle = "#fff";
        ctx.font = "8px monospace";

        ctx.fillText(
            "Z — восстановить команду",
            165,
            180
        );

    }

}


/* =========================================================
   GLITCH ENEMY
========================================================= */

function drawGlitchEnemy(x,y) {

    ctx.fillStyle = "#28384b";

    ctx.fillRect(
        x-25,
        y-22,
        50,
        45
    );

    ctx.fillStyle = "#5c91bd";

    ctx.fillRect(
        x-18,
        y-15,
        36,
        6
    );

    ctx.fillRect(
        x-20,
        y-3,
        40,
        8
    );

    ctx.fillRect(
        x-13,
        y+11,
        26,
        6
    );

    ctx.fillStyle = "#ff3355";

    ctx.fillRect(
        x-10,
        y-10,
        6,
        5
    );

    ctx.fillRect(
        x+5,
        y-10,
        6,
        5
    );


    /* глитч-линии */

    ctx.fillStyle = "#9ccfff";

    ctx.fillRect(
        x-30,
        y-25,
        60,
        2
    );

    ctx.fillRect(
        x-17,
        y+22,
        35,
        2
    );

}


/* =========================================================
   PARTY
========================================================= */

function drawPartyBattle() {

    const b = game.battle;

    party.forEach((p,i) => {

        const x = 20;
        const y = 90 + i*12;

        if (i === b.actor) {

            ctx.fillStyle = "#fff";

            ctx.font = "7px monospace";

            ctx.fillText(
                "▶",
                x,
                y
            );

        }

        ctx.fillStyle = p.color;

        ctx.font = "7px monospace";

        ctx.fillText(
            p.name,
            x+10,
            y
        );


        ctx.fillStyle = "#333";

        ctx.fillRect(
            x+65,
            y-6,
            45,
            5
        );


        ctx.fillStyle = "#fff";

        ctx.fillRect(
            x+65,
            y-6,
            45 *
            Math.max(0,p.hp) /
            p.maxHP,
            5
        );


        ctx.fillStyle = "#aaa";

        ctx.fillText(
            p.hp + "/" + p.maxHP,
            x+115,
            y
        );

    });

}


/* =========================================================
   RD
========================================================= */

function drawRD() {

    const b = game.battle;

    const x = 340;
    const y = 85;

    ctx.fillStyle = "#fff";

    ctx.font = "8px monospace";

    ctx.fillText(
        "RD",
        x,
        y
    );


    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        x,
        y+8,
        115,
        9
    );


    ctx.fillStyle = "#ffd84d";

    ctx.fillRect(
        x+2,
        y+10,
        111 *
        (b.rd / b.maxRD),
        5
    );


    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText(
        Math.floor(b.rd) + "%",
        x+78,
        y
    );

}


/* =========================================================
   BATTLE MENU
========================================================= */

function drawBattleMenu() {

    const b = game.battle;

    const options = [
        "FIGHT",
        "ACT",
        "ITEM",
        "DEFEND"
    ];

    const positions = [
        [170,235],
        [260,235],
        [350,235],
        [410,235]
    ];


    options.forEach((text,i) => {

        const [x,y] = positions[i];

        if (i === b.menu) {

            ctx.strokeStyle = "#fff";

            ctx.strokeRect(
                x-10,
                y-13,
                70,
                20
            );

        }

        ctx.fillStyle = "#fff";

        ctx.font = "8px monospace";

        ctx.fillText(
            text,
            x,
            y
        );

    });

}


/* =========================================================
   ENEMY ATTACK DRAW
========================================================= */

function drawEnemyAttack() {

    const b = game.battle;


    /* граница как отдельная арена */

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;

    ctx.strokeRect(
        55,
        130,
        370,
        95
    );


    /* лазер */

    b.lasers.forEach(laser => {

        if (laser.warning > 0) {

            ctx.strokeStyle = "#ff4444";

            ctx.setLineDash([4,4]);

            ctx.beginPath();

            ctx.moveTo(
                laser.x,
                132
            );

            ctx.lineTo(
                laser.x,
                223
            );

            ctx.stroke();

            ctx.setLineDash([]);

            ctx.fillStyle = "#ff4444";

            ctx.font = "7px monospace";

            ctx.fillText(
                "!",
                laser.x-2,
                145
            );

        }
        else {

            ctx.fillStyle = "#ff3333";

            ctx.fillRect(
                laser.x-3,
                132,
                6,
                93
            );

        }

    });


    /* взрывы */

    b.explosions.forEach(explosion => {

        if (explosion.timer > 0)
            return;

        ctx.strokeStyle = "#ffcc55";

        ctx.beginPath();

        ctx.arc(
            explosion.x,
            explosion.y,
            25,
            0,
            Math.PI*2
        );

        ctx.stroke();


        /* частицы */

        for (let i=0;i<8;i++) {

            const angle =
                i / 8 * Math.PI * 2;

            const px =
                explosion.x +
                Math.cos(angle)*32;

            const py =
                explosion.y +
                Math.sin(angle)*32;

            ctx.fillStyle = "#ffdd77";

            ctx.fillRect(
                px,
                py,
                3,
                3
            );

        }

    });


    /* душа */

    ctx.fillStyle = "#ff3344";

    ctx.fillRect(
        b.soul.x-4,
        b.soul.y-4,
        8,
        8
    );


    ctx.fillStyle = "#fff";

    ctx.font = "7px monospace";

    ctx.fillText(
        "УКЛОНЯЙТЕСЬ",
        185,
        120
    );

}


/* =========================================================
   MENU DRAW
========================================================= */

function drawMenu() {

    ctx.fillStyle = "rgba(0,0,0,.96)";
    ctx.fillRect(0,0,W,H);

    ctx.strokeStyle = "#fff";

    ctx.strokeRect(
        30,
        20,
        420,
        225
    );


    ctx.fillStyle = "#fff";

    ctx.font = "16px monospace";

    ctx.fillText(
        "МЕНЮ",
        55,
        50
    );


    const options = [
        "ПРЕДМЕТЫ",
        "СТАТУС",
        "СОХРАНЕНИЕ"
    ];


    options.forEach((text,i) => {

        const y = 85 + i*35;

        if (i === game.menuIndex) {

            ctx.fillText(
                "▶",
                60,
                y
            );

        }

        ctx.fillText(
            text,
            85,
            y
        );

    });


    ctx.font = "8px monospace";

    ctx.fillText(
        "Z — выбрать",
        55,
        225
    );

    ctx.fillText(
        "X — назад",
        350,
        225
    );

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


    if (game.state === "title") {

        drawTitle();

    }

    else if (game.state === "intro") {

        drawIntro();

    }

    else if (game.state === "dialogue") {

        drawDialogue();

    }

    else if (game.state === "wasteland") {

        drawWasteland();

    }

    else if (game.state === "menu") {

        drawMenu();

    }

    else if (game.state === "battle") {

        drawBattle();

    }

}


/* =========================================================
   UPDATE
========================================================= */

function update() {

    if (game.state === "title") {

        updateTitle();

    }

    else if (game.state === "intro") {

        updateIntro();

    }

    else if (game.state === "dialogue") {

        updateDialogue();

    }

    else if (game.state === "wasteland") {

        updateWasteland();

    }

    else if (game.state === "menu") {

        updateMenu();

    }

    else if (game.state === "battle") {

        updateBattle();

    }


    /*
       pressed сбрасываем только после
       обработки текущего кадра.
    */

    for (const key in pressed) {
        pressed[key] = false;
    }

}


/* =========================================================
   GAME LOOP
========================================================= */

function loop() {

    update();
    draw();

    requestAnimationFrame(loop);

}

loop();
