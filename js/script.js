var btnOk = document.getElementById("btnOk")
var currencyFrom = document.getElementById("currencyFrom")
var currencyTo = document.getElementById("currencyTo")
var selectedDate = document.getElementById("selectedDate")
var curRes = document.getElementById("curRes")
var latestSpan = document.getElementById("latestSpan")
var latestSpanCur = document.getElementById("latestSpanCur")
var currencyBase = document.getElementById("currencyBase")
var currencyFollow = document.getElementById("currencyFollow")
var selectMonth = document.getElementById("selectMonth")


function AJAXrequest() {
    let req = new XMLHttpRequest()
    req.open("GET", "https://api.exchangeratesapi.io/latest?access_key=9d88f664362c90bba4aff246e1c9bbaf", false)
    req.send()
    let data = JSON.parse(req.responseText)
    return data
}

function createElem(element) {
    let opt = document.createElement("option")
    opt.value = element
    opt.innerText = element
    return opt
}

function addCombos(arr) {

    arr.forEach(element => {
        currencyFrom.appendChild(createElem(element))
    });
    
    arr.forEach(element => {
        currencyTo.appendChild(createElem(element))
        currencyTo.selectedIndex = arr.indexOf("USD")
    });

    arr.forEach(elem => { 
        currencyBase.appendChild(createElem(elem)) 
    })

    arr.forEach(elem => {
        currencyFollow.appendChild(createElem(elem))
        currencyFollow.selectedIndex = arr.indexOf("USD")
    })
}

window.onload = () => {

    let data = AJAXrequest()

    let arr = []

    arr.push(data["base"])

    for (let key in data["rates"]) {
       arr.push(key)
    }

    addCombos(arr)

    let dateNow = new Date()
    dateNow = dateNow.toISOString().slice(0, 10)
    selectedDate.value = dateNow
    
    let m =  dateNow.split("-")
    selectMonth.value = `${m[0]}-${m[1]}`
    
    latestSpan.innerText = dateNow
    latestSpanCur.innerText = `(${data["base"]})`

    updateTableRequest(data["base"])
    chartMethod()
}


function getCurrencyFromTo() {
    let converterData = {}
    converterData.currencyFrom = currencyFrom.options[currencyFrom.selectedIndex].value
    converterData.currencyTo = currencyTo.options[currencyTo.selectedIndex].value
    converterData.selectedDate = selectedDate.value
    return converterData
}

function validateData() {

    let cf = currencyFrom.options[currencyFrom.selectedIndex].value
    let ct = currencyTo.options[currencyTo.selectedIndex].value

    let res1 = cf === ct ? false : true
    let res2 = selectedDate.value == "" ? false : true

    let dateNow = new Date()
    dateNow = dateNow.toISOString().slice(0, 10)

    let res3 = selectedDate.value > dateNow ? false : true

    if (res1 && res2 && res3) { return true }

    return false
}

function getDataSynchronously(cf, ct, date) {
    let req = new XMLHttpRequest()

    req.open("GET", `https://api.exchangeratesapi.io/${date}?base=${cf}&access_key=9d88f664362c90bba4aff246e1c9bbaf`, false)

    req.send()

    let data = JSON.parse(req.responseText)

    let objData = {}
    objData.date = date
    objData.cf = cf
    objData.ct = ct

    for (let key in data["rates"]) {
        if (key == ct) {
            objData.rate = parseFloat(parseFloat(data["rates"][key]).toFixed(4))
            return objData
        }
    }

    objData.rate = "No info"

    return objData
}

btnOk.onclick = () => {

    if (!validateData()) { return }

    let {currencyFrom: cf, currencyTo: ct, selectedDate: date} = getCurrencyFromTo()

    curRes.innerText = getDataSynchronously(cf, ct, date).rate
}



var updateTable = (rates, cf) => {

    $(".currencyTable").remove()

    $(".tableBox").append(`<table class="table table-striped currencyTable">
                           <thead>
                           <tr>
                               <th scope="col">Currency</th>
                               <th scope="col">Value</th>
                           </tr>
                           </thead>
                           <tbody id="tBody">

                           </tbody>
                           </table>`)

    var tBody = document.getElementById("tBody")

    for (let key in rates) {

        if (key == cf) { continue }

        let tr = document.createElement("tr")

        let tdCurrency = document.createElement("td")
        let tdValue = document.createElement("td")

        tdCurrency.innerText = key
        tdValue.innerText = parseFloat(parseFloat(rates[key]).toFixed(3))

        tr.appendChild(tdCurrency)
        tr.appendChild(tdValue)

        tBody.appendChild(tr)
    }
 
    $(".currencyTable tbody").paginathing({
        perPage: 5,
        containerClass: 'paginathingStyle',
        insertAfter: '.currencyTable tbody',
        limitPagination: 3,
        activeClass: 'activeLink'
    })
      
}



