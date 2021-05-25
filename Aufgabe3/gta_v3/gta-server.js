/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

var http = require('http');
//var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');

var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */
 app.use(express.static(__dirname + "/public"));


/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */
function GeoTagObject(latitude, longitude, name, hashtag) {
	this.latitude = latitude;
	this.longitude = longitude;
	this.name = name;
	this.hashtag = hashtag;
}
/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */
var GeoTagModul = {
    geoTagsArray: [],

    inRadius: (lat, long, latGeoTag, longGeotag, radius) => {
        return radius >= Math.sqrt( Math.pow(lat - latGeoTag, 2) + Math.pow(long - longGeotag, 2))
    },  

    searchName: name => {
        return GeoTagModul.geoTagsArray.filter(geoTag => geoTag.name == name);
    },

   deleteGeoTag: (name) => {
           this.searchName(name).array.forEach(geoTag => {
            GeoTagModul.geoTagsArray.array.splice(GeoTagModul.geoTagsArray.indexOf(geoTag),1)
           });
    },

    addGeoTag: ( latitude,longitude, name, hashtag) => {
            if(Array.isArray(GeoTagModul.geoTagsArray) && GeoTagModul.geoTagsArray.filter(geoTag => geoTag.name == name).length == 0) {
                GeoTagModul.geoTagsArray.push(new GeoTagObject(latitude, longitude, name, hashtag));
                console.log(GeoTagModul);
            }
    },

    searchRadius: (longitude, latitude, radius) => {
            return GeoTagModul.geoTagsArray.filter(geoTag => GeoTagModul.inRadius(longitude, geoTag.longitude, latitude, geoTag.latitude, radius));
    },
    
};

    
/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function(req, res) {
    res.render('gta', {
        taglist: [],
        latitude: "",
		longitude: ""
    });
});

/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */

 app.post('/tagging', function(req, res) {
	GeoTagModul.addGeoTag(req.latitude,req.longitude, req.name,req.hashtag);
    res.render('gta', {
        taglist: GeoTagModul.searchRadius(req.body.latitude, req.body.longitude, 0.001),
		latitude: req.body.latitude,
		longitude: req.body.longitude
    });
});


/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */

 app.post('/discovery', function(req, res) {
    if(req.body.remove != undefined) {
        GeoTagModul.remove(req.body.searchterm);
	}
    res.render('gta', {
        taglist: GeoTagModul.searchName(req.body.searchterm),
		latitude: "",
		longitude: ""
    });
});


/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);
