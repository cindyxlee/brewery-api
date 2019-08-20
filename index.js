'use strict';

let map;
const apiURL = 'https://api.openbrewerydb.org/breweries?';

function initMap() {
    console.log(`initMap ran`);

    const latlng = new google.maps.LatLng(34.0522, -118.2437);
    const mapOptions = {
        zoom: 8,
        center: latlng
    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
}

function showMapMarkers(responseJson) {
    console.log(`showMapMarkers ran`);

    let bounds = new google.maps.LatLngBounds();

    for (let i = 0; i < responseJson.length; i++) {
        let eventURL = responseJson[i].website_url;
        let eventVenue = responseJson[i].name;
        let eventLat = responseJson[i].latitude;
        let eventLong = responseJson[i].longitude;
        let latlng = new google.maps.LatLng(responseJson[i].latitude, responseJson[i].longitude);
        let venueAddress = responseJson[i].street + ", " + responseJson[i].city + ", " + responseJson[i].state + " ";
        let postalCode = responseJson[i].postal_code;

        newMapMarkers(latlng, eventVenue, venueAddress, postalCode, eventURL);

        bounds.extend(latlng);
    }
    map.fitBounds(bounds);
}

function newMapMarkers(latlng, eventVenue, venueAddress, postalCode, eventURL) {
    console.log(`newMapMarkers ran`);

    const marker = new google.maps.Marker({
        map: map,
        position: latlng,
        title: eventVenue,
        animation: google.maps.Animation.DROP
    });
    console.log(`markers marked`);

    const clicked = false;

    const infoWind = new google.maps.InfoWindow();
    console.log(`infoWindow ran`);

    google.maps.event.addListener(marker, "mouseover", function (e) {
        if (!clicked) {
            const showInfo = `<div><strong>${eventVenue}</strong><br>${venueAddress}${postalCode}</div>`;
            infoWind.setContent(showInfo);
            infoWind.open(map, marker);
        }
        console.log(`listener added`);
    });
    google.maps.event.addListener(marker, "mouseout", function (e) {
        if (!clicked) {
            infoWind.close();
        }
    });
}

function initializeMap(responseJson) {
    console.log(`initializeMap ran`);

    const mapOptions = {
        center: new google.maps.LatLng(34.0522, -118.2437),
        zoom: 8,
        mapTypeId: 'roadmap',
    }

    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    showMapMarkers(responseJson);
    console.log(`showmapmarkers is starting`);

    google.maps.event.addListener(map, 'click', function () {
        infoWindow.close();
    });
}

function revealMap() {
    console.log(`revealMap ran`);

    $('.search-button').on('click', function () {
        $('#map').show();
    });
}

function formatQueryParams(params) {
    console.log(`formatQueryParams ran`);
    const queryItems = Object.keys(params).map(key => `${[encodeURIComponent(key)]}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
}

function displayResults(responseJson, maxResults = responseJson.length) {
    console.log(`displayResults ran`);
    console.log(responseJson);

    $('#results-list').empty();

    if (responseJson.length === 0) {
        alert('No breweries found, please try a different location.');
    } else {
        console.log(`the output was released`);
        for (let i = 0; i < responseJson.length & i < maxResults; i++) {
            $('#results-list').append(`<li class="result-display"><h3><a target="_blank" href="${responseJson[i].website_url}">${responseJson[i].name}</a></h3>
      <p class="result-address">${responseJson[i].street}, ${responseJson[i].city}, ${responseJson[i].state} ${responseJson[i].postal_code}<br>Phone: ${responseJson[i].phone}</p></li>`);
        }
        $('#search-results').removeClass('hidden');
    }


    initializeMap(responseJson);
}

function getEvents(userLoc) {
    console.log(`getEvents ran`);

    const params = {
        by_city: userLoc,
    };
    const queryString = formatQueryParams(params);
    const url = apiURL + queryString;
    console.log(url);

    fetch(url)
        .then(response => {
            console.log(`this is okay too`)
            if (response.ok) {
                console.log(`response ok`);
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResults(responseJson))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

function watchForm() {
    console.log(`watchForm ran`);

    $('form').submit(event => {
        event.preventDefault();
        let userLoc = $('#js-search-loc').val();
        getEvents(userLoc);
    });

    revealMap();
}

$(watchForm);