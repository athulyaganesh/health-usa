let filteredCounties = [], geoData;
let histogram1,
  histogram2,
  scatterplot
  choropleth1,
  choropleth2;
let updateVisualizations;
const attributeOptionsData = {
    poverty_perc: {
        label: "Poverty Percentage",
        color: "#e6774d"
    },
    median_household_income: {
        label: "Median Household Income",
        color: "#72a772"
    },
    education_less_than_high_school_percent: {
        label: "Education Less Than High School Percentage",
        color: "#7facc4"
    },
    air_quality: {
        label: "Air Quality",
        color: "#8fbb8e"
    },
    park_access: {
        label: "Park Access",
        color: "#e6b236"
    },
    percent_inactive: {
        label: "Percent Inactive",
        color: "#8c8c8c"
    },
    percent_smoking: {
        label: "Percent Smoking",
        color: "#c95a5a"
    },
    elderly_percentage: {
        label: "Elderly Percentage",
        color: "#a357a9"
    },
    number_of_hospitals: {
        label: "Number of Hospitals",
        color: "#e69940"
    },
    number_of_primary_care_physicians: {
        label: "Number of Primary Care Physicians",
        color: "#a3d3a5"
    },
    percent_no_heath_insurance: {
        label: "Percent No Health Insurance",
        color: "#d87979"
    },
    percent_high_blood_pressure: {
        label: "Percent High Blood Pressure",
        color: "#b89ac9"
    },
    percent_coronary_heart_disease: {
        label: "Percent Coronary Heart Disease",
        color: "#e69940"
    },
    percent_stroke: {
        label: "Percent Stroke",
        color: "#a3d3a5"
    },
    percent_high_cholesterol: {
        label: "Percent High Cholesterol",
        color: "#d87979"
    }
};


const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("visibility", "hidden"); 


Promise.all([
    d3.json("data/counties.json"),
    d3.csv("data/national_health_data.csv"),
])
.then((data) => {
    let geoData = data[0];
    let countiesData = data[1];

    const attributesAvailable = Object.keys(countiesData[0]);

    countiesData.forEach((d) => {
        attributesAvailable.forEach((attribute) => {
            let newVal;
            if (attribute === "display_name") {
                newVal = d[attribute].replaceAll('"', "").replaceAll("(", "").replaceAll(")", "");}
            else {
                newVal = +d[attribute];
            }
            d[attribute] = newVal;
        });
    });

    geoData.objects.counties.geometries.forEach((geo) => {
        countiesData.forEach((county) => {
            if (geo.id == county.cnty_fips) {
                attributesAvailable.forEach((attribute) => {
                    geo.properties[attribute] = county[attribute];
                });
            }
        });
    });

    const dropdown1 = document.getElementById("dropdown1");
    const dropdown2 = document.getElementById("dropdown2");

    Object.entries(attributeOptionsData).forEach((attributeOptionsData, index) => {
        const opt1 = document.createElement("option");
        const opt2 = document.createElement("option");
        opt1.value = opt2.value = attributeOptionsData[0];
        opt1.text = opt2.text = attributeOptionsData[1].label;
        dropdown1.add(opt1);
        dropdown2.add(opt2);

dropdown2.selectedIndex = Object.keys(attributeOptionsData).length - 1;
    });

    let filteredCounties = []; 


histogram1 = new Histogram(
    {
        parent: "#histogram1",
        height: 250,
        width: 375
    },
    dropdown1.value, 1, countiesData
);

histogram2 = new Histogram(
    {
        parent: "#histogram2",
        height: 250,
        width: 375
    },
    dropdown2.value, 2, countiesData
);

scatterplot = new Scatterplot(
    {
      targetElement: "#scatterplot", // Use #scatterplot to target the element by its ID
      width: 375, // Adjust width as needed
      height: 250, // Adjust height as needed
    },
    dropdown1.value,
    dropdown2.value,
    countiesData
);

choropleth1 = new Choropleth(
    {
        parent: "#choropleth1",
      width: 750,
      height: 750
    },
    dropdown1.value,
    1, 
    geoData
  );
  choropleth2 = new Choropleth(
    {
        parent: "#choropleth2",
      width: 750,
      height: 750
    },
    dropdown2.value,
    2, 
    geoData
  );

// // After initializing the scatterplot, check if it's present in the DOM
// const scatterplotContainer = document.querySelector("#scatterplot");

// if (scatterplotContainer) {
//     console.log("Scatterplot container is present in the DOM.");
    
//     const scatterplotSVG = scatterplotContainer.querySelector("svg");
    
//     if (scatterplotSVG) {
//         console.log("Scatterplot SVG is present in the DOM.");
//     } else {
//         console.error("Scatterplot SVG is not present in the DOM. Check Scatterplot class initialization.");
//     }
// } else {
//     console.error("Scatterplot container is not present in the DOM. Check parent in Scatterplot class initialization.");
// }


    updateVisualizations = (currentVis) => {
        const selectedAttr1 = dropdown1.value;
        const selectedAttr2 = dropdown2.value;

        histogram1.updateVis();
        histogram2.updateVis();
        scatterplot.refreshChart();
        choropleth1.updateVis();
        choropleth2.updateVis();

        // Modify the brushes of the visualizations
        histogram1.brushG.call(histogram1.brush.move, null);
        histogram2.brushG.call(histogram2.brush.move, null);
        scatterplot.brushG.call(scatterplot.brush.move, null);
        if (currentVis != choropleth1)
            choropleth1.brushG.call(choropleth1.brush.move, null);
        if (currentVis != choropleth2)
            choropleth2.brushG.call(choropleth2.brush.move, null);
    };

  


    // Add the onchange events to the dropdowns
    dropdown1.onchange = (event) => {
        const selectedAttr = event.target.value;
        const histogram1Element = document.getElementById("histogram1");
        if (histogram1Element) {
            histogram1Element.style.display = "block";
        }


        // Update the histogram for the first attribute
        histogram1.graphName = selectedAttr;
        scatterplot.attrX = selectedAttr; 
        choropleth1.graphname = selectedAttr; 

        updateVisualizations(null);
    };
    dropdown2.onchange = (event) => {
        const selectedAttr = event.target.value;
        const histogram2Element = document.getElementById("histogram2");

        if (histogram2Element) {
                histogram2Element.style.display = "block";
        }
        histogram2.graphName = selectedAttr;
        scatterplot.attrY = selectedAttr; 
        choropleth2.graphname = selectedAttr;
        updateVisualizations(null);
    };
})
.catch((error) => {
    console.error("Error loading the data", error);
});
