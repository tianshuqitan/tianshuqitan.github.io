---
created: 2025-05-05T 21:21:05
tags: []
source: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html
author: Unity Technologies
---

# Assembly definitions

Assembly Definitions 和 Assembly References 是你可以创建用来将你的 **scripts** 组织成 assemblies 的 assets。

一个 assembly 是一个 C# 代码库，它包含由你的 scripts 定义的已编译的 classes 和 structs，并且也定义了对其他 assemblies 的引用。有关 C# 中 assemblies 的一般信息，请参阅 [Assemblies in .NET]。

默认情况下，Unity 将几乎所有的游戏 scripts 编译到 _预定义_ assembly，即 _Assembly-CSharp.dll_。（Unity 也创建了 [几个更小的、专门的预定义 assemblies]。）

这种安排对于小型项目来说可以接受，但随着你向项目中添加更多代码，它会带来一些缺点：

* 每次你更改一个 script，Unity 都必须重新编译所有其他 scripts，这增加了迭代代码更改的整体编译时间。
* 任何 script 都可以直接访问在任何其他 script 中定义的类型，这可能使得重构和改进代码更加困难。
* 所有 scripts 都为所有平台编译。

通过定义 assemblies，你可以组织你的代码以促进模块化和可重用性。在你为项目定义的 assemblies 中的 Scripts 不再被添加到默认 assemblies 中，并且只能访问你指定的那些其他 assemblies 中的 scripts。

![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/ScriptCompilation.png)

上图说明了你如何将项目中的代码分割成多个 assemblies。因为 _Main_ 引用了 _Stuff_ 而不是反过来，你知道对 _Main_ 中代码的任何更改都不会影响 _Stuff_ 中的代码。同样，因为 _Library_ 不依赖于任何其他 assemblies，你可以更容易地在另一个项目中重用 _Library_ 中的代码。

## 定义 assemblies

