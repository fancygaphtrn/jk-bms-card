import { HomeAssistant } from 'custom-card-helpers';

export const globalData = {
    hass: null as HomeAssistant | null,
};

export function setHass(hass: HomeAssistant) {
    globalData.hass = hass;
}