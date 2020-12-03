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
let cities = [];
let todayIntervals = [];
let tomorrowIntervals = [];
let afterTomorrowIntervals = [];
let lat =  53.9045398;
let lng = 27.5615244;
let searchCity = document.getElementById('searchCity');
let searchBtn = document.getElementById('searchBtn');
let weather = document.getElementById('weather');
let city = document.getElementById('city'); 
let humidity = document.getElementById('humidity');
let description = document.getElementById('description');
let datesId = document.getElementById('dates');

searchBtn.addEventListener('click', loadCitites);

async function loadCitites(){
    document.querySelectorAll('.active').forEach(e => e.classList.remove('active'));
    document.getElementById('firstDay').classList.add('active');
    await axios.get(`https://gist.githubusercontent.com/alex-oleshkevich/6946d85bf075a6049027306538629794/raw/3986e8e1ade2d4e1186f8fee719960de32ac6955/by-cities.json`)
        .then(function (response) {
            let regions = response.data[0].regions;
                regions.forEach(region => {
                    region.cities.forEach(city=>{
                        cities.push(city);
                    })
                })
            })
        .catch(function (error) {
            console.log(error);
        })

    let city = cities.find(el=>{
            return el.name.trim() == searchCity.value.trim();    
    });

    if(!city){
        return alert('Такого города в Беларуси нет.')
    }

    lat = city.lat;
    lng = city.lng;

    await loadData(lat,lng);

}

async function loadData(lat, lng) {
    todayIntervals = [];
    tomorrowIntervals = [];
    afterTomorrowIntervals = [];
    await axios.get(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&appid=0fd7f557c8dc20cfa97b75f535d92d46&lang=ru`)
        .then(function (response) {
            currentWeather = response.data;
        })
        .catch(function (error) {
            console.log(error);
        })

    city.innerHTML = searchCity.value;
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

datesId.addEventListener('click', function (e) {
    document.querySelectorAll('.active').forEach(e => e.classList.remove('active'));
    e.target.classList.toggle('active');

    if(e.target.value == 1){
        loadData(lat, lng)
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

document.addEventListener("DOMContentLoaded", loadData(53.9045398, 27.5615244));
