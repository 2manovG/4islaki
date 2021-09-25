//conditions
function init(x) { return Math.sin(x); }

let alpha = 1, beta = 1;
function left(t, a, b, c) { return Math.exp((c - a) * t) * (Math.cos(b * t) + Math.sin(b * t)); }

let gamma = 1, delta = 1;
function right(t, a, b, c) { return -Math.exp((c - a) * t) * (Math.cos(b * t) + Math.sin(b * t)); }

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
function solve(a, b, c, h, tau, T, method, approx)
{
	let sigma = a * tau / (h * h);
	//console.log(sigma);
	
	//clark-nickleson
	if (method == 3)
	{
		return linear(solve(a, b, c, h, tau, T, 1, approx), solve(a, b, c, h, tau, T, 2, approx), 0.5, 0.5);
	}
	
	//other methods
	let u = [], xlen = 0, tlen = 0;
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
	for (let i = 0; i < xlen; i++) u[i][0] = init(h * i);
	
	//explicit
	if (method == 1)
	{
		for (let j = 1; j < tlen; j++)
		{
			for (let i = 1; i < xlen - 1; i++)
				u[i][j] = tau * (a / (h * h) * (u[i - 1][j - 1] - 2 * u[i][j - 1] + u[i + 1][j - 1]) +
					b / (2 * h) * (u[i + 1][j - 1] - u[i - 1][j - 1]) + c * u[i][j - 1]) + u[i][j - 1];
			
			if (approx == 1)
			{
				u[0][j] = (h * left(j * tau, a, b, c) - alpha * u[1][j]) / (beta * h - alpha);
				u[xlen - 1][j] = (h * right(j * tau, a, b, c) + gamma * u[xlen - 2][j]) / (delta * h + gamma);
			}
			else if (approx == 2)
			{
				u[0][j] = (2 * h * left(j * tau, a, b, c) - 4 * alpha * u[1][j] + alpha * u[2][j]) / (2 * beta * h - 3 * alpha);
				u[xlen - 1][j] = (2 * h * right(j * tau, a, b, c) + 4 * gamma * u[xlen - 2][j] - gamma * u[xlen - 3][j]) / (2 * delta * h + 3 * gamma);
			}
			else
			{
				let b0, c0, d0, an, bn, dn;
				b0 = 2 * a / h + h / tau - c * h - beta / alpha * (2 * a - b * h);
				c0 = -2 * a / h;
				d0 = h / tau * u[0][j - 1] - left(j * tau, a, b, c) * (2 * a - b * h) / alpha;
				
				an = -2 * a / h;
				bn = 2 * a / h + h / tau - c * h + delta / gamma * (2 * a + b * h);
				dn = h / tau * u[xlen - 1][j - 1] + right(j * tau, a, b, c) * (2 * a + b * h) / gamma;
				
				u[0][j] = (d0 - c0 * u[1][j]) / b0;
				u[xlen - 1][j] = (dn - an * u[xlen - 2][j]) / bn;
			}
		}
	}
	else
	//implicit
	{
		for (let j = 1; j < tlen; j++)
		{
			let	A = [], B = [], C = [], D = [], x;
			
			if (approx == 1)
			{
				A.push(0);
				B.push(beta * h - alpha);
				C.push(alpha);
				D.push(left(j * tau, a, b, c) * h);
				
				for (let i = 1; i < xlen - 1; i++)
				{
					A.push(-a / (h * h) + b / (2 * h));
					B.push(2 * a / (h * h) + 1 / tau - c);
					C.push(-a / (h * h) - b / (2 * h));
					D.push(u[i][j - 1] / tau);
				}
				
				A.push(-gamma);
				B.push(delta * h + gamma);
				C.push(0);
				D.push(right(j * tau, a, b, c) * h);
			}
			else if (approx == 2)
			{
				A.push(0);
				B.push(2 * beta * h - 3 * alpha);
				C.push(4 * alpha);
				let e1 = -alpha;
				D.push(left(j * tau, a, b, c) * 2 * h);
				
				for (let i = 1; i < xlen - 1; i++)
				{
					A.push(-a / (h * h) + b / (2 * h));
					B.push(2 * a / (h * h) + 1 / tau - c);
					C.push(-a / (h * h) - b / (2 * h));
					D.push(u[i][j - 1] / tau);
				}
			
				let e2 = gamma;
				A.push(-4 * gamma);
				B.push(2 * delta * h + 3 * gamma);
				C.push(0);
				D.push(right(j * tau, a, b, c) * 2 * h);
				
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
				B.push(2 * a / h + h / tau - c * h - beta / alpha * (2 * a - b * h));
				C.push(-2 * a / h);
				D.push(h / tau * u[0][j - 1] - left(j * tau, a, b, c) * (2 * a - b * h) / alpha);
				
				for (let i = 1; i < xlen - 1; i++)
				{
					A.push(-a / (h * h) + b / (2 * h));
					B.push(2 * a / (h * h) + 1 / tau - c);
					C.push(-a / (h * h) - b / (2 * h));
					D.push(u[i][j - 1] / tau);
				}
				
				A.push(-2 * a / h);
				B.push(2 * a / h + h / tau - c * h + delta / gamma * (2 * a + b * h));
				C.push(0);
				D.push(h / tau * u[xlen - 1][j - 1] + right(j * tau, a, b, c) * (2 * a + b * h) / gamma);
			}
			
			x = three_diag(A, B, C, D);
			for (let i = 0; i < xlen; i++) u[i][j] = x[i];
		}
	}
	
	return u;
}

//true solution
function true_solution(a, b, c, h, tau, T)
{
	let u = [];
	
	for (let x = 0; x < Math.PI; x += h)
	{
		u.push([]);
		for (let t = 0; t < T; t += tau) u[u.length - 1].push(Math.exp((c - a) * t) * Math.sin(x + b * t));
	}
	return u;
}

//abs of diff
function error(a, b, c, h, tau, T, method, approx)
{
	return abs(linear(solve(a, b, c, h, tau, T, method, approx), true_solution(a, b, c, h, tau, T), 1, -1));
}

//summ of errors
function total_error(a, b, c, h, tau, T, method, approx)
{
	return h * tau * sum(abs(linear(solve(a, b, c, h, tau, T, method, approx), true_solution(a, b, c, h, tau, T), 1, -1)));
}