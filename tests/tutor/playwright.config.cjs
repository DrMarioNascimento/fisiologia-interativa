const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: __dirname, testMatch: 'browser.spec.cjs', workers:1, retries:0,
  reporter:'list', outputDir:'../../test-results/tutor',
  use:{browserName:'chromium',channel:'chrome',screenshot:'only-on-failure'},
  projects:[{name:'desktop',use:{viewport:{width:1280,height:900}}},
    {name:'mobile',use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}}]
});
