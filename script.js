// Tax rates set by ZRA
const NAPSA_RATE = 0.05;  // This is 5% for pension
const NHIMA_RATE = 0.01;  // This is 1% for health insurance

// Tax bands for 2026 - these determine how much tax you pay
const TAX_BANDS = [
    { min: 0, max: 5100, rate: 0 },          // First K5,100 is tax-free
    { min: 5100.01, max: 7100, rate: 0.20 }, // Next portion taxed at 20%
    { min: 7100.01, max: 9200, rate: 0.30 }, // Next portion taxed at 30%
    { min: 9200.01, max: 999999, rate: 0.37 }// Anything above taxed at 37%
];

// This function calculates PAYE tax using the progressive tax system
// It goes through each band and calculates tax for the amount in that band
function calculateTax(income) {
    let tax = 0;
    
    // Loop through each tax band
    for (let i = 0; i < TAX_BANDS.length; i++) {
        if (income > TAX_BANDS[i].min) {
            
            let taxableAmount = 0;
            
            // Figure out how much income falls in this band
            if (income > TAX_BANDS[i].max) {
                // Income is higher than this band, so tax the whole band
                taxableAmount = TAX_BANDS[i].max - TAX_BANDS[i].min;
            } else {
                // Income stops in this band, so only tax up to the income
                taxableAmount = income - TAX_BANDS[i].min;
            }
            
            // Add the tax for this band to our total
            tax = tax + (taxableAmount * TAX_BANDS[i].rate);
        }
    }
    
    return tax;
}

// Main calculation function - this runs every time you type in an input
// It calculates everything from gross pay to net salary
function calculate() {
    // Get the values from the input fields (or 0 if empty)
    let basicPay = parseFloat(document.getElementById('basicPay').value) || 0;
    let allowances = parseFloat(document.getElementById('allowances').value) || 0;
    let statutory = parseFloat(document.getElementById('statutoryContribution').value) || 0;
    
    // Step 1: Calculate gross pay (basic + allowances)
    let grossPay = basicPay + allowances;
    
    // Step 2: Calculate statutory deductions
    let napsa = grossPay * NAPSA_RATE;  // 5% for pension
    let nhima = grossPay * NHIMA_RATE;  // 1% for health insurance
    let totalContributions = napsa + nhima;
    
    // Step 3: Calculate taxable income (gross minus contributions and statutory)
    let taxableIncome = grossPay - totalContributions - statutory;
    
    // Step 4: Calculate PAYE tax using our tax function
    let paye = calculateTax(taxableIncome);
    
    // Step 5: Calculate total deductions and net salary
    let totalDeductions = totalContributions + paye + statutory;
    let netSalary = grossPay - totalDeductions;
    
    // Now update all the display fields with the calculated values
    document.getElementById('grossPay').textContent = 'K ' + Math.round(grossPay).toLocaleString();
    document.getElementById('napsa').textContent = 'K ' + Math.round(napsa).toLocaleString();
    document.getElementById('nhima').textContent = 'K ' + Math.round(nhima).toLocaleString();
    document.getElementById('totalContributions').textContent = 'K ' + Math.round(totalContributions).toLocaleString();
    document.getElementById('totalTaxDeductions').textContent = 'K ' + Math.round(paye).toLocaleString();
    document.getElementById('totalDeductions').textContent = 'K ' + Math.round(totalDeductions).toLocaleString();
    document.getElementById('netSalary').textContent = 'K ' + Math.round(netSalary).toLocaleString();
    
    // Show the tax breakdown table if there's a salary entered
    if (basicPay > 0) {
        showTaxTable(taxableIncome);
    }
}

// This function creates and displays the tax breakdown table
// It shows exactly how the tax was calculated for each band
function showTaxTable(income) {
    let tbody = document.getElementById('taxBandsBody');
    tbody.innerHTML = '';  // Clear any old rows first
    
    // Create a row for each tax band
    for (let i = 0; i < TAX_BANDS.length; i++) {
        let incomeInBand = 0;
        let taxInBand = 0;
        
        // Calculate values for this specific band
        if (income > TAX_BANDS[i].min) {
            if (income > TAX_BANDS[i].max) {
                incomeInBand = TAX_BANDS[i].max - TAX_BANDS[i].min;
            } else {
                incomeInBand = income - TAX_BANDS[i].min;
            }
            taxInBand = incomeInBand * TAX_BANDS[i].rate;
        }
        
        // Create the table row with all the data
        let row = document.createElement('tr');
        row.innerHTML = 
            '<td>K' + TAX_BANDS[i].min.toFixed(2) + ' - K' + TAX_BANDS[i].max.toFixed(2) + '</td>' +
            '<td>' + Math.round(incomeInBand) + '</td>' +
            '<td>' + (TAX_BANDS[i].rate * 100) + '%</td>' +
            '<td>' + Math.round(taxInBand) + '</td>';
        
        tbody.appendChild(row);
    }
    
    // Show the table section
    document.getElementById('taxBandsSection').classList.add('show');
}

// Clear all inputs and reset everything to zero
function clearAll() {
    // Clear the input fields
    document.getElementById('basicPay').value = '';
    document.getElementById('allowances').value = '';
    document.getElementById('statutoryContribution').value = '';
    
    // Reset all the result displays back to K 0
    document.getElementById('grossPay').textContent = 'K 0';
    document.getElementById('napsa').textContent = 'K 0';
    document.getElementById('nhima').textContent = 'K 0';
    document.getElementById('totalContributions').textContent = 'K 0';
    document.getElementById('totalTaxDeductions').textContent = 'K 0';
    document.getElementById('totalDeductions').textContent = 'K 0';
    document.getElementById('netSalary').textContent = 'K 0';
    
    // Hide the tax table
    document.getElementById('taxBandsSection').classList.remove('show');
    
    // Put the cursor back in the first input field
    document.getElementById('basicPay').focus();
}

// This makes sure users can only type numbers and one decimal point
// It removes any letters or special characters as they type
function cleanInput(event) {
    let value = event.target.value;
    // Remove everything except numbers and decimal points
    value = value.replace(/[^0-9.]/g, '');
    
    // Make sure there's only one decimal point
    let parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts[1];
    }
    
    event.target.value = value;
}

// Connect our functions to the HTML elements
// These event listeners watch for user actions and call our functions

document.getElementById('basicPay').addEventListener('input', cleanInput);
document.getElementById('basicPay').addEventListener('input', calculate);

document.getElementById('allowances').addEventListener('input', cleanInput);
document.getElementById('allowances').addEventListener('input', calculate);

document.getElementById('statutoryContribution').addEventListener('input', cleanInput);
document.getElementById('statutoryContribution').addEventListener('input', calculate);

// When the clear button is clicked, run the clearAll function
document.getElementById('clearBtn').addEventListener('click', clearAll);

// Prevent the form from submitting (which would refresh the page)
document.getElementById('payeForm').addEventListener('submit', function(e) {
    e.preventDefault();
});

// When the page loads, put the cursor in the first input field
window.addEventListener('load', function() {
    document.getElementById('basicPay').focus();
});

// That's it! The calculator is ready to use.
