var cityInput = document.getElementById("city-input");
var temperatureEl = document.getElementById("temperature");
var windEl = document.getElementById("wind");
var humidityEl = document.getElementById("humidity");
var cityNameEl = document.getElementById("city-name");
var searchBtn = document.getElementById("search-btn");
var searchHistoryContainer = document.getElementById("search-history");

var apiKey = 'c979170f4e435347d42da1c011aa3a1c'; // My API Key

// Retrieve search history from local storage
var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || []; // Storing the search history in local storage for later use
//For the beginning, fetching Data for Today of the city inputted
function fetchWeather(city) {
  var url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`; //Imperial is Farhenheit
// Getting the data from url
  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      temperatureEl.innerHTML = `<span class="temperature">${data.main.temp} °F</span>`; // Displaying the temperature in farhenheit
      windEl.textContent = `Wind: ${data.wind.speed} mph`; // Gets data to display wind speed
      humidityEl.textContent = `Humidity: ${data.main.humidity}%`; // Gets data to display humidity
      cityNameEl.textContent = data.name; // Gets data to display city name

      var weatherCondition = data.weather[0].main; // Gets data to for weather condition, this will be used to display the icon, since they will compare and determine the icon
      var weatherIconClass = getWeatherIconClass(weatherCondition);
      temperatureEl.innerHTML = `<i class="${weatherIconClass} weather-icon"></i>` + temperatureEl.innerHTML;
      temperatureEl.querySelector("i").style.color = getWeatherIconColor(weatherCondition);

      // Save search city to search history
      saveSearchToHistory(data.name);
    })
    .catch(err => {
      console.log(err);
    });
}
// Getting the Data for the next 5 Days of the city inputted
function fetchForecast(city) {
  var forecastContainer = document.querySelector(".forecast-container");
  forecastContainer.innerHTML = "<h2>5-Day Forecast:</h2>";

  var forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`;

  fetch(forecastUrl)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      var forecastData = data.list;
      var forecastMap = new Map(); // Map to store forecast data for each day

      // Loop through the forecast data and find the highest and lowest temperature, weather condition, wind speed, and humidity for each day. 
      for (var i = 0; i < forecastData.length; i++) {
        var forecastItem = forecastData[i];
        var forecastDate = forecastItem.dt_txt.split(" ")[0];
        var forecastTemperature = forecastItem.main.temp;
        var forecastWeatherCondition = forecastItem.weather[0].main;
        var forecastWind = forecastItem.wind.speed;
        var forecastHumidity = forecastItem.main.humidity;

        // Check if the current day is already in the forecast map
        if (forecastMap.has(forecastDate)) {
          // Update the temperature, wind, and humidity if needed
          var currentData = forecastMap.get(forecastDate);
          if (forecastTemperature > currentData.temperatureMax) {
            currentData.temperatureMax = forecastTemperature;
          }
          if (forecastTemperature < currentData.temperatureMin) {
            currentData.temperatureMin = forecastTemperature;
          }
        } else {
          // Add the current day to the forecast map
          forecastMap.set(forecastDate, {
            temperatureMax: forecastTemperature,
            temperatureMin: forecastTemperature,
            weatherCondition: forecastWeatherCondition,
            wind: forecastWind,
            humidity: forecastHumidity
          });
        }
      }

      // Loop through the forecast map and create forecast items for each day
      forecastMap.forEach((data, date) => {
        // Create a new container for the day's forecast
        var forecastElement = document.createElement("div");
        forecastElement.classList.add("forecast-item");

        // Get the weather icon class for the forecast item
        var weatherIconClass = getWeatherIconClass(data.weatherCondition);
        var weatherIconColor = getWeatherIconColor(data.weatherCondition);

        forecastElement.innerHTML = `
          <h3>${date}</h3>
          <p>Temp: ${data.temperatureMax}°F / ${data.temperatureMin}°F <i class="${weatherIconClass}" style="color:${weatherIconColor}"></i></p>
          <p>Wind: ${data.wind} mph</p>
          <p>Humidity: ${data.humidity}%</p>
        `;

        // Append the forecast item to the forecast container
        forecastContainer.appendChild(forecastElement);
      });
    })
    .catch(err => {
      console.log(err);
    });
}

function getWeatherIconClass(weatherCondition) {
  var weatherIconClass = weatherIcons[weatherCondition];
  return weatherIconClass ? weatherIconClass : "";
}

function getWeatherIconColor(weatherCondition) {
  var weatherColor = weatherColors[weatherCondition];
  return weatherColor ? weatherColor : "";
}

var weatherIcons = {
  Clear: "fas fa-sun",
  Clouds: "fas fa-cloud",
  Rain: "fas fa-cloud-showers-heavy"
};

var weatherColors = {
  Clear: "orange",
  Clouds: "gray",
  Rain: "blue"
};

function saveSearchToHistory(city) {
  if (!searchHistory.includes(city)) {
    searchHistory.push(city);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    displaySearchHistory();
  }
}

function displaySearchHistory() {
  searchHistoryContainer.innerHTML = "";
  for (var i = 0; i < searchHistory.length; i++) {
    var searchItem = document.createElement("button");
    searchItem.textContent = searchHistory[i];
    searchItem.classList.add("search-history-item");
    searchItem.addEventListener("click", function() {
      var city = this.textContent;
      fetchWeather(city);
      fetchForecast(city);
    });
    searchHistoryContainer.appendChild(searchItem);
  }
}

function handleSearch(event) {
  event.preventDefault();
  var city = cityInput.value;
  if (city.trim() === "") {
    alert("Please enter a city name.");
    return;
  }
  fetchWeather(city);
  fetchForecast(city);
}

searchBtn.addEventListener("click", handleSearch);
cityInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    handleSearch(event);
  }
});

// Display search history on page load
displaySearchHistory();
