
/**
 *
 * 原生js实现img压缩，
 * 设想：
 * 	压缩级别：low midium hight
 * 	钩子函数
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
		 * @returns img.src
		 *
		 * */
		blobToSrc : function(blob){

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

			var ia = new Uint8Array(ab);

			for (var i = 0; i < bytes.length; i++) {
				ia[i] = bytes.charCodeAt(i);
			}

			return new Blob( [ab] , {type : 'image/png'});
		},
		/**
		 * 预览图片
		 *
		 * @params base64数据
		 *
		 * @returns <img>
		 *
		 * */

		previewImg : function(base64){

			var img = document.createElement('img');

			img.src = base64;

			return img;
		}
	};

	function imgCompress(options) {

		var defaultOpts = {

			level 		: 'low',		// 	压缩级别
			isCompress 	: true,			//	是否压缩，如果size本身不大可以不压缩
			suffix		: 'image/png',  //	图片后缀
			maxWidht	: 400,			// 	图片压缩后实际宽度
			maxHeight	: 400,			//	图片压缩后实际高度
			quality     : 0.7,			//	图片质量（0.1 - 1）
			size		: 500*1024,		// 	如果size大于500kb，则需要压缩
			file		: null,			// 	图片资源
			success		: null,			//	获取图片成功回调
			error		: null,			//	获取图片失败回调
		}

		var opts = HELP.extend(defaultOpts, options || {});

		if(!opts.file){

			console.log('请提供file资源');
			return;
		}

		var file = opts.file;

		var _zip = function (file, callback) {

			var beforeSize = file.size;

			var type = file.type;

			var objectURL = null;


			if(type.indexOf("image") == -1){

				console.log("文件类型必须是图片");
				return;
			}

			var canvas = document.createElement("canvas");

			var context = canvas.getContext('2d');

			// 如果压缩前的尺寸小于500kb，那么不用压缩

			if(beforeSize < opts.size){

				console.log("尺寸小于500kb，不用压缩");

				return ;
			}

			var handle = function (base64) {

				var img = new Image();

				img.onload = function () {

					var originWidth = this.width;
					var originHeight = this.height;

					var maxWidth = 400, maxHeight = 400;

					var targetWidth = originWidth, targetHeight = originHeight;

					// 图片尺寸超过400x400的限制
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

					var dataUrl = canvas.toDataURL('image/jpeg', 0.9);


					var myBlob = HELP.baseToBlob(dataUrl);

					callback && callback(dataUrl);


				}

				img.src = base64;
			}
			if(FileReader){

				var reader = new FileReader();

				reader.onload = function (e) {

					var base64 = e.target.result;

					handle(base64);
				}

				reader.readAsDataURL(file);
			}else{

				objectURL = URL.createObjectURL(file);  // base64

				handle(objectURL);
			}

		}

		_zip(file, opts.success)
	}

	return imgCompress;
})