type WatermarkOptions = {
  target?: HTMLElement | string;
  content?: string;
  fontSize?: string | number;
  fontFamily?: string;
  color?: string;
  rotate?: number;
};

declare class Watermark {
  constructor(options?: Required<WatermarkOptions>);
  private options;
  private targetElement;
  private container;
  private canvas;
  private dataURL;
  private observer;
  getTargetElement(): HTMLElement;
  generateWatermarkTile(): string;
  applyWatermark(): void;
  listenEvent(): void;
  generateContainerStyle(): string;
  isExistContainer(): boolean;
  isDeleteWatermark(removedNodes: NodeList): boolean;
  observe(): void;
}

export default Watermark;
