# Improved three.js controls build with TypeScript

## Development

Development tooling in this repository is setup to contribute compiled and restyled code to **three.js/examples/jsm/controls**.

For this to work, the expected directory stucture is:

```
.
└── three-controls
└── three
```

### Dev commands:

- `yarn build` - builds in **build/** directory.
- `yarn dev:build` - continuously builds to **build/** directory with source mapping.
- `yarn build:three` - builds to **../three/examples/jsm/controls/**  and applies **mdcs** code style.
- `yarn dev:three` - continuously builds to **../three/examples/jsm/controls/** with source mapping.