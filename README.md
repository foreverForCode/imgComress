##  图片压缩

### 如何使用

```html
<script src="imgCompress.js"></script>
```

```javascript
imgCompress({
    file : file,
    callback : function(status, previewDom, blob) {
      
    }
})
```

### 细节说明

```

// callback 参数说明

// status -> true, 返回 (status, previewDom, blob)  status -> false 返回 (status, errMsg)

// previewDom 可预览对象 img.src = previewDom

// blob 上传用的二进制数据

// 自定义配置项

mode            : 'product',	        //	模式：preview -> 固定400X400 查看图片失真情况	product ->	按照原始图片的70%缩放
level           : 'hight',	        //      压缩级别：low ->	图片不失真，但size大  hight -> 图片有少许失真但能看，但size更小
suffix		: 'image/png',          //	图片后缀
maxWidht	: 400,			// 	图片压缩后实际宽度
maxHeight	: 400,			//	图片压缩后实际高度
scale		: 0.7,			//	压缩后的图片长宽是原始图片的百分比
quality         : 0.7,			//	图片质量（0.1 - 1）
size		: 500*1024,		// 	如果size大于500kb，则需要压缩
file		: null,			// 	图片资源
callback	: null,			//	回调参数(status, data) eg: (false, err.msg) || (true, previewDOM, blob)

```

