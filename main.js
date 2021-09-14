const url = "https://covid.ourworldindata.org/data/owid-covid-data.json"

const codes_country = [
  "MYS", 
  "BRN", 
  "IDN", 
  "PHL", 
  "SGP", 
  "THA", 
  "VNM"
]

let days_adjust = 1
let days_ago = 100

let date = ""
let label = []
let x = []
let y1 = []
let y2 = []
let ymode = y1
let yrange = [ 0, 700 ]
let ytick = 100

let ytitle = "New cases smoothed per million"

let historical = []

let mode = "cases"

let slider = document.getElementById("myRange")
let output = document.getElementById("demo")

async function load() {
  try {
    const response = await fetch(url)    
    if(!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`)
    }
    const data = await response.json()
    const rows = getRows(data)
    const table = getTable(data, rows)
    setPlotPoints(table[days_adjust-1])
    output.innerHTML = date
    document.getElementById("date").textContent = date
    historical = table
    preparePlot(prepData(), prepLayout(), prepConfig())
  } catch (e) {
    console.log(e)
  }
}


load()

function getRows(data) {
  let rows = []
  for (i = 0; i < codes_country.length; i++) {
    rows[codes_country[i]] = data[codes_country[i]].data.length - 1
  }
  return rows
}

function getTable(data, rows) {
  let table = {}
  for (i = 0; i < days_ago; i++) {
    let country_set = {}
    for (j = 0; j < codes_country.length; j++) {
      let data_set = []
      let country_code = codes_country[j]
      let index = rows[codes_country[j]] - i
      let date = data[country_code].data[index].date
      let vaccinated = findLatestVaccinated(data[country_code], index)
      let cases = data[country_code].data[index].new_cases_smoothed_per_million
      let deaths = data[country_code].data[index].new_deaths_smoothed_per_million
      data_set = [date, vaccinated, cases, deaths]
      country_set[country_code]=data_set
    }
    table[i] = country_set
  }
  return table
}

function findLatestVaccinated(country_data, start_index) {
  let start = start_index
  while (country_data.data[start].people_fully_vaccinated_per_hundred === undefined) {
       start = start - 1
  }
  vaccinated = country_data.data[start].people_fully_vaccinated_per_hundred
  return vaccinated
}

function reset() {
  label = []
  x = []
  y1 = []
  y2 = []
}

function setPlotPoints(entry) {
  for (i = 0; i < codes_country.length; i++) {
    label.push(codes_country[i])
    date = entry[codes_country[i]][0]
    x.push(entry[codes_country[i]][1])
    y1.push(entry[codes_country[i]][2])
    y2.push(entry[codes_country[i]][3])
  }
}

function prepData() {
  let plot = {
    x: x,
    y: ymode,
    mode: 'markers+text',
    type: 'scatter',
    name: "Latest",
    text: label,
    textposition: 'right center',
    textfont: {
      family:  'Raleway, sans-serif'
    },
    marker: {
        size: 12,
        color: "#0075FF"
    }
  }
  return plot
}

function prepLayout() {
  let layout = {
    xaxis: {
        title: "People fully vaccinated per 100",
        range: [ 0, 100 ],
        dtick: 10
    },

    yaxis: {
        title: ytitle,
        range: yrange,
        dtick: ytick
    },

    margin: {
        t: 0,
        r: 0,
        l: 50,
        b: 50
    },

    legend: {
        "orientation": "h",
        bordercolor: "#E2E2E2",
        borderwidth: 1,
        x: 0.5,
        y: 1.1,
        xanchor: "center"
    }
  }
  return layout
}

function prepConfig() {
  let config = {
    responsive: true,
    displayModeBar: false
  }
  return config
}

function preparePlot(plot, layout, config) { 
  let chart_data = [plot]
  let chart_layout = layout
  let chart_config = config
  Plotly.newPlot("myDiv", chart_data, chart_layout, chart_config)
}

slider.oninput = function() {
  reset()
  modeSwitch()
  setPlotPoints(historical[days_ago - this.value])
  rePlot()
}

function radioSelected(selected) {
  if (selected === "Deaths") {
    mode = "deaths"
  } else {
    mode = "cases"
  }
  modeSwitch()
  setPlotPoints(historical[days_ago - slider.value])
  rePlot()
}

function modeSwitch() {
  if (mode === "cases") {
    ymode = y1
    ytitle = "New cases smoothed per million"
    yrange = [ 0, 700 ]
    ytick = 100
  } else {
    ymode = y2
    ytitle = "New deaths smoothed per million"
    yrange = [ 0, 12 ]
    ytick = 1
  }
}

function rePlot() {
  output.innerHTML = date
  preparePlot(prepData(), prepLayout(), prepConfig())
}