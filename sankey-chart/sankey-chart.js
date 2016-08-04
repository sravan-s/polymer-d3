Polymer({
    is: 'difference-chart',
    properties: {
        title: '',
        inputs: {
            notify: true,
            type: Array,
            value: [{
                input: 'x',
                txt: 'Pick Source',
                selectedValue: 0,
                uitype: 'single-value',
                notify: true,
            }, {
                input: 'y',
                txt: 'Pick Destination',
                selectedValue: 1,
                uitype: 'single-value',
                notify: true
            }, {
                input: 'z',
                txt: 'Pick count',
                selectedValue: 0,
                uitype: 'single-value',
                notify: true
            }]
        },
        settings: {
            notify: true,
            type: Array,
            value: []
        },
        source: {
          type: Array,
          value: [],
          notify: true
        },
        dataMutated: false;
        hideSettings: true,
        data: String,
        external: Array
    },
    behaviors: [
        PolymerD3.chartBehavior,
        PolymerD3.colorPickerBehavior
    ],

    _toggleView: function() {
        this.hideSettings = !this.hideSettings;
        this.chart = this.draw();
    },

    _createNodesAndLinks(){
        if(!this.dataMutated){
            var sourceIndex = this.getInputPropertis('x');
            var destinationIndex = this.getInputPropertis('y');
            var countIndex = this.getInputPropertis('z');
            this.graph = {"nodes" : [], "links" : []};

            this.source.forEach(function (d) {
              this.graph.nodes.push({ "name": d[sourceIndex] });
              this.graph.nodes.push({ "name": d[destinationIndex] });
              this.graph.links.push({ "source": d[sourceIndex],
                                 "target": d[destinationIndex],
                                 "value": d[countIndex] });
             });
         // return only the distinct / unique nodes
             graph.nodes = d3.keys(d3.nest()
               .key(function (d) { return d.name; })
               .map(graph.nodes));

             // loop through each link replacing the text with its index from node
             graph.links.forEach(function (d, i) {
               graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
               graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
             });

             //now loop through each nodes to make nodes an array of objects
             // rather than an array of strings
             graph.nodes.forEach(function (d, i) {
               graph.nodes[i] = { "name": d };
             });
         }
    },
    draw: function () {
        var margin = this.getMargins();
        var width = this.getWidth() - margin.left - margin.right;
        var height = this.getHeight() - margin.top - margin.bottom;
        var svg = this.svg;

        var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(40)
    .size([width, height]);

    var path = sankey.link();

        sankey
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(32);

// add in the links
  var link = svg.append("g").selectAll(".link")
      .data(graph.links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; });

// add the link titles
  link.append("title")
        .text(function(d) {
            return d.source.name + " → " + 
                d.target.name + "\n" + format(d.value); });

// add in the nodes
  var node = svg.append("g").selectAll(".node")
      .data(graph.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { 
          return "translate(" + d.x + "," + d.y + ")"; })
    .call(d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", function() { 
          this.parentNode.appendChild(this); })
      .on("drag", dragmove));

// add the rectangles for the nodes
  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { 
          return d.color = color(d.name.replace(/ .*/, "")); })
      .style("stroke", function(d) { 
          return d3.rgb(d.color).darker(2); })
    .append("title")
      .text(function(d) { 
          return d.name + "\n" + format(d.value); });

// add in the title for the nodes
  node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");

// the function for moving the nodes
  function dragmove(d) {
    d3.select(this).attr("transform", 
        "translate(" + d.x + "," + (
                d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
            ) + ")");
    sankey.relayout();
    link.attr("d", path);
  }

    }
)};