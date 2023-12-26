import { isNumber } from "./utils";

type WatermarkOptions = {
  target?: HTMLElement | string;
  content?: string;
  fontSize?: string | number;
  fontFamily?: string;
  color?: string;
  rotate?: number;
};

const defaultOptions: WatermarkOptions = {
  target: document.body,
  content: "watermark",
  fontSize: 16,
  fontFamily: "Arial",
  color: "rgba(184, 184, 184, 0.5)",
  rotate: -15,
};
const dpr = window.devicePixelRatio || 1;
const WATERMARK_TILE_WIDTH = 200;
const WATERMARK_TILE_HEIGHT = 100;

class Watermark {
  private options: Required<WatermarkOptions>;

  // 需要添加水印的容器
  private targetElement: HTMLElement;

  // 水印容器
  private container!: HTMLDivElement;

  // 水印canvas容器
  private canvas!: HTMLCanvasElement;

  // 水印base64
  private dataURL: string = "";

  private observer!: MutationObserver;

  constructor(options?: WatermarkOptions) {
    this.options = {
      ...defaultOptions,
      ...options,
    } as Required<WatermarkOptions>;

    this.targetElement = this.getTargetElement();
    this.dataURL = this.generateWatermarkTile();
    this.applyWatermark();
    this.listenEvent();
  }

  private getTargetElement(): HTMLElement {
    if (typeof this.options.target === "string") {
      return (
        (document.querySelector(this.options.target) as HTMLElement) ||
        document.body
      );
    }

    if (this.options.target instanceof HTMLElement) {
      return this.options.target;
    }

    return document.body;
  }

  private generateWatermarkTile(): string {
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("width", `${WATERMARK_TILE_WIDTH}px`);
    this.canvas.setAttribute("height", `${WATERMARK_TILE_HEIGHT}px`);
    this.canvas.width = WATERMARK_TILE_WIDTH * dpr;
    this.canvas.height = WATERMARK_TILE_HEIGHT * dpr;

    const ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    const { content, fontSize, fontFamily, color, rotate } = this.options;
    const textFontSize = isNumber(fontSize) ? `${fontSize}px` : fontSize;

    ctx.scale(dpr, dpr);

    ctx.translate(WATERMARK_TILE_WIDTH / 2, WATERMARK_TILE_HEIGHT / 2);
    ctx.rotate((Math.PI / 180) * rotate);
    ctx.translate(-WATERMARK_TILE_WIDTH / 2, -WATERMARK_TILE_HEIGHT / 2);

    ctx.font = `${textFontSize} ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.fillText(content, WATERMARK_TILE_WIDTH / 4, WATERMARK_TILE_HEIGHT / 2);

    return this.canvas.toDataURL();
  }

  private applyWatermark(): void {
    const exists = this.isExistContainer();

    if (!exists) {
      this.observer?.disconnect();
      this.container = document.createElement("div");
      this.targetElement.insertBefore(
        this.container,
        this.targetElement.firstChild
      );
    }

    // 这里需要做下判断，不然会因改动style，observe会不停触发
    const oldStyleStr = this.container.getAttribute("style");
    const containerStyleStr = this.generateContainerStyle();
    if (oldStyleStr !== containerStyleStr) {
      this.container.setAttribute("style", containerStyleStr);
    }

    if (!exists) {
      this.observe();
    }
  }

  private listenEvent() {
    const events = ["load", "resize"];
    events.forEach((event) => {
      window.addEventListener(event, () => this.applyWatermark(), false);
    });
  }

  private generateContainerStyle(): string {
    const rect = this.targetElement.getBoundingClientRect();
    const { left, top, width, height } = rect;
    const containerStyle = {
      "pointer-events": "none",
      position: "absolute",
      left: left,
      top: top,
      "z-index": 2147483647,
      width: `${width}px`,
      height: `${height}px`,
      "background-image": `url(${this.dataURL})`,
      "background-size": `${WATERMARK_TILE_WIDTH}px ${WATERMARK_TILE_HEIGHT}px`,
      "background-repeat": "repeat",
    };

    return Object.entries(containerStyle).reduce(
      (prev: string, [key, value]) => prev + `${key}:${value} !important;`,
      ""
    );
  }

  private isExistContainer(): boolean {
    return document.contains(this.container);
  }

  private isDeleteWatermark(removedNodes: NodeList): boolean {
    return Array.from(removedNodes).includes(this.container as HTMLElement);
  }

  private observe(): void {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.target === this.container) {
          this.applyWatermark();
        }
        if (mutation.type === "childList") {
          if (this.isDeleteWatermark(mutation.removedNodes)) {
            this.applyWatermark();
          } else {
            this.applyWatermark();
          }
        }
      }
    });

    this.observer.observe(this.targetElement, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }
}

export default Watermark;
