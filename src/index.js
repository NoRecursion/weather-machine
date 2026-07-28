import "./reset.css";
import "./style.css";

async function getCity() {
    try {
        const res = await fetch("https://ipinfo.io/json/");
        if (!res.ok) {
            return "london";
        }
        const data = await res.json();
        return data.city;
    } catch (e) {
        console.log("couldnt get city, defaulting to london");
        console.log(e);
        return "london";
    }
}

async function getData(search) {
    let weatherData;

    try {
        const response = await fetch(
            //https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/london?key=VNVE7UP4EQER4AJ52Z69BKZC2
            `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${search}?key=VNVE7UP4EQER4AJ52Z69BKZC2`
        );

        if (!response.ok) {
            console.log(`fetch returned with error status ${response.status}`);
            return null;
        }

        weatherData = await response.json();
    } catch (e) {
        console.log("failed to get a response due to unexpected error");
        console.log(e);
        return null;
    }

    const data = {
        city: weatherData.address,
        temp: weatherData.currentConditions.temp,
        precip: weatherData.currentConditions.precip,
        precipprob: weatherData.currentConditions.precipprob,
        preciptype: weatherData.currentConditions.preciptype,
        humidity: weatherData.currentConditions.humidity,
        wind: weatherData.currentConditions.windspeed,
    };
    return data;
}

class display {
    syncing = true;
    lastSearch = null;
    data = null;
    unit = "F";
    tempbtn;
    srchbtn;
    srchinp;
    board;

    constructor() {
        this.tempbtn = document.querySelector("button#unit");
        this.srchbtn = document.querySelector("button#searchbtn");
        this.srchinp = document.querySelector("input#searchinp");
        this.board = document.querySelector("#weather");

        this.tempbtn.addEventListener("click", (e) => {
            this.toggleUnit();
        });

        this.srchbtn.addEventListener("click", (e) => {
            this.searchAndDisplay(this.srchinp.value);
        });

        this.startup();
    }

    async startup() {
        this.syncing = true;
        const city = await getCity();
        this.searchAndDisplay(city);
    }

    async searchAndDisplay(search) {
        this.syncing = true;
        const weatherData = await getData(search);
        this.lastSearch = search;
        this.data = weatherData;
        this.postData(weatherData);
        this.syncing = false;
    }

    toggleUnit() {
        if (this.syncing) {
            return;
        }
        if (this.unit === "F") {
            this.unit = "C";
            this.tempbtn.textContent = "Celcius";
        } else {
            this.unit = "F";
            this.tempbtn.textContent = "Farenheit";
        }
        this.postData(this.data);
    }

    printme() {
        console.log(this.unit);
        console.log(this.tempbtn);
        console.log(this.srchbtn);
        console.log(this.srchinp);
        console.log(this.board);
        console.log(this.data);
        console.log(this.lastSearch);
    }

    t(t) {
        if (this.unit === "F") {
            return String(t) + "F";
        } else {
            t = (t - 32) / 1.8;
            t = Math.round(t * 10) / 10;
            return String(t) + "C";
        }
    }

    postData(data) {
        if (data === null) {
            this.board.replaceChildren("could not find city");
            return;
        }

        const kids = [];
        for (let i = 0; i < 5; i++) {
            kids.push(document.createElement("p"));
        }

        kids[0].textContent = data.city;
        kids[1].textContent = `temperature ${this.t(data.temp)}`;

        let ptype = "rain";
        if (data.preciptype !== null) {
            ptype = data.preciptype[0];
        }
        let p;
        if (data.precip > 0.15) {
            p = String(data.precip) + "in";
        } else {
            p = String(data.precipprob) + "%";
        }

        kids[2].textContent = `${ptype}: ${p}`;
        kids[3].textContent = `humidity: ${data.humidity}%`;
        kids[4].textContent = `wind: ${data.wind}mph`;

        this.board.replaceChildren(...kids);
    }
}

getCity().then(function (r) {
    console.log(r);
});
getData("london").then(function (result) {
    console.log(result);
});

const d = new display();
d.printme();
