# File Hash Calculator TESTING!!

A simple, secure browser-based tool for calculating SHA-256 hashes of files. This application runs entirely in your browser, ensuring complete privacy as your files never leave your computer.

## What it does

This software allows you to:
- Calculate SHA-256 cryptographic hashes of any file
- Process multiple files at once
- Export results as CSV
- Copy results to clipboard
- All processing happens locally in your browser

## Why use it locally?

Running this application locally provides several important benefits:

1. **Complete Privacy**: Your files never leave your computer or get uploaded to any server
2. **Security**: No risk of file interception during transmission
3. **Offline Usage**: Works without an internet connection
4. **Speed**: Faster processing, especially for large files, as there's no upload/download time
5. **Trust**: You can inspect the code and verify what it's doing

## How to run locally

### Option 1: Save from the website

1. Visit the application's website
2. Press `Ctrl+S` (Windows/Linux) or `Command+S` (Mac) to save the page
3. Choose a location on your computer and save it
4. Open the saved HTML file in your browser
5. The application will work completely offline

### Option 2: Run from source code

If you're a developer and want to run the project from source:

1. Clone the repository:
   ```bash
   git clone https://github.com/Simple-Proof/simple-proof-filehash.git
   ```

2. Navigate to the project directory:
   ```bash
   cd simple-proof-filehash
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. For production build:
   ```bash
   npm run build
   ```

## How to use

1. Drag and drop files onto the upload area, or click to select files
2. The SHA-256 hash will be calculated for each file
3. View results in the table that appears
4. Export results using the "Download CSV" button or copy to clipboard

## Technical details

- Built with Astro framework
- Uses Web Crypto API for secure hash calculation
- Implements drag-and-drop file interface
- Responsive design with dark mode support
- TypeScript for type safety

## Security considerations

- All cryptographic operations are performed using the browser's native Web Crypto API
- No external JavaScript libraries are loaded for the core functionality
- No tracking, analytics, or external requests

## License

This project is open source and available on GitHub at [https://github.com/Simple-Proof/simple-proof-filehash](https://github.com/Simple-Proof/simple-proof-filehash)
