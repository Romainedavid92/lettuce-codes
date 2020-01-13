var svgWidth = 960 * 1.4;
var svgHeight = 500 * 1.4;

var margin = {
    top: 100,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

svg.append("text")
    .attr("x", (width / 2))
    .attr("y", (margin.top / 2))
    .attr("text-anchor", "middle")
    .classed("title", true)
    .text("Rule 5 Pitchers");

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "ERA";
var chosenYAxis = "wOBA";

// function used for updating x-scale var upon click on axis label
function xScale(pitcherData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(pitcherData, d => d[chosenXAxis]) * 0.8,
            d3.max(pitcherData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;

}

// function used for updating y-scale upon click on axis label
function yScale(pitcherData, chosenYAxis) {
    // create scales 
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(pitcherData, d => d[chosenYAxis]) * 0.8,
            d3.max(pitcherData, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating yAxis var upon click on axis label 
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)

    .attr("cx", d => newXScale(d[chosenXAxis]));


    return circlesGroup;
}


function renderyCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]))



    return circlesGroup;
}



// function used for updating circles group with new tooltip---- to render the yAxis label There will need to be an and statement 
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "ERA" && chosenYAxis == "wOBA") {
        var label = "ERA:"
        var label2 = "wOBA:"
    } else if (chosenXAxis === "ERA" && chosenYAxis == "BB") {
        var label = "ERA:"
        var label2 = "BB%:"
    } else if (chosenXAxis === "SO" && chosenYAxis == "wOBA") {
        var label = "SO%:"
        var label2 = "wOBA:"
    } else {
        var label = "SO%:"
        var label2 = "BB%"
    };

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.Player_Last},${d.Player_First}<br>${label} ${d[chosenXAxis]}<br>${label2} ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
            toolTip.show(data);
        })
        // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("pitcherData.csv").then(function(pitcherData, err) {
    if (err) throw err;

    // parse data
    pitcherData.forEach(function(data) {
        data.ERA = +data.ERA;
        data.wOBA = +data.wOBA;
        data.Player = +data.Player;
        data.BB = +data.BB;
        data.SO = +data.SO;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(pitcherData, chosenXAxis);

    // Create y scale function
    var yLinearScale = yScale(pitcherData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .attr("transform", `translate(0,0)`)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(pitcherData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .attr("fill", "blue")
        .attr("opacity", ".5");

    // Create group for  2 x- axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var ERALabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "ERA") // value to grab for event listener
        .classed("active", true)
        .text("ERA");

    var SOLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "SO") // value to grab for event listener
        .classed("inactive", true)
        .text("SO%");


    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(0, 0)`);

    // append y axis
    var wOBALabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "2em")
        .attr("value", "wOBA")
        .classed("active", true)
        .text("wOBA");

    // append y axis this will be the second y -axis value
    var BBLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "BB")
        .classed("inactive", true)
        .text("BB%");



    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(pitcherData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "ERA") {
                    SOLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ERALabel
                        .classed("active", true)
                        .classed("inactive", false);
                } else {
                    SOLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ERALabel
                        .classed("active", false)
                        .classed("inactive", true);
                }

            }
        });

    // y axis labels event listener
    ylabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenyAxis with value
                chosenYAxis = value;

                // console.log(chosenYAxis)

                // functions here found above csv import
                // updates  scale for new data
                yLinearScale = yScale(pitcherData, chosenYAxis);

                // updates y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new y values
                circlesGroup = renderyCircles(circlesGroup, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenYAxis === "wOBA") {
                    BBLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    wOBALabel
                        .classed("active", true)
                        .classed("inactive", false);
                } else {
                    BBLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    wOBALabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });
}).catch(function(error) {
    console.log(error);
});