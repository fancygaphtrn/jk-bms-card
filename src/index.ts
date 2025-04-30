import {css, html, LitElement, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {HomeAssistant, LovelaceCardEditor} from 'custom-card-helpers';
import {EDITOR_NAME, MAIN_NAME} from './const';
import {JkBmsCardConfig} from './interfaces';
import {localize} from './localize/localize';

import {version} from '../package.json';
import {globalData} from './helpers/globals';

export const CARD_VERSION = version;

console.groupCollapsed(
    `%c🔋 JK-BMS Battery Card%c   ready!  🚀 (v${CARD_VERSION})`,
    'background: linear-gradient(to right, #41cd52, #3090c7); color: white; font-weight: bold; padding: 2px 8px; border-radius: 6px;',
    'background: none; color: #AAA; font-style: italic;'
);
console.log('%c📖 Docs:', 'color: #41cd52; font-weight: bold;', 'https://github.com/Pho3niX90/jk-bms-card');
console.groupEnd();

@customElement(MAIN_NAME)
export class JkBmsCard extends LitElement{
    @property() public hass!: HomeAssistant;
    @property() private _config?: JkBmsCardConfig;

    public setConfig(config: JkBmsCardConfig): void {
        this._config = {...this._config, ...config};
    }

    static getStubConfig() {
        return {
            title: localize("title"),
            prefix: "jk_bms",
            cellCount: 16,
            cellColumns: 2,
            cellLayout: "bankMode",
        } as unknown as JkBmsCardConfig;
    }

    public static async getConfigElement() {
        await import("./editor");
        return document.createElement(EDITOR_NAME) as LovelaceCardEditor;
    }

    public getCardSize(): number {
        return 3;
    }

    static styles = css`
        .grid {
            display: grid;
            gap: 4px;
            margin: 4px;
        }
        .grid-1 { grid-template-columns: 1fr; }
        .grid-2 { grid-template-columns: repeat(2, 1fr); }
        .grid-3 { grid-template-columns: repeat(3, 1fr); }
        .grid-4 { grid-template-columns: repeat(4, 1fr); }
        .grid-5 { grid-template-columns: repeat(5, 1fr); }
        .grid-6 { grid-template-columns: repeat(6, 1fr); }
        .grid-7 { grid-template-columns: repeat(7, 1fr); }
        .grid-8 { grid-template-columns: repeat(8, 1fr); }
        .clickable {
            cursor: pointer;
        }
        .section-padding {
            padding-top: 0.45rem;
            padding-bottom: 0.75rem;
        }
        .stats-padding {
            padding-top: 0.75rem;
            padding-left: 0.75rem;
        }
        .power-negative {
            color: red
        }
        .power-positive {
            color: #41cd52
        }
        .stats-border {
            border-width: var(--ha-card-border-width,1px);
            border-style: solid;
            border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0));
        }
        .button-border {
            border-width: var(--ha-card-border-width,1px);
            border-style: solid;
            border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0));
        }
        .error-message {
            color: red;
            font-style: italic;
        }
        .button-padding {
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
        }
        .status-on { color: #41cd52; }
        .status-off { color: red; }
        .voltage-high { color: #3090C7; }
        .voltage-low { color: red; }
        .center { text-align: center; }
    `;

    private _navigate(event, entityId: string, type: "sensor" | "switch" | "number" = "sensor") {
        if (!event) {
            return;
        }

        event.stopPropagation();

        const fullEntityId = type + "." + this._config?.prefix + "_" + entityId;
        let customEvent = new CustomEvent('hass-more-info', {
            detail: { entityId: fullEntityId },
            composed: true,
        })
        event.target.dispatchEvent(customEvent);
    }

    private _state(suffix: string, defaultValue = '', type: "sensor" | "switch" | "number" = "sensor"): string {
        const entityId = `${type}.${this._config!.prefix}_${suffix}`;
        const entity = this.hass?.states[entityId];
        const state = entity?.state;

        return state ?? defaultValue;
    }

    render() {
        globalData.hass = this.hass;
        if (!this.hass || !this._config) return html``;
        const title = this._config.title || 'Bat 1';

        const deltaCellV = parseFloat(this._state('delta_cell_voltage', '0'));
        const balanceCurrent = parseFloat(this._state('balancing_current', '0'));
        const powerClass = Number(this._state('power')) > 0 ? 'power-positive' : 'power-negative'

        return html`
      <ha-card>
        <div class="grid grid-1 p-3 section-padding">
          <div class="center clickable" @click=${(e) => this._navigate(e, `total_runtime_formatted`)}>
            ${title} | Time: <b><font color="#3090C7">${this._state('total_runtime_formatted').toUpperCase()}</font></b>
          </div>
        </div>

        <div class="grid grid-3">
          ${this._renderSwitch('charging', 'charge')}
          ${this._renderSwitch('discharging', 'discharge')}
          ${this._renderSwitch('balancer', 'balance')}
        </div>
          
          ${this._renderError()}

        <div class="grid grid-2 section-padding">
          <div class="stats-padding stats-border">
            <div class="clickable center" @click=${(e) => this._navigate(e, `total_voltage`)}>
              <b><font color="#41CD52" size="6">${this._state('total_voltage')} V</font></b>
            </div>
              ${localize('stats.power')} <span class="clickable ${powerClass}" @click=${(e) => this._navigate(e, `power`)}>${this._state('power')} W</span><br>
              ${localize('stats.capacity')} <span class="clickable" @click=${(e) => this._navigate(e, `total_battery_capacity_setting`)}>${this._state('total_battery_capacity_setting')} Ah</span><br>
              ${localize('stats.cycleCapacity')} <span class="clickable" @click=${(e) => this._navigate(e, `total_charging_cycle_capacity`)}>${this._state('total_charging_cycle_capacity')} Ah</span><br>
              ${localize('stats.averageCellV')} <span class="clickable" @click=${(e) => this._navigate(e, `average_cell_voltage`)}>${this._state('average_cell_voltage')} V</span><br>
              ${localize('stats.balanceCurrent')} <span style="color: ${balanceCurrent > 0 ? 'red' : balanceCurrent < 0 ? '#3090C7' : '#808080'};">
              ${balanceCurrent.toFixed(1)} A
            </span>
          </div>

          <div class="stats-padding stats-border">
            <div class="clickable center" @click=${(e) => this._navigate(e, `current`)}>
              <b><font color="#41CD52" size="6">${this._state('current')} A</font></b>
            </div>
              ${localize('stats.stateOfCharge')} <span class="clickable" @click=${(e) => this._navigate(e, `state_of_charge`)}>${this._state('state_of_charge')} %</span><br>
              ${localize('stats.remainingAmps')} <span class="clickable" @click=${(e) => this._navigate(e, `capacity_remaining`)}>${this._state('capacity_remaining')} Ah</span><br>
              ${localize('stats.cycles')} <span class="clickable" @click=${(e) => this._navigate(e, `charging_cycles`)}>${this._state('charging_cycles')}</span><br>
              ${localize('stats.delta')} <span style="color: ${deltaCellV >= Number(this._state("balance_trigger_voltage", "", "number")) ? '#FFA500' : '#41CD52'};">
              ${deltaCellV.toFixed(3)} V
            </span><br>
              ${localize('stats.mosfetTemp')} <span class="clickable" @click=${(e) => this._navigate(e, `power_tube_temperature`)}>${this._state('power_tube_temperature')} °C</span>
          </div>
        </div>

        <div class="grid grid-${this._config.cellColumns ?? 2}">
          ${this._renderCells(this._config.cellLayout == "bankMode")}
        </div>
      </ha-card>
    `;
    }

    private _renderError() {
        const state = this._state('errors', '', "sensor");
        if (state.trim().length <= 1) {
            return html``
        }
        return html`<span class="error-message">${state}</span>`
    }

    private _renderSwitch(entityId: string, label: string): TemplateResult {
        const state = this._state(entityId, '', "switch");
        const colorClass = state === 'on' ? 'status-on' : 'status-off';
        return html`
      <div class="button-border button-padding center clickable" @click=${(e) => this._navigate(e, `${entityId}`, "switch")}>
        ${localize('switches.'+label)}: <span class="${colorClass}">${state.toUpperCase()}</span>
      </div>
    `;
    }

    private _renderCells(bankmode = true): TemplateResult {
        const cells: TemplateResult[] = [];

        const start = 1;
        const columns = this._config?.cellColumns ?? 2;
        const totalCells =  this._config?.cellCount ?? 16;
        const bankOffset = Math.floor(totalCells / columns);
        const end = bankmode ? Math.ceil(totalCells / columns) : totalCells;
        const uneven = totalCells % columns

        for (let i = start; i <= end; i++) {
            if (bankmode && uneven && i == end) {
                cells.push(this._createCell(totalCells));
            } else  {
                cells.push(this._createCell(i));
            }

            if (bankmode && (i < end || !uneven)) {
                for (let ii = 1; ii < columns; ii++) {
                    cells.push(this._createCell(i + (bankOffset * ii)));
                }
            }
        }

        return html`${cells}`;
    }
    private _createCell(i) {
        const voltage = this._state(`cell_voltage_${i}`, '0.0');
        const resistance = this._state(`cell_resistance_${i}`, '');
        const minCell = this._state('min_voltage_cell');
        const maxCell = this._state('max_voltage_cell');

        const color = i.toString() === minCell ? 'voltage-low'
            : i.toString() === maxCell ? 'voltage-high'
                : '';

        let currentHtml;
        if (resistance != '') {
            currentHtml = html`
        <div class="center">
            <span class="clickable" @click=${(e) => this._navigate(e, `cell_voltage_${i}`)}>
                ${i.toString().padStart(2, '0')}.&nbsp;
            ${color ? html`<span class="${color}">${voltage} V</span>` : html`${voltage} V`}
          </span>
          <span class="clickable" @click=${(e) => this._navigate(e, `cell_resistance_${i}`)}>
            / ${resistance} Ω
          </span>
        </div>
      `
        } else {
            currentHtml = html`
        <div class="center">
            <span class="clickable" @click=${(e) => this._navigate(e, `cell_voltage_${i}`)}>
                ${i.toString().padStart(2, '0')}.&nbsp;
            ${color ? html`<span class="${color}">${voltage} V</span>` : html`${voltage} V`}
          </span>
        </div>
      `
        }
        return currentHtml;
    }
}

(window as any).customCards.push({
    type: MAIN_NAME,
    name: 'JK BMS Card',
    preview: true,
    description: localize('common.description'),
    configurable: true
});