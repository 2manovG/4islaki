//conditions
function left(y) { return Math.exp(-y) * Math.cos(y); }
function right(y) { return 0; }

function low(x) { return Math.exp(-x) * Math.cos(x); }
function high(x) { return 0; }

//additional functions
function copy(u0)
{
	let u = [];
	for (let i = 0; i < u0.length; i++)
	{
		u.push([]);
		for (let j = 0; j < u0[0].length; j++) u[i].push(u0[i][j]);
	}
	return u;
}
function linear(u1, u2, k1, k2)
{
	let u = [];
	for (let i = 0; i < u1.length; i++)
	{
		u.push([]);
		for (let j = 0; j < u1[0].length; j++)
			u[i].push(u1[i][j] * k1 + u2[i][j] * k2);
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
			au[i].push(Math.abs(u[i][j]));
	}
	return au;
}
function sum(u)
{
	let s = 0;
	for (let i = 0; i < u.length; i++)
		for (let j = 0; j < u[0].length; j++)
		{
			if (u[i][j] == u[i][j])
				s += u[i][j];
		}
	
	return s;
}

//numerical solution
function solve(eps, omega, hx, hy, method)
{
	//other methods
	let u = [], xlen = 0, ylen = 0, A = Math.PI / 2;
	for (let x = 0; x < A; x += hx)
	{
		u.push([]);
		xlen++;
		for (let y = 0; y < A; y += hy)
		{
			u[u.length - 1].push(0);
			if (x == 0) ylen++;
		}
	}
	
	//initial condition
	for (let i = 0; i < xlen; i++)
	{
		let x = i * hx;
		for (let j = 1; j < ylen - 1; j++)
		{
			let y = j * hy;
			u[i][j] = (left(y) * (A - x) + right(y) * x) / A;
		}
		u[i][0] = low(x);
		u[i][ylen - 1] = high(x);
	}
	
	//iterations
	let error = 2 * eps, iters = 0;
	while (error > eps && iters < 10000)
	{
		let output = u; //Seidel's method
		if (method != 2) output = copy(u); //not Seidel's method
		
		error = 0;
		for (let i = 1; i < xlen - 1; i++)
			for (let j = 1; j < ylen - 1; j++)
			{
				let newval = (u[i + 1][j] * (hy * hy + hx * hy * hy) + u[i][j + 1] * (hx * hx + hx * hx * hy) +
					u[i - 1][j] * (hy * hy - hx * hy * hy) + u[i][j - 1] * (hx * hx - hx * hx * hy)) / (2 * hx * hx + 2 * hy * hy - 4 * hx * hx * hy * hy);
				
				//relaxation
				if (method == 3) newval = omega * newval + (1 - omega) * u[i][j];
				
				error = Math.max(error, Math.abs(newval - u[i][j]));
				output[i][j] = newval;
			}
		u = output;
		iters++;
	}
	u.iters = iters;
	return u;
}

//true solution
function true_solution(hx, hy)
{
	let u = [], A = Math.PI / 2;
	
	for (let x = 0; x < A; x += hx)
	{
		u.push([]);
		for (let y = 0; y < A; y += hy) u[u.length - 1].push(Math.exp(-x - y) * Math.cos(x) * Math.cos(y));
	}
	return u;
}

//abs of diff
function error(eps, omega, hx, hy, method)
{
	let u = solve(eps, omega, hx, hy, method);
	let err = abs(linear(u, true_solution(hx, hy), 1, -1));
	err.iters = u.iters;
	return err;
}

//summ of errors
function total_error(eps, omega, hx, hy, method)
{
	return hx * hy * sum(abs(linear(solve(eps, omega, hx, hy, method), true_solution(hx, hy), 1, -1)));
}