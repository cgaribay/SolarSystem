const cosines = [
1,0.9998,0.9994,0.9986,0.9976,0.9962,
0.9945,0.9925,0.9903,0.9877,0.9848,
0.9816,0.9781,0.9744,0.9703,0.9659,
0.9613,0.9563,0.9511,0.9455,0.9397,
0.9336,0.9272,0.9205,0.9135,0.9063,
0.8988,0.8910,0.8829,0.8746,0.8660,
0.8572,0.8480,0.8387,0.8290,0.8192,
0.8090,0.7986,0.7880,0.7771,0.7660,
0.7547,0.7431,0.7314,0.7193,0.7071,
0.6947,0.6820,0.6691,0.6561,0.6428,
0.6293,0.6157,0.6018,0.5878,0.5736,
0.5592,0.5446,0.5299,0.5150,0.5000,
0.4848,0.4695,0.4540,0.4384,0.4226,
0.4067,0.3907,0.3746,0.3584,0.3420,
0.3256,0.3090,0.2924,0.2756,0.2588,
0.2419,0.2250,0.2079,0.1908,0.1736,
0.1564,0.1392,0.1219,0.1045,0.0872,
0.0698,0.0523,0.0349,0.0175,0];

const sines = [
0,0.0175,0.0349,0.0523,0.0698,0.0872,
0.1045,0.1219,0.1392,0.1564,0.1736,
0.1908,0.2079,0.2250,0.2419,0.2588,
0.2756,0.2924,0.3090,0.3256,0.3420,
0.3584,0.3746,0.3907,0.4067,0.4226,
0.4384,0.4540,0.4695,0.4848,0.5000,
0.5150,0.5299,0.5446,0.5592,0.5736,
0.5878,0.6018,0.6157,0.6293,0.6428,
0.6561,0.6691,0.6820,0.6947,0.7071,
0.7193,0.7314,0.7431,0.7547,0.7660,
0.7771,0.7880,0.7986,0.8090,0.8192,
0.8290,0.8387,0.8480,0.8572,0.8660,
0.8746,0.8829,0.8910,0.8988,0.9063,
0.9135,0.9205,0.9272,0.9336,0.9397,
0.9455,0.9511,0.9563,0.9613,0.9659,
0.9703,0.9744,0.9781,0.9816,0.9848,
0.9877,0.9903,0.9925,0.9945,0.9962,
0.9976,0.9986,0.9994,0.9998,1];

const distances = [500, 1000, 2000];

const moveBtn = document.querySelector(".moveBtn");
const resetBtn = document.querySelector(".resetBtn");
const processBtn = document.querySelector(".processBtn");
const ferengi = document.querySelector(".ferengi");
const vulcano = document.querySelector(".vulcano");
const betasoide = document.querySelector(".betasoide");
const areaText = document.querySelector(".area");

var currentPerimeter = 0;
var perimeterStatus = true; /* true for increasing; false for decreasing */
var maxPerimeterReached = false;
var currentDate = 0;
var currentArea = 0;
var areaStatus = true; /* true for increasing; false for decreasing */
var forecast = [{status: "dry", day: 0}];
var conditionsCnts = {dry: 1,
                     optimum: 0,
                     rain: 0,
                     max_rain: []};
var positions = [
    {x: 500, y: 0, d: 360},   /* ferengi position */
    {x: 1000, y: 0, d: 0},    /* vulcano position */
    {x: 2000, y: 0, d: 360}]; /* betasoide position */

function movePlanets() {
    positions[0].d = (positions[0].d - 1) === 0 ? 360 : (positions[0].d - 1);
    positions[1].d = (positions[1].d + 5) % 360;
    positions[2].d = (positions[2].d - 3) === 0 ? 360 : (positions[2].d - 3);
    currentDate += 1;
    getCoordinates();
    convertPositions();
    determineForecast();
}

function processForecast() {
    for (let i = 0; i < 359; i++) {
        positions[0].d = (positions[0].d - 1) === 0 ? 360 : (positions[0].d - 1);
        positions[1].d = (positions[1].d + 5) % 360;
        positions[2].d = (positions[2].d - 3) === 0 ? 360 : (positions[2].d - 3);
        currentDate += 1;
        getCoordinates();
        determineForecast();
    }
    
    document.querySelector("#ferengi td:nth-child(2)").innerHTML = `${conditionsCnts.dry * 10}`;
    document.querySelector("#ferengi td:nth-child(3)").innerHTML = `${conditionsCnts.optimum * 10}`;
    document.querySelector("#ferengi td:nth-child(4)").innerHTML = `${conditionsCnts.rain * 10}`;
    document.querySelector("#ferengi td:nth-child(5)").innerHTML = conditionsCnts.max_rain.join(", ");
    
    document.querySelector("#vulcano td:nth-child(2)").innerHTML = `${conditionsCnts.dry * 2}`;
    document.querySelector("#vulcano td:nth-child(3)").innerHTML = `${conditionsCnts.optimum * 2}`;
    document.querySelector("#vulcano td:nth-child(4)").innerHTML = `${conditionsCnts.rain * 2}`;
    document.querySelector("#vulcano td:nth-child(5)").innerHTML = conditionsCnts.max_rain.join(", ");
    
    document.querySelector("#betasoide td:nth-child(2)").innerHTML = `${conditionsCnts.dry * 3}`;
    document.querySelector("#betasoide td:nth-child(3)").innerHTML = `${conditionsCnts.optimum * 3}`;
    document.querySelector("#betasoide td:nth-child(4)").innerHTML = `${conditionsCnts.rain * 3}`;
    document.querySelector("#betasoide td:nth-child(5)").innerHTML = conditionsCnts.max_rain.join(", ");
}

