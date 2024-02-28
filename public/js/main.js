let filteredCounties = [], geoData, countiesData;
let histogram1,
  histogram2,
  barchart1,
  barchart2,
  scatterplot,
  connectedScatterplot,
  choropleth1,
  choropleth2;
let updateVisualizations;

const attributeOptionsData = {
    poverty_perc: {
        label: "Poverty Percentage",
        color: "#ff8a65"
    },
    median_household_income: {
        label: "Median Household Income",
        color: "#ffd54f"
    },
    education_less_than_high_school_percent: {
        label: "Education Less Than High School Percentage",
        color: "#90caf9"
    },
    air_quality: {
        label: "Air Quality",
        color: "#a5d6a7"
    },
    park_access: {
        label: "Park Access",
        color: "#81c784"
    },
    percent_inactive: {
        label: "Percent Inactive",
        color: "#9e9e9e"
    },
    percent_smoking: {
        label: "Percent Smoking",
        color: "#e57373"
    },
    elderly_percentage: {
        label: "Elderly Percentage",
        color: "#ba68c8"
    },
    number_of_hospitals: {
        label: "Number of Hospitals",
        color: "#ffcc80"
    },
    number_of_primary_care_physicians: {
        label: "Number of Primary Care Physicians",
        color: "#c8e6c9"
    },
    percent_no_heath_insurance: {
        label: "Percent No Health Insurance",
        color: "#ef9a9a"
    },
    percent_high_blood_pressure: {
        label: "Percent High Blood Pressure",
        color: "#d1c4e9"
    },
    percent_coronary_heart_disease: {
        label: "Percent Coronary Heart Disease",
        color: "#ffcc80"
    },
    percent_stroke: {
        label: "Percent Stroke",
        color: "#c8e6c9"
    },
    percent_high_cholesterol: {
        label: "Percent High Cholesterol",
        color: "#ef9a9a"
    }
};

Promise.all([
    d3.json("data/counties.json"),
    d3.csv("data/national_health_data.csv"),
])
.then((data) => {
    let geoData = data[0];
    let countiesData = data[1];

    const attributesAvailable = Object.keys(countiesData[0]);

    // Process the countiesData
    countiesData.forEach((d) => {
        attributesAvailable.forEach((attribute) => {
            let newVal;
            if (attribute === "display_name") {
                newVal = d[attribute].replaceAll('"', "").replaceAll("(", "").replaceAll(")", "");
            } else if (attribute === "urban_rural_status") {
                newVal = d[attribute];
            } else {
                newVal = +d[attribute];
            }
            d[attribute] = newVal;
        });
    });

    // Combine the datasets
    geoData.objects.counties.geometries.forEach((geo) => {
        countiesData.forEach((county) => {
            // If the IDs match, add all of the attributes data
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
        // Add all of the options to the 2 attribute selectors
        const opt1 = document.createElement("option");
        const opt2 = document.createElement("option");
        opt1.value = opt2.value = attributeOptionsData[0];
        opt1.text = opt2.text = attributeOptionsData[1].label;
        dropdown1.add(opt1);
        dropdown2.add(opt2);

        // Set default selection for the second dropdown to be the last element
dropdown2.selectedIndex = Object.keys(attributeOptionsData).length - 1;
    });

    let filteredCounties = []; // Initialize as an empty array


  // Create the charts/graphs
  histogram1 = new Histogram(
    {
        parentElement: "#histogram1",
        containerHeight: 200,
        containerWidth: 400
    },
    dropdown1.value, 1, countiesData
);
histogram2 = new Histogram(
    {
        parentElement: "#histogram2",
    },
    dropdown2.value, 2, countiesData
);


    updateVisualizations = (currentVis) => {
        const selectedAttr1 = dropdown1.value;
        const selectedAttr2 = dropdown2.value;

        // Update all of the visualizations' content
        // if (selectedAttr1 === "urban_rural_status") barchart1.updateVis();
        // if (selectedAttr2 === "urban_rural_status") barchart2.updateVis();
        if (selectedAttr1 !== "urban_rural_status") histogram1.updateVis();
        if (selectedAttr2 !== "urban_rural_status") histogram2.updateVis();
        // if (
        //     selectedAttr1 === "urban_rural_status" ||
        //     selectedAttr2 === "urban_rural_status"
        // )
        //     connectedScatterplot.updateVis();
        // if (
        //     selectedAttr1 !== "urban_rural_status" ||
        //     selectedAttr2 !== "urban_rural_status"
        // )
        //     scatterplot.updateVis();
        // choropleth1.updateVis();
        // choropleth2.updateVis();

        // Modify the brushes of the visualizations
        histogram1.brushG.call(histogram1.brush.move, null);
        histogram2.brushG.call(histogram2.brush.move, null);
        // connectedScatterplot.brushG.call(connectedScatterplot.brush.move, null);
        // if (currentVis != barchart1)
        //     barchart1.brushG.call(barchart1.brush.move, null);
        // if (currentVis != barchart2)
        //     barchart2.brushG.call(barchart2.brush.move, null);
        // if (currentVis != scatterplot)
        //     scatterplot.brushG.call(scatterplot.brush.move, null);
        // if (currentVis != choropleth1)
        //     choropleth1.brushG.call(choropleth1.brush.move, null);
        // if (currentVis != choropleth2)
        //     choropleth2.brushG.call(choropleth2.brush.move, null);
    };

  


    // Add the onchange events to the dropdowns
    dropdown1.onchange = (event) => {
        const selectedAttr = event.target.value;
        const histogram1Element = document.getElementById("histogram1");

        if (histogram1Element) {
            if (selectedAttr === "urban_rural_status") {
                histogram1Element.style.display = "none";
            } else {
                histogram1Element.style.display = "block";
            }
        }

        // If either attribute is for the urban/rural status,
        //  show the connected scatterplot instead of the regular scatterplot
        if (
            selectedAttr === "urban_rural_status" ||
            dropdown2.value === "urban_rural_status"
        ) {

        } else {

        }

        // Update the histogram for the first attribute
        histogram1.attributeName = selectedAttr;

        updateVisualizations(null);
    };
    dropdown2.onchange = (event) => {
        const selectedAttr = event.target.value;
        const histogram2Element = document.getElementById("histogram2");

        if (histogram2Element) {
            if (selectedAttr === "urban_rural_status") {
                histogram2Element.style.display = "none";
            } else {
                histogram2Element.style.display = "block";
            }
        }

        // If either attribute is for the urban/rural status,
        //  show the connected scatterplot instead of the regular scatterplot
        if (
            selectedAttr === "urban_rural_status" ||
            dropdown1.value === "urban_rural_status"
        ) {

        } else {

        }

        // Update the histogram for the second attribute
        histogram2.attributeName = selectedAttr;

        updateVisualizations(null);
    };
})
.catch((error) => {
    console.error("Error loading the data", error);
});
