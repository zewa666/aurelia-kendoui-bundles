# aurelia-kendoui-bundles

## Instructions

1. npm install
2. jspm install
3. jspm update (to update all packages)
4. update the version of Kendo in config.js's paths section if necessary
5. gulp bundle
6. copy everything from `config.js` to `config2.js` but afterwards use [these lines](https://github.com/aurelia-ui-toolkits/aurelia-kendoui-bundles/blob/402afc52e830f454f330592f9766694529b6eb8c/config2.js#L10-L14) for the paths. **Increment the versions of these paths to a version you will create in step 8**. Also update the Kendo version in the paths section if necessary
7. push to github
8. create a release on github
9. update the gist's index.html to reflect the new version:

![img](http://i.imgur.com/Yc5FyRH.png)


![Imgur](http://i.imgur.com/33U3EiG.png)
