/* Dieses Skript wird ausgef�hrt, wenn der Browser index.html l�dt. */

// Befehle werden sequenziell abgearbeitet ...

/**
 * "console.log" schreibt auf die Konsole des Browsers
 * Das Konsolenfenster muss im Browser explizit ge�ffnet werden.
 */
console.log("The script is going to start...");

// Es folgen einige Deklarationen, die aber noch nicht ausgef�hrt werden ...

// Hier wird die verwendete API f�r Geolocations gew�hlt
// Die folgende Deklaration ist ein 'Mockup', das immer funktioniert und eine fixe Position liefert.
GEOLOCATIONAPI = {
    getCurrentPosition: function(onsuccess) {
        onsuccess({
            "coords": {
                "latitude": 49.013790,
                "longitude": 8.390071,
                "altitude": null,
                "accuracy": 39,
                "altitudeAccuracy": null,
                "heading": null,
                "speed": null
            },
            "timestamp": 1540282332239
        });
    }
};

// Die echte API ist diese.
// Falls es damit Probleme gibt, kommentieren Sie die Zeile aus.
GEOLOCATIONAPI = navigator.geolocation;

/**
 * GeoTagApp Locator Modul
 */
var gtaLocator = (function GtaLocator(geoLocationApi) {

    // Private Member

    /**
     * Funktion spricht Geolocation API an.
     * Bei Erfolg Callback 'onsuccess' mit Position.
     * Bei Fehler Callback 'onerror' mit Meldung.
     * Callback Funktionen als Parameter �bergeben.
     */
    var tryLocate = function(onsuccess, onerror) {
        if (geoLocationApi) {
            geoLocationApi.getCurrentPosition(onsuccess, function(error) {
                var msg;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "User denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        msg = "The request to get user location timed out.";
                        break;
                    case error.UNKNOWN_ERROR:
                        msg = "An unknown error occurred.";
                        break;
                }
                onerror(msg);
            });
        } else {
            onerror("Geolocation is not supported by this browser.");
        }
    };

    // Auslesen Breitengrad aus der Position
    var getLatitude = function(position) {
        return position.coords.latitude;
    };

    // Auslesen L�ngengrad aus Position
    var getLongitude = function(position) {
        return position.coords.longitude;
    };

    // Hier API-Key eintragen oder "YOUR_API_KEY_HERE", wenn kein API-Key verf�gbar ist
    var apiKey = "Lz4I2AVG3C7BK1EIinTOzy0E5f6fZ6HZ";

    /**
     * Funktion erzeugt eine URL, die auf die Karte verweist.
     * Falls die Karte geladen werden soll, muss oben ein API Key angegeben
     * sein.
     *
     * lat, lon : aktuelle Koordinaten (hier zentriert die Karte)
     * tags : Array mit Geotag Objekten, das auch leer bleiben kann
     * zoom: Zoomfaktor der Karte (aus [0, 18] int) (15 ist ein guter Wert)
     */
    var getLocationMapSrc = function(lat, lon, tags, zoom) {
        zoom = typeof zoom !== 'undefined' ? zoom : 10;

        if (apiKey === "YOUR_API_KEY_HERE") {
            console.log("No API key provided.");
            return "images/mapview.jpg";
        }

        var tagList = "&pois=You," + lat + "," + lon;
        if (tags !== undefined) tags.forEach(function(tag) {
            tagList += "|" + tag.name + "," + tag.latitude + "," + tag.longitude;
        });

        var urlString = "https://www.mapquestapi.com/staticmap/v4/getmap?key=" +
            apiKey + "&size=600,400&zoom=" + zoom + "&center=" + lat + "," + lon + "&" + tagList;

        console.log("Generated Maps Url: " + urlString);
        return urlString;
    };

	var tryLocateSuccess = function(position) {
		let latitude = getLatitude(position);
		let longitude = getLongitude(position);
		document.getElementById("tag-form_latitude-input").value = latitude.toFixed(7);
		document.getElementById("tag-form_longitude-input").value = longitude.toFixed(7);
		document.getElementById("filter-form_latitude-input-hidden").value = latitude;
		document.getElementById("filter-form_longitude-input-hidden").value = longitude;
        loadMap(latitude, longitude, getTagList());
	};

    var getTagList = function() {
        let imageNode = document.getElementById("result-img");
        return JSON.parse(imageNode.getAttribute("data-tags"));
    }

    var loadMap = function(latitude, longitude, taglist) {
        document.getElementById("tag-form_latitude-input").value, document.getElementById("tag-form_longitude-input").value
        let imgUrl = getLocationMapSrc(latitude, longitude, taglist, undefined);
        document.getElementById("result-img").src = imgUrl;
    }

    return { // Start �ffentlicher Teil des Moduls ...

        // Public Member

        readme: "Dieses Objekt enth�lt '�ffentliche' Teile des Moduls.",

        updateLocation: function() {
            let latitude = document.getElementById("tag-form_latitude-input").value;
            let longitude = document.getElementById("tag-form_longitude-input").value;
            if(latitude && longitude) {
                console.log("loadMap:")
                loadMap(latitude, longitude, getTagList());
            } else {
                console.log("tryLocate:")
                tryLocate(tryLocateSuccess, alert);
            }
        }
    }; // ... Ende �ffentlicher Teil
})(GEOLOCATIONAPI);

/**
 * $(function(){...}) wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */
$(function() {
    gtaLocator.updateLocation();
});
