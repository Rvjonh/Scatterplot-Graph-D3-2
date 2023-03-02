/* Here it's our code to develop the application */
window.addEventListener("DOMContentLoaded", main)

const URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

function main() {
    /* Fetch the data and execute drawBarChar */
    fetch(URL).then(r => r.json())
        .then((r) => {
            drawBarChar(r)
        })
}

function drawBarChar(dataset) {
    /* Variables of size */
    const c = document.getElementById("graph")
    let W = c.clientWidth;
    let H = 500;
    //let barWidth = W / 275;
    let P = 50;
    const dopingColor = "rgb(153, 0, 0)"
    const noDopingColor = "rgb(102, 204, 255)"

    /* Main svg container */
    const svg = d3.select("#graph").append("svg").attr("width", W).attr("height", H)

    /* Legend information */
    const dataDescription = [
        { "text": "Riders with doping allegations", "color": dopingColor },
        { "text": "No doping allegations", "color": noDopingColor },
    ]
    var legendContainer = svg.append('g').attr('id', 'legend');

    var legend = legendContainer
        .selectAll('#legend')
        .data(dataDescription)
        .enter()
        .append('g')
        .attr('class', 'legend-label')
        .attr('transform', function (d, i) {
            return 'translate(' + (-P) + ',' + (H / 2 - i * 20) + ')';
        });

    legend
        .append('rect')
        .attr('x', W - 18)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', (d) => {
            return d.color;
        });

    legend
        .append('text')
        .attr('x', W - 24)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('text-anchor', 'end')
        .text(d => d.text);

    /* ToolTip */
    const tooltip = d3.select("#graph")
        .append("div")
        .attr('id', 'tooltip')
        .attr("class", "car-tooltip")
        .style('height', 'auto')
        .style('max-width', '10em')
        .style('padding', '0.5em')
        .style('position', 'absolute')
        .style('opacity', 0)
        .style('font-size', '18px')

    /* Dataset definition */
    const years = dataset.map(item => {
        return item["Year"];
    })

    const times = dataset.map(d => {
        var parsedTime = d.Time.split(':');
        new_Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
        return new_Time;
    })

    /* X Axis */
    const minYear = d3.min(years)
    const maxYear = d3.max(years)

    const xScale = d3.scaleLinear()
        .domain([minYear - 1, maxYear + 1])
        .range([P, W - P]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));

    svg.append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', 'translate(0,' + (H - P) + ')');

    /* Y Axis */
    let yAxisScale = d3.scaleLinear()
        .domain(
            d3.extent(times, function (d) {
                return d;
            })
        )
        .range([0, H - P])

    let timeFormat = d3.timeFormat('%M:%S');
    let yAxis = d3.axisLeft(yAxisScale).tickFormat(timeFormat);

    svg.append('g')
        .attr('class', 'y axis')
        .attr('id', 'y-axis')
        .attr('transform', 'translate(' + P + ', 0)')
        .call(yAxis);

    svg.append("text")
        .attr('class', 'label')
        .attr('transform', 'rotate(-90)')
        .style('font-size', '1.5em')
        .text('Best Time (minutes)');

    /* Data Displayer */

    svg.selectAll('.dot')
        .data(dataset)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('r', 6)
        .attr('cx', function (d, i) {
            return xScale(d.Year);
        })
        .attr('cy', function (d, i) {
            return yAxisScale(times[i]);
        })
        .attr("data-xvalue", (d) => {
            return d.Year;
        })
        .attr("data-yvalue", (d, i) => {
            return times[i].toISOString();
        })
        .attr("fill", function (d, i) {
            if (d.Doping != "") {
                return dopingColor
            }
            return noDopingColor
        })
        .attr("index", (d, i) => {
            return i;
        })
        .on('mouseover', function (e, d) {
            let i = this.getAttribute('index');

            const desc = []
            desc.push()

            const h = i / dataset.length
            e.target.style.opacity = "0.5";
            e.target.style.cursor = "pointer";

            tooltip.style("opacity", "1")
                .style("display", "block")
                .attr("data-year", d.Year)
                .style("top", (e.clientY - 85) + "px")
                .style("left", d => {
                    new_x = e.clientX;
                    if (new_x > W / 2) {
                        new_x -= 140
                    }
                    return new_x + "px"
                })
                .html(`
                    <div>
                        <p style="text-align:center;">${d.Name}</p>
                        <p>From: ${d.Nationality}</p>
                        <p>Year: ${d.Year}</p>
                        <p style="text-align:center;">${d.Doping}</p>
                    </div>
                `)
        })
        .on('mouseout', function (e, d) {
            e.target.style.opacity = "1";
            e.target.style.cursor = "None";
            tooltip.style("opacity", "0").style("display", "None")
        })
}