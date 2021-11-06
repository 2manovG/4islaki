//inputs
var input_hx = document.getElementById("input_hx");
var input_hy = document.getElementById("input_hy");
var input_x = document.getElementById("input_x");
var input_y = document.getElementById("input_y");
var input_eps = document.getElementById("input_eps");
var input_omega = document.getElementById("input_omega");

//radio buttons
var radio_m1 = document.getElementById("radio_m1");
var radio_m2 = document.getElementById("radio_m2");
var radio_m3 = document.getElementById("radio_m3");

//default values
input_hx.value = 0.05;
input_hy.value = 0.05;
input_x.value = 0.5;
input_y.value = 0.5;
input_eps.value = 0.0001;
input_omega.value = 0.9;

radio_m1.checked = true;

//entry point
function run(type)
{
	//get values
	let eps, omega, hx, hy, x, y, method, A = Math.PI / 2;
	hx = +input_hx.value;
	hy = +input_hy.value;
	x = +input_x.value;
	y = +input_y.value;
	eps = +input_eps.value;
	omega = +input_omega.value;
	
	if (radio_m2.checked) method = 2;
	else if (radio_m3.checked) method = 3;
	else method = 1;
	
	//check values
	if (!(eps > 0)) return alert("Погрешность должна быть положительна");
	if (!(omega > 0)) return alert("Коэффициент релаксации должен быть положителен");
	if (!(hx > 0)) return alert("hx должно быть положительно");
	if (!(hy > 0)) return alert("hy должно быть отрицательно");
	if (!(x >= 0) || !(x < A)) return alert("x должен быть в пределах от 0 до " + A);
	if (!(y >= 0) || !(y < A)) return alert("y должен быть в пределах от 0 до " + A);
	
	//additional values
	let errMaxX = 0.2, errStepX = 0.01, errMaxY = 0.2, errStepY = 0.01;
	
	//draw plot
	switch (type)
	{
		case 'numx':
		{
			let data2d = solve(eps, omega, hx, hy, method);
			let data1d = [], j = Math.floor(y / A * (data2d[0].length - 1));
			
			for (let i in data2d) if (i != "iters") data1d.push(data2d[i][j]);
			data1d.iters = data2d.iters;
			draw1D(data1d, A);
			break;
		}
		case 'numy':
		{
			let data2d = solve(eps, omega, hx, hy, method);
			let data1d = [], i = Math.floor(x / A * (data2d.length - 1));
			
			for (let j in data2d[0]) data1d.push(data2d[i][j]);
			data1d.iters = data2d.iters;
			draw1D(data1d, A);
			break;
		}
		
		case 'num2d':
		{
			let data2d = solve(eps, omega, hx, hy, method);
			draw2D(data2d, A, A);
			break;
		}
		
		case 'truex':
		{
			let data2d = true_solution(hx, hy);
			let data1d = [], j = Math.floor(y / A * (data2d[0].length - 1));
			
			for (let i in data2d) data1d.push(data2d[i][j]);
			draw1D(data1d, A);
			break;
		}
		case 'truey':
		{
			let data2d = true_solution(hx, hy);
			let data1d = [], i = Math.floor(x / A * (data2d.length - 1));
			
			for (let j in data2d[0]) data1d.push(data2d[i][j]);
			draw1D(data1d, A);
			break;
		}
		
		case 'true2d':
		{
			let data2d = true_solution(hx, hy);
			draw2D(data2d, A, A);
			break;
		}
		
		case 'errx':
		{
			let data2d = error(eps, omega, hx, hy, method);
			let data1d = [], j = Math.floor(y / A * (data2d[0].length - 1));
			
			for (let i in data2d) if (i != "iters") data1d.push(data2d[i][j]);
			data1d.iters = data2d.iters;
			draw1D(data1d, A);
			break;
		}
		case 'erry':
		{
			let data2d = error(eps, omega, hx, hy, method);
			let data1d = [], i = Math.floor(x / A * (data2d.length - 1));
			
			for (let j in data2d[0]) data1d.push(data2d[i][j]);
			data1d.iters = data2d.iters;
			draw1D(data1d, A);
			break;
		}
		
		case 'err2d':
		{
			let data2d = error(eps, omega, hx, hy, method);
			draw2D(data2d, A, A);
			break;
		}
		
		case 'errh':
		{
			let data1d = [], max = 0;
			
			for (let hx0 = 0; hx0 < errMaxX; hx0 += errStepX)
				if (hx0 == 0) data1d.push(0);
				else
				{
					let val = total_error(eps, omega, hx0, hy, method);
					if (val > 100) val = -1;
					if (val > max) max = val;
					data1d.push(val);
				}
			for (let i = 0; i < data1d.length; i++)
				if (data1d[i] == -1) data1d[i] = max;
			
			draw1D(data1d, errMaxX);
			break;
		}
		
		case 'errt':
		{
			let data1d = [], max = 0;
			
			for (let hy0 = 0; hy0 < errMaxY; hy0 += errStepY)
				if (hy0 == 0) data1d.push(0);
				else
				{
					let val = total_error(eps, omega, hx, hy0, method);
					if (val > 100) val = -1;
					if (val > max) max = val;
					data1d.push(val);
				}
			for (let i = 0; i < data1d.length; i++)
				if (data1d[i] == -1) data1d[i] = max;
			
			draw1D(data1d, errMaxY);
			break;
		}
		
		case 'errht':
		{
			let data2d = [], max = 0;
			
			for (let hx0 = 0; hx0 < errMaxX; hx0 += errStepX)
			{
				data2d.push([]);
				for (let hy0 = 0; hy0 < errMaxY; hy0 += errStepY)
					if (hx0 == 0 || hy0 == 0) data2d[data2d.length - 1].push(0);
					else
					{
						let val = total_error(eps, omega, hx0, hy0, method);
						if (val > 100) val = -1;
						if (val > max) max = val;
						data2d[data2d.length - 1].push(val);
					}
			}
			for (let i = 0; i < data2d.length; i++)
				for (let j = 0; j < data2d[0].length; j++)
					if (data2d[i][j] == -1) data2d[i][j] = max;
			
			draw2D(data2d, "hx: " + errMaxX, "hy: " + errMaxY);
			break;
		}
	}
}