let time = 0;
let isWarmColorMode = true;      // Color: true for warm, false for cold
let currentColor;
let motherCreature;
let allChildren = [];

let warmColorPalette = [
  [255, 220, 200],
  [255, 200, 230],
  [255, 245, 180]
];   

let coolColorPalette = [
  [200, 240, 255],
  [220, 200, 255],
  [180, 255, 240]
];   //store the colors

function setup() {
  let canvas = createCanvas(800, 500);
  canvas.parent("p5-canvas-container");
  noStroke();
  pickColor();
  motherCreature = createCreature(400, 250, currentColor, true);  
  // create mother creature
}

function draw() {
  background(0);
  time += 1;    
  motherCreature = updateCreature(motherCreature, time);
  //update the situation of the mother creature

  let updatedChildren = [];
  for (let index = 0; index < allChildren.length; index++) {
    let oneChild = allChildren[index];
    let updatedChild = updateCreature(oneChild, time);

    //if visible, keep them
    if (updatedChild[4] > 0) {
      updatedChildren.push(updatedChild);
    }
  }
  allChildren = updatedChildren;

  // if invisible, select a new mother creature
  if (motherCreature[4] <= 0) {
    if (allChildren.length > 0) {
      let newMotherIndex = selectClosestToCenter(allChildren);
      motherCreature = moveToCenter(allChildren[newMotherIndex]);
      allChildren.splice(newMotherIndex, 1);
    }
  }

  for (let index = 0; index < allChildren.length; index++) {
    drawCreature(allChildren[index], time);
  }

  drawCreature(motherCreature, time);

  fill(255);
  textSize(15);
  text('Press SPACE to generate new creatures and witness their life cycle', 20, 30);
}

function createCreature(xPosition, yPosition, colorValue, isMother) {
  if (isMother === undefined) {
    isMother = false;
  }

  let transparency = 255;
  let baseSize;
  if (isMother === true) {
    baseSize = 40;
  } else {
    baseSize = random(10, 30);
  }

  let animationPhase = random(1000);
  let isFading = false;
  let isMoving = false;
  let moveStart = null;
  let moveEnd = null;
  let moveProgress = 0;
  let lifespan;

  if (isMother === true) {
    lifespan = Infinity;
  } else {
    lifespan = int(random(400, 600));
  }

  // return all the creatures' feature
  return [xPosition, yPosition, colorValue, isMother, transparency, baseSize,
          animationPhase, isFading, isMoving, moveStart, moveEnd, moveProgress, lifespan];
}

function updateCreature(creature, timeCount) {
  let xPosition = creature[0];
  let yPosition = creature[1];
  let colorValue = creature[2];
  let isMother = creature[3];
  let transparency = creature[4];
  let baseSize = creature[5];
  let animationPhase = creature[6];
  let isFading = creature[7];
  let isMoving = creature[8];
  let moveStart = creature[9];
  let moveEnd = creature[10];
  let moveProgress = creature[11];
  let lifespan = creature[12];
  
// [0]x 坐标
// [1]y 坐标
// [2]颜色
// [3]是否母体
// [4]透明度
// [5]大小
// [6]呼吸节奏（随机数）
// [7]是否正在淡出
// [8]是否在移动
// [9]移动起点
// [10]移动终点
// [11]移动进度
// [12]寿命（子代才有）

  // Reduce lifespan of the new generations
  if (isMother === false) {
    if (isFading === false) {
      lifespan -= 1;
      if (lifespan <= 0) {
        isFading = true;
      }
    }
  }

  if (isMoving === true) {
    if (moveStart !== null) {
      if (moveEnd !== null) {
        moveProgress += 0.02;
        let progress = constrain(moveProgress, 0, 1);
        xPosition = lerp(moveStart.x, moveEnd.x, progress);
        yPosition = lerp(moveStart.y, moveEnd.y, progress);
        baseSize = lerp(baseSize, 40, progress);
        if (progress >= 1) {
          isMoving = false;
        }
      }
    }
  }

  //fade out
  if (isFading === true) {
    if (isMother === true) {
      transparency -= 3;
    } else {
      transparency -= 2;
    }
  }

  return [xPosition, yPosition, colorValue, isMother, transparency, baseSize,
          animationPhase, isFading, isMoving, moveStart, moveEnd, moveProgress, lifespan];
}

