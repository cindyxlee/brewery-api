'use strict';

let map;
const apiURL = 'https://api.openbrewerydb.org/breweries?';

//initialize google maps
function initMap() {

    const latlng = new google.maps.LatLng(34.0522, -118.2437);
    const mapOptions = {
        zoom: 8,
        center: latlng
    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
}

//for newMapMarkers function
function showMapMarkers(responseJson) {

    let bounds = new google.maps.LatLngBounds();

    for (let i = 0; i < responseJson.length; i++) {
        let eventVenue = responseJson[i].name;
        let latlng = new google.maps.LatLng(responseJson[i].latitude, responseJson[i].longitude);
        let venueAddress = responseJson[i].street + "," + responseJson[i].city + ", " + responseJson[i].state + " ";
        let postalCode = responseJson[i].postal_code;

        newMapMarkers(latlng, eventVenue, venueAddress, postalCode);

        bounds.extend(latlng);
    }
    map.fitBounds(bounds);
}

//create map info markers for new search
function newMapMarkers(latlng, eventVenue, venueAddress, postalCode) {

    const marker = new google.maps.Marker({
        map: map,
        position: latlng,
        title: eventVenue,
        animation: google.maps.Animation.DROP
    });

    const clicked = false;

    const infoWind = new google.maps.InfoWindow();

    google.maps.event.addListener(marker, "mouseover", function (e) {
        if (!clicked) {
            const showInfo = `<div><strong>${eventVenue}</strong><br>${venueAddress}${postalCode}</div>`;
            infoWind.setContent(showInfo);
            infoWind.open(map, marker);
        }
    });
    google.maps.event.addListener(marker, "mouseout", function (e) {
        if (!clicked) {
            infoWind.close();
        }
    });
}

//call map to submitted city and state
function initializeMap(responseJson) {

    const mapOptions = {
        center: new google.maps.LatLng(34.0522, -118.2437),
        zoom: 8,
        mapTypeId: 'roadmap',
    }

    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    showMapMarkers(responseJson);

    google.maps.event.addListener(map, 'click', function () {
        infoWindow.close();
    });
}

//for valid url query string
function formatQueryParams(params) {
    const queryItems = Object.keys(params).map(key => `${[encodeURIComponent(key)]}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
}

//shows search results or lack thereof
function displayResults(responseJson, maxResults = responseJson.length) {

    $('#results-list').empty();

    if (responseJson.length === 0) {
        alert('No breweries found, please try a different location.');
        $('#map').addClass('hidden');
    } else {
        for (let i = 0; i < responseJson.length & i < maxResults; i++) {
            $('#results-list').append(`<li class="result-display"><h3><a target="_blank" href="${responseJson[i].website_url}">${responseJson[i].name}</a></h3>
      <p class="result-address">${responseJson[i].street}, ${responseJson[i].city}, ${responseJson[i].state} ${responseJson[i].postal_code}<br>Phone: ${responseJson[i].phone}</p></li>`);
        }
        $('#search-results').removeClass('hidden');
        $('#map').removeClass('hidden');
    }


    initializeMap(responseJson);
}

//get data from api
function getEvents(userLoc, userState) {

    const params = {
        by_city: userLoc,
        by_state: userState,
    };
    const queryString = formatQueryParams(params);
    const url = apiURL + queryString;

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResults(responseJson))
};

function watchForm() {

    $('form').submit(event => {
        event.preventDefault();
        let userLoc = $('#js-search-loc').val();
        let userState = $('#js-search-state').val();
        getEvents(userLoc, userState);
    });
}

$(watchForm);