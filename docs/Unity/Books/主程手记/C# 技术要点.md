---
title: 第二章：C# 技术要点
article: false
order: 2
---

# C# 技术要点

## Unity3D 中 C# 的底层原理

* `.Net Framework`：一个基于 Windows 平台的 .Net 开发框架，无法跨平台。
* `.Net`：之前的 .Net Core，一个跨平台、开源的 .NET 实现。
* `.NET Standard`：.Net 标准，是一组规范，为了解决 .NET 生态系统在不同实现（如 .NET Framework、.NET Core 等）之间的兼容性问题。
* `Mono`：一个开源、跨平台的 `.Net` 实现。
* `IL/CIL`：一种与特定硬件平台和操作系统无关的中间表示形式，C# 源代码不会直接编译为本地机器码，而是先编译成中间语言(IL)。
* `CLR`：[CLR] 公共语言运行时(Common Language Runtime)。
* `JIT`：即时编译，当 `.NET` 应用程序启动时，公共语言运行时(CLR)会加载程序集，并将其中的 `IL` 代码实时编译成本地机器码，这个过程就是即时编译（Just-In-Time Compilation）。JIT 编译器会根据目标平台的特性生成优化后的机器码，以提高执行效率。
* `AOT`：提前编译(Ahead-of-Time Compilation)，它是一种与即时编译(JIT)相对的编译方式，在程序运行之前就将代码编译成本地机器码，而非在运行时进行编译。从 `.NET 6` 开始，也支持对应用进行 `AOT` 发布，通过 `dotnet publish` 命令并指定相应的参数，可以生成 `AOT` 编译的应用。
* `IL2CPP`：将 IL 代码转换为 C++ 代码。修改版本的 Mono 维护成本大，版权受限，运行效率不高。IL2CPP 有自己的虚拟机，但是不执行 JIT 或者翻译任何代码，只用于内存管理。
* **托管代码**：C# 代码生成的 IL 编码我们称为托管代码，由虚拟机的 JIT 编译执行，依赖于 .Net 运行时，其中的对象无须手动释放，它们由 GC 管理。
* **非托管代码**：不依赖于 .Net 运行时，C/C++ 或 C# 中以不安全类型写的代码，虚拟机无法跟踪到这类代码对象，需要手动管理内存分配和释放。

`IL2CPP` 的工作原理

* 将 Unity Scripting API 代码编译为常规 `.NET DLL`（托管程序集）。
* 应用托管字节码剥离。此步骤可显著减小构建的游戏大小。
* 将所有托管程序集转换为标准 `C++` 代码。
* 使用本机平台编译器编译生成的 `C++` 代码和 `IL2CPP` 的运行时部分。
* 将代码链接到可执行文件或 DLL，具体取决于目标平台。

![](./assets/IL2CPP-3.png)
> 使用 IL2CPP 构建项目时所采取的自动步骤的图表

## List 源码剖析

[List 源码剖析](./../../../Language/Csharp/SourceCode/SourceCode_List.md)

## Dictionary 源码剖析



## 参考

* [Unity 主程手记记录摘要](https://s0nreir.github.io/2022/08/21/Unity%E4%B8%BB%E7%A8%8B%E6%89%8B%E8%AE%B0%E8%AF%BB%E4%B9%A6%E6%91%98%E8%AE%B0_1-2.html)


[CLR]: https://learn.microsoft.com/zh-cn/dotnet/standard/clr