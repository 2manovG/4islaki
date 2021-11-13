//conditions
function init(x, y, a, b, mu) { return 0; }
function left(y, t, a, b, mu) { return 0; }
function right(y, t, a, b, mu) { return -Math.sin(y) * Math.sin(mu * t); }
function up(x, t, a, b, mu) { return -Math.sin(x) * Math.sin(mu * t); }
function down(x, t, a, b, mu) { return 0; }
function f(x, y, t, a, b, mu) { return Math.sin(x) * Math.sin(y) * (mu * Math.cos(mu * t) + (a + b) * Math.sin(mu * t)); }

//additional functions
function linear(u1, u2, k1, k2)
{
	let u = [];
	for (let i = 0; i < u1.length; i++)
	{
		u.push([]);
		for (let j = 0; j < u1[0].length; j++)
		{
			u[i].push([]);
			for (let k = 0; k < u1[0][0].length; k++)
				u[i][j].push(u1[i][j][k] * k1 + u2[i][j][k] * k2);
		}
	}
	return u;
}
function abs(u)
{
	let au = [];
	for (let i = 0; i < u.length; i++)
	{
		au.push([]);
		for (let j = 0; j < u[0].length; j++)
		{
			au[i].push([]);
			for (let k = 0; k < u[0][0].length; k++)
				au[i][j].push(Math.abs(u[i][j][k]));
		}
	}
	return au;
}
function sum(u)
{
	let s = 0;
	for (let i = 0; i < u.length; i++)
		for (let j = 0; j < u[0].length; j++)
			for (let k = 0; k < u[0][0].length; k++)
			{
				if (u[i][j][k] == u[i][j][k])
					s += u[i][j][k];
			}
	
	return s;
}
//[x][y][t]
function sliceXY(data3d, t)
{
	let data2d = [], lx = data3d.length, ly = data3d[0].length, lt = data3d[0][0].length;
	t = Math.floor((lt - 1) * t);
	
	for (let x = 0; x < lx; x++)
	{
		data2d.push([]);
		for (let y = 0; y < ly; y++)
			data2d[x].push(data3d[x][y][t]);
	}
	return data2d;
}
function sliceXT(data3d, y)
{
	let data2d = [], lx = data3d.length, ly = data3d[0].length, lt = data3d[0][0].length;
	y = Math.floor((ly - 1) * y);
	
	for (let x = 0; x < lx; x++)
	{
		data2d.push([]);
		for (let t = 0; t < lt; t++)
			data2d[x].push(data3d[x][y][t]);
	}
	return data2d;
}
function sliceYT(data3d, x)
{
	let data2d = [], lx = data3d.length, ly = data3d[0].length, lt = data3d[0][0].length;
	x = Math.floor((lx - 1) * x);
	
	for (let y = 0; y < ly; y++)
	{
		data2d.push([]);
		for (let t = 0; t < lt; t++)
			data2d[y].push(data3d[x][y][t]);
	}
	return data2d;
}

//3diag solver
function three_diag(a, b, c, d) //a = [0, ...], c = [..., 0]
{
	//P and Q
	let P = [ -c[0] / b[0] ], Q = [ d[0] / b[0] ], x = [ 0 ], n = a.length;
	
	for (let i = 1; i < n; i++)
	{
		let den = b[i] + a[i] * P[i - 1];
		P.push(-c[i] / den);
		Q.push((d[i] - a[i] * Q[i - 1]) / den);
		x.push(0);
	}

	//x
	x[n - 1] = Q[n - 1];
	for (let i = n - 2; i >= 0; i--) x[i] = P[i] * x[i + 1] + Q[i];
	
	return x;
}

