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

* AOT 编译器：负责将 `.net` 编译器生成的 IL 代码转换为 C++ 代码。
* 支持虚拟机的运行时库：提供各类服务和抽象，包括垃圾回收。跨平台线程和文件访问接口等。

**libil2cpp**

用于支持虚拟机的运行时库。几乎完全使用 C++ 实现(包含少量特定平台的汇编代码)。以静态库的形式发布，并链接到玩家可执行文件中。libil2cpp 头文件位于 `Unity安装目录/Editor/Data/il2cpp/libil2cpp`

## 使用 IL2CPP 后端的构建步骤

* Roslyn C# 编译器将应用程序的 C# 代码和所有必需的包代码编译为 .NET DLL(托管程序集)
* UnityLinker 执行 [managed code stripping](https://docs.unity3d.com/cn/current/Manual/managed-code-stripping.html)
* il2cpp.exe 把 IL 转换为 C++
* 目标平台 C++ 编译器编译 C++ 和 IL2CPP runtime
* 生成目标平台 native binary(可执行文件或者 DLL)
* 与 Unity Data、metadata、资源和平台工程一起进入最终包

## AOT 编译器

[AOT 编译器](./IL2CPPEXE.md)