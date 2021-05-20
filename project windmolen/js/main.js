// MAP WORLD
var map = L.map('map').setView([52.3, 5.5], 7);

var mapLayer = L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=GVwj6dhUcBGzVPxR1VN8', {
  attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
}).addTo(map);

function getMap(data){
  var windmolens = L.geoJson(data, {
      style: style,
      onEachFeature: onEachFeature
    });

  return windmolens;
}

windmolens = getMap(windmolens2018);
windmolens.addTo(map);
loadWeatherStation();


// NORTH ARROW
var north = L.control({position: "bottomright"});
north.onAdd = function(map) {
    var northArrowDiv = L.DomUtil.create("div", "northArrow");
    northArrowDiv.innerHTML = '<img src="./img/northArrow.png" width="50" height="50">';
    return northArrowDiv;
}
north.addTo(map);

//SCALE
var scale = L.control.scale().addTo(map);

// WINDMOLENPARKEN MARKERS
var customIcon = L.Icon.extend({
  options: {
    iconSize: [35 ,35],
    iconAnchor: [17.5, 35],
    popupAnchor:  [-3, -20]
  }
})

var parkIcon = new customIcon({iconUrl: './img/customIcon.png'}),
    parkIconFilter100 = new customIcon({iconUrl: './img/customIconFilter100.png'});
    parkIconFilter500 = new customIcon({iconUrl: './img/customIconFilter500.png'});
    parkIconFilter700 = new customIcon({iconUrl: './img/customIconFilter700.png'});
    weatherStationIcon = new customIcon({iconUrl: './img/weatherStation.png'});

var windmolenparkLayer = L.geoJSON(windmolenparken,{
  onEachFeature: function(feature, layer){
    layer.bindPopup('<h2>' + feature.properties.Windpark + '</h2>' + 
                      '<p>' + "Dit windmolenpark heeft " + feature.properties.Aantal_windmolens + " windmolens."  + '<br>' +
                      "Het oppervlakte van het park is " + feature.properties.oppervlakte + " km²."  + '<br>' +
                      "Het vermogen is " + feature.properties.Vermogen_windpark_MW + " MW." + 
                      " Dat is " + feature.properties.Vermogen_per_windmolen_MW + " MW per windmolen."  + '<br>' +
                      "Het bedrijf is " + feature.properties.bedrijf + '</p>' +
                      '<img class="image" src="' + feature.properties.foto + '" alt="' + feature.properties.Windpark + ' foto" width="150" height="100"";>');
  },
  pointToLayer: function (feature, layer) {
    if(feature.properties.Vermogen_windpark_MW < 300){
      return L.marker(layer, {icon: parkIconFilter100});
    }
    else if(feature.properties.Vermogen_windpark_MW < 700){
      return L.marker(layer, {icon: parkIconFilter500});
    }
    else{
      return L.marker(layer, {icon: parkIconFilter700});
    }
  }
}).addTo(map);
 

// COLOR STYLE AND FOR HOVERING ON MAP + LEGEND COLORS
function getColor(aantal) {
  return aantal >= 40 ? '#67000d' :
         aantal >= 30  ? '#a50f15' :
         aantal >= 20  ? '#cb181d' :
         aantal >= 10  ? '#ef3b2c' :
         aantal > 0 ? '#fb6a4a':
                        '#fc9272';  //0 windmolens
}

function style(feature) {
  return {
      fillColor: getColor(feature.properties.windmolens_gebruikAantal),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
  };
}

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
      console.log("event");
  }
  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  windmolens.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  console.log("funcite test");
  layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
  });
}

//INFORMATION ON HOVER
var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  return this._div;
};

//METHOD INFORMATION REGIONS 
info.update = function (props) {
  this._div.innerHTML = '<h4>Informatie windmolens per provincie</h4>' +  (
    props ? '<b>' + props.Provincien + '</b><br />' + props.windmolens_gebruikAantal + ' windmolens' +
            '<br>' + "De genormaliseerde productie is " + props.windmolensElektriciteitGenormaliseerdeProductie + ' mln kWh' : 'Hover op een provincie');
};

info.addTo(map);

//LEGEND
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
  var legendDiv = L.DomUtil.create('div', 'legend');
  legendDiv.innerHTML += '<h4 class="legendTitle legendTitle--h4">Legenda</h4>';
  amount = [1, 10, 20, 30, 40];

  legendDiv.innerHTML += '<i class="legendIcon" style="background-image: url(./img/weatherStation.png);background-repeat: no-repeat;"></i><span>Meetstation</span><br>'; 
  legendDiv.innerHTML += '<i style="background: #fc9272"></i><span>0 windmolens</span><br>';

  for (var i = 0; i < amount.length; i++) {
    legendDiv.innerHTML +=
      '<i style="background:' + getColor(amount[i] + 1) + '"></i> ' +
      amount[i] + (amount[i + 1] ? '&ndash;' + amount[i + 1] + " windmolens" + '<br>' : '+' + " windmolens");
  }
  legendDiv.innerHTML += '<h3 class="legendTitle legendTitle--h3">Vermogen</h3>';
  legendDiv.innerHTML += '<i class="legendIcon" style="background-image: url(./img/customIcon.png);background-repeat: no-repeat;"></i><span>Windmolenpark</span><br>';
  legendDiv.innerHTML += '<div class="linearGradient"> </div>'
  legendDiv.innerHTML += '<p class="gradientAmount"> 0 MW <span class="gradientAmount--high">755 MW</span></p>'
  return legendDiv;
};

