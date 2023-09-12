// const schedule = [
//     {start: 10.5, end: 12, name: '做饭、吃饭'},
//     {start: 12, end: 14, name: '看电影刷视频'},
//     {start: 14, end: 15, name: '健身'},
//     {start: 15, end: 16, name: '逛街出去玩'},
//     {start: 16, end: 18, name: '做饭、吃饭'},
//     {start: 18, end: 20, name: '学习'},
//     {start: 20, end: 22, name: '创作'},
//     {start: 22, end: 23.5, name: '洗澡'},
//     {start: 23.5, end: 10.5 + 24, name: '睡觉'}
// ];

const schedule = [
    {start: 10.5, end: 12, name: '吃饭'},
    {start: 12, end: 16.5, name: '玩手机'},
    {start: 16.5, end: 18, name: '吃饭'},
    {start: 18, end: 22, name: '玩手机'},
    {start: 22, end: 23.5, name: '洗澡'},
    {start: 23.5, end: 10.5 + 24, name: '睡觉'}
];

function timeStringToFloat(timeString) {
    const parts = timeString.toString().split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    let r = hours + minutes / 60;
    return r;
}

function floatToTimeString(floatTime) {
    floatTime = floatTime % 24;
    const hours = Math.floor(floatTime);
    const minutes = Math.round((floatTime - hours) * 60);
    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${formattedHours}:${formattedMinutes}`;
}

function draw(schedule) {
    //console.log(schedule)
    d3.select("#clock").selectAll("*").remove();
    const width = 500;
    const height = 500;
    const radius = Math.min(width, height) / 2;
    const centerX = width / 2;
    const centerY = height / 2;
    const hours = 24;

    const svg = d3.select("#clock")
        .attr("width", width)
        .attr("height", height);

    const clockScale = d3.scaleLinear()
        .domain([0, hours])
        .range([0, 2 * Math.PI]);

    const clockTicks = d3.range(0, hours * 2).map(d => {
        const angle = clockScale(d / 2) - Math.PI / 2;
        const isHalfHour = d % 2 !== 0;
        const tickLength = isHalfHour ? 10 : 0;
        const x1 = centerX + Math.cos(angle) * (radius - tickLength);
        const y1 = centerY + Math.sin(angle) * (radius - tickLength);
        const x2 = centerX + Math.cos(angle) * radius;
        const y2 = centerY + Math.sin(angle) * radius;
        return {x1, y1, x2, y2, hour: d / 2, isHalfHour};
    });

    svg.selectAll(".clock-tick")
        .data(clockTicks)
        .enter().append("line")
        .attr("class", d => d.isHalfHour ? "half-hour-tick" : "hour-tick")
        .attr("x1", d => d.x1)
        .attr("y1", d => d.y1)
        .attr("x2", d => d.x2)
        .attr("y2", d => d.y2)
        .attr("stroke", "gray");

    svg.selectAll(".clock-label")
        .data(clockTicks.filter(d => !d.isHalfHour))
        .enter().append("text")
        .attr("class", "clock-label")
        .attr("x", d => centerX + Math.cos(clockScale(d.hour) - Math.PI / 2) * (radius - 10))
        .attr("y", d => centerY + Math.sin(clockScale(d.hour) - Math.PI / 2) * (radius - 10))
        .attr("text-anchor", "middle")
        .attr("dy", "0.3em")
        .text(d => d.hour);

    const hourPoints = d3.range(0, hours).map(d => {
        const angle = clockScale(d) - Math.PI / 2;
        const x = centerX + Math.cos(angle) * (radius - 30); // 调整半径以控制黑点的位置
        const y = centerY + Math.sin(angle) * (radius - 30);
        return {x, y};
    });

    svg.selectAll(".hour-point")
        .data(hourPoints)
        .enter().append("circle")
        .attr("class", "hour-point")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 3)
        .attr("fill", "black");

    const arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius - 30)
        .startAngle(d => clockScale(d.start))
        .endAngle(d => clockScale(d.end));

    svg.selectAll(".schedule-arc")
        .data(schedule)
        .enter().append("path")
        .attr("class", "schedule-arc")
        .attr("d", arcGenerator)
        .attr("transform", `translate(${centerX},${centerY})`)
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("stroke-width", 1);

    svg.selectAll(".schedule-label")
        .data(schedule)
        .enter().append("text")
        .attr("class", "schedule-label")
        .attr("transform", d => {
            const startAngle = clockScale(d.start) - Math.PI / 2;
            const endAngle = clockScale(d.end) - Math.PI / 2;
            const labelRadius = (radius - 50) / 1;
            const labelAngle = (startAngle + endAngle) / 2;
            const x = centerX + Math.cos(labelAngle) * labelRadius;
            const y = centerY + Math.sin(labelAngle) * labelRadius;
            return `translate(${x},${y})`;
        })
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text(d => d.name);


    const currentTimeDot = svg.append("circle")
        .attr("class", "current-time-dot")
        .attr("r", 5)
        .attr("fill", "red");

    function updateCurrentTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const totalMinutes = hours * 60 + minutes + seconds / 60;
        const currentAngle = clockScale(totalMinutes / 60) - Math.PI / 2;
        const x = centerX + Math.cos(currentAngle) * (radius - 30);
        const y = centerY + Math.sin(currentAngle) * (radius - 30);
        svg.selectAll(".schedule-arc")
            .attr("fill", function (d) {
                //console.log("totalMinutes==" + totalMinutes + ",d.start==" + d.start * 60 + ",d.end==" + d.end * 60)
                if (totalMinutes >= d.start * 60 && totalMinutes <= d.end * 60) {
                    return "rgba(44, 160, 44, 0.3)";
                } else if (totalMinutes + 1440 >= d.start * 60 && totalMinutes + 1440 <= d.end * 60) {
                    return "rgba(44, 160, 44, 0.3)";
                } else {
                    return "rgb(245,245,245,0.5)";
                }
            });
        currentTimeDot.attr("cx", x).attr("cy", y);

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const formattedDateTime = `${year}-${month}-${day} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.getElementById("currentTime").textContent = formattedDateTime;
    }

    setInterval(updateCurrentTime, 1000);
    updateCurrentTime();
}

