var w = $(window).width();
var h = $(window).height();

var maptype = "random";

var x, y, xmin, xmax, ymin, ymax,
	axes,
	leader,
	r = 20,
	s = 2*r/150,
	sidebar = 100;

var padding = 7;

var fadetime = 1000;

setbuffer();


var format = d3.time.format("%m/%d/%y");
var formatDate = function(d) {
	return format.parse( d.date );
}




//								SCALES




var x = d3.time.scale()
        .domain(d3.extent(projects, function(d) { return format.parse(d.date); }))
        .nice(d3.time.year)
        .range([xmin, xmax]);

var y = d3.scale.linear()
		.domain(d3.extent(projects, function(d) { return d.hours; }))
		.range([ymax, ymin])
		.nice();

var ux = function(x){
	return (x)/s-75;
}
var uy = function(y){
	return (y)/s-75;
}



//								DOM



var projectmap = d3.select("body")
		.append("svg")
			.attr("class", "projects")
			.attr("width", "100%")
			.attr("height", "100%");
			

projects.forEach(function(d, i) {
  d.x = x(formatDate(d));
  d.y = y(d.hours);
  d.x0 = x(formatDate(d));
  d.y0 = y(d.hours);
  d.r = r;
});




var force = d3.layout.force()
		.nodes(projects)
		.on("tick", tick)
		.gravity(0)
		.friction(0.9)
		.start();



//			add leader lines


drawleaders(maptype);



//			add nodes

var node = projectmap.append("g")
			.attr("class", "nodes")
			.selectAll(".node")
		.data(projects)
	.enter().append("g")
    	.attr("class", "node")
    	.call(force.drag);
    
node.append("circle")
			.attr("class", "orbcircle")
			.attr("r", r)
			;
node.append("clipPath")
			.attr("id", function(d) { return d.name; })
		.append("circle")
			.attr("class", "orbclip")
			.attr("r", r)
			;
			
node.append("g")
			.attr("class", "clip_group")
			.attr("clip-rule", "nonzero")
			.attr("id", function(d) { return d.name + "_to_clip"; })
			.attr("clip-path", function(d) { return "url(#" + d.name + ")"; })
		.append("image")
			.attr("x", function(d) { return ux(0); } )
			.attr("y", function(d) { return uy(0); } )
			.attr("width", 150)
			.attr("height", 150)
			.attr("transform", "scale(" + s + ")")
			.attr("xlink:href", function(d) {
					return "icons/" + d.img + ".png"; 
				})
			;
			
			

			// git! hi!
			
			
arrange(maptype);
		
		
/* -------------------------------------- FUNCTIONS -------------------------------------------- */		




function arrange(method) {
	console.log("arranging by " + maptype);
	
	if (method == "random") {
		scramble();
	}
	
	else if (method == "date") {
		applydates();
	}
}








function drawleaders(kind) {
	if (kind == "random") {
		if ( $("g.leaders").length != 0 ) {
			$("g.leaders").fadeOut(fadetime, function() {
				d3.select("g.leaders").remove();
			});
		}		
	}
	
	else if (kind == "date") {
		if ( $("g.leaders").length == 0 ) {
			leader = projectmap.insert("g", ":first-child")
					.attr("class", "leaders")
					.attr("display", "none")
					.selectAll("line")
				.data(projects)
			.enter().append("line")
					.attr("z-index", -5)
					.attr("class", "leader")
					.attr("x1", 0)
					.attr("y1", 0)
					.attr("x2", function(d) { return d.x ; } )
					.attr("y2", h-buffer )
					.call(force.drag);
			}
			
			$("g.leaders").fadeIn(fadetime);
	}
}













function tick(e) {
    node.each(gravity(e.alpha * 0.7))
        .each(collide(0.5))
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        ;
    
    if ( $("g.leaders").length != 0 ) {
	    leader
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		.attr("x2", function(d) { return x(formatDate(d)) - d.x; } )
		.attr("y2", function(d) { return (h-buffer) - d.y; } )
		;
    }
    
	    
	node.selectAll("circle")
			.attr("r", r)
			.attr("stroke-width", r/4)
			;

  }

function gravity(k) {
    return function(d) {
      d.x += (d.x0 - d.x) * k;
      d.y += (d.y0 - d.y) * k;
    };
  }
  
