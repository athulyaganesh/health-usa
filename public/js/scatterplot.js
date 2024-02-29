class Scatterplot {
    constructor(config, attrX, attrY, countiesData) {
      this.settings = {
        targetElement: config.targetElement,
        width: config.width || 450,
        height: config.height || 200,
        margins: { top: 20, bottom: 65, right: 30, left: 65 }
      };
      this.attrX = attrX;
      this.attrY = attrY;
      this.countiesData = countiesData; // Assigning countiesData to a class property

  
      this.initializeChart();
    }
  
    initializeChart() {
        let chart = this;
    
        // Ensure that the parent element exists in the DOM
        let parentElement = document.querySelector(chart.settings.targetElement);
        if (!parentElement) {
            console.error("Parent element not found in the DOM:", chart.settings.targetElement);
            return;
        }
    
        // SVG setup
        chart.svg = d3
            .select(parentElement)
            .append('svg')
            .attr(
                'width',
                chart.settings.width + chart.settings.margins.left + chart.settings.margins.right
            )
            .attr(
                'height',
                chart.settings.height + chart.settings.margins.top + chart.settings.margins.bottom
            )
            .append('g')
            .attr(
                'transform',
                `translate(${chart.settings.margins.left},${chart.settings.margins.top})`
            );
    
        // Scale setup
        chart.xScale = d3.scaleLinear().range([0, chart.settings.width]);
        chart.xAxis = chart.svg.append('g').attr('transform', `translate(0,${chart.settings.height})`);
    
        chart.yScale = d3.scaleLinear().range([chart.settings.height, 0]);
        chart.yAxis = chart.svg.append('g');
    
        // Brushing feature
        chart.brushGroup = chart.svg.append('g').attr('class', 'brush-area');
    
        chart.brush = d3.brush()
            .extent([
                [0, 0],
                [chart.settings.width, chart.settings.height],
            ])
            .on('start', () => (selectedCounties = []))
            .on('end', (event) => chart.applyBrushing(event));
    
        this.refreshChart();
    }
    
    refreshChart() {
        const vis = this;
    
        // Filter data
        vis.data = vis.countiesData.filter((d) => d[vis.attrX] != -1 && d[vis.attrY] != -1);
    
        // Define x scale
        vis.x = d3.scaleLinear().range([0, vis.settings.width]); // Use vis.settings.width
        vis.x.domain([0, d3.max(vis.data, (d) => d[vis.attrY])]);
    
        // Define y scale
        vis.y = d3.scaleLinear().range([vis.settings.height, 0]); // Use vis.settings.height
        vis.y.domain([0, d3.max(vis.data, (d) => d[vis.attrX])]);
    
        // Update axes
        vis.xAxis.call(d3.axisBottom(vis.x));
        vis.yAxis.call(d3.axisLeft(vis.y));
    
        // X axis label
        vis.svg
            .selectAll("text.xLabel")
            .data([vis.attrX])
            .join("text")
            .attr("class", "xLabel")
            .attr(
                "transform",
                "translate(" +
                vis.settings.width / 2 + // Use vis.settings.width
                " ," +
                (vis.settings.height + 35) + // Use vis.settings.height
                ")"
            )
            .style("text-anchor", "middle")
            .text(attributeOptionsData[vis.attrY].label);
    
        // Y axis label
        vis.svg
            .selectAll("text.yLabel")
            .data([vis.attrX])
            .join("text")
            .attr("class", "yLabel")
            .attr("transform", "rotate(-90)")
            .attr(
                "y",
                0 -
                vis.settings.margins.left + // Use vis.settings.margin.left
                (vis.attrX === "median_household_income" ? 0 : 15)
            )
            .attr("x", 0 - vis.settings.height / 2) // Use vis.settings.height
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(attributeOptionsData[vis.attrX].label);
    
        // Plot data points
        vis.svg
            .selectAll("circle.regularPoint")
            .data(vis.data)
            .join("circle")
            .attr("class", "regularPoint")
            .attr("cx", (d) => vis.x(d[vis.attrY]))
            .attr("cy", (d) => vis.y(d[vis.attrX]))
            .attr("r", 2)
            .style("fill", `color-mix(in srgb, ${attributeOptionsData[vis.attrX].color}, ${attributeOptionsData[vis.attrY].color})`)
            .style("fill-opacity", (d) => {
                if (filteredCounties.length !== 0) {
                    if (
                        filteredCounties.find(
                            (filteredCounty) => filteredCounty == d.cnty_fips
                        )
                    )
                        return 1;
                    else return 0.1;
                } else return 1;
            });
    
        // Mouse event handlers
        d3.selectAll("circle.regularPoint")
            .on("mouseover", function (event, d) {
                d3.select(this).attr("stroke-width", "2").attr("stroke", "white");
                tooltip.style("visibility", "visible").html(`
                    <div class="tooltip-title">${d.display_name}</div>
                    <div><b>${attributeOptionsData[vis.attrX].label}</b>: ${d[vis.attrX]}</div>
                    <div><b>${attributeOptionsData[vis.attrY].label}</b>: ${d[vis.attrY]}</div>
                `);
            })
            .on("mousemove", function (event) {
                tooltip
                    .style("top", event.pageY - 10 + "px")
                    .style("left", event.pageX + 10 + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("stroke-width", "0");
                tooltip.style("visibility", "hidden");
            })
            .on("mousedown", function (event) {
                vis.svg
                    .select(".overlay")
                    .node()
                    .dispatchEvent(
                        new MouseEvent("mousedown", {
                            bubbles: true,
                            clientX: event.clientX,
                            clientY: event.clientY,
                            pageX: event.pageX,
                            pageY: event.pageY,
                            view: window,
                            layerX: event.layerX,
                            layerY: event.layerY,
                            cancelable: true,
                        })
                    );
            });
    
        // // Call brush function
        // vis.brushG.call(vis.brush);
    }
    
  
    labelAxis() {
      let chart = this;
  
      // X-axis label
      chart.svg.append('text')
        .attr('class', 'axis-label x-axis')
        .attr('transform', `translate(${chart.settings.width / 2},${chart.settings.height + chart.settings.margins.bottom - 15})`)
        .style('text-anchor', 'middle')
        .text(attributeOptionsData[chart.attrY].label);
  
      // Y-axis label
      chart.svg.append('text')
        .attr('class', 'axis-label y-axis')
        .attr('transform', 'rotate(-90)')
        .attr('y', -chart.settings.margins.left + 20)
        .attr('x', -(chart.settings.height / 2))
        .attr('dy', '-3.5em')
        .style('text-anchor', 'middle')
        .text(attributeOptionsData[chart.attrX].label);
    }
  
    plotDataPoints() {
      let chart = this;
  
      chart.svg.selectAll('.data-point')
        .data(chart.data)
        .join('circle')
        .attr('class', 'data-point')
        .attr('cx', (d) => chart.xScale(d[chart.attrY]))
        .attr('cy', (d) => chart.yScale(d[chart.attrX]))
        .attr('r', 2.5)
        .style('fill', (d) => `color-mix(in srgb, ${attributeOptionsData[chart.attrX].color}, ${attributeOptionsData[chart.attrY].color})`)
        .style('opacity', 1) // Adjust based on selection
        .on('mouseover', chart.handleMouseOver)
        .on('mouseout', chart.handleMouseOut)
        .on('mousedown', chart.handleMouseDown);
    }
  
    applyBrushing(event) {
      let chart = this;
      if (!event.sourceEvent) return; // Only act on user input
  
      const selectionArea = event.selection;
      if (!selectionArea) {
        // Reset selection
        selectedCounties = [];
      } else {
        // Apply filtering based on brush
        const xDomain = [chart.xScale.invert(selectionArea[0][0]), chart.xScale.invert(selectionArea[1][0])];
        const yDomain = [chart.yScale.invert(selectionArea[1][1]), chart.yScale.invert(selectionArea[0][1])];
  
        selectedCounties = this.countiesData
          .filter((d) => {
            return (
              d[chart.attrX] >= yDomain[0] &&
              d[chart.attrX] <= yDomain[1] &&
              d[chart.attrY] >= xDomain[0] &&
              d[chart.attrY] <= xDomain[1]
            );
          })
          .map((d) => d.id);
      }
  
      chart.refreshVisualizations();
    }
  
    // Placeholder for methods to handle mouse events
    handleMouseOver() {}
    handleMouseOut() {}
    handleMouseDown() {}
  
    // Placeholder for method to refresh other visualizations based on brushing
    refreshVisualizations() {}
  }
  