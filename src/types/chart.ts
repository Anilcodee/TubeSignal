export interface ChartSeries<T> {
  label?: string;
  data: T[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  borderRadius?: number;
  fill?: boolean;
  tension?: number;
  pointBackgroundColor?: string;
  pointBorderColor?: string;
  pointRadius?: number;
  pointHoverRadius?: number;
}

export interface NumericChartData {
  labels: string[];
  datasets: ChartSeries<number>[];
}

export interface ScatterChartData {
  labels?: string[];
  datasets: ChartSeries<{ x: number; y: number }>[];
}

export type ChartDataset = NumericChartData | ScatterChartData;
