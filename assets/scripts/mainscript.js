$(document).ready(function () {
    //Open Weather API Variables
    const apiURL = 'https://api.openweathermap.org/data/2.5/';
    const storageKey = 'city-history'
    let cityName = 'Austin';
    let cityHistory = new Array();

    //Initialize
    displayDates();
    loadCityHistory();
    displayCityHistory();
    getWeatherInfoForCity();

    //"City Name" search button clicked
    $('#city-search-btn').click(setCityName);

    function getWeatherInfoForCity() {
        //AJAX call Weather Info API
        const weatherURL = `${apiURL}weather?q=${cityName}&appid=${config.KEY}`;
        $.ajax({
            url: weatherURL,
            method: 'GET'
        }).then(function (response) {
            displayWeatherInfo(response, true);
        }).fail(function () {
            alert(`Could not find city ${cityName}`);
        });

        //AJAX call 5 Day Forecast API
        const forecastURL = `${apiURL}forecast?q=${cityName}&appid=${config.KEY}`;
        $.ajax({
            url: forecastURL,
            method: 'GET'
        }).then(function (response) {
            findForecastInfo(response);
            console.log(response);

            //Add city to history if successfully and use city name from API call for formatting
            cityName = response.city.name;
            setCityHistory();
        });
    }

    //Sets city name from search input, and reloads getWeatherInfoForCity() function
    function setCityName(e) {
        e.preventDefault();
        cityName = $('#city-search-input').val();
        getWeatherInfoForCity();
    }

    //Add successfully searched cities to cityHistory Array
    function setCityHistory() {
        let maxCityHistory = 25;

        //Add city name to city history array
        checkForDuplicateCityHistory();
        cityHistory.push(cityName);

        //If cityHistory is over max limit, remove the oldest cities in search history until under the limit
        while (cityHistory.length > maxCityHistory) {
            cityHistory.splice(0, 1);
        }

        //Display and save history
        displayCityHistory();
        saveCityHistory();
    }

    //Display cityHistory array to the city history section
    function displayCityHistory() {
        const cityHistorySection = $('#city-search-history');
        cityHistorySection.empty();

        for (let i = 0; i < cityHistory.length; i++) {
            let cityHistoryItem = $('<li class="dropdown-item">');
            cityHistoryItem.text(cityHistory[i]);
            cityHistoryItem.click(function () {
                $('#city-search-input').val(cityHistoryItem.text());
                setCityName(event);
            });
            cityHistorySection.prepend(cityHistoryItem);
        }
    }

    //Display all weather info for weather section
    function displayWeatherInfo(weatherInfo, useFahrenheit = true) {
        let temperature;
        let uvIndex;
        let windSpeed = Math.floor(weatherInfo.wind.speed * 2.237);

        //Convert temperature to Fahrenheit or Celsius
        if (useFahrenheit) {
            temperature = `${kelvinToFahrenheit(weatherInfo.main.temp)}° F`;
        }
        else {
            temperature = `${kelvinToCelsius(weatherInfo.main.temp)}° C`;
        }

        //Location Info
        $('#city-name').text(weatherInfo.name);
        $('#country-code').text(weatherInfo.sys.country);

        //Weather Info
        $('#temperature').text(temperature);
        $('#humidity').text(`${weatherInfo.main.humidity}%`);
        $('#wind-speed').text(`${windSpeed} mph`);

        //Weather Info Icon
        $('#weather-info-icon').attr('src', getIconUrl(weatherInfo.weather[0].icon, 'large'));

        //AJAX call UV Index API
        const uvIndexURL = `${apiURL}uvi?appid=${config.KEY}&lat=${weatherInfo.coord.lat}&lon=${weatherInfo.coord.lon}`;
        $.ajax({ url: uvIndexURL, method: 'GET' }).then(function (response) {
            uvIndex = response.value;
            $('#uv-index').text(uvIndex);
            setUVIndicator();
        });



        //Sets background color of UV indicator based off uv index value
        function setUVIndicator() {
            const uvColors = ['#2ecc71', '#FFC300', '#FF5733', '#C70039', '#900C3F']

            console.log(uvIndex);

            // $('#uv-indicator').css('background-color', 'green');
        }
    }

    //Loops through all forecast results for high temperature, low temperature, humidity, and icon
    function findForecastInfo(weatherInfo, useFahrenheit = true) {
        let forecastIndex = 0;
        const forecastHigh = $('.forecast-high');
        const forecastLow = $('.forecast-low');
        const forecastHumidity = $('.forecast-humidity');
        const forecastIcon = $('.forecast-icon');

        let highTemp;
        let lowTemp;
        let humidity;
        let iconId;
        let currentDate = ''

        for (let i = 0; i < weatherInfo.list.length; i++) {
            if (currentDate != weatherInfo.list[i].dt_txt.substring(0, 10)) {
                if (currentDate != '') {
                    displayForecastInfo();
                    forecastIndex++;
                }
                //Set to new day
                currentDate = weatherInfo.list[i].dt_txt.substring(0, 10);
                highTemp = weatherInfo.list[i].main.temp;
                lowTemp = weatherInfo.list[i].main.temp;
                humidity = weatherInfo.list[i].main.humidity;
                iconId = weatherInfo.list[i].weather[0].icon;
            }
            else if (highTemp < weatherInfo.list[i].main.temp) {
                //Set higher temp
                highTemp = weatherInfo.list[i].main.temp;
                humidity = weatherInfo.list[i].main.humidity;
                iconId = weatherInfo.list[i].weather[0].icon;
            }
            else if (lowTemp > weatherInfo.list[i].main.temp) {
                //Set lower temp
                lowTemp = weatherInfo.list[i].main.temp;
            }
        }

        displayForecastInfo();

        //Display all forecast info for 5-day forecast section
        function displayForecastInfo() {
            //Convert temp to fahrenheit
            highTemp = kelvinToFahrenheit(highTemp);
            lowTemp = kelvinToFahrenheit(lowTemp);

            //Display info to forecast box at forecastIndex
            forecastHigh.eq(forecastIndex).text(`${highTemp}° F`);
            forecastLow.eq(forecastIndex).text(`${lowTemp}° F`);
            forecastHumidity.eq(forecastIndex).text(`${humidity}%`);
            forecastIcon.eq(forecastIndex).attr('src', getIconUrl(iconId, 'large'));
        }
    }

    //Display dates and days of the week for Weather Info and 5 Day Forecast sections
    function displayDates() {
        const m = moment();
        const forecastDOWs = $('.forecast-dow');

        //Set current date in Weather Info section
        $('#current-date').text(m.format("MM/DD/YYYY"));

        //Set days of the week for 5 Day Forecast section
        for (let i = 0; i < 5; i++) {
            m.add(1, 'days');
            forecastDOWs.eq(i).text(m.format('dddd'));
        }
    }

    //Get icon from open weather maps icon url
    /*Icons include:
        01d || 01n == 'Clear Sky'
        02d || 02n == 'Few Clouds'
        03d || 03n == 'Scattered Clouds'
        04d || 04n == 'Broken Clouds'
        09d || 09n == 'Shower Rain'
        10d || 10n == 'Rain'
        11d || 11n == 'Thunderstorm'
        13d || 13n == 'Snow'
        50d || 50n == 'Mist'
    */
    function getIconUrl(iconId, size = 'small') {
        const sizeOption = ['small', 'mid', 'large'];
        let iconUrl = '';

        if (size == sizeOption[0]) {
            iconUrl = (`http://openweathermap.org/img/wn/${iconId}.png`);
        }
        else if (size == sizeOption[1]) {
            iconUrl = (`http://openweathermap.org/img/wn/${iconId}@2x.png`);
        }
        else if (size == sizeOption[2]) {
            iconUrl = (`http://openweathermap.org/img/wn/${iconId}@4x.png`);
        }
        else {
            //If size is not found, set to size small and give error
            console.error(`${size} size is not supported. Supported sizes include {'${sizeOption[0]}', '${sizeOption[1]}', '${sizeOption[2]}'}`);
            iconUrl = (`http://openweathermap.org/img/wn/${iconId}.png`);
        }

        return iconUrl;
    }

    //Converts Kelvin input to Fahrenheit output
    function kelvinToFahrenheit(kel) {
        let far = ((kel - 273.15) * (9 / 5) + 32);
        return Math.floor(far);
    }

    //Converts Kelvin input to Celsius output
    function kelvinToCelsius(kel) {
        let cel = (kel - 273.15);
        return Math.floor(cel);
    }

    //Check for duplicate cities in cityHistory array, and remove if found
    function checkForDuplicateCityHistory() {
        for (let i = 0; i < cityHistory.length; i++) {
            if (cityHistory[i] == cityName) {
                cityHistory.splice(i, 1);
            }
        }
    }

    //History is saved to local storage
    function saveCityHistory() {
        localStorage.setItem(storageKey, JSON.stringify(cityHistory));
    }

    //History is loaded from local storage
    function loadCityHistory() {
        if (localStorage.getItem(storageKey) != null) {
            cityHistory = JSON.parse(localStorage.getItem(storageKey));
            cityName = cityHistory[cityHistory.length - 1];
        }
    }
});