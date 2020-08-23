$(document).ready(function () {
    //Open Weather API Variables
    const openWeatherKey = 'd4e1e14217e539534a82f3014cd52789';
    let cityName = 'Austin';
    let apiURL = ('https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&appid=' + openWeatherKey);

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
        01d == 'Clear Sky'
        02d == 'Few Clouds'
        03d == 'Scattered Clouds'
        04d == 'Broken Clouds'
        09d == 'Shower Rain'
        10d == 'Rain'
        11d == 'Thunderstorm'
        13d == 'Snow'
        50d == 'Mist'
    */
    function getIconUrl(iconId, size = 'small') {
        let iconUrl = '';

        if (size == 'small') {
            iconUrl = ('http://openweathermap.org/img/wn/' + iconId + '@2x.png')
        }
        else {
            iconUrl = ('http://openweathermap.org/img/wn/' + iconId + '@4x.png')
        }

        return iconUrl
    }

});