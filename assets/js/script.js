var cityInput = document.getElementById("city-input");
var temperatureEl = document.getElementById("temperature");
var windEl = document.getElementById("wind");
var humidityEl = document.getElementById("humidity");
var searchBtn = document.getElementById("search-btn");

var apiKey = 'c979170f4e435347d42da1c011aa3a1c';

function fetchWeather(city) {
  var url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // Update the temperature, wind, and humidity elements with the retrieved data
      temperatureEl.textContent = data.main.temp;
      windEl.textContent = data.wind.speed;
      humidityEl.textContent = data.main.humidity;
    })
    .catch(err => {
      console.log(err);
    });
}

searchBtn.addEventListener("click", function(event) {
  event.preventDefault();
  var city = cityInput.value;
  console.log(city);
  fetchWeather(city);
});