function calculateTotalDuration() {
    let totalDuration = 0;
    schedule.forEach(item => {
        totalDuration += item.end - item.start;
    });
    return totalDuration.toFixed(2);
}

function renderSchedule() {
    console.log("render")
    const scheduleTable = $("#scheduleTable");
    scheduleTable.empty();
    schedule.forEach((item, index) => {
        const rowNumber = index + 1;
        const duration = floatToTimeString(item.end - item.start);
        const row = `
                    <tr ${item.isOverlap ? 'class="table-danger"' : ''}>
                        <td>${rowNumber}</td>
                        <td>
                            <div class="input-group">
                                <input type="text" disabled class="form-control" value="${floatToTimeString(item.start)}" onchange="updateSchedule(${index}, 'start', this.value)">
                                <div class="input-group-append">
                                    <button class="btn btn-outline-secondary" onclick="adjustTime(${index}, 'start', -30)">‹</button>
                                    <button class="btn btn-outline-secondary" onclick="adjustTime(${index}, 'start', 30)">›</button>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="input-group">
                                <input type="text" disabled class="form-control" value="${floatToTimeString(item.end)}" onchange="updateSchedule(${index}, 'end', this.value)">
                                <div class="input-group-append">
                                    <button class="btn btn-outline-secondary" onclick="adjustTime(${index}, 'end', -30)">‹</button>
                                    <button class="btn btn-outline-secondary" onclick="adjustTime(${index}, 'end', 30)">›</button>
                                </div>
                            </div>
                        </td>
                        <td>${duration}</td>
                        <td>
                            <div class="input-group">
                                 <input type="text" class="form-control" value="${item.name}" onchange="updateSchedule(${index}, 'name', this.value)" oninput="onInputChange(${index})">
                                 <div class="input-group-append">
                                    <button id="editButton-${index}" class="btn btn-sm btn-outline-secondary hide-button" onclick="renderSchedule()">✓</button>
                                 </div>
                            </div>
                        </td>
                        <td>
                        <div class="input-group d-flex justify-content-center">
                            <div class="input-group-append">
                                <button class="btn btn-sm btn-outline-secondary" onclick="deleteRow(${index})">×</button>
                                <button class="btn btn-sm btn-outline-secondary" onclick="moveRowUp(${index})">↑</button>
                                <button class="btn btn-sm btn-outline-secondary" onclick="moveRowDown(${index})">↓</button>
                                <button class="btn btn-sm btn-outline-secondary" onclick="addRow(${index + 1})">+</button>
                            </div>
                        </div>
                        </td>
                    </tr>
                `;
        scheduleTable.append(row);
    });
    const totalDuration = calculateTotalDuration();
    $("#totalDuration").css("color", totalDuration > 24 ? "red" : totalDuration == 24 ? "green" : "");
    $("#totalDuration").text(`时长(${totalDuration}h)`);
    draw(schedule);
}


