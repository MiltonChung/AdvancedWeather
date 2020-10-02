const OPENWEATHER_API = {
	key: "f875c884aeaad90f2cdd429caa0b6dc8",
	baseurl: "http://api.openweathermap.org/data/2.5/",
	icon_baseurl: "http://openweathermap.org/img/wn/",
	baseurlZip: "http://api.openweathermap.org/data/2.5/weather?zip=",
	//http://api.openweathermap.org/data/2.5/weather?zip=95132&appid=f875c884aeaad90f2cdd429caa0b6dc8
};

const AQI_API = {
	key: "431269651b5649b8d9c5dd32bfcdd9ffa0b0796e",
	baseurl: "https://api.waqi.info/feed/",
	//https://api.waqi.info/feed/PLACENAME/?token=API_KEY
};

const OPENGATE_API = {
	key: "ebfe151b4a124bc4bf79e2f64207e061",
	baseurl: "https://api.opencagedata.com/geocode/v1/",
	//https://api.opencagedata.com/geocode/v1/json?q=PLACENAME&key=YOUR-API-KEY
};

const searchbox = document.querySelector(".search-box");
searchbox.addEventListener("keypress", setQuery);
var isNumber = /^[0-9]+$/;
let lat = 0;
let lon = 0;

function setDateOnLoad() {
	let now = new Date();
	let date = document.querySelector(".location .date");
	date.innerText = dateBuilder(now);
}
setDateOnLoad();

function setQuery(e) {
	if (e.keyCode == 13) {
		//enter key
		if (searchbox.value.match(isNumber)) {
			getResultsByZip(searchbox.value);
		} else {
			getResultsByCity(searchbox.value);
		}
	}
}

function getResultsByZip(query) {
	fetch(
		`${OPENWEATHER_API.baseurlZip}${query}&units=metric&appid=${OPENWEATHER_API.key}`
	)
		.then((weather) => {
			return weather.json();
		})
		.then(displayWeather)
		.catch((e) => {
			console.log("error", e);
		});
}

function getResultsByCity(query) {
	// console.log(
	// 	`${OPENWEATHER_API.baseurl}weather?q=${query}&units=metric&APPID=${OPENWEATHER_API.key}`
	// );
	fetch(
		`${OPENWEATHER_API.baseurl}weather?q=${query}&units=metric&APPID=${OPENWEATHER_API.key}`
	)
		.then((weather) => {
			return weather.json();
		})
		.then(displayWeather)
		.catch((e) => {
			console.log("error", e);
		});
}

function getAqiResult(query) {
	// console.log(`${AQI_API.baseurl}${query}/?token=${AQI_API.key}`);
	fetch(`${AQI_API.baseurl}${query}/?token=${AQI_API.key}`)
		.then((aqi) => {
			return aqi.json();
		})
		.then(displayAQI)
		.catch((e) => {
			console.log("error", e);
		});
}

function displayAQI(aqi) {
	const aqiScale = {
		Good:
			"Air quality is considered satisfactory, and air pollution poses little or no risk",
		Moderate:
			"Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.",
		"Unhealthy for Sensitive Groups":
			"Members of sensitive groups may experience health effects. The general public is not likely to be affected.",
		Unhealthy:
			"Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects",
		"Very Unhealthy":
			"Health warnings of emergency conditions. The entire population is more likely to be affected.",
		Hazardous:
			"Health alert: everyone may experience more serious health effects	",
		";(":
			"Sorry, can't find the AQI for this. There may not be a station nearby.",
	};

	const aqiColor = {
		Good: "3ABE3F",
		Moderate: "E4E752",
		"Unhealthy for Sensitive Groups": "DD9C3A",
		Unhealthy: "E22222",
		"Very Unhealthy": "7B01A6",
		Hazardous: "5F3900",
	};

	let currAQI = aqi.data.aqi;
	if (aqi.data.aqi == undefined) {
		currAQI = "-";
	}
	let currAQIdescr = determineAqiScale(currAQI);

	const aqiNumber = document.querySelector(".aqiContainer .aqiLeft .aqiNumber");
	aqiNumber.innerText = currAQI;

	const aqiInfo = document.querySelector(".aqiContainer .aqiRight p");
	aqiInfo.innerText = aqiScale[currAQIdescr];

	const aqiLevel = document.querySelector(
		".aqiContainer .aqiLeft .aqiLabel button"
	);
	aqiLevel.innerText = currAQIdescr;
	aqiLevel.style.backgroundColor = `#${aqiColor[currAQIdescr]}`;

	const ozone = document.querySelector(
		".aqiContainer .aqiLeft .additional .ozone"
	);
	ozone.innerText = `Ozone: ${aqi.data.iaqi.o3.v} |`;

	const pm25 = document.querySelector(
		".aqiContainer .aqiLeft .additional .pm25"
	);
	pm25.innerText = `PM2.5: ${aqi.data.iaqi.pm25.v}`;
}

