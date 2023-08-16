let principalEle = document.getElementById("principal");
let annualExpensesEle = document.getElementById("annualExpenses");
let stableIncomeEle = document.getElementById("stableIncome");
let annualInterestRateEle = document.getElementById('annualInterestRate');
let inflationRateEle = document.getElementById('inflationRate');
let startYearEle = document.getElementById("startYear");
let currentSystemYear = new Date().getFullYear() + 1;

function limitInputLength(input, maxLength) {
    if (input.value.length > maxLength) {
        input.value = input.value.slice(0, maxLength);
    }
}

function updatePrincipalDisplay() {
    let value = parseInt(principalEle.value.replace(/\D/g, ''));
    principalEle.value = value;
    document.getElementById("principalDisplay").textContent = (value / 10000) + "万";
}

function updateMonthlyExpensesDisplay() {
    const value = parseFloat(annualExpensesEle.value.replace(/\D/g, ''));
    annualExpensesEle.value = value;
    document.getElementById("monthlyExpensesDisplay").textContent = (value / 10000) + "万, 月均:" + (value / 12).toFixed(2);
}

function updateStableIncomeDisplay() {
    const value = parseFloat(stableIncomeEle.value.replace(/\D/g, ''));
    stableIncomeEle.value = value;
    document.getElementById("stableIncomeDisplay").textContent = value == 0 ? "无" : (value / 10000) + "万, 月均:" + (value / 12).toFixed(2);
}

function incrementInterestRate() {
    annualInterestRateEle.stepUp();
    calculateInterest();
}

function decrementInterestRate() {
    annualInterestRateEle.stepDown();
    calculateInterest();
}

function incrementPrincipal() {
    principalEle.stepUp();
    updatePrincipalDisplay();
    calculateInterest();
}

function decrementPrincipal() {
    if (principalEle.value > 0) {
        principalEle.stepDown();
        updatePrincipalDisplay();
        calculateInterest();
    }
}

function incrementAnnualExpenses() {
    annualExpensesEle.stepUp();
    updateMonthlyExpensesDisplay();
    calculateInterest();
}

function decrementAnnualExpenses() {
    if (annualExpensesEle.value > 0) {
        annualExpensesEle.stepDown();
        updateMonthlyExpensesDisplay();
        calculateInterest();
    }
}

function incrementInflationRate() {
    inflationRateEle.stepUp();
    calculateInterest();
}

function decrementInflationRate() {
    inflationRateEle.stepDown();
    calculateInterest();
}

function resetInflationRate() {
    inflationRateEle.value = 0;
    calculateInterest();
}

function incrementStableIncome() {
    stableIncomeEle.stepUp();
    updateStableIncomeDisplay();
    calculateInterest();
}

function decrementStableIncome() {
    if (stableIncomeEle.value > 0) {
        stableIncomeEle.stepDown();
        updateStableIncomeDisplay();
        calculateInterest();
    }
}

function resetStableIncome() {
    if (stableIncomeEle.value > 0) {
        stableIncomeEle.value = 0;
        updateStableIncomeDisplay();
        calculateInterest();
    }
}

function incrementStartYear() {
    if (startYearEle.value == "") {
        startYearEle.value = currentSystemYear;
    } else {
        startYearEle.stepUp();
    }
    calculateInterest(true);
}

function decrementStartYear() {
    if (startYearEle.value == "") {
        startYearEle.value = currentSystemYear;
    } else {
        startYearEle.stepDown();
    }
    calculateInterest(true);
}

function resetStartYear() {
    startYearEle.value = "";
    calculateInterest(true);
}

function showAlert(errors) {
    let errorList = $('#errorList');
    errorList.empty();
    $.each(errors, function (index, message) {
        errorList.append('<li>' + message + '</li>');
    });
    $('#alertModal').modal('show');
}

function drawLineChart(years, interests, principals, expenses) {
    if (lineChart) {
        lineChart.destroy();
    }
    let ctx = document.getElementById("lineChart").getContext('2d');
    let gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(214, 39, 40, 0.3)');
    gradient.addColorStop(1, 'rgba(214, 39, 40, 0.1)');
    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: '年利息',
                data: interests,
                borderColor: 'rgba(31, 119, 180, 1)',
                backgroundColor: 'rgba(31, 119, 180, 0.2)',
                fill: true,
            }, {
                label: '消费',
                data: expenses,
                borderColor: 'rgba(44, 160, 44, 1)',
                backgroundColor: 'rgba(44, 160, 44, 0.2)',
                fill: true,
            }, {
                label: '本金',
                data: principals,
                borderColor: 'rgba(214, 39, 40, 1)',
                backgroundColor: gradient,
                fill: true,
            }]
        }
    });
}

$(document).ready(function () {
    $(document).on('click', 'td', function () {
        let clickedCell = $(this);
        let clickedRow = clickedCell.closest('tr');


        // 检查是否为第一行或本金为0的行
        if (parseFloat(clickedRow.find('.principal-cell').text()) > 0) {

            // 检查是否点击的是刚刚生成的详细计算行
            if (!clickedRow.hasClass('detailed-calculation')) {
                $('.detailed-calculation').remove();
            }

            // 计算详细值
            let lastAnnualInterest = parseFloat(clickedRow.find('.interest-cell').text());
            let annualExpenses = parseFloat(clickedRow.find('.annual-expenses-cell').text());

            let firstRow = clickedRow.is(':first-child');
            let lastPrincipal = parseFloat(firstRow ? principalEle.value.toString() : clickedRow.prev().find('.principal-cell').text());
            let lastAnnualExpenses = parseFloat(firstRow ? annualExpensesEle.value.toString() : clickedRow.prev().find('.annual-expenses-cell').text());

            let annualInterestCalculation = `${lastPrincipal.toFixed(2)} × ${annualInterestRateEle.value}%`;
            let annualExpensesCalculation = `(1 + ${inflationRateEle.value.toString()}%) × ${((firstRow ? 1 : -1) * lastAnnualExpenses).toFixed(2)}`;
            let principalCalculation = `${lastPrincipal.toFixed(2)} + ${lastAnnualInterest.toFixed(2)} + ${stableIncomeEle.value} - ${(-1 * annualExpenses).toFixed(2)}`;

            // 创建新的行以显示详细计算结果interestCell.classList.add("interest-cell", "text-center");
            let newRowHtml = `
                <tr class="detailed-calculation">
                    <td></td>
                    <td class="text-center">= ${annualInterestCalculation}</td>
                    <td class="text-center">= ${annualExpensesCalculation}</td>
                    <td class="text-center">= ${principalCalculation}</td>
                </tr>
            `;
            // 在点击行的后面插入新行
            clickedRow.after(newRowHtml);
        }
    });
});
