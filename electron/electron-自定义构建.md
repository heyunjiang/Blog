# electron-自定义构建

time: 2021-05-26 16:49:59  
author: heyunjiang

## 1 基础构建步骤

准备工作  
1. 安装 python2 python3，并加载相应证书
2. 找个目录 git clone depot_tools，并添加相应环境变量
3. 全局安装 `@electron/build-tools`

1. 下载官方 electron 构建工具：npm i -g @electron/build-tools
2. 初始化项目结构，生成 yoyo 项目目录，内部包含了 .gclient 文件，作为 gclient 入口，并：`mkdir yoyo & cd yoyo`, `e init yoyo`
3. 拉取代码：`e sync -v --no-history`；会首先在 `~/.electron_build_tools/third_party/` 中安装 depot_tools，然后执行 `gclient` 命令
4. 等待代码拉取：这个过程会挺久
5. 构建打包: `e build`。最开始会加载 xcode

## 2 踩坑集合

### 2.1 xcode 和 macos version 不匹配

在使用最新版 electron 时，它内部要求的 xcode 版本为 12.4.0，但是这个版本的 xcode 又要求 macos 至少为 	macOS Catalina 10.15.4  
导致 e build 构建失败

解决方案  
1. 使用 electron 历史版本 `https://github.com/electron/electron@058222a9f1527698180e18e2ad64f1b714451d60` 来构建
2. 升级 macos 为最新版本系统

### 2.2 xcode 依赖找不到 Xcode.InterfaceBuilderBuildSupport.PlatformDefinition

```bash
Referenced from: /Users/.electron_build_tools/third_party/Xcode/Xcode-12.4.0.app/Contents/PlugIns/IDEInterfaceBuilderCocoaTouchIntegration.framework/Versions/A/IDEInterfaceBuilderCocoaTouchIntegration
  Reason: image not found
2021-05-28 10:14:55.999 ibtoold[94996:942123] [MT] DVTPlugInExtensionFaulting: Failed to fire fault for extension Xcode.InterfaceBuilderKit.iOSIntegration.Singletons: Error Domain=DVTPlugInErrorDomain Code=2 "Loading a plug-in failed." UserInfo={DVTPlugInIdentifierErrorKey=com.apple.dt.IDE.IDEInterfaceBuilderCocoaTouchIntegration, DVTPlugInExecutablePathErrorKey=/Users/.electron_build_tools/third_party/Xcode/Xcode-12.4.0.app/Contents/PlugIns/IDEInterfaceBuilderCocoaTouchIntegration.framework/IDEInterfaceBuilderCocoaTouchIntegration, NSLocalizedRecoverySuggestion=The plug-in or one of its prerequisite plug-ins may be missing or damaged and may need to be reinstalled., DVTPlugInDYLDErrorMessageErrorKey=dlopen(/Users/.electron_build_tools/third_party/Xcode/Xcode-12.4.0.app/Contents/PlugIns/IDEInterfaceBuilderCocoaTouchIntegration.framework/IDEInterfaceBuilderCocoaTouchIntegration, 0): Library not loaded: /Library/Developer/PrivateFrameworks/CoreSimulator.framework/Versions/A/CoreSimulator

subprocess.CalledProcessError: Command '['xcrun', 'ibtool', '--errors', '--warnings', '--notices', '--output-format', 'human-readable-text', '--minimum-deployment-target', '10.11.0', '--compile', '/Users/Desktop/Blog/hyj-electron/electron/src/out/Testing/gen/electron/electron_xibs_compile_ibtool/MainMenu.nib', '/Users/Desktop/Blog/hyj-electron/electron/src/electron/shell/common/resources/mac/MainMenu.xib']' died with <Signals.SIGABRT: 6>.
[13966/42273] ACTION //electron:electr...undle(//build/toolchain/mac:clang_x64)
ninja: build stopped: subcommand failed
```

初次尝试：卸载 xcode，重新 install

### 2.3 unable to verify the first certificate

```bash
error /Blog/example/electrontest/hyj/electron/src/electron/node_modules/dugite: Command failed.
Exit code: 1
Command: node ./script/download-git.js
Arguments: 
Directory: /Blog/example/electrontest/hyj/electron/src/electron/node_modules/dugite
Output:
Downloading Git from: https://github.com/desktop/dugite-native/releases/download/v2.19.2/dugite-native-v2.19.2-515d7ec-macOS.tar.gz
Error raised while downloading https://github.com/desktop/dugite-native/releases/download/v2.19.2/dugite-native-v2.19.2-515d7ec-macOS.tar.gz Error: unable to verify the first certificate
```

执行 `export NODE_TLS_REJECT_UNAUTHORIZED=0` 让 nodejs 忽略证书

### 2.4 Unable to load AWS_CREDENTIAL_FILE (%s)' % full_path

```bash
running 'python3 src/content/test/gpu/gpu_tests/mediapipe_update.py' in '/Blog/example/electrontest/hyj/electron'
0> Failed to fetch file gs://chromium-telemetry/1d6ca505c384ef8f5af14e7958f62d54ec126356 for /Blog/example/electrontest/hyj/electron/src/content/test/data/gpu/mediapipe_zip/mediapipe_chromium_tests.zip, skipping. [Err: /.electron_build_tools/third_party/depot_tools/external_bin/gsutil/gsutil_4.28/gsutil/third_party/boto/boto/pyami/config.py:69: UserWarning: Unable to load AWS_CREDENTIAL_FILE ()
  warnings.warn('Unable to load AWS_CREDENTIAL_FILE (%s)' % full_path)
Failure: [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed (_ssl.c:727).
]

# 执行如下命令可以快速复现
python3 src/content/test/gpu/gpu_tests/mediapipe_update.py
# or
download_from_google_storage --no_resume --no_auth --bucket chromium-telemetry -s /Desktop/Blog/hyj-electron/electron/src/content/test/data/gpu/mediapipe_zip/mediapipe_chromium_tests.zip.sha1
```

过程分析：提示证书验证失败，分析了 `/.electron_build_tools/third_party/depot_tools/external_bin/gsutil/gsutil_4.28/gsutil/third_party/boto/boto/pyami/config.py` 和 `/Blog/depot_tools/download_from_google_storage.py` 文件，发现是自己添加的 AWS_CREDENTIAL_FILE 环境变量，depot_tools 猜测的可能是证书验证失败。  
继续分析 `src/content/test/gpu/gpu_tests/mediapipe_update.py` 文件，发现它只是需要把 `/electron/src/content/test/data/gpu/mediapipe_zip/mediapipe_chromium_tests.zip` 文件下载下来，于是走了手动下载

解决方案：手动下载，`https://storage.googleapis.com/chromium-telemetry/1d6ca505c384ef8f5af14e7958f62d54ec126356`，在 chrome 浏览器中输入这段地址，将下载下来的文件保存到相应路径中；同时发现，在 `src/.gitignore` 中，就添加了 mediapipe_chromium_tests.zip 忽略

还好需要手动下载的就这么一个，后续遇到相关的问题可以尝试继续这么搞。

具体下载失败原因可能跟 chromium 服务器配置相关

## 2 参考文章

[v8 编译指墙](https://www.cwiki.cn/archives/mac%E4%B8%8Bv8android%E7%BC%96%E8%AF%91%E6%8C%87%E5%A2%99#134-%E5%85%B6%E4%BB%96%E9%97%AE%E9%A2%98)
