//inputs
var input_a = document.getElementById("input_a");
var input_b = document.getElementById("input_b");
var input_c = document.getElementById("input_c");
var input_h = document.getElementById("input_h");
var input_tau = document.getElementById("input_tau");
var input_t = document.getElementById("input_t");
var input_T = document.getElementById("input_T");

//radio buttons
var radio_m1 = document.getElementById("radio_m1");
var radio_m2 = document.getElementById("radio_m2");
var radio_m3 = document.getElementById("radio_m3");
var radio_a1 = document.getElementById("radio_a1");
var radio_a2 = document.getElementById("radio_a2");
var radio_a3 = document.getElementById("radio_a3");

//default values
input_a.value = 0.125;
input_b.value = 1;
input_c.value = -1;
input_h.value = 0.05;
input_tau.value = 0.01;
input_t.value = 0.5;
input_T.value = 2;

radio_m1.checked = radio_a1.checked = true;

//entry point
function run(type)
{
	//get values
	let a, b, c, h, tau, t, T, method, approx;
	a = +input_a.value;
	b = +input_b.value;
	c = +input_c.value;
	h = +input_h.value;
	tau = +input_tau.value;
	t = +input_t.value;
	T = +input_T.value;
	
	if (radio_m2.checked) method = 2;
	else if (radio_m3.checked) method = 3;
	else method = 1;
	
	if (radio_a2.checked) approx = 2;
	else if (radio_a3.checked) approx = 3;
	else approx = 1;
	
	//check values
	if (!(a > 0)) return alert("a должно быть положительно");
	if (!(b > 0)) return alert("b должно быть положительно");
	if (!(c < 0)) return alert("c должно быть отрицательно");
	if (!(h > 0)) return alert("h должно быть положительно");
	if (!(tau > 0)) return alert("Тау должно быть положительно");
	if (!(t >= 0)) return alert("t должно быть неотрицательно");
	if (!(T >= t)) return alert("T должно быть не меньше t");
	
	//additional values
	let errMaxH = 0.2, errStepH = 0.005, errMaxT = 0.2, errStepT = 0.005;
	
	//draw plot
	switch (type)
	{
		case 'num1d':
		{
			let data2d = solve(a, b, c, h, tau, T, method, approx);
			let data1d = [], j = Math.floor(t / T * (data2d[0].length - 1));
			
			for (let i in data2d) data1d.push(data2d[i][j]);
			draw1D(data1d, Math.PI);
			break;
		}
		
		case 'num2d':
		{
			let data2d = solve(a, b, c, h, tau, T, method, approx);
			draw2D(data2d, Math.PI, T);
			break;
		}
		
		case 'true1d':
		{
			let data2d = true_solution(a, b, c, h, tau, T);
			let data1d = [], j = Math.floor(t / T * (data2d[0].length - 1));
			
			for (let i in data2d) data1d.push(data2d[i][j]);
			draw1D(data1d, Math.PI);
			break;
		}
		
		case 'true2d':
		{
			let data2d = true_solution(a, b, c, h, tau, T);
			draw2D(data2d, Math.PI, T);
			break;
		}
		
		case 'err1d':
		{
			let data2d = error(a, b, c, h, tau, T, method, approx);
			let data1d = [], j = Math.floor(t / T * (data2d[0].length - 1));
			
			for (let i in data2d) data1d.push(data2d[i][j]);
			draw1D(data1d, Math.PI);
			break;
		}
		
		case 'err2d':
		{
			let data2d = error(a, b, c, h, tau, T, method, approx);
			draw2D(data2d, Math.PI, T);
			break;
		}
		
		case 'errh':
		{
			let data1d = [], max = 0;
			
			for (let h0 = 0; h0 < errMaxH; h0 += errStepH)
				if (h0 == 0) data1d.push(0);
				else
				{
					let val = total_error(a, b, c, h0, tau, T, method, approx);
					if (val > 100) val = -1;
					if (val > max) max = val;
					data1d.push(val);
				}
			for (let i = 0; i < data1d.length; i++)
				if (data1d[i] == -1) data1d[i] = max;
			
			draw1D(data1d, errMaxH);
			break;
		}
		
		case 'errt':
		{
			let data1d = [], max = 0;
			
			for (let t0 = 0; t0 < errMaxT; t0 += errStepT)
				if (t0 == 0) data1d.push(0);
				else
				{
					let val = total_error(a, b, c, h, t0, T, method, approx);
					if (val > 100) val = -1;
					if (val > max) max = val;
					data1d.push(val);
				}
			for (let i = 0; i < data1d.length; i++)
				if (data1d[i] == -1) data1d[i] = max;
			
			draw1D(data1d, errMaxT);
			break;
		}
		
		case 'errht':
		{
			let data2d = [], max = 0;
			
			for (let h0 = 0; h0 < errMaxH; h0 += errStepH)
			{
				data2d.push([]);
				for (let t0 = 0; t0 < errMaxT; t0 += errStepT)
					if (h0 == 0 || t0 == 0) data2d[data2d.length - 1].push(0);
					else
					{
						let val = total_error(a, b, c, h0, t0, T, method, approx);
						if (val > 100) val = -1;
						if (val > max) max = val;
						data2d[data2d.length - 1].push(val);
					}
			}
			for (let i = 0; i < data2d.length; i++)
				for (let j = 0; j < data2d[0].length; j++)
					if (data2d[i][j] == -1) data2d[i][j] = max;
			
			draw2D(data2d, "h: " + errMaxH, "tau: " + errMaxT);
			break;
		}
	}
}