要将你的项目代码组织成 assemblies，为每个所需的 assembly 创建一个文件夹，并将应属于每个 assembly 的 scripts 移动到相关文件夹中。然后 [创建 Assembly Definition assets](#创建-assembly-definition-asset) 来指定 assembly 属性。

Unity 获取包含 Assembly Definition asset 的文件夹中的所有 scripts，并使用该 asset 定义的名称和其他设置将它们编译成一个 assembly。Unity 还将任何子文件夹中的 scripts 包含在同一个 assembly 中，除非子文件夹有自己的 Assembly Definition 或 Assembly Reference asset。

要将非子文件夹中的 scripts 包含在现有 assembly 中，请在非子文件夹中创建一个 Assembly Reference asset，并将其设置为引用定义目标 assembly 的 Assembly Definition asset。例如，你可以将项目中所有 Editor 文件夹中的 scripts 组合到它们自己的 assembly 中，无论这些文件夹位于何处。

Unity 按照其依赖关系确定的顺序编译 assemblies；你无法指定编译发生的顺序。

## 引用和依赖关系

当一个类型（例如 class 或 struct）使用另一个类型时，第一个类型 _依赖于_ 第二个类型。当 Unity 编译一个 script 时，它必须能够访问该 script 所依赖的任何类型或其他代码。同样，当编译后的代码运行时，它必须能够访问其依赖项的编译版本。如果两个类型位于不同的 assemblies 中，则包含依赖类型的 assembly 必须声明对包含其所依赖类型的 assembly 的 _引用_ 。

你可以使用 Assembly Definition 的选项来控制项目中使用的 assemblies 之间的引用。Assembly Definition 设置包括：

* [Auto Referenced] – 预定义 assemblies 是否引用该 assembly
* [Assembly Definition References] – 对使用 Assembly Definitions 创建的其他项目 assemblies 的引用
* [Override References] + [Assembly References] – 对预编译 (plugin) assemblies 的引用
* [No Engine References] – 对 UnityEngine assemblies 的引用

**注意：** 使用 Assembly Definition 创建的 assemblies 中的 Classes 不能使用在预定义 assemblies 中定义的类型。

### 默认引用

默认情况下，预定义 assemblies 引用所有其他 assemblies，包括使用 Assembly Definitions 创建的 assemblies (1) 和作为 plugins 添加到项目中的预编译 assemblies (2)。此外，你使用 Assembly Definition asset 创建的 assemblies 会自动引用所有预编译 assemblies (3)：

![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/AssemblyDependencies.png)

在默认设置中，预定义 assemblies 中的 classes 可以使用项目中任何其他 assemblies 定义的所有类型。同样，你使用 Assembly Definition asset 创建的 assemblies 可以使用任何预编译 (plug-in) assemblies 中定义的所有类型。

你可以通过在 Assembly Definition asset 的 Inspector 中关闭 [Auto Referenced option] 来阻止一个 assembly 被预定义 assemblies 引用。关闭 auto-referenced 意味着当你更改 assembly 中的代码时，预定义 assemblies 不会重新编译，但也意味着预定义 assemblies 不能直接使用此 assembly 中的代码。请参阅 [Assembly Definition properties]。

同样，你可以通过在 plugin asset 的 [Plugin Inspector] 中关闭 [Auto Referenced property] 来阻止 plugin assembly 被自动引用。这会影响预定义 assemblies 和你使用 Assembly Definition 创建的 assemblies。有关更多信息，请参阅 [Plugin Inspector]。

当你为 **plug-in** 关闭 **Auto Referenced** 时，你可以在 Assembly Definition asset 的 Inspector 中显式引用它。启用 asset 的 [Override References] 选项并添加对 **plug-in** 的引用。请参阅 [Assembly Definition properties]。

**注意：** 你不能为预编译 assemblies 声明显式引用。预定义 assemblies 只能使用 auto-referenced assemblies 中的代码。

### 循环引用

当一个 assembly 引用第二个 assembly，而第二个 assembly 又引用第一个 assembly 时，就存在循环 assembly 引用。这种 assemblies 之间的循环引用是不允许的，并会报告错误，消息为：“Assembly with cyclic references detected.”

通常，这种 assemblies 之间的循环引用是由于 assemblies 中定义的 classes 内部存在循环引用而发生的。虽然同一 assembly 中 classes 之间的循环引用在技术上没有问题，但不同 assemblies 中 classes 之间的循环引用是不允许的。如果你遇到循环引用错误，你必须重构你的代码以移除循环引用，或者将相互引用的 classes 放在同一个 assembly 中。

## 创建 Assembly Definition asset

要创建 Assembly Definition asset：

1.  在 **Project** 窗口中，找到包含你想要包含在 assembly 中的 scripts 的文件夹。
2.  在该文件夹中创建一个 Assembly Definition asset (菜单: **Assets** > **Create** > **Assembly Definition**)。
3.  为该 asset 分配一个名称。默认情况下，assembly 文件使用你分配给 asset 的名称，但你可以在 **Inspector** 窗口中更改名称。

Unity 重新编译项目中的 scripts 以创建新的 assembly。完成后，你可以更改新的 Assembly Definition 的设置。

包含 Assembly Definition 的文件夹中的 scripts，包括任何子文件夹中的 scripts（除非这些文件夹包含它们自己的 Assembly Definition 或 Reference assets），都会被编译到新的 assembly 中，并从它们之前的 assembly 中移除。

## 创建 Assembly Definition Reference asset

要创建 Assembly Definition Reference asset：

1.  在 **Project** 窗口中，找到包含你想要包含在被引用 assembly 中的 scripts 的文件夹。

2.  在该文件夹中创建一个 Assembly Reference asset (菜单: **Assets** > **Create** > **Assembly Definition Reference**)。

3.  为该 asset 分配一个名称。

    Unity 重新编译项目中的 scripts 以创建新的 assembly。完成后，你可以更改新的 Assembly Definition Reference 的设置。

4.  选择新的 Assembly Definition Reference asset 以在 **Inspector** 中查看其属性。

    ![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/asmdef-2.png)

5.  将 Assembly Definition 属性设置为引用目标 Assembly Definition asset。

6.  点击 **Apply**。


包含 Assembly Definition Reference asset 的文件夹中的 scripts，包括任何子文件夹中的 scripts（除非这些文件夹包含它们自己的 Assembly Definition 或 Reference assets），都会被编译到被引用的 assembly 中，并从它们之前的 assembly 中移除。

## 创建特定平台的 assembly

要为特定平台创建 assembly：

1.  [Create an Assembly Definition asset]。

2.  选择新的 Assembly Definition Reference asset 以在 **Inspector** 中查看其属性。

    ![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/asmdef-3.png)

3.  勾选 **Any Platform** 选项并选择要排除的特定平台。或者，你可以取消勾选 Any Platform 并选择要包含的特定平台。

4.  点击 **Apply**。

当你为某个平台构建项目时，该 assembly 将根据所选平台被包含（或排除）。

## 为 Editor 代码创建 assembly

Editor assemblies 允许你将 Editor scripts 放在项目的任何位置，而不仅仅是名为 _Editor_ 的顶级文件夹中。

要创建一个包含项目中 Editor 代码的 assembly：

1.  在一个包含你的 Editor scripts 的文件夹中 [Create a platform-specific assembly]。
2.  仅包含 Editor 平台。
3.  如果你有其他包含 Editor scripts 的文件夹，请在这些文件夹中 [create Assembly Definition Reference assets] 并将它们设置为引用此 Assembly Definition。

## 创建测试 assembly

Test assemblies 允许你编写测试并使用 Unity TestRunner 运行它们，同时将你的测试代码与你随应用程序一起发布的代码分开。Unity 提供 TestRunner 作为 [Test Framework package] 的一部分。有关安装 Test Framework package 和创建 test assemblies 的说明，请参阅 [Test Framework documentation]。

## 引用另一个 assembly

要使用属于另一个 assembly 的 C# 类型和函数，你必须在 Assembly Definition asset 中创建对该 assembly 的引用。

要创建 assembly 引用：

1.  选择需要引用的 assembly 的 Assembly Definition，以在 **Inspector** 中查看其属性。

2.  在 **Assembly Definition References** 部分，点击 **+** 按钮添加一个新的引用。

    ![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/asmdef-4.png)

3.  将 Assembly Definition asset 分配给引用列表中新创建的槽位。

启用 **Use GUIDs** 选项允许你更改被引用的 Assembly Definition asset 的文件名，而无需更新其他 Assembly Definitions 中的引用以反映新名称。（请注意，如果 asset 文件的元数据文件被删除，或者你在 Unity Editor 之外移动文件而没有同时移动元数据文件，则必须重置 GUID。）

## 引用预编译的 plugin assembly

默认情况下，项目中所有使用 Assembly Definitions 创建的 assemblies 都会自动引用所有预编译 assemblies。这些自动引用意味着当你更新任何一个预编译 assembly 时，Unity 必须重新编译你所有的 assemblies，即使该 assembly 中的代码没有被使用。为了避免这种额外的开销，你可以覆盖自动引用，并仅指定该 assembly 实际使用的预编译库的引用：

1.  选择需要引用的 assembly 的 Assembly Definition，以在 **Inspector** 中查看其属性。

2.  在 **General** 部分，启用 **Override References** 选项。

    ![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/asmdef-5.png)

    当勾选 **Override References** 时，**Inspector** 的 **Assembly References** 部分变为可用。

3.  在 **Assembly References** 部分，点击 **+** 按钮添加一个新的引用。

4.  使用空槽位中的下拉列表分配对预编译 assembly 的引用。该列表显示了项目中当前在项目 [Build Settings] 中设置的平台的所有预编译 assemblies。（在 [Plugin Inspector] 中为预编译 assembly 设置平台兼容性。）

    ![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/asmdef-6.png)

5.  点击 **Apply**。

6.  为你构建项目的每个平台重复此操作。

## 条件性地包含 assembly

你可以使用预处理器符号来控制一个 assembly 是否被编译并包含在你的游戏或应用程序的构建中（包括在 Editor 中的 play mode）。你可以使用 Assembly Definition 选项中的 **Define Constraints** 列表指定必须定义哪些符号才能使用一个 assembly：

1.  选择该 assembly 的 Assembly Definition 以在 **Inspector** 中查看其属性。

2.  在 **Define Constraints** 部分，点击 **+** 按钮向约束列表添加一个新符号。

    ![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/asmdef-7.png)

3.  输入符号名称。

    你可以通过在名称前加上感叹号来“否定”该符号。例如，约束 `!UNITY_WEBGL` 将在未定义 UNITY_WEBGL 时包含该 assembly。

4.  点击 **Apply**。


你可以使用以下符号作为约束：

* 在 [Scripting Define Symbols] 设置中定义的符号，你可以在 **Project Settings** 的 **Player** 部分找到它。请注意，**Scripting Define Symbols** 适用于你项目 [Build Settings] 中当前设置的平台。要为多个平台定义符号，你必须切换到每个平台并单独修改 **Scripting Define Symbols** 字段。
* Unity 定义的符号。请参阅 [Platform dependent compilation]。
* 使用 Assembly Definition asset 的 [Version Defines] 部分定义的符号。

在确定约束是否已满足时，不考虑在 scripts 中定义的符号。

有关其他信息，请参阅 [Define Constraints]。

## 根据 Unity 和项目 package 版本定义符号

如果你需要根据项目是否使用特定版本的 Unity 或 package 来编译 assembly 中的不同代码，你可以向 **Version Defines** 列表添加条目。此列表指定了何时应定义符号的规则。对于版本号，你可以指定一个计算结果为特定版本或版本范围的逻辑表达式。

要有条件地定义符号：

1.  选择该 assembly 的 Assembly Definition asset 以在 **Inspector** 中查看其属性。

2.  在 **Version Defines** 部分，点击 **+** 按钮向列表添加一个条目。

3.  设置属性：

    * **Resource**: 选择 **Unity** 或必须安装的 package 或 module，以便定义此符号
    * **Define**: 符号名称
    * **Expression**: 一个计算结果为特定版本或版本范围的表达式。规则请参阅 [Version Define Expressions]。

    **Expression outcome** 显示表达式计算结果为哪些版本。如果结果显示 **Invalid**，则表达式语法不正确。

    以下示例定义了符号 USE_TIMELINE_1_3（如果项目使用 Timeline 1.3）和 USE_NEW_APIS（如果项目在 Unity 2021.2.0a7 或更高版本中打开）：

    ![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/asmdef-8.png)

4.  点击 **Apply**。

在 Assembly Definition 中定义的符号仅在该 definition 创建的 assembly 中的 scripts 的作用域内。

请注意，你可以使用 **Version Defines** 列表定义的符号作为 **Define Constraints**。因此，你可以指定一个 assembly 仅在项目中同时安装了给定 package 的特定版本时才应使用。

### Version Define 表达式

你可以使用表达式来指定确切的版本或版本范围。**Version Define** 表达式使用数学范围表示法。

方括号 “\[\]” 表示范围包含端点：

> `[1.3,3.4.1]` 计算结果为 `1.3.0 <= x <= 3.4.1`

圆括号 “()” 表示范围排除端点：

> `(1.3.0,3.4)` 计算结果为 `1.3.0 < x < 3.4.0`

你可以在单个表达式中混合使用两种范围类型：

> `[1.1,3.4)` 计算结果为 `1.1.0 <= x < 3.4.0`
>
> `(0.2.4,5.6.2-preview.2]` 计算结果为 `0.2.4 < x <= 5.6.2.-preview.2`

你可以使用方括号中的单个版本指示符来指定确切的版本：

> `[2.4.5]` 计算结果为 `x = 2.4.5`

作为快捷方式，你可以输入单个版本而不带范围括号，以表示表达式包含该版本或更高版本：

> `2.1.0-preview.7` 计算结果为 `x >= 2.1.0-preview.7`

**注意：** 表达式中不允许有空格。不支持通配符。

### Unity 版本号

当前版本的 Unity（以及所有支持 Assembly Definitions 的版本）使用包含三个部分的版本指示符：MAJOR.MINOR.REVISION，例如 `2017.4.25f1`、`2018.4.29f1` 和 `2019.4.7f1`。

* MAJOR 版本是目标发布年份，例如 2017 或 2021。
* MINOR 版本是目标发布季度，例如 1、2、3 或 4。
* REVISION 指示符本身有三个部分，格式为：RRzNN，其中：
    * RR 是一位或两位数的修订号
    * z 是指定发布类型的字母：
        * a = alpha release
        * b = beta release
        * f = 正常的公共 release
        * c = 中国 release 版本 (等同于 f)
        * p = patch release
        * x = experimental release
    * NN 是一位或两位数的增量数字

发布类型指示符的比较如下：

> `a < b < f = c < p < x`

换句话说，alpha release 被认为早于 beta release，后者早于 normal (f) 或 China (c) release。patch release 总是晚于具有相同修订号的 normal 或 China release，而 experimental release 晚于任何其他发布类型。请注意，experimental releases 末尾不使用增量数字。

Unity 版本号允许在 REVISION 组件后带有后缀，例如 `2019.3.0f11-Sunflower`。在比较版本时，任何后缀都会被忽略。

例如，以下表达式包含任何 2017 或 2018 版本的 Unity，但不包含 2019 或更高版本的任何版本：

```
[2017,2019)
```

### Package 和 module 版本号

Package 和 module 版本指示符有四个部分，遵循 [Semantic Versioning] 格式：MAJOR.MINOR.PATCH-LABEL。前三个部分始终是数字，但 label 是一个字符串。预览中的 Unity packages 使用字符串 `preview` 或 `preview.n`，其中 `n > 0`。有关 package 版本号的更多信息，请参阅 [Package Versioning]。

例如，以下表达式包含 MAJOR.MINOR 版本在 3.2 和 6.1 之间（含）的 package 的所有版本：

```
[3.2,6.1]
```

## 查找 script 属于哪个 assembly

要识别你的 C# scripts 中的一个被编译到哪个 assembly 中：

1.  在 Unity **Project** 窗口中选择 C# script 文件，以在 **Inspector** 窗口中查看其属性。

2.  assembly 文件名和 Assembly Definition（如果存在）显示在 **Inspector** 的 **Assembly Information** 部分。

    ![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/asmdef-9.png)


在此示例中，所选 script 被编译到库文件 Unity.Timeline.Editor.dll 中，该文件由 Unity.Timeline.Editor Assembly Definition asset 定义。

## 特殊文件夹

Unity 对待某些特殊名称文件夹中的 scripts 与其他文件夹中的 scripts 不同。但是，当你在其中一个特殊文件夹内部或其上层文件夹中创建 Assembly Definition asset 时，该文件夹会失去其特殊处理。当你使用 Editor 文件夹时，你可能会注意到这种变化，这些文件夹可能散布在你的 Project 中（取决于你如何组织代码以及你使用的 [Asset Store packages]）。

通常，Unity 会将名为 Editor 的文件夹中的任何 scripts 编译到预定义的 Assembly-CSharp-Editor assembly 中，无论这些 scripts 位于何处。但是，如果你在一个其下有 Editor 文件夹的文件夹中创建 Assembly Definition asset，Unity 将不再将这些 Editor scripts 放入预定义的 Editor assembly 中。相反，它们会进入由你的 Assembly Definition 创建的新 assembly 中——而它们可能不属于那里。要管理 Editor 文件夹，你可以在每个 Editor 文件夹中创建 Assembly Definition 或 Reference assets，以将这些 scripts 放入一个或多个 Editor assemblies 中。请参阅 [Creating an assembly for Editor code]。

## 设置 assembly attributes

你可以使用 assembly attributes 来设置 assemblies 的元数据属性。按照惯例，assembly attribute 语句通常放在名为 AssemblyInfo.cs 的文件中。

例如，以下 assembly attributes 指定了一些 [.NET assembly metadata values]、一个 [InternalsVisibleTo] attribute（这对于测试很有用），以及 Unity 定义的 [Preserve attribute]，它会影响在构建项目时如何从 assembly 中移除未使用的代码：

```cs
[assembly: System.Reflection.AssemblyCompany("Bee Corp.")]
[assembly: System.Reflection.AssemblyTitle("Bee's Assembly")]
[assembly: System.Reflection.AssemblyCopyright("Copyright 2020.")]
[assembly: System.Runtime.CompilerServices.InternalsVisibleTo("UnitTestAssembly")]
[assembly: UnityEngine.Scripting.Preserve]
```

## 在构建 scripts 中获取 assembly 信息

使用 UnityEditor.Compilation 命名空间中的 CompilationPipeline class 来检索有关 Unity 为项目构建的所有 assemblies 的信息，包括基于 Assembly Definition assets 创建的那些。

例如，以下 script 使用 CompilationPipeline class 列出项目中所有当前的 Player assemblies：

```cs
using UnityEditor;
using UnityEditor.Compilation;
public static class AssemblyLister
{
    [MenuItem("Tools/List Player Assemblies in Console")]
    public static void PrintAssemblyNames()
    {
        UnityEngine.Debug.Log("== Player Assemblies ==");
        Assembly[] playerAssemblies =
            CompilationPipeline.GetAssemblies(AssembliesType.Player);

        foreach (var assembly in playerAssemblies)
        {
            UnityEngine.Debug.Log(assembly.name);
        }
    }
}
```

[.NET assembly metadata values]: https://docs.microsoft.com/en-us/dotnet/standard/assembly/set-attributes
[Assemblies in .NET]: https://docs.microsoft.com/en-us/dotnet/standard/assembly/
[Assembly Definition properties]: https://docs.unity3d.com/2021.3/Documentation/Manual/class-AssemblyDefinitionImporter.html
[Assembly Definition References]: https://docs.unity3d.com/2021.3/Documentation/Manual/class-AssemblyDefinitionReferenceImporter.html
[Assembly References]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#reference-another-assembly
[Asset Store packages]: https://docs.unity3d.com/2021.3/Documentation/Manual/AssetStorePackages.html
[Auto Referenced option]: https://docs.unity3d.com/2021.3/Documentation/Manual/class-AssemblyDefinitionImporter.html#general
[Auto Referenced property]: https://docs.unity3d.com/2021.3/Documentation/Manual/PluginInspector.html
[Auto Referenced]: https://docs.unity3d.com/2021.3/Documentation/Manual/class-AssemblyDefinitionImporter.html#general
[Build Settings]: https://docs.unity3d.com/2021.3/Documentation/Manual/BuildSettings.html
[Create a platform-specific assembly]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#create-platform-specific
[Create an Assembly Definition asset]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#create-asmdef
[create Assembly Definition assets]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#create-asmdef
[create Assembly Definition Reference assets]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#create-asmref
[Define Constraints]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#define-constraints
[few smaller, specialized predefined assemblies]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompileOrderFolders.html
[InternalsVisibleTo]: https://docs.microsoft.com/en-us/dotnet/api/system.runtime.compilerservices.internalsvisibletoattribute?view=netcore-2.0
[No Engine References]: https://docs.unity3d.com/2021.3/Documentation/Manual/class-AssemblyDefinitionImporter.html#general
[Override References]: https://docs.unity3d.com/2021.3/Documentation/Manual/class-AssemblyDefinitionImporter.html#general
[Package Versioning]: https://docs.unity3d.com/2021.3/Documentation/Manual/upm-semver.html
[Platform dependent compilation]: https://docs.unity3d.com/2021.3/Documentation/Manual/PlatformDependentCompilation.html
[Plugin Inspector]: https://docs.unity3d.com/2021.3/Documentation/Manual/PluginInspector.html
[Preserve attribute]: https://docs.unity3d.com/2021.3/Documentation/Manual/ManagedCodeStripping.html#PreserveAttribute
[Scripting Define Symbols]: https://docs.unity3d.com/2021.3/Documentation/Manual/class-PlayerSettingsStandalone.html#Configuration
[Semantic Versioning]: https://semver.org/
[Test Framework documentation]: https://docs.unity3d.com/Packages/com.unity.test-framework@latest?subfolder=/manual/workflow-create-test-assembly.html
[Test Framework package]: https://docs.unity3d.com/Manual/com.unity.test-framework.html
[Version Define Expressions]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#version-define-expressions
[Version Defines]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#define-symbols
