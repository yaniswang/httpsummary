
module.exports = function(pagerun){
    var self = this;
    var bOpenUrl = false;
    var allCount = 0, allLength = 0;
    var methodCount = 0, hostnameCount = 0, typeCount = 0, charsetCount = 0;
    var imgCount = 0, imgLength = 0;
    var fontCount = 0, fontLength = 0;
    var gzipCount = 0, gzipLength = 0;
    var errorCount = 0, redirectCount = 0;
    var mapMethodList = {};
    var mapDomainList = {};
    var mapTypeList = {};
    var mapCharsetList = {};
    pagerun.on('proxyStart', function(msg){
        var proxy = msg.proxy;
        proxy.addFilter(function(httpData, next){
            if(bOpenUrl === true && httpData.type === 'response'){
                var responseCode = httpData.responseCode;
                var responseHeaders = httpData.responseHeaders;
                if(/^3\d\d$/.test(responseCode)){
                    redirectCount ++;
                }
                else if(/^(4|5)\d\d$/.test(responseCode)){
                    errorCount ++;
                }
                var responseLength = httpData.responseData.length;
                allCount ++;
                allLength += responseLength;
                if(/^gzip$/i.test(responseHeaders['content-encoding'])){
                    gzipCount ++;
                    gzipLength += responseLength;
                }
                // method
                var method = httpData.method;
                var methodInfo = mapMethodList[method];
                if(methodInfo === undefined){
                    methodInfo = {
                        count: 0,
                        length: 0,
                        list: []
                    };
                    mapMethodList[method] = methodInfo;
                    methodCount ++;
                }
                methodInfo.count ++;
                methodInfo.length += responseLength;
                methodInfo.list.push(httpData.url);
                // hostname
                var hostname = httpData.hostname;
                var hostnameInfo = mapDomainList[hostname];
                if(hostnameInfo === undefined){
                    hostnameInfo = {
                        count: 0,
                        length: 0,
                        list: []
                    };
                    mapDomainList[hostname] = hostnameInfo;
                    hostnameCount ++;
                }
                hostnameInfo.count ++;
                hostnameInfo.length += responseLength;
                hostnameInfo.list.push(httpData.url);
                // type
                var responseType = httpData.responseType?httpData.responseType:'other';
                var typeInfo = mapTypeList[responseType];
                if(typeInfo === undefined){
                    typeInfo = {
                        count: 0,
                        length: 0,
                        list: []
                    };
                    mapTypeList[responseType] = typeInfo;
                    typeCount ++;
                }
                typeInfo.count ++;
                typeInfo.length += responseLength;
                typeInfo.list.push(httpData.url);
                // charset
                var contentType = responseHeaders['content-type'];
                var charset = contentType && contentType.match(/;\s*charset=(.+)/i);
                charset = (charset && charset[1].toLowerCase()) || 'other';
                var charsetInfo = mapCharsetList[charset];
                if(charsetInfo === undefined){
                    charsetInfo = {
                        count: 0,
                        length: 0,
                        list: []
                    };
                    mapCharsetList[charset] = charsetInfo;
                    charsetCount ++;
                }
                charsetInfo.count ++;
                charsetInfo.length += responseLength;
                charsetInfo.list.push(httpData.url);
                // img,font
                if(/^(jpg|png|gif|bmp|tiff|webp|svg)$/i.test(responseType)){
                    imgCount ++;
                    imgLength += responseLength;
                }
                else if(/^(woff|eot|ttf)$/i.test(responseType)){
                    fontCount ++;
                    fontLength += responseLength;
                }
            }
            next();
        });
    });
    pagerun.on('webdriverOpenUrl', function(){
        bOpenUrl = true;
    });
    pagerun.on('runEnd', function(){
        var htmlInfo = mapTypeList['html'];
        var htmlCount = (htmlInfo && htmlInfo.count) || 0;
        var htmlLength = (htmlInfo && htmlInfo.length) || 0;
        var jsInfo = mapTypeList['js'];
        var jsCount = (jsInfo && jsInfo.count) || 0;
        var jsLength = (jsInfo && jsInfo.length) || 0;
        var cssInfo = mapTypeList['css'];
        var cssCount = (cssInfo && cssInfo.count) || 0;
        var cssLength = (cssInfo && cssInfo.length) || 0;
        var swfInfo = mapTypeList['swf'];
        var swfCount = (swfInfo && swfInfo.count) || 0;
        var swfLength = (swfInfo && swfInfo.length) || 0;
        self.info({
            allCount: allCount,
            allLength: allLength,
            errorCount: errorCount,
            redirectCount: redirectCount,
            gzipCount: gzipCount,
            gzipLength: gzipLength,
            methodCount: methodCount,
            hostnameCount: hostnameCount,
            typeCount: typeCount,
            htmlCount: htmlCount,
            htmlLength: htmlLength,
            jsCount: jsCount,
            jsLength: jsLength,
            cssCount: cssCount,
            cssLength: cssLength,
            imgCount: imgCount,
            imgLength: imgLength,
            swfCount: swfCount,
            swfLength: swfLength,
            fontCount: fontCount,
            fontLength: fontLength,
            methodList: mapMethodList,
            domainList: mapDomainList,
            typeList: mapTypeList,
            mapCharsetList: mapCharsetList
        });
    });
};