$(document).ready(function () {
    //Open Weather API Variables
    const openWeatherKey = 'd4e1e14217e539534a82f3014cd52789';
    let cityName = 'Dallas';
    let apiURL = (`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${openWeatherKey}`);

    $.ajax({
        url: apiURL,
        method: 'GET'
    }).then(function (response) {
        console.log(response);

        console.log(getIconUrl('11d'));
        console.log(getIconUrl(response.weather[0].icon));
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
        let iconUrl = '';

        if (size == 'small') {
            iconUrl = (`http://openweathermap.org/img/wn/${iconId}@2x.png`)
        }
        else {
            iconUrl = (`http://openweathermap.org/img/wn/${iconId}@4x.png`)
        }

        return iconUrl
    }

});