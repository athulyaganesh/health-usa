class Histogram {
    constructor(_config, _graphName, _num, _countiesData) {
      this.config = {
        parent: _config.parent,
        width: _config.width || 400,
        height: _config.height || 200,
        margin: { top: 20, bottom: 37, right: 30, left: 65 },
      };
      this.graphName = _graphName;
      this.number = _num;
      this.countiesData = _countiesData; 
  
      this.initVis();
    }
  
    initVis() {
      const vis = this;
      vis.svg = d3
        .select(vis.config.parent)
        .append("svg")
        .attr(
          "width",
          vis.config.width +
            vis.config.margin.left +
            vis.config.margin.right
        )
        .attr(
          "height",
          vis.config.height +
            vis.config.margin.top +
            vis.config.margin.bottom
        )
        .append("g")
        .attr(
          "transform",
          `translate(${vis.config.margin.left},${vis.config.margin.top})`
        );
  
      vis.x = d3.scaleLinear().range([0, vis.config.width]);
      vis.xAxis = vis.svg
        .append("g")
        .attr("transform", `translate(0,${vis.config.height})`);
  
      vis.y = d3.scaleLinear().range([vis.config.height, 0]);
      vis.yAxis = vis.svg.append("g");
  
      vis.svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - vis.config.margin.left)
        .attr("x", 0 - vis.config.height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of Counties");
  
      vis.brushG = vis.svg.append("g").attr("class", "brush");
  
      vis.brush = d3
        .brushX()
        .extent([
          [0, 0],
          [vis.config.width, vis.config.height],
        ])
        .on("start", () => (filteredCounties = []))
        .on("end", (result) => vis.filterBySelection(result, vis));
  
      this.updateVis();
    }
  
    updateVis() {
      const vis = this;
     vis.data = vis.countiesData.filter(
  (d) =>
    d[vis.graphName] != -1 &&
    (filteredCounties.length == 0 ||
      (filteredCounties.length != 0 &&
        filteredCounties.find(
          (filteredCounty) => filteredCounty == d.cnty_fips
        )))
);
  
      vis.x.domain([0, d3.max(vis.data, (d) => d[vis.graphName])]);
      vis.xAxis.call(d3.axisBottom(vis.x));
  
      const histogram = d3
        .histogram()
        .value((d) => d[vis.graphName])
        .domain(vis.x.domain())
        .thresholds(vis.x.ticks(50));
  
      const bins = histogram(vis.data);
  
      vis.y.domain([0, d3.max(bins, (d) => d.length)]);
      vis.yAxis.call(d3.axisLeft(vis.y));
  
      vis.svg
        .selectAll("text.xLabel")
        .data([vis.graphName])
        .join("text")
        .attr("class", "xLabel")
        .attr(
          "transform",
          "translate(" +
            vis.config.width / 2 +
            " ," +
            (vis.config.height + 35) +
            ")"
        )
        .style("text-anchor", "middle")
        .text(attributeOptionsData[vis.graphName].label);

  
      vis.svg
        .selectAll(`rect.bar-${this.number}`)
        .data(bins)
        .join("rect")
        .attr("class", `bar-${this.number}`)
        .attr("x", 1)
        .attr("transform", (d) => `translate(${vis.x(d.x0)}, ${vis.y(d.length)})`)
        .attr("width", (d) => vis.x(d.x1) - vis.x(d.x0))
        .attr("height", (d) => vis.config.height - vis.y(d.length))
        .style("fill", attributeOptionsData[vis.graphName].color)

        .on("mouseover", function (event, d) {
          d3.select(this).attr("stroke-width", "2").attr("stroke", "white");
          tooltip.style("visibility", "visible").html(`
            <div class="tooltip-title">${
              d.length
            } ${d.length === 1 ? "County" : "Counties"}</div>
            <div><b>${
              attributeOptionsData[vis.graphName].label
            }</b>: ${d.x0}-${d.x1}</div>
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
  
      vis.brushG.call(vis.brush);
    }
  
    filterBySelection(result, vis) {
      if (!result.sourceEvent) return; 
  
      const extent = result.selection;
  
      if (!extent) {
        filteredCounties = [];
      } else {
        const range = [vis.x.invert(extent[0]), vis.x.invert(extent[1])];
  
        filteredCounties = vis.countiesData
          .filter((d) => {
            const attrVal = d[vis.graphName];
  
            return attrVal >= range[0] && attrVal <= range[1];
          })
          .map((d) => d.cnty_fips);
      }
  
      updateVisualizations(vis);
  
      vis.brushG.call(vis.brush.move, null);
    }
  }
  