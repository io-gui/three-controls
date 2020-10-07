# Improved three.js controls build with TypeScript

## Installation

Add `@io-gui` to your .npmrc:
`@io-gui:registry=https://npm.pkg.github.com/io-gui`

Install `@io-gui` and `three` with yarn or npm:

```bash
# With yarn:
yarn add -D @io-gui/three-controls
yarn add -D three

# With npm:
npm i  --save-dev three-controls
npm i  --save-dev three
```

## Development

Development tooling in this repository is setup in such way that compiled **.js** and **.d.ts** files and can be contributed back to **three.js/examples/jsm/controls**. For this to work, the expected directory stucture is:

```
.
└── @io─gui
│   └── three-controls
└── three
```

### Dev commands:

- `yarn build` - builds in **build/** directory and corrects `import` paths.
- `yarn dev:build` - continuously builds to **build/** directory with source mapping.
- `yarn build:three` - builds to **three**  and corrects `import` paths and **mdcs** code style.
- `yarn dev:three` - continuously builds to three with source mapping.