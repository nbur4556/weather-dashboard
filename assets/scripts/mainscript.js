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
        console.log(response.weather[0].icon);
    });
});