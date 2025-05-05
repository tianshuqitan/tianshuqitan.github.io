---
created: 2025-04-18T 00:08:22
tags: []
source: https://docs.unity3d.com/cn/current/Manual/optimizing-draw-calls.html
author: Unity Technologies
---

# DrawCall 优化

要在屏幕上绘制几何体，Unity 会向图形 API 发出绘制调用。绘制调用告诉图形 API 要绘制什么以及如何绘制。每个绘制调用包含图形 API 在屏幕上绘制所需的所有信息，例如关于纹理(Textures)、着色器(Shaders)和缓冲区(Buffers)的信息。绘制调用(DrawCall)可能很耗费资源，但通常为绘制调用所做的准备工作比绘制调用本身更耗费资源。
> 绘制的一般流程为：把数据加载到显存(手机无显卡，公用内存，没这一步) -> 设置渲染状态 -> 调用 DrawCall。

为了准备绘制调用，CPU 会设置资源并更改 GPU 上的内部设置。这些设置统称为渲染状态(Render State)。**对渲染状态的更改（例如切换到不同的材质）是图形 API 执行的最耗费资源的操作**。
> 有一些优化策略，降低的不是 DrawCall 的次数，减少的是设置渲染状态的消耗。

由于渲染状态更改很耗费资源，因此优化它们非常重要。优化渲染状态更改的主要方法是减少它们的数量。有两种方法可以做到这一点：

* 减少绘制调用的总数。当您减少绘制调用的数量时，您也减少了它们之间的渲染状态更改的数量。
* 以减少渲染状态更改数量的方式组织绘制调用。如果图形 API 可以使用相同的渲染状态执行多个绘制调用，则可以将绘制调用分组在一起，而不需要执行那么多渲染状态更改。

优化绘制调用和渲染状态更改对您的应用程序有许多好处。主要是它提高了帧时间，但它还：

* 减少应用程序所需的电量。对于电池供电的设备，这会降低电池耗尽的速度。它还减少了设备在运行您的应用程序时产生的热量。
* 提高应用程序未来开发的可维护性。当您尽早优化绘制调用和渲染状态更改并将其保持在优化水平时，您可以向场景添加更多 GameObject 而不会产生大的性能开销。

您可以在 Unity 中使用多种方法来优化和减少绘制调用和渲染状态更改。某些方法更适合某些场景。Unity 中可用的方法如下：

