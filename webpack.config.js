// module.exports = {
//   module: {
//     rules: [
//       {
//         test: /\.m?js/,
//         resolve: {
//           fullySpecified: false
//         }
//       }
//     ]
//   },
//   devServer: {
//     headers: {
//       'Cross-Origin-Embedder-Policy': 'require-corp',
//       'Cross-Origin-Opener-Policy': 'same-origin'
//     }
//   },
//   resolve: {
//     fallback: {
//       "buffer": require.resolve("buffer/"),
//       "stream": require.resolve("stream-browserify"),
//       "util": require.resolve("util/"),
//       "assert": require.resolve("assert/")
//     }
//   }
// };

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
  });
};