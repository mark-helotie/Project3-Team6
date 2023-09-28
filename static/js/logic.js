//  United States Geological Survey (USGS) -- All Earthquakes from the Past 7 Days
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(url).then(function(data) {

    // Store the imported data to earthquakesData variable
    var earthquakesData = data;

    // Print the object keys --- ONLY FOR TROUBLESHOOTING
    //   console.log(Object.keys(earthquakesData));

    // Get the date that the data was generated and log to console
    var dataDate = new Date(earthquakesData.metadata.generated);
    console.log(dataDate);

    // Create a object list with the target data columns
    var newData = [];
    for (var i = 0; i < earthquakesData.features.length; i++) {
        var time = new Date(earthquakesData.features[i].properties.time);
        newData.push({
            "time": time.toLocaleTimeString("en-US", options),
            "title": earthquakesData.features[i].properties.title,
            "url": earthquakesData.features[i].properties.url,
            "mag": earthquakesData.features[i].properties.mag,
            "lat": earthquakesData.features[i].geometry.coordinates[0],
            "lon": earthquakesData.features[i].geometry.coordinates[1],
            "depth": earthquakesData.features[i].geometry.coordinates[2]
        });
    };
    // Print the data --- ONLY FOR TROUBLESHOOTING 
    //   console.log(newData);

    // Create a geoJSON layer containing the features array and add a popup for each marker and send the layer to the createMap() function.
    let earthquakes = L.geoJSON(data.features, { onEachFeature: addPopup });

    // Call the function to load the map and the circles
    createMap(earthquakes, newData);
});

// Define the time format
var options = { year: 'numeric', month: 'numeric', day: 'numeric' };
options.timeZone = 'UTC';

// Define a function we want to run once for each feature in the features array
function addPopup(feature, layer) {

    // Give each feature a popup describing the place and time of the earthquake
    return layer.bindPopup(`<h3> ${feature.properties.place} </h3> <hr> <p> ${Date(feature.properties.time)} </p>`);
}

// function to receive a layer of markers and plot them on a map
function createMap(earthquakes, data) {

    // Define the base layers
    var street = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
      );

    var topo = L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      });

    // Creating a baseMaps object to hold our base layers from above
    var baseMaps = { 
        "Street Map": street,
        "Topographic Map": topo,
    };

    // Create the circles for each data point 
    var earthquakeCircles = [];
    data.forEach(function (element) {

        // Select the color of the circle based on the depth of the earthquake
        var color = "";
        if (element.depth < 3) { color = "#FFDFCD"; }
        else if (element.depth < 10) { color = "#FFC5A5"; }
        else if (element.depth < 20) { color = "#FFA573"; }
        else if (element.depth < 40) { color = "#FF5E05"; }
        else if (element.depth < 70) { color = "#C84700"; }
        else { color = "#8C3200"; }

        // Create a circles array and define popup
        circles = L.circle([element.lon, element.lat], {
            fillOpacity: .90,
            color: "black",
            weight: .6,
            fillColor: color,
            radius: element.mag * 21000
        }).bindPopup(`<h5 style="font-weight: bold;">${element.title}</h5> <hr> 
            <p>${element.time} UTC</p> 
            <p>Magnitude: ${element.mag}</p>
            <p>Depth: ${element.depth} km</p>
            <a href="${element.url}" target="_blank">More details...</a>`);
        earthquakeCircles.push(circles);
    });

    // Create a layerGroup for each quake's markers.
    var earthquakeLayer = L.layerGroup(earthquakeCircles);

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [40, -98],
        zoom: 5,
        fullscreenControl: true,
        layers: [street, earthquakeLayer]

    });

    // Create an overlay for the tectonic plates layer
    var tectonicPlates = new L.LayerGroup();

    d3.json(
        "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
        ).then(function (tectonicPlateData) {
            L.geoJson(tectonicPlateData).addTo(tectonicPlates);
            tectonicPlates.addTo(myMap);
        });

    // Create overlay object to hold our overlay layers	
    var overlayMaps = { 
        "Earthquakes": earthquakeLayer,
        "Tectonic Plates": tectonicPlates
    };
    
    // Create a legend for depth
    var myColors = ["#FFDFCD","#FFC5A5","#FFA573","#FF5E05","#C84700","#8C3200"];
 
    var legend = L.control({position:'bottomright'});
    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend');
        labels = ["<div style='background-color: lightgray'><b>&nbspEARTHQUAKE&nbsp<br>&nbsp&nbsp&nbspDEPTH (km)&nbsp&nbsp</b></div>"];
        categories = ['< 3', '3 to 10', '10 to 20', '20 to 40', '40 to 70', '> 70'];
        for (var i = 0; i < categories.length; i++) {
            div.innerHTML +=
                labels.push(
                    '<li class="circle" style="background-color:' + myColors[i] + '"><b>' + categories[i] + '</b></li> '
                );
        }
        div.innerHTML = '<ul style="list-style-type:none; text-align: center">' + labels.join('') + '</ul>'
        return div;
    };
    legend.addTo(myMap);

    // Add the scale to the map
    L.control.scale().addTo(myMap);

    // Create the layer control, pass in our baseMaps and overlayMaps and add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);
};