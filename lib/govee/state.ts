// Govee device state types and parsing utilities

// Raw property format from API (each property is a single-key object)
export type GoveeRawProperty =
  | { online: boolean }
  | { powerState: 'on' | 'off' }
  | { brightness: number }
  | { color: { r: number; g: number; b: number } }
  | { colorTem: number }
  | { colorTemInKelvin: number };

// Parsed/flattened state with all known properties
export interface GoveeStateProperties {
  online?: boolean;
  powerState?: 'on' | 'off';
  brightness?: number; // 0-100
  color?: { r: number; g: number; b: number };
  colorTem?: number; // Color temperature (Govee units)
  colorTemInKelvin?: number; // Color temperature in Kelvin
}

/**
 * Parse raw API properties array into a typed state object
 */
export function parseStateProperties(
  properties: readonly GoveeRawProperty[],
): GoveeStateProperties {
  const state: GoveeStateProperties = {};

  for (const prop of properties) {
    if ('online' in prop) {
      state.online = prop.online;
    } else if ('powerState' in prop) {
      state.powerState = prop.powerState;
    } else if ('brightness' in prop) {
      state.brightness = prop.brightness;
    } else if ('color' in prop) {
      state.color = prop.color;
    } else if ('colorTem' in prop) {
      state.colorTem = prop.colorTem;
    } else if ('colorTemInKelvin' in prop) {
      state.colorTemInKelvin = prop.colorTemInKelvin;
    }
  }

  return state;
}
