# Animaker DataGrid
## Features

- Editable grid cells
- Add/remove rows and columns
- Shift-click to select multiple cells
- Keyboard navigation (arrow keys, Enter, Tab)
- Copy/paste support
- Responsive and modern UI
- Modular component structure

## Getting Started

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/nivase56/animaker_datagrid.git
cd animaker_datagrid
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/components/DataGrid.tsx` — Main grid logic
- `app/components/DataGridHeader.tsx` — Table header
- `app/components/DataGridRow.tsx` — Table row
- `app/components/DataGridCell.tsx` — Table cell
- `app/components/DataGridControls.tsx` — Add row/column controls
- `app/components/DataGridService.ts` — Utility functions
- `app/globals.css` — Global styles

## Contributing

Pull requests and suggestions are welcome! Please follow standard code style and add clear, single-line comments only for high-priority features.

## License

MIT
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