function computeTriangleArea(a, b, c) {
    return Math.abs((a.x * (b.y - c.y) + 
        b.x * (c.y - a.y) +
        c.x * (a.y - b.y)) / 2);
}

function computeDistance(a, b) {
    return Math.round(Math.sqrt(Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2)));
}

function determineForecast() {
    /* calculate the area of the triangle */
    let newArea = computeTriangleArea(positions[0], positions[1], positions[2]);
    let newAreaStatus = (newArea > currentArea);
    if (newArea == 0) {
        forecast.push({status: "dry", day: currentDate});
        conditionsCnts.dry++;
    } else if (currentArea != 0 && !areaStatus && newAreaStatus){
        forecast.push({status: "optimum", day: currentDate - 1});
        conditionsCnts.optimum++;
    } else {
        let firstTriangle = computeTriangleArea(positions[0], positions[1], {x: 0, y: 0});
        let secondTriangle = computeTriangleArea(positions[0], {x: 0, y: 0}, positions[2]);
        let thirdTriangle = computeTriangleArea({x: 0, y: 0}, positions[1], positions[2]);
        if (newArea == firstTriangle + secondTriangle + thirdTriangle) {
            if (!maxPerimeterReached) {
                let newPerimeter = computeDistance(positions[0], positions[1]) +
                    computeDistance(positions[1], positions[2]) +
                    computeDistance(positions[0], positions[2]);
                let newPerimeterStatus = (newPerimeter > currentPerimeter);
                
                if (perimeterStatus &&  !newPerimeterStatus) {
                    forecast.push({status: "max_rain", day: currentDate});
                    currentPerimeter = 0;
                    perimeterStatus = true;
                    maxPerimeterReached = true;
                    conditionsCnts.rain++;
                    conditionsCnts.max_rain.push(currentDate);
                } else {
                    forecast.push({status: "rain", day: currentDate});
                    currentPerimeter = newPerimeter;
                    perimeterStatus = newPerimeterStatus;
                }
            } else {
                if (forecast[forecast.length - 1].status != "rain" && 
                   forecast[forecast.length - 1].status != "max_rain") {
                    maxPerimeterReached = false;
                }
                forecast.push({status: "rain", day: currentDate});
            }
        }
    }
    currentArea = newArea;
    areaStatus = newAreaStatus;
    areaText.innerHTML = "Current Day = " + currentDate + 
        " | Status = " + forecast[forecast.length - 1].status + 
        " | Status Day: " + forecast[forecast.length - 1].day;
}

function getCoordinates() {
    for (let i = 0; i < 3; i++) {
        if (positions[i].d >= 0 && positions[i].d <= 90) {
            positions[i].x = Math.round(distances[i] * cosines[positions[i].d]);
            positions[i].y = Math.round(distances[i] * sines[positions[i].d]);
        } else if (positions[i].d > 90 && positions[i].d <= 180) {
            positions[i].x = -1 * Math.round(distances[i] * cosines[180 - positions[i].d]);
            positions[i].y = Math.round(distances[i] * sines[180 - positions[i].d]);
        } else if (positions[i].d > 180 && positions[i].d <= 270) {
            positions[i].x = -1 * Math.round(distances[i] * cosines[positions[i].d - 180]);
            positions[i].y = -1 * Math.round(distances[i] * sines[positions[i].d - 180]);
        } else {
            positions[i].x = Math.round(distances[i] * cosines[360 - positions[i].d]);
            positions[i].y = -1 * Math.round(distances[i] * sines[360 - positions[i].d]);
        }
    }
}

function convertPositions() {
    ferengi.style.top = ((distances[2] - positions[0].y) * 100 / 4000) + "%";
    ferengi.style.left = ((distances[2] + positions[0].x) * 100 / 4000) + "%";
    vulcano.style.top = ((distances[2] - positions[1].y) * 100 / 4000) + "%";
    vulcano.style.left = ((distances[2] + positions[1].x) * 100 / 4000) + "%";
    betasoide.style.top = ((distances[2] - positions[2].y) * 100 / 4000) + "%";
    betasoide.style.left = ((distances[2] + positions[2].x) * 100 / 4000) + "%";
}

function resetPlanets() {
    currentPerimeter = 0;
    perimeterStatus = true; /* true for increasing; false for decreasing */
    maxPerimeterReached = false;
    currentDate = 0;
    currentArea = 0;
    areaStatus = true; /* true for increasing; false for decreasing */
    forecast = [{status: "dry", day: 0}];
    positions = [
        {x: 500, y: 0, d: 360}, 
        {x: 1000, y: 0, d: 0}, 
        {x: 2000, y: 0, d: 360}];
    
    ferengi.style.top = "50%";
    ferengi.style.left = "62.5%";
    
    vulcano.style.top = "50%";
    vulcano.style.left = "75%";
    
    betasoide.style.top = "50%";
    betasoide.style.left = "100%";
}

resetBtn.addEventListener("click", resetPlanets, false);
//moveBtn.addEventListener("click", movePlanets, false);
processBtn.addEventListener("click", processForecast, false);

