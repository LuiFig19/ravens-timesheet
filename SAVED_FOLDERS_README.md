# Saved Folders Feature Documentation

## Overview
The Saved Folders feature provides a comprehensive document management system for the Ravens TimeSheet application. It organizes all uploaded files and timesheets by employee, with advanced search capabilities and cross-system integration.

## Features

### 🗂️ Top Folder Button
- **Location**: Prominent button at the top of the Saved Folders page
- **Function**: Opens a popup window showing all submitted documents
- **Sorting**: Documents are sorted by newest first
- **Information Displayed**:
  - 📁 File/document name
  - 📅 Date
  - 🧾 Work Order (when available)
  - 👤 Employee name
  - 📊 Processing status

### 🔍 Search Functionality
- **Real-time filtering** across multiple fields:
  - Document name
  - Date
  - Work Order
  - Employee name
- **Clear search** button to reset filters
- **Responsive design** for mobile devices

### 👥 Employee-Based Organization
- **Dynamic employee list** populated from:
  - Attendance data
  - New files with previously unknown employee names
- **Collapsible employee cards** with:
  - Employee name and file count
  - Expandable list of associated files
  - Download/view buttons for each file

### 🔄 Auto-Add Logic
- **New employee detection**: When a file is saved with an unknown employee name
- **Automatic creation**: New employee entries are created across:
  - Saved Folders
  - Attendance system
  - Job tracking
- **Cross-system sync**: Updates reflect in all related systems

## Database Integration

### PostgreSQL Tables
- **uploaded_files**: Enhanced with new fields:
  - `employee_name`: VARCHAR(255)
  - `work_order`: VARCHAR(100)
  - `extracted_data`: JSONB for OCR results
- **Indexes** for performance:
  - Employee name
  - Work order
  - Creation date
  - Processing status

### API Endpoints
- `GET /api/uploads` - List all uploaded files
- `GET /api/uploads/:id/download` - Download specific file
- `GET /api/timesheets` - List all timesheets with entries
- `GET /api/employees` - List all employees

## Timesheet Processing (OCR → Spreadsheet + Stats)

### OCR Processing
When a timesheet image is captured:
1. **OCR extraction** of:
   - Hours worked
   - Job number
   - Employee name
   - Work entries

### Automatic Actions
- **Database storage**: All extracted data saved to PostgreSQL
- **PDF generation**: Downloadable timesheet PDF
- **Spreadsheet creation**: CSV export with:
  - Total hours worked vs job budget hours
  - Percentages and decimal hours
  - Actual vs budget hour comparisons
  - Highlighted differences

### File Types Supported
- 📝 Timesheets (processed OCR data)
- 📄 PDF files
- 📷 Image files (JPEG, PNG)
- 📊 CSV/Excel files
- 📁 Generic files

## Cross-System Integration

### Systems Connected
1. **Attendance System**: Employee data sync
2. **Job Manager**: Work order and budget tracking
3. **Database**: Centralized storage and indexing
4. **File Storage**: Upload and download management

### Data Flow
```
Upload → OCR Processing → Database Storage → Cross-System Sync
  ↓
Employee Creation → File Association → Search/Retrieval
```

## User Interface

### Main Page Layout
1. **Header**: Ravens logo and title
2. **Top Folder Button**: Access to all documents
3. **Search Bar**: Real-time filtering
4. **Employee Cards**: Collapsible file organization
5. **Action Buttons**: Navigation and controls

### Modal Popup
- **Document List**: Scrollable list of all files
- **Search Integration**: Filter within popup
- **Download Actions**: Direct file access
- **Status Indicators**: Processing status with color coding

### Mobile Responsiveness
- **Adaptive layout** for different screen sizes
- **Touch-friendly** interface elements
- **Optimized spacing** for mobile devices
- **Collapsible sections** for better navigation

## Status Indicators

### Color Coding
- 🟢 **Green**: Completed/Approved
- 🟡 **Yellow**: Pending/Draft
- 🔴 **Red**: Error/Rejected
- ⚪ **Grey**: Unknown/Default

### Status Types
- `completed`: File processing finished
- `pending`: Processing in progress
- `error`: Processing failed
- `draft`: Timesheet in draft state
- `approved`: Timesheet approved
- `rejected`: Timesheet rejected

## File Management

### Download Capabilities
- **Direct file download** for uploaded files
- **CSV generation** for timesheets
- **PDF creation** for processed documents
- **Error handling** for failed downloads

### File Organization
- **Employee-based grouping**
- **Date-based sorting**
- **Work order association**
- **Status tracking**

## Technical Implementation

### Frontend Components
- `FoldersView.jsx`: Main component with all functionality
- **State Management**: React hooks for data and UI state
- **API Integration**: Axios for backend communication
- **Error Handling**: User-friendly error messages

### Backend Services
- **Upload Routes**: File handling and processing
- **Timesheet Routes**: Data management with entries
- **Employee Routes**: Cross-system employee management
- **Database Schema**: Optimized for performance

### Performance Optimizations
- **Indexed database queries**
- **Lazy loading** for large file lists
- **Debounced search** for better UX
- **Cached employee data**

## Usage Examples

### Adding a New Employee
1. Upload a file with new employee name
2. System automatically creates employee entry
3. File is associated with the new employee
4. Employee appears in all related systems

### Searching Documents
1. Use search bar to filter by name, date, or work order
2. Results update in real-time
3. Clear search to reset filters
4. Search works in both main view and popup

### Downloading Files
1. Click download button on any file
2. System generates appropriate file type
3. Browser downloads the file
4. Error handling for failed downloads

## Future Enhancements

### Planned Features
- **Bulk download** capabilities
- **Advanced filtering** options
- **File preview** functionality
- **Export to external systems**
- **Automated backup** scheduling

### Integration Opportunities
- **Cloud storage** integration
- **Email notifications** for processing
- **Mobile app** synchronization
- **API access** for third-party tools

## Troubleshooting

### Common Issues
1. **File not downloading**: Check file permissions and storage
2. **Search not working**: Verify database connectivity
3. **Employee not appearing**: Check OCR accuracy and data format
4. **Slow performance**: Review database indexes and query optimization

### Debug Information
- **Console logs** for API calls
- **Network tab** for request/response details
- **Database logs** for query performance
- **Error messages** in UI for user guidance 