//numerical solution
function solve(a, b, mu, hx, hy, tau, T, method, approx)
{
	let u = [], temp = [], lx, ly, lz;
	
	//fill
	for (let x = 0; x < Math.PI; x += hx)
	{
		let ux = [];
		let tempx = [];
		for (let y = 0; y < Math.PI; y += hy)
		{
			let uxy = [];
			for (let t = 0; t < T; t += tau) uxy.push(tau == 0 ? init(x, y, a, b, mu) : 0);
			ux.push(uxy);
			tempx.push(0);
		}
		u.push(ux);
		temp.push(tempx);
	}
	lx = u.length;
	ly = u[0].length;
	lz = u[0][0].length;
	
	//variable directions
	if (method == 1)
	{
		for (let k = 1; k < lz; k++)
		{
			//direction x
			for (let j = 1; j < ly - 1; j++)
			{
				let da = [0], db = [0], dc = [0], dd = [0], e2 = 0;
				
				//mid
				for (let i = 1; i < lx - 1; i++)
				{
					da.push(-a / hx / hx);
					db.push(2 * a / hx / hx + 2 / tau);
					dc.push(-a / hx / hx);
					dd.push(2 * u[i][j][k - 1] / tau +
						b / hy / hy * (u[i][j - 1][k - 1] - 2 * u[i][j][k - 1] + u[i][j + 1][k - 1]) +
						f(i * hx, j * hy, (k + 0.5) * tau, a, b, mu));
				}
				//left
				da[0] = 0;
				db[0] = 1;
				dc[0] = 0;
				dd[0] = left(j * hy, (k + 0.5) * tau, a, b, mu);
				//right
				if (approx == 1)
				{
					da.push(-1 / hx);
					db.push(1 / hx);
					dc.push(0);
					dd.push(right(j * hy, (k + 0.5) * tau, a, b, mu));
				}
				else
				{
					e2 = 0.5 / hx;
					da.push(-2 / hx);
					db.push(1.5 / hx);
					dc.push(0);
					dd.push(right(j * hy, (k + 0.5) * tau, a, b, mu));
				}
				//fix
				da[lx - 1] -= e2 * db[lx - 2] / da[lx - 2];
				db[lx - 1] -= e2 * dc[lx - 2] / da[lx - 2];
				dd[lx - 1] -= e2 * dd[lx - 2] / da[lx - 2];
				
				//fill temp
				let sol = three_diag(da, db, dc, dd);
				for (let i = 0; i < lx; i++) temp[i][j] = sol[i];
			}
			for (let i = 0; i < lx; i++)
			{
				temp[i][0] = down(i * hx, (k + 0.5) * tau, a, b, mu);
				if (approx == 1)
					temp[i][ly - 1] = temp[i][ly - 2] + hy * up(i * hx, (k + 0.5) * tau, a, b, mu);
				else
					temp[i][ly - 1] = (-temp[i][ly - 3] + 4 * temp[i][ly - 2] + 2 * hy * up(i * hx, (k + 0.5) * tau, a, b, mu)) / 3;
			}
			//direction y
			for (let i = 1; i < lx - 1; i++)
			{
				let da = [0], db = [0], dc = [0], dd = [0], e2 = 0;
				
				//mid
				for (let j = 1; j < ly - 1; j++)
				{
					da.push(-b / hy / hy);
					db.push(2 * b / hy / hy + 2 / tau);
					dc.push(-b / hy / hy);
					dd.push(2 * temp[i][j] / tau +
						a / hx / hx * (temp[i - 1][j] - 2 * temp[i][j] + temp[i + 1][j]) +
						f(i * hx, j * hy, (k + 0.5) * tau, a, b, mu));
				}
				//down
				da[0] = 0;
				db[0] = 1;
				dc[0] = 0;
				dd[0] = down(i * hx, (k + 0.5) * tau, a, b, mu);
				//up
				if (approx == 1)
				{
					da.push(-1 / hy);
					db.push(1 / hy);
					dc.push(0);
					dd.push(up(i * hx, (k + 0.5) * tau, a, b, mu));
				}
				else
				{
					e2 = 0.5 / hy;
					da.push(-2 / hy);
					db.push(1.5 / hy);
					dc.push(0);
					dd.push(up(i * hx, (k + 0.5) * tau, a, b, mu));
				}
				
				//fix
				da[ly - 1] -= e2 * db[ly - 2] / da[ly - 2];
				db[ly - 1] -= e2 * dc[ly - 2] / da[ly - 2];
				dd[ly - 1] -= e2 * dd[ly - 2] / da[ly - 2];
				
				//fill u
				let sol = three_diag(da, db, dc, dd);
				for (let j = 0; j < ly; j++) u[i][j][k] = sol[j];
			}
			for (let j = 0; j < ly; j++)
			{
				u[0][j][k] = left(j * hy, (k + 0.5) * tau, a, b, mu);
				if (approx == 1)
					u[lx - 1][j][k] = u[lx - 2][j][k] + hx * right(j * hy, (k + 0.5) * tau, a, b, mu);
				else
					u[lx - 1][j][k] = (-u[lx - 3][j][k] + 4 * u[lx - 2][j][k] + 2 * hx * right(j * hy, (k + 0.5) * tau, a, b, mu)) / 3;
			}
		}
	}
	//fractional steps
	else
	{
		for (let k = 1; k < lz; k++)
		{
			//step 1
			for (let j = 0; j < ly; j++)
			{
				let da = [0], db = [0], dc = [0], dd = [0], e2 = 0;
				
				//mid
				for (let i = 1; i < lx - 1; i++)
				{
					da.push(-a / hx / hx);
					db.push(2 * a / hx / hx + 1 / tau);
					dc.push(-a / hx / hx);
					dd.push(u[i][j][k - 1] / tau +
						f(i * hx, j * hy, k * tau, a, b, mu) / 2);
				}
				//left
				da[0] = 0;
				db[0] = 1;
				dc[0] = 0;
				dd[0] = left(j * hy, k * tau, a, b, mu);
				//right
				if (approx == 1)
				{
					da.push(-1 / hx);
					db.push(1 / hx);
					dc.push(0);
					dd.push(right(j * hy, k * tau, a, b, mu));
				}
				else
				{
					e2 = 0.5 / hx;
					da.push(-2 / hx);
					db.push(1.5 / hx);
					dc.push(0);
					dd.push(right(j * hy, k * tau, a, b, mu));
				}
				//fix
				da[lx - 1] -= e2 * db[lx - 2] / da[lx - 2];
				db[lx - 1] -= e2 * dc[lx - 2] / da[lx - 2];
				dd[lx - 1] -= e2 * dd[lx - 2] / da[lx - 2];
				
				//fill temp
				let sol = three_diag(da, db, dc, dd);
				for (let i = 0; i < lx; i++) temp[i][j] = sol[i];
			}
			//step 2
			for (let i = 0; i < lx; i++)
			{
				let da = [0], db = [0], dc = [0], dd = [0], e2 = 0;
				
				//mid
				for (let j = 1; j < ly - 1; j++)
				{
					da.push(-b / hy / hy);
					db.push(2 * b / hy / hy + 1 / tau);
					dc.push(-b / hy / hy);
					dd.push(temp[i][j] / tau +
						f(i * hx, j * hy, (k + 1) * tau, a, b, mu) / 2);
				}
				//left
				da[0] = 0;
				db[0] = 1;
				dc[0] = 0;
				dd[0] = down(i * hx, k * tau, a, b, mu);
				//right
				if (approx == 1)
				{
					da.push(-1 / hy);
					db.push(1 / hy);
					dc.push(0);
					dd.push(up(i * hx, k * tau, a, b, mu));
				}
				else
				{
					e2 = 0.5 / hy;
					da.push(-2 / hy);
					db.push(1.5 / hy);
					dc.push(0);
					dd.push(up(i * hx, k * tau, a, b, mu));
				}
				//fix
				da[ly - 1] -= e2 * db[ly - 2] / da[ly - 2];
				db[ly - 1] -= e2 * dc[ly - 2] / da[ly - 2];
				dd[ly - 1] -= e2 * dd[ly - 2] / da[ly - 2];
				
				//fill temp
				let sol = three_diag(da, db, dc, dd);
				for (let j = 0; j < ly; j++) u[i][j][k] = sol[j];
			}
		}
	}
	
	return u;
}

//true solution
function true_solution(a, b, mu, hx, hy, tau, T)
{
	let u = [];
	
	for (let x = 0; x < Math.PI; x += hx)
	{
		let ux = [];
		for (let y = 0; y < Math.PI; y += hy)
		{
			let uxy = [];
			for (let t = 0; t < T; t += tau) uxy.push(Math.sin(x) * Math.sin(y) * Math.sin(mu * t));
			ux.push(uxy);
		}
		u.push(ux);
	}
	return u;
}

//abs of diff
function error(a, b, mu, hx, hy, tau, T, method, approx)
{
	return abs(linear(solve(a, b, mu, hx, hy, tau, T, method, approx), true_solution(a, b, mu, hx, hy, tau, T), 1, -1));
}

//summ of errors
function total_error(a, b, mu, hx, hy, tau, T, method, approx)
{
	return hx * hy * tau * sum(abs(linear(solve(a, b, mu, hx, hy, tau, T, method, approx), true_solution(a, b, mu, hx, hy, tau, T), 1, -1)));
}