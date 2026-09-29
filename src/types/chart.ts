export interface ChartDataset {
  labels: string[];
  datasets: {
    label?: string;
    data: number[] | { x: number; y: number; title?: string }[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
    pointBackgroundColor?: string;
    pointBorderColor?: string;
    pointRadius?: number;
    pointHoverRadius?: number;
  }[];
}
