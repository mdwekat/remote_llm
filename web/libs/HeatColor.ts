/*
To use the HeatColor class:

1. Import the class into your TypeScript file:
   import { HeatColor } from './path/to/HeatColor';

2. Normalize your input values so they fall within the range of 0 to 1. For example, you can use the following formula to normalize a value within a given range (minValue to maxValue):
   const normalizedValue = (value - minValue) / (maxValue - minValue);

3. Create a new instance of the HeatColor class:
   const color = new HeatColor(normalizedValue);

   - The value parameter should be a number between 0 and 1 that represents the normalized value you want to assign a color to.

4. To get the color as an RGBA string, use the `string()` method:
   const rgbaString = color.string();

   - This will return a string in the format "rgba(r, g, b, a)", where r, g, b are the red, green, blue components of the color (each between 0 and 255), and a is the alpha component (between 0 and 1).

Example usage:
   const minValue = 0;
   const maxValue = 100;
   const value1 = 50; // input value to be normalized
   const normalizedValue1 = (value1 - minValue) / (maxValue - minValue);
   const color1 = new HeatColor(normalizedValue1); // color for normalized value

   const value2 = 75; // input value to be normalized
   const normalizedValue2 = (value2 - minValue) / (maxValue - minValue);
   const color2 = new HeatColor(normalizedValue2); // color for normalized value

   const rgbaString = color1.string(); // "rgba(255, 128, 0, 1)"
*/

export interface HeatColor {
    r: number;
    g: number;
    b: number;
    a: number;
}

export class HeatColor {
    constructor(value?: number) {
        if (value !== undefined) {
            const ratio = 2.0 * value;
            const b = Math.max(0, Math.floor(255.0 * (1.0 - ratio)));
            const r = Math.max(0, Math.floor(255.0 * (ratio - 1.0)));
            const g = 255 - b - r;
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = 1.0;
        } else {
            this.r = 0;
            this.g = 0;
            this.b = 0;
            this.a = 0.0;
        }
    }

    public string(): string {
        return `rgba(${this.r},${this.g},${this.b},${this.a})`;
    }
}
