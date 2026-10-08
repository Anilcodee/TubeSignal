import { Chart as ChartJS, Legend, Tooltip } from 'chart.js';

// Register plugins before touching defaults.
ChartJS.register(Legend, Tooltip);

// Bklit UI-inspired Warm Amber & Slate Visualization Tokens
export const chartColors = {
  accent: '#FFC16E',          // Bklit warm amber primary (Signal Gold)
  accentHover: '#FFD39A',
  series2: '#60A5FA',         // Secondary cyan
  series3: '#34D399',         // Emerald
  series4: '#A78BFA',         // Violet
  series5: '#F87171',         // Rose
  base: 'rgba(255, 255, 255, 0.14)',      // Subtle slate baseline
  baseHover: 'rgba(255, 255, 255, 0.28)',
  text: 'rgba(160, 164, 173, 0.85)',
  textMuted: 'rgba(141, 148, 154, 0.6)',
  grid: 'rgba(255, 255, 255, 0.05)',       // Bklit ultra-subtle dashed grid
  surface: 'rgba(18, 21, 26, 0.94)',       // Glassmorphic dark card
  border: 'rgba(255, 255, 255, 0.12)',
};

export const configureChartTheme = () => {
  ChartJS.defaults.color = chartColors.text;
  ChartJS.defaults.borderColor = chartColors.grid;
  ChartJS.defaults.font.size = 11;
  ChartJS.defaults.font.family = 'var(--font-geist-sans), Arial, sans-serif';
  ChartJS.defaults.plugins.legend.display = false;

  // Disable animations globally to prevent Chart.js 4.x interpolator crashes ("this._fn is not a function")
  // when interpolating dynamic color arrays or during fast tab unmounting.
  ChartJS.defaults.animation = false;

  // Set tooltip properties individually instead of Object.assign to avoid
  // corrupting Chart.js internal Maps.
  const tooltip = ChartJS.defaults.plugins.tooltip;
  if (tooltip) {
    tooltip.backgroundColor = chartColors.surface;
    tooltip.borderColor = chartColors.border;
    tooltip.borderWidth = 1;
    tooltip.titleColor = '#FFFFFF';
    tooltip.bodyColor = '#94A3B8';
    tooltip.padding = { top: 8, bottom: 8, left: 12, right: 12 };
    tooltip.cornerRadius = 8;
    tooltip.displayColors = true;
    tooltip.boxWidth = 6;
    tooltip.boxHeight = 6;
    tooltip.boxPadding = 4;
    tooltip.usePointStyle = true;
    tooltip.animation = false;
  }

  if (typeof window !== 'undefined') {
    const font = getComputedStyle(document.documentElement).getPropertyValue('--font-geist-sans').trim();
    if (font) ChartJS.defaults.font.family = `${font}, Arial, sans-serif`;
  }
};

configureChartTheme();
