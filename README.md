Print UI for ArcGIS API for JavaScript
======================================

This module provides a UI for the [PrintTask of the ArcGIS API for JavaScript].

## Usage ##

### Install ###
```
bower install arcgis-print-ui --save
```

#### Add to HTML ####

Below is the body of an HTML document.

```html
<body>
    <div id="flexcontainer">
        <div class="map-container">
            <div id="map">
            </div>
        </div>
        <div id="tools">
        </div>
    </div>
    <script>
        (function (root) {
            var dojoConfig = {
                async: true,
                packages: [
                   {
                       name: "ArcGisPrintUI",
                       // You may have to adjust the location based on where you
                       // placed the bower module.
                       location: root + "/bower_modules/arcgis-print-ui",
                       main: "ArcGisPrintUI"
                   }
                ]

            };
            window.dojoConfig = dojoConfig;
        }(location.pathname.replace(/\/[^\/]*$/, "")));
    </script>
    <script src="//js.arcgis.com/3.14/init.js" integrity="sha384-OtVDcngcQuUevGoZawN1DJindz3CY7BTaX64Y+B3z7FRGfeHtH4pFJTVxlZEoZVa" crossorigin="anonymous"></script>
    <script src="index.js"></script>
</body>
```

#### JavaScript ####

Below is the JavaScript for setting up the print form. In the example HTML above, this is the content of `index.js`.

```javascript
require(["esri/map", "ArcGisPrintUI"], function (Map, ArcGisPrintUI) {
    var map;
    // Replace with your own print service's URL.
    var printUrl = "http://www.example.com/arcgis/rest/services/MyDir/MyPrintService/GPServer/Export Web Map";

    // Create the print form object.
    var printForm = new ArcGisPrintUI(printUrl);
    var form = printForm.form;
    document.getElementById("tools").appendChild(form);

    // Create the map object.
    map = new Map("map", {
        basemap: "hybrid",
        center: [-120.80566406246835, 47.41322033015946],
        zoom: 7,
        showAttribution: true
    });

    // Assign the map to the print form so it knows what to print from.
    printForm.map = map;
});
```

#### Example CSS for styling print form ####

```css
html, body {
    padding: 0;
    margin: 0;
    height: 100%;
    overflow: hidden;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 10pt;
}

.map, .map-container {
    height: 100%;
}

#flexcontainer {
    height: 100%;
    display: flex;
    -ms-flex-flow: row nowrap;
    flex-flow: row nowrap;
}

    /* Set map panel to take up remaining space. */
    #flexcontainer > :first-child {
        -ms-flex: 1;
        flex: 1;
    }

#tools {
    overflow-y: auto;
}

.btn-group-justified > div {
    display: inline-block;
}


/* Show a message when the print jobs list is empty. */
.print-jobs-list:empty:after {
    content: 'No print jobs have occurred this session.';
}
```

[PrintTask of the ArcGIS API for JavaScript]:https://developers.arcgis.com/javascript/jsapi/printtask-amd.html
