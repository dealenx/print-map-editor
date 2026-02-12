# Print Map Editor

A web application for creating printable maps. Select paper size, orientation, and DPI, then export high-resolution PNG maps ready for printing.

![Print Map Editor Screenshot](https://github.com/user-attachments/assets/05ef7635-a164-4197-8420-a846a61e21c6)

## Features

- Interactive map with OpenStreetMap data via OpenFreeMap (no API key required)
- Paper sizes: A2, A3, A4, A5, Letter, Legal
- Orientation: Portrait / Landscape
- DPI: 150 / 300
- Map styles: Positron (light), Bright, Liberty
- Location search via Nominatim
- PNG export with exact dimensions for printing

## Tech Stack

- React + TypeScript + Vite
- Maplibre GL JS v5
- Tailwind CSS v4
- shadcn/ui components

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Or with devbox:

```bash
devbox run dev
```

## Usage

1. Search for a location or pan/zoom the map
2. Select paper size and orientation
3. Adjust the map so the desired area is within the red dashed frame
4. Choose DPI (300 for high quality print, 150 for smaller file size)
5. Click "Export PNG" to download the map

## License

MIT
