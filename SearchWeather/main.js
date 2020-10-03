const OPENWEATHER_API = {
	key: "f875c884aeaad90f2cdd429caa0b6dc8",
	baseurl: "https://api.openweathermap.org/data/2.5/",
	icon_baseurl: "https://openweathermap.org/img/wn/",
	zip_baseurl: "https://api.openweathermap.org/data/2.5/weather?zip=",
	latlong_baseurl: "https://api.openweathermap.org/data/2.5/onecall?",
	// https://api.openweathermap.org/data/2.5/onecall?lat=37.338207&lon=-121.886330&appid=f875c884aeaad90f2cdd429caa0b6dc8
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
		`${OPENWEATHER_API.zip_baseurl}${query}&units=metric&appid=${OPENWEATHER_API.key}`
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
	time.innerText = `as of ${timeBuilder(now)}`;

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
	getDetailedWeather(lat, lon);
}

function getDetailedWeather(lat, lon) {
	fetch(
		`${OPENWEATHER_API.latlong_baseurl}lat=${lat}&lon=${lon}&units=imperial&appid=${OPENWEATHER_API.key}`
	)
		.then((detailedWeather) => {
			return detailedWeather.json();
		})
		.then(displayDetailedWeather)
		.catch((e) => {
			console.log("error", e);
		});
}

function displayDetailedWeather(dWeather) {
	let feelsLike = document.querySelector(".tableLeft .row .feelLike");
	feelsLike.innerText = `${dWeather.current.feels_like}°F`;

	let pressure = document.querySelector(".tableLeft .row .pressure");
	pressure.innerText = `${dWeather.current.pressure} hPa`;

	let windSpeed = document.querySelector(".tableLeft .row .windSpeed");
	windSpeed.innerText = `${dWeather.current.wind_speed} mph`;

	let windDegree = document.querySelector(".tableLeft .row .windDegrees");
	windDegree.innerText = `${dWeather.current.wind_deg}°`;

	let sunrise = document.querySelector(".tableRight .row .sunrise");
	let sunriseInUTC = new Date(dWeather.current.sunrise * 1000);
	sunrise.innerText = `${timeBuilder(sunriseInUTC)}`;

	let sunset = document.querySelector(".tableRight .row .sunset");
	let sunsetInUTC = new Date(dWeather.current.sunset * 1000);
	sunset.innerText = `${timeBuilder(sunsetInUTC)}`;

	let uvi = document.querySelector(".tableRight .row .uvi");
	uvi.innerText = `${dWeather.current.uvi} of 10`;

	let humidity = document.querySelector(".tableRight .row .humidity");
	humidity.innerText = `${dWeather.current.humidity}%`;

	displayHourlyWeather(dWeather);
	displayDailyWeather(dWeather);
}

