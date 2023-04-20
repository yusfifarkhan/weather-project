/** Module Import */
const bodyParser = require("body-parser");
const express = require("express");
const axios = require("axios");
require("dotenv").config();
const serverPort = 3040;

/** Utility function */
const getUniqueListBy = (arr, key) => {
  return [
    ...new Map(arr.map((item) => [item[key].split(" ")[0], item])).values(),
  ];
};

const getWeather = async (cityName) => {
  const requestKey = process.env.WEATHER_API_KEY;
  const requestUnit = "metric";
  const requestLang = "en";
  const requestUrl =
    process.env.WEATHER_API_URL +
    "/forecast?q=" +
    cityName +
    "&units=" +
    requestUnit +
    "&langs=" +
    requestLang +
    "&appid=" +
    requestKey;

  try {
    const response = await axios.get(requestUrl);
    const { city, list } = response.data;

    const data = getUniqueListBy(list, "dt_txt");
    return { city: city.name, data };
  } catch (error) {
    console.error(error);
  }
};

const getImage = async (imageFilter) => {
  const requestKey = process.env.UNSPLASH_API_KEY;
  const requestUrl = `${process.env.UNSPLASH_API_URL}?query=${imageFilter}&client_id=${requestKey}`;
  try {
    const response = await axios.get(requestUrl);
    return ({ current, location } = response.data);
  } catch (error) {
    console.error(error.body);
    return { urls: "403", user: "403" };
  }
};

/** Express Init */
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

/** Routes */
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", async (req, res) => {
  const { cityName } = req.body;
  const { city, data } = await getWeather(cityName);
  const { urls, user } = await getImage(cityName);
  const usersUrl = user.name || "Luca Bravo";
  const imageUrl = urls.regular || "/luca-bravo-ESkw2ayO2As-unsplash.jpg";
  res.render("weather", {
    city: city,
    data: data,
    img: imageUrl,
    user: usersUrl,
  });
  res.end();
});

/** Server Start */
app.listen(process.env.PORT || serverPort, () => {
  console.log(`Server is running at: ${process.env.PORT || serverPort}`);
});
