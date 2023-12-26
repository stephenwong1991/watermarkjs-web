type WatermarkOptions = {
    target?: HTMLElement | string;
    content?: string;
    fontSize?: string | number;
    fontFamily?: string;
    color?: string;
    rotate?: number;
};
declare class Watermark {
    private options;
    private targetElement;
    private container;
    private canvas;
    private dataURL;
    private observer;
    constructor(options?: WatermarkOptions);
    private getTargetElement;
    private generateWatermarkTile;
    private applyWatermark;
    private listenEvent;
    private generateContainerStyle;
    private isExistContainer;
    private isDeleteWatermark;
    private observe;
}
export default Watermark;