function collide(k) {
    var q = d3.geom.quadtree(projects);
    return function(node) {
      var nr = node.r + padding,
          nx1 = node.x - nr,
          nx2 = node.x + nr,
          ny1 = node.y - nr,
          ny2 = node.y + nr;
      q.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
          var x = node.x - quad.point.x,
              y = node.y - quad.point.y,
              l = x * x + y * y,
              r = nr + quad.point.r;
          if (l < r * r) {
            l = ((l = Math.sqrt(l)) - r) / l * k;
            node.x -= x *= l;
            node.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  }






function logprojects() {
	console.log(projects);
}


//								WIGGLE!

function wiggle() {
	projects.forEach(function(d, i) {
		d.x += Math.random()*10-5;
		d.y += Math.random()*10-5;
		d.r = r;
	});
	force.resume();
}




//								RANDOM:

function scramble() {
	
	setbuffer();
	
	drawleaders("random");
	
	if ( $("g.axes").length != 0 ) {
		$("g.axes").fadeOut(fadetime, function() {
			axes.remove();
		});
	}
	
	projects.forEach(function(d, i) {
		d.x0 = Math.random()*(xmax-xmin) + xmin+1;
		d.y0 = Math.random()*(ymax-ymin) + ymin+1;
		d.r = r;
	})

	force.resume();
}


//								DATE:

function applydates() {

	setbuffer();
	
	x = d3.time.scale()
        .domain(d3.extent(projects, function(d) { return format.parse(d.date); }))
        .nice(d3.time.year)
        .range([xmin, xmax]);

    y = d3.scale.linear()
		.domain(d3.extent(projects, function(d) { return d.hours; }))
		.range([ymax, ymin])
		.nice();
	
	
	projects.forEach(function(d, i) {
		d.x0 = x(formatDate(d));
		d.y0 = y(d.hours);
		d.r = r;
	})
	
	
	drawleaders("date");
	
	force.resume();
	
	var mintick = d3.min(projects, function(d) { return d.hours; });
	var midtick = d3.max(projects, function(d) { return d.hours; })/2;
	var maxtick = d3.max(projects, function(d) { return d.hours; });
	    
	xAxis = d3.svg.axis().scale(x).orient("bottom");
	yAxis = d3.svg.axis().scale(y).orient("left").tickValues([mintick,midtick,maxtick]).tickFormat(function(d, i){
	    if (i==0) return "a few";
	    else return Math.round(d/10)*10;
	});
	
	if ( $("g.axes").length == 0 ) {
		axes = d3.select("svg.projects")
		.append("svg:g")
			.attr("class", "axes")
			.attr("display", "none")
			;
	}
	
	if ( $("g.x-axis").length == 0 ) {
		axes.append("svg:g")
				.attr("class", "x-axis")
				.attr("transform", "translate(0," + (h-buffer) + ")")
				.call(xAxis)
				;
		axes.append("text")
	     .attr("class", "x-label")
	     .attr("text-anchor", "middle")
	     .attr("transform", "translate(" + (w/2) + "," + (h - buffer/3) + ")")
	     .text("when it got finished");
	}

	if ( $("g.y-axis").length == 0 ) {
		axes.append("svg:g")
				.attr("class", "y-axis")
				.attr("transform", "translate(" + (buffer-2*r) + ",0)")
				.call(yAxis)			
			;
		axes.append("text")
	     .attr("class", "y-label")
	     .attr("text-anchor", "middle")
	     .attr("transform", "translate(" + (20) + "," + (h/2) + "), rotate(-90)")
	     .text("hours i spent working on it");
	}
	
	$("g.axes").fadeIn(fadetime);

	
	d3.select("svg.projects g.x-axis")
		.transition()
			.duration(1000)
				.attr("transform", "translate(0," + (h-buffer) + ")")
				.call(xAxis)
				;
	
	d3.select("svg.projects g.y-axis")
		.transition()
			.duration(1000)
				.attr("transform", "translate(" + (buffer-2*r) + ",0)")
				.call(yAxis)			
				;
	
	d3.select("text.x-label")
		.transition()
			.duration(1000)
				.attr("transform", "translate(" + (w/2) + "," + (h - buffer/3) + ")")
				;
	d3.select("text.y-label")
		.transition()
			.duration(1000)
				.attr("transform", "translate(" + (20) + "," + (h/2) + "), rotate(-90)")
				;
}








function setbuffer() {
	w = $(window).width();
	h = $(window).height();
	
	if (w >= h) {
		buffer = h/5;
		r = Math.round(buffer/10);
	}
	else {
		buffer = w/5;
		r = Math.round(buffer/10);
	}
	
	xmin = buffer;
	xmax = (w-buffer-sidebar);
	ymax = h-buffer*1.5;
	ymin = buffer;
}




