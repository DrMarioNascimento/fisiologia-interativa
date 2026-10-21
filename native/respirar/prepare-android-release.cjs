// Run after cap add/sync android. Signing credentials remain outside the repository.
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const app = path.join(root, 'android/app');
const stringsPath = path.join(app, 'src/main/res/values/strings.xml');
let strings = fs.readFileSync(stringsPath, 'utf8');
for (const name of ['app_name', 'title_activity_main']) {
  strings = strings.replace(new RegExp('(<string name="' + name + '">)[^<]*(</string>)'), '$1Biofeedback Respiratório$2');
}
fs.writeFileSync(stringsPath, strings);
fs.cpSync(path.join(root, 'resources/android-res'), path.join(app, 'src/main/res'), {recursive:true});
const manifestPath = path.join(app, 'src/main/AndroidManifest.xml');
let manifest = fs.readFileSync(manifestPath, 'utf8');
if (!manifest.includes('tools:node="remove"')) {
  manifest = manifest.replace('<manifest ', '<manifest xmlns:tools="http://schemas.android.com/tools" ');
  manifest = manifest.replace('</manifest>', '<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" tools:node="remove"/>\n</manifest>');
  fs.writeFileSync(manifestPath, manifest);
}
const gradle = path.join(app, 'build.gradle');
let text = fs.readFileSync(gradle, 'utf8');
text = text.replace(/versionCode \d+/, 'versionCode 2').replace(/versionName "[^"]+"/, 'versionName "1.0.1"');
if (!text.includes('RESPIRAR_KEYSTORE')) {
  text += `
android {
    signingConfigs {
        upload {
            storeFile file(System.getenv('RESPIRAR_KEYSTORE'))
            storePassword System.getenv('RESPIRAR_STORE_PASSWORD')
            keyAlias 'respirar-upload'
            keyPassword System.getenv('RESPIRAR_KEY_PASSWORD')
        }
    }
    buildTypes { release { signingConfig signingConfigs.upload } }
}
`;
}
fs.writeFileSync(gradle, text);
console.log('Android release 1.0.1 (2): icon and signing configuration ready.');
