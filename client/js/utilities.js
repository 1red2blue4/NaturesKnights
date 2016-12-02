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

const fillText = (string, x, y, css, color, textAlign, textBaseline) => {
  ctx.save();
  ctx.font = css;
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  ctx.fillStyle = color;
  ctx.fillText(string, x, y);
  ctx.restore();
};

const genDirection = () => {
  let x = Math.floor((Math.random() * 10) - 5);
  let y = Math.floor((Math.random() * 10) - 5);
  return {xDir: x, yDir: y};
}

const getRandNum = (min, max) => {
  let value = Math.floor((Math.random() * (max-min+1)) + min);
  return value;
}

module.exports.drawRectWithStroke = drawRectWithStroke;
module.exports.drawRect = drawRect;
module.exports.fillText = fillText;
module.exports.genDirection = genDirection;