import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';

/**
 * EMS Power Flow Card
 *
 * A Lovelace card for Home Assistant that visualises power flows between
 * photovoltaic generation, the grid, home consumption and up to two batteries.
 *
 * This card is intentionally simple and extensible. It supports sign
 * conventions for PV, grid and battery entities. Pass your entity IDs via
 * the `entities` object in the card configuration and use the optional
 * `sign` fields to tell the card whether positive values represent import
 * or export. For example, if your PV sensor reports negative numbers when
 * the panels are generating power, set `pv_sign` to `pv_neg_gen`.
 */
@customElement('ems-power-flow-card')
export class EmsPowerFlowCard extends LitElement {
  /** The Home Assistant `hass` object is injected by Lovelace. */
  hass?: any;

  /** Card configuration passed from Lovelace. */
  @property({ type: Object })
  public config: any = {};

  static styles = css`
    :host {
      display: block;
    }
    ha-card {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .label {
      font-weight: bold;
    }
    .value {
      font-family: monospace;
    }
    .battery {
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 4px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  `;

  setConfig(config: any) {
    if (!config.entities) {
      throw new Error('Invalid configuration: `entities` required');
    }
    this.config = config;
  }

  getCardSize() {
    return 3;
  }

  /**
   * Helper to extract a numeric state from a sensor. Returns `null` if
   * unavailable or non-numeric.
   */
  private _stateValue(entityId: string): number | null {
    const stateObj = this.hass?.states?.[entityId];
    if (!stateObj) return null;
    const val = parseFloat(stateObj.state);
    return isNaN(val) ? null : val;
  }

  /**
   * Interpret a value according to a sign convention. For PV and grid,
   * `pos_import` means positive numbers are import/consumption, so
   * negative numbers are generation/export. For batteries, `pos_discharge`
   * means positive is discharge.
   */
  private _applySign(value: number | null, sign: string | undefined, type: string): number | null {
    if (value === null || value === undefined) return null;
    switch (sign) {
      case 'pv_neg_gen':
        // PV reports negative when generating; invert
        return -value;
      case 'grid_neg_import':
        return -value;
      case 'bat_pos_charge':
        // battery reports positive when charging; invert so positive = discharge
        return -value;
      default:
        // default conventions: pv_pos_gen (positive = generation),
        // grid_pos_import (positive = import), bat_pos_discharge (positive = discharge)
        return value;
    }
  }

  /** Format a number with unit and decimals. */
  private _format(value: number | null): string {
    if (value === null || value === undefined) return '--';
    const decimals = this.config.decimals ?? 1;
    const unit = this.config.unit ?? 'W';
    return `${value.toFixed(decimals)} ${unit}`;
  }

  render() {
    if (!this.hass) return html``;
    const { entities } = this.config;
    // PV
    const rawPv = this._stateValue(entities.pv_power);
    const pvVal = this._applySign(rawPv, entities.pv_sign, 'pv');
    // Home consumption (just displayed as-is)
    const homeVal = entities.home_power ? this._stateValue(entities.home_power) : null;
    // Grid
    const rawGrid = this._stateValue(entities.grid_power);
    const gridVal = this._applySign(rawGrid, entities.grid_sign, 'grid');
    // Batteries
    const bat1Cfg = entities.battery_1 || {};
    const rawBat1 = this._stateValue(bat1Cfg.power);
    const bat1Val = this._applySign(rawBat1, bat1Cfg.sign, 'bat');
    const bat1Soc = bat1Cfg.soc ? this._stateValue(bat1Cfg.soc) : null;
    const bat2Cfg = entities.battery_2 || {};
    const rawBat2 = this._stateValue(bat2Cfg.power);
    const bat2Val = this._applySign(rawBat2, bat2Cfg.sign, 'bat');
    const bat2Soc = bat2Cfg.soc ? this._stateValue(bat2Cfg.soc) : null;

    return html`
      <ha-card>
        <div class="row">
          <span class="label">PV</span>
          <span class="value">${this._format(pvVal)}</span>
        </div>
        <div class="row">
          <span class="label">Home</span>
          <span class="value">${this._format(homeVal)}</span>
        </div>
        <div class="row">
          <span class="label">Grid</span>
          <span class="value">${this._format(gridVal)}</span>
        </div>
        <div class="battery">
          <span class="label">${bat1Cfg.name || 'Battery 1'}</span>
          <span class="value">P: ${this._format(bat1Val)}</span>
          <span class="value">SoC: ${bat1Soc !== null && bat1Soc !== undefined ? bat1Soc.toFixed(1) + ' %' : '--'}</span>
        </div>
        <div class="battery">
          <span class="label">${bat2Cfg.name || 'Battery 2'}</span>
          <span class="value">P: ${this._format(bat2Val)}</span>
          <span class="value">SoC: ${bat2Soc !== null && bat2Soc !== undefined ? bat2Soc.toFixed(1) + ' %' : '--'}</span>
        </div>
      </ha-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ems-power-flow-card': EmsPowerFlowCard;
  }
}
