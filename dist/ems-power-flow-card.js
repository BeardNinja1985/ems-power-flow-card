import { LitElement, html, css } from 'lit';

/**
 * EMS Power Flow Card (compiled)
 *
 * A minimal JavaScript version of the EMS Power Flow card for use with
 * Home Assistant. This file is compiled manually from the TypeScript source
 * and does not include decorators or type annotations.
 */

class EmsPowerFlowCard extends LitElement {
  constructor() {
    super();
    /** The card configuration */
    this.config = {};
  }

  static get properties() {
    return {
      hass: { attribute: false },
      config: { type: Object },
    };
  }

  static get styles() {
    return css`
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
  }

  setConfig(config) {
    if (!config.entities) {
      throw new Error('Invalid configuration: `entities` required');
    }
    this.config = config;
  }

  getCardSize() {
    return 3;
  }

  _stateValue(entityId) {
    const stateObj = this.hass && this.hass.states && this.hass.states[entityId];
    if (!stateObj) return null;
    const val = parseFloat(stateObj.state);
    return isNaN(val) ? null : val;
  }

  _applySign(value, sign, type) {
    if (value === null || value === undefined) return null;
    switch (sign) {
      case 'pv_neg_gen':
        return -value;
      case 'grid_neg_import':
        return -value;
      case 'bat_pos_charge':
        return -value;
      default:
        return value;
    }
  }

  _format(value) {
    if (value === null || value === undefined) return '--';
    const decimals = this.config.decimals !== undefined ? this.config.decimals : 1;
    const unit = this.config.unit || 'W';
    return `${value.toFixed(decimals)} ${unit}`;
  }

  render() {
    if (!this.hass) return html``;
    const entities = this.config.entities;
    const rawPv = this._stateValue(entities.pv_power);
    const pvVal = this._applySign(rawPv, entities.pv_sign, 'pv');
    const homeVal = entities.home_power ? this._stateValue(entities.home_power) : null;
    const rawGrid = this._stateValue(entities.grid_power);
    const gridVal = this._applySign(rawGrid, entities.grid_sign, 'grid');
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

customElements.define('ems-power-flow-card', EmsPowerFlowCard);
