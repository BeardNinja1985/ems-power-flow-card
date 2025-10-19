# EMS Power Flow Card

This repository contains a custom Lovelace card for Home Assistant that visualises energy flows between your solar panels, the grid, your home and up to two battery systems. It is inspired by cards like `power-flow-card-plus`, but adds explicit support for dual batteries and flexible sign conventions.

## Features

* **Dual battery support** – display power and state-of-charge for two independent batteries.
* **Sign conventions** – configure whether your PV, grid and battery sensors report positive or negative values for generation, import or charging. The card will invert values automatically if needed.
* **Simple and lightweight** – zero runtime dependencies other than the built‑in Lit library provided by Home Assistant.

## Installation

### HACS (recommended)

1. Add this repository as a [custom repository](https://hacs.xyz/docs/faq/custom_repositories) in HACS (category: _Lovelace_).
2. Install the “EMS Power Flow Card” from HACS and click **Download**.
3. In Home Assistant, go to **Settings → Dashboards → Resources** and ensure that the resource URL points to `/hacsfiles/ems-power-flow-card/ems-power-flow-card.js` with type `module`.
4. Restart Home Assistant if required.

### Manual

1. Download the latest release from the [releases page](https://github.com/<your-github-username>/ems-power-flow-card/releases).
2. Copy `ems-power-flow-card.js` (from the `dist/` folder) into your Home Assistant `www` folder.
3. Add the following to your Lovelace resources:

   ```yaml
   - url: /local/ems-power-flow-card.js
     type: module
   ```

4. Restart Home Assistant.

## Usage

Add the card to your dashboard using the following YAML, replacing entity IDs with your own:

```yaml
- type: custom:ems-power-flow-card
  title: EMS Power Flow
  entities:
    pv_power: sensor.pv_power
    pv_sign: pv_neg_gen   # if your PV reports negative for generation; omit for normal positive generation
    home_power: sensor.home_consumption
    grid_power: sensor.grid_power
    grid_sign: grid_pos_import # default, positive = import
    battery_1:
      name: Venus E – Links
      power: sensor.battery1_power
      soc: sensor.battery1_soc
      sign: bat_pos_discharge # default, positive = discharge
    battery_2:
      name: Venus E – Rechts
      power: sensor.battery2_power
      soc: sensor.battery2_soc
      sign: bat_pos_discharge
  unit: W
  decimals: 1
```

### Configuration options

| Field                 | Required | Default             | Description |
|-----------------------|----------|---------------------|-------------|
| `pv_power`            | Yes      | –                   | Entity ID of your PV power sensor. |
| `pv_sign`             | No       | `pv_pos_gen`        | Set to `pv_neg_gen` if your PV sensor reports negative when generating. |
| `home_power`          | No       | –                   | Entity ID of your home consumption sensor. |
| `grid_power`          | Yes      | –                   | Entity ID of your grid power sensor. |
| `grid_sign`           | No       | `grid_pos_import`   | Set to `grid_neg_import` if your grid sensor reports negative when importing power. |
| `battery_1`           | Yes      | –                   | Object containing `name`, `power`, `soc` and optional `sign` for the first battery. |
| `battery_2`           | Yes      | –                   | Object containing `name`, `power`, `soc` and optional `sign` for the second battery. |
| `unit`                | No       | `W`                 | Unit suffix for power values. |
| `decimals`            | No       | `1`                 | Number of decimal places to display. |

## Development

This project uses Rollup to compile TypeScript to JavaScript. To build the project locally, run:

```bash
npm install
npm run build
```

The compiled file will be output to `dist/ems-power-flow-card.js`. Commit the contents of the `dist` folder when creating releases so that HACS users can load the card without needing a build step.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