function updateTableRequest(cf) {

    let req = new XMLHttpRequest()

    req.open("GET", `https://api.exchangeratesapi.io/latest?base=${cf}&access_key=9d88f664362c90bba4aff246e1c9bbaf`)

    req.onreadystatechange = () => {
        if (req.readyState == 4) {
            if (req.status == 200) {
                
                let data = JSON.parse(req.responseText)
                updateTable(data["rates"], cf)
                latestSpanCur.innerText = `(${cf})`
            }
        }
    }

    req.send()
}


currencyFrom.oninput = function() {
    let {currencyFrom: cf} = getCurrencyFromTo()
    updateTableRequest(cf)
}




currencyBase.addEventListener("input", chartMethod)
currencyFollow.addEventListener("input", chartMethod)
selectMonth.addEventListener("input", chartMethod)


var validateHistogramFields = () => {
    
    let cb = currencyBase.options[currencyBase.selectedIndex].value
    let cf = currencyFollow.options[currencyFollow.selectedIndex].value
    let m = selectMonth.value

    let res1 = cb === cf ? false : true
    
    let dateNow = new Date()
    dateNow = dateNow.toISOString().slice(0, 10)

    let res2 = m > dateNow ? false : true

    let res3 = m == "" ? false : true

    if (res1 && res2 && res3) {
        return true
    }

    return false
}


function getChartFieldsData() {
    let chartData = {}
    chartData.currencyBase = currencyBase.options[currencyBase.selectedIndex].value
    chartData.currencyFollow = currencyFollow.options[currencyFollow.selectedIndex].value
    chartData.selectMonth = selectMonth.value

    return chartData
}




function findRequiredData(rates, cfw) {
    
    let res = {}

    for (let rate in rates) {
        

        for (let currency in rates[rate]) {


            if(currency == cfw){
                // let r = rate.split("-")
                // r = r[1] + "." + r[2]
                // r = new Date(r[0], r[1], r[2])
                // res[r] = rates[rate][currency]

                res[rate] = rates[rate][currency]
                
                // res[rates[rate][currency].toString()] = r

                break
            }

        }
       
    }

    return res
}


// function drawHistogramChart(elems){

//     google.charts.load("current", {packages:["corechart"]});
//     google.charts.setOnLoadCallback(drawChart);

//     function drawChart() {
//         let data = google.visualization.arrayToDataTable(elems)

//         let options = {

//             title: 'Converter rates',
//             legend: { position: 'none' }
         
//         }

//         let chart = new google.visualization.Histogram(document.getElementById('chart_div'));
//         // chart.clearChart()
//         chart.draw(data, options);
//     }

// }


function drawHistogramChart(elems){

    elems.sort()

    let axis = []
    for (let key in elems) {
        axis.push(+key)
    }
    

    google.charts.load("current", {packages:["corechart"]});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        let data = new google.visualization.DataTable()

        data.addColumn("string", "date")
        data.addColumn("number", "value")
        
        let mass = []
        for (let key in elems) {

            for (let t in elems[key]) {

                let d = elems[key][0].split("-")
                d = `${d[1]}-${d[2]}`
                mass.push([d, elems[key][1]])

                break;
            }
            
        }

        data.addRows(mass)

        var view = new google.visualization.DataView(data);

        let options = {
            chartArea: {'width': '80%', 'height': '77%'},
            backgroundColor: "none",
            title: 'Converter rates',
            legend: { position: 'none' },
            bar: {groupWidth: "90%"},
            // width: 780,
            // height: 480,
        }

        let chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
        chart.draw(view, options);
    }

}



function MyHistogram(cb, cfw, month) {

    let splitData = month.split("-")
    let y = parseInt(splitData[0])
    let m = parseInt(splitData[1])

    if (m == 12) {
        m = 1
        y += 1
    }
    else{
        m++
    }

    let req = new XMLHttpRequest()
    
    req.open("GET", `https://api.exchangeratesapi.io/history?start_at=${month}-01&end_at=${y}-${m}-01&base=${cb}&access_key=9d88f664362c90bba4aff246e1c9bbaf`)

    req.onreadystatechange = () => {
        if (req.readyState == 4) {
            if (req.status == 200) {
                
                let data = JSON.parse(req.responseText)

                let elems = findRequiredData(data["rates"], cfw)

                let mass = Object.keys(elems).map((key) => [key, elems[key]]);

                drawHistogramChart(mass)
            }
        }
    }

    req.send()

}

function chartMethod() {

    if(!validateHistogramFields()) { return }

    let {currencyBase: cb, currencyFollow: cfw, selectMonth: month} = getChartFieldsData()

    MyHistogram(cb, cfw, month)

    
}

window.onresize = function(){
    chartMethod()
}
