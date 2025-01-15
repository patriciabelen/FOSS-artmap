console.log('loaded!')
console.log(maplibregl)



        



////////////////////////////// Add a map with demo tiles

//https://maplibre.org/maplibre-gl-js/docs/examples/simple-map/
// const map = new maplibregl.Map({
//     container: 'map', // container id
//     style: 'https://demotiles.maplibre.org/style.json', // style URL
//     center: [-73.9205, 40.6803], // starting position [lng, lat]
//     zoom: 9, // starting zoom
//     hash: true
// });


////////////////////////////// Replace with our own map from maptiler

//Open Maptiler my cloud
//Open "Maps", select your map
//Copy the "use vector style" link

const map = new maplibregl.Map({
    container: 'map', // container id
    style: 'https://api.maptiler.com/maps/3aa0af01-b868-444c-acd9-cc495d53ecf0/style.json?key=4MI1kZBuj2ZQXMrlxErQ', // style URL
    center: [-73.9522650800253, 40.75979383249296], // starting position [lng, lat]
    zoom: 11, // starting zoom
    hash: true
});


const nav = new maplibregl.NavigationControl();
map.addControl(nav, 'bottom-right');



// PRINTING
map.addControl(
    new MaplibreExportControl.MaplibreExportControl({
        PageSize: MaplibreExportControl.Size.A4,
        PageOrientation: MaplibreExportControl.PageOrientation.Landscape,
        Format: MaplibreExportControl.Format.PNG,
        DPI: MaplibreExportControl.DPI[300],
        Crosshair: true,
        PrintableArea: true,
        Local: 'en'
    }),
    'top-right'
);



////////////////////////////// Map events
//https://maplibre.org/maplibre-gl-js/docs/API/classes/maplibregl.Map/#events
//https://maplibre.org/maplibre-gl-js/docs/API/classes/maplibregl.Map/#on - Yikes! Why so buried?
//https://docs.mapbox.com/mapbox-gl-js/api/map/#map-events - A little easier to find

// map.once('load',()=>{
//     console.log('loaded!');
// });

// map.once('click',()=>{
//     console.log('clicked!');
// });

// map.on('click',()=>{
//     console.log('clicked!');
// });



////////////////////////////// Load geojson  //Include Axios
map.once('load',main);

async function main(){
    //Load geojson async/await == .then(...)

    let GalleryGeojson = await axios('ART_GALLERY_20250108.geojson');
    map.addSource('galleries-src', {
        'type': 'geojson',
        'data': GalleryGeojson.data
    });

    map.addLayer({
        'id': 'galleries',
        'type': 'circle',
        'source': 'galleries-src',
        'layout': {},
        'paint':{
            'circle-color':'#0033ff',
            //'circle-stroke-width':2,
            //'circle-stroke-color':'#ffff00',
            'circle-opacity':0.5,
            'circle-radius':5
        }
    });

    let MuseumGeojson = await axios('MUSEUM_20250108.geojson');
    map.addSource('museums-src', {
        'type': 'geojson',
        'data': MuseumGeojson.data
    });

    //https://maplibre.org/maplibre-style-spec/layers/
    map.addLayer({
        'id': 'museums',
        'type': 'circle',
        'source': 'museums-src',
        'layout': {},
        //https://maplibre.org/maplibre-style-spec/layers/#circle
        'paint':{
            'circle-color':'#ff0000',
            'circle-opacity':0.5,
            'circle-radius':5
        }
    });



 
    addEvents();

}





function addEvents() {
////////////////////////////// MUSEUMS POPUPS
//https://maplibre.org/maplibre-gl-js/docs/examples/popup-on-hover/
    const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mousemove', 'museums', (e) => {
        map.getCanvas().style.cursor = 'pointer';

        const coordinates = e.features[0].geometry.coordinates.slice();
        const name = e.features[0].properties.name;
        const city = e.features[0].properties.city;
        const adress1 = e.features[0].properties.adress1;
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(coordinates).setHTML(
            `
            <div class="mpop">
            <p>
            <b>${name}</b>
            <br>
            ${adress1}
            <br>
            ${city}
            </p>
            </div>
            `
        ).addTo(map);
    });
    map.on('mouseleave', 'museums', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });



