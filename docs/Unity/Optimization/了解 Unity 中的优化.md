---
source: https://docs.unity3d.com/cn/2022.3/Manual/BestPracticeUnderstandingPerformanceInUnity.html
article: false
index: false
---

# 了解 Unity 中的优化

[原文地址 - UnityManual](https://docs.unity3d.com/cn/2022.3/Manual/BestPracticeUnderstandingPerformanceInUnity.html)

本最佳实践指南是 Unite Unity Europe 2016 讲座 `移动应用程序的优化(Optimizing Mobile Applications)` 的配套内容。涵盖了讲座的大部分内容，但也为感兴趣的读者额外补充了一些材料。可以通过 YouTube 观看讲座: [Unite 2016: 移动应用程序的优化 (Optimizing Mobile Applications)](https://www.youtube.com/watch?v=j4YAY36xjwE).

虽然 Unite 讲座的主题是讲解优化移动端的性能，但大部分的内容也适用于非移动端。本文将采用泛用的且与平台无关的方法对性能的相关信息进行讲解。

## [资源审核](https://docs.unity3d.com/cn/2021.3/Manual/BestPracticeUnderstandingPerformanceInUnity4.html)

实际项目中发现的许多问题都是源自无心之过：临时的 _测试_ 更改和疲惫不堪的开发人员的误点击可能会暗地里添加性能不良的资源或更改现有资源的导入设置。

对于任何大规模的项目，最好是将防止人为错误作为第一道防线。编写一小段代码来禁止将 4K 未压缩纹理添加到项目中，是相对简单的事情。

但是，这种错误操作却是十分常见的. 一个 4K 的未压缩纹理会占用 60 MB 的内存。在低端移动设备(如 iPhone 4S)上，占用的内存超过大约 180–200 MB 是十分危险的。如果误添加此类纹理，就会无意中占用应用程序内存预算的三分之一到四分之一，并导致难以诊断的内存不足错误。

虽然现在可以使用 5.3 版内存性能分析器来跟踪这些问题，但最好在最初就确保这些错误不可能发生.

**使用 AssetPostprocessor**

Unity Editor 中的 `AssetPostprocessor` 类可用于在 Unity 项目上强制执行某些最低标准。导入资源时将回调此类。要使用此类，应继承 `AssetPostprocessor` 并实现一个或多个 `OnPreprocess` 方法. 重要的方法包括:

* `OnPreprocessTexture`
* `OnPreprocessModel`
* `OnPreprocessAnimation`
* `OnPreprocessAudio`

请参阅 [AssetPostprocessor](https://docs.unity3d.com/cn/2021.3/ScriptReference/AssetPostprocessor.html) 的脚本参考，了解更多可能的 `OnPreprocess` 方法.

```csharp
public class ReadOnlyModelPostprocessor : AssetPostprocessor
{
   public void OnPreprocessModel()
   {
        ModelImporter modelImporter = (ModelImporter)assetImporter;
        if(modelImporter.isReadable)
        {
            modelImporter.isReadable = false;
            modelImporter.SaveAndReimport();
        }
    }
}
```

这是一个在项目中 `AssetPostprocessor` 强制执行规则的简单示例：

每次将模型导入项目时，或者模型的导入设置发生更改时，都会调用此类。该代码只是检查 `Read/Write` enabled 标志(由 `isReadable` 属性表示)是否设置为 true。如果是，则强制将标志位更改为 false，然后保存并重新导入资源。

请注意，调用 `SaveAndReimport` 会导致再次调用此代码片段！但是，因为现在已确保 `isReadable` 为 false，所以此代码不会产生无限的重新导入循环。

此变更的原因将在下面的"模型"部分讨论.

以下是较为通用的资源规则。

### 纹理

1. **禁用 read/write enabled 标志**

`Read/Write enabled` 标志使纹理在内存中保留两次：一次保存在 GPU 中，一次保存在 CPU 可寻址内存中(1)(注意: 这是因为大多数平台上从 GPU 内存回读的速度极慢。将纹理从 GPU 内存读入临时缓冲区以供 CPU 代码(例如 `Texture.GetPixel`)使用将是非常低效的)。在 Unity 中，默认情况下禁用此设置，但可能会无意中将其打开。

只有在着色器之外操作纹理数据时(例如使用 `Texture.GetPixel` 和 `Texture.SetPixel` API 时)才需要 `Read/Write Enabled`，否则应尽可能避免使用它。

2. **尽可能禁用 Mipmap**

如果对象相对于摄像机具有相对不变的 Z 深度，则可禁用 `Mipmap`，这样将大约节省加载纹理所需的内存的三分之一。如果对象的 Z 深度会发生变更，则禁用 `Mipmap` 可能导致 GPU 上的纹理采样性能变差。

通常情况下，这对于 UI 纹理以及在屏幕上以恒定大小显示的其他纹理非常有用。

3. **压缩所有纹理**

使用适合项目目标平台的纹理压缩格式对于节省内存至关重要。

如果所选的纹理压缩格式不适合目标平台，Unity 会在加载纹理时解压缩纹理，这将消耗 CPU 时间和额外的内存。此问题在 Android 设备上最常见，因为此类平台通常因芯片组不同而支持截然不同的纹理压缩格式.

4. **实施合理的纹理大小限制**

虽然很简单，但也很容易忘记调整纹理大小或无意中更改纹理大小导入设置。应确定不同类型纹理的合理最大值，并通过代码强制执行这些限制规则。

对于许多移动应用程序，2048x2048 或 1024x1024 足以满足纹理图集的要求，而 512x512 足以满足应用于 3D 模型的纹理的要求。

### 模型

1. **禁用 Read/Write enabled 标志**

模型的 `Read/Write enabled` 标志与纹理的上述相应标志具有相同的工作原理。但是，模型在默认情况下会启用该标志。

如果项目在运行时通过脚本修改网格 (Mesh)，或者如果网格用作 `MeshCollider` 组件的基础，则 Unity 会要求启用此标志. 如果模型未在 `MeshCollider` 中使用并且未被脚本操纵，请禁用此标志以节省一半模型内存。

2. **在非角色模型上禁用骨架(Animator)**

默认情况下，Unity 会为非角色模型导入通用骨架。如果模型在运行时实例化，则会导致添加 Animator 组件。如果模型没有通过动画系统进行动画处理，则会给动画系统增加不必要的开销，因为每帧都必须运行一次所有激活的 Animator。

在非动画模型上禁用骨架可以避免自动添加 Animator 组件，并防止可能无意中向场景添加不需要的 Animator。

3. **在动画模型上启用 Optimize Game Objects 选项**

`Optimize Game Objects` 选项对动画模型有着显著的性能影响。禁用该选项后，Unity 会在每次实例化模型时创建一个大型变换层级视图来镜像模型的骨骼结构。此变换层级视图的更新成本很高，尤其是在附加了其他组件(如粒子系统或碰撞体)的情况下。它还限制了 Unity 通过多线程执行网格蒙皮和骨骼动画计算的能力。

如果需要暴露模型骨骼结构上的特定位置(例如暴露模型的双手以便动态附加武器模型)，则可在 Extra Transforms 列表中将这些位置专门设为允许状态。

如需了解更多详细信息，请参阅 Unity 手册的 [Model Importer](https://docs.unity3d.com/Manual/FBXImporter-Rig.html) 页面。

3. **尽可能使用网格压缩**

启用网格压缩可减少用于表示模型数据不同通道的浮点数的位数。这样做可能导致精确度的轻微损失，在用于最终项目之前，美术师应评估这种不精确性的影响。

在给定压缩级别中使用的具体位数在 [ModelImporterMeshCompression](https://docs.unity3d.com/ScriptReference/ModelImporterMeshCompression.html) 脚本参考中有详细说明。

请注意，可对不同的通道使用不同级别的压缩，因此项目可选择仅压缩切线和法线，同时保持 UV 和顶点位置不压缩。

4. **注意网格渲染器设置**

将网格渲染器添加到预制件或游戏对象时，请注意组件上的设置。默认情况下，Unity 会启用阴影投射和接收、光照探针采样、反射探针采样和运动矢量计算。

如果项目不需要这些功能中的一个或多个，请确保通过自动脚本关闭它们。添加网格渲染器的任何运行时代码也都需要处理这些设置。

对于 2D 游戏，在启用阴影选项的情况下意外地将网格渲染器添加到场景会为渲染循环添加完整的阴影 pass。通常情况下，这是对性能的浪费。

### 音频

1. **适合平台的压缩设置**

应为音频启用与可用硬件匹配的压缩格式。所有 iOS 设备都包含硬件 MP3 解压器，而许多 Android 设备本身支持 `Vorbis`。

此外，应将未压缩的音频文件导入 `Unity`，`Unity` 在构建项目时总是会重新压缩音频。无需导入压缩的音频再重新压缩，这只会降低最终音频剪辑的质量。

2. **将音频剪辑强制设置为单声道**

很少有移动设备实际配备立体声扬声器。在移动平台项目中，将导入的音频剪辑强制设置为单声道会使其内存消耗减半。此设置也适用于没有立体声效果的任何音频，例如大多数 UI 声音效果。

3. **降低音频比特率**

尽量降低音频文件的比特率，以进一步节省内存消耗和构建的项目大小，但这种情况需要咨询音频设计师。

## 字符串和文本

字符串和文本的处理不当是 Unity 项目中性能问题的常见原因。在 C# 中，所有字符串均不可变。对字符串的任何操作均会导致分配一个完整的新字符串。这种操作的代价相对比较高，而且在大型字符串上、大型数据集上或紧凑循环中执行时，接连不断的重复的字符串可能发展成性能问题。

此外，由于 N 个字符串连接需要分配 N–1 个中间字符串，串行连接也可能成为托管内存压力的主要原因。

如果必须在紧凑循环中或每帧期间对字符串进行连接，请使用 `StringBuilder` 执行实际连接操作。为最大限度减少不必要的内存分配，可重复使用 `StringBuilder` 实例。

Microsoft 整理了一份处理 C# 中的字符串的最佳做法清单，可在这里的 MSDN 网站上找到该清单：[有关比较 .NET 中字符串的最佳做法](https://learn.microsoft.com/zh-cn/dotnet/standard/base-types/best-practices-strings).

### 区域约束与序数比对

在与字符串相关的代码中经常出现的核心性能问题之一是无意间使用了缓慢的默认字符串 API。这些 API 是为商业应用程序构建的，可根据与文本字符有关的多种不同区域性和语言规则来处理字符串。

使用序数比较类型大约快 10 倍，它以 C 和 C++ 程序员熟悉的方式比较字符串：简单地比较字符串的每个顺序字节，而不考虑字节表示的字符。

切换至序数比对的方式非常简单，只需将 `StringComparison.Ordinal` 作为最终参数提供给 `String.Equals`:

```csharp
myString.Equals(otherString，StringComparison.Ordinal);
```

### 低效的内置字符串 API

除了切换到顺序比较(ordinal comparisons)之外，某些 C# 字符串 APIs 的效率非常低。其中包括 `String.Format`，`String.StartsWith` 和 `String.EndsWith`。`String.Format` 很难替代，但是低效的字符串比较方法可以被简单地优化掉了。

微软建议将 `StringComparison.Ordinal` 传递给任何字符串比较方法，Unity 基准测试(benchmarks)表明，与自定义实现相比，这一影响相对较小。

| 方法                          | 100k 短字符串的时间(毫秒) |
| :---------------------------- | :------------------------ |
| `String.StartsWith`，默认区域 | 137                       |
| `String.StartsWith`，序数     | 115                       |
| `String.EndsWith`，默认区域   | 542                       |
| `String.EndsWith`，序数       | 34                        |
| 自定义 `StartsWith` 替换      | 4.5                       |
| 自定义 `EndsWith` 替换        | 4.5                       |

`String.StartsWith` 和 `String.EndsWith` 均可以替换为类似于以下示例的简单的手工编码版本.

```csharp
public static bool CustomEndsWith(this string a，string b)
{
    int ap = a.Length - 1;
    int bp = b.Length - 1;

    while(ap >= 0 && bp >= 0 && a [ap] == b [bp])
    {
        ap--;
        bp--;
    }
    
    return(bp < 0);
}

public static bool CustomStartsWith(this string a，string b)
{
    int aLen = a.Length;
    int bLen = b.Length;
    int ap = 0; int bp = 0;
    
    while(ap < aLen && bp < bLen && a [ap] == b [bp]){
        ap++;
        bp++;
    }
    
    return(bp == bLen);
}
```

### 正则表达式

尽管正则表达式是匹配和操作字符串的强大方法，但它们可能对性能的影响极大。此外，由于 C# 库的正则表达式实现方式，即使简单的布尔值 `IsMatch` 查询也需要在底层分配大型瞬态数据结构。除非在初始化期间，否则这种瞬态托管内存波动都是不可接受的。

如果必须使用正则表达式，强烈建议不要使用静态 `Regex.Match` 或 `Regex.Replace` 方法，这些方法会将正则表达式视为字符串参数。这些方法即时编译正则表达式，并且不缓存生成的对象。

以下示例代码为无害的单行代码.

```csharp
Regex.Match(myString，"foo");
```

但是，该代码每次执行时会产生 5 KB 的垃圾。通过简单的重构即可消除其中的大部分垃圾：

```csharp
var myRegExp = new Regex("foo");
myRegExp.Match(myString);
```

在本示例中，每次调用 `myRegExp.Match` "只" 产生 320 字节的垃圾。尽管这对于简单的匹配操作仍然代价高昂，但比前面的示例有了相当大的改进。

因此，**如果正则表达式是不变的字符串字面值，通过将正则表达式传递为正则表达式对象构造函数的第一个参数来预编译它们，可显著提高效率。** 这些预编译的正则表达式之后会被重用。

### XML、JSON 和其他长格式文本解析

解析文本通常是加载期间所发生的最繁重的操作之一。在某些情况下，解析文本所花费的时间可能超过加载和实例化资源所花费的时间。

此问题背后的原因取决于所使用的具体解析器。C# 的内置 XML 解析器极为灵活，但因此无法针对具体数据布局进行优化。

许多第三方解析器都是基于反射构建的。尽管反射在开发过程中是绝佳选择(因为它能让解析器快速适应不断变化的数据布局)，但众所周知，它的速度非常慢。

Unity 引入了采用其内置 [JSONUtility](https://docs.unity3d.com/cn/2021.3/ScriptReference/JsonUtility.html) API 的部分解决方案，该解决方案提供了读取/发出 JSON 的 Unity 序列化系统接口。在大多数基准测试中，它比纯 C# JSON 解析器快，但它与 Unity 序列化系统的其他接口具有相同的限制：没有额外代码的情况下，无法对许多复杂的数据类型(如字典)进行序列化(2)

注意: 请参阅 [ISerializationCallbackReceiver](https://docs.unity3d.com/cn/2021.3/ScriptReference/ISerializationCallbackReceiver.html) 接口，了解如何通过一种方法轻松添加必要的额外处理以便在 Unity 序列化过程中来回转换复杂数据类型。

当遇到文本数据解析所引起的性能问题时，请考虑三种替代解决方案。

**方案 1: 在构建时解析**

避免文本解析成本的最佳方法是完全取消运行时文本解析。通常，这意味着通过某种构建步骤将文本数据"烘焙"成二进制格式。

大多数选择使用该方法的开发者会将其数据移动到某种 ScriptableObject 衍生的类层级视图中，然后通过 AssetBundle 分配数据。有关使用 ScriptableObjects 的精彩讨论，请参阅 youtube 上 [Richard Fine 的 Unite 2016 讲座](https://www.youtube.com/watch?v=VBA1QCoEAX4)。

这种策略提供了最好的性能，但只适用于不需要动态生成的数据。它最适合游戏设计参数和其他内容。

**方案 2: 拆分和延迟加载**

第二种可行的方法是将必须解析的数据拆分为较小的数据块。拆分后，解析数据的成本可分摊到多个帧。在理想的情况下，可识别出为用户提供所需体验而需要的特定数据部分，然后只加载这些部分。

举一个简单的例子：如果项目为平台游戏，则没必要将所有关卡的数据一起序列。如果将数据拆分为每个关卡的独立资源，并且将关卡划分到区域中，则可以在玩家闯关到相应位置时再解析数据。

虽然这听起来不难，但实际上需要在工具编码方面投入大量精力，并可能需要重组数据结构。

**方案 3: 线程**  

对于完全解析为普通 C# 对象的数据，并且不需要与 Unity APIs 进行任何交互，可以将解析操作移动到工作线程。

这个选项在具有大量内核的平台上非常强大。但是，它需要仔细编程以避免产生死锁和竞争条件。

注意：iOS 设备最多 2 核. 大多数 Android 设备都有 2 到 4 个。在为独立和主机构建目标构建时，这种技术更有意义。

选择实现线程的项目使用内置的 C# [线程](https://learn.microsoft.com/zh-cn/dotnet/api/system.threading.thread?view=net-8.0) 和 [线程池](https://learn.microsoft.com/zh-cn/dotnet/api/system.threading.threadpool?view=net-8.0) 类(参见 [Thread Class](https://learn.microsoft.com/en-us/dotnet/api/system.threading.thread?view=net-8.0)) 来管理它们的工作线程，以及标准的 C# 同步类。

## Resources 文件夹

Resources 文件夹是 Unity 项目中许多常见问题的来源。Resources 文件夹的使用不当会使项目构建出现膨胀，导致内存消耗过高，并显著增加应用程序启动时间。

这些问题在 [Assets, Resources and AssetBundles](https://learn.unity.com/tutorial/assets-resources-and-assetbundles) 最佳实践指南中有详细介绍。请注意，参阅 **资源(Resources)** 章节以了解有关上述问题的更多信息。

## 一般优化

有多少原因导致性能问题，就有多少种不同的方式来优化代码。通常，强烈建议开发者在尝试应用 CPU 优化之前对其应用程序进行性能分析。不过，还是存在几种普遍适用的简易 CPU 优化方式。

### 按 ID 寻址属性

Unity **不使用字符串名称** 对 Animator、Material 和 Shader 属性进行内部寻址。为了加快速度，所有属性名称都经过哈希处理为属性 ID，实际上正是这些 ID 用于寻址属性。

因此，每当在 Animator、Material 或 Shader 上使用 Set 或 Get 方法时，请使用整数值方法而非字符串值方法。字符串方法只执行字符串哈希处理，然后将经过哈希处理的 ID 转发给整数值方法。

从字符串哈希创建的属性 ID 在单次运行过程中是不变的。它们最简单的用法是为每个属性名称声明一个静态只读整数变量，然后使用整数变量代替字符串。启动期间将自动进行初始化，无需其他初始化代码。

[Animator.StringToHash](https://docs.unity3d.com/cn/2021.3/ScriptReference/Animator.StringToHash.html) 是用于 Animator 属性名称的对应 API，[Shader.PropertyToID](https://docs.unity3d.com/cn/2021.3/ScriptReference/Shader.PropertyToID.html) 是用于 Material 和 Shader 属性名称的对应 API。

### 使用非分配物理 API

在 Unity 5.3 及更高版本中，引入了所有物理查询 API 的非分配版本。将 `RaycastAll` 调用替换为 `RaycastNonAlloc`，将 `SphereCastAll` 调用替换为 `SphereCastNonAlloc`，以此类推。对于 2D 应用程序，也存在所有 Physics2D 查询 API 的非分配版本。

### 与 UnityEngine.Object 子类进行 Null 比较

Mono 和 IL2CPP 运行时以特定方式处理从 [UnityEngine.Object](https://docs.unity3d.com/cn/2021.3/ScriptReference/Object.html) 派生的类的实例。在实例上调用方法实际上是调用引擎代码，此过程必须执行查找和验证以便将脚本引用转换为对原生代码的引用。将此类型变量与 Null 进行比较的成本虽然低，但远高于与纯 C# 类进行比较的成本。因此，请避免在紧凑循环中或每帧运行的代码中进行此类 Null 比较。

### 矢量和四元数数学以及运算顺序

对于位于紧凑循环中的矢量和四元数运算，请记住整数数学比浮点数学更快，而浮点数学比矢量、矩阵或四元数运算更快。

因此，每当交换或关联算术允许时，请尝试最小化单个数学运算的成本:

```csharp
Vector3 x;
int a，b;

// 效率较低: 产生两次矢量乘法
Vector3 slow = a * x * b;

// 效率较高: 一次整数乘法、一次矢量乘法
Vector3 fast = a * b * x;
```

### 内置 ColorUtility

对于必须在 HTML 格式的颜色字符串 (#RRGGBBAA) 与 Unity 的原生 Color 及 Color32 格式之间进行转换的应用程序来说，使用来自 Unify Community 的脚本是很常见的做法。由于需要进行字符串操作，此脚本不但速度很慢，而且会导致大量内存分配。

从 Unity 5 开始，有一个内置 [ColorUtility](https://docs.unity3d.com/cn/2021.3/ScriptReference/ColorUtility.html) API 可以有效执行此类转换。应优先使用内置 API.

### Find 和 FindObjectOfType

在代码中消灭 [GameObject.Find](https://docs.unity3d.com/cn/2021.3/ScriptReference/GameObject.Find.html) 和 [Object.FindObjectOfType](https://docs.unity3d.com/cn/2021.3/ScriptReference/Object.FindObjectOfType.html) 是一个通用的最佳实践。因为这些 APIs 需要 Unity 遍历内存中的所有游戏对象和组件，所以随着项目规模的增长，它们很快就会变得不具有性能。

在单例对象的访问器对上述规则来说是个例外。全局管理器对象往往会暴露 "instance" 属性，并且通常在 getter 中存在 `FindObjectOfType` 调用以便检测单例预先存在的实例:

```csharp
class SomeSingleton
{
    private SomeSingleton _instance;
    
    public SomeSingleton Instance
    {
        get {
            if(_instance == null)
            {
                _instance = FindObjectOfType<SomeSingleton>();
            }
            
            if(_instance == null)
            {
                _instance = CreateSomeSingleton();
            }
            
            return _instance;
        }
    }
}
```

虽然这种模式通常是可以接受的，但必须注意检查代码并确保调用访问器时场景中不存在单例对象。如果 getter 没有自动创建缺失单例的实例，那么寻找单例的代码经常会重复调用 FindObjectOfType(通常每帧多次发生)并且会对性能产生不良影响。

### 调试代码和 `[conditional]` 属性

[UnityEngine.Debug](https://docs.unity3d.com/cn/2021.3/ScriptReference/Debug.html) APIs 不会从非开发构建中剥离，并且在调用时会写入 log 文件。由于大多数开发人员不打算在非开发构建中写入调试信息，因此建议在自定义方法中进行仅用于开发包装，比如：

```csharp
public static class Logger
{
    [Conditional("ENABLE_LOGS")]
    public static void Debug(string logMsg)
    {
        UnityEngine.Debug.Log(logMsg);
    }
}
```

通过使用 `[Conditional]` 属性来修饰这些方法，`Conditional` 属性所使用的一个或多个定义将决定被修饰的方法是否包含在已编译的源代码中。

如果传递给 Conditional 属性的任何定义均未被定义，则会被修饰的方法以及对被修饰方法的所有调用都会在编译中剔除。实际效果与包裹在 `#if … #endif` 预处理器代码块中的方法以及对该方法的所有调用的处理情况相同。

有关 Conditional 属性的更多信息，请参阅 MSDN 网站: [Conditional(C# 编程指南)](https://learn.microsoft.com/zh-cn/previous-versions/visualstudio/visual-studio-2008/4xssyw96(v=vs.90))。

## 特别优化

上一部分介绍了适用于所有项目的优化，本节将详细介绍在收集性能分析数据之前不应使用的优化。可能的原因是这些优化在实现时非常耗费精力，在提高性能的同时可能会损害代码整洁性或可维护性，或者解决的可能仅仅是特定的范围内才存在的问题。

### 多维数组(`[,]`)与交错数组(`[][]`数组的数组)

如该 [StackOverflow 文章](http://stackoverflow.com/questions/597720/what-are-the-differences-between-a-multidimensional-array-and-an-array-of-arrays) 所述，遍历交错数组通常比遍历多维数组更高效，因为多维数组需要函数调用。

注意：

* 声明为 `type[x][y]` 则为数组的数组与 `type[x,y]` 不同.
* 使用 `ILSpy` 或类似工具检查通过访问多维数组生成的 IL 即可发现此情况.

在 Unity 5.3 中进行性能分析时，在三维 100x100x100 数组上进行 100 次完全顺序的迭代得出了以下时间，这些值是通过 10 遍测试获得的平均结果:

| 数组类型 | 总时间(100 次迭代) |
| :------- | :----------------- |
| 一维数组 | 660 ms             |
| 交错数组 | 730 ms             |
| 多维数组 | 3470 ms            |

根据访问多维数组与访问一维数组的成本差异，可看出额外函数调用的成本，而根据访问交错数组与访问一维数组的成本差异，可看出遍历非紧凑内存结构的成本。

如上所述，额外函数调用的成本大大超过了使用非紧凑内存结构所带来的成本。

如果操作对性能影响较大，建议使用一维数组。在任意其余情况下，如果需要一个具有多个维度的数组，请使用交错数组。不应使用多维数组。

### 粒子系统池

对粒子系统建池时，请注意它们至少消耗 3500 字节的内存。内存消耗根据粒子系统上激活的模块数量而增加。停用粒子系统时不会释放此内存。只有销毁粒子系统时才会释放。

从 Unity 5.3 开始，大多数粒子系统设置都可在运行时进行操作。对于必须汇集大量不同粒子效果的项目，将粒子系统的配置参数提取到数据载体类或结构中可能更有效。

需要某种粒子效果时，"通用" 粒子效果池即可提供必需的粒子效果对象。然后，可将配置数据应用于对象以实现期望的图形效果。

这种方案比尝试汇集给定场景中使用的粒子系统的所有可能变体和配置会更具内存使用效率，但需要大量的工程努力才能实现。

### 更新管理器(Update Manager)

在内部，Unity 会跟踪感兴趣的列表中的对象的回调(例如 `Update`、`FixedUpdate` 和 `LateUpdate`)。这些列表以侵入式链接列表的形式进行维护，从而确保在固定时间进行列表更新。在启用或禁用 MonoBehaviour 时分别会在这些列表中添加/删除 MonoBehaviour。

虽然直接将适当的回调添加到需要它们的 MonoBehaviour 十分方便，但随着回调数量的增加，这种方式将变得越来越低效。从原生代码调用托管代码回调有一个很小但很明显的开销。这会导致在调用大量每帧都执行的方法时延长帧时间，而且在实例化包含大量 MonoBehaviour 的预制件时延长实例化时间(注意：实例化成本归因于调用预制件中每个组件上的 `Awake` 和 `OnEnable` 回调时产生的性能开销)。

当具有每帧回调的 MonoBehaviour 数量增长到数百或数千时，删除这些回调并将 MonoBehaviour(甚至标准 C# 对象)连接到全局管理器单例可以优化性能。然后，全局管理器单例可将 Update、LateUpdate 和其他回调分发给感兴趣的对象。这种方式的另一个好处是允许代码在回调没有操作的情况下巧妙地将回调取消订阅，从而减少每帧必须调用的大量函数。

性能上最大的节约来自于消除很少执行的回调。请考虑以下伪代码：

```csharp
void Update()
{
    if(!someVeryRareCondition) { return; }
    // … 某种操作 …
}
```

如果大量 MonoBehaviour 具有上述类似 `Update` 回调，则运行 `Update` 回调所使用的大量时间会用于原生和托管代码域之间的切换以便执行 MonoBehaviour 之后再立即退出。如果这些类仅在 someVeryRareCondition 为 true 时订阅了全局更新管理器(Update Manager)，随后又取消了订阅，则可节省 **代码域切换** 和稀有条件评估所需的时间。

### 在更新管理器中使用 C# 委托

通常很容易想到使用普通的 C# 委托来实现这些回调。但是，C# 的委托实现方式适用于较低频率的订阅和取消订阅以及少量的回调。每次添加或删除回调时，C# 委托都会执行回调列表的完整拷贝。在单个帧期间，大型回调列表或大量回调订阅/取消订阅会导致内部 `Delegate.Combine` 方法性能消耗达到峰值。

如果频繁发生添加/删除操作，请考虑使用专为快速插入/删除(而非委托)设计的数据结构。

### 加载线程控制

Unity 允许开发者控制用于加载数据的后台线程的优先级。这一点对于尝试在后台将 `AssetBundle` 流式传输到磁盘时尤为重要。

主线程和图形线程的优先级都是 `ThreadPriority.Normal`；任何具有更高优先级的线程都会抢占主线程/图形线程的资源并导致帧率不稳，而优先级较低的线程则不会。如果任何线程与主线程具有相同的优先级，则 CPU 会尝试为这些线程提供相同的时间，在多个后台线程执行繁重操作(例如 `AssetBundle` 解压缩)的情况下，这通常会导致帧率卡顿。

目前，可在三个位置控制该优先级。

* 首先，资源加载调用(如 `Resources.LoadAsync` 和 `AssetBundle.LoadAssetAsync`)的默认优先级来自于 `Application.backgroundLoadingPriority` 设置。如文档所述，此调用还限制了主线程用于集成资源的时间(注意:  大多数类型的 Unity 资源都必须"集成"到主线程上。集成期间将完成资源初始化并执行某些线程安全操作。这包括编写回调调用(例如 Awake 回调)的脚本。请参阅"资源管理"指南以了解更多详细信息，从而限制资源加载对帧时间的影响。
* 其次，每个异步资源加载操作以及每个 `UnityWebRequest` 请求都返回一个 `AsyncOperation` 对象以监控和管理该操作。此 `AsyncOperation` 对象会显示 `priority` 属性，该属性可用于调整各个操作的优先级。
* 最后，WWW 对象(例如从 `WWW.LoadFromCacheOrDownload` 调用返回的对象)会显示 `threadPriority` 属性。请务必注意，WWW 对象不会自动使用 `Application.backgroundLoadingPriority` 设置作为其默认值；WWW 对象总是被默认为 `ThreadPriority.Normal`。

值得注意的是，用于底层系统在处理解压缩和加载数据时，不同 API 之间存在差异。`Resources.LoadAsync` 和 `AssetBundle.LoadAssetAsync` 由 Unity 的内部 `PreloadManager` 系统进行处理，该系统可管理自己的加载线程并执行自己的速率限制。`UnityWebRequest` 使用自己的专用线程池。`WWW` 在每次创建请求时都会生成一个全新的线程。

虽然所有其他加载机制都有内置的排队系统，但 `WWW` 却没有。在大量经过压缩的 `AssetBundle` 上调用 `WWW.LoadFromCacheOrDownload` 会生成相同数量的线程，这些线程随后会与主线程竞争 CPU 时间。这很容易导致帧率卡顿。

因此，使用 `WWW` 来加载和解压缩 `AssetBundle` 时，最佳做法是为创建的每个 `WWW` 对象的 `threadPriority` 设置适当的值。

### 大批量对象移动和 CullingGroup

正如"变换操作"部分所述，由于需要传播更改消息，移动大型变换层级视图的 CPU 成本相对较高。但是，在实际开发环境中，通常无法将层级视图精简为少量的游戏对象。

同时，在开发中最好仅运行那些能维持游戏世界可信度的行为，并去掉那些用户不会注意到的行为; 例如，在具有大量角色的场景中，较好的做法是仅对屏幕上的角色执行网格蒙皮和动画驱动的变换运动。对于屏幕上看不到的角色，消耗 CPU 时间来计算模拟它们的纯视觉元素是种浪费。

使用 Unity 5.1 中首次引入的 [CullingGroup](https://docs.unity3d.com/cn/2021.3/Manual/CullingGroupAPI.html) API 可以很好地解决这两个问题。

不要直接操作场景中的一大群游戏对象，应该对系统进行更改以操作 `CullingGroup` 中的一群 `BoundingSphere` 的 `Vector3` 参数。每个 `BoundingSphere` 充当单个游戏逻辑实体的世界空间位置的表征，并在实体移动到 `CullingGroup` 主摄像机的视锥体附近/内部时接收回调。然后，可使用这些回调来激活/停用特定代码或组件(例如 Animator)，从而控制那些仅应在实体可见时才需要运行的行为。

### 减少方法调用开销

C# 的字符串库提供了一个绝佳的案例研究，其中说明了向简单库代码添加额外方法调用的成本。在有关内置字符串 API `String.StartsWith` 和 `String.EndsWith` 的部分中，提到了手工编码的替换比内置方法快 10–100 倍，即使关闭了不需要的区域设置强制转换时也是如此。

这种性能差异的主要原因仅仅是向紧凑内循环添加额外方法调用的成本不同。调用的每个方法都必须在内存中找到该方法的地址，并将另一个帧推入栈。所有这些操作都是有成本的，但在大多数代码中，它们都小到可以忽略不计。

但是，在紧凑循环中运行较小的方法时，因引入额外方法调用而增加的开销可能会变得非常显著，甚至占主导地位。

请考虑以下两个简单方法.

示例 1:

```csharp

int Accum { get; set; }
Accum = 0;

for(int i = 0; i < myList.Count; i++)
{
    Accum += myList[i];
}
```

示例 2:

```csharp

int accum = 0;
int len = myList.Count;

for(int i = 0; i < len; i++)
{
    accum += myList[i];
}
```

这两个方法都在 C# 通用 `List<int>` 中计算所有整数之和。第一个示例是更 "现代的 C#"，因为它使用自动生成的属性来保存其数据值。

虽然从表面上看这两段代码似乎是等效的，但通过分析代码中的方法调用情况，可看出差异很明显.

示例 1:

```csharp

int Accum { get; set; }
Accum = 0;

for(int i = 0;
       i < myList.Count;    // 调用 List::getCount
       i++) {
    Accum       // 调用 set_Accum
	+=          // 调用 get_Accum
	myList[i];  // 调用 List::get_Value
}
```

每次循环执行时都有四个方法调用:

* `myList.Count` 调用 `Count` 属性上的 `get` 方法
* 必须调用 `Accum` 属性上的 `get` 和 `set` 方法
* 通过 `get` 检索 `Accum` 的当前值，以便将其传递给加法运算
* 通过 `set` 将加法运算的结果分配给 `Accum`
* `[]` 运算符调用列表的 `get_Value` 方法来检索列表特定索引位置的项值

示例 2:

```csharp

int accum = 0;
int len = myList.Count;

for(int i = 0;
    i < len;
    i++) {
    accum += myList[i]; // 调用 List::get_Value
}
```

在第二个示例中，`get_Value` 调用仍然存在，但已删除所有其他方法或不再是每个循环迭代便执行一次。

* 由于 `accum` 现在是原始值而不是属性，因此不需要进行方法调用来设置或检索其值。
* 由于假设 `myList.Count` 在循环运行期间不变化，其访问权限已移出循环的条件语句，因此不再在每次循环迭代开始时执行它。

这两个版本的执行时间显示了从这一特定代码片段中减少 75% 方法调用开销的真正优势。在现代台式机上运行 100,000 次的情况下：

* 示例 1 需要的执行时间为 324 毫秒
* 示例 2 需要的执行时间为 128 毫秒

这里的主要问题是 Unity 执行非常少的方法内联(即使有)。即使在 `IL2CPP` 下，许多方法目前也不能正确内联。对于属性尤其如此。此外，虚拟方法和接口方法根本无法内联。

因此，在源代码 C# 中声明的方法调用很可能最后在最终的二进制应用程序中产生方法调用。

### 简单属性

为了方便开发者，Unity 为数据类型提供了许多"简单"常量。但是，鉴于上述情况，必须注意这些常量通常作为返回常量值的属性。

`Vector3.zero` 的属性内容如下所示:

```csharp
get { return new Vector3(0,0,0); }
```

`Quaternion.identity` 非常相似:

```csharp
get { return new Quaternion(0,0,0,1); }
```

虽然访问这些属性的成本与它们周围的执行代码相比小的多，但它们每帧执行数千次(或更多次)时，可产生一定的影响。

对于简单的原始类型，请改用 `const` 值。`Const` 值在编译时内联 - 对 `const` 变量的引用将替换为其值。

注意：因为对 `const` 变量的每个引用都替换为其值，所以不建议声明长字符串或其他大型数据类型 `const`。否则，由于最终二进制代码中的所有重复数据，将导致不必要地增加最终二进制文件的大小。

当 `const` 不适合时，应使用 `static readonly` 变量。在有些项目中，即使 Unity 的内置简单属性也替换成了 `static readonly` 变量，使性能略有改善。

### 简单方法

简单方法比较棘手。如果能够在声明一次功能后在其他地方重用该功能，将非常有用。但是，在紧凑内部循环中，可能有必要打破美观编码规则，选择"手动内联"某些代码。

有些方法可能需要彻底删除。例如，`Quaternion.Set`、`Transform.Translate` 或 `Vector3.Scale`。这些方法执行非常简单的操作，可以用简单的赋值语句替换。

对于更复杂的方法，应权衡手动内联的性能提升与维护性能更高代码的长期成本之间的关系。