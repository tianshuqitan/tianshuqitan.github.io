---
source: https://docs.unity3d.com/2022.3/Documentation/Manual/performance-memory-overview.html
article: false
index: false
---

# Unity 中的内存

[原文地址 - UnityManual](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-memory-overview.html)

## 概览

为了确保您的应用程序运行时没有性能问题，了解 Unity 如何使用和分配内存非常重要。本文档的这一部分解释了 Unity 中内存的工作原理，旨在帮助希望提高应用程序内存性能的读者。

Unity 使用三个内存管理层来处理应用程序中的内存：

* [托管内存(Managed memory)](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-memory-overview.html#managed-memory)：一个受控的内存层，使用托管堆和 [垃圾回收器](https://en.wikipedia.org/wiki/Garbage_collection_(computer_science)) 来自动分配和指派内存。
* [C# 非托管内存(C# unmanaged memory)](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-memory-overview.html#unmanaged-memory)：可以结合 Unity Collections 命名空间和包(package)使用的内存管理层。这种内存类型被称为 "非托管"，因为它不使用 [垃圾回收器](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-garbage-collector.html) 来管理未使用的内存部分。
* [原生内存(Native memory)](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-memory-overview.html#native-memory)：Unity 用于运行引擎的 C++ 内存。在大多数情况下，Unity 用户无法访问此内存，但如果您想微调应用程序性能的某些方面，了解它会很有用。

**托管内存**

[Mono 和 IL2CPP 的](https://docs.unity3d.com/2022.3/Documentation/Manual/scripting-backends.html) 脚本虚拟机(VM) 实现了 **托管内存** 系统，有时也称为脚本内存系统。这些 VM 提供了一个受控的内存环境，分为以下几种不同类型：

* **托管堆(The managed heap)**：VM 使用 [垃圾回收器](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-garbage-collector.html)(GC) 自动控制的内存区域。因此，在托管堆上分配的内存被称为 **GC 分配(GC Allocation)**。[Profiler](https://docs.unity3d.com/2022.3/Documentation/Manual/Profiler.html) 将此类分配的任何发生记录为 **GC.Alloc** 采样。
* **脚本栈(The scripting stack)**：当您的应用程序进入和退出任何代码范围时，脚本栈会建立和展开。
* **原生 VM 内存(Native VM memory)**：包含与 Unity 脚本层相关的内存。大多数时候，您不需要操作原生 VM 内存，但了解它包含与您的代码生成的执行代码相关的内存会很有用，特别是围绕 [泛型(generics)](https://docs.microsoft.com/en-us/dotnet/csharp/fundamentals/types/generics) 的使用、[反射(Reflection)](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/reflection) 使用的类型元数据，以及运行 VM 所需的内存。

由于托管内存系统使用 VM，它具有一个受控环境，可以自动跟踪分配的引用以管理其生命周期。这意味着您的应用程序不太可能过早释放内存，而其他代码正在尝试访问它。这也意味着您可以对 [内存泄漏(memory leaks)](https://en.wikipedia.org/wiki/Memory_leak) 提供一些保护，内存泄漏发生在内存无法从代码访问或未使用的内存堆积时。

在 Unity 中使用托管内存是管理应用程序内存的最简单方法；但它有一些缺点。垃圾回收器使用方便，但在释放和分配内存方面也是不可预测的，这可能会导致性能问题，例如卡顿，这发生在垃圾回收器必须停止以释放和分配内存时。为了解决这种不可预测性，您可以使用 [C# 非托管内存层](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-memory-overview.html#unmanaged-memory)。

**C# 非托管内存**

C# 非托管内存层允许您访问原生内存层以微调内存分配，同时方便地编写 C# 代码。

您可以使用 Unity 核心 API 中的 `Unity.Collections` 命名空间(包括 [NativeArray](https://docs.unity3d.com/2022.3/Documentation/ScriptReference/Unity.Collections.NativeArray_1.html)) 以及 [Unity Collections 包](https://docs.unity3d.com/Packages/com.unity.collections@latest) 中的数据结构来访问 C# 非托管内存。如果您使用 Unity 的 C# Job 系统或 Burst，则必须使用 C# 非托管内存。有关此内容的更多信息，请参阅 [Job 系统](https://docs.unity3d.com/2022.3/Documentation/Manual/JobSystem.html) 和 [Burst](http://docs.unity3d.com/Packages/com.unity.burst@latest) 的文档。

**原生内存**

Unity 引擎的内部 C/C++ 核心拥有自己的内存管理系统，称为**原生内存**。在大多数情况下，您无法直接访问或修改此内存类型。

Unity 将项目中的场景(scenes)、资源(assets)、图形 API、图形驱动程序、子系统和插件(plug-in)缓冲区以及分配存储在原生内存中，这意味着您可以通过 Unity 的 C# API 间接访问原生内存。这意味着您可以以安全简便的方式操作应用程序的数据，而不会失去 Unity 原生核心中原生且高性能代码的优势。

大多数时候，您不需要与 Unity 的原生内存交互，但您可以在使用 [Profiler](https://docs.unity3d.com/2022.3/Documentation/Manual/ProfilerWindow.html) 时通过 [Profiler 标记(Profiler markers)](https://docs.unity3d.com/2022.3/Documentation/Manual/profiler-markers.html) 查看它如何影响应用程序的性能。您还可以通过更改 Unity 原生内存分配器的一些可配置设置来调整应用程序的性能。有关更多信息，请参阅 [原生内存](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-native-allocators.html) 部分。

## 托管内存

Unity 的**托管内存系统**是基于 [Mono 或 IL2CPP 虚拟机(VM)](https://docs.unity3d.com/2022.3/Documentation/Manual/scripting-backends.html) 的 C# 脚本环境。托管内存系统的优点在于它管理内存的释放，因此您无需通过代码手动请求释放内存。

Unity 的托管内存系统使用 [垃圾回收器](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-garbage-collector.html) 和 [托管堆](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-managed-memory.html#managed-heap) 来自动释放**脚本(scripts)** 不再持有任何引用的内存分配。这有助于防止内存泄漏。内存泄漏发生在内存被分配后，对其的引用丢失，然后内存从未被释放，因为它需要一个 [引用(reference)](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-managed-memory.html#value-reference) 来释放它。

此内存管理系统还保护内存访问，这意味着您无法访问已释放的内存，或您的代码从未有效访问过的内存。但是，此内存管理过程会影响运行时性能，因为分配托管内存对 CPU 来说非常耗时。[垃圾回收(Garbage collection)](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-garbage-collector.html) 也可能会停止 CPU 执行其他工作，直到它完成。

**值类型和引用类型**

当调用方法时，脚本后端将其参数的值复制到为该特定调用保留的内存区域中，该数据结构称为**调用栈(call stack)**。脚本后端可以快速复制占用少量字节的数据类型。然而，对象、字符串和数组通常要大得多，脚本后端定期复制这些类型的数据效率很低。

托管代码中所有非空 [引用类型对象(reference-type objects)](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/reference-types) 和所有 [装箱值类型对象(boxed value-typed objects)](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing) 都必须在托管堆上分配。

熟悉值类型和引用类型非常重要，这样您才能有效地管理代码。有关更多信息，请参阅 Microsoft 关于 [值类型](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types) 和 [引用类型](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/reference-types) 的文档。

**自动内存管理**

创建对象时，Unity 从一个称为**堆(heap)** 的中央池中分配存储它所需的内存，堆是 Unity 项目选择的脚本运行时(Mono 或 IL2CPP)自动管理的内存区域。当对象不再使用时，它曾经占用的内存可以被回收并用于其他用途。

[Unity 的脚本后端](https://docs.unity3d.com/2022.3/Documentation/Manual/scripting-backends.html) 使用 [垃圾回收器](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-garbage-collector.html) 来自动管理应用程序的内存，这样您就不需要通过显式方法调用来分配和释放这些内存块。自动内存管理比显式分配/释放需要更少的编码工作，并减少内存泄漏的可能性。

**托管堆概述**

**托管堆**是 Unity 项目选择的脚本运行时(Mono 或 IL2CPP)自动管理的内存区域。

![A quantity of memory. Marked A on the diagram is some free memory.](https://docs.unity3d.com/2022.3/Documentation/uploads/Main/managed-heap.jpg)

> 一块内存。图中标注的 A 是一些空闲内存。

在上图中，蓝色框表示 Unity 分配给托管堆的内存量。其中的白色框表示 Unity 存储在托管堆内存空间中的数据值。当需要额外的数据值时，Unity 从托管堆的空闲空间(标注 **A**)分配它们。

**内存碎片和堆扩展**

![A quantity of memory, with some objects released represented by grey dashed lines.](https://docs.unity3d.com/2022.3/Documentation/uploads/Main/managed-heap-removed-objects.jpg)

> 一块内存，一些已释放的对象用灰色虚线表示。

上图显示了内存碎片的示例。当 Unity 释放对象时，对象占用的内存被释放。然而，空闲空间不会成为一个大的 "空闲内存" 池的一部分。

已释放对象两侧的对象可能仍在被使用。因此，释放的空间是其他内存段之间的 "间隙"。Unity 只能使用此间隙来存储与已释放对象大小相同或更小的数据。

这种情况称为**内存碎片(memory fragmentation)**。这发生在堆中有大量可用内存，但它仅在对象之间的 "间隙" 中可用时。这意味着即使有足够的总空间用于大内存分配，托管堆也找不到足够大的连续内存块来分配给该分配。

![The object annotated A, is the new object needed to be added to the heap. The items annotated B are the memory space that the released objects took up, plus the free, unreserved memory. Even though there is enough total free space, because there isnt enough contiguous space, the memory for the new object annotated A cant fit on the heap, and the garbage collector must run.](https://docs.unity3d.com/2022.3/Documentation/uploads/Main/managed-heap-fragmentation.jpg)

> 标注 A 的对象是需要添加到堆中的新对象。标注 B 的项是已释放对象占用的内存空间，加上空闲的、未保留的内存。即使有足够的总空闲空间，由于没有足够的连续空间，标注 A 的新对象的内存无法容纳在堆中，并且必须运行垃圾回收器。

如果分配了一个大对象并且没有足够的连续空闲空间来容纳它，如上图所示，Unity 内存管理器会执行两个操作：

* 首先，如果垃圾回收器尚未运行，它会运行。这会尝试释放足够的空间来满足分配请求。
* 如果在垃圾回收器运行后，仍然没有足够的连续空间来容纳请求的内存量，则堆必须扩展。堆扩展的具体量取决于平台；然而，在大多数平台上，当堆扩展时，它会以先前扩展量的两倍进行扩展。

**托管堆扩展注意事项**

堆的意外扩展可能会带来问题。Unity 的垃圾回收策略往往会更频繁地产生内存碎片。您应该注意以下几点：

* Unity 在托管堆扩展时不会定期释放分配给托管堆的内存；相反，它会保留扩展后的堆，即使其中很大一部分是空的。这是为了防止在发生进一步的大量分配时需要重新扩展堆。
* 在大多数平台上，Unity 最终会将托管堆空闲部分使用的内存释放回操作系统。发生这种情况的时间间隔不确定且不可靠。
* 垃圾回收器不会清除原生内存对象或其他原生分配。[Resources.UnloadUnusedAssets](https://docs.unity3d.com/2022.3/Documentation/ScriptReference/Resources.UnloadUnusedAssets.html) 会为任何不再有任何引用指向它的原生对象执行此操作。它还会触发 `GC.Collect` 以确保这些引用的状态是最新的。请记住：
  * `UnloadUnusedAssets` 不会自动触发，仅在手动和**场景**更改时触发。如果您想更早地释放该内存(例如，对于 RAM 较低的平台上的全屏 RenderTextures 来说至关重要)，您应该对对象调用 [Destroy](https://docs.unity3d.com/2022.3/Documentation/ScriptReference/Object.Destroy.html)，以充分利用您拥有的内存。
  * 存在托管内存泄漏的风险。如果您保留了对已清理对象的引用，则存在泄漏托管对象引用的原生对象的风险。静态字段和事件是此类内存泄漏的常见来源。有关如何使用 Memory Profiler 分析这些问题的更多信息，请参阅 Memory Profiler 包文档中的 [托管 Shell 对象(Managed shell objects)](https://docs.unity3d.com/Packages/com.unity.memoryprofiler@1.1/manual/managed-shell-objects.html)。
  * 调用 `UnloadUnusedAssets` 或 `GC.Collect` 会触发 CPU 密集型进程，您可能希望在 Gameplay 期间避免这样做。

## 原生内存

> **注意**：本节中关于分配器的信息**仅适用于原生内存**，不适用于托管堆，托管堆在 [托管内存](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-managed-memory.html) 部分中介绍。本节假设您对原生内存管理和分配器有一般了解。

应用程序使用内存分配器来平衡性能和可用内存空间。如果应用程序有大量空闲内存，它可以在加载 **场景** 和帧时优先使用更快、内存占用更多的分配器。然而，如果应用程序内存有限，即使这意味着使用较慢的分配器，它也需要有效地使用该内存。为了帮助您为不同的项目获得最佳性能，您可以自定义 Unity 的分配器以适应每个应用程序的大小和要求。

Unity 有五种分配器类型。每种类型都有不同的算法将分配放入内存块中，因此适用于不同的分配。分配之间的重要区别通常是持久性或分配生命周期，这决定了分配应该去哪里。例如，长期存在的(持久的)分配会进入堆和桶分配器，而短期存在的分配会进入线程安全线性分配器和 TLS 分配器。

下表列出了每种分配器类型的算法和用途：

| **分配器类型** | **算法** | **用途** |
| :--- | :--- | :--- |
| [动态堆(Dynamic heap)](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-dynamic-heap-allocator.html) | 两级隔离适配(Two Level Segregated Fit, TLSF) | • 主要分配器 <br>• Gfx 分配器 <br>• Typetree 分配器 <br>• 文件缓存分配器 <br>• Profiler 分配器 <br>• Editor Profiler 分配器(仅在 Editor 中) |
| [桶(Bucket)](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-bucket-allocator.html) | 固定大小无锁分配器 | 作为小型分配的共享分配器，用于：<br>• 主要分配器 <br>• Gfx 分配器 <br>• Typetree 分配器 <br>• 文件缓存分配器 |
| [双线程(Dual thread)](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-dual-thread-allocator.html) | 根据大小和线程 ID 重定向分配 | • 主要分配器 <br>• Gfx 分配器 <br>• Typetree 分配器 <br>• 文件缓存分配器 |
| [线程本地存储(TLS)栈(Thread Local Storage(TLS) stack)](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-tls-stack-allocator.html) | 后进先出(LIFO) 栈 | 临时分配 |
| [线程安全线性(Threadsafe linear)](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-threadsafe-linear-allocator.html) | 循环首次进入首次退出(Round robin FIFO) | 用于将数据传递给 Job 的缓冲区 |

> **注意**：本文档中的示例使用当您关闭 Player 或 Editor 时写入日志的内存使用报告，前提是您使用了 `-log-memory-performance-stats` 命令行参数。要查找您的日志文件，请按照 [日志文件页面](https://docs.unity3d.com/2022.3/Documentation/Manual/LogFiles.html) 上的说明进行操作。

### 动态堆分配器(Dynamic Heap Allocator)

动态堆分配器是主要的堆分配器。它将两级隔离适配(TLSF)算法应用于内存块。

每个平台都有一个默认块大小，[您可以自定义](https://docs.unity3d.com/2022.3/Documentation/Manual/memory-allocator-customization.html)。分配必须小于半个块。半个块或更大的分配对于动态堆分配器来说太大，在这种情况下，Unity 会使用虚拟内存 API 进行分配。

动态堆分配器的示例使用报告：

```
[ALLOC_DEFAULT_MAIN]
Peak usage frame count: [16.0 MB-32.0 MB]: 497 frames, [32.0 MB-64.0 MB]: 1 frames
Requested Block Size 16.0 MB
Peak Block count 2
Peak Allocated memory 54.2 MB
Peak Large allocation bytes 40.2 MB
```

在此示例中，TLSF 块大小设置为 16 MB，Unity 已分配两个块。分配器的峰值使用量为 54.2MB。在这 52.4MB 中，40.2MB 未在 TLSF 块中分配，而是回退到虚拟内存。大多数帧分配了 16-32MB 的内存，而一帧(可能是加载帧)的峰值内存为 32-64MB。

如果您增加块大小，大分配将保留在动态堆中，而不是回退到虚拟内存。然而，该块大小可能导致内存浪费，因为这些块可能未被充分使用。

> **提示**：类型树和文件缓存分配器使用动态堆分配。为了节省它们在这种算法下可能使用的内存块，您可以将类型树块大小和文件缓存块大小设置为 0。原本会使用类型树和缓存的分配将回退到主要分配器。**注意**，这会增加原生内存碎片的风险。有关如何设置这些块大小的信息，请参阅 [自定义分配器](https://docs.unity3d.com/2022.3/Documentation/Manual/memory-allocator-customization.html)。

### 桶分配器(Bucket Allocator)

桶分配器是一种快速的无锁分配器，用于执行小型分配。通常，桶分配器用作加速小型分配的第一步，然后它们才会进入堆分配器。

分配器为分配保留内存块。每个块被分成 16KB 的**子部分(subsections)**。这是不可配置的，并且不会出现在用户界面中。每个子部分被分成**分配(allocations)**。分配大小是配置的固定大小的倍数，称为**粒度(granularity)**。

**示例配置**

以下示例配置演示了为分配保留块的过程：

![Shared Bucket Allocator for the Windows, Mac and Linux Player](https://docs.unity3d.com/2022.3/Documentation/uploads/Main/Shared_Bucket.png)

> Windows、Mac 和 Linux Player 的共享桶分配器(Shared Bucket Allocator)，`Project Settings > Memory Settings > Main Allocator > Shared Bucket Allocator`。

在此设置中，总**块(block)** 大小(**Bucket Allocator Block Size**)为 4MB，分配的粒度(**Bucket Allocator Granularity**)为 16B。第一次分配为 16B，第二次为 32B(2*16)，然后是 48B、64B、80B、96B、112B 和 128B，总共有八个桶(**Bucket Allocator BucketCount**)。

每个子部分包含不同数量的桶。要计算子部分中的桶数，请将子部分大小(16KB) 除以粒度大小。例如：

* 当分配粒度为 64B 时，一个子部分中可容纳 256 个桶。
* 当分配粒度为 16B 时，一个子部分中可容纳 1,024 个桶。

**开发版本和发布版本比较**

桶分配器会为**开发版本(development build)** 和发布版本生成不同的使用报告，因为在开发版本中，每个分配都有一个额外的 40B 头部。下图演示了 16B 和 64B 分配的开发版本和发布版本之间的差异：

![Development and Release builds comparison](https://docs.unity3d.com/2022.3/Documentation/uploads/Main/memory_allocation.png)

> 开发版本和发布版本比较

头部是分配器在分配了 4MB 中的 2MB 后报告已满的原因：

```
[ALLOC_BUCKET]
      Large Block size 4.0 MB
      Used Block count 1
      Peak Allocated bytes 2.0 MB
      Failed Allocations. Bucket layout:
        16B: 64 Subsections = 18724 buckets. Failed count: 3889
        32B: 17 Subsections = 3868 buckets. Failed count: 169583
        48B: 31 Subsections = 5771 buckets. Failed count: 39674
        64B: 28 Subsections = 4411 buckets. Failed count: 9981
        80B: 17 Subsections = 2321 buckets. Failed count: 14299
        96B: 6 Subsections = 722 buckets. Failed count: 9384
        112B: 44 Subsections = 4742 buckets. Failed count: 5909
        128B: 49 Subsections = 4778 buckets. Failed count: 8715
```

在同一项目的发布版本中，分配器块大小足够：

```
[ALLOC_BUCKET]
      Large Block size 4.0 MB
      Used Block count 1
      Peak Allocated bytes 3.3 MB
```

如果桶分配器已满，分配将回退到另一个分配器。使用报告显示使用统计信息，包括失败的分配数量。如果报告显示失败计数线性增加，则很可能是在计算帧时发生的失败分配，而不是加载时。回退分配对于**场景**加载来说不是问题，但如果它们在计算帧时发生，则会影响性能。

为了防止这些回退分配，请增加块大小，并将新块大小限制为与帧的峰值使用量匹配，而不是场景加载的峰值使用量。这可以防止块变得太大而保留大量内存，从而在运行时不可用。

> **提示**：Profiler 分配器共享一个桶分配器实例。您可以在 Profiler [共享桶分配器(Shared Bucket Allocator)](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-bucket-allocator.html#example) 中自定义此共享实例。

### 双线程分配器(Dual Thread Allocator)

双线程分配器是一个包装器，它结合了 [动态堆(Dynamic Heap)](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-dynamic-heap-allocator.html) 和 [桶(Bucket)](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-bucket-allocator.html) 分配器。更具体地说，它结合了：

* 两个动态堆分配器：一个用于主线程的无锁分配器，以及一个由所有其他线程共享的分配器，该分配器在分配和释放时锁定。Unity 使用这些分配器进行对于桶分配器来说太大的分配。动态堆分配器使用内存块。等于或大于半个块的分配会进入虚拟内存系统，而不是动态堆分配器。
* 一个用于小型分配的桶分配器。如果桶分配器已满，分配会溢出到动态堆分配器。

您可以自定义两个动态堆分配器的块大小：

![Main Allocator, with a custom value for Shared Thread Block Size](https://docs.unity3d.com/2022.3/Documentation/uploads/Main/Main_Allocator.png)

> 主分配器，带有共享线程块大小的自定义值

使用报告包含分配器所有三个部分的信息。例如：

```
[ALLOC_DEFAULT] Dual Thread Allocator
  Peak main deferred allocation count 135
    [ALLOC_BUCKET]
      Large Block size 4.0 MB
      Used Block count 1
      Peak Allocated bytes 3.3 MB
    [ALLOC_DEFAULT_MAIN]
      Peak usage frame count: [16.0 MB-32.0 MB]: 8283 frames, [32.0 MB-64.0 MB]: 1 frames
      Requested Block Size 16.0 MB
      Peak Block count 2
      Peak Allocated memory 53.3 MB
      Peak Large allocation bytes 40.2 MB
    [ALLOC_DEFAULT_THREAD]
      Peak usage frame count: [64.0 MB-128.0 MB]: 8284 frames
      Requested Block Size 16.0 MB
      Peak Block count 2
      Peak Allocated memory 78.3 MB
      Peak Large allocation bytes 47.3 MB
```

> **注意**：**Peak main deferred allocation count** 是删除队列中的项目数。主线程必须删除它进行的任何分配。如果另一个线程删除分配，则该分配将添加到队列中。分配在队列中等待主线程删除它。然后将其计为延迟分配。

### 线程本地存储(TLS)栈分配器(Thread Local Storage Stack Allocator)

每个线程都使用自己的快速栈分配器进行临时分配。这些分配速度非常快，生命周期小于一帧。分配器使用后进先出(LIFO)栈。

临时分配器的默认块大小对于平台为 4MB，对于 Unity Editor 为 16MB。您可以自定义这些值。

> **注意**：如果分配器使用量超过配置的块大小，Unity 会增加块大小。此增加的限制是原始大小的两倍。

![Main Thread Block Size custom value in the Fast Per Thread Temporary Allocators](https://docs.unity3d.com/2022.3/Documentation/uploads/Main/Per_Thread.png)

> 快速每线程临时分配器(Fast Per Thread Temporary Allocators)中的主线程块大小(Main Thread Block Size)自定义值

如果线程的栈分配器已满，分配将回退到 [线程安全线性分配器](https://docs.unity3d.com/2022.3/Documentation/Manual/performance-threadsafe-linear-allocator.html)。少量溢出分配是可以接受的：一帧中 1 到 10 个，或加载期间几百个。然而，如果每帧数量都在增加，您可以增加块大小。

使用报告中的信息可以帮助您选择适合应用程序的块大小。例如，在以下主线程使用报告中，加载峰值为 2.7MB，但其余帧低于 64KB。您可以将块大小从 4MB 减小到 64KB，并允许加载帧溢出分配：

```
[ALLOC_TEMP_TLS] TLS Allocator
  StackAllocators :
    [ALLOC_TEMP_MAIN]
      Peak usage frame count: [16.0 KB-32.0 KB]: 802 frames, [32.0 KB-64.0 KB]: 424 frames, [2.0 MB-4.0 MB]: 1 frames
      Initial Block Size 4.0 MB
      Current Block Size 4.0 MB
      Peak Allocated Bytes 2.7 MB
      Overflow Count 0
    [ALLOC_TEMP_Job.Worker 18]
```

在第二个示例中，工作线程不用于大型临时分配。为了节省内存，您可以将工作线程的块大小减小到 32KB。这在多核机器上特别有用，其中每个工作线程都有自己的栈：

```
[ALLOC_TEMP_Job.Worker 14]
      Initial Block Size 256.0 KB
      Current Block Size 256.0 KB
      Peak Allocated Bytes 18.6 KB
      Overflow Count 0
```

### 线程安全线性分配器(Thread-safe Linear Allocator)

Unity 中的工作线程使用循环首次进入首次退出(FIFO) 算法，用于快速、无锁地分配 Job 的工作缓冲区。Job 完成后会释放缓冲区。

此分配器分配内存块，然后在这些块内线性分配内存。可用块保存在池中。当一个块满时，分配器从池中获取一个新块。当分配器不再需要块中的内存时，它会清除该块，并且该块返回到可用块池中。快速清除分配以使块再次可用非常重要，因此 Job 的分配时间不应超过几帧。

您可以自定义块大小。分配器根据需要最多分配 64 个块。

![Default value for Fast Thread Shared Temporary Allocators for the Editor](https://docs.unity3d.com/2022.3/Documentation/uploads/Main/Fast_Thread.png)

> Editor 的快速线程共享临时分配器(Fast Thread Shared Temporary Allocators)的默认值

如果所有块都在使用中，或者分配对于块来说太大，分配将回退到主堆分配器，这比 Job 分配器慢得多。少量溢出分配是可以接受的：一帧中 1 到 10 个，或几百个，尤其是在加载期间。如果溢出计数每帧都在增加，您可以增加块大小以避免回退分配。然而，如果块大小增加过多(例如，为了匹配场景加载等事件中的峰值使用量)，您可能会在播放期间留下大量内存不可用。

例如：

```
[ALLOC_TEMP_JOB_4_FRAMES(JobTemp)]
  Initial Block Size 0.5 MB
  Used Block Count 64
  Overflow Count(too large) 0
  Overflow Count(full) 50408
```

在此示例使用报告中，0.5MB 的块大小太小，无法容纳应用程序所需的 Job 内存，并且已满的分配器导致大量分配溢出。

要检查构建的帧溢出是否足够，请运行一小段时间，然后再运行更长的时间。如果溢出计数保持稳定，则溢出是在加载期间发生的高水位标记。如果溢出计数随着运行时间的延长而增加，则构建正在处理每帧溢出。在这两种情况下，您都可以增加块大小以减少溢出，但加载期间的溢出不如每帧溢出关键。

### 自定义分配器

> **注意：**并非所有平台都支持此功能。有关更多信息，请参阅 [平台特定](https://docs.unity3d.com/2022.3/Documentation/Manual/PlatformSpecific.html) 文档。

要自定义分配器设置，您可以通过 [Editor UI](https://docs.unity3d.com/2022.3/Documentation/Manual/memory-allocator-customization.html#use-the-editor) 编辑可配置值，或将其作为 [命令行参数](https://docs.unity3d.com/2022.3/Documentation/Manual/memory-allocator-customization.html#use-command-line-arguments) 提供。

**使用 Editor**

1. 选择 _Project Settings_ > _Memory Settings_。
2. 选择要编辑的值旁边的锁定图标。

![Project Settings > Memory Settings, showing a selection of Player memory settings](https://docs.unity3d.com/2022.3/Documentation/uploads/Main/Memory_Settings.png)

> Project Settings > Memory Settings，显示 Player 内存设置的选择

> **注意**：有关可通过 Editor UI 自定义的字段，请参阅前面的各个分配器部分。

**使用命令行参数**

要查找要更改的分配器参数的名称，请检查 Editor 和 Player 启动时打印的分配器设置列表。例如，要更改主堆分配器的块大小，请使用 `-memorysetup-main-allocator-block-size=<new_value>`

分配器参数名称及其默认值：

| **分配器** | | |**描述** | **参数名称** | **默认值** |
| --- | ---| ---| ---| --- | --- |
| 主要分配器<br>Main Allocators | Unity 用于大多数分配的分配器。 |
|  | 主分配器<br>Main Allocator | Unity 用于大多数分配的主要分配器。 |
|  |  | 主线程块大小<br>Main Thread Block Size | 专用主线程分配器的块大小。 | `memorysetup-main-allocator-block-size` | `16MB` |
|  |  | 共享线程块大小<br>Shared Thread Block Size | 共享线程分配器的块大小。 | `memorysetup-thread-allocator-block-size` | `16MB` |
|  | Gfx 分配器<br>Gfx Allocator | Unity 用于与 Gfx 系统相关的 CPU 分配的分配器。 |
|  |  | 主线程块大小<br>Main Thread Block Size | 专用主线程 Gfx 分配器的块大小。 | `memorysetup-gfx-main-allocator-block-size` | `16MB` |
|  |  | 共享线程块大小<br>Shared Thread Block Size | 共享线程 Gfx 分配器的块大小。 | `memorysetup-gfx-thread-allocator-block-size` | `16MB` |
|  | 其他分配器<br>Other Allocators |
|  |  | 文件缓存块大小<br>File Cache Block Size | 文件缓存有自己的分配器以避免碎片。这是它的块大小。 | `memorysetup-cache-allocator-block-size` | `4MB` |
|  |  | 类型树块大小<br>Type Tree Block Size | 类型树有自己的分配器以避免由于许多小型分配而导致的碎片。这是它的块大小。 | `memorysetup-typetree-allocator-block-size` | `2MB` |
|  | 共享桶分配器<br>Shared Bucket Allocator | 在主要分配器之间共享的桶分配器。 |
|  |  | 桶分配器粒度<br>Bucket Allocator Granularity | 共享分配器中桶的步长。 | `memorysetup-bucket-allocator-granularity` | `16B` |
|  |  | 桶分配器桶数<br>Bucket Allocator BucketCount | 桶大小的数量。例如，如果值为 4，则大小为 16、32、48 和 64。 | `memorysetup-bucket-allocator-bucket-count` | `8` |
|  |  | 桶分配器块大小<br>Bucket Allocator Block Size | 用于桶的内存块大小。 | `memorysetup-bucket-allocator-block-size` | `Editor: 8MB` <br>`Player: 4MB` |
|  |  | 桶分配器块数<br>Bucket Allocator Block Count | 要分配的最大块数。 | `memorysetup-bucket-allocator-block-count` | `Editor: 8`<br>`Player: 1` |
| 快速每线程临时分配器<br>Fast Per Thread Temporary Allocators | 处理非常短生命周期分配的线程本地存储(TLS) 分配器。 |
|  | 主线程块大小<br>Main Thread Block Size |主线程栈的初始大小。|  | `memorysetup-temp-allocator-size-main` | `Editor: 16MB`<br>`Player: 4MB` |
|  | Job Worker 块大小<br>Job Worker Block Size | Unity Job 系统中每个 Job Worker 的大小。 |  | `memorysetup-temp-allocator-size-job-worker` | `256KB` |
|  | 后台 Job Worker 块大小<br>Job Worker Block Size | 每个后台 Worker 的大小。|  | `memorysetup-temp-allocator-size-background-worker` | `32KB` |
|  | 预加载块大小<br>Preload Block Size | 预加载管理器栈大小。|  | `memorysetup-temp-allocator-size-preload-manager` | `Editor: 32MB`<br>`Player: 256KB` |
|  | 音频 Worker 块大小<br>Audio Worker Block Size | 每个音频 Worker 线程的栈大小。|  | `memorysetup-temp-allocator-size-audio-worker` | `64KB` |
|  | 云 Worker 块大小<br>Cloud Worker Block Size | 云 Worker 线程栈大小。 |  | `memorysetup-temp-allocator-size-cloud-worker` | `32KB` |
|  | Gfx 线程块大小<br>Gfx Thread Blocksize | 主渲染线程栈大小。|  | `memorysetup-temp-allocator-size-gfx` | `256KB` |
|  | GI Baking 块大小<br>GI Baking Blocksize | 每个 GI Worker 线程的栈大小。|  | `memorysetup-temp-allocator-size-gi-baking-worker` | `256KB` |
|  | **NavMesh** Worker 块大小<br>NavMesh Worker Block Size | Nav **mesh** Worker 线程栈大小。| | `memorysetup-temp-allocator-size-nav-mesh-worker` | `64KB` |
| 快速线程共享临时分配器<br>Fast Thread Shared Temporary Allocators | 用于线程之间共享的短生命周期分配的快速线性分配器。 |
|  | Job 分配器块大小<br>Job Allocator Block Size | Unity 主要用于 Job Worker 线程的循环线性线程分配器。|  | `memorysetup-job-temp-allocator-block-size` | `2MB` |
|  | 后台 Job 分配器块大小<br>Background Job Allocator Block Size | 后台 Worker 的线性分配器，允许更长生命周期的分配。|  | `memorysetup-job-temp-allocator-block-size-background` | `1MB` |
|  | 低内存平台上的 Job 分配器块大小<br>Job Allocator Block Size on low memory platforms | 内存小于 2GB 的平台对 Job Worker 和后台 Job 都使用此大小。|  | `memorysetup-job-temp-allocator-reduction-small-platforms` | `256KB` |
| **Profiler** 分配器<br>Profiler Allocators | Unity 专门用于 Profiler 的分配器，以便它们不干扰应用程序的分配模式。 |
|  | Profiler 块大小<br>Profiler Block Size |Profiler 主要部分的块大小。|  | `memorysetup-profiler-allocator-block-size` | `16MB` |
|  | Editor Profiler 块大小<br>Editor Profiler Block Size |Profiler 的 Editor 部分的块大小。Player 中不存在。|  | `memorysetup-profiler-editor-allocator-block-size` | `1MB` |
|  | 共享 Profiler 桶分配器<br>Shared Profiler Bucket Allocator  |Profiler 和 Editor Profiler 分配器的共享桶分配器。低内存平台中不存在。 |
|  |  | 桶分配器粒度<br>Bucket Allocator Granularity | 共享分配器中桶的步长。 | `memorysetup-profiler-bucket-allocator-granularity` | `16B` |
|  |  | 桶分配器桶数<br>Bucket Allocator BucketCount | 桶大小的数量。例如，如果值为 4，则大小为 16、32、48 和 64。 | `memorysetup-profiler-bucket-allocator-bucket-count` | `8` |
|  |  | 桶分配器块大小<br>Bucket Allocator Block Size | 用于桶的内存块大小。 | `memorysetup-profiler-bucket-allocator-block-size` | `Editor: 32MB`<br>`Player: 4MB` |
|  |  | 桶分配器块数<br>Bucket Allocator Block Count | 要分配的最大块数。 | `memorysetup-profiler-bucket-allocator-block-count` | `Editor: 8`<br>`Player: 1` |

> **提示**：为了确保您的设置提高了性能，请在更改之前和之后对应用程序进行性能分析。有关更多信息，请参阅 [Profiler 概述页面](https://docs.unity3d.com/2022.3/Documentation/Manual/Profiler.html) 和  [Profiler Analyzer](https://docs.unity3d.com/Packages/com.unity.performance.profile-analyzer@latest) 的包文档。Profiler Analyzer 支持多帧比较，这对于突出分配器性能差异特别有用。您还可以查看内存使用报告。当您关闭 Player 或 Editor 时，它们可在日志中找到。要查找您的日志文件，请按照 [日志文件页面](https://docs.unity3d.com/2022.3/Documentation/Manual/LogFiles.html) 上的说明进行操作。

**存储和读取设置**

Unity 将分配器设置存储在 `MemorySettings.asset` 中，这些设置在构建过程中应用。这意味着新设置在每次构建时都会生效。

在 Editor 中，这些设置存储在 `ProjectSettings` 文件夹中，并在 Unity 导入或更改 `MemorySettings.asset` 时更新。Editor 的新值仅在下次 Editor 启动时生效。