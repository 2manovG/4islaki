//conditions
function init1(x) { return Math.sin(x); }
function init2(x) { return -Math.sin(x); }

function init1d1(x) { return Math.cos(x); }
function init1d2(x) { return -Math.sin(x); }

//let alpha = 1, beta = 0;
function left(t) { return Math.exp(-t); }

//let gamma = 1, delta = 0;
function right(t) { return -Math.exp(-t); }

function f(x, t) { return -Math.cos(x) * Math.exp(-t); }

//additional functions
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
function solve(h, tau, T, method, approx, bpprox)
{
	let sigma = tau * tau / (h * h);
	//console.log(sigma, h, tau, T, method, approx, bpprox);
	
	let u = [], xlen = 0, tlen = 0, tau2 = tau * tau, h2 = h * h;
	for (let x = 0; x < Math.PI; x += h) 
	{
		u.push([]);
		xlen++;
		for (let t = 0; t < T; t += tau)
		{
			u[u.length - 1].push(0);
			if (x == 0) tlen++;
		}
	}
	
	//initial condition
	for (let i = 0; i < xlen; i++)
	{
		u[i][0] = init1(h * i);
		
		//bpprox
		if (bpprox == 1) u[i][1] = u[i][0] + tau * init2(h * i);
		else u[i][1] = u[i][0] + tau * init2(h * i) + 0.5 * tau2 * (init1d2(h * i) + init1d1(h * i) - init1(h * i) + f(h * i, 0) - 3 * init2(h * i));
	}
	
	//explicit
	if (method == 1)
	{
		for (let j = 2; j < tlen; j++)
		{
			for (let i = 1; i < xlen - 1; i++)
				u[i][j] = (u[i][j - 2] * (-1 / tau2 + 1.5 / tau) + u[i - 1][j - 1] * (1 / h2 - 0.5 / h) + u[i + 1][j - 1] * (1 / h2 + 0.5 / h) +
					u[i][j - 1] * (2 / tau2 - 2 / h2 - 1) + f(h * i, tau * (j - 1))) / (1 / tau2 + 1.5 / tau);
			
			if (approx == 1)
			{
				u[0][j] = -h * left(j * tau) + u[1][j];
				u[xlen - 1][j] = h * right(j * tau) + u[xlen - 2][j];
			}
			else if (approx == 2)
			{
				u[0][j] = (4 * u[1][j] - u[2][j] - 2 * h * left(j * tau)) / 3;
				u[xlen - 1][j] = (4 * u[xlen - 2][j] - u[xlen - 3][j] + 2 * h * right(j * tau)) / 3;
			}
			else
			{
				u[0][j] = ((h - 1) * left(j * tau) + 0.5 * h2 / tau2 * (u[0][j - 2] - 2 * u[0][j - 1]) +
					1.5 / tau * (u[0][j - 2] - 4 * u[0][j - 1]) - f(0, j * tau) - u[1][j]) / (-2 - 0.5 * h2 / tau2 - 4.5 / tau);
					
				u[xlen - 1][j] = ((-h - 1) * right(j * tau) + 0.5 * h2 / tau2 * (u[xlen - 1][j - 2] - 2 * u[xlen - 1][j - 1]) +
					1.5 / tau * (u[xlen - 1][j - 2] - 4 * u[xlen - 1][j - 1]) - f((xlen - 1) * h, j * tau) - u[xlen - 2][j]) / (-2 - 0.5 * h2 / tau2 - 4.5 / tau);
			}
		}
	}
	else
	//implicit
	{
		for (let j = 2; j < tlen; j++)
		{
			let	A = [], B = [], C = [], D = [], x;
			
			if (approx == 1)
			{
				A.push(0);
				B.push(-1);
				C.push(1);
				D.push(left(j * tau) * h);
				
				for (let i = 1; i < xlen - 1; i++)
				{
					A.push(1 / h2 - 0.5 / h);
					B.push(-1 / tau2 - 4.5 / tau - 2 / h2 - 1);
					C.push(1 / h2 + 0.5 / h);
					D.push(-f(h * i, tau * j) + u[i][j - 1] * (-2 / tau2 - 6 / tau) + u[i][j - 2] * (1 / tau2 + 1.5 / tau));
				}
				
				A.push(-1);
				B.push(1);
				C.push(0);
				D.push(right(j * tau) * h);
			}
			else if (approx == 2)
			{
				A.push(0);
				B.push(-3);
				C.push(4);
				let e1 = -1;
				D.push(left(j * tau) * 2 * h);
				
				for (let i = 1; i < xlen - 1; i++)
				{
					A.push(1 / h2 - 0.5 / h);
					B.push(-1 / tau2 - 4.5 / tau - 2 / h2 - 1);
					C.push(1 / h2 + 0.5 / h);
					D.push(-f(h * i, tau * j) + u[i][j - 1] * (-2 / tau2 - 6 / tau) + u[i][j - 2] * (1 / tau2 + 1.5 / tau));
				}
			
				let e2 = 1;
				A.push(-4);
				B.push(3);
				C.push(0);
				D.push(right(j * tau) * 2 * h);
				
				//get rid or e1,e2
				let k1 = -e1 / C[1], k2 = -e2 / A[xlen - 2];
				
				B[0] += A[1] * k1;
				C[0] += B[1] * k1;
				D[0] += D[1] * k1;
				
				A[xlen - 1] += B[xlen - 2] * k2;
				B[xlen - 1] += C[xlen - 2] * k2;
				D[xlen - 1] += D[xlen - 2] * k2;
			}
			else
			{
				A.push(0);
				B.push(-2 - 0.5 * h2 / tau2 - 4.5 / tau);
				C.push(1);
				D.push((h - 1) * left(j * tau) + 0.5 * h2 / tau2 * (u[0][j - 2] - 2 * u[0][j - 1]) +
					1.5 / tau * (u[0][j - 2] - 4 * u[0][j - 1]) - f(0, j * tau));
				
				for (let i = 1; i < xlen - 1; i++)
				{
					A.push(1 / h2 - 0.5 / h);
					B.push(-1 / tau2 - 4.5 / tau - 2 / h2 - 1);
					C.push(1 / h2 + 0.5 / h);
					D.push(-f(h * i, tau * j) + u[i][j - 1] * (-2 / tau2 - 6 / tau) + u[i][j - 2] * (1 / tau2 + 1.5 / tau));
				}
				
				A.push(1);
				B.push(-2 - 0.5 * h2 / tau2 - 4.5 / tau);
				C.push(0);
				D.push((-h - 1) * right(j * tau) + 0.5 * h2 / tau2 * (u[xlen - 1][j - 2] - 2 * u[xlen - 1][j - 1]) +
					1.5 / tau * (u[xlen - 1][j - 2] - 4 * u[xlen - 1][j - 1]) - f((xlen - 1) * h, j * tau));
			}
			
			x = three_diag(A, B, C, D);
			for (let i = 0; i < xlen; i++) u[i][j] = x[i];
		}
	}
	
	return u;
}

//true solution
function true_solution(h, tau, T)
{
	let u = [];
	
	for (let x = 0; x < Math.PI; x += h)
	{
		u.push([]);
		for (let t = 0; t < T; t += tau) u[u.length - 1].push(Math.exp(-t) * Math.sin(x));
	}
	return u;
}

//abs of diff
function error(h, tau, T, method, approx, bpprox)
{
	return abs(linear(solve(h, tau, T, method, approx, bpprox), true_solution(h, tau, T), 1, -1));
}

//summ of errors
function total_error(h, tau, T, method, approx, bpprox)
{
	return h * tau * sum(abs(linear(solve(h, tau, T, method, approx, bpprox), true_solution(h, tau, T), 1, -1)));
}