---
article: false
index: false
---

# HybridCLR

HybridCLR 是一个 Unity 全平台原生 C# 热更新解决方案。

HybridCLR 扩充了 il2cpp 运行时代码，使它由纯 AOT runtime 变成 AOT + Interpreter 混合 runtime，进而原生支持动态加载 assembly，从底层彻底支持了热更新。

* [官网](https://www.hybridclr.cn/)
* [Github](https://github.com/focus-creative-games/hybridclr)
* [官方文档](https://www.hybridclr.cn/docs/intro)

**工作原理**

HybridCLR 从 mono 的 [mixed mode execution](https://www.mono-project.com/news/2017/11/13/mono-interpreter/) 技术中得到启发，为 unity 的 il2cpp 之类的 AOT runtime 额外提供了 interpreter 模块，将它们由纯 AOT 运行时改造为 AOT + Interpreter 混合运行方式。

![](./Assets/architecture-f9de908814ec6afba99265a78910598c.png)

更具体地说，HybridCLR 做了以下几点工作：

* 实现了一个高效的元数据(dll)解析库
* 改造了元数据管理模块，实现了元数据的动态注册
* 实现了一个 IL 指令集到自定义的寄存器指令集的compiler
* 实现了一个高效的寄存器解释器
* 额外提供大量的 instinct 函数，提升解释器性能

**依赖**

* Unity 模块 `Windows Build Support(IL2CPP)`
* Windows 需要 `visual studio 2019` 或更高版本，安装时至少要包含 `使用 Unity 的游戏开发` 和 `使用 c++ 的游戏开发` 组件。
* git

**涉及模块**

* [HybridCLR_Unity](https://github.com/focus-creative-games/hybridclr_unity) HybridCLR Unity 插件
* [HybridCLR](https://github.com/focus-creative-games/hybridclr) HybridCLR 核心实现，HybridCLR_Unity 安装以后，执行 Install 的时候会自动下载。主要目录 `hybridclr`。
* [HybridCLR IL2CPP_PLUS](https://github.com/focus-creative-games/il2cpp_plus) 基于 Unity 原始 IL2CPP 进行了部分改动，以支持动态加载 DLL 元数据。主要目录 `libil2cpp`。

**安装**

* `Windows/Package Manager` > `Add package from git URL...` > `https://github.com/focus-creative-games/hybridclr_unity.git`
* `HybridCLR/Installer...`

**HybridCLR/Installer工作原理**

* `Packages/HybridCLR/Editor/Installer/InstallerWindow.cs` > `InstallLocalHybridCLR`
* `InstallerController.InstallDefaultHybridCLR`
  * 克隆 `https://gitee.com/focus-creative-games/hybridclr` 分支 v6000.3.x-8.11.0 到 `Project/HybridCLRData/hybridclr_repo`
  * 克隆 `https://gitee.com/focus-creative-games/il2cpp_plus` 分支 v6000.3.x-8.11.0 到 `Project/HybridCLRData/il2cpp_plus_repo`
  * 将 `hybridclr_repo` 下的 `hybridclr` 移动到 `il2cpp_plus_repo/libil2cpp/hybridclr`
  * 返回 `il2cpp_plus_repo/libil2cpp`
  * 创建 `Project/HybridCLRData/LocalIl2CppData-{Application.platform}`
  * 拷贝 `Unity` 的 `il2cpp`(`{EditorApplication.applicationContentsPath}/il2cpp`)同级目录 `MonoBleedingEdge` 到 `LocalIl2CppData-{Application.platform}/MonoBleedingEdge`
    * Editor/6000.4.4f1/Editor/Data/il2cpp
  * 拷贝 `Unity` 的 `il2cpp` 到 `LocalIl2CppData-{Application.platform}/il2cpp`
  * 拷贝 `il2cpp_plus_repo/libil2cpp` 到 `LocalIl2CppData-{Application.platform}/il2cpp/libil2cpp`
    * 替换 `libil2cpp`
  * 删除 `ProjectDir/Library/Il2cppBuildCache`
  * 判断 `LocalIl2CppData-{Application.platform}/il2cpp/libil2cpp/hybridclr` 是否存在
  * 写入 Version，`LocalIl2CppData-{Application.platform}/il2cpp/libil2cpp/hybridclr/generated/libil2cpp-version.txt`
  * 安装成功

执行 Installer 日志

```
[BashUtil] run => git "clone" "-b" "v6000.3.x-8.11.0" "--depth" "1" "https://gitee.com/focus-creative-games/hybridclr" "E:\Projects\Unity_Projects\HybridCLRLearning/HybridCLRData/hybridclr_repo"

[BashUtil] run => git "clone" "-b" "v6000.3.x-8.11.0" "--depth" "1" "https://gitee.com/focus-creative-games/il2cpp_plus" "E:\Projects\Unity_Projects\HybridCLRLearning/HybridCLRData/il2cpp_plus_repo"

application path:D:/Program Files/Unity/Hub/Editor/6000.4.4f1/Editor/Unity.exe D:/Program Files/Unity/Hub/Editor/6000.4.4f1/Editor/Data

[BashUtil] CopyDir D:\Program Files\Unity\Hub\Editor\6000.4.4f1\Editor\Data/MonoBleedingEdge => E:\Projects\Unity_Projects\HybridCLRLearning/HybridCLRData/LocalIl2CppData-WindowsEditor/MonoBleedingEdge

[BashUtil] CopyDir D:/Program Files/Unity/Hub/Editor/6000.4.4f1/Editor/Data/il2cpp => E:\Projects\Unity_Projects\HybridCLRLearning/HybridCLRData/LocalIl2CppData-WindowsEditor/il2cpp

[BashUtil] CopyDir E:\Projects\Unity_Projects\HybridCLRLearning/HybridCLRData/il2cpp_plus_repo/libil2cpp => E:\Projects\Unity_Projects\HybridCLRLearning/HybridCLRData/LocalIl2CppData-WindowsEditor/il2cpp/libil2cpp

[BashUtil] RemoveDir dir:E:\Projects\Unity_Projects\HybridCLRLearning/Library/Il2cppBuildCache

Write installed version:'8.11.0' to E:\Projects\Unity_Projects\HybridCLRLearning/HybridCLRData/LocalIl2CppData-WindowsEditor/il2cpp/libil2cpp/hybridclr/generated/libil2cpp-version.txt

Install Sucessfully
```

## libil2cpp 改动

HybridCLR 的核心修改思路：在原生 IL2CPP AOT 运行时中嵌入一个解释器后端，使其能够加载并执行补充元数据(supplementary metadata)形式的 DLL，从而实现"热更新"能力。所有修改均以 `// ==={{ hybridclr` 注释标记。下面按模块分类说明。

### 1. 核心数据结构扩展(根目录头文件)

`il2cpp-blob.h` — 新增类型枚举。在 `Il2CppTypeEnum` 中新增 4 个枚举值，用于 HybridCLR 自定义元数据编码：

```
IL2CPP_TYPE_SYSTEM_TYPE = 0x50   // 表示 System.Type
IL2CPP_TYPE_BOXED_OBJECT = 0x51  // 装箱对象
IL2CPP_TYPE_FIELD       = 0x53   // 字段引用
IL2CPP_TYPE_PROPERTY    = 0x54   // 属性引用
```

作用：HybridCLR 的补充元数据中需要表达这些特殊类型(如 attribute 构造参数中的 `typeof(T)`)，原生 IL2CPP 的 ECMA-335 枚举不足以覆盖。

`il2cpp-class-internals.h` — MethodInfo 结构体扩展。在 `MethodInfo` 末尾新增字段：

```cpp
bool initInterpCallMethodPointer : 1;        // 是否已初始化解释器调用指针
bool isInterpterImpl : 1;                    // 该方法是否由解释器实现
void* interpData;                            // 解释器执行数据(指令流)
Il2CppMethodPointer methodPointerCallByInterp;        // 解释器入口(直接调用)
Il2CppMethodPointer virtualMethodPointerCallByInterp; // 解释器入口(虚调用/adjust thunk)
```

作用：让每个方法同时持有"AOT 原生指针"与"解释器指针"两套调用入口，运行时按需切换。`interpData` 保存解释器指令流，是解释执行的核心数据。

`il2cpp-config.h` — 版本适配

```cpp
#include "hybridclr/generated/UnityVersion.h"
#if HYBRIDCLR_UNITY_VERSION >= 20220333
#define SUPPORT_METHOD_RETURN_TYPE_CUSTOM_ATTRIBUTE 1
#endif
```

作用：引入 HybridCLR 生成的 Unity 版本号宏，用于在不同 Unity 版本间做条件编译适配。

### 2. 解释器调用集成(vm/metadata 核心)

**1. `metadata/GenericMethod.cpp` — 泛型方法实例化时挂接解释器**

在 `CreateMethodLocked` 中新增逻辑：

- 调用 `hybridclr::metadata::IsInterpreterMethod` 判断方法是否属于解释器程序集；
- 若是，则用 `InterpreterModule::GetMethodPointer`/`GetMethodInvoker`/`GetAdjustThunkMethodPointer`] 替换 `methodPointer`、`virtualMethodPointer`、`invoker_method`；
- 处理 AOT 方法但实际由解释器实现(`isAotImplByInterp`)的情况，以及未解析调用桩(`AnUnresolvedCallStubWasNotFound`)回退到解释器。

作用：泛型方法实例化是 IL2CPP 最复杂的路径，此处注入使热更 DLL 中的泛型方法也能被正确调用。

**2. `vm/Class.cpp` — 方法初始化标记解释器实现。**

在 `SetupMethodsLocked` 中：

```cpp
newMethod->isInterpterImpl = hybridclr::interpreter::InterpreterModule::IsImplementsByInterpreter(newMethod);
```

在 `resolve_parse_info_internal` 中，当按类型名查找失败时，回退到解释器线程栈顶帧所属 image 中查找。

作用：确保 `Type.GetType` 等反射能在热更程序集中找到类型。

**3. `vm/Runtime.cpp` — 运行时初始化与调用入口**

- `Runtime::Init` 末尾调用 `hybridclr::Runtime::Initialize()` 初始化解释器；
- `InvokeWithThrow` 开头调用 `hybridclr::InitAndGetInterpreterDirectlyCallMethodPointer(method)`，惰性初始化解释器调用指针。

作用：反射调用(`MethodInfo.Invoke`)路径也能正确进入解释器。

**4. `vm/GlobalMetadata.cpp` — 元数据访问全面分流**

这是改动量最大的文件。几乎所有元数据查询函数(字符串、类型定义、方法定义、字段、属性、事件、接口、嵌套类型、自定义属性、RGCTX、字段默认值等)开头都加入类似判断：

```cpp
if (hybridclr::metadata::IsInterpreterIndex(index))
    return hybridclr::metadata::MetadataModule::GetXxxFromEncodeIndex(index);
```

作用：HybridCLR 将热更 DLL 的元数据索引编码到高位，运行时通过 `IsInterpreterIndex` 区分"AOT 元数据"与"解释器元数据"，分别走原生 global-metadata 或 HybridCLR 的 `MetadataModule`。这是热更 DLL 元数据能被原生运行时识别的关键。

**5. [`vm/MetadataCache.cpp`](docs/Unity/Notes/HybridCLR/libil2cpp_plus/vm/MetadataCache.cpp:39) — 程序集动态加载**

- `GetAdjustorThunk` / `GetMethodPointer` / `GetMethodInvoker`：判断 `IsInterpreterImage` 后委托给 `MetadataModule`；
- `GetAssemblyByName`：用 `hybridclr::GetAssemblyNameFromPath` 去除路径前缀；
- 新增 `LoadAssemblyFromBytes`：调用 `hybridclr::metadata::Assembly::LoadFromBytes` 实现从字节流加载程序集；
- 新增 `RegisterInterpreterAssembly`：注册解释器程序集到 `s_cliAssemblies`。

作用：实现 `Assembly.Load(byte[])` 动态加载热更 DLL 的能力。

### 3. GC 与线程支持

**1. `gc/BoehmGC.cpp` & `gc/GarbageCollector.h` — 动态 GC Root**

新增 `DynamicRootMap s_DynamicRoots` 及 `RegisterDynamicRoot` / `UnregisterDynamicRoot` 接口，在 GC 标记阶段遍历动态 root 并 `GC_push_all`。

作用：解释器的执行栈(`MachineState`)分配在堆上而非原生栈上，BoehmGC 默认只扫描原生栈，必须显式注册为动态 root，否则解释器栈上的对象会被误回收。

**2. `vm/Thread.cpp` — 线程退出清理**

```cpp
hybridclr::interpreter::InterpreterModule::FreeThreadLocalMachineState();
```

作用：线程 detach 时释放该线程的解释器 `MachineState`，避免内存泄漏。

**3. `vm/StackTrace.cpp` — 解释器栈帧收集**

调用 `InterpreterModule::GetCurrentThreadMachineState().CollectFrames` 与 `SetupFramesDebugInfo`。

作用：异常堆栈跟踪能包含热更 DLL 中的方法帧。

### 4. P/Invoke 与委托支持

`vm/PlatformInvoke.cpp`

```cpp
if (method && hybridclr::metadata::IsInterpreterImplement(method))
    return reinterpret_cast<intptr_t>(
        hybridclr::interpreter::InterpreterModule::GetReversePInvokeWrapper(...));
```

作用：当 C++ 反向调用(Reverse P/Invoke)的目标是解释器方法时，返回解释器版的 Reverse P/Invoke wrapper，使 native→managed 回调能进入解释器。

`vm/Type.cpp`

```cpp
delegate->invoke_impl = hybridclr::InitAndGetInterpreterDirectlyCallMethodPointer(method);
```

作用：委托绑定解释器方法时，`invoke_impl` 指向解释器入口。

### 5. 元数据比较/哈希改造(metadata 目录)

以下文件统一将"指针相等快捷判断"改为"纯值比较"：

| 文件 | 原始 | HybridCLR |
|------|------|-----------|
| `Il2CppGenericClassCompare.cpp` | `gc1 == gc2 \|\| Compare(...)` | `Compare(...)` |
| `Il2CppGenericContextCompare.cpp` | 指针比较 class_inst/method_inst | `Il2CppGenericInstCompare::Compare` 逐元素比较 |
| `Il2CppGenericContextHash.cpp` | `AlignedPointerHash` | `Il2CppGenericInstHash::Hash` 按内容哈希 |
| `Il2CppGenericInstCompare.cpp/.h` | 指针比较 | 逐 type 元素 `AreEqual` |
| `Il2CppGenericMethodCompare.cpp` | `m1 == m2 \|\| Equals` | `Equals` |
| `Il2CppTypeCompare.h` | `t1 == t2 \|\| AreEqual` | `AreEqual` |

作用：HybridCLR 在运行时动态构造大量 `Il2CppType`/`Il2CppGenericInst`(通过 `MetadataPool` 池化)，这些对象与 AOT 预生成的不是同一指针。若保留指针快捷判断，会导致语义相同的泛型实例被当作不同实例，引发泛型方法重复实例化、字典查找失败等问题。改为值比较保证正确性。

`metadata/GenericMetadata.cpp`

- 引入 `MetadataPool` 池化 `Il2CppType` / `Il2CppArrayType`，避免无限膨胀；
- `GetGenericClass` 对解释器 image 返回 `nullptr`(由 HybridCLR 自行处理)。

`metadata/ArrayMetadata.cpp`

```cpp
// 补充元数据需要这个token
inflatedMethod->token = genericArrayMethod.method->token;
```

作用：原生代码将数组方法 token 置 0，但 HybridCLR 补充元数据依赖 token 查找，必须保留。

### 6. icalls 反射支持

`icalls/mscorlib/System/AppDomain.cpp` `AppDomain.Load` 改用 `vm::Assembly::Load(name)`，使其能加载热更程序集。

`icalls/mscorlib/System.Reflection/Assembly.cpp` 重写 `Assembly.Load` 内部实现注释说明：原生 IL2CPP 无法加载转换期未知的程序集，HybridCLR 放宽此限制。

`icalls/mscorlib/System/MonoCustomAttrs.cpp` 引入 `MetadataModule`，使自定义属性查询能命中热更 DLL。

### 7. 工具层适配(utils/os/codegen/vm-utils)

| 文件 | 修改 | 作用 |
|------|------|------|
| `utils/MemoryPool.cpp/.h` | 新增 `Contains()`；`Malloc` 改用 `IL2CPP_MALLOC_ZERO` 并 `memset` 清零 | 解释器元数据池需要判断指针归属与零初始化 |
| `utils/MemoryRead.h` | `Read8` 改用 `memcpy` | 避免未对齐访问崩溃(补充元数据可能未对齐) |
| `utils/ExceptionSupportStack.h` | `pop()` 签名按 Unity 版本条件编译 | 适配 2022.3.11+ API 变更 |
| `utils/StringUtils.cpp` | `maximumSize == 0` 提前返回 | 边界保护 |
| `os/Posix/Memory.cpp` | 对齐下限 `sizeof(void*)` | 修复 Posix 对齐 |
| `codegen/il2cpp-codegen-il2cpp.h` | `IL2CPP_POP_ACTIVE_EXCEPTION` 版本条件编译 | 适配异常栈 API |
| `vm-utils/DebugSymbolReader.cpp` | 注释化某段逻辑、`return true` | 调试符号加载兼容性 |

## 8. 总体架构图

```
┌─────────────────────────────────────────────────────────┐
│              Unity 原生 IL2CPP 运行时                    │
│  ┌──────────────┐   ┌──────────────┐                    │
│  │ AOT 程序集    │   │ GlobalMetadata│                    │
│  │ (原生机器码)  │   │  (global.dat) │                    │
│  └──────┬───────┘   └──────┬────────┘                    │
│         │                  │                             │
│         │   HybridCLR 注入点(IsInterpreterXxx 判断)    │
│         │                  │                             │
│  ┌──────▼──────────────────▼────────┐                    │
│  │     hybridclr::metadata 层       │                    │
│  │  ┌─────────────────────────────┐ │                    │
│  │  │ Assembly::LoadFromBytes     │ │ ← Assembly.Load    │
│  │  │ MetadataModule / Image      │ │   (热更 DLL)       │
│  │  │ MetadataPool (类型池化)     │ │                    │
│  │  └──────────────┬──────────────┘ │                    │
│  └─────────────────┼────────────────┘                    │
│                    │                                     │
│  ┌─────────────────▼────────────────┐                    │
│  │  hybridclr::interpreter 层       │                    │
│  │  ┌─────────────────────────────┐ │                    │
│  │  │ Engine / Interpreter        │ │ ← 解释执行指令流   │
│  │  │ InterpreterModule           │ │   (interpData)     │
│  │  │ MachineState (解释器栈)     │ │                    │
│  │  └──────────────┬──────────────┘ │                    │
│  └─────────────────┼────────────────┘                    │
│                    │                                     │
│  ┌─────────────────▼────────────────┐                    │
│  │  GC 动态 Root 注册               │ ← BoehmGC 扫描解释器栈│
│  │  Reverse P/Invoke Wrapper        │ ← native→interp 回调 │
│  │  StackTrace 帧收集               │ ← 异常堆栈           │
│  └──────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

### 9. 结论

HybridCLR 对 libil2cpp 的修改可归纳为 "一个核心机制 + 四类支撑改造"：

1. 核心机制：解释器后端集成

通过扩展 `MethodInfo`、在 `GenericMethod`/`Class`/`Runtime` 等方法创建与调用路径中注入 `InterpreterModule`，使热更 DLL 的方法以解释器方式执行，无需 AOT 编译。

2. 元数据分流

在 `GlobalMetadata` 所有查询入口加 `IsInterpreterIndex` 判断，将热更元数据查询重定向到 `MetadataModule`，实现 "AOT 元数据 + 解释器元数据" 双轨制。

3. 动态程序集加载

`MetadataCache::LoadAssemblyFromBytes` + `Assembly::LoadFromBytes` 实现 `Assembly.Load(byte[])`，支持运行时加载热更 DLL。

4. GC/栈/P-Invoke 适配

动态 GC root 保证解释器栈对象存活；线程退出清理 `MachineState`；Reverse P/Invoke wrapper 支持 native 回调进入解释器；StackTrace 收集解释器帧。

5. 泛型比较值化

将泛型实例的比较/哈希从"指针相等"改为"值相等"，适配运行时动态构造的类型对象，保证泛型实例化去重正确。

这些修改共同构成了 HybridCLR 的 "补充元数据 + 解释器" 热更方案，使 Unity IL2CPP 工程在不重新 AOT 编译的前提下，具备加载并执行新 C# 程序集的能力。

## Unity IL2CPP

### 1. 本质：AOT 跨平台编译后端

libil2cpp 是 Unity 自研的 **C# → C++ → 原生机器码** 的提前编译(AOT, Ahead-Of-Time)运行时。它取代了传统的 Mono JIT，目的是让 C# 代码能编译为各平台原生代码，兼顾性能、包体与平台兼容性(尤其 iOS 禁止 JIT)。

```
C# 源码 (.cs)
    │  C# 编译器 (Roslyn)
    ▼
IL 中间语言 (.dll, ECMA-335 MSIL)
    │  il2cpp.exe 转换器(构建期)
    ▼
┌───────────────────────────────────┐
│  ① 生成的 C++ 代码  (GameAssembly) │  ← 每个方法变成 C++ 函数
│  ② global-metadata.dat            │  ← 元数据二进制 blob
└───────────────────────────────────┘
    │  C++ 编译器 (MSVC/Clang/GCC)
    ▼
原生机器码 (GameAssembly.dll/.so/.dylib)
    │  运行时由 libil2cpp 加载执行
    ▼
程序运行
```

### 2. 两大产物

**生成的 C++ 代码(GameAssembly)**

il2cpp.exe 将每个 IL 方法翻译为一个 C++ 函数。例如 C# 的：

```csharp
int Add(int a, int b) { return a + b; }
```

会被翻译成类似：

```cpp
int32_t Add_MethodInfo_xxx(Il2CppObject* __this, int32_t a, int32_t b, const MethodInfo* method) {
    return a + b;
}
```

- **值类型、泛型、虚方法**等都有对应的 C++ 代码生成策略；
- 泛型实例化(如 `List<int>`、`List<string>`)在构建期被静态展开为独立的 C++ 函数(泛型共享 sharing 优化可减少展开数量)；
- 这些 C++ 函数地址被收集到 [`Il2CppCodeRegistration`](il2cpp-class-internals.h:596) 中。

**global-metadata.dat**

一个紧凑的二进制文件，包含所有程序集的**元数据**：

- 类型定义表(`Il2CppTypeDefinition`)
- 方法定义表(`Il2CppMethodDefinition`)
- 字段、属性、事件表
- 字符串池、类型表、泛型参数表
- 自定义属性、RGCTX(运行时泛型上下文)等

运行时由 [`GlobalMetadata`](/vm/GlobalMetadata.cpp) 加载并索引。元数据与代码分离，使得**反射、类型查找、序列化**等动态行为成为可能。

### 3. 运行时核心数据结构

[`Il2CppClass`](il2cpp-class-internals.h:371) — 类型运行时表示

每个 C# 类型对应一个 `Il2CppClass`，包含：

- `name`/`namespaze`/`parent`/`element_class`：类型基本信息
- `byval_arg`/`this_arg`：[`Il2CppType`](il2cpp-blob.h:6) 描述
- `fields`/`methods`/`properties`/`events`：成员表
- `vtable[]`：虚方法表([`VirtualInvokeData`](il2cpp-class-internals.h:33)数组，含函数指针 + MethodInfo)
- `interfaceOffsets`：接口偏移表(接口方法分派)
- `instance_size`/`element_size`/`gc_desc`：内存布局与 GC 描述符
- `cctor_*`：静态构造函数状态机

[`MethodInfo`](il2cpp-class-internals.h:323) — 方法运行时表示

```cpp
Il2CppMethodPointer methodPointer;        // 直接调用入口(C++ 函数地址)
Il2CppMethodPointer virtualMethodPointer; // 虚调用入口(可能含 adjust thunk)
InvokerMethod invoker_method;             // 反射调用包装器
const Il2CppType** parameters;            // 参数类型
const Il2CppGenericMethod* genericMethod;  // 泛型实例信息
uint16_t slot;                            // 虚表槽位
```

[`Il2CppCodeRegistration`](il2cpp-class-internals.h:596) & [`Il2CppMetadataRegistration`](il2cpp-class-internals.h:617)

构建期生成的两张全局注册表：

- **CodeRegistration**：所有方法指针、invoker、泛型方法指针、interop 数据、各模块代码信息([`Il2CppCodeGenModule`](il2cpp-class-internals.h:575))；
- **MetadataRegistration**：泛型类、泛型实例、类型表、方法规格、字段偏移表、类型尺寸表、metadataUsages(运行时元数据引用槽)。

运行时启动时由 [`il2cpp_codegen_register`](codegen/il2cpp-codegen-il2cpp.h:167) 注册。

### 4. 运行时启动流程

[`Runtime::Init`](vm/Runtime.cpp) 的核心步骤：

1. **OS/线程/GC 初始化**：`os::Initialize`、`Thread::Init`、`GarbageCollector::Initialize`；
2. **注册代码与元数据**：`g_CodegenRegistration()` → `MetadataCache::Register`；
3. **加载元数据**：`MetadataCache::Initialize` 解析 global-metadata.dat，构建 `Il2CppImage`/`Il2CppAssembly` 表；
4. **初始化默认类型**：`il2cpp_defaults`(Object、String、Int32 等核心类型)；
5. **GC 安全初始化**：`MetadataCache::InitializeGCSafe`(字符串字面量表、泛型方法表)；
6. **执行静态构造与模块初始化器**：`ExecuteEagerStaticClassConstructors` / `ExecuteModuleInitializers`。

### 5. 方法调用的三种路径

**直接调用(AOT 代码内)**

生成的 C++ 代码直接调用目标函数指针，零运行时开销：

```cpp
// 生成的代码
Add_MethodInfo_xxx(obj, 1, 2, methodInfo);
```

**虚方法调用(vtable 分派)**

通过 [`il2cpp_codegen_get_virtual_invoke_data`](codegen/il2cpp-codegen-il2cpp.h:389)：

```cpp
const VirtualInvokeData& data = obj->klass->vtable[slot];
data.methodPtr(data.method, obj, args);  // 间接调用
```

接口调用类似，但需经 `interfaceOffsets` 查找偏移。

**反射调用(invoker)**

`MethodInfo.invoker_method` 是一个统一签名的包装函数，负责参数装箱/拆箱后调用 `methodPointer`。[`Runtime::InvokeWithThrow`](vm/Runtime.cpp) 走此路径。

### 6. 泛型处理(关键难点)

IL2CPP 采用 **泛型共享(Generic Sharing)** 策略减少代码膨胀：

- **引用类型泛型参数**：所有引用类型共享同一份代码(`List<object>` 的实现可服务 `List<string>`)，因为引用都是指针大小；
- **值类型泛型参数**：原则上每个值类型实例化单独生成代码(`List<int>` ≠ `List<float>`)，但通过 `enablePrimitiveValueTypeGenericSharing` 可让相同大小的枚举共享；
- **完全共享(Full Generic Sharing)**：对未预生成的值类型泛型，用 `__Il2CppFullySharedGenericType`/`__Il2CppFullySharedGenericStructType` 作为占位，参数按引用传递，避免运行时缺失代码崩溃。

运行时通过 [`MetadataCache::GetGenericMethodPointers`](vm/MetadataCache.cpp) 按"精确匹配 → 共享匹配 → 完全共享匹配"三级查找方法指针。

### 7. GC 集成

libil2cpp 默认使用 **Boehm GC**(保守式垃圾回收)：

- `Il2CppClass.gc_desc` 描述对象内引用字段布局，供 GC 精确扫描；
- 对象分配走 `il2cpp_codegen_object_new` → GC 分配器；
- 静态字段、线程局部静态、委托、GCHandle 均注册为 GC root；
- [`WriteBarrier`](vm/Runtime.cpp) 用于写入屏障(移动式 GC 场景)。

### 8. P/Invoke 与互操作

- **正向 P/Invoke**：C# 调 native，由 [`il2cpp_codegen_resolve_pinvoke`](codegen/il2cpp-codegen-il2cpp.h:496) 在首次调用时 `dlopen`+`dlsym` 解析符号并缓存；
- **反向 P/Invoke(Reverse P/Invoke)**：native 调 C#，构建期为被 `[MonoPInvokeCallback]` 标记的方法生成 wrapper(`reversePInvokeWrappers`)，native 拿到的是 wrapper 地址；
- **COM/Windows Runtime**：通过 `Il2CppInteropData` 表做托管 ↔ native 类型映射。

### 9. 与 Mono 的关系

libil2cpp 复用了 Mono 的**类库实现**(mscorlib、System.* 的 C# 源码)，但：

- **不使用 Mono 的 JIT**，改为 AOT C++ 编译；
- **保留 Mono 的 icalls**(内部调用，如 `Object.GetType` 的 native 实现)，见 [`icalls/mscorlib`](icalls/mscorlib) 目录；
- 部分线程池、socket 等 PAL 代码也源自 Mono。

### 10. 核心原理一句话总结

**libil2cpp 将 C# IL 在构建期翻译为 C++ 代码并编译为原生机器码，同时将类型/方法元数据序列化为 global-metadata.dat；运行时通过 `Il2CppClass`/`MethodInfo` 等结构将代码与元数据关联，借助 vtable、invoker、泛型共享等机制实现面向对象语义、虚方法分派、反射与泛型，最终由 Boehm GC 管理内存。**

这也正是 HybridCLR 的切入点——由于元数据与代码分离，HybridCLR 可以在运行时加载额外的元数据(热更 DLL)，并用解释器替代缺失的 AOT 机器码，从而实现热更新。