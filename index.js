import express from 'express';
import axios from 'axios';

const app = express();
const port = 3000;

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.render("index.ejs", {weather: null, error: null})
})

app.post("/weather", async (req, res) => {
    const city = req.body.city
    try {
        const response = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
            params: {
                name: city,
                count: 1,
            }
        })
        const place = response.data.results[0]
        if(!place) {
            return res.render("index.ejs", {weather: null, error: "City not found"})
        }
        const weatherResponse = await axios.get("https://api.open-meteo.com/v1/forecast", {
            params: {
                latitude: place.latitude,
                longitude: place.longitude,
                current: "temperature_2m,relative_humidity_2m,wind_speed_10m",
                timezone: "auto"
            }
        })
        const weather = weatherResponse.data.current
        res.render("index.ejs", {weather: {
            city: place.name,
            country: place.country,
            temperature: weather.temperature_2m,
            humidity: weather.relative_humidity_2m,
            windspeed: weather.wind_speed_10m
        }, error: null})
    } catch (error) {
        res.render("index.ejs", {weather: null, error: "Something went wrong"})
    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})