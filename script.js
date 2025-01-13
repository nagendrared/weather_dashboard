const apiKey = 'a418523e84e9f2a445ef1ba2d26565df'; // Replace 'YOUR_API_KEY_HERE' with your actual API key
let isFahrenheit = false;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function fetchWeatherByCity() {
    const city = document.getElementById('city-input').value;
    if (!city) return alert('Please enter a city name');
    fetchWeather(city);
}

function fetchWeather(city, lat = null, lon = null) {
    const units = isFahrenheit ? 'imperial' : 'metric';
    const url = lat && lon
        ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`
        : `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) throw new Error(data.message);
            displayWeather(data);
            fetchForecast(data.coord.lat, data.coord.lon);
        })
        .catch(err => alert(err.message));
}

function fetchWeatherByGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetchWeather(null, latitude, longitude);
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

function displayWeather(data) {
    document.getElementById('weather-display').classList.remove('d-none');
    document.getElementById('city-name').textContent = data.name;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.getElementById('temperature').textContent = `Temperature: ${data.main.temp}°${isFahrenheit ? 'F' : 'C'}`;
    document.getElementById('weather-condition').textContent = `Condition: ${data.weather[0].description}`;
    document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `Wind Speed: ${data.wind.speed} ${isFahrenheit ? 'mph' : 'm/s'}`;
}

function fetchForecast(lat, lon) {
    const units = isFahrenheit ? 'imperial' : 'metric';
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const forecastEl = document.getElementById('forecast');
            forecastEl.innerHTML = '';
            const dailyForecasts = data.list.filter((_, index) => index % 8 === 0);
            dailyForecasts.forEach(day => {
                const forecastCard = document.createElement('div');
                forecastCard.classList.add('col-md-2', 'weather-card');
                forecastCard.innerHTML = `
                    <h5>${new Date(day.dt * 1000).toLocaleDateString()}</h5>
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="Weather icon">
                    <p>High: ${day.main.temp_max}°${isFahrenheit ? 'F' : 'C'}</p>
                    <p>Low: ${day.main.temp_min}°${isFahrenheit ? 'F' : 'C'}</p>
                `;
                forecastEl.appendChild(forecastCard);
            });
        })
        .catch(err => alert(err.message));
}

function toggleUnits() {
    isFahrenheit = !isFahrenheit;
    const city = document.getElementById('city-name').textContent;
    if (city) fetchWeather(city);
}

function saveToFavorites() {
    const city = document.getElementById('city-name').textContent;
    if (!favorites.includes(city)) {
        favorites.push(city);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoritesList();
    }
}

function updateFavoritesList() {
    const list = document.getElementById('favorites-list');
    list.innerHTML = '';
    favorites.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.onclick = () => fetchWeather(city);
        list.appendChild(li);
    });
}

// Initialize favorites on page load
updateFavoritesList();
