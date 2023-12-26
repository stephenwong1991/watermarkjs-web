# watermark

## demo

https://codesandbox.io/p/sandbox/watermarkjs-web-demo-33rpjh

## use

```
npm i watermarkjs-web
```

```
import Watermark from 'watermarkjs-web';

new Watermark({
  content:'重要资料请勿泄漏',
  ...options
});
```

## options

| 参数       | 说明             | 类型                | 默认值                     |
| ---------- | ---------------- | ------------------- | -------------------------- |
| target     | 需添加水印的元素 | HTMLElement, String | document.body              |
| content    | 水印的内容       | String              | "watermark"                |
| fontSize   | 水印文字大小     | Number, String      | 16                         |
| fontFamily | 水印文字字体     | String              | "Arial"                    |
| color      | 水印文字颜色     | String              | "rgba(184, 184, 184, 0.5)" |
| rotate     | 水印文字旋转角度 | Number              | -15                        |
