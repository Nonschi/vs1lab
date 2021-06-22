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
const { checkPrime } = require('crypto');

var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
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

        getTagById: function(id) {
            return [...geoTagModule.filter(tag => tag.id === id)];
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
        
        deleteGeoTag: function(geoTag) {
            let index = geoTags.indexOf(geoTag);
            geoTags.splice(index, 1);
        },

        getGeoTag: function(id) {
            return geoTags.filter(tag => tag.id == id);
        },

        setGeoTag: function(geoTagId, newGeoTag) {
            let foundGeoTag = this.getGeoTag(geoTagId);
            if (foundGeoTag !== undefined) {
                foundGeoTag = newGeoTag;
                return true;
            }
            return false;
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
    console.log("geoztagtagging");

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
    console.log("geoztagdisc");

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
    console.log("geotags post");
    let geoTag = req.body;
    console.log(geoTag);
    if(geoTag) {
        let results = geoTagModule.searchGeoTagsRadius(geoTag.latitude, geoTag.longitude,
            geoTagModule.RADIUS);
        let response = [geoTag, ...results];
        geoTagModule.addGeoTag(geoTag);
        res.status(201).json(response);
    } else {
        res.status(400).send("GeoTag undefined.");
    }

});

app.get("/geotags", function(req, res) {
    console.log("geotags get");
    let lat = req.query.latitude;
    let long = req.query.longitude;
    if(lat && long) {
        res.status(200).json(geoTagModule.searchGeoTagsSearchterm(lat, long,
                geoTagModule.RADIUS, req.query.search));
    } else {
        res.status(400).send("Coordinates undefined.");
    }

});

app.get("/geotags/:id", function(req, res) {
    console.log("geoztagsgetid");
    let id = req.params.id;
    console.log(id)
    let geoTag = geoTagModule.getGeoTag(id);
    console.log(geoTag);
    if (geoTag) {
        res.status(200).json(geoTag);
    } else {
        res.status(404).send("No geotag with this id defined: " + id);
    }
});

app.put("/geotags/:id", function(req, res) {
    console.log("geoztagputtid");

    let id = req.params.id;
    let geoTag = req.body;
    console.log(geoTag);
    if (id != geoTag.id) {
        res.status(400).send("Geo-tag with id " + geoTag.id + " cannot change geo-tag stored at id " + id);
    } else {
        if (geoTagModule.setGeoTag(id, geoTag)) {
            res.status(200).json(geoTag);
        } else {
            res.status(404).send("No geo-tag with id: " + id);
        }
    }
});

app.delete("/geotags/:id", function(req, res) {
    console.log("geoztagsdeleteid");

    let id = req.params.id;
    let geoTag = geoTagModule.getGeoTag(id);
    if (geoTag) {
        geoTagModule.deleteGeoTag(geoTag);
        res.status(200).send("Deleted geotag.");
    } else {
        res.status(404).send("No geotag with this id defined: " + id);
    }
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
