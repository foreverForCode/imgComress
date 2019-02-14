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

```javascript

// callback 参数说明

// status -> true, 返回 (status, previewDom, blob)  status -> false 返回 (status, errMsg)

// previewDom 可预览对象 img.src = previewDom

// blob 上传用的二进制数据

```

