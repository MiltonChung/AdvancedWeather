const OPENWEATHER_API = {
	key: "f875c884aeaad90f2cdd429caa0b6dc8",
	baseurl: "http://api.openweathermap.org/data/2.5/",
	icon_baseurl: "http://openweathermap.org/img/wn/",
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
		getResults(searchbox.value);
	}
}

function getResults(query) {
	console.log(
		`${OPENWEATHER_API.baseurl}weather?q=${query}&units=metric&APPID=${OPENWEATHER_API.key}`
	);
	fetch(
		`${OPENWEATHER_API.baseurl}weather?q=${query}&units=metric&APPID=${OPENWEATHER_API.key}`
	)
		.then((weather) => {
			return weather.json();
		})
		.then(displayResults);
}

function displayResults(weather) {
	lat = weather.coord.lat;
	lon = weather.coord.lon;
	let city = document.querySelector(".location .city");
	city.innerText = `${weather.name}, ${weather.sys.country}`;

	let temp = document.querySelector(".current .temp");
	let tempInC = Number(`${Math.round(weather.main.temp)}`);

	// let weather_icon = document.querySelector(".current .weather_icon");
	let current_icon_code = weather.weather[0].icon;
	let complete_icon = `<img src="${OPENWEATHER_API.icon_baseurl}${current_icon_code}@2x.png" />`;
	// weather_icon.innerHTML = complete_icon;
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
