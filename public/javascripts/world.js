var width = window.innerWidth;
var height = window.innerHeight - 140;
var time = Date.now();
var rotate = [0, 0];
var velocity = [.015, -0];

var projection = d3.geo.orthographic()
    .scale(250)
    .translate([width / 2, height / 2])
    .clipAngle(90);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var canvas = d3.select("body").selectAll("canvas")
    .data(d3.range(1))
    .enter().append("canvas")
    .attr("width", width)
    .attr("height", height);

// sphere 
svg.append("path")
    .datum({
        type: "Sphere"
    })
    .attr("class", "sphere")
    .attr("d", path);

// space

// var space = d3.geo.azimuthal()
//     .mode("equidistant")
//     .translate([width / 2, height / 2]);

// space.scale(space.scale() * 3);

// var spacePath = d3.geo.path()
//     .projection(space)
//     .pointRadius(1);

var starList = createStars(300);

var stars = svg.append("g")
    .selectAll("g")
    .data(starList)
    .enter()
    .append("path")
    .attr("class", "star")
    .attr("d", function(d) {
        spacePath.pointRadius(d.properties.radius);
        return spacePath(d);
    });

///////

var places = JSON.parse(document.getElementById("hackyPlaces").value) // places to plot
var source = JSON.parse(document.getElementById("hackySource").value) //source point to plot

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

    //bigger circle based on how much $$$ lended to each location

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

    // spin_the_globe();
});

function spin_the_globe() {
    d3.timer(function() {
        var dt = Date.now() - time;
        projection.rotate([rotate[0] + velocity[0] * dt, rotate[1] + velocity[1]]);
        svg.selectAll("path.land").attr("d", path);
        svg.selectAll("path.boundary").attr("d", path);
        svg.selectAll("path.cities").attr("d", path);
        svg.selectAll("path.source").attr("d", path);
    });
}

function createStars(number) {
    var data = [];
    for (var i = 0; i < number; i++) {
        data.push({
            geometry: {
                type: 'Point',
                coordinates: randomLonLat()
            },
            type: 'Feature',
            properties: {
                radius: Math.random() * 1.5
            }
        });
    }
    return data;
}

function randomLonLat() {
    return [Math.random() * 360 - 180, Math.random() * 180 - 90];
}