function displayHourlyWeather(dWeather) {
	// Display current weather
	let hourlyNow = document.querySelector(".hourlyRow .col .hourlyNow");
	hourlyNow.innerText = "Now";
	let hourlyNowTemp = document.querySelector(".hourlyRow .col .hourlyNowTemp");
	hourlyNowTemp.innerText = `${Math.floor(dWeather.current.temp)}°F`;
	let hourlyNowIcon = document.querySelector(".hourlyRow .col .hourlyNowIcon");
	let hourlyNowIconImg = getWeatherIconImg(dWeather.current.weather[0].icon);
	hourlyNowIcon.innerHTML = `${hourlyNowIconImg}`;
	let hourlyNowDescr = document.querySelector(
		".hourlyRow .col .hourlyNowDescr"
	);
	hourlyNowDescr.innerText = `${dWeather.current.weather[0].main}`;

	// Display next hour
	let hourlyOne = document.querySelector(".hourlyRow .col .hourlyOne");
	let hourOne = new Date(dWeather.hourly[1].dt * 1000);
	hourlyOne.innerText = formatHour(hourOne);
	let hourlyOneTemp = document.querySelector(".hourlyRow .col .hourlyOneTemp");
	hourlyOneTemp.innerText = `${Math.floor(dWeather.hourly[1].temp)}°F`;
	let hourlyOneIcon = document.querySelector(".hourlyRow .col .hourlyOneIcon");
	let hourlyOneIconImg = getWeatherIconImg(dWeather.hourly[1].weather[0].icon);
	hourlyOneIcon.innerHTML = `${hourlyOneIconImg}`;
	let hourlyOneDescr = document.querySelector(
		".hourlyRow .col .hourlyOneDescr"
	);
	hourlyOneDescr.innerText = `${dWeather.hourly[1].weather[0].main}`;

	// Display 2 hours from now
	let hourlyTwo = document.querySelector(".hourlyRow .col .hourlyTwo");
	let hourTwo = new Date(dWeather.hourly[2].dt * 1000);
	hourlyTwo.innerText = formatHour(hourTwo);
	let hourlyTwoTemp = document.querySelector(".hourlyRow .col .hourlyTwoTemp");
	hourlyTwoTemp.innerText = `${Math.floor(dWeather.hourly[2].temp)}°F`;
	let hourlyTwoIcon = document.querySelector(".hourlyRow .col .hourlyTwoIcon");
	let hourlyTwoIconImg = getWeatherIconImg(dWeather.hourly[2].weather[0].icon);
	hourlyTwoIcon.innerHTML = `${hourlyTwoIconImg}`;
	let hourlyTwoDescr = document.querySelector(
		".hourlyRow .col .hourlyTwoDescr"
	);
	hourlyTwoDescr.innerText = `${dWeather.hourly[2].weather[0].main}`;

	// Display 3 hours from now
	let hourlyThree = document.querySelector(".hourlyRow .col .hourlyThree");
	let hourThree = new Date(dWeather.hourly[3].dt * 1000);
	hourlyThree.innerText = formatHour(hourThree);
	let hourlyThreeTemp = document.querySelector(
		".hourlyRow .col .hourlyThreeTemp"
	);
	hourlyThreeTemp.innerText = `${Math.floor(dWeather.hourly[3].temp)}°F`;
	let hourlyThreeIcon = document.querySelector(
		".hourlyRow .col .hourlyThreeIcon"
	);
	let hourlyThreeIconImg = getWeatherIconImg(
		dWeather.hourly[3].weather[0].icon
	);
	hourlyThreeIcon.innerHTML = `${hourlyThreeIconImg}`;
	let hourlyThreeDescr = document.querySelector(
		".hourlyRow .col .hourlyThreeDescr"
	);
	hourlyThreeDescr.innerText = `${dWeather.hourly[3].weather[0].main}`;

	// Display 4 hours from now
	let hourlyFour = document.querySelector(".hourlyRow .col .hourlyFour");
	let hourFour = new Date(dWeather.hourly[4].dt * 1000);
	hourlyFour.innerText = formatHour(hourFour);
	let hourlyFourTemp = document.querySelector(
		".hourlyRow .col .hourlyFourTemp"
	);
	hourlyFourTemp.innerText = `${Math.floor(dWeather.hourly[4].temp)}°F`;
	let hourlyFourIcon = document.querySelector(
		".hourlyRow .col .hourlyFourIcon"
	);
	let hourlyFourIconImg = getWeatherIconImg(dWeather.hourly[4].weather[0].icon);
	hourlyFourIcon.innerHTML = `${hourlyFourIconImg}`;
	let hourlyFourDescr = document.querySelector(
		".hourlyRow .col .hourlyFourDescr"
	);
	hourlyFourDescr.innerText = `${dWeather.hourly[4].weather[0].main}`;
}

