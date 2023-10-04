// Cities array data created
city_data = [
  {
      'id': 1,
      'name': 'Birmingham',
      'lat': 33.53894154,
      'lng': -86.81664397
  },
]



// Create a map object.
let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5
});

// Add a tile layer.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Create a layer group for city markers.
var cityMarkerGroup = L.layerGroup().addTo(myMap);

// Function to fetch events in a city using Ticketmaster API
  function getEventsInCity(id) {
    const apiKey = 'S2v9Md44UbLI7UVMA583AjbIZ4dPB5tu';

    // Define the Ticketmaster API URL to fetch events in the city
    const apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json?city=${cityName}&apikey=${apiKey}&size=10`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Process the data and display event details on the map as markers
            var events = data._embedded.events;
            for (let i = 0; i < events.length; i++) {
                var event = events[i];
                var eventName = event.name;
                var eventVenue = event._embedded.venues[0].name;
                var eventDate = event.dates.start.localDate;
                var eventLat = event._embedded.venues[0].location.latitude;
                var eventLng = event._embedded.venues[0].location.longitude;

                // Create a marker for the event
                var eventMarker = L.marker([eventLat, eventLng]).addTo(myMap);

                // Add a popup with event details to the marker
                eventMarker.bindPopup(`<h1>${eventName}</h1><p>Venue: ${eventVenue}</p><p>Date: ${eventDate}</p>`);

                // Add the event marker to a separate layer group for events
                eventMarker.addTo(eventMarkerGroup);
            }
        })
        .catch(error => {
            console.error('Error fetching events:', error);
        });
}

// Create a layer group for event markers
var eventMarkerGroup = L.layerGroup();

// Loop through the cities array and create one marker for each city object.
for (let i = 0; i < city_data.length; i++) {
    var marker = L.marker([city_data[i].lat, city_data[i].lng], {
        icon: L.divIcon({ className: 'custom-div-icon' })
    }).addTo(cityMarkerGroup);

    // Add a mouseover event to show the city name when hovering over the marker.
    marker.on('mouseover', function () {
        marker.bindPopup(`<h1>${city_data[i].name}</h1>`).openPopup();
    });

    // Add a click event to fetch and display events in the city when clicking on the marker.
    marker.on('click', function () {
        // Clear previous event markers from the map
          myMap.setView([city_data[i].lat, city_data[i].lng], 9)
          eventMarkerGroup.eachLayer(function (layer) {
              if (layer !== myMap) {
                  eventMarkerGroup.removeLayer(layer);
              }
          });
        eventMarkerGroup.clearLayers();

        // Call the function to fetch and display events
          getEventsInCity(city_data[i].id);
          eventMarkerGroupMarkerGroup.addLayer(marker);
    });
}