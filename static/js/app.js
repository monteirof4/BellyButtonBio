function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel
  // Use `d3.json` to fetch the metadata for a sample
  var url = `/metadata/${sample}`;
  d3.json(url).then((sampleMetadata) => {
    // Use d3 to select the panel with id of `#sample-metadata`
    var sampleMetadataEl = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    sampleMetadataEl.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(sampleMetadata).forEach(([key, value]) => {
      var row = sampleMetadataEl.append("p");
      //cell.attr("class","table-cell");
      row.text(`${key}: ${value}`);
    });
    // Build the Gauge Chart
    buildGauge(sampleMetadata.WFREQ);
  });

}

function buildGauge(frequency) {
  // Calculate the angle of the frequency to position the pointer
  var level = frequency * 180 / 9;

  // Trig to calc meter point
  var degrees = 180 - level,
      radius = .5;
  var radians = degrees * Math.PI / 180;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  // Path: may have to change to create a better triangle
  var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
      pathX = String(x),
      space = ' ',
      pathY = String(y),
      pathEnd = ' Z';
  var path = mainPath.concat(pathX,space,pathY,pathEnd);

  var data = [{ type: 'scatter',
    x: [0], y:[0],
      marker: {size: 28, color:'850000'},
      showlegend: false,
      name: 'scrubs',
      text: level * 9 / 180,
      hoverinfo: 'text+name'},
    { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
    rotation: 90,
    text: ['8-9', '7-8', '6-7',
            '5-6', '4-5', '3-4', '2-3', 
            '1-2', '0-1', ''],
    textinfo: 'text',
    textposition:'inside',
    marker: {colors:['rgba(0, 128, 0, .5)', 'rgba(28, 142, 28, .5)',
                     'rgba(56, 156, 56, .5)', 'rgba(85, 170, 85, .5)',
                      'rgba(113, 184, 113, .5)', 'rgba(141, 198, 141, .5)',
                      'rgba(170, 212, 170, .5)', 'rgba(198, 226, 198, .5)',
                      'rgba(226, 240, 226, .5)', 'rgba(255, 255, 255, 0)']},
    labels: ['8-9', '7-8', '6-7',
             '5-6', '4-5', '3-4', '2-3', 
             '1-2', '0-1', ''],
    hoverinfo: 'label',
    hole: .5,
    type: 'pie',
    showlegend: false
  }];

  var layout = {
    shapes:[{
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: {
          color: '850000'
        }
      }],
    title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per week',
    xaxis: {zeroline:false, showticklabels:false,
              showgrid: false, range: [-1, 1]},
    yaxis: {zeroline:false, showticklabels:false,
              showgrid: false, range: [-1, 1]}
  };

  Plotly.newPlot('gauge', data, layout);
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  var url = `/samples/${sample}`;
  d3.json(url).then((samples) => {
    // @TODO: Build a Bubble Chart using the sample data

    var bubbleData = {
      x: samples.otu_ids,
      y: samples.sample_values,
      mode: 'markers',
      marker: {
        size: samples.sample_values,
        color: samples.otu_ids
      },
      text: samples.otu_labels
    };
    
    var data = [bubbleData];
    
    Plotly.newPlot('bubble', data);

    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    var list = [];
    // Combine the arrays
    for (var j = 0; j < samples.otu_ids.length; j++) {
      list.push({'labels': samples.otu_ids[j], 'values': samples.sample_values[j], 'hovers': samples.otu_labels[j]});
    }
    // Sort the list array of objects
    list.sort((a, b) => parseFloat(b.values) - parseFloat(a.values));
    
    var labels = [];
    var values = [];
    var hovers = [];

    // Separate the arrays back out
    list.map((sample) => {
      labels.push(sample.labels);
      values.push(sample.values);
      hovers.push(sample.hovers)
    })

    // Selecting top10 samples
    labels = labels.slice(0,10);
    values = values.slice(0,10);
    hovers = hovers.slice(0,10);

    // Create trace for plotting
    var pieData = [{
      labels: labels,
      values: values,
      type: 'pie'
    }];

    // Plot the data
    Plotly.newPlot("pie", pieData);
  });

}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
