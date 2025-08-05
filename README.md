# Professional Invoice Management System

A modern, feature-rich invoice management application built with React, TypeScript, and Tailwind CSS. Create, manage, and export professional invoices with ease.

## Features

### 📄 Invoice Management
- Create and edit professional invoices
- Duplicate existing invoices for quick setup
- Multiple invoice statuses (Draft, Sent, Paid, Overdue)
- Automatic invoice numbering
- Support for multiple currencies (USD, GBP)

### 👥 Client Management
- Save and reuse client information
- Support for both individual clients and companies
- Quick client selection when creating invoices
- Comprehensive client database

### 🏢 Company Settings
- Configure your company information
- Add payment details (bank account info)
- Consistent branding across all invoices

### 📊 Advanced Features
- Real-time calculations with tax support
- Professional invoice preview
- PDF export functionality
- Print-ready invoice layouts
- Data backup and restore
- Responsive design for all devices

### 🎨 Professional Design
- Clean, modern interface
- Professional invoice templates
- Consistent typography and spacing
- Print-optimized layouts
- Smooth animations and transitions

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **PDF Generation**: jsPDF + html2canvas
- **Date Handling**: date-fns
- **Build Tool**: Vite
- **Storage**: Local Storage (client-side)

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd invoice-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Initial Setup
1. Navigate to **Settings** and configure your company information
2. Add your payment details if you want them to appear on invoices
3. Go to **Clients** and add your client information

### Creating Invoices
1. Click **Create Invoice** or navigate to the Create tab
2. Select a client from your saved clients
3. Add invoice items with descriptions, quantities, and prices
4. Set tax rate, payment terms, and due date
5. Add any additional notes
6. Preview your invoice before saving
7. Save and optionally export to PDF

### Managing Invoices
- View all invoices in the **All Invoices** tab
- Filter by status, date range, or search by client name
- Edit, duplicate, or delete invoices as needed
- Export individual invoices to PDF

### Data Management
- Export all your data as a backup file
- Import previously exported data to restore information
- All data is stored locally in your browser

## Project Structure

```
src/
├── components/          # React components
│   ├── Navigation.tsx   # Main navigation
│   ├── InvoiceForm.tsx  # Invoice creation/editing
│   ├── InvoiceList.tsx  # Invoice listing and management
│   ├── InvoicePreview.tsx # Invoice preview and printing
│   ├── Contacts.tsx     # Client management
│   ├── Settings.tsx     # App settings and company info
│   └── Toast.tsx        # Notification system
├── types/               # TypeScript type definitions
│   └── invoice.ts       # Invoice-related types
├── utils/               # Utility functions
│   ├── calculations.ts  # Invoice calculations
│   ├── fileStorage.ts   # Local storage operations
│   └── pdfExport.ts     # PDF generation
├── hooks/               # Custom React hooks
│   └── useLocalStorage.ts
└── App.tsx              # Main application component
```

## Features in Detail

### Invoice Creation
- Automatic invoice numbering
- Real-time total calculations
- Tax rate configuration
- Multiple payment terms
- Item-based billing with quantities and rates

### Client Management
- Reusable client profiles
- Support for both individuals and companies
- Quick selection during invoice creation
- Comprehensive contact information storage

### Professional Output
- Clean, professional invoice design
- Print-ready layouts
- PDF export with proper formatting
- Consistent branding elements

### Data Persistence
- All data stored locally in browser
- Export/import functionality for backups
- No server required - fully client-side

## Browser Compatibility

This application works in all modern browsers that support:
- ES6+ JavaScript features
- Local Storage API
- Modern CSS features (Grid, Flexbox)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Built with ❤️ using React, TypeScript, and Tailwind CSS