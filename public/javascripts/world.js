var width = window.innerWidth;
var height = window.innerHeight - 140;
var time = Date.now();
var rotate = [0, 0];
var velocity = [.015, 0];

// var space = d3.geo.orthographic()
//     .scale(750)
//     .translate([width / 2, height / 2])

// var spacePath = d3.geo.path()
//     .projection(projection)
//     .pointRadius(1);

var projection = d3.geo.orthographic()
    .scale(250)
    .translate([width / 2, height / 2])
    .clipAngle(90);

var sky = d3.geo.orthographic()
    .scale(300)
    .translate([width / 2, height / 2])
    .clipAngle(90);

var swoosh = d3.svg.line()
    .x(function(d) { return d[0] })
    .y(function(d) { return d[1] })
    .interpolate("cardinal")
    .tension(.0);

// var scale0 = projection.scale();

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// var stars = svg.append("g")
//     .selectAll("g")
//     .data(starList)
//     .enter()
//     .append("path")
//     .attr("class", "star")
//     .attr("d", function(d) {
//         spacePath.pointRadius(d.properties.radius);
//         return spacePath(d);
//     });


// sphere 
svg.append("path")
    .datum({
        type: "Sphere"
    })
    .attr("class", "sphere")
    .attr("d", path);

// space

// var starList = createStars(300);

// var stars = svg.append("g")
//     .selectAll("g")
//     .data(starList)
//     .enter()
//     .append("path")
//     .attr("class", "star")
//     .attr("d", function(d) {
//         spacePath.pointRadius(d.properties.radius);
//         return spacePath(d);
//     });

// var g = svg.append("g"),
//             features;



var places = JSON.parse(document.getElementById("hackyPlaces").value) // places to plot
var source = JSON.parse(document.getElementById("hackySource").value) // source point to plot

var links = []; // connections between source and destination
    arcLines = []; // actual spindles

var sourceCoord = createCoordinate(source["lng"], source["lat"]);

// creates a coordinate "struct"
function createCoordinate(lat, lng) {
    return [lat, lng];
}

// find midpoint of arc
function arc_midpoint(src, dest) {
    var interpolator = d3.geo.interpolate(src, dest);
    return interpolator(0.5);
}

function create_arc(link) {
    var source = link.source;
    var destination = link.destination;

    var midpoint = arc_midpoint(source, destination);
    var result = [ projection(source), sky(midpoint), projection(destination) ];
    return result;
}

d3.json("world-110m.json", function(error, world) {
    if (error) {
        throw error;
    }

    svg.append("path")
        .datum(topojson.feature(world, world.objects.land))
        .attr("class", "land")
        .attr("d", path);

    svg.append("path")
        .datum(topojson.mesh(world, world.objects.countries, function(a, b) {
            return a !== b;
        }))
        .attr("class", "boundary")
        .attr("d", path);

    path.pointRadius(2.6);

    // bigger circle based on how much $$$ lended to each location

    places.forEach(function(d) {
        svg.insert("path", "cities")
            .datum({
                type: "Point",
                coordinates: [d[0], d[1]]
            })
            .attr("class", "cities")
            .attr("fill", "#A556CC")
            //.attr("fill-opacity", 0.8)
            .attr("d", path);
    });

    svg.insert("path", "source")
        .datum({
            type: "Point",
            coordinates: [source['lng'], source['lat']]
        })
        .attr("class", "source")
        .attr("fill", "#CC6A56")
        .attr("d", path);

    // fill list of connections between source and destination
    places.forEach(function(place) {
        var destCoord = createCoordinate(place[0], place[1]);
        if (destCoord !== sourceCoord) {
            links.push({
                source: sourceCoord,
                destination: destCoord
            });
        }
    });

    // fill arcLines with geoJSON features
    links.forEach(function(link) {
        var feat = {"type": "Feature", "geometry": { "type": "LineString", "coordinates": link}};
        arcLines.push(feat);
    });

    // arc stuff
    svg.append("g").attr("class","arcs")
        .selectAll("path").data(arcLines)
        .enter().append("path")
            .attr("class","arc")
            .attr("d",path)

    svg.append("g").attr("class","flyers")
        .selectAll("path").data(links)
        .enter().append("path")
        .attr("class","flyer")
        .attr("d", function(d) { return swoosh(create_arc(d)) })

    spin_the_globe();
   
});

function refresh() {  
  // svg.selectAll(".arc").attr("d", path)
  //   .attr("opacity", function(d) {
  //       return fade_at_edge(d)
  //   })

  svg.selectAll(".flyer")
    .attr("d", function(d) { return swoosh(create_arc(d)) })
    // .attr("opacity", function(d) {
    //   return fade_at_edge(d)
    // }) 
}

function spin_the_globe() {
    d3.timer(function() {
        var dt = Date.now() - time;
        projection.rotate([rotate[0] + velocity[0] * dt, rotate[1] + velocity[1]]);
        svg.selectAll("path.land").attr("d", path);
        svg.selectAll("path.boundary").attr("d", path);
        svg.selectAll("path.cities").attr("d", path);
        svg.selectAll("path.source").attr("d", path);
        svg.selectAll("path.arcs").attr("d", path);
        svg.selectAll("path.flyers").attr("d", path);
        refresh();
    });
}

// function createStars(number) {
//     var data = [];
//     for (var i = 0; i < number; i++) {
//         data.push({
//             geometry: {
//                 type: 'Point',
//                 coordinates: randomLonLat()
//             },
//             type: 'Feature',
//             properties: {
//                 radius: Math.random() * 1.5
//             }
//         });
//     }
//     return data;
// }

// function randomLonLat() {
//     return [Math.random() * 360 - 180, Math.random() * 180 - 90];
// }