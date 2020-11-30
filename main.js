//Даты на странице
const options = {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
}

let firstDay = new Date();
document.getElementById('firstDay').innerHTML = Intl.DateTimeFormat('ru-RU', options).format(firstDay);

let secondDay = new Date();
secondDay.setDate(firstDay.getDate() + 1);
document.getElementById('secondDay').innerHTML = Intl.DateTimeFormat('ru-RU', options).format(secondDay);


let thirdDay = new Date();
thirdDay.setDate(firstDay.getDate() + 2);
document.getElementById('thirdDay').innerHTML = Intl.DateTimeFormat('ru-RU', options).format(thirdDay);

// Получение данных

let currentWeather = null;
let todayIntervals = [];
let tomorrowIntervals = [];
let afterTomorrowIntervals = [];
let weather = document.getElementById('weather');
let city = document.getElementById('city'); 
let humidity = document.getElementById('humidity');
let description = document.getElementById('description');

function setImage(codeOfWeather) {
    let image = document.getElementById('img');
    switch (codeOfWeather) {
        case 500:
            image.src = 'rainy-day.png';
            break;
        case 600:
            image.src = 'snowy.png';
            break;
        case 800:
            image.src = 'sunny.png';
            break;
        case 801:
        case 802:
        case 803:
        case 804:
            image.src = 'cloudy.png';
            break;
        default:
            image.src = 'undefinedWeather.png';
    }
}

async function loadData(_city) {
    todayIntervals = [];
    tomorrowIntervals = [];
    afterTomorrowIntervals = [];
    await axios.get(`http://api.openweathermap.org/data/2.5/forecast?q=${_city}&units=metric&appid=0fd7f557c8dc20cfa97b75f535d92d46&lang=ru`)
        .then(function (response) {
            currentWeather = response.data;
        })
        .catch(function (error) {
            console.log(error);
        })

    city.innerHTML = currentWeather.city.name.startsWith("Gomel") ? "Гомель" : currentWeather.city.name;
    weather.innerHTML = Math.round(currentWeather.list[0].main.temp) + ' &#8451';
    humidity.innerHTML = 'Влажность ' + Math.round(currentWeather.list[0].main.humidity) + '%';
    description.innerHTML = currentWeather.list[0].weather[0].description;

    let codeOfWeather = currentWeather.list[0].weather[0].id;
    setImage(codeOfWeather);
    document.getElementById('blockWeather').hidden = false;
    let hour = new Date().getHours();
    let todayIntervalsCount = (24 - hour) % 3 > 0 ? Math.floor((24 - hour) / 3 + 1) : (24 - hour) / 3;

    for (var i = 0; i < todayIntervalsCount; i++) {
        todayIntervals.push(currentWeather.list[i]);
    }
    tomorrowIntervals = (currentWeather.list.slice(todayIntervalsCount, todayIntervalsCount + 8));
    afterTomorrowIntervals = (currentWeather.list.slice(todayIntervalsCount + 8, todayIntervalsCount + 16));

    loadChart()
}

function loadChart(skipForChart = 0) {
    let temperatures = [];
    let timeIntervales = [];
    for (let i = 0; i < 8; i++) {
        temperatures.push(Math.round(currentWeather.list[i + skipForChart].main.temp));
        timeIntervales.push(currentWeather.list[i + skipForChart].dt_txt);
    }
    const chart = Highcharts.chart('chart', {
        chart: {
            type: 'spline'
        },
        title: false,
        xAxis: {
            categories: timeIntervales
        },
        yAxis: {
            visible: false
        },
        plotOptions: {
            spline: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        series: [{
            name: 'Температура ' + '(\xB0' + 'C)',
            data: temperatures
        }],
    });
};
let citiesId = document.getElementById('cities');
let currentCity = 'Minsk';
citiesId.addEventListener('change', async function (e) {
    currentCity = e.target.value;
    loadData(e.target.value);
});

let datesId = document.getElementById('dates');
datesId.addEventListener('click', function (e) {
    document.querySelectorAll('.active').forEach(e => e.classList.remove('active'));
    e.target.classList.toggle('active');

    if(e.target.value == 1){
        loadData(currentCity)
        return false;
    }
    let skipDay = e.target.value > 2 ? 8 :0;
    weather.innerHTML = Math.round(currentWeather.list[todayIntervals.length + skipDay].main.temp) + ' &#8451';
    humidity.innerHTML = 'Влажность ' + Math.round(currentWeather.list[todayIntervals.length + skipDay].main.humidity) + '%';
    description.innerHTML = currentWeather.list[todayIntervals.length + skipDay].weather[0].description;
    let codeOfWeather = currentWeather.list[todayIntervals.length + skipDay].weather[0].id;
    setImage(codeOfWeather);

    let skipForChart = todayIntervals.length + skipDay;

    loadChart(skipForChart);
})

document.addEventListener("DOMContentLoaded", loadData('Minsk'));