////////////////////////////// GALLERIES POPUPS
const gpopup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false
    });
    map.on('mousemove', 'galleries', (e) => {
        map.getCanvas().style.cursor = 'pointer';

        const gcoordinates = e.features[0].geometry.coordinates.slice();
        const gname = e.features[0].properties.name;
        const gcity = e.features[0].properties.city;
        const gadress1 = e.features[0].properties.address1;
        while (Math.abs(e.lngLat.lng - gcoordinates[0]) > 180) {
            gcoordinates[0] += e.lngLat.lng > gcoordinates[0] ? 360 : -360;
        }
        gpopup.setLngLat(gcoordinates).setHTML(
            `
            <div class="gpop">
            <p>
            <b>${gname}</b>
            <br>
            ${gadress1}
            <br>
            ${gcity}
            </p>
            </div>
            `
        ).addTo(map);
    });
    map.on('mouseleave', 'galleries', () => {
        map.getCanvas().style.cursor = '';
        gpopup.remove();
    });




}



////////////////////////////// GALLERIES SLIDER FOR SIZE
slider.addEventListener('input', (e) => {
    // Adjust the layers opacity. layer here is arbitrary - this could
    // be another layer name found in your style or a custom layer
    // added on the fly using `addSource`.
    map.setPaintProperty(
    'galleries',
    'circle-radius',
    parseInt(e.target.value, 20) / 1
    );
     
    // Value indicator
    sliderValue.textContent = e.target.value + '%';
    });


////////////////////////////// MUSEUMS SLIDER FOR SIZE
mslider.addEventListener('input', (e) => {
    // Adjust the layers opacity. layer here is arbitrary - this could
    // be another layer name found in your style or a custom layer
    // added on the fly using `addSource`.
    map.setPaintProperty(
    'museums',
    'circle-radius',
    parseInt(e.target.value, 20) / 1
    );
     
    // Value indicator
    msliderValue.textContent = e.target.value + '%';
    });


////////////////////////////// SELECT TO CHANGE COLOR
    var swatches = document.getElementById('swatches');
    var layer = document.getElementById('layer');
    var colors = [
        '#eeeeee',
        '#20fc03',
        '#ff2bf1',
        '#00f7ff',
        '#ff8000',
        '#fff700',
        '#00a123',
        '#0033ff',
        '#ff0000',
        '#000000'
    ];

    colors.forEach((color) => {
        const swatch = document.createElement('button');
        swatch.style.backgroundColor = color;
        swatch.addEventListener('click', () => {
            if(layer.value === "background"){
                map.setPaintProperty(layer.value, 'background-color', color);
            }
            else if(layer.value === "border_other"){
                map.setPaintProperty(layer.value, 'line-color', color);
            }
            else if(layer.value === "railway"){
                map.setPaintProperty(layer.value, 'line-color', color);
            }
            else if(layer.value === "waterway"){
                map.setPaintProperty(layer.value, 'line-color', color);
            }
            else if(layer.value === "galleries"){
                map.setPaintProperty(layer.value, 'circle-color', color);
            }
            else if(layer.value === "museums"){
                map.setPaintProperty(layer.value, 'circle-color', color);
            }
            else {
                map.setPaintProperty(layer.value, 'fill-color', color);
            }

        });
        swatches.appendChild(swatch);
    });





$(document).ready(function(){

    $("#changeColorButton").click(function() {
// background color
        function getRandomColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
              color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
          }

        var randomColor = getRandomColor();
        $("select option").each(function() {
            map.setPaintProperty("background", 'background-color', randomColor);
          });

// railway color
          function getRailColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
              color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
          }

        var railColor = getRailColor();
        $("select option").each(function() {
            map.setPaintProperty("railway", 'line-color', railColor);
          });

// border color
        function getBorderColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
              color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
          }

        var borderColor = getBorderColor();
        $("select option").each(function() {
            map.setPaintProperty("border_other", 'line-color', borderColor);
          });

// water color
        function getWaterColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
              color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
          }

        var waterColor = getWaterColor();
        $("select option").each(function() {
            map.setPaintProperty("water", 'fill-color', waterColor);
          });