function moveRowUp(index) {
    if (index > 0) {
        const temp = schedule[index];
        schedule[index] = schedule[index - 1];
        schedule[index - 1] = temp;
        renderSchedule();
    }
}

function moveRowDown(index) {
    if (index < schedule.length - 1) {
        const temp = schedule[index];
        schedule[index] = schedule[index + 1];
        schedule[index + 1] = temp;
        renderSchedule();
    }
}

function updateSchedule(index, field, value) {
    if (field === 'start' || field === 'end') {
        let newTime = timeStringToFloat(value);
        schedule[index][field] = newTime;
        if (schedule[index].start > schedule[index].end) {
            schedule[index].end += 24;
        }
        renderSchedule();
    } else if (field === 'name') {
        schedule[index][field] = value.toString().trim();
        renderSchedule();
    }
    const editButton = document.querySelector(`#editButton-${index}`);
    editButton.classList.add("hide-button");
}

function handleOverlapping(index) {
    console.log("index==" + index)
    console.log(schedule)
    const overlappingRows = [];
    schedule.forEach((item, i) => {
        if (i !== index) {
            let start = schedule[index].start;
            let end = schedule[index].end;
            if (
                (start < item.end && end > item.start) ||
                (start + 24 < item.end && end + 24 > item.start) ||
                (start - 24 < item.end && end - 24 > item.start)
            ) {
                overlappingRows.push(i);
                if (!overlappingRows.includes(index)) {
                    overlappingRows.push(index);
                }
            }
        }
    });
    overlappingRows.forEach((rowIndex) => {
        schedule[rowIndex].isOverlap = true;
    });
    schedule.forEach((item, i) => {
        if (!overlappingRows.includes(i)) {
            schedule[i].isOverlap = false;
        }
    });
}

function adjustTime(index, field, minutes) {
    const timeInput = field === 'start' ? schedule[index].start : schedule[index].end;
    let adjustedTime = timeInput + minutes / 60;
    if (adjustedTime < 0) {
        adjustedTime += 24;
    }
    if (field === 'start') {
        schedule[index].start = adjustedTime;
    } else {
        schedule[index].end = adjustedTime;
    }
    if (schedule[index].start > schedule[index].end) {
        schedule[index].end += 24;
    }
    if (schedule[index].end - schedule[index].start >= 24) {
        schedule[index].end = schedule[index].end % 24;
        schedule[index].start = schedule[index].start % 24;
    }
    handleOverlapping(index);
    renderSchedule();
}

function deleteRow(index) {
    schedule.splice(index, 1);
    renderSchedule();
}

function addRow(index) {
    if (schedule.length < 20) {
        schedule.splice(index, 0, {start: 0, end: 0, name: ''});
        handleOverlapping(index);
        renderSchedule();
    } else {
        alert("最多20行~");
    }
    //console.log(schedule)
}

function onInputChange(index) {
    const editButton = document.querySelector(`#editButton-${index}`);
    editButton.classList.remove("hide-button");
}
