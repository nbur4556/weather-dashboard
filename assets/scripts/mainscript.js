$(document).ready(function () {
    //Open Weather API Variables
    const apiURL = 'https://api.openweathermap.org/data/2.5/';
    let cityName = 'Austin';
    let cityHistory = new Array();

    //Initialize
    displayDates();
    getWeatherInfoForCity();

    //"City Name" search button clicked
    $('#city-search-btn').click(setCityName);

    //AJAX call Weather Info API
    function getWeatherInfoForCity() {
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

    //Add successfully searched cities to city history section
    function setCityHistory() {
        const cityHistorySection = $('#city-search-history');
        const cityHistoryItem = $('<li class="dropdown-item">');

        //Create list item and append to cityHistorySection
        cityHistoryItem.text(cityName);
        cityHistoryItem.click(function () {
            $('#city-search-input').val(cityHistoryItem.text());
            setCityName(event);
        });
        cityHistorySection.prepend(cityHistoryItem);

        //Add city name to city history array
        cityHistory.push(cityName);
        console.log(cityHistory);
    }

    //Display all weather info for weather section
    function displayWeatherInfo(weatherInfo, useFahrenheit = true) {
        let temperature;
        let windSpeed = Math.floor(weatherInfo.wind.speed * 2.237);
        //Convert temperature to Fahrenheit or Celsius
        if (useFahrenheit) {
            temperature = `${kelvinToFahrenheit(weatherInfo.main.temp)} F`;
        }
        else {
            temperature = `${kelvinToCelsius(weatherInfo.main.temp)} C`;
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
            $('#uv-index').text(response.value);
        });
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
            forecastHigh.eq(forecastIndex).text(`High: ${highTemp} F`);
            forecastLow.eq(forecastIndex).text(`High: ${lowTemp} F`);
            forecastHumidity.eq(forecastIndex).text(`Humidity: ${humidity}%`);
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
});