Polymer({
    is: 'bullet-chart',
    properties: {
        title: '',
        inputs: {
            notify: true,
            type: Array,
            value: [{
                input: 'slice',
                txt: 'Pick a dimension',
                selectedValue: 0,
                selectedName: 'label',
                uitype: 'single-value'
            }, {
                input: 'sliceSize',
                txt: 'Pick a messure',
                selectedValue: 1,
                selectedName: 'count',
                uitype: 'single-value'
            }]
        },
        settings: {
            notify: true,
            type: Array,
            value: [{
                input: 'displayTxt',
                txt: 'Placement of lables',
                uitype: 'dropDown',
                selectedValue: Array,
                selectedName: Array,
                options: [{
                    key: 'None',
                    value: 0
                }, {
                    key: 'inside',
                    value: 1
                }, {
                    key: 'outside',
                    value: 2
                }]
            }, {
                input: 'innerRadius',
                txt: 'Inner radius',
                uitype: 'Number',
                selectedValue: 0
            }, {
                input: 'height',
                txt: 'Height of the chart',
                uitype: 'Number',
                selectedValue: 300,
                notify: true,
                observer: '_heightChanged'
            }, {
                input: 'width',
                txt: 'Width of the chart',
                uitype: 'Number',
                selectedValue: 300,
                notify: true,
                observer: '_widthChanged'
            }]
        },
        hideSettings: true,
        data: String,
        external: Array
    },
    _getHeight() {
        return this.settings[2].selectedValue;
    },
    _getWidth() {
        return this.settings[3].selectedValue;
    },
    _heightChanged: function() {
        this.svg.attr('height', height);
    },
    _widthChanged: function() {
        this.svg.attr('width', width);
    },

    _toggleView: function() {
        this.hideSettings = !this.hideSettings;
        this.draw();
    },
    attacheBullet: function() {
        d3.bullet = function() {
            var orient = 'left';;
            var reverse = false;
            var duration = 0;
            var ranges = bulletRanges;
            var markers = bulletMarkers;
            var measures = bulletMeasures;
            var width = 380;
            var height = 30;
            var tickFormat = null;

            // For each small multiple…
            function bullet(g) {
                g.each(function(d, i) {
                    var rangez = ranges.call(this, d, i).slice().sort(d3.descending);
                    var markerz = markers.call(this, d, i).slice().sort(d3.descending);
                    var measurez = measures.call(this, d, i).slice().sort(d3.descending);
                    g = d3.select(this);

                    // Compute the new x-scale.
                    var x1 = d3.scale.linear()
                        .domain([0, Math.max(rangez[0], markerz[0], measurez[0])])
                        .range(reverse ? [width, 0] : [0, width]);

                    // Retrieve the old x-scale, if this is an update.
                    var x0 = this.__chart__ || d3.scale.linear()
                        .domain([0, Infinity])
                        .range(x1.range());

                    // Stash the new scale.
                    this.__chart__ = x1;

                    // Derive width-scales from the x-scales.
                    var w0 = bulletWidth(x0);
                    var w1 = bulletWidth(x1);

                    // Update the range rects.
                    var range = g.selectAll("rect.range")
                        .data(rangez);

                    range.enter().append("rect")
                        .attr("class", function(d, i) {
                            return "range s" + i;
                        })
                        .attr("width", w0)
                        .attr("height", height)
                        .attr("x", reverse ? x0 : 0)
                        .transition()
                        .duration(duration)
                        .attr("width", w1)
                        .attr("x", reverse ? x1 : 0);

                    range.transition()
                        .duration(duration)
                        .attr("x", reverse ? x1 : 0)
                        .attr("width", w1)
                        .attr("height", height);

                    // Update the measure rects.
                    var measure = g.selectAll("rect.measure")
                        .data(measurez);

                    measure.enter().append("rect")
                        .attr("class", function(d, i) {
                            return "measure s" + i;
                        })
                        .attr("width", w0)
                        .attr("height", height / 3)
                        .attr("x", reverse ? x0 : 0)
                        .attr("y", height / 3)
                        .transition()
                        .duration(duration)
                        .attr("width", w1)
                        .attr("x", reverse ? x1 : 0);

                    measure.transition()
                        .duration(duration)
                        .attr("width", w1)
                        .attr("height", height / 3)
                        .attr("x", reverse ? x1 : 0)
                        .attr("y", height / 3);

                    // Update the marker lines.
                    var marker = g.selectAll("line.marker")
                        .data(markerz);

                    marker.enter().append("line")
                        .attr("class", "marker")
                        .attr("x1", x0)
                        .attr("x2", x0)
                        .attr("y1", height / 6)
                        .attr("y2", height * 5 / 6)
                        .transition()
                        .duration(duration)
                        .attr("x1", x1)
                        .attr("x2", x1);

                    marker.transition()
                        .duration(duration)
                        .attr("x1", x1)
                        .attr("x2", x1)
                        .attr("y1", height / 6)
                        .attr("y2", height * 5 / 6);

                    // Compute the tick format.
                    var format = tickFormat || x1.tickFormat(8);

                    // Update the tick groups.
                    var tick = g.selectAll("g.tick")
                        .data(x1.ticks(8), function(d) {
                            return this.textContent || format(d);
                        });

                    // Initialize the ticks with the old scale, x0.
                    var tickEnter = tick.enter().append("g")
                        .attr("class", "tick")
                        .attr("transform", bulletTranslate(x0))
                        .style("opacity", 1e-6);

                    tickEnter.append("line")
                        .attr("y1", height)
                        .attr("y2", height * 7 / 6);

                    tickEnter.append("text")
                        .attr("text-anchor", "middle")
                        .attr("dy", "1em")
                        .attr("y", height * 7 / 6)
                        .text(format);

                    // Transition the entering ticks to the new scale, x1.
                    tickEnter.transition()
                        .duration(duration)
                        .attr("transform", bulletTranslate(x1))
                        .style("opacity", 1);

                    // Transition the updating ticks to the new scale, x1.
                    var tickUpdate = tick.transition()
                        .duration(duration)
                        .attr("transform", bulletTranslate(x1))
                        .style("opacity", 1);

                    tickUpdate.select("line")
                        .attr("y1", height)
                        .attr("y2", height * 7 / 6);

                    tickUpdate.select("text")
                        .attr("y", height * 7 / 6);

                    // Transition the exiting ticks to the new scale, x1.
                    tick.exit().transition()
                        .duration(duration)
                        .attr("transform", bulletTranslate(x1))
                        .style("opacity", 1e-6)
                        .remove();
                });
                d3.timer.flush();
            }

            // left, right, top, bottom
            bullet.orient = function(x) {
                if (!arguments.length) {
                    return orient;
                }
                orient = x;
                reverse = orient == "right" || orient == "bottom";
                return bullet;
            };

            // ranges (bad, satisfactory, good)
            bullet.ranges = function(x) {
                if (!arguments.length) {
                    return ranges;
                }
                ranges = x;
                return bullet;
            };

            // markers (previous, goal)
            bullet.markers = function(x) {
                if (!arguments.length) {
                    return markers;
                }
                markers = x;
                return bullet;
            };

            // measures (actual, forecast)
            bullet.measures = function(x) {
                if (!arguments.length) {
                    return measures;
                }
                measures = x;
                return bullet;
            };

            bullet.width = function(x) {
                if (!arguments.length) {
                    return width;
                }
                width = x;
                return bullet;
            };

            bullet.height = function(x) {
                if (!arguments.length) {
                    return height;
                }
                height = x;
                return bullet;
            };

            bullet.tickFormat = function(x) {
                if (!arguments.length) {
                    return tickFormat;
                }
                tickFormat = x;
                return bullet;
            };

            bullet.duration = function(x) {
                if (!arguments.length) {
                    return duration;
                }
                duration = x;
                return bullet;
            };

            return bullet;
        };

        function bulletRanges(d) {
            return d.ranges;
        }

        function bulletMarkers(d) {
            return d.markers;
        }

        function bulletMeasures(d) {
            return d.measures;
        }

        function bulletTranslate(x) {
            return function(d) {
                return "translate(" + x(d) + ",0)";
            };
        }

        function bulletWidth(x) {
            var x0 = x(0);
            return function(d) {
                return Math.abs(x(d) - x0);
            };
        }
    },
    attached: function() {
        this.attacheBullet();
        this.draw();
    },

    draw: function() {
        var margin = {
                top: 5,
                right: 40,
                bottom: 20,
                left: 120
            },
            width = 960 - margin.left - margin.right,
            height = 50 - margin.top - margin.bottom;

        var chart = d3.bullet()
            .width(width)
            .height(height);

        d3.json("bullets.json", function(error, data) {
            if (error) throw error;

            var svg = d3.select("body").selectAll("svg")
                .data(data)
                .enter().append("svg")
                .attr("class", "bullet")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .call(chart);

            var title = svg.append("g")
                .style("text-anchor", "end")
                .attr("transform", "translate(-6," + height / 2 + ")");

            title.append("text")
                .attr("class", "title")
                .text(function(d) {
                    return d.title;
                });

            title.append("text")
                .attr("class", "subtitle")
                .attr("dy", "1em")
                .text(function(d) {
                    return d.subtitle;
                });
        });
    }
});