var bundle = [
  "[aurelia-kendoui-bridge]",
  "[aurelia-kendoui-bridge/**/*.js]",
  "aurelia-kendoui-bridge/**/*.html!text",
  "kendo-ui/js/*.js",
  "jquery",
  "text",
  "aurelia-framework",
  "aurelia-bootstrapper",
  "aurelia-router",
  "aurelia-templating-binding",
  "aurelia-templating-resources",
  "aurelia-templating-router",
  "aurelia-loader-default",
  "aurelia-history-browser",
  "aurelia-logging-console",
  "aurelia-animator-css",
  "aurelia-binding",
  "aurelia-bootstrapper",
  "aurelia-dependency-injection",
  "aurelia-event-aggregator",
  "aurelia-fetch-client",
  "aurelia-framework",
  "aurelia-history",
  "aurelia-history-browser",
  "aurelia-http-client",
  "aurelia-loader",
  "aurelia-loader-default",
  "aurelia-logging",
  "aurelia-logging-console",
  "aurelia-metadata",
  "aurelia-path",
  "aurelia-route-recognizer",
  "aurelia-router",
  "aurelia-task-queue",
  "aurelia-templating",
  "aurelia-templating-binding",
  "aurelia-templating-resources",
  "aurelia-templating-router"
];

module.exports = {
  "bundles": {
    "bundles/bundle": {
      "includes": bundle,
      "excludes": [
        "[kendo-ui/js/angular.min.js]",
        "[kendo-ui/js/jquery.min.js]",
        "[kendo-ui/js/kendo.angular.min.js]",
        "[kendo-ui/js/kendo.angular2.min.js]",
        "[kendo-ui/js/kendo.spreadsheet.min.js]",
        "[kendo-ui/js/kendo.all.min.js]",
        "[kendo-ui/js/kendo.web.min.js]",
        "[kendo-ui/js/kendo.dataviz.min.js]",
        "[kendo-ui/js/kendo.dataviz.mobile.min.js]",
        "[kendo-ui/js/kendo.mobile.min.js]"
      ],
      "options": {
        "inject": true,
        "minify": true
      }
    }
  }
}
