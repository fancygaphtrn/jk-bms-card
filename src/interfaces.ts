import {LovelaceCardConfig} from 'custom-card-helpers';

export interface JkBmsCardConfig extends LovelaceCardConfig {
    title: string;
    prefix: string; // The entity prefix (e.g., "jk_bms_bms0_")
    cellCount: number;
}