function determineAqiScale(aqi) {
	if (aqi <= 50) {
		return "Good";
	} else if (aqi >= 51 && aqi <= 100) {
		return "Moderate";
	} else if (aqi >= 101 && aqi <= 150) {
		return "Unhealthy for Sensitive Groups";
	} else if (aqi >= 151 && aqi <= 200) {
		return "Unhealthy";
	} else if (aqi >= 201 && aqi <= 300) {
		return "Very Unhealthy";
	} else if (aqi > 300) {
		return "Hazardous";
	} else {
		return ";(";
	}
}

function displayWeather(weather) {
	if (weather.cod === "404") {
		badInput(weather);
		return;
	}

	lat = weather.coord.lat;
	lon = weather.coord.lon;
	getAqiResult(weather.name);

	let now = new Date();
	let time = document.querySelector(".location .time");
	time.innerText = timeBuilder(now);

	let city = document.querySelector(".location .city");
	city.innerText = `${weather.name}, ${weather.sys.country}`;

	let temp = document.querySelector(".current .temp");
	let tempInC = Number(`${Math.round(weather.main.temp)}`);

	let current_icon_code = weather.weather[0].icon;
	let complete_icon = `<img src="${OPENWEATHER_API.icon_baseurl}${current_icon_code}@2x.png" />`;
	temp.innerHTML = `${CelToFah(tempInC)} °F ${complete_icon}`;

	let weather_el = document.querySelector(".current .weather");
	weather_el.innerText = weather.weather[0].main;

	let hilow = document.querySelector(".hi-low");
	let tempInCHi = Number(`${Math.round(weather.main.temp_max)}`);
	let tempInCLow = Number(`${Math.round(weather.main.temp_min)}`);
	hilow.innerText = `${CelToFah(tempInCHi)}°F / ${CelToFah(tempInCLow)}°F`;
}

function CelToFah(c) {
	return Math.round(c * 1.8 + 32);
}

function dateBuilder(d) {
	let months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	let date = d.getDate();
	let month = months[d.getMonth()];
	let year = d.getFullYear();

	return `${month} ${date}, ${year}`;
}

function timeBuilder(d) {
	let hourConvert = {
		0: "12",
		1: "1",
		2: "2",
		3: "3",
		4: "4",
		5: "5",
		6: "6",
		7: "7",
		8: "8",
		9: "9",
		10: "10",
		11: "11",
		12: "12",
		13: "1",
		14: "2",
		15: "3",
		16: "4",
		17: "5",
		18: "6",
		19: "7",
		20: "8",
		21: "9",
		22: "10",
		23: "11",
	};

	let hour = hourConvert[d.getHours()];
	let minute = d.getMinutes();
	let amORpm;
	if (d.getHours() >= 12) {
		amORpm = "PM";
	} else {
		amORpm = "AM";
	}

	return `as of ${hour}:${minute}${amORpm}`;
}

function badInput(weather) {
	alert("No results found! Please check your input.");
}
