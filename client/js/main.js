"use strict";
    
let socket;

let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
let WIDTH;
let HEIGHT;
let yourTicketNum;
let yourRoomNum;
let yourCharacters = {};
let bothPlayersAvailable = false;
let takingTurn = false;

let ghostImg = new Image();

let draws = {};

let CreateSpecialFeatures = (kncksOvr, psns, brns, brksShld, htsFrmTp, trgts) => {
  let mySpecialFeatures = {};
  mySpecialFeatures.knocksOver = kncksOvr;
  mySpecialFeatures.burns = brns;
  mySpecialFeatures.poisons = psns;
  mySpecialFeatures.breaksShield = brksShld;
  mySpecialFeatures.targets = trgts;
  mySpecialFeatures.hitsFromTop = htsFrmTp
};

let CreateAttack = (nm, dmg, mna, dscrptn, spclFtrs) => {
  let myAttack = {};
  myAttack.name = nm;
  myAttack.damage = dmg;
  myAttack.mana = mna;
  myAttack.description = dscrptn;
  myAttack.specialFeatures = spclFtrs;
  return myAttack;
};

let CreateKnight = (hlth, def, spd, drftPts, cnKnckOvr, alv, psnd, brnd, flng, atcks) => {
  let myKnight = {};
  myKnight.HLTH = hlth;
  myKnight.DEF = def;
  myKnight.speed = spd;
  myKnight.draftPoints = drftPts;
  myKnight.canKnockOver = cnKnckOvr;
  myKnight.alive = alv;
  myKnight.poisoned = psnd;
  myKnight.burned = brnd;
  myKnight.flying = flng;
  myKnight.attacks = atcks;
  return myKnight;
};

let savageTiger = CreateKnight(5, 0, 13, 2, "false", "true", "false", "false", "false",
  [CreateAttack("Claw", 2, 0, "Claw the enemy apart.", 
    CreateSpecialFeatures("false", "false", "false", "true", "false", "front")
  )]
);

let chipmonk = CreateKnight(2, 0, 7, 1, "false", "true", "false", "false", "false",
  [CreateAttack("Bonk", 1, 0, "Bonks the enemy with your head.",
    CreateSpecialFeatures("true", "false", "false", "false", "true", "any")
  )]
);

let seaSerpent = CreateKnight(7, 0, 8, 3, "false", "true", "false", "false", "true",
  [CreateAttack("Wave Smash", 2, 0, "Smashes the enemy with a tidal wave.",
    CreateSpecialFeatures("true", "false", "false", "false", "false", "front")
  ), CreateAttack("Sea Gust", 1, 1, "Sends a gust of wind at the enemies",
    CreateSpecialFeatures("false", "false", "false", "true", "false", "all")
  )]
);

let blossomBird = CreateKnight(7, 0, 12, 3, "false", "true", "false", "false", "true", 
  [CreateAttack("Dive", 3, 0, "Dive straight through an enemy.",
    CreateSpecialFeatures("false", "false", "false", "false", "true", "any")
  )]
);


/*
let sillyDog = {};

let schemingMonkey = {};

let sponge = {};

let smallCrab = {};

let slashingCrab = {};

let lightningSnake = {};

let thunderSnake = {};

let giantSnake = {};

let stupidSnake = {};

let thoughtDweller = {};

let slashingFrog = {};

let spaceMouse = {};

let thoughtfulCricket = {};

let savageSoulBear = {};

let monkey = {};

let punchingRunt = {};

let spaceDweller = {};

let witchBear = {};
*/

let yourTeam = [savageTiger, chipmonk, savageTiger, seaSerpent, blossomBird];
let enemyTeam = {};
let turnOrder = {};

const draw = (myTeam, theirTeam) => {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //you are red team
  if (yourTicketNum % 2 == 1) {
    for (let i = 0; i < myTeam.length; i++)
    {
      drawRect(385 + 75*i, 250, 60, 60, "red");
    }
    if (takingTurn)
    {
      drawRect(410, 325, 125, 75, "rgb(240, 250, 80)");
    }
    if (bothPlayersAvailable)
    {
      for (let i = 0; i < theirTeam.length; i++)
      {
        drawRect(305 - 75*i, 250, 60, 60, "blue");
      }
    }
  }
  else
  {
    for (let i = 0; i < myTeam.length; i++)
    {
      drawRect(305 - 75*i, 250, 60, 60, "blue");
    }
    if (takingTurn)
    {
      drawRect(35, 325, 125, 75, "rgb(240, 250, 80)");
    }
    if (bothPlayersAvailable) {
      for (let i = 0; i < theirTeam.length; i++)
      {
        drawRect(385 + 75*i, 250, 60, 60, "red");
      }
    }
  }     


};