function drawCreature(creature, timeCount) {
  let xPosition = creature[0];
  let yPosition = creature[1];
  let colorValue = creature[2];
  let transparency = creature[4];
  let baseSize = creature[5];
  let animationPhase = creature[6];

  //breathe
  let pulse = 1 + 0.1 * sin((timeCount + animationPhase) * 0.05);
  let radius = baseSize * pulse;

  //color changing(darker when dilated and lighter when contracted)
  let redValue = colorValue[0] + 10 * sin(timeCount * 0.03);
  let greenValue = colorValue[1] + 10 * sin(timeCount * 0.04 - 1);
  let blueValue = colorValue[2] + 10 * sin(timeCount * 0.05 - 2);

  let brightnessChange = map(pulse, 0.9, 1.1, 1.2, 0.8);
  redValue = constrain(redValue * brightnessChange, 0, 255);
  greenValue = constrain(greenValue * brightnessChange, 0, 255);
  blueValue = constrain(blueValue * brightnessChange, 0, 255);

  push();
  translate(xPosition, yPosition);

  //gradual halo
  for (let layerIndex = 10; layerIndex > 0; layerIndex -= 1) {
    let layerRadius = radius * (1 + layerIndex * 0.1);
    let layerAlpha = map(layerIndex, 10, 1, 10, 60) * (transparency / 255);
    fill(redValue, greenValue, blueValue, layerAlpha);
    ellipse(0, 0, layerRadius * 2, layerRadius * 2);
  }

  //core
  fill(redValue, greenValue, blueValue, 250 * (transparency / 255));
  ellipse(0, 0, radius * 1.4, radius * 1.4);
  pop();
}

function selectClosestToCenter(childrenList) {
  let minimumDistance = 999999;
  let chosenIndex = 0;

  for (let index = 0; index < childrenList.length; index++) {
    let childX = childrenList[index][0];
    let childY = childrenList[index][1];
    let distanceX = childX - 400;
    let distanceY = childY - 250;
    let distanceSquared = distanceX * distanceX + distanceY * distanceY;

    if (distanceSquared < minimumDistance) {
      minimumDistance = distanceSquared;
      chosenIndex = index;
    }
  }
  return chosenIndex;
}

function moveToCenter(creature) {
  creature[8] = true;                       //start moving(boolean)
  creature[9] = { x: creature[0], y: creature[1] }; //start point(current location)
  creature[10] = { x: 400, y: 250 };        //end point(middle)
  creature[11] = 0;            //moving process(increase and stop when reaching 1)
  creature[3] = true;                       //become mother creature(boolean)
  creature[4] = 255;                        //not transparent
  creature[7] = false;                      //not fading out(boolean)
  return creature;
}

function keyPressed() {
  if (key === ' ') {
    if (isWarmColorMode === true) {
      isWarmColorMode = false;
    } else {
      isWarmColorMode = true;
    }

    pickColor();

    let newChildrenList = [];

    for (let index = 0; index < allChildren.length; index++) {
      newChildrenList.push(allChildren[index]);
    }

    let newChildCount = int(random(1, 4));
    for (let count = 0; count < newChildCount; count++) {
      let angle = random(TWO_PI);
      let distanceFromMother = random(100, 150);
      let childX = motherCreature[0] + cos(angle) * distanceFromMother;
      let childY = motherCreature[1] + sin(angle) * distanceFromMother;
      let newChild = createCreature(childX, childY, currentColor, false);
      newChildrenList.push(newChild);
    }

    motherCreature[7] = true; //mother creature start to fade
    allChildren = newChildrenList;
  }
}

function pickColor() {
  let chosenPalette;
  if (isWarmColorMode === true) {
    chosenPalette = warmColorPalette;
  } else {
    chosenPalette = coolColorPalette;
  }

  let randomIndex = int(random(chosenPalette.length));
  currentColor = chosenPalette[randomIndex];
}

//A creature that can generate new creatures and have lifespan length