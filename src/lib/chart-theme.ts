import { Chart as ChartJS, Legend, Tooltip } from 'chart.js';

// Register plugins before touching defaults.
ChartJS.register(Legend, Tooltip);

export const chartColors = { accent: '#FFC16E', base: '#697985', text: '#B0B3B5', grid: 'rgba(141, 148, 154, 0.12)', surface: '#1A1D20' };

export const configureChartTheme = () => {
  ChartJS.defaults.color = chartColors.text;
  ChartJS.defaults.borderColor = chartColors.grid;
  ChartJS.defaults.font.size = 11;
  ChartJS.defaults.font.family = 'Arial, sans-serif';
  ChartJS.defaults.plugins.legend.display = false;

  // Disable animations globally to prevent Chart.js 4.x interpolator crashes ("this._fn is not a function")
  // when interpolating dynamic color arrays or during fast tab unmounting.
  ChartJS.defaults.animation = false;

  // Set tooltip properties individually instead of Object.assign to avoid
  // corrupting Chart.js internal Maps.
  const tooltip = ChartJS.defaults.plugins.tooltip;
  if (tooltip) {
    tooltip.backgroundColor = chartColors.surface;
    tooltip.borderColor = '#33363D';
    tooltip.borderWidth = 1;
    tooltip.titleColor = '#ECEDEF';
    tooltip.bodyColor = '#A0A4AD';
    tooltip.padding = 10;
    tooltip.cornerRadius = 6;
    tooltip.displayColors = false;
    tooltip.animation = false;
  }

  if (typeof window !== 'undefined') {
    const font = getComputedStyle(document.documentElement).getPropertyValue('--font-geist-sans').trim();
    if (font) ChartJS.defaults.font.family = `${font}, Arial, sans-serif`;
  }
};

configureChartTheme();