* [GPU instancing](#gpu-instancing): 同时渲染同一网格的多个副本。GPU 实例化对于绘制在场景中多次出现的几何体（例如树木或灌木）很有用。
* [DrawCall 批处理](#drawcall-批处理)：组合网格以减少绘制调用。Unity 提供以下类型的内置 DrawCall 批处理：
    * [静态批处理](#静态批处理)：预先组合 [static] GameObject 的网格。Unity 将组合数据发送到 GPU，但单独渲染组合中的每个网格。Unity 仍然可以单独剔除网格，但每个绘制调用的资源密集度较低，因为数据的状态永远不会改变。
    * [动态批处理](#动态批处理)：在 CPU 上变换网格顶点，将共享相同配置的顶点分组，并在一个绘制调用中渲染它们。如果顶点存储相同数量和类型的属性，则它们共享相同的配置。例如，`position` 和 `normal`。
* [手动合并网格](#手动合并网格)：使用 [Mesh.CombineMeshes] 函数手动将多个网格组合成一个网格。Unity 在单个绘制调用中渲染组合的网格，而不是每个网格一个绘制调用。
* [SRP Batcher](#srp-batcher)：如果您的项目使用可编程渲染管线 (SRP)，请使用 SRP Batcher 减少 Unity 准备和分派使用相同着色器变体的材质的绘制调用所需的 CPU 时间。

**优先级**

您可以在同一场景中使用多种绘制调用优化方法，但请注意 Unity 会按特定顺序优先考虑绘制调用优化方法。如果您将 GameObject 标记为使用多个绘制调用优化方法，Unity 会使用优先级最高的方法。唯一的例外是 [SRP Batcher](#srp-batcher)。当您使用 SRP Batcher 时，Unity 还支持对与 SRP Batcher 兼容的 GameObjects 进行静态批处理。Unity 按以下顺序优先考虑绘制调用优化：

1. SRP Batcher 和静态批处理
2. GPU instancing
3. 动态批处理

如果您将 GameObject 标记为静态批处理并且 Unity 成功批处理它，Unity 会禁用该 GameObject 的 GPU instancing，即使渲染器使用实例化着色器也是如此。发生这种情况时，Inspector 窗口会显示一条警告消息，建议您禁用静态批处理。同样，如果 Unity 可以对网格使用 GPU instancing，Unity 会禁用该网格的动态批处理。

## GPU instancing

[GPU 实例化](./GPUInstancing.md)

## DrawCall 批处理

DrawCall 批处理(Draw call batching)是一种 DrawCall 优化方法，它组合网格以便 Unity 可以用更少的绘制调用渲染它们。Unity 提供两种内置的DrawCall 批处理方法：

* [静态批处理](#静态批处理): 对于 [static] GameObject，Unity 将它们组合在一起并一起渲染。
* [动态批处理](#动态批处理): 对于足够小的网格，这会在 CPU 上变换它们的顶点，将相似的顶点分组在一起，并在一个绘制调用中渲染它们。

Unity 的内置DrawCall 批处理比手动合并网格有几个优点；最值得注意的是，Unity 仍然可以单独剔除网格。但是，它也有一些缺点；**静态批处理会产生内存和存储开销**，而**动态批处理会产生一些 CPU 开销**。

**要求和兼容性**

本节包含有关 Unity 内置DrawCall 批处理方法的渲染管线兼容性的信息。

渲染管线兼容性

| **功能**             | **内置渲染管线** | **通用渲染管线(URP)** | **高清渲染管线(HDRP)** | **自定义可编程渲染管线(SRP)** |
| :------------------- | :--------------- | :-------------------- | :--------------------- | :---------------------------- |
| **Static Batching**  | 是               | 是                    | 是                     | 是                            |
| **Dynamic Batching** | 是               | 是                    | 否                     | 是                            |

**使用 DrawCall 批处理**

以下使用信息与静态和动态批处理都相关。有关每种 DrawCall 批处理方法的特定信息，例如如何启用和使用每种方法，请参阅 [静态批处理](#静态批处理) 和 [动态批处理](#动态批处理)。

[Mesh Renderer]、[Trail Renderers]、[Line Renderers]、[Particle Systems] 和 [Sprite Renderers] 支持 DrawCall 批处理。其他类型的渲染组件（包括 Skinned Mesh Renderers Cloth）不受支持。Unity 仅将相同类型的渲染器与其他渲染器批处理在一起；例如，Mesh Renderers 与 Mesh Renderers。

Unity **批处理使用相同材质的 GameObject 的绘制调用**。这意味着要从 DrawCall 批处理中获得最佳结果，请在**尽可能多的 GameObject 之间共享材质**。如果您有两个材质资源除了它们的纹理之外完全相同，您可以将纹理组合成一个更大的单一纹理。此过程称为纹理图集。有关更多信息，请参阅关于纹理图集的 [Wikipedia article]。当纹理位于同一图集中时，您可以使用单个材质资源。

在 Built-in Render Pipeline 中，您可以使用 [MaterialPropertyBlock] 更改材质属性而不会破坏 DrawCall 批处理。CPU 仍然需要进行一些渲染状态更改，但使用 `MaterialPropertyBlock` 比使用多个材质更快。如果您的项目使用 Scriptable Render Pipeline，请不要使用 `MaterialPropertyBlock`，因为它们会移除材质的 SRP Batcher 兼容性。

透明着色器通常要求 Unity 以从后到前的顺序渲染网格。为了批处理透明网格，Unity 首先将它们从后到前排序，然后尝试批处理它们。由于 Unity 必须从后到前渲染网格，因此它通常无法像不透明网格那样批处理那么多透明网格。

Unity 无法对 Transform 组件中包含镜像的 GameObject 应用动态批处理。例如，如果一个 GameObject 的比例为 1，而另一个 GameObject 的比例为 –1，Unity 无法将它们批处理在一起。

如果您无法使用 DrawCall 批处理，手动组合彼此靠近的网格可能是一个很好的替代方案。有关组合网格的更多信息，请参阅 [手动合并网格](#手动合并网格)。

**警告**：当您从 C# 脚本访问共享材质属性时，请确保使用 [Renderer.sharedMaterial] 而不是 [Renderer.material]。`Renderer.material` 创建材质的副本并将副本分配回渲染器。这会阻止 Unity 批处理该渲染器的绘制调用。

### 静态批处理

静态批处理是一种 [DrawCall 批处理](#drawcall-批处理draw-call-batching) 方法，它组合不移动的网格以减少 DrawCall。它将组合的网格变换到世界空间并为它们构建一个共享的顶点和索引缓冲区。然后，对于可见的网格，Unity 执行一系列简单的绘制调用，每个调用之间几乎没有状态更改。**静态批处理不会减少绘制调用的数量，而是减少它们之间的渲染状态更改的数量**。

静态批处理比 [动态批处理](#动态批处理) 更高效，因为静态批处理不会在 CPU 上变换顶点。有关静态批处理的性能影响的更多信息，请参阅 [Performance implications]。

**渲染管线兼容性**

| **功能**            | **内置渲染管线** | **通用渲染管线 (URP)** | **高清渲染管线 (HDRP)** | **自定义可编程渲染管线(SRP)** |
| :------------------ | :--------------- | :--------------------- | :---------------------- | :---------------------------- |
| **Static Batching** | 是               | 是                     | 是                      | 是                            |

**使用静态批处理**

Unity 可以在构建时和运行时执行静态批处理。作为一般规则，如果 GameObject 在构建应用程序之前存在于场景中，请使用 [Editor] 在构建时批处理您的 GameObject。如果您在运行时创建 GameObject 及其网格，请使用 [Runtime API]。

当您使用运行时 API 时，您可以更改静态批处理根的变换属性。这意味着您可以移动、旋转或缩放构成静态批处理的整个网格组合。您不能更改单个网格的变换属性。

要对一组 GameObject 使用静态批处理，GameObject 必须符合静态批处理的条件。除了 [使用 DrawCall 批处理] 中描述的标准外，请确保：

* GameObject 处于活动状态。
* GameObject 具有 [Mesh Filter] 组件，并且该组件已启用。
* Mesh Filter 组件引用了 [Mesh]。
* 网格启用了读/写。
* 网格的顶点数大于 0。
* 网格尚未与其他网格组合。
* GameObject 具有 [Mesh Renderer] 组件，并且该组件已启用。
* Mesh Renderer 组件不使用任何着色器将 `DisableBatching` 标签设置为 true 的材质。
* 您想要批处理在一起的网格使用相同的顶点属性。例如，Unity 可以批处理使用顶点位置、顶点法线和一个 UV 的网格，但不能批处理使用顶点位置、顶点法线、UV0、UV1 和顶点切线的网格。

有关静态批处理的性能影响的信息，请参阅 [性能影响]。

**构建时的静态批处理**

您可以在 Editor 中启用构建时的静态批处理。

要在构建时执行静态批处理：

1. 转到 **Edit** > **Project Settings** > **Player**。
2. 在 **Other Settings** 中，启用 **Static Batching**。
3. 在 Scene 视图或 Hierarchy 中，选择要批处理的 GameObject 并在 Inspector 中查看它。
    **提示**：您可以同时选择多个 GameObject 以对所有它们启用静态批处理。
4. 在 GameObject 的 [Static Editor Flags] 中，启用 **Batching Static**。

如果静态网格满足 [使用 DrawCall 批处理] 中描述的标准，Unity 会自动将指定的静态网格批处理到同一绘制调用中。

![](https://docs.unity3d.com/cn/current/uploads/Main/StaticTagInspector.png)
> Inspector 中 GameObject 的 Static Editor Flags 复选框。

**注意**：如果您在构建时执行静态批处理，Unity 在运行时不会使用任何 CPU 资源来生成静态批处理的网格数据。

**运行时的静态批处理**

要在运行时批处理静态网格，Unity 提供了 [StaticBatchingUtility] 类。静态 [StaticBatchingUtility.Combine] 方法组合您传入的 GameObject 并准备它们进行静态批处理。这对于您在运行时以程序方式生成的网格特别有用。

与构建时的静态批处理不同，运行时的批处理不需要您启用 **Static Batching** Player 设置。有关如何使用此 API 的信息，请参阅 [StaticBatchingUtility]。

**性能影响**

使用静态批处理需要额外的 CPU 内存来存储组合的几何体。如果多个 GameObject 使用相同的网格，**Unity 会为每个 GameObject 创建网格的副本**，并将每个副本插入组合的网格中。这意味着相同的几何体在组合的网格中多次出现。无论您使用 [Editor] 还是 [Runtime API] 准备 GameObject 进行静态批处理，Unity 都会这样做。如果您希望保持较小的内存占用，您可能不得不牺牲渲染性能并避免对某些 GameObject 进行静态批处理。例如，在密集的森林环境中将树木标记为静态可能会对内存产生严重影响。

**注意**：静态批处理可以包含的顶点数量有限制。每个静态批处理最多可以包含 `64000` 个顶点。如果有更多，Unity 会创建另一个批处理。

### 动态批处理

动态批处理是一种 [DrawCall 批处理](#drawcall-批处理draw-call-batching) 方法，它批处理移动的 GameObject 以减少 DrawCall。动态批处理在网格和 Unity 在运行时动态生成的几何体（例如 [Particle Systems]）之间的工作方式不同。有关网格和动态生成的几何体之间的内部差异的信息，请参阅 [网格的动态批处理] 和 [动态生成的几何体的动态批处理]。

**注意**：网格的动态批处理旨在优化旧低端设备的性能。在现代消费级硬件上，**动态批处理在 CPU 上所做的工作可能比绘制调用的开销更大**。这会对性能产生负面影响。有关更多信息，请参阅 [网格的动态批处理]。

**渲染管线兼容性**

| **功能**             | **内置渲染管线** | **通用渲染管线 (URP)** | **高清渲染管线 (HDRP)** | **自定义可编程渲染管线(SRP)** |
| :------------------- | :--------------- | :--------------------- | :---------------------- | :---------------------------- |
| **Dynamic Batching** | 是               | 是                     | 否                      | 是                            |

**使用动态批处理**

Unity 始终对动态几何体（如 Particle Systems）使用动态批处理。

要对网格使用动态批处理：

1. 转到 **Edit** > **Project Settings** > **Player**。
2. 在 **Other Settings** 中，启用 **Dynamic Batching**。

如果移动的网格满足 [使用 DrawCall 批处理] 中描述的标准，Unity 会自动将它们批处理到同一绘制调用中。

**网格的动态批处理**

网格的动态批处理通过**在 CPU 上**而不是 GPU 上变换所有顶点来工作。这意味着动态批处理只有在变换工作比执行绘制调用更不耗费资源时才是一种优化。

绘制调用的资源需求取决于许多因素，主要是图形 API。例如，在主机或现代 API（如 Apple Metal）上，绘制调用的开销通常要低得多，而且动态批处理通常不会带来性能提升。要确定在您的应用程序中使用动态批处理是否有益，请 [Profiler] 您的应用程序，比较启用和禁用动态批处理的情况。

Unity 可以对阴影投射器使用动态批处理，即使它们的材质不同，只要 Unity 阴影通道所需的材质值相同。例如，多个箱子可以使用具有不同纹理的材质。虽然材质资源不同，但这种差异对于阴影投射器通道无关紧要，Unity 可以在阴影渲染步骤中批处理箱子 GameObject 的阴影。

**限制**

在以下情况下，Unity 要么根本无法使用动态批处理，要么只能有限地应用动态批处理：

* Unity 无法对包含超过 `900` 个顶点属性和 `225` 个顶点的网格应用动态批处理。这是因为网格的动态批处理每个顶点都有开销。例如，如果您的着色器使用顶点位置、顶点法线和单个 UV，那么 Unity 最多可以批处理 `225` 个顶点。但是，如果您的着色器使用顶点位置、顶点法线、UV0、UV1 和顶点切线，那么 Unity 只能批处理 `180` 个顶点。
* 如果 GameObject 使用不同的材质实例，Unity 无法将它们批处理在一起，即使它们本质上是相同的。唯一的例外是阴影投射器渲染。
* 具有光照贴图的 GameObject 具有额外的渲染器参数。这意味着，如果您想要批处理具有光照贴图的 GameObject，它们必须指向相同的光照贴图位置。
* Unity 无法完全对使用多通道着色器的 GameObject 应用动态批处理。
    * 几乎所有 Unity 着色器在正向渲染中都支持多个灯光。为了实现这一点，它们为每个灯光处理一个额外的渲染通道。Unity 仅批处理第一个渲染通道。它无法批处理每个像素灯光的额外绘制调用。
    * [Legacy Deferred rendering path] 不支持动态批处理，因为它以两个渲染通道绘制 GameObject。第一个通道是灯光预通道，第二个通道渲染 GameObject。

**动态生成的几何体的动态批处理**

以下渲染器动态生成几何体（例如粒子和线），您可以使用动态批处理进行优化：

* [Built-in Particle Systems]
* [Line Renderers] 
* [Trail Renderers]

动态批处理对于动态生成的几何体的工作方式与网格不同：

1. 对于每个渲染器，Unity 将所有可动态批处理的内容构建到一个大的顶点缓冲区中
2. 渲染器为批处理设置材质状态
3. 然后将顶点缓冲区绑定到 GPU
4. 对于批处理中的每个渲染器，Unity 更新顶点缓冲区中的偏移量并提交新的绘制调用

这种方法类似于 Unity 为 [静态批处理](#静态批处理) 提交绘制调用的方式。

## 手动合并网格

您可以手动将多个网格组合成单个网格来优化 DrawCall。Unity 在单个绘制调用中渲染组合的网格，而不是每个网格一个绘制调用。在网格彼此靠近且不相对移动的情况下，此技术可以是 [DrawCall 批处理](#drawcall-批处理draw-call-batching) 的良好替代方案。例如，对于带有许多抽屉的静态橱柜，将所有内容组合成一个网格是有意义的。

**警告**：Unity 无法单独剔除您组合的网格。这意味着如果组合网格的一部分在屏幕上，Unity 会绘制整个组合网格。如果网格是静态的并且您希望 Unity 单独剔除它们，请改用 [静态批处理](#静态批处理)。

有两种主要方法可以组合网格：

* 在创作网格时使用您的资产生成工具
* 在 Unity 中使用 [Mesh.CombineMeshes]

## SRP Batcher

可编程渲染管线 (SRP) 批处理是一种 DrawCall 优化，可显著提高使用 SRP 的应用程序的性能。SRP 批处理器减少了 Unity 准备和分派使用相同着色器变体的材质的绘制调用所需的 CPU 时间。
> 相同 Shader(或者变体) 但是材质不相同

可编程渲染管线 (SRP) 批处理器减少了 Unity 渲染使用相同着色器变体的许多材质的场景所需的 CPU 时间。

**渲染管线兼容性**

| **功能**        | **内置渲染管线** | **通用渲染管线 (URP)** | **高清渲染管线 (HDRP)** | **自定义可编程渲染管线(SRP)** |
| :-------------- | :--------------- | :--------------------- | :---------------------- | :---------------------------- |
| **SRP Batcher** | 否               | 是                     | 是                      | 是                            |

**GameObject 兼容性**

在任何给定场景中，一些 GameObject 与 SRP 批处理器兼容，而另一些则不兼容。兼容的 GameObject 使用 SRP 批处理器代码路径，不兼容的 GameObject 使用标准 SRP 代码路径。有关更多信息，请参阅 [SRP 批处理器的工作原理]。

GameObject 必须满足以下要求才能与 SRP 批处理器代码路径兼容：

* GameObject 必须包含网格或蒙皮网格。它不能是粒子。
* GameObject 不能使用 [MaterialPropertyBlocks]。
* GameObject 使用的着色器必须与 SRP 批处理器兼容。有关更多信息，请参阅 [着色器兼容性]。

**着色器兼容性**

高清渲染管线 (HDRP) 和通用渲染管线 (URP) 中的所有光照和无光照着色器都符合此要求（这些着色器的粒子版本除外）。

要使自定义着色器与 SRP 批处理器兼容，它必须满足以下要求：

* 着色器必须在名为 `UnityPerDraw` 的单个常量缓冲区中声明所有内置引擎属性。例如，`unity_ObjectToWorld` 或 `unity_SHAr`。
* 着色器必须在名为 `UnityPerMaterial` 的单个常量缓冲区中声明所有材质属性。

您可以在 Inspector 面板中检查着色器的兼容性状态。

![](https://docs.unity3d.com/cn/current/uploads/Main/SRP_batcher_shader_compatibility.png)
> 您可以在特定着色器的 Inspector 面板中检查着色器的兼容性。

**使用 SRP 批处理器**

本节包含有关如何在 Unity 的预构建可编程渲染管线中使用 SRP 批处理器的信息。

**在 URP 中使用 SRP 批处理器**

要在 URP 中激活 SRP 批处理器，请执行以下操作：

1. 在 Project 窗口中选择 [URP Asset]。
2. 在 URP 资源的 Inspector 中，启用 **SRP Batcher**。如果此选项不可见，请按照以下 [如何显示 URP 资源的其他属性] 的说明操作。

**如何显示 URP 资源的其他属性**

默认情况下，Unity 不会显示 URP 资源中的某些高级属性。要查看所有可用属性：

* 在 URP 资源中的任何部分，单击垂直省略号图标 (⋮) 并选择 **Show Additional Properties**

    ![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/show-additional-properties.png)
    > 显示其他属性

    Unity 在当前部分显示所有可用属性。

要显示所有部分中的所有其他属性：

1. 单击垂直省略号图标并选择 **Show All Additional Properties**。Unity 在 **Preferences** 窗口中打开 **Core Render Pipeline** 部分。
2. 在属性 **Additional Properties > Visibility** 中，选择 **All Visible**。

    ![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/show-all-additional-properties.png)
    > Additional Properties > Visibility > All Visible

**在 HDRP 中使用 SRP 批处理器**

当您使用 HDRP 时，Unity 默认启用 SRP 批处理器。不建议禁用 SRP 批处理器。但是，您可以暂时禁用它以进行调试。

要使用 Editor 在构建时启用和禁用 SRP 批处理器：

1. 在 Project 窗口中选择 [HDRP 资源]。
2. 在资源的 Inspector 中，进入 [Debug mode]。在 Debug 模式下，您可以看到 HDRP 资源的属性，包括 SRP Batcher 属性。
3. 选择 **Enable** **SRP Batcher** 以启用或禁用 SRP 批处理器。

要在运行时启用或禁用 SRP 批处理器，请在您的 C# 代码中切换以下全局变量：

```cs
GraphicsSettings.useScriptableRenderPipelineBatching = true;
```

**SRP 批处理器的工作原理**

传统的优化绘制调用的方法是减少它们的数量。相反，**SRP 批处理器减少了绘制调用之间的渲染状态更改**。为此，SRP 批处理器将一系列 `bind` 和 `draw` GPU 命令组合在一起。每个命令序列称为 SRP 批处理。

![](https://docs.unity3d.com/cn/current/uploads/Main/SROShaderPass.png)
> 绑定和绘制命令的批处理减少了绘制调用之间的 GPU 设置。

要为您的渲染实现最佳性能，每个 SRP 批处理应包含尽可能多的 `bind` 和 `draw` 命令。要实现这一点，请尽可能少地使用着色器变体。您仍然可以使用任意数量的具有相同着色器的不同材质。

当 Unity 在渲染循环期间检测到新材质时，CPU 会收集所有属性并将它们绑定到 GPU 的常量缓冲区中。GPU 缓冲区的数量取决于着色器如何声明其常量缓冲区。

SRP 批处理器是一种低级渲染循环，它使材质数据持久保存在 GPU 内存中。如果材质内容没有更改，SRP 批处理器不会进行任何渲染状态更改。相反，SRP 批处理器使用专用代码路径在大型 GPU 缓冲区中更新 Unity 引擎属性，如下所示：

![](https://docs.unity3d.com/cn/current/uploads/Main/SRP_Batcher_loop.png)
> SRP 批处理器渲染工作流程。SRP 批处理器使用专用代码路径在大型 GPU 缓冲区中更新 Unity 引擎属性。

在这里，CPU 仅处理标记为 **Per Object large buffer** 的 Unity 引擎属性。所有材质都有位于 GPU 内存中的持久常量缓冲区，随时可以使用。这加快了渲染速度，因为：

* 所有材质内容现在都持久保存在 GPU 内存中
* 专用代码管理一个大型的每对象 GPU 常量缓冲区，用于所有每对象属性

**移除 GameObject 的 SRP 批处理器兼容性**

在某些罕见情况下，您可能需要使特定 GameObject 与 SRP 批处理器不兼容。例如，如果您想使用 [GPU instancing](#gpu-instancing)，它与 SRP 批处理器不兼容。如果您想使用完全相同的材质渲染许多相同的网格，GPU 实例化可能比 SRP 批处理器更高效。要使用 GPU 实例化，您必须：

* 使用 [Graphics.DrawMeshInstanced]
* 手动移除 SRP 批处理器兼容性并为材质启用 GPU 实例化

有两种方法可以从 GameObject 移除与 SRP 批处理器的兼容性：

* 使着色器不兼容
* 使渲染器不兼容

**提示**：如果您使用 GPU 实例化而不是 SRP 批处理器，请使用 [Profiler] 确保 GPU 实例化对您的应用程序比 SRP 批处理器更高效。

**移除着色器兼容性**

您可以使手写和 Shader Graph 着色器与 SRP 批处理器不兼容。但是，对于 Shader Graph 着色器，如果您经常更改和重新编译 Shader Graph，使 [renderer incompatible] 更简单。

要使 Unity 着色器与 SRP 批处理器不兼容，您需要对着色器源文件进行更改：

1. 对于手写着色器，打开着色器源文件。对于 Shader Graph 着色器，将 Shader Graph 的编译着色器源代码复制到新的着色器源文件中。在您的应用程序中使用新的着色器源文件而不是 Shader Graph。
2. 在着色器的 `Properties` 块中添加一个新的 [material property] 声明。不要在 `UnityPerMaterial` 常量缓冲区中声明新的材质属性。

材质属性不需要做任何事情；只要有一个不在 `UnityPerMaterial` 常量缓冲区中的材质属性，就会使着色器与 SRP 批处理器不兼容。

**警告**：如果您使用 Shader Graph，请注意每次编辑和重新编译 Shader Graph 时，您都必须重复此过程。

**移除渲染器兼容性**

您可以使单个渲染器与 SRP 批处理器不兼容。为此，请向渲染器添加 `MaterialPropertyBlock`。

**在 Unity Frame Debugger 中分析 SRP 批处理器**

您可以在 [Frame Debugger] 窗口中检查 SRP 批处理的状态。每个 SRP 批处理显示 Unity 使用了多少绘制调用，Unity 附加到着色器的关键字，以及 Unity 没有将该绘制调用与前一个批处理在一起的原因。

要检查 SRP 批处理器批处理的状态，请执行以下操作：

1. 在 Editor 中，打开 Frame Debugger（菜单：**Window** > **Analysis** > **Frame Debugger**）。
2. 在 Frame Debugger 中，转到 **Render Camera** > **Render Opaques**。
3. 展开 **RenderLoopNewBatcher.Draw** 列表。
4. 选择要检查的 **SRP Batch**。

在下面的示例中，原因是：**Nodes have different shaders**。这意味着该 SRP 批处理的着色器与前一个 SRP 批处理的着色器不同。因为 SRP 批处理器使用了不同的着色器，所以它创建了一个新的批处理。如果多个 SRP 批处理的绘制调用数量较少，通常意味着项目使用了太多的着色器变体。

![](https://docs.unity3d.com/cn/current/uploads/Main/SRP_Batcher_batch_information.png)
> 在 Frame Debugger 窗口中，您可以找到有关单个 SRP 批处理的详细信息，包括为什么 SRP 批处理器创建新的 SRP 批处理而不是继续现有的批处理。

如果您编写自己的可编程渲染管线，而不是使用通用渲染管线或高清渲染管线，请尝试编写一个通用的多用途着色器，关键字数量最少。这是最优的，因为您可以使用任意数量的材质属性。

[Built-in Particle Systems]: https://docs.unity3d.com/cn/current/Manual/Built-inParticleSystem.html
[Debug mode]: https://docs.unity3d.com/cn/current/Manual/InspectorOptions.html
[Dynamic batching for dynamically generated geometries]: https://docs.unity3d.com/cn/current/Manual/dynamic-batching.html#dynamic-batching-dynamic-geometry
[Editor]: https://docs.unity3d.com/cn/current/Manual/static-batching.html#editor
[Frame Debugger]: https://docs.unity3d.com/cn/current/Manual/FrameDebugger.html
[Graphics.DrawMeshInstanced]: https://docs.unity3d.com/cn/current/ScriptReference/Graphics.DrawMeshInstanced.html
[HDRP 资源]: https://docs.unity3d.com/Packages/com.unity.render-pipelines.high-definition@17.2/manual/HDRP-Asset.html
[How the SRP Batcher works]: https://docs.unity3d.com/cn/current/Manual/SRPBatcher.html#how-the-srp-batcher-works
[How to show Additional Properties for the URP Asset]: https://docs.unity3d.com/cn/current/Manual/SRPBatcher.html#how-to-show-additional-properties-for-the-urp-asset
[Legacy Deferred rendering path]: https://docs.unity3d.com/cn/current/Manual/RenderingPaths.html
[Line Renderers]: https://docs.unity3d.com/cn/current/Manual/class-LineRenderer.html
[material property]: https://docs.unity3d.com/cn/current/Manual/SL-Properties.html
[MaterialPropertyBlock]: https://docs.unity3d.com/cn/current/ScriptReference/MaterialPropertyBlock.html
[Mesh Filter]: https://docs.unity3d.com/cn/current/Manual/class-MeshFilter.html
[Mesh Renderer]: https://docs.unity3d.com/cn/current/Manual/class-MeshRenderer.html
[Mesh.CombineMeshes]: https://docs.unity3d.com/cn/current/ScriptReference/Mesh.CombineMeshes.html
[Mesh]: https://docs.unity3d.com/cn/current/Manual/class-Mesh.html
[Particle Systems]: https://docs.unity3d.com/cn/current/Manual/class-ParticleSystem.html
[Performance implications]: https://docs.unity3d.com/cn/current/Manual/static-batching.html#performance-implications
[Profiler]: https://docs.unity3d.com/cn/current/Manual/Profiler.html
[renderer incompatible]: https://docs.unity3d.com/cn/current/Manual/SRPBatcher.html#removing-renderer-compatibility
[Renderer.material]: https://docs.unity3d.com/cn/current/ScriptReference/Renderer-material.html
[Renderer.sharedMaterial]: https://docs.unity3d.com/cn/current/ScriptReference/Renderer-sharedMaterial.html
[Runtime API]: https://docs.unity3d.com/cn/current/Manual/static-batching.html#runtime
[Shader compatibility]: https://docs.unity3d.com/cn/current/Manual/SRPBatcher.html#shader-compatibility
[Sprite Renderers]: https://docs.unity3d.com/cn/current/Manual/class-SpriteRenderer.html
[Static Editor Flags]: https://docs.unity3d.com/cn/current/Manual/StaticObjects.html
[static]: https://docs.unity3d.com/cn/current/Manual/StaticObjects.html
[StaticBatchingUtility.Combine]: https://docs.unity3d.com/cn/current/ScriptReference/StaticBatchingUtility.Combine.html
[StaticBatchingUtility]: https://docs.unity3d.com/cn/current/ScriptReference/StaticBatchingUtility.html
[Trail Renderers]: https://docs.unity3d.com/cn/current/Manual/class-TrailRenderer.html
[URP Asset]: https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@12.1/manual/universalrp-asset.html
[Wikipedia article]: http://en.wikipedia.org/wiki/Texture_atlas