legend.addTo(map);


// NAV FILTER
/* Set the width of the side navigation to 250px */
function openNav() {
  document.getElementById("nav").style.width = "30rem";
}

function closeNav() {
  document.getElementById("nav").style.width = "0";
}

//FILTER
function filter(){
  map.eachLayer(function (layer) {
    if(layer != mapLayer){
      map.removeLayer(layer);
    }
  });

  var year = document.getElementsByName("mapPickAmount");
  for (var i = 0; i < year.length; i++) {
    if (year[i].checked) {
      if (year[i].value == "2018"){
        map.addLayer(getMap(windmolens2018));
      } else {
        map.addLayer(getMap(windmolens2019));
      }
      break;
    }
  }

  var companies = document.getElementsByName("company");
  for (var i = 0; i < companies.length; i++) {
    if(companies[i].checked){
      var company = companies[i].value;
      filterWindmolenPark(company);
      break;
    }     
  }

  var measureStation = document.getElementsByName("weatherStation");
  for (var i = 0; i < measureStation.length; i++) {
    if(measureStation[i].checked){
      loadWeatherStation();
      break;
    }     
  }
}

function filterWindmolenPark(company){
  if(company == "all"){
    map.addLayer(windmolenparkLayer);
  }
  else{
    var windmolenpark = L.geoJSON(windmolenparken, {
      filter: function(feature, layer) {
        return feature.properties.bedrijf.includes(company);
      },
      onEachFeature: function(feature, layer){
        layer.bindPopup('<h2>' + feature.properties.Windpark + '</h2>' + 
                          '<p>' + "Dit windmolenpark heeft " + feature.properties.Aantal_windmolens + " windmolens."  + '<br>' +
                          "Het oppervlakte van het park is " + feature.properties.oppervlakte + " km²."  + '<br>' +
                          "Het vermogen is " + feature.properties.Vermogen_windpark_MW + " MW." + 
                          " Dat is " + feature.properties.Vermogen_per_windmolen_MW + " MW per windmolen."  + '<br>' +
                          "Het bedrijf is " + feature.properties.bedrijf + '</p>' +
                          '<img class="image" src="' + feature.properties.foto + '" alt="' + feature.properties.Windpark + ' foto" width="150" height="100"";>');
      },
      pointToLayer: function (feature, layer) {
        if(feature.properties.Vermogen_windpark_MW < 300){
          return L.marker(layer, {icon: parkIconFilter100});
        }
        else if(feature.properties.Vermogen_windpark_MW < 700){
          return L.marker(layer, {icon: parkIconFilter500});
        }
        else{
          return L.marker(layer, {icon: parkIconFilter700});
        }
      }
    });
    map.addLayer(windmolenpark);
  }
}

//WEATHER INFO
function loadWeatherStation(){
var request = new XMLHttpRequest();

request.open("GET", 'https://data.buienradar.nl/1.0/feed/xml', true);
request.responseType = 'document';
request.overrideMimeType('text/xml');
request.onload = function () {
  if (request.readyState === request.DONE) {
    if (request.status === 200) {
      xmlTest = request.responseXML;
      var dateWeather = xmlTest.getElementsByTagName("datum");
    
      var stationNames = xmlTest.getElementsByTagName("stationnaam");
      var windDirection = xmlTest.getElementsByTagName("windrichting");
      var windSpeed = xmlTest.getElementsByTagName("windsnelheidBF");
      var temperatures = xmlTest.getElementsByTagName("temperatuurGC");

      var latitudes = xmlTest.getElementsByTagName("lat");
      var longitudes = xmlTest.getElementsByTagName("lon");

      for (var a = 0; a < latitudes.length; a++){
        var stationName = stationNames[a].childNodes[0].nodeValue;
        var dateWeatherString = dateWeather[a].childNodes[0].nodeValue;
       
        var datetime = dateWeatherString.split(" ");
        var date = datetime[0];
        var time = datetime[1];

        var temp = date.split("/");
        var corrDate = temp[1] + "-" + temp[0] + "-" + temp[2];
        var temperature = temperatures[a].childNodes[0].nodeValue;
        console.log(temperature);
        
        // To catch windDirections that aren't defined!
        if (windDirection[a].childNodes[0] != undefined){
          var windDirectionString = windDirection[a].childNodes[0].nodeValue;
        }
        var windSpeedString = windSpeed[a].childNodes[0].nodeValue;

        var latGraden = latitudes[a].childNodes[0].nodeValue;
        var lonGraden = longitudes[a].childNodes[0].nodeValue;

        L.marker([latGraden, lonGraden], {icon: weatherStationIcon}).bindPopup('<h2>' + stationName + '</h2>' + 
        '<p>' + "Gemeten op: " + corrDate + " " + time + '<br>' +
        "De windrichting is " + windDirectionString + '<br>' +
        "De snelheid in BF is: " + windSpeedString + '<br>' +
        "De temperatuur is: " + temperature + " &#8451;").addTo(map);
      }
    }
    else{
      alert("Het laden van de meetstations is mislukt. Probeer het later opnieuw");
    }
  }                                                                                                                                                                                                                   
};
request.send(null);
}







