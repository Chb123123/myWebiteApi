const axios = require('axios')


function getWeather() {
  axios({
    method: 'GET',
    url: 'http://www.baidu.com/home/other/data/weatherInfo?city=南昌'
  }).then(res => {
    console.log(res.data.data.weather.content)
  })
}

getWeather()