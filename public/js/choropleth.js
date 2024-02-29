
class Choropleth {
    constructor(_config, _attributeName, _num, geoData) {
      this.config = {
        parent: _config.parent,
        width: _config.width || 800,
        height: _config.height || 475,
        margin: _config.margin || { top: 0, right: 5, bottom: 10, left: 5 },
        color: attributeOptionsData[_attributeName].color,
        tooltip_padding: 20,
        bottom_legend: 40,
        left_legend: 60,
        rect_height_legent: 12,
        rect_width_legent: 300,
      };
      this.us_data = geoData;
      this.number = _num;
      this.graphname = _attributeName;
      this.active = d3.select(null);
      this.geoData = geoData; 
  
      this.initVis();
    }
  
    initVis() {
      let vis = this;
  
      vis.width =
        vis.config.width -
        vis.config.margin.left -
        vis.config.margin.right;
      vis.height =
        vis.config.height -
        vis.config.margin.top -
        vis.config.margin.bottom;
  
      vis.svg = d3
        .select(vis.config.parent)
        .append("svg")
        .attr("width", vis.config.width)
        .attr("height", vis.config.height);
  
      vis.chart = vis.svg
        .append("g")
        .attr(
          "transform",
          `translate(${vis.config.margin.left},${vis.config.margin.top})`
        );
  
      vis.projection = d3
        .geoAlbersUsa()
        .translate([vis.width / 2, vis.height / 2])
        .scale(vis.width);
  
      vis.path = d3.geoPath().projection(vis.projection);
  
      vis.g = vis.svg
        .append("g")
        .attr(
          "transform",
          "translate(" +
            vis.config.margin.left +
            "," +
            vis.config.margin.top +
            ")"
        )
        .attr(
          "width",
          vis.width + vis.config.margin.left + vis.config.margin.right
        )
        .attr(
          "height",
          vis.height + vis.config.margin.top + vis.config.margin.bottom
        );
  
      vis.svg
        .append("path")
        .datum(topojson.mesh(vis.us_data, vis.us_data.objects.states, (a, b) => a !== b))
        .attr("id", "state-borders")
        .attr("class", "states")
        .attr("d", vis.path)
        .attr(
          "transform",
          "translate(" +
            vis.config.margin.left +
            "," +
            vis.config.margin.top +
            ")"
        );
  
      vis.linearGradient = vis.svg
        .append("defs")
        .append("linearGradient")
        .attr("id", `legend-gradient-${vis.number}`);
  
      vis.legend = vis.chart
        .append("g")
        .attr(
          "transform",
          `translate(${vis.config.left_legend},${
            vis.height - vis.config.bottom_legend
          })`
        );
  
      vis.legendRect = vis.legend
        .append("rect")
        .attr("width", vis.config.rect_width_legent)
        .attr("height", vis.config.rect_height_legent);
  
      vis.brushG = vis.g.append("g").attr("class", "brush");
  
      vis.brush = d3
        .brush()
        .extent([
          [0, 0],
          [vis.config.width, vis.config.height],
        ])
        .on("start", () => (filteredCounties = []))
        .on("end", (result) => vis.filterBySelection(result, vis));
  
      vis.countiesGroup = vis.g.append("g").attr("id", "counties");
  
      this.updateVis();
    }
  
