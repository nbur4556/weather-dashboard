$(document).ready(function () {
    //Open Weather API Variables
    const openWeatherKey = 'd4e1e14217e539534a82f3014cd52789';
    let cityName = 'Salt Lake City';
    let apiURL = (`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${openWeatherKey}`);

    displayDates();

    //AJAX call Open Weather API
    $.ajax({
        url: apiURL,
        method: 'GET'
    }).then(function (response) {
        console.log(response);
        displayWeatherInfo(response, false);
    });

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

    function displayWeatherInfo(weatherInfo, useFahrenheit = true) {
        let temperature;
        //Convert temperature to Fahrenheit or Celcius
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
        $('#wind-speed').text(`${weatherInfo.wind.speed} mph`);

        //Weather Info Icon
        $('#weather-info-icon').attr('src', getIconUrl(weatherInfo.weather[0].icon, 'large'));
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