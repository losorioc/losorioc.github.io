<!DOCTYPE html>
<meta charset="utf-8">
<style>
path {
  stroke: white;
  stroke-width: 0.25px;
  fill: lightgrey;
}

.graph {
	font-family: sans-serif;
	font-size: 11px;
}

.nodesankey rect {
  cursor: pointer;
  fill-opacity: .9;
  shape-rendering: crispEdges;
}

.nodesankey text {
  pointer-events: none;
}

.linksankey {
  fill: none;
  stroke: #000;
  stroke-opacity: .6;
}

.linksankey:hover {
  stroke-opacity: .9;
}

div.tooltipsankey {   
  position: absolute;           
  text-align: left;           
  width: 95px;                  
  height: 40px;                 
  padding: 4px;             
  font: 11px sans-serif;        
  background: silver;   
  border: 0px;      
  border-radius: 8px;           
  pointer-events: none;         
}

</style>
<body>


<script src="https://d3js.org/d3.v3.min.js"></script>
<script src="sankey.js"></script>

<div id="chart"></div>
	
<script>

// sankey //

var units = "Stimmen";

var aspect = 0.8;

var margin = {top: 10, right: 40, bottom: 10, left: 40},
    height = 500 - margin.top - margin.bottom,
    width = (height+margin.top+margin.bottom)/aspect - margin.left - margin.right;
	
var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " " + units; },
    color = d3.scale.category20();

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
	.attr("class", "svgchart")
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

var sankey = d3.sankey()
    .nodeWidth(30)
    .nodePadding(17)
    .size([width, height]);

var path = sankey.link();

var div = d3.select("body").append("div")   
    .attr("class", "tooltipsankey")               
    .style("opacity", 0);	

var color = d3.scale.ordinal()
    .domain(["SVP", "FDP", "CVP", "BDP", "GLP", "SP", "Ohne", "SVP.", "FDP.", "CVP.", "BDP.", "GLP.", "SP.", "Leer."])
    .range(["yellowgreen", "darkblue", "orange", "gold", "lawngreen", "firebrick", "grey", "yellowgreen", "darkblue", "orange", "gold", "lawngreen", "firebrick", "grey"]);

var rect
var node
var link
	
d3.csv("sankeygr2015.csv", function(error, data) {
daten = data
  graph = {"nodes" : [], "links" : []};

    data.forEach(function (d) {
      graph.nodes.push({ "name": d.source });
      graph.nodes.push({ "name": d.target });
      graph.links.push({ "source": d.source,
                         "target": d.target,
						 "color": d.color,
                         "value": +d.value });
     });

     graph.nodes = d3.keys(d3.nest()
       .key(function (d) { return d.name; })
       .map(graph.nodes));

     graph.links.forEach(function (d, i) {
       graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
       graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
     });

     graph.nodes.forEach(function (d, i) {
       graph.nodes[i] = { "name": d };
     });

  sankey
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(32);

link = svg.append("g").selectAll(".link")
      .data(graph.links)
    .enter().append("path")
      .attr("class", "linksankey")
      .attr("d", path)
	  .attr("id", function(d) { return "link" + d.source.name; })
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
	  .style("stroke", function(d) { return d.color; });

  link.on("mouseover", function(d) {      
            div.transition()        
                .duration(200)      
                .style("opacity", .9);      
            div .html("<b>" + d.source.name + "</b> ? <b>"  + d.target.name + "</b><br/>" + format(d.value))  
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
            })                  
        .on("mouseout", function(d) {       
            div.transition()        
                .duration(500)      
                .style("opacity", 0);   
        });
				
node = svg.append("g").selectAll(".node")
      .data(graph.nodes)
    .enter().append("g")
      .attr("class", "nodesankey")
      .attr("transform", function(d) { 
		  return "translate(" + d.x + "," + d.y + ")"; });
	
rect = node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { return color(d.name); });

rect.on("mouseover", function(d) {      
            div.transition()        
                .duration(200)      
                .style("opacity", .9);      
            div .html("<b>" + d.name + "</b>:<br/>" + format(d.value))  
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
            })                  
        .on("mouseout", function(d) {       
            div.transition()        
                .duration(500)      
                .style("opacity", 0);   
        });
	  
  node.append("text")
      .attr("x", 40)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .attr("transform", null)
      .text(function(d) { return d.name; })
	  .attr("class", "graph")
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", -40 + sankey.nodeWidth())
      .attr("text-anchor", "end");
  
// Fade-Effect on mouseover
node.on("mouseover", function(d) {
	link.transition()        
        .duration(700)
		.style("opacity", .1);
	link.filter(function(s) { return d.name == s.source.name; }).transition()        
        .duration(700)
		.style("opacity", 1);
	link.filter(function(t) { return d.name == t.target.name; }).transition()        
        .duration(700)
		.style("opacity", 1);
	})
	.on("mouseout", function(d) { svg.selectAll(".linksankey").transition()        
        .duration(700)
		.style("opacity", 1)} ); 
 	  	  
});

		
</script>
</body>
</html>
