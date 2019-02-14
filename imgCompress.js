
/**
 *
 * 原生js实现图片压缩，
 *
 * 作者：李想
 * 日期：2019-2-13
 * url: https://github.com/foreverForCode/imgComress.git
 *
 * */


; (function (window, factory) {
	if (typeof define === "function" && define.amd) {
		define(factory);
	} else if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = factory();
	} else {
		window.imgCompress = factory();
	}
})(this, function () {

	var HELP = {

		// 对象合并
		extend: function () {
			var options, name, src, copy, deep = false, target = arguments[0], i = 1, length = arguments.length;
			if (typeof (target) === "boolean") deep = target, target = arguments[1] || {}, i = 2;
			if (typeof (target) !== "object" && typeof (target) !== "function") target = {};
			if (length === i) target = this, --i;
			for (; i < length; i++) {
				if ((options = arguments[i]) != null) {
					for (name in options) {
						src = target[name], copy = options[name];
						if (target === copy) continue;
						if (copy !== undefined) target[name] = copy;
					}
				}
			}

			return target;
		},

		/**
		 * blob 转化成 img
		 *
		 * @params blob
		 *
		 * @returns blob 可以预览
		 *
		 * */
		blobToBase : function(blob){

			window.URL = window.URL || window.webkitURL;

			var myimg = document.createElement('img');

			myimg.onload = function(){

				window.URL.revokeObjectURL(myimg.src);
			}
			myimg.src = window.URL.createObjectURL(blob);

			return myimg.src;
		},

		/**
		 * base64 转化成 blob
		 *
		 * @param base64
		 *
		 * @returns blob
		 *
		 * */

		baseToBlob : function(base64){

			var bytes = window.atob(base64.split(',')[1]);

			var ab = new ArrayBuffer(bytes.length);

			// ArrayBuffer : 通用的、固定长度的原始二进制数据缓冲区 参考：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer

			var ia = new Uint8Array(ab);

			// Uint8Array : 8位无符号整形数组 参考：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array

			for (var i = 0; i < bytes.length; i++) {
				ia[i] = bytes.charCodeAt(i);
			}

			return new Blob( [ab] , {type : 'image/png'});
		},
	};

	function imgCompress(options) {

		var defaultOpts = {

			mode		: 'product',	//	模式：preview -> 固定400X400 查看图片失真情况	product ->	按照原始图片的70%缩放
			level 		: 'hight',		//  压缩级别：low ->	图片不失真，但size大  hight -> 图片有少许失真但能看，但size更小
			suffix		: 'image/png',  //	图片后缀
			maxWidht	: 400,			// 	图片压缩后实际宽度
			maxHeight	: 400,			//	图片压缩后实际高度
			scale		: 0.7,			//	压缩后的图片长宽是原始图片的百分比
			quality     : 0.7,			//	图片质量（0.1 - 1）
			size		: 500*1024,		// 	如果size大于500kb，则需要压缩
			file		: null,			// 	图片资源
			callback	: null,			//	回调参数(status, data) eg: (false, err.msg) || (true, previewDOM, blob)
		}

		var opts = HELP.extend(defaultOpts, options || {});

		if(!opts.file){

			opts.callback && opts.callback(false, "请提供file资源");
			return;
		}

		var file = opts.file;

		var _zip = function (file, callback) {

			var beforeSize = file.size;

			var type = file.type;

			var objectURL = null;


			if(type.indexOf("image") == -1){

				callback && callback(false,	"文件类型必须是图片");
				return;
			}

			var canvas = document.createElement("canvas");

			var context = canvas.getContext('2d');


			var handle = function (base64) {

				var img = new Image();

				img.onload = function () {

					var originWidth = this.width;
					var originHeight = this.height;

					if(opts.mode === "preview"){

						var maxWidth = opts.maxWidht, maxHeight = opts.maxHeight;
					}else{

						var maxWidth = Math.round(originWidth*opts.scale), maxHeight = Math.round(originHeight*opts.scale);
					}

					var targetWidth = originWidth, targetHeight = originHeight;


					if (originWidth > maxWidth || originHeight > maxHeight) {

						if (originWidth / originHeight > maxWidth / maxHeight) {
							// 更宽，按照宽度限定尺寸
							targetWidth = maxWidth;

							targetHeight = Math.round(maxWidth * (originHeight / originWidth));
						} else {
							targetHeight = maxHeight;

							targetWidth = Math.round(maxHeight * (originWidth / originHeight));
						}
					}

					// canvas对图片进行缩放
					canvas.width = targetWidth;

					canvas.height = targetHeight;

					// 清除画布
					context.clearRect(0, 0, targetWidth, targetHeight);
					// 图片压缩
					context.drawImage(img, 0, 0, targetWidth, targetHeight);

					// 图片压缩第一种方法

					if(opts.level === 'low'){

						// 图片压缩的第二张方法
						canvas.toBlob(function (blob) {

							if(blob){

								callback && callback(true, HELP.blobToBase(blob), blob)
							}else{

								callback && callback(false, "图片压缩失败")
							}
						})
					}else{

						var dataUrl = canvas.toDataURL(opts.suffix, opts.quality);

						var myBlob = HELP.baseToBlob(dataUrl);

						callback && callback(true, dataUrl, myBlob);
					}
				}

				img.src = base64;
			}

			if(FileReader){

				var reader = new FileReader();

				reader.onload = function (e) {

					var base64 = e.target.result;

					// 如果压缩前的尺寸小于500kb，那么不用压缩

					if(beforeSize < opts.size){

						console.log("尺寸小于500kb，不用压缩");

						callback && callback(true, base64, HELP.baseToBlob(base64));

					}else{

						handle(base64);
					}

				}

				reader.readAsDataURL(file);
			}else{

				objectURL = URL.createObjectURL(file);  // base64

				if(beforeSize < opts.size){

					console.log("尺寸小于500kb，不用压缩");

					callback && callback(true, base64, HELP.baseToBlob(base64));

				}else{

					handle(objectURL);
				}
			}
		}

		_zip(file, opts.callback)
	}

	return imgCompress;
})