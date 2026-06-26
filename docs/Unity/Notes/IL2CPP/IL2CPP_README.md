# IL2CPP

**官方参考文档**

* [IL2CPP 概述](https://docs.unity3d.com/cn/current/Manual/scripting-backends-il2cpp.html)
* [IL2CPP 英文原版文档(6000.4)](https://docs.unity3d.com/6000.4/Documentation/Manual/scripting-backends-il2cpp.html)

**An introduction to IL2CPP internals 内部原理系列**

* [第一篇：IL2CPP 整体架构介绍](https://unity.com/blog/engine-platform/an-introduction-to-ilcpp-internals)
* [第二篇：生成 C++ 代码详解](https://unity.com/blog/engine-platform/il2cpp-internals-a-tour-of-generated-code)
* [第三篇：IL2CPP 生成代码调试技巧](https://unity.com/blog/engine-platform/il2cpp-internals-debugging-tips-for-generated-code)
* [第四篇：方法调用(普通/虚函数调用机制)](https://unity.com/blog/engine-platform/il2cpp-internals-method-calls)
* [第五篇：泛型共享实现原理](https://unity.com/blog/engine-platform/il2cpp-internals-generic-sharing-implementation)
* [第六篇：P/Invoke 互调用封装机制](https://blog.unity.com/technology/il2cpp-internals-pinvoke-wrappers)
* [第七篇：GC 垃圾回收集成原理](https://blog.unity.com/technology/il2cpp-internals-garbage-collector-integration)
* [第八篇：IL2CPP 测试框架(完结篇)](https://blog.unity.com/technology/il2cpp-internals-testing-frameworks)

## 基础架构

IL2CPP 位于 `Unity安装目录/Editor/Data/il2cpp` 下。文件结构如下：

```
BCLExtensions/
build/
external/
libil2cpp/
libmono/
LinkerDescriptors/
il2cpp_default_extra_types.txt
il2cpp_root
Il2CppEagerStaticClassConstructionAttribute.cs
Il2CppSetOptionAttribute.cs
```

IL2CPP 包含两部分内容：

* AOT 编译器：负责将 .net 编译器生成的 IL 代码转换为 C++ 代码。
* 支持虚拟机的运行时库：提供各类服务和抽象，包括垃圾回收。跨平台线程和文件访问接口等。

**AOT 编译器(il2cpp.exe)**

由 C# 编写而成，位于 `Unity安装目录/Editor/Data/il2cpp/build/deploy` 下。`il2cpp.exe` 工具接收由 Unity 附带的 Mono 编译器编译的托管程序集，并生成 C++ 代码，随后我们将这些代码交由特定平台的 C++ 编译器处理。

![xxx](https://unity.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Ffuvbjjlp%2Fproduction%2Fded15e6b264038ede83d176ec6c982c84d19652c-800x300.png&w=828&q=75)

```
PS .\il2cpp.exe -help

Options:
  --convert-to-cpp                                Convert the provided assemblies to C++
  --compile-cpp                                   Compile generated C++ code
  --convert-in-graph                              Use this to run the conversion in a bee graph for fast 0 change builds
  --assembly=<path,path,..>                       One or more paths to assemblies to convert
  --directory=<path,path,..>                      One or more directories containing assemblies to convert
  --extra-types-file=<path,path,..>               One or more files containing a list of additonal generic instance types that should be included in the generated code
  --generatedcppdir=<path>                        The directory where generated C++ code is written
  --symbols-folder=<path>                         The directory where symbol information will be written
  --debug-assembly-name=<value,value,..>          The name of an assembly (including .dll) to emit debug information for.  If this is provided, debug information from all others will be ignored.
  --additional-cpp=<path,path,..>                 Additional C++ files to include
  --enable-analytics                              Enables collection of analytics
  --emit-null-checks                              Enables generation of null checks
  --enable-stacktrace                             Enables generation of stacktrace sentries in C++ code at the start of every managed method. This enables support for stacktraces for platforms that do not have system APIs to walk the stack (for example, one such platform is WebGL)
  --enable-stats                                  Enables conversion statistics
  --enable-array-bounds-check                     Enables generation of array bounds checks
  --enable-divide-by-zero-check                   Enables generation of divide by zero checks
  --emit-comments                                 Annotations to the generated code will be emitted as comments
  --assembly-method=<value>                       String to match the name of method(s) to show the assembly output for
  --disable-generic-sharing                       Disables generic sharing
  --maximum-recursive-generic-depth=<value>       Set the maximum depth to implement recursive generic methods. The default value is 7.
  --generic-virtual-method-iterations=<value>     Set the maximum number of times to iterate looking for generic virtual methods. The default value is 1.
  --code-generation-option=<value>                Specify an option related to code generation
  --file-generation-option=<value>                Specify an option related to file output
  --generics-option=<value>                       Specify an option related to generics
  --feature=<value>                               Enable a feature of il2cpp
  --diagnostic-option=<value>                     Enable a diagnostic ability
  --stats-output-dir=<path>                       The directory where statistics information will be written
  --outputpath=<value>                            Path to output the compiled binary
  --dont-deploy-baselib                           il2cpp will not use it's own baselib
  --verbose                                       Enables verbose output from tools involved in building
  --forcerebuild                                  Forces a rebuild
  --disable-bee-builder                           Disable bee builder and use old buildcode
  --libil2cpp-static                              Links il2cpp as library to the executable
  --disable-runtime-lumping                       Disable lumping for the runtime library
  --libil2cpp-cache-directory=<value>             Cache directory to use when building libil2cpp as dynamic link library
  --assembly-output                               Enables assembly code output from the C++ compiler
  --additional-defines=<value,value,..>           Defines for generated C++ code compilation
  --additional-libraries=<value,value,..>         One or more additional libraries to link to generated code
  --additional-include-directories=<path,path,..> One or more additional include directories
  --additional-link-directories=<path,path,..>    One or more additional link directories
  --plugin=<value,value,..>                       Path to an il2cpp plugin assembly
  --target-is-simulator                           Flag denoting if the compilation target is a simulator.
  --incremental-g-c-time-slice=<value>            Enable incremental GC if n > 0, with a maximum time slice of n ms.
  --relative-data-path=<value>                    Optional. Specifies path of IL2CPP data directory relative to deployed application working directory.
  --configuration=<value>                         The build configuration.  Debug|Release
  --treat-warnings-as-errors                      Enables warnings as errors for compiling generated C++ code
  --compiler-flags=<value,value,..>               Additional flags to pass to the C++ compiler
  --linker-flags=<value,value,..>                 Additional flags to pass to the linker
  --linker-flags-file=<value>                     Additional file that contains flags to pass to the linker
  --build-package-for-testing                     Instruct to build an application package that can be used for testing
  --generate-usym-file                            Generate a symbol file for stacktrace line numbers
  --enable-tiny-diagnostics                       Adds features for helping to debug dots-runtime generated code, such as type IDs
  --tiny-explain-static-constructors              Enables additional comments in StaticConstructors.cpp with extra information about dependencies. Tiny only
  --enable-reload                                 Enable code to allow the runtime to be shutdown and reloaded (this has code size and runtime performance impact).
  --cachedirectory=<path>                         A directory to use for caching compilation related files
  --profiler-report                               Enable generation of a profiler report
  --profiler-output-file=<value>                  The location where to write the profiler output
  --data-folder=<path>                            The directory where non-source code data will be written
  --jobs=<value>                                  The number of cores to use during conversion and compilation.  Defaults to processor count
```

**libil2cpp**

用于支持虚拟机的运行时库。几乎完全使用 C++ 实现(包含少量特定平台的汇编代码)。以静态库的形式发布，并链接到玩家可执行文件中。libil2cpp 头文件位于 `Unity安装目录/Editor/Data/il2cpp/libil2cpp`

使用 IL2CPP 后端的构建步骤：

* Roslyn C# 编译器将应用程序的 C# 代码和所有必需的包代码编译为 .NET DLL(托管程序集)
* UnityLinker 执行 [managed code stripping](https://docs.unity3d.com/cn/current/Manual/managed-code-stripping.html)
* il2cpp.exe 把 IL 转换为 C++
* 目标平台 C++ 编译器编译 C++ 和 IL2CPP runtime
* 生成目标平台 native binary(可执行文件或者 DLL)
* 与 Unity Data、metadata、资源和平台工程一起进入最终包

新建项目(Unity2022.3.62f2)，更改后端为 IL2CPP(Project Settings > Other Settings > Scripting Backend > IL2CPP)，新建自定义脚本，构建项目。

[IL2CPP 代码转换示例](./IL2CPP_Sample.md)

使用 `il2cpp.exe` 手动将托管程序集(DLL)转换为 `C++` 代码。

* 查看构建日志(`%USER%\AppData\Local\Unity\Editor\Editor.log`)，搜索 il2cpp.exe 相关内容
* 执行构建后，在 `构建目录\Il2CppOutputProject\IL2CPP\build\deploy` 目录下，执行 `il2cpp.exe`
> dotnetprofile 可选项: `net45`, `net6.0`, `unityaot-linux`, `unityaot-macos`, `unityaot-win32`, `unityjit`, `unitytiny`

```
.\il2cpp.exe --convert-to-cpp --generatedcppdir="F:/Projects/IL2CPP_Output" --emit-null-checks --enable-array-bounds-check --dotnetprofile=unityaot-win32 --enable-debugger --directory="F:/Projects/HybridCLR_Learning/Build/HybridCLR_Learning/Managed"
```

**其他参数**

* `--print-command-line` 打印命令
* `--profiler-report` 生成 `profile.json`
* `--enable-analytics` 生成 `analytics.json`