// galleries circle
        function getGalleriesColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
              color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
          }

        var galleriesColor = getGalleriesColor();
        $("select option").each(function() {
            map.setPaintProperty("galleries", 'circle-color', galleriesColor);
          });

// museums circle
        function getMuseumsColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
              color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
          }

        var museumsColor = getMuseumsColor();
        $("select option").each(function() {
            map.setPaintProperty("museums", 'circle-color', museumsColor);
          });

// residential circle
        function getResidentialColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

        var residentialColor = getResidentialColor();
        $("select option").each(function() {
            map.setPaintProperty("residential", 'fill-color', residentialColor);
        });

// parks landcover circle
        function getParksColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

        var parksColor = getParksColor();
        $("select option").each(function() {
            map.setPaintProperty("landcover", 'fill-color', parksColor);
        });



      });
   
      
$('.open').click(function(){
        var link = $(this);
        $('.showpanel').slideToggle('slow', function() {
            if ($(this).is(":visible")) {
                 link.text('info –');                
            } else {
                 link.text('info +');                
            }        
        });
            
    });



});





// to do
// https://www.google.com/search?q=jquery+random+color+for+select+dropdown&sca_esv=13bdc68c19977ab8&sxsrf=ADLYWIIPYpSfKhkjlQblELeLmdI5VSA-ZQ%3A1736729183969&ei=X2KEZ4HsOuKJptQPhfuG0Q8&oq=jquery+random+color+for+select&gs_lp=Egxnd3Mtd2l6LXNlcnAiHmpxdWVyeSByYW5kb20gY29sb3IgZm9yIHNlbGVjdCoCCAMyBRAhGKABMgUQIRigATIFECEYoAEyBRAhGKABMgUQIRifBUirxgJQAFi5pgJwDXgBkAEAmAFxoAH0EKoBBDIzLjK4AQPIAQD4AQGYAiagAv4RwgIEECMYJ8ICCxAAGIAEGJECGIoFwgIKEAAYgAQYQxiKBcICBRAAGIAEwgIKEAAYgAQYFBiHAsICBhAAGBYYHsICBxAjGLACGCfCAgcQABiABBgNwgIGEAAYDRgewgIMEAAYgAQYQxiKBRgKwgILEAAYgAQYhgMYigXCAggQABiABBiiBMICBRAAGO8FwgIFECEYqwKYAwCSBwQzNS4zoAeWmAE&sclient=gws-wiz-serp

// https://www.google.com/search?q=jquery+random+background+color+button&sca_esv=535ca4972108ea6d&sxsrf=ADLYWIIUFgj6BKORzXQMPlfFivjthMXCWw%3A1736524178776&ei=kkGBZ8zzLqOs5NoPxaHgqQk&ved=0ahUKEwjMhMfWwOuKAxUjFlkFHcUQOJUQ4dUDCBA&uact=5&oq=jquery+random+background+color+button&gs_lp=Egxnd3Mtd2l6LXNlcnAiJWpxdWVyeSByYW5kb20gYmFja2dyb3VuZCBjb2xvciBidXR0b24yBRAAGO8FMgUQABjvBTIFEAAY7wUyCBAAGIAEGKIEMgUQABjvBUilM1C1KliAMHACeAGQAQCYAWmgAbYEqgEDNS4xuAEDyAEA-AEBmAIHoALvA8ICChAAGLADGNYEGEfCAgYQABgHGB7CAgoQIRigARjDBBgKmAMAiAYBkAYIkgcDNi4xoAfyFA&sclient=gws-wiz-serp 

