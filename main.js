var margin = { top: 10, right: 100, bottom: 30, left: 70 },
    width = 1200 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("KSEA.csv").then(function(data) {
    console.log(data);
    // List of groups (here I have one group per column)
    var allGroup = ["actual_mean_temp", "actual_min_temp", "actual_max_temp"]

    // Reformat the data: we need an array of arrays of {x, y} tuples
    var dataReady = allGroup.map(function (grpName) { // .map allows to do something for each element of the list
        return {
            name: grpName,
            values: data.map(function (d) {
                return { date: d3.timeParse("%Y-%m-%d")(d.date), value: +d[grpName] };
            })
        };
    });
    // I strongly advise to have a look to dataReady with
    console.log(dataReady)

    // A color scale: one color for each group
    var myColor = d3.scaleOrdinal()
        .domain(allGroup)
        .range(d3.schemeSet2);

    // Add X axis --> it is a date format
    var x = d3.scaleTime()
    .domain(d3.extent(dataReady[0].values, function(d) { return d.date; }))
    .range([0, width]);
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
        .tickFormat(d3.timeFormat("%b")) // Format tick labels as abbreviated month names
        .ticks(d3.timeMonth.every(1)) // Display tick marks every month
    );


    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add the lines
    var line = d3.line()
        .x(function (d) { return x(+d.date) })
        .y(function (d) { return y(+d.value) })
    svg.selectAll("myLines")
        .data(dataReady)
        .enter()
        .append("path")
        .attr("class", function (d) { return d.name })
        .attr("d", function (d) { return line(d.values) })
        .attr("stroke", function (d) { return myColor(d.name) })
        .style("stroke-width", 2)
        .style("fill", "none")

    // Add the points
    // svg
    //     // First we need to enter in a group
    //     .selectAll("myDots")
    //     .data(dataReady)
    //     .enter()
    //     .append('g')
    //     .style("fill", function (d) { return myColor(d.name) })
    //     .attr("class", function (d) { return d.name })
    //     // Second we need to enter in the 'values' part of this group
    //     .selectAll("myPoints")
    //     .data(function (d) { return d.values })
    //     .enter()
    //     .append("circle")
    //     .attr("cx", function (d) { return x(d.date) })
    //     .attr("cy", function (d) { return y(d.value) })
    //     .attr("r", 2)
    //     .attr("stroke", "white")

    // Add a label at the end of each line
    svg
        .selectAll("myLabels")
        .data(dataReady)
        .enter()
        .append('g')
        .append("text")
        .attr("class", function (d) { return d.name })
        .datum(function (d) { return { name: d.name, value: d.values[d.values.length - 1] }; }) // keep only the last value of each time series
        .attr("transform", function (d) { return "translate(" + x(d.value.date) + "," + y(d.value.value) + ")"; }) // Put the text at the position of the last point
        .attr("x", 12) // shift the text a bit more right
        .text(function (d) { return d.name; })
        .style("fill", function (d) { return myColor(d.name) })
        .style("font-size", 15)

    // Add a legend (interactive)
    svg
        .selectAll("myLegend")
        .data(dataReady)
        .enter()
        .append('g')
        .append("text")
        .attr('x', function (d, i) { return 30 + i * 60 })
        .attr('y', 30)
        .text(function (d) { return d.name; })
        .style("fill", function (d) { return myColor(d.name) })
        .style("font-size", 15)
        .on("click", function (d) {
            // is the element currently visible ?
            currentOpacity = d3.selectAll("." + d.name).style("opacity")
            // Change the opacity: from 0 to 1 or from 1 to 0
            d3.selectAll("." + d.name).transition().style("opacity", currentOpacity == 1 ? 0 : 1)

        })
})



