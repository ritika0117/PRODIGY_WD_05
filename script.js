const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const weatherCard = document.getElementById("weatherCard");
const forecastSection = document.getElementById("forecastSection");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");

const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const precipitation = document.getElementById("precipitation");

const weatherDescription =
    document.getElementById("weatherDescription");

const weatherIcon =
    document.getElementById("weatherIcon");

const forecastContainer =
    document.getElementById("forecastContainer");


// ==========================================
// SEARCH CITY
// ==========================================

searchBtn.addEventListener("click", searchCity);

cityInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        searchCity();
    }

});


async function searchCity() {

    const city = cityInput.value.trim();

    if (city === "") {

        showError("Please enter a city name.");

        return;
    }

    clearError();

    showLoading();

    try {

        const geocodingURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const response =
            await fetch(geocodingURL);

        if (!response.ok) {

            throw new Error(
                "Unable to search for the location."
            );

        }

        const data =
            await response.json();

        if (!data.results || data.results.length === 0) {

            throw new Error(
                "Location not found. Please try another city."
            );

        }

        const location = data.results[0];

        getWeather(
            location.latitude,
            location.longitude,
            location.name,
            location.country
        );

    } catch (error) {

        hideLoading();

        showError(error.message);

    }

}


// ==========================================
// GET WEATHER
// ==========================================

async function getWeather(
    latitude,
    longitude,
    locationName,
    country
) {

    try {

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;

        const response =
            await fetch(weatherURL);

        if (!response.ok) {

            throw new Error(
                "Unable to fetch weather data."
            );

        }

        const data =
            await response.json();

        displayWeather(
            data,
            locationName,
            country
        );

    } catch (error) {

        showError(error.message);

    } finally {

        hideLoading();

    }

}


// ==========================================
// DISPLAY WEATHER
// ==========================================

function displayWeather(
    data,
    location,
    country
) {

    const current = data.current;

    cityName.textContent = location;

    countryName.textContent = country;

    temperature.textContent =
        Math.round(current.temperature_2m);

    feelsLike.textContent =
        Math.round(current.apparent_temperature);

    humidity.textContent =
        current.relative_humidity_2m;

    windSpeed.textContent =
        Math.round(current.wind_speed_10m);

    precipitation.textContent =
        current.precipitation;

    weatherDescription.textContent =
        getWeatherDescription(
            current.weather_code
        );

    weatherIcon.textContent =
        getWeatherIcon(
            current.weather_code
        );


    weatherCard.style.display = "block";

    forecastSection.style.display = "block";


    displayForecast(data.daily);

}


// ==========================================
// DISPLAY 5-DAY FORECAST
// ==========================================

function displayForecast(daily) {

    forecastContainer.innerHTML = "";

    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const date =
            new Date(daily.time[i]);

        const day =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );

        const icon =
            getWeatherIcon(
                daily.weather_code[i]
            );

        const description =
            getWeatherDescription(
                daily.weather_code[i]
            );

        const card =
            document.createElement("div");

        card.className =
            "forecast-card";

        card.innerHTML = `

            <h3>${day}</h3>

            <div class="forecast-icon">
                ${icon}
            </div>

            <p>
                ${description}
            </p>

            <p class="forecast-temperature">
                ${Math.round(
            daily.temperature_2m_max[i]
        )}° /
                ${Math.round(
            daily.temperature_2m_min[i]
        )}°
            </p>

        `;

        forecastContainer.appendChild(card);

    }

}


// ==========================================
// WEATHER DESCRIPTION
// ==========================================

function getWeatherDescription(code) {

    const weatherCodes = {

        0: "Clear sky",

        1: "Mainly clear",

        2: "Partly cloudy",

        3: "Overcast",

        45: "Fog",

        48: "Depositing rime fog",

        51: "Light drizzle",

        53: "Moderate drizzle",

        55: "Dense drizzle",

        61: "Slight rain",

        63: "Moderate rain",

        65: "Heavy rain",

        71: "Slight snow",

        73: "Moderate snow",

        75: "Heavy snow",

        80: "Slight rain showers",

        81: "Moderate rain showers",

        82: "Violent rain showers",

        95: "Thunderstorm",

        96: "Thunderstorm with hail",

        99: "Thunderstorm with heavy hail"

    };

    return weatherCodes[code] ||
        "Unknown weather";

}


// ==========================================
// WEATHER ICON
// ==========================================

function getWeatherIcon(code) {

    if (code === 0) {

        return "☀️";

    }

    if (
        code === 1 ||
        code === 2
    ) {

        return "🌤️";

    }

    if (code === 3) {

        return "☁️";

    }

    if (
        code === 45 ||
        code === 48
    ) {

        return "🌫️";

    }

    if (
        code >= 51 &&
        code <= 67
    ) {

        return "🌧️";

    }

    if (
        code >= 71 &&
        code <= 77
    ) {

        return "❄️";

    }

    if (
        code >= 80 &&
        code <= 82
    ) {

        return "🌦️";

    }

    if (
        code >= 95 &&
        code <= 99
    ) {

        return "⛈️";

    }

    return "🌤️";

}


// ==========================================
// USE MY LOCATION
// ==========================================

locationBtn.addEventListener(
    "click",
    useMyLocation
);


function useMyLocation() {

    if (!navigator.geolocation) {

        showError(
            "Geolocation is not supported by your browser."
        );

        return;

    }

    showLoading();

    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            getLocationName(
                latitude,
                longitude
            );

        },

        function () {

            hideLoading();

            showError(
                "Unable to access your location. Please allow location permission or search for a city."
            );

        }

    );

}


// ==========================================
// GET LOCATION NAME
// ==========================================

async function getLocationName(
    latitude,
    longitude
) {

    try {

        const reverseGeocodingURL =
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`;

        /*
         * If reverse geocoding is unavailable,
         * we will still display weather using
         * "Your Location".
         */

        const response =
            await fetch(reverseGeocodingURL);

        if (response.ok) {

            const data =
                await response.json();

            if (
                data.results &&
                data.results.length > 0
            ) {

                const location =
                    data.results[0];

                getWeather(
                    latitude,
                    longitude,
                    location.name,
                    location.country
                );

                return;

            }

        }

        getWeather(
            latitude,
            longitude,
            "Your Location",
            ""
        );

    } catch (error) {

        getWeather(
            latitude,
            longitude,
            "Your Location",
            ""
        );

    }

}


// ==========================================
// UI FUNCTIONS
// ==========================================

function showLoading() {

    loading.style.display = "block";

}

function hideLoading() {

    loading.style.display = "none";

}

function showError(message) {

    errorMessage.textContent = message;

}

function clearError() {

    errorMessage.textContent = "";

}