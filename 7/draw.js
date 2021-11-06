//init canvas
var canvas = document.getElementById("canvas");
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
var width = canvas.width;
var height = canvas.height;
var ctx = canvas.getContext("2d");

//draw 1D graph
function draw1D(values, right)
{
	ctx.clearRect(0, 0, width, height);
	
	//get destination rect
	let offset = 20;
	let destX = offset;
	let destY = offset;
	let destW = width - 2*offset;
	let destH = height - 2*offset;
	
	//get source rect
	let top = 0, bottom = 0, len = values.length;
	for (let v of values) { top = Math.max(top, v); bottom = Math.min(bottom, v); }
	if (Math.abs(top - bottom) < 0.0001) top += 0.0001;
	
	let sourceX = 0;
	let sourceY = top;
	let sourceW = len - 1;
	let sourceH = bottom - top;
	
	//position of zero
	let y0 = (0 - sourceY) / sourceH * destH + destY;
	let yt = (top - sourceY) / sourceH * destH + destY;
	let yb = (bottom - sourceY) / sourceH * destH + destY;
	
	//draw axis
	ctx.beginPath();
	ctx.strokeStyle = "black";
	
	ctx.moveTo(destX, 0);
	ctx.lineTo(destX, height);
	
	ctx.moveTo(0, y0);
	ctx.lineTo(width, y0);
	
	ctx.moveTo(destX + destW, y0 - 5);
	ctx.lineTo(destX + destW, y0 + 5);
	
	ctx.moveTo(destX - 5, yt);
	ctx.lineTo(destX + 5, yt);
	
	ctx.moveTo(destX - 5, yb);
	ctx.lineTo(destX + 5, yb);
	
	ctx.stroke();
	
	//labels
	ctx.font = "12px Arial";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	
	ctx.fillText("0", destX + 2, y0 + 2);
	if (Math.abs(yt - y0) > 1) ctx.fillText(top, destX + 2, yt + 2);
	if (Math.abs(yb - y0) > 1) ctx.fillText(bottom, destX + 2, yb + 2);
	
	ctx.textAlign = "right";
	ctx.fillText(right, destX + destW - 2, y0 + 2);
	
	if (values.iters)
		ctx.fillText("Iterations: " + values.iters, width - 2, 2);
	
	//project points
	ctx.beginPath();
	ctx.strokeStyle = "red";
	
	for (i in values)
	{
		let v = values[i];
		let x = (i - sourceX) / sourceW * destW + destX;
		let y = (v - sourceY) / sourceH * destH + destY;
		
		if (i == 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	}
	ctx.stroke();
}

//function for nice colors
function clr(t)
{
	t -= 6 * Math.floor(t / 6); //t from 0 to 6
	
	if (t < 2) return 255;
	else if (t < 3) return Math.floor(255 * (3 - t));
	else if (t < 5) return 0;
	return Math.floor(255 * (t - 5));
}

//draw 2D graph
function draw2D(v, w, h)
{
	ctx.clearRect(0, 0, width, height);
	
	//get destination rect
	let offset = 20;
	let destX = offset;
	let destY = offset;
	let destW = width - 2*offset;
	let destH = height - 3*offset;
	
	//normalize values
	let minv = v[0][0], maxv = v[0][0];
	for (let i in v) for (let j in v[i]) { minv = Math.min(minv, v[i][j]); maxv = Math.max(maxv, v[i][j]); }
	
	if (Math.abs(maxv - minv) < 0.0001) maxv += 0.0001;
	for (let i in v) for (let j in v[i]) v[i][j] = (v[i][j] - minv) / (maxv - minv);
	
	//draw data
	let imageData = ctx.getImageData(destX, destY, destW, destH);
	let data = imageData.data;
	
	for (let i = 0; i < destW; i++)
	for (let j = 0; j < destH; j++)
	{
		let index = 4 * (j * destW + i);
		let vi = Math.floor(i / destW * v.length);
		let vj = Math.floor((destH - j - 1) / destH * v[0].length);
		
		data[index + 0] = clr(v[vi][vj] * 4 + 3);
		data[index + 1] = clr(v[vi][vj] * 4 + 5);
		data[index + 2] = clr(v[vi][vj] * 4 + 1);
		data[index + 3] = 255;
	}
	ctx.putImageData(imageData, destX, destY);
	
	//axis
	ctx.beginPath();
	ctx.strokeStyle = "black";
	
	ctx.moveTo(destX, 0);
	ctx.lineTo(destX, height);
	
	ctx.moveTo(0, destY + destH);
	ctx.lineTo(width, destY + destH);
	
	ctx.moveTo(destX + destW, destY + destH - 5);
	ctx.lineTo(destX + destW, destY + destH + 5);
	
	ctx.moveTo(destX - 5, destY);
	ctx.lineTo(destX + 5, destY);
	
	ctx.stroke();
	
	//labels
	ctx.font = "12px Arial";
	
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("0", destX + 2, destY + destH + 2);
	
	ctx.textAlign = "right";
	ctx.fillText(w, destX + destW - 2, destY + destH + 2);
	
	ctx.textAlign = "left";
	ctx.textBaseline = "bottom";
	ctx.fillText(h, destX + 2, destY - 2);
	
	ctx.textAlign = "center";
	ctx.fillText("(" + minv + ", " + maxv + ")", width/2, height - 2);
	
	if (v.iters)
	{
		ctx.textBaseline = "top";
		ctx.fillText("Iterations: " + v.iters, destX + 0.5 * destW - 1, destY + destH + 2);
	}
}