    updateVis() {
      const vis = this;
  
      vis.config.color = attributeOptionsData[vis.graphname].color;
  
      const filteredData = this.geoData.objects.counties.geometries.filter(
        (d) => d.properties[vis.graphname] != -1
      );
  
      vis.legendTitle = vis.legend
        .selectAll(".legend-title")
        .data([vis.graphname])
        .join("text")
        .attr("class", "legend-title")
        .attr("dy", ".35em")
        .attr("y", -10)
        .text(attributeOptionsData[vis.graphname].label)
        .style(
          "display",
          vis.graphname === "urban_rural_status" ? "none" : "block"
        );
  
      const attributeExtent = d3.extent(
        filteredData,
        (d) => d.properties[vis.graphname]
      );
  
      if (vis.graphname === "urban_rural_status") {
        vis.colorScale = d3
          .scaleOrdinal()
          .domain(["Rural", "Small City", "Suburban", "Urban"])
          .range(["#f3daf0", "#e7b5e1", "#db80d3", "#c447b6"]);
      } else {
        vis.colorScale = d3
          .scaleLinear()
          .domain(attributeExtent)
          .range(["#ffffff", vis.config.color]);
      }
  
      vis.counties = vis.countiesGroup
        .selectAll("path")
        .data(topojson.feature(vis.us_data, vis.us_data.objects.counties).features)
        .join("path")
        .attr("d", vis.path)
        .attr("fill", (d) => {

          const coloredOrStripe =
            d.properties[vis.graphname] != -1
              ? vis.colorScale(d.properties[vis.graphname])
              : "url(#lightstripe)";
          return filteredCounties.length !== 0
            ? filteredCounties.find(
                (filteredCounty) => filteredCounty == d.properties.cnty_fips
              )
              ? coloredOrStripe
              : "gray"
            : coloredOrStripe;
        });
    
  
      vis.counties
        .on("mouseover", function (event, d) {
          const attrVal = d.properties[vis.graphname];
          d3.select(this).attr("stroke-width", "2").attr("stroke", "white");
          tooltip.style("visibility", "visible").html(`
          <div class="tooltip-title">${d.properties.display_name}</div>
          ${
            attrVal == -1
              ? "<div><i>No data available</i></div>"
              : `<div><b>${
                  attributeOptionsData[vis.graphname].label
                }</b>: ${attrVal}</div>`
          }
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
                layerX: event.layerX,
                layerY: event.layerY,
                cancelable: true,
                view: window,
              })
            );
        });
  
      vis.legendStops = [
        {
          color: "#ffffff",
          value: attributeExtent[0],
          offset: 0,
        },
        {
          color: vis.config.color,
          value: attributeExtent[1],
          offset: 100,
        },
      ];
  
      vis.legend
        .selectAll("rect.choroplethColor")
        .data(["Rural", "Small City", "Suburban", "Urban"])
        .join("rect")
        .attr("class", "choroplethColor")
        .attr("width", 18)
        .attr("height", 18)
        .attr("class", "choroplethColor")
        .style("fill", (d) => vis.colorScale(d))
        .style("stroke", (d) => vis.colorScale(d))
        .attr(
          "transform",
          (d, index) => `translate(${vis.config.margin.left + index * 100},${0})`
        )
        .style(
          "display",
          vis.graphname === "urban_rural_status" ? "block" : "none"
        );
      vis.legend
        .selectAll("text.choroplethColorLabel")
        .data(["Rural", "Small City", "Suburban", "Urban"])
        .join("text")
        .attr("class", "choroplethColorLabel")
        .attr("x", 22)
        .attr("y", 14)
        .text((d) => d)
        .attr(
          "transform",
          (d, index) => `translate(${vis.config.margin.left + index * 100},${0})`
        )
        .style(
          "display",
          vis.graphname === "urban_rural_status" ? "block" : "none"
        );
  
      vis.legend
        .selectAll(".legend-label")
        .data(vis.legendStops)
        .join("text")
        .attr("class", "legend-label")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .attr("y", 20)
        .attr("x", (d, index) => {
          return index == 0 ? 0 : vis.config.rect_width_legent;
        })
        .text((d) => Math.round(d.value * 10) / 10)
        .style(
          "display",
          vis.graphname === "urban_rural_status" ? "none" : "block"
        );
  
      vis.linearGradient
        .selectAll("stop")
        .data(vis.legendStops)
        .join("stop")
        .attr("offset", (d) => d.offset)
        .attr("stop-color", (d) => d.color)
        .style(
          "display",
          vis.graphname === "urban_rural_status" ? "none" : "block"
        );
  
      vis.legendRect
        .attr("fill", `url(#legend-gradient-${vis.number})`)
        .style(
          "display",
          vis.graphname === "urban_rural_status" ? "none" : "block"
        );
  
      vis.brushG.call(vis.brush);
    }
  
    filterBySelection(result, vis) {
      if (!result.sourceEvent) return; 
  
      const extent = result.selection;
  
      if (!extent) {
        filteredCounties = [];
      } else {
        filteredCounties = topojson
          .feature(vis.us_data, vis.us_data.objects.counties)
          .features.filter((d) => {
            const boundingBox = vis.path.bounds(d);
            const xMin = boundingBox[0][0];
            const yMin = boundingBox[0][1];
            const xMax = boundingBox[1][0];
            const yMax = boundingBox[1][1];
  
            return (
              xMax >= extent[0][0] &&
              xMin <= extent[1][0] &&
              yMax >= extent[0][1] &&
              yMin <= extent[1][1]
            );
          })
          .map((d) => d.properties.cnty_fips);
      }
  
      updateVisualizations(vis);
    }
  }