function displayDailyWeather(dWeather) {
	// Display current weather
	let dailyNow = document.querySelector(".dailyRow .col .dailyNow");
	dailyNow.innerText = "Today";
	let dailyNowTemp = document.querySelector(".dailyRow .col .dailyNowTemp");
	dailyNowTemp.innerText = `${Math.floor(dWeather.current.temp)}°F`;
	let dailyNowIcon = document.querySelector(".dailyRow .col .dailyNowIcon");
	let dailyNowIconImg = getWeatherIconImg(dWeather.current.weather[0].icon);
	dailyNowIcon.innerHTML = `${dailyNowIconImg}`;
	let dailyNowDescr = document.querySelector(".dailyRow .col .dailyNowDescr");
	dailyNowDescr.innerText = `${dWeather.current.weather[0].main}`;

	// Display next day
	let dailyOne = document.querySelector(".dailyRow .col .dailyOne");
	let dayOne = new Date(dWeather.daily[1].dt * 1000);
	dailyOne.innerText = formatDateAndDay(dayOne);
	let dailyOneTemp = document.querySelector(".dailyRow .col .dailyOneTemp");
	dailyOneTemp.innerText = `${Math.floor(dWeather.daily[1].temp.day)}°F`;
	let dailyOneIcon = document.querySelector(".dailyRow .col .dailyOneIcon");
	let dailyOneIconImg = getWeatherIconImg(dWeather.daily[1].weather[0].icon);
	dailyOneIcon.innerHTML = `${dailyOneIconImg}`;
	let dailyOneDescr = document.querySelector(".dailyRow .col .dailyOneDescr");
	dailyOneDescr.innerText = `${dWeather.daily[1].weather[0].main}`;

	// Display 2 days from now
	let dailyTwo = document.querySelector(".dailyRow .col .dailyTwo");
	let dayTwo = new Date(dWeather.daily[2].dt * 1000);
	dailyTwo.innerText = formatDateAndDay(dayTwo);
	let dailyTwoTemp = document.querySelector(".dailyRow .col .dailyTwoTemp");
	dailyTwoTemp.innerText = `${Math.floor(dWeather.daily[2].temp.day)}°F`;
	let dailyTwoIcon = document.querySelector(".dailyRow .col .dailyTwoIcon");
	let dailyTwoIconImg = getWeatherIconImg(dWeather.daily[2].weather[0].icon);
	dailyTwoIcon.innerHTML = `${dailyTwoIconImg}`;
	let dailyTwoDescr = document.querySelector(".dailyRow .col .dailyTwoDescr");
	dailyTwoDescr.innerText = `${dWeather.daily[2].weather[0].main}`;

	// Display 3 days from now
	let dailyThree = document.querySelector(".dailyRow .col .dailyThree");
	let dayThree = new Date(dWeather.daily[3].dt * 1000);
	dailyThree.innerText = formatDateAndDay(dayThree);
	let dailyThreeTemp = document.querySelector(".dailyRow .col .dailyThreeTemp");
	dailyThreeTemp.innerText = `${Math.floor(dWeather.daily[3].temp.day)}°F`;
	let dailyThreeIcon = document.querySelector(".dailyRow .col .dailyThreeIcon");
	let dailyThreeIconImg = getWeatherIconImg(dWeather.daily[3].weather[0].icon);
	dailyThreeIcon.innerHTML = `${dailyThreeIconImg}`;
	let dailyThreeDescr = document.querySelector(
		".dailyRow .col .dailyThreeDescr"
	);
	dailyThreeDescr.innerText = `${dWeather.daily[3].weather[0].main}`;

	// Display 4 days from now
	let dailyFour = document.querySelector(".dailyRow .col .dailyFour");
	let dayFour = new Date(dWeather.daily[4].dt * 1000);
	dailyFour.innerText = formatDateAndDay(dayFour);
	let dailyFourTemp = document.querySelector(".dailyRow .col .dailyFourTemp");
	dailyFourTemp.innerText = `${Math.floor(dWeather.daily[4].temp.day)}°F`;
	let dailyFourIcon = document.querySelector(".dailyRow .col .dailyFourIcon");
	let dailyFourIconImg = getWeatherIconImg(dWeather.daily[4].weather[0].icon);
	dailyFourIcon.innerHTML = `${dailyFourIconImg}`;
	let dailyFourDescr = document.querySelector(".dailyRow .col .dailyFourDescr");
	dailyFourDescr.innerText = `${dWeather.daily[4].weather[0].main}`;
}

function formatHour(time) {
	let hour = time.getHours();
	let amORpm = "am";
	console.log(hour);
	if (hour > 12) {
		hour = hour - 12;
		amORpm = "pm";
		return `${hour}${amORpm}`;
	} else if (hour == 0) {
		return `12${amORpm}`;
	} else if (hour == 12) {
		amORpm = "pm";
		return `12${amORpm}`;
	} else {
		return `${hour}${amORpm}`;
	}
}

function formatDateAndDay(d) {
	let days = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
	let day = days[d.getDay()];
	let date = d.getDate();
	if (date.toString().length < 2) {
		date = "0" + date.toString();
	}
	return `${day} ${date}`;
}

function getWeatherIconImg(code) {
	return `<img src="${OPENWEATHER_API.icon_baseurl}${code}@2x.png" />`;
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
	if (minute.toString().length < 2) {
		minute = "0" + minute.toString();
	}
	let amORpm;
	if (d.getHours() >= 12) {
		amORpm = "PM";
	} else {
		amORpm = "AM";
	}

	return `${hour}:${minute}${amORpm}`;
}

function badInput(weather) {
	alert("No results found! Please check your input.");
}
