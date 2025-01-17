export const generateChartColors = (count: number): string[] => {
  const baseColors = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
    '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5',
    '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5',
    '#393b79', '#637939', '#8c6d31', '#843c39', '#7b4173',
    '#5254a3', '#6b6ecf', '#9c9ede', '#737373', '#8ca252'
  ];

  if (count > baseColors.length) {
    const additionalColors = Array.from({ length: count - baseColors.length }, () => {
      return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    });
    return [...baseColors, ...additionalColors];
  }

  return baseColors.slice(0, count);
}; 