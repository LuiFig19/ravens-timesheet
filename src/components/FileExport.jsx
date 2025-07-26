import React from 'react'

const FileExport = ({ data, onExportComplete, onBack }) => {
  const generatePDF = () => {
    // Simulate PDF generation
    const pdfContent = `
RAVENS TIME SHEET

Employee: ${data.employeeName}
Date: ${data.date}
Shift Time: ${data.shiftTime} hours

WORK ENTRIES:
${data.workEntries.map((entry, index) => `
${index + 1}. Work Order: ${entry.workOrder}
   Customer: ${entry.customer}
   Task: ${entry.description}
   Code: ${entry.code}
   Hours: ${entry.hours}
`).join('')}

Total Hours: ${data.workEntries.reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0).toFixed(1)}
    `.trim()

    const blob = new Blob([pdfContent], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.employeeName}_timesheet_${data.date}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateCSV = () => {
    const csvContent = [
      ['Employee', 'Date', 'Work Order', 'Customer', 'Task', 'Code', 'Hours'],
      ...data.workEntries.map(entry => [
        data.employeeName,
        data.date,
        entry.workOrder,
        entry.customer,
        entry.description,
        entry.code,
        entry.hours
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.employeeName}_timesheet_${data.date}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const totalHours = data.workEntries.reduce((sum, entry) => {
    return sum + (parseFloat(entry.hours) || 0)
  }, 0)

  return (
    <div className="export-container">
      <h2>📄 Export Time Sheet</h2>
      <p>Generate and download your processed time sheet</p>

      <div className="export-summary">
        <h3>Summary</h3>
        <p><strong>Employee:</strong> {data.employeeName}</p>
        <p><strong>Date:</strong> {data.date}</p>
        <p><strong>Shift Time:</strong> {data.shiftTime} hours</p>
        <p><strong>Total Hours:</strong> {totalHours.toFixed(1)} hours</p>
        <p><strong>Work Entries:</strong> {data.workEntries.length}</p>
      </div>

      <div className="export-actions">
        <button className="btn btn-primary" onClick={generatePDF}>
          📄 Download PDF
        </button>
        
        <button className="btn btn-secondary" onClick={generateCSV}>
          📊 Download CSV
        </button>
        
        <button className="btn btn-secondary" onClick={onExportComplete}>
          ✅ Complete
        </button>
        
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
      </div>
    </div>
  )
}

export default FileExport 