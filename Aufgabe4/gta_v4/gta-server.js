/**
 * Template f�r �bungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client-Komponenten im
 * Verzeichnisbaum implementieren. Dazu m�ssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abh�ngigkeiten und erzeuge Express app.
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
 * Konfiguriere den Pfad f�r statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

app.use(express.static(__dirname + "/public"));

/**
 * Konstruktor f�r GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

var newGeoTagObject = function(latitude, longitude, name, hashtag) {
    let geoTag = {
        latitude: latitude,
        longitude: longitude,
        name: name,
        hashtag: hashtag,
        id: undefined
    };
    return geoTag;
}

/**
 * Modul f�r 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher f�r Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzuf�gen eines Geo Tags.
 * - Funktion zum L�schen eines Geo Tags.
 */

var geoTagModule = (function() {
    // private members
    
    var geoTags = [];
    
    var currentId = -1;
    
    var getId = (function() {
        return currentId;
    });
    
    var getNextId = (function() {
        return ++currentId;
    });
    
    return {
        // public members
        
        RADIUS: 0.101, // 0.001 ~100 meter radius
        
        searchGeoTagsRadius: function(latitude, longitude, radius) {
            if (radius === undefined) {
                radius = this.RADIUS;
            }
            foundGeoTags = [];
            geoTags.forEach(function(geoTag) {
                if (Math.abs(latitude - geoTag.latitude) <= radius
                        && Math.abs(longitude - geoTag.longitude) <= radius) {
                    foundGeoTags.push(geoTag);
                }
            });
            return foundGeoTags;
        },
        
        searchGeoTagsSearchterm: function(latitude, longitude, radius, searchterm) {
            foundGeoTags = [];
            if (searchterm !== undefined && searchterm !== "") {
                geoTags.forEach(function(geoTag) {
                    if (geoTag.name.includes(searchterm) || geoTag.hashtag.includes(searchterm)) {
                        foundGeoTags.push(geoTag);
                    }
                });
            } else {
                foundGeoTags = this.searchGeoTagsRadius(latitude, longitude, radius);
            }
            return foundGeoTags;
        },
        
        addGeoTag: function(geoTag) {
            geoTag.id = getNextId();
            geoTags.push(geoTag);
        },
        
        deleteGeoTag: function(geoTagId) {
            let index = -1;
            for (let i = 0; i < geoTags.length; i++) {
                if (geoTags[i].id === geoTagId) {
                    index = i;
                    break;
                }
            }
            if (index !== -1) {
                geoTags.splice(index, 1);
            }
        },

        getGeoTag: function(id) {
            return geoTags.filter(tag => tag.id === id);
        }
    };
})();

/**
 * Route mit Pfad '/' f�r HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function(req, res) {
    res.render('gta', {
        taglist: [],
        geoTag: undefined
    });
});

/**
 * Route mit Pfad '/tagging' f�r HTTP 'POST' Requests.
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
    let newGeoTag = newGeoTagObject(req.body.latitude,
            req.body.longitude, req.body.name, req.body.hashtag);
    let geoTags = [newGeoTag];
    geoTagModule.searchGeoTagsRadius(newGeoTag.latitude, newGeoTag.longitude, geoTagModule.RADIUS).forEach(
            function(gTag) {
                geoTags.push(gTag);
            });
    geoTagModule.addGeoTag(newGeoTag);
    res.render('gta', {
        taglist: geoTags,
        geoTag: newGeoTag
    });
});

/**
 * Route mit Pfad '/discovery' f�r HTTP 'POST' Requests.
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
    let latitude = req.body.latitude;
    let longitude = req.body.longitude;
    let geoTags = geoTagModule.searchGeoTagsSearchterm(latitude, longitude,
            geoTagModule.RADIUS, req.body.searchterm);
    res.render('gta', {
        taglist: geoTags,
        geoTag: newGeoTagObject(req.body.latitude, req.body.longitude, undefined, undefined)
    });
});

app.post("/geotags", function(req, res) {

});

app.get("/geotags", function(req, res) {

});

app.put("/geotags/:id", function(req, res) {

});

app.put("/geotags/:id", function(req, res) {

});

app.delete("/geotags/:id", function(req, res) {

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
