//inputs
var input_a = document.getElementById("input_a");
var input_b = document.getElementById("input_b");
var input_mu = document.getElementById("input_mu");
var input_hx = document.getElementById("input_hx");
var input_hy = document.getElementById("input_hy");
var input_tau = document.getElementById("input_tau");
var input_x = document.getElementById("input_x");
var input_y = document.getElementById("input_y");
var input_t = document.getElementById("input_t");
var input_T = document.getElementById("input_T");

//radio buttons
var radio_m1 = document.getElementById("radio_m1");
var radio_m2 = document.getElementById("radio_m2");
var radio_a1 = document.getElementById("radio_a1");
var radio_a2 = document.getElementById("radio_a2");

//default values
input_a.value = 1;
input_b.value = 1;
input_mu.value = 1;
input_hx.value = 0.15;
input_hy.value = 0.15;
input_tau.value = 0.01;
input_x.value = 0.5;
input_y.value = 0.5;
input_t.value = 0.5;
input_T.value = 2;

radio_m1.checked = radio_a1.checked = true;

//entry point
function run(type)
{
	//get values
	let a, b, mu, hx, hy, tau, x, y, t, T, method, approx;
	a = +input_a.value;
	b = +input_b.value;
	mu = +input_mu.value;
	hx = +input_hx.value;
	hy = +input_hy.value;
	tau = +input_tau.value;
	x = +input_x.value;
	y = +input_y.value;
	t = +input_t.value;
	T = +input_T.value;
	
	if (radio_m2.checked) method = 2;
	else method = 1;
	
	if (radio_a2.checked) approx = 2;
	else approx = 1;
	
	//check values
	if (!(a > 0)) return alert("a должно быть положительно");
	if (!(b > 0)) return alert("b должно быть положительно");
	if (!(mu > 0)) return alert("Мю должно быть положительно");
	if (!(hx > 0)) return alert("hx должно быть положительно");
	if (!(hy > 0)) return alert("hy должно быть положительно");
	if (!(tau > 0)) return alert("Тау должно быть положительно");
	if (!(x >= 0)) return alert("x должно быть неотрицательно");
	if (!(y >= 0)) return alert("y должно быть неотрицательно");
	if (!(t >= 0)) return alert("t должно быть неотрицательно");;
	if (!(x <= Math.PI)) return alert("x должно быть не больше " + Math.PI);
	if (!(y <= Math.PI)) return alert("y должно быть не больше " + Math.PI);
	if (!(t <= T)) return alert("T должно быть не меньше t");
	
	//additional values
	let errMaxH = 0.2, errStepH = 0.01, errMaxT = 0.2, errStepT = 0.01;
	
	//draw plot
	switch (type)
	{
		case 'numxy':
		{
			let data2d = sliceXY(solve(a, b, mu, hx, hy, tau, T, method, approx), t / T);
			draw2D(data2d, Math.PI, Math.PI);
			break;
		}
		case 'numxt':
		{
			let data2d = sliceXT(solve(a, b, mu, hx, hy, tau, T, method, approx), y / Math.PI);
			draw2D(data2d, Math.PI, T);
			break;
		}
		case 'numyt':
		{
			let data2d = sliceYT(solve(a, b, mu, hx, hy, tau, T, method, approx), x / Math.PI);
			draw2D(data2d, Math.PI, T);
			break;
		}
		
		case 'truexy':
		{
			let data2d = sliceXY(true_solution(a, b, mu, hx, hy, tau, T), t / T);
			draw2D(data2d, Math.PI, Math.PI);
			break;
		}
		case 'truext':
		{
			let data2d = sliceXT(true_solution(a, b, mu, hx, hy, tau, T), y / Math.PI);
			draw2D(data2d, Math.PI, T);
			break;
		}
		case 'trueyt':
		{
			let data2d = sliceYT(true_solution(a, b, mu, hx, hy, tau, T), x / Math.PI);
			draw2D(data2d, Math.PI, T);
			break;
		}
		
		case 'errxy':
		{
			let data2d = sliceXY(error(a, b, mu, hx, hy, tau, T, method, approx), t / T);
			draw2D(data2d, Math.PI, Math.PI);
			break;
		}
		case 'errxt':
		{
			let data2d = sliceXT(error(a, b, mu, hx, hy, tau, T, method, approx), y / Math.PI);
			draw2D(data2d, Math.PI, T);
			break;
		}
		case 'erryt':
		{
			let data2d = sliceYT(error(a, b, mu, hx, hy, tau, T, method, approx), x / Math.PI);
			draw2D(data2d, Math.PI, T);
			break;
		}
		
		case 'errhx':
		{
			let data1d = [], max = 0;
			
			for (let hx0 = 0; hx0 < errMaxH; hx0 += errStepH)
				if (hx0 == 0) data1d.push(0);
				else
				{
					let val = total_error(a, b, mu, hx0, hy, tau, T, method, approx);
					if (val > 100) val = -1;
					if (val > max) max = val;
					data1d.push(val);
				}
			for (let i = 0; i < data1d.length; i++)
				if (data1d[i] == -1) data1d[i] = max;
			
			draw1D(data1d, errMaxH);
			break;
		}
		case 'errhy':
		{
			let data1d = [], max = 0;
			
			for (let hy0 = 0; hy0 < errMaxH; hy0 += errStepH)
				if (hy0 == 0) data1d.push(0);
				else
				{
					let val = total_error(a, b, mu, hx, hy0, tau, T, method, approx);
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
			
			for (let tau0 = 0; tau0 < errMaxT; tau0 += errStepT)
				if (tau0 == 0) data1d.push(0);
				else
				{
					let val = total_error(a, b, mu, hx, hy, tau0, T, method, approx);
					if (val > 100) val = -1;
					if (val > max) max = val;
					data1d.push(val);
				}
			for (let i = 0; i < data1d.length; i++)
				if (data1d[i] == -1) data1d[i] = max;
			
			draw1D(data1d, errMaxT);
			break;
		}
	}
}