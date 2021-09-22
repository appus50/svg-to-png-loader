"use strict";

exports.__esModule = true;
exports.default = _default;

var loaderUtils = _interopRequireWildcard(require("loader-utils"));

var _path = _interopRequireDefault(require("path"));

var _sharp = _interopRequireDefault(require("sharp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const prepareSizes = options => {
  const result = [options.height ? [{
    height: options.height,
    width: options.width || options.height
  }] : (options.sizes || []).map(val => val.trim()).map(val => [val, /([0-9]+)([x,])?([0-9]+)?/.exec(val)]).map(val => val[1]).map(val => ({
    height: val[1],
    width: val[3] || val[1]
  }))][0];

  if (result.length === 0) {
    return [{
      width: 1,
      height: 1
    }];
  }

  return result.map(size => ({
    width: parseInt(`${size.width || 1}`),
    height: parseInt(`${size.height || 1}`)
  }));
};

function _default(content) {
  const options = Object.assign({}, loaderUtils.getOptions(this), loaderUtils.parseQuery(this.resourceQuery || '?'));
  const context = options.context || this.rootContext;
  const callback = this.async();
  const logger = this.getLogger ? this.getLogger('svg-to-png-loader') : console;
  options.name = options.name || '[contenthash].png';
  options.name = options.name.replace('[name]', _path.default.basename(this.resourcePath).replace(/\..*$/, ''));
  let outputPathBase = loaderUtils.interpolateName(this, options.name, {
    context,
    content,
    regExp: options.regExp
  });

  if (options.outputPath) {
    outputPathBase = _path.default.join(options.outputPath, outputPathBase);
  }

  Promise.all(prepareSizes(options).map(size => {
    return new Promise((resolve, reject) => {
      // Determine webpack output path
      const outputPath = outputPathBase.replace(/\[([^\]]+)]/g, match => {
        match = match.replace(/^\[|]$/g, '');
        return size[match] || size[match] === 0 ? size[match] : match;
      }); // Do conversion

      (0, _sharp.default)(this.resourcePath).resize(size.width, size.height).png().toBuffer().then(data => {
        this.emitFile(outputPath, data);
        resolve({
          size,
          outputPath
        });
      });
    });
  })).then(results => {
    callback(null, content);
  }).catch(error => {
    callback(error);
  });
}
