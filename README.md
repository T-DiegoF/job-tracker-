# Job Scraper

This project is a job scraping application built with Next.js that fetches job offers from various job boards based on specific keywords. The application is designed to display job listings for roles such as "backend developer," "software engineer," "Node.js," and "Nest.js."

## Features

- Scrapes job offers from Bumeran, Computrabajo, and ZonaJobs.
- Displays job listings in a user-friendly grid layout.
- Each job listing includes details such as title, company, and source.

## Project Structure

```
jobs-scraper
├── src
│   ├── pages
│   │   ├── api
│   │   │   └── jobs.ts        # API route for fetching job offers
│   │   ├── _app.tsx           # Custom App component
│   │   └── index.tsx          # Main entry point of the application
│   ├── components
│   │   ├── JobCard.tsx        # Component for displaying individual job offers
│   │   └── JobGrid.tsx        # Component for displaying job offers in a grid
│   ├── lib
│   │   ├── scraper.ts          # Logic for scraping job offers
│   │   └── keywords.ts         # Keywords used for scraping
│   └── types
│       └── job.ts              # TypeScript interface for job objects
├── public
│   └── index.html              # HTML template for the application
├── package.json                 # npm configuration file
├── tsconfig.json               # TypeScript configuration file
├── next.config.js              # Next.js configuration file
├── vercel.json                 # Vercel deployment configuration
└── README.md                   # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd jobs-scraper
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage

- The application will automatically fetch job offers based on the specified keywords when you access the main page.
- Click on any job listing to view more details.

## Deployment

This application can be deployed on Vercel. Ensure that you have the necessary environment variables set up in the Vercel dashboard if required.

## Contributing

Feel free to submit issues or pull requests for any improvements or bug fixes.