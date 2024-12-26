document.addEventListener('DOMContentLoaded', function() {
    const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

    // Fetch the data
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const dataset = data;

            // Set up chart dimensions and margins
            const margin = { top: 60, right: 30, bottom: 60, left: 60 };
            const width = 900 - margin.left - margin.right;
            const height = 500 - margin.top - margin.bottom;

            // Create SVG container
            const svg = d3.select('#chart')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            // Parse the time format
            const parseTime = d3.timeParse('%M:%S');

            // Set up scales
            const xScale = d3.scaleLinear()
                .domain([d3.min(dataset, d => d.Year - 1), d3.max(dataset, d => d.Year + 1)])
                .range([0, width]);

            const yScale = d3.scaleTime()
                .domain(d3.extent(dataset, d => parseTime(d.Time)))
                .range([0, height]);

            // Create axes
            const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
            const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));

            svg.append('g')
                .attr('id', 'x-axis')
                .attr('transform', `translate(0,${height})`)
                .call(xAxis)
                .selectAll("text")
                .style("fill", "#00ffcc")
                .style("font-family", "Orbitron, sans-serif");

            svg.append('g')
                .attr('id', 'y-axis')
                .call(yAxis)
                .selectAll("text")
                .style("fill", "#00ffcc")
                .style("font-family", "Orbitron, sans-serif");

            // Create dots
            const dots = svg.selectAll('.dot')
                .data(dataset)
                .enter()
                .append('circle')
                .attr('class', 'dot')
                .attr('data-xvalue', d => d.Year)
                .attr('data-yvalue', d => parseTime(d.Time))
                .attr('cx', d => xScale(d.Year))
                .attr('cy', d => yScale(parseTime(d.Time)))
                .attr('r', 6)
                .attr('fill', d => d.Doping ? '#ff0066' : '#00ffcc')
                .on('mouseover', function(event, d) {
                    const tooltip = d3.select('#tooltip');
                    tooltip.transition().duration(200).style('opacity', 0.9);
                    tooltip.html(`
                        <strong>${d.Name}</strong><br>
                        Year: ${d.Year}<br>
                        Time: ${d.Time}<br>
                        ${d.Doping ? d.Doping : 'No Doping Allegations'}
                    `)
                    .attr('data-year', d.Year)
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY - 28}px`);
                })
                .on('mouseout', function() {
                    d3.select('#tooltip').transition().duration(500).style('opacity', 0);
                });

            // Zoom functionality
            const zoom = d3.zoom()
                .scaleExtent([1, 5])
                .on('zoom', (event) => {
                    svg.attr('transform', event.transform);
                });

            svg.call(zoom);

            // Filter functionality
            d3.select('#filter').on('change', function() {
                const filterValue = this.value;
                const filteredData = dataset.filter(d => {
                    if (filterValue === 'doping') return d.Doping;
                    if (filterValue === 'no-doping') return !d.Doping;
                    return true; // Show all data
                });

                dots.data(filteredData)
                    .transition()
                    .duration(500)
                    .attr('cx', d => xScale(d.Year))
                    .attr('cy', d => yScale(parseTime(d.Time)));
            });

            // Zoom buttons
            d3.select('#zoom-in').on('click', () => {
                svg.transition().call(zoom.scaleBy, 2);
            });

            d3.select('#zoom-out').on('click', () => {
                svg.transition().call(zoom.scaleBy, 0.5);
            });
        });
});