const setCalls = () => {

  //get your ticket number, room number, and send your team to the server
  socket.on('getTicketNum', (data) => {
    yourTicketNum = data.ticket;
    yourRoomNum = data.room;
    //console.log("Great!");
    console.log(`Your ticket num is: ${yourTicketNum}`);

    fillText(ctx, `You are in room: ${yourRoomNum}`, WIDTH*5/6, HEIGHT/12, "12pt nature", "purple");

    ctx.drawImage(ghostImg, WIDTH/2 - 150, HEIGHT*3/4);

    socket.emit("sendTeam", {team: yourTeam, room: yourRoomNum, ticket: yourTicketNum});

    socket.emit("awaitBothPlayers", { ticket: yourTicketNum, room: yourRoomNum, ready: bothPlayersAvailable });
  });

  //once both players have arrived, start
  socket.on("stopWaiting", () => {
    bothPlayersAvailable = true;
    socket.emit("grabTeams", { ticket: yourTicketNum, team: yourTeam, room: yourRoomNum});
  });

  //receive the enemy team from the server
  socket.on("sendEnemyTeam", (data) => {
    enemyTeam = data.theBadGuys;

    //once the enemy team is received, set gameplay order

    //find out the order of play
    const allCharactersBasedOnSpeed = [];

    for (let i = 0; i < yourTeam.length; i++)
    {
      allCharactersBasedOnSpeed[i] = yourTeam[i];
      allCharactersBasedOnSpeed[i].team = "me";
    }
    for (let i = yourTeam.length; i < yourTeam.length + enemyTeam.length; i++)
    {
      allCharactersBasedOnSpeed[i] = enemyTeam[i - yourTeam.length];
      allCharactersBasedOnSpeed[i].team = "them";
    }

    //order the characters
    allCharactersBasedOnSpeed.sort((a, b) => {
      return a.speed - b.speed;
    });
    allCharactersBasedOnSpeed.reverse();

    //doctor who owns what character
    if (yourTicketNum % 2 == 0)
    {
      for (let i = 0; i < yourTeam.length + enemyTeam.length; i++)
      {
        if (allCharactersBasedOnSpeed[i].team === "me")
        {
          allCharactersBasedOnSpeed[i].team = "them";
        }
        else if (allCharactersBasedOnSpeed[i].team === "them")
        {
          allCharactersBasedOnSpeed[i].team = "me";
        }
      }
    }

    //console.dir(allCharactersBasedOnSpeed);

    //save the turn order
    turnOrder = allCharactersBasedOnSpeed;

    console.dir(turnOrder[0].team);

    socket.emit("takeTurn", {turnOrder});
  });

  socket.on("nextTurn", (data) => {
    console.dir(data.next);
    if (data.next.team === "me")
    {
      takingTurn = true;
    }
  });

};

/*
const startFight = () => {

  socket.emit("sendBeginFight", {yourTeam, enemyTeam});

  //find out the order of play
  const speeds = [];

  for (let i = 0; i < yourTeam.length; i++)
  {
    speeds[i] = yourTeam[i].speed;
  }
  for (let i = yourTeam.length; i < yourTeam.length + enemyTeam.length; i++)
  {
    speeds[i] = enemyTeam[i - yourTeam.length].speed;
  }

  console.dir(speeds);


  let tempSpeeds = speeds;

  //get an array of the speeds in order
  tempSpeeds.sort(function(a, b){return a-b});
  tempSpeeds.reverse();

  //console.dir(tempSpeeds); 
};
*/

const drawRectWithStroke = (xPos, yPos, width, height, fillStyle, strokeStyle) => {
  ctx.save();
  ctx.fillStyle = fillStyle;
  ctx.strokeStyle = strokeStyle;
  ctx.fillRect(xPos, yPos, width, height);
  ctx.stroke();
  ctx.restore();
};

const drawRect = (xPos, yPos, width, height, fillStyle) => {
  ctx.save();
  ctx.fillStyle = fillStyle;
  ctx.fillRect(xPos, yPos, width, height);
  ctx.stroke();
  ctx.restore();
};

const handleMessage = (data) => {
  draws[data.time] = data.coords;
  draw(data);
};    

function fillText(ctx, string, x, y, css, color) 
{
  // https://developer.mozilla.org/en-US/docs/Web/CSS/font
  ctx.save();
  ctx.font = css;
  ctx.fillStyle = color;
  ctx.fillText(string, x, y);
  ctx.restore();
}

function genDirection()
{
  let x = Math.floor((Math.random() * 10) - 5);
  let y = Math.floor((Math.random() * 10) - 5);
  return {xDir: x, yDir: y};
}

function getRandNum(min, max)
{
  let value = Math.floor((Math.random() * (max-min+1)) + min);
  return value;
}

const init = () => {
  socket = io.connect();
  canvas.width = 750;
  canvas.height = 500;
  WIDTH = canvas.width;
  HEIGHT = canvas.height;
  ghostImg.src = '../media/ghost.png';
  setCalls();
  //startFight();
  update();
}

function update()
{
  draw(yourTeam, enemyTeam);
  window.requestAnimationFrame(update);
}

window.onload = init;