---
source: https://learn.unity.com/tutorial/optimizing-unity-ui
article: false
index: false
---

# 优化 Unity UI

[原文地址 - UnityLearn](https://learn.unity.com/tutorial/optimizing-unity-ui)

优化基于 Unity UI 的用户界面是一门艺术。本指南将讨论 Unity UI 的基本概念、底层算法和代码，以及常见问题和解决方案。

## Unity UI 优化指南

优化基于 Unity UI 的用户界面是一门艺术。硬性规则很少见；相反，必须根据系统行为仔细评估每种情况。优化任何 Unity UI 时的核心矛盾是在绘制调用和批处理成本之间取得平衡。虽然可以使用一些常识性技术来减少其中一项，但复杂的 UI 必须做出权衡。

然而，与其他领域的最佳实践一样，优化 Unity UI 的尝试应从性能分析开始。在尝试优化 Unity UI 系统之前，主要任务是找到观察到的性能问题的确切原因。Unity UI 用户通常会遇到四类问题：

* 过度的 GPU 片段着色器(fragment shader)利用率（即填充率(fill-rate)过度利用）
* CPU 花费过多时间重建 Canvas 批处理
* Canvas 批处理重建次数过多（过度脏标记(over-dirtying)）
* CPU 花费过多时间生成顶点（通常来自文本）

原则上可以创建一个性能受限于发送到 GPU 的绘制调用数量的 Unity UI。然而在实践中，任何因绘制调用而使 GPU 过载的项目更可能是受限于填充率过度使用。

本指南将讨论 Unity UI 的基本概念、底层算法和代码，以及常见问题和解决方案。它分为五个章节：

* [Unity UI 基础](#2-unity-ui-基础) 定义了 Unity UI 特有的术语，并讨论了许多用于渲染 UI 的基本过程的细节，包括批处理几何体的构建。强烈建议读者从本章开始。
* [Unity UI 性能分析工具](#3-unity-ui-性能分析工具) 讨论使用开发者可用的各种工具收集性能分析数据。
* [填充率、Canvas 和输入](#4-填充率-canvas-和输入) 讨论提高 Unity UI 的 Canvas 和输入组件性能的方法。
* [UI 控件](#5-优化-ui-控件) 讨论 UI 文本、滚动视图和其他特定组件的优化，以及一些不适合其他地方的技巧。
* [其他技术和技巧](#6-其他-ui-优化技术和技巧) 讨论一些不适合其他地方的问题，包括 UI 系统中一些基本技巧和"陷阱"的解决方法。

**UI 源代码**

请记住，Unity UI 的 Graphic 和 Layout 组件是完全开源的。它们的源代码可以在 [Unity-Technologies uGUI] 中找到。

## Unity UI 基础

理解组成 Unity UI 系统的不同部分很重要。有几个基本类和组件共同构成了这个系统。本章首先定义本系列文章中使用的许多术语，然后讨论 Unity UI 几个关键系统的底层行为。

### 术语

* `Canvas` 是 Unity 原生代码(native-code)组件，用于提供分层几何体，供 Unity 的渲染系统使用，这些几何体将被绘制在游戏的世界空间中或之上。

  `Canvas` 负责将其内的几何体组合成批处理，生成适当的渲染命令并将这些命令发送到 Unity 的图形系统。所有这些都是在原生 C++ 代码中完成的，称为重新批处理(Rebatch)或批处理构建(Batch Build)。当 Canvas 包含需要重新批处理的几何体时，该 Canvas 被认为是脏(Dirty)的。

  `Geometry(几何体)` 由 Canvas Renderer 组件提供给 Canvas。

* 子 Canvas(Sub-canvas) 只是嵌套在另一个 Canvas 组件中的 Canvas 组件。子 Canvas 将其子项与父项隔离；脏的子项不会强制父项重建其几何体，反之亦然。在某些边缘情况下这不成立，例如当父 Canvas 的变化导致子 Canvas 调整大小时。

* `Graphic` 是 Unity UI C# 库提供的一个基类。它是所有向 Canvas 系统提供可绘制几何体的 Unity UI C# 类的基类。大多数内置的 Unity UI Graphics 都是通过 MaskableGraphic 子类实现的，这允许它们通过 IMaskable 接口被遮罩。Drawable 的主要子类是 Image 和 Text，它们提供了同名的组件。

* `Layout` 组件控制 RectTransforms 的大小和位置，通常用于创建需要相对大小或内容相对定位的复杂布局。Layout 组件仅依赖于 RectTransforms，并且仅影响其关联的 RectTransforms 的属性。它们不依赖于 Graphic 类，可以独立于 Unity UI 的 Graphic 组件使用。

* `Graphic` 和 `Layout` 组件都依赖于 CanvasUpdateRegistry 类，该类在 Unity Editor 界面中不公开。这个类跟踪必须更新的 Layout 组件和 Graphic 组件的集合，并在它们关联的 Canvas 调用 willRenderCanvases 事件时根据需要触发更新。

* `Layout` 和 `Graphic` 组件的更新称为重建(Rebuild)。重建过程将在本文档后面详细讨论。

### 渲染细节

在 Unity UI 中组合用户界面时，请记住 Canvas 绘制的所有几何体都将在 **透明(Transparent)队列** 中绘制。也就是说，Unity UI 生成的几何体将始终以 alpha 混合从后向前绘制。从性能角度来看，需要记住的重要一点是，从多边形栅格化(Rasterized)的每个像素都将被采样，即使它完全被其他不透明多边形覆盖。在移动设备上，这种高水平的过度绘制(Overdraw)会迅速超出 GPU 的填充率容量。

### Canvases 批处理(Batch)构建

批处理构建过程是 Canvas 组合表示其 UI 元素的网格并生成适当的渲染命令发送到 Unity 图形管线的过程。此过程的结果会被缓存并重用，直到 Canvas 被标记为脏，这发生在对其组成网格之一进行更改时。

Canvas 使用的网格取自附加到 Canvas 但不包含在任何 Sub-canvas 中的 Canvas Renderer 组件集。

计算批处理需要按深度对网格进行排序，并检查它们是否存在重叠、共享材质等。此操作是多线程的，因此其性能在不同的 CPU 架构上通常会有很大差异，尤其是在移动 SoC（通常具有少量 CPU 内核）和现代桌面 CPU（通常具有 4 个或更多内核）之间。

### Graphics 重建(Rebuild)

重建过程是重新计算 Unity UI 的 C# Graphic 组件的布局和网格的地方。这是在 CanvasUpdateRegistry 类中执行的。请记住，这是一个 C# 类，其源代码可以在 [Unity-Technologies uGUI] 上找到。

在 CanvasUpdateRegistry 中，感兴趣的方法是 PerformUpdate。每当 Canvas 组件调用 [WillRenderCanvases] 事件时，就会调用此方法。此事件每帧调用一次。

`PerformUpdate` 运行过程分为三步：

* 通过 [ICanvasElement.Rebuild] 方法请求脏的 Layout 组件重建其布局。
* 请求任何注册的 Clipping 组件（例如 Masks）剔除任何被裁剪的组件。这是通过 `ClippingRegistry.Cull` 完成的。
* 请求脏的 Graphic 组件重建其图形元素。

```cs
// CanvasUpdateRegistry.cs
private void PerformUpdate()
{
    UISystemProfilerApi.BeginSample(UISystemProfilerApi.SampleType.Layout);
    CleanInvalidItems();

    m_PerformingLayoutUpdate = true;
    m_LayoutRebuildQueue.Sort(s_SortLayoutFunction);
    // 对需要 Rebuild 的 Layout 组件执行 Rebuild
    for (int i = 0; i <= (int)CanvasUpdate.PostLayout; i++)
    {
        UnityEngine.Profiling.Profiler.BeginSample(m_CanvasUpdateProfilerStrings[i]);
        for (int j = 0; j < m_LayoutRebuildQueue.Count; j++)
        {
            var rebuild = m_LayoutRebuildQueue[j];
            try
            {
                if (ObjectValidForUpdate(rebuild))
                    rebuild.Rebuild((CanvasUpdate)i);
            }
            catch (Exception e)
            {
                Debug.LogException(e, rebuild.transform);
            }
        }
        UnityEngine.Profiling.Profiler.EndSample();
    }

    for (int i = 0; i < m_LayoutRebuildQueue.Count; ++i)
        m_LayoutRebuildQueue[i].LayoutComplete();

    m_LayoutRebuildQueue.Clear();
    m_PerformingLayoutUpdate = false;
    UISystemProfilerApi.EndSample(UISystemProfilerApi.SampleType.Layout);
    UISystemProfilerApi.BeginSample(UISystemProfilerApi.SampleType.Render);

    // 对 Clipping 组件执行 Cull
    UnityEngine.Profiling.Profiler.BeginSample(m_CullingUpdateProfilerString);
    ClipperRegistry.instance.Cull();
    UnityEngine.Profiling.Profiler.EndSample();

    m_PerformingGraphicUpdate = true;

    // 对 Dirty 的 Graphic 执行 Rebuild
    for (var i = (int)CanvasUpdate.PreRender; i < (int)CanvasUpdate.MaxUpdateValue; i++)
    {
        UnityEngine.Profiling.Profiler.BeginSample(m_CanvasUpdateProfilerStrings[i]);
        for (var k = 0; k < m_GraphicRebuildQueue.Count; k++)
        {
            try
            {
                var element = m_GraphicRebuildQueue[k];
                if (ObjectValidForUpdate(element))
                    element.Rebuild((CanvasUpdate)i);
            }
            catch (Exception e)
            {
                Debug.LogException(e, m_GraphicRebuildQueue[k].transform);
            }
        }
        UnityEngine.Profiling.Profiler.EndSample();
    }

    for (int i = 0; i < m_GraphicRebuildQueue.Count; ++i)
        m_GraphicRebuildQueue[i].GraphicUpdateComplete();

    m_GraphicRebuildQueue.Clear();
    m_PerformingGraphicUpdate = false;
    UISystemProfilerApi.EndSample(UISystemProfilerApi.SampleType.Render);
}
```

对于 `Layout` 和 `Graphic` 重建，该过程分为多个部分。Layout 重建分为三步：`PreLayout`、`Layout` 和 `PostLayout`，而 Graphic 重建分为两步：`PreRender` 和 `LatePreRender`。

```cs
public enum CanvasUpdate
{
    Prelayout = 0,
    Layout = 1,
    PostLayout = 2,
    PreRender = 3,
    LatePreRender = 4,
    MaxUpdateValue = 5
}
```

#### Layout 重建

要重新计算包含在一个或多个 Layout 组件中的组件的适当位置（以及可能的大小），需要按照其适当的层次结构顺序应用 Layouts。GameObject 层次结构中更靠近根的 Layouts 可能会改变嵌套在其内部的任何 Layouts 的位置和大小，因此必须首先计算它们。

为此，Unity UI 按其在层次结构中的深度对脏的 Layout 组件列表进行排序。层次结构中较高的项目（即具有较少父 Transforms 的项目）被移到列表的前面。

> Layout 组件可能会改变其子对象的位置和大小，因此越靠近顶层的越应该首先计算。这里按照父节点数量进行的排序。

```cs
private static int SortLayoutList(ICanvasElement x, ICanvasElement y)
{
    Transform t1 = x.transform;
    Transform t2 = y.transform;

    return ParentCount(t1) - ParentCount(t2);
}
```

然后对排序后的 Layout 组件列表执行 Rebuild，重建布局；Rebuild 才是实际更改由 Layout 组件控制的 UI 元素的位置和大小的地方。 有关单个元素的位置如何受 Layouts 影响的更多详细信息，请参阅 Unity 手册的 [UI Auto Layout] 部分。

```cs
// LayoutRebuilder.cs
public void Rebuild(CanvasUpdate executing)
{
    switch (executing)
    {
        case CanvasUpdate.Layout:
            // It's unfortunate that we'll perform the same GetComponents querys for the tree 2 times,
            // but each tree have to be fully iterated before going to the next action,
            // so reusing the results would entail storing results in a Dictionary or similar,
            // which is probably a bigger overhead than performing GetComponents multiple times.
            PerformLayoutCalculation(m_ToRebuild, e => (e as ILayoutElement).CalculateLayoutInputHorizontal());
            PerformLayoutControl(m_ToRebuild, e => (e as ILayoutController).SetLayoutHorizontal());
            PerformLayoutCalculation(m_ToRebuild, e => (e as ILayoutElement).CalculateLayoutInputVertical());
            PerformLayoutControl(m_ToRebuild, e => (e as ILayoutController).SetLayoutVertical());
            break;
    }
}
```

#### Graphic 重建

当 Graphic 组件被重建时，Unity UI 将控制权传递给 [ICanvasElement] 接口的 [Rebuild] 方法。Graphic 实现这一点，并在重建过程的 `PreRender` 阶段运行两个不同的重建步骤。

* 如果顶点数据被标记为脏（例如当组件的 RectTransform 改变大小时），则重建网格。
* 如果材质数据被标记为脏（例如当组件的材质或纹理改变时），则更新附加的 Canvas Renderer 的材质。

```cs
public virtual void Rebuild(CanvasUpdate update)
{
    if (canvasRenderer == null || canvasRenderer.cull)
        return;

    switch (update)
    {
        case CanvasUpdate.PreRender:
            if (m_VertsDirty)
            {
                UpdateGeometry();
                m_VertsDirty = false;
            }
            if (m_MaterialDirty)
            {
                UpdateMaterial();
                m_MaterialDirty = false;
            }
            break;
    }
}
```

Graphic 重建不会以任何特定顺序遍历 Graphic 组件列表，也不需要任何排序操作。

## Unity UI 性能分析工具

有几个性能分析工具可用于分析 Unity UI 的性能。关键工具是：

* Unity Profiler
* Unity Frame Debugger
* Xcode 的 Instruments 或 Intel VTune
* Xcode 的 Frame Debugger 或 Intel GPA

外部工具提供方法级 CPU 分析，具有毫秒（或更好）分辨率，以及详细的绘制调用和着色器分析。设置和使用上述工具的说明超出了本指南的范围。请注意，XCode Frame Debugger 和 Instruments 仅适用于 Apple 平台的 IL2CPP 构建，因此目前只能用于分析 IOS 构建。

### Unity Profiler

Unity Profiler 的主要用途是执行比较分析：在 Unity Profiler 运行时启用和禁用 UI 元素可以快速缩小对性能问题负主要责任的 UI 层次结构部分。

要分析这一点，请观察分析器输出中的 `Canvas.BuildBatch` 和 `Canvas.SendWillRenderCanvases` 行。

![](./Assets/sendwillrendercanvases.png)

`Canvas.BuildBatch` 是执行 Canvas 批处理构建过程的本机代码计算，如前所述。

`Canvas.SendWillRenderCanvases` 包含对订阅 Canvas 组件的 `willRenderCanvases` 事件的 C# 脚本的调用。Unity UI 的 `CanvasUpdateRegistry` 类接收此事件并使用它来运行前面描述的重建过程。预计任何脏的 UI 组件都会在此时更新它们的 Canvas Renderers。

注意：为了更容易看到 UI 性能的差异，通常建议禁用除 `Rendering`、`Scripts` 和 `UI` 之外的所有跟踪类别。这可以通过单击 CPU 使用率分析器左侧跟踪类别名称旁边的彩色框来完成。还可以通过单击并向上或向下拖动类别名称来重新排序 CPU 分析器中的类别。

![](./Assets/cpu_profiler.png)

UI 类别是 Unity 2017.1 及更高版本中的新功能。不幸的是，UI 更新过程的部分内容没有正确分类，因此在查看 UI 曲线时要小心，因为它可能不包含所有 UI 相关调用。例如，`Canvas.SendWillRenderCanvases` 被归类为 `UI`，但 `Canvas.BuildBatch` 被归类为 `Others` 和 `Rendering`。

在 2017.1 及更高版本中，还有一个新的 [UI Profiler]。默认情况下，此分析器是 Profiler 窗口中的最后一个。它由两个时间线和一个批处理查看器组成：

![](./Assets/ui_profiler.png)

第一个时间线显示在两个类别中花费的 CPU 时间，分别是计算布局和渲染。请注意，它存在与前面描述的相同的问题，一些 UI 功能可能未被计入。

第二个时间线显示批处理、顶点的总数，并显示事件标记。在前面的屏幕截图中，您可以看到几个按钮点击事件。这些标记可以帮助您确定导致 CPU 峰值的原因。

最后，UI Profiler 最有用的功能是底部的批处理查看器。左侧是所有 Canvas 的树视图，每个 Canvas 下面是由它们生成的批处理列表。列提供了有关每个 Canvas 或批处理的有趣细节，但有一个特别关键，可以更好地理解如何优化 UI，那就是 `Batch Breaking Reason`。

此列将显示为什么所选批处理无法与前一个批处理合并。减少批处理数量是提高 UI 性能的最有效方法之一，因此了解什么会破坏批处理非常重要。

如屏幕截图所示，最常见的原因之一是 UI 元素使用不同的纹理或材质。在许多情况下，这可以通过使用 [sprite atlases] 轻松修复。最后一列显示与批处理关联的游戏对象名称。您可以双击名称以在编辑器中选择游戏对象（当您有几个同名对象时，这特别有用）。

截至 Unity 2017.3，批处理查看器仅在编辑器中工作。批处理在设备上通常应该相同，因此这仍然非常有用。如果您怀疑设备上的批处理可能不同，则可以使用接下来描述的 Frame Debugger。

### Unity Frame Debugger

`Unity Frame Debugger` 是减少 Unity UI 生成的绘制调用数量的有用工具。这个内置工具可以通过 Unity Editor 中的 Window 菜单访问。启用后，它将显示 Unity 生成的所有绘制调用，包括 Unity UI 生成的绘制调用。

值得注意的是，帧调试器将使用为 Unity Editor 中的 Game View 生成的绘制调用更新自身，因此可以用于尝试不同的 UI 配置，甚至无需进入 Play 模式。

Unity UI 绘制调用的位置取决于正在绘制的 Canvas 组件上选择的 `Render Mode`：

* `Screen Space - Overlay` 将出现在 `Canvas.RenderOverlays` 组中
* `Screen Space - Camera` 将出现在所选 `Render Camera` 的 `Camera.Render` 组中，作为 `Render.TransparentGeometry` 的子组
* `World Space` 将作为 `Render.TransparentGeometry` 的子组出现在 `Canvas` 可见的每个 `World Space` 相机中

所有 UI 都可以通过 `Shader: UI/Default` 行识别（假设 UI 着色器尚未被自定义着色器替换）。在组或绘制调用的详细信息中。请参阅下面屏幕截图中的红色高亮框。

![](./Assets/framedebugger.png)

在调整 UI 时观察这组行，可以相对简单地最大化 Canvas 将 UI 元素组合成批处理的能力。破坏批处理的最常见设计相关原因是意外重叠。

所有 Unity UI 组件将其几何体生成为一系列四边形。然而，许多 UI 精灵或 UI 文本字形仅占用用于表示它们的四边形的一小部分，其余部分为空。因此，很常见的是发现 UI 的设计者无意中重叠了多个不同的四边形，这些四边形的纹理来自不同的材质，因此无法批处理。

由于 Unity UI 完全在透明队列中操作，任何覆盖在不可批处理的四边形上的四边形必须在不可批处理的四边形之前绘制，因此不能与放置在不可批处理的四边形之上的其他四边形批处理。

考虑三个四边形 A、B 和 C 的情况。假设所有三个四边形相互重叠，并且还假设四边形 A 和 C 使用相同的材质，而四边形 B 使用单独的材质。因此，四边形 B 不能与 A 或 C 批处理。

如果层次结构中的顺序（从上到下）是 A、B、C，则 A 和 C 不能批处理，因为 B 必须绘制在 A 之上和 C 之下。但是，如果 B 放置在可批处理的四边形之前或之后，则可批处理的四边形实际上可以批处理 - B 只需要在批处理的四边形之前或之后绘制，而不是插入它们之间。

有关此问题的进一步讨论，请参阅 [Canvas 步骤中的 Child 顺序](#child-顺序) 部分。

### Instruments & VTune

Xcode 的 Instruments 和 Intel 的 VTune 允许在 Apple 或 Intel CPU 上对 Unity UI 重建和 Canvas 批处理计算进行极深入的分析。方法名称与上面 Unity Profiler 部分讨论的分析器标签几乎相同：

* `Canvas::SendWillRenderCanvases` 是调用 `Canvas.SendWillRenderCanvases` C# 方法的 C++ 父级，并控制 Unity Profiler 中的该行。它将包含用于运行重建过程的代码，如前面的步骤所述。
* `Canvas::UpdateBatches` 与 `Canvas.BuildBatch` 相同，但包括 Unity Profiler 标签未涵盖的额外样板代码。它运行实际的 Canvas 批处理构建过程，如上所述。

当与通过 IL2CPP 构建的 Unity 应用程序一起使用时，这些工具可用于更深入地研究 `Canvas::SendWillRenderCanvases` 的转译 C# 代码。主要关注以下方法的成本。（注意：转译的方法名称是近似的。）

* `IndexedSet_Sort` 和 `CanvasUpdateRegistry_SortLayoutList` 用于在重新计算布局之前对脏的 Layout 组件列表进行排序。如上所述，这涉及计算每个 Layout 组件上方的父 Transform 数量。
* `ClipperRegistry_Cull` 调用 `IClipRegion` 接口的所有已注册实现者。内置实现者包括 [RectMask2D]，它使用 `IClippable` 接口。在 `ClipperRegistry.Cull` 调用期间，RectMask2D 组件循环遍历其层次结构中包含的所有可剪裁元素，并要求它们更新其剪裁信息。
* `Graphic_Rebuild` 将包含实际计算表示 Image、Text 或其他 Graphic 派生组件所需的网格的成本。在此之下还有其他几个方法，如 `Graphic_UpdateGeometry`，最值得注意的是 `Text_OnPopulateMesh`。
* 当启用 Best Fit 时，`Text_OnPopulateMesh` 通常是一个热点。本指南后面将更详细地讨论这一点。
* 网格修改器，如 `Shadow_ModifyMesh` 和 `Outline_ModifyMesh`，也将在此运行。计算组件投影、轮廓和其他特殊效果的成本可以通过这些方法看到。

### Xcode Frame Debugger & Intel GPA

低级帧调试工具对于分析批处理 UI 的各个部分的成本以及监视 UI 过度绘制的成本至关重要。UI 过度绘制将在本指南后面更详细地讨论。

**使用 Xcode Frame Debugger**

要测试给定 UI 是否过度压力 GPU，可以使用 Xcode 的内置 GPU 诊断工具。首先，将相关项目配置为使用 Metal 或 OpenGLES3，然后进行构建并打开生成的 Xcode 项目。某些 Xcode 版本和设备组合可能支持 OpenGLES 2 帧捕获，但不能保证它会工作。

注意：在某些版本的 Xcode 上，为了使图形分析器工作，必须在 Build Scheme 中选择适当的图形 API。为此，请转到 Xcode 中的 Product 菜单，展开 Scheme 菜单项，然后选择 `Edit Scheme...`。选择 Run 目标并转到 Options 选项卡。将 GPU Frame Capture 选项更改为与项目使用的 API 匹配。假设 Unity 项目设置为自动选择图形 API，那么大多数现代 iPad 将默认使用 Metal。如果有疑问，请启动项目并查看 Xcode 中的调试日志。早期的一行应指示正在初始化哪个渲染路径（Metal、GLES3 或 GLES2）。

在 iOS 设备上构建并运行项目。可以通过在 Xcode 的 Navigator 侧边栏中显示 Debug 窗格并单击 FPS 条目来找到 GPU 分析器。

![](./Assets/xcode_gpu.png)

GPU 分析器中第一个感兴趣的点是屏幕中心的三个条形图，标记为 `Tiler`、`Renderer` 和 `Device`。其中两个：

* `Tiler` 通常是 GPU 处理几何体的压力度量，包括在顶点着色器中花费的时间。通常，高 `Tiler` 使用率表示顶点着色器过慢或绘制的顶点数量过多。
* `Renderer` 通常是 GPU 像素管道的压力度量。通常，高 `Renderer` 使用率表示应用程序超过了 GPU 的最大填充率，或者具有低效的片段着色器。
* `Device` 是整体 GPU 使用率的综合度量，包括 `Tiler` 和 `Renderer` 性能。通常可以忽略它，因为它大致跟踪 `Tiler` 或 `Renderer` 测量值中的较高者。

Xcode 的 Frame Debugger 可以通过单击 GPU 分析器底部隐藏的小 `Camera` 图标触发。在以下屏幕截图中，它被箭头和红色框突出显示。

![](./Assets/gpucapture.png)

短暂暂停后，Frame Debugger 的摘要视图应如下所示：

![](./Assets/gpusummary.png)

当使用默认 UI 着色器时，由 Unity UI 系统生成的几何体的渲染成本将显示在 `UI/Default` 着色器通道下，假设默认 UI 着色器尚未被自定义着色器替换。在上面的屏幕截图中，可以看到此默认 UI 着色器作为 Render Pipeline `UI/Default`。

Unity UI 仅生成四边形，因此顶点着色器不太可能给 GPU 的 tiler 管道带来压力。出现在此着色器通道中的任何问题可能是由于填充率问题。

### 分析分析器(Profiler)结果

收集分析数据后，可能会得出几个结论。如果 `Canvas.BuildBatch` 或 `Canvas::UpdateBatches` 似乎使用了过多的 CPU 时间，那么可能的问题是在单个 Canvas 上有过多的 Canvas Renderer 组件。请参阅 [Canvas 步骤中的拆分 Canvas](#拆分-canvas) 部分。

如果 GPU 上绘制 UI 花费了过多时间，并且帧调试器显示片段着色器管道是瓶颈，那么 UI 可能超过了 GPU 的像素填充率。最可能的原因是 UI 过度绘制。请参阅 [填充率、Canvas 和输入步骤中的修复填充率问题](#修复填充率问题) 部分。

如果 Graphic 重建使用了过多的 CPU，如 `Canvas.SendWillRenderCanvases` 或 `Canvas::SendWillRenderCanvases` 占用了大量 CPU 时间，则需要更深入的分析。Graphic 重建过程的某些部分可能是原因。

如果在 `WillRenderCanvas` 中大部分时间花费在 `IndexedSet_Sort` 或 `CanvasUpdateRegistry_SortLayoutList` 中，则时间用于对脏的 Layout 组件列表进行排序。考虑减少 Canvas 上的 Layout 组件数量。请参阅 [用 RectTransforms 替换 Layout](#基于-recttransform-的布局) 和 [拆分 Canvas](#拆分-canvas) 部分以获取可能的修复方法。

如果 `Text_OnPopulateMesh` 似乎占用了过多时间，则问题只是文本网格的生成。请参阅 `Best Fit` 和 [禁用 Canvas](#禁用-canvas) 部分以获取可能的修复方法，如果大部分被重建的文本实际上没有更改其底层字符串数据，请考虑拆分 Canvas 中的建议。

如果时间花费在 `Shadow_ModifyMesh` 或 `Outline_ModifyMesh`（或任何其他 `ModifyMesh` 的实现）中，则问题是计算网格修改器花费了过多时间。考虑移除这些组件并通过静态图像实现其视觉效果。

如果在 `Canvas.SendWillRenderCanvases` 中没有特定的热点，或者它似乎每帧都在运行，则问题可能是动态元素与静态元素分组在一起，并强制整个 Canvas 过于频繁地重建。请参阅[拆分 Canvas](#拆分-canvas) 步骤。

## 填充率、Canvas 和输入

### 修复填充率问题

可以采取两种措施来减少 GPU 片段管道的压力：

* 降低片段着色器的复杂性。有关更多详细信息，请参阅 [UI 着色器和低规格设备](#ui-着色器和低规格设备) 部分。
* 减少必须采样的像素数量。

由于 UI 着色器通常是标准化的，最常见的问题只是填充率使用过度。这通常是由于大量重叠的 UI 元素和/或有多个占据屏幕重要部分的 UI 元素。这两个问题都可能导致极高的过度绘制水平。

为了缓解填充率过度使用并减少过度绘制，请考虑以下可能的修复方法。

* [消除不可见 UI](#消除不可见-ui)
* [简化 UI 结构](#简化-ui-结构)
* [禁用不可见的相机输出](#禁用不可见的相机输出)
* [大部分被遮挡的相机](#大部分被遮挡的相机)
* [基于组合的 UI](#基于组合的-ui)
* [UI 着色器和低规格设备](#ui-着色器和低规格设备)

#### 消除不可见 UI

禁用对玩家不可见的元素。最常见的适用情况是打开具有不透明背景的全屏 UI。在这种情况下，可以禁用放置在全屏 UI 下方的所有 UI 元素。

最简单的方法是禁用包含不可见 UI 元素的根 GameObject 或 GameObjects。有关替代解决方案，请参阅 [禁用 Canvas](#禁用-canvas) 部分。

最后，确保没有通过将其 Alpha 设置为 0 来隐藏 UI 元素，因为该元素仍将被发送到 GPU 并可能占用宝贵的渲染时间。如果 UI 元素不需要 Graphic 组件，可以简单地移除它，射线检测仍将工作。

#### 简化 UI 结构

为了减少重建和渲染 UI 所需的时间，应该将 UI 对象的数量保持在尽可能低的水平。尽量多地烘焙(bake)东西。例如，不要仅仅为了改变元素的色调而使用混合的 GameObject，而是通过材质属性来完成。此外，不要创建像文件夹一样且除了组织场景之外没有其他用途的游戏对象。

#### 禁用不可见的相机输出

如果打开具有不透明背景的全屏 UI，世界空间相机仍将渲染 UI 后面的标准 3D 场景。渲染器不知道全屏 Unity UI 将遮挡整个 3D 场景。

因此，如果打开完全全屏的 UI，禁用任何和所有被遮挡的世界空间相机将通过简单地消除渲染无用 3D 世界的工作来帮助减少 GPU 压力。

如果 UI 没有覆盖整个 3D 场景，您可能希望将场景渲染到纹理一次并使用它，而不是持续渲染它。您将失去在 3D 场景中查看动画内容的可能性，但这在大多数情况下应该是可以接受的。

注意：如果将 Canvas 设置为 `Screen Space - Overlay`，则无论场景中有多少活动相机，它都将被绘制。

#### 大部分被遮挡的相机

许多 "全屏" UI 实际上并没有遮挡整个 3D 世界，而是留下了一小部分世界可见。在这些情况下，将世界的可见部分捕获到渲染纹理中可能更优化。如果世界的可见部分被 "缓存" 在渲染纹理中，则可以禁用实际的世界空间相机，并且可以在 UI 屏幕后面绘制缓存的渲染纹理以提供 3D 世界的替身版本。

#### 基于组合的 UI

设计师通常通过组合来创建 UI - 组合和分层标准背景和元素以创建最终 UI。虽然这样做相对简单，并且对迭代非常友好，但由于 Unity UI 使用透明渲染队列，它的性能不高。

考虑一个具有背景、按钮和按钮上一些文本的简单 UI。由于透明队列中的对象是从后到前排序的，在像素落在文本字形内的情况下，GPU 必须采样背景的纹理，然后是按钮的纹理，最后是文本图集的纹理，总共三个采样。随着 UI 复杂性的增加，以及更多装饰元素分层到背景上，采样次数可以迅速增加。

如果发现大型 UI 受限于填充率，最好的补救措施是创建专门的 UI 精灵，将 UI 的装饰/不变元素的尽可能多合并到其背景纹理中。这减少了必须分层在一起以实现所需设计的元素数量，但这是劳动密集型的，并增加了项目纹理图集的大小。

这种将创建给定 UI 所需的层叠元素数量压缩到专门的 UI 精灵上的原则也可以用于子元素。考虑一个带有滚动产品窗格的商店 UI。每个产品 UI 元素都有一个边框、背景和一些图标来表示价格、名称和其他信息。

商店 UI 需要一个背景，但由于其产品在背景上滚动，产品元素不能合并到商店 UI 的背景纹理上。但是，产品 UI 元素的边框、价格、名称和其他元素可以合并到产品的背景上。根据图标的大小和数量，填充率的节省可能是相当大的。

组合层叠元素有几个缺点。专用元素不能再重复使用，并且需要额外的艺术家资源来创建。添加大型新纹理可能会显著增加保存 UI 纹理所需的内存量，特别是如果 UI 纹理不是按需加载和卸载的。

#### UI 着色器和低规格设备

Unity UI 使用的内置着色器包含对遮罩、裁剪和许多其他复杂操作的支持。由于这种增加的复杂性，与更简单的 Unity 2D 着色器相比，UI 着色器在 iPhone 4 等低端设备上表现不佳。

如果针对低端设备的应用程序不需要遮罩、裁剪和其他 "花哨" 功能，可以创建一个省略未使用操作的自定义着色器，例如这个最小的 UI 着色器：

```
Shader "UI/Fast-Default" 
{ 
    Properties { 
        [PerRendererData] _MainTex ("Sprite Texture", 2D) = "white" {} 
        _Color ("Tint", Color) = (1,1,1,1)
    }
    SubShader
    {
        Tags
        { 
            "Queue"="Transparent" 
            "IgnoreProjector"="True" 
            "RenderType"="Transparent" 
            "PreviewType"="Plane"
            "CanUseSpriteAtlas"="True"
        }
    
        Cull Off
        Lighting Off
        ZWrite Off
        ZTest [unity_GUIZTestMode]
        Blend SrcAlpha OneMinusSrcAlpha
    
        Pass
        {
        CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
    
            #include "UnityCG.cginc"
            #include "UnityUI.cginc"
    
            struct appdata_t
            {
                float4 vertex   : POSITION;
                float4 color    : COLOR;
                float2 texcoord : TEXCOORD0;
            };
    
            struct v2f
            {
                float4 vertex   : SV_POSITION;
                fixed4 color    : COLOR;
                half2 texcoord  : TEXCOORD0;
                float4 worldPosition : TEXCOORD1;
            };
    
            fixed4 _Color;
            fixed4 _TextureSampleAdd;
            v2f vert(appdata_t IN)
            {
                v2f OUT;
                OUT.worldPosition = IN.vertex;
                OUT.vertex = mul(UNITY_MATRIX_MVP, OUT.worldPosition);
    
                OUT.texcoord = IN.texcoord;
    
                #ifdef UNITY_HALF_TEXEL_OFFSET
                OUT.vertex.xy += (_ScreenParams.zw-1.0)*float2(-1,1);
                #endif
    
                OUT.color = IN.color * _Color;
                return OUT;
            }
    
            sampler2D _MainTex;
            fixed4 frag(v2f IN) : SV_Target
            {
                return (tex2D(_MainTex, IN.texcoord) + _TextureSampleAdd) * IN.color;
            }
        ENDCG
        }
    }
}
```

可以从 [Unity2022.3.6 - Shaders(Other installs)](https://unity.com/releases/editor/whats-new/2022.3.61#installs) 下载 `UI-Default.shader` 文件，然后对比。

### UI Canvas 重建

要显示任何 UI，UI 系统必须为屏幕上表示的每个 UI 组件构建几何体。这包括运行动态布局代码，生成表示 UI 文本字符串中字符的多边形，并将尽可能多的几何体合并到单个网格中以最小化绘制调用。这是一个多步骤的过程，在本指南开头的 [基础](#2-unity-ui-基础) 部分中有详细描述。

Canvas 重建可能成为性能问题，主要有两个原因：

* 如果 Canvas 上可绘制的 UI 元素数量很大，则计算批处理本身变得非常昂贵。这是因为对元素进行排序和分析的成本与 Canvas 上可绘制 UI 元素的数量呈非线性增长。
* 如果 Canvas 频繁变脏，则可能会花费过多的时间刷新更改相对较少的 Canvas。

随着 Canvas 上元素数量的增加，这两个问题都趋于变得严重。

:::important
每当给定 Canvas 上的任何可绘制 UI 元素发生变化时，Canvas 都必须重新运行批处理构建过程。此过程会重新分析 Canvas 上的每个可绘制 UI 元素，无论它是否已更改。请注意，"更改" 是指影响 UI 对象外观的任何更改，包括分配给精灵渲染器的精灵、变换位置和缩放、文本网格中包含的文本等。
:::

#### Child 顺序

Unity UI 从后向前构建，对象的层次结构顺序决定了它们的排序顺序。层次结构中较早的对象被认为在层次结构中较晚的对象后面。批处理通过自上而下遍历层次结构并收集所有使用相同材质、相同纹理且没有中间层的对象来构建。"中间层" 是指具有不同材质的图形对象，其边界框与两个原本可批处理的对象重叠，并且放置在层次结构中两个可批处理对象之间。中间层强制批处理中断。

如 Unity UI 分析工具步骤中所述，UI Profiler 和 Frame Debugger 可用于检查 UI 中的中间层。这是指一个可绘制对象插入到两个其他原本可批处理的可绘制对象之间的情况。

这个问题最常发生在文本和精灵彼此靠近时：文本的边界框可以无形地与附近的精灵重叠，因为文本字形的大部分多边形是透明的。这可以通过两种方式解决：

* 重新排序可绘制对象，使可批处理对象不被不可批处理对象插入；也就是说，将不可批处理对象移动到可批处理对象之上或之下。
* 调整对象的位置以消除不可见的重叠空间。

这两种操作都可以在 Unity Editor 中完成，同时打开并启用 Unity Frame Debugger。通过简单地观察 Unity Frame Debugger 中可见的绘制调用数量，可以找到最小化由于重叠 UI 元素而浪费的绘制调用数量的顺序和位置。

#### 拆分 Canvas

在除最微不足道的情况外，通常最好拆分 Canvas，可以通过将元素移动到子 Canvas 或同级 Canvas 来实现。

同级 Canvas 最适合用于 UI 的某些部分必须与其他层的绘制深度分开控制的情况，例如始终在其他层之上或之下（例如教程箭头）。

在大多数其他情况下，子 Canvas 更方便，因为它们从其父 Canvas 继承显示设置。

虽然乍一看将 UI 细分为许多子 Canvas 似乎是最佳实践，但请记住 Canvas 系统也不会跨单独的 Canvas 组合批处理。性能良好的 UI 设计需要在最小化重建成本和最小化浪费的绘制调用之间取得平衡。

**一般准则**

由于 Canvas 在其任何组成可绘制组件发生变化时都会重新批处理，因此通常最好将任何非平凡的 Canvas 拆分为至少两个部分。此外，如果元素预计会同时更改，最好尝试将元素放在同一个 Canvas 上。一个例子可能是进度条和倒计时计时器。它们都依赖于相同的底层数据，因此需要同时更新，因此应将它们放在同一个 Canvas 上。

在一个 Canvas 上，放置所有静态且不变的元素，例如背景和标签。这些元素将在 Canvas 首次显示时批处理一次，之后将不再需要重新批处理。

在第二个 Canvas 上，放置所有 "动态" 元素——那些频繁更改的元素。这将确保此 Canvas 主要重新批处理脏元素。如果动态元素数量变得非常大，可能需要进一步将动态元素细分为一组不断变化的元素（例如，进度条、计时器读数、任何动画）和一组仅偶尔更改的元素。

这在实践中实际上相当困难，尤其是在将 UI 控件封装到预制件(Prefabs)中时。许多 UI 转而选择通过将成本较高的控件拆分到 Sub-canvas 上来细分 Canvas。

**Unity 5.2 和优化批处理**

在 Unity 5.2 中，批处理代码进行了实质性重写，与 Unity 4.6、5.0 和 5.1 相比，性能显著提高。此外，在具有多个核心的设备上，Unity UI 系统将把大部分处理转移到工作线程。总的来说，Unity 5.2 减少了将 UI 积极拆分为数十个 Sub-canvases 的需求。现在，许多移动设备上的 UI 可以通过少至两三个 Canvases 来实现高性能。

### Unity UI 中的输入和射线检测

默认情况下，Unity UI 使用 [Graphic Raycaster] 组件处理输入事件，例如触摸事件和指针悬停事件。这通常由 `Standalone Input Manager` 组件处理。尽管名称如此，`Standalone Input Manager` 旨在成为一个 "通用" 输入管理系统，并将处理指针和触摸。

#### 移动设备上错误的鼠标输入检测(5.3)

在 Unity 5.4 之前，每个附加了 `Graphic Raycaster` 的活动 Canvas 将每帧运行一次射线检测以检查指针的位置，只要当前没有可用的触摸输入。这将发生在所有平台上；没有鼠标的 iOS 和 Android 设备仍将查询鼠标的位置，并尝试发现哪些 UI 元素位于该位置下方，以确定是否需要发送任何悬停事件。

这是 CPU 时间的浪费，并且已经观察到消耗 Unity 应用程序 CPU 帧时间的 5% 或更多。

此问题已在 Unity 5.4 中解决。从 5.4 开始，没有鼠标的设备将不会查询鼠标位置，也不会执行不必要的射线检测。

如果使用早于 5.4 的 Unity 版本，强烈建议移动开发者创建自己的 Input Manager 类。这可以像复制 Unity 的 `Standard Input Manager` 从 Unity UI 源代码并注释掉 `ProcessMouseEvent` 方法以及对该方法的所有调用一样简单。

#### 射线检测优化

Graphic Raycaster 是一个相对简单的实现，它遍历所有将 `Raycast Target` 设置设置为 true 的 Graphic 组件。对于每个 Raycast Target，Raycaster 执行一组测试。如果 Raycast Target 通过了所有测试，则将其添加到命中列表中。

**射线检测实现细节**

* 如果 Raycast Target 处于活动状态、已启用并且被绘制（即有几何体）
* 如果输入点位于 Raycast Target 附加到的 RectTransform 内
* 如果 Raycast Target 具有或是一个 [ICanvasRaycastFilter] 组件的子级（任何深度），并且该 Raycast Filter 组件允许射线投射。

然后按深度对命中 Raycast Targets 列表进行排序，过滤掉反向目标，并过滤掉渲染在相机后面（即屏幕上不可见）的元素。

Graphic Raycaster 还可以将射线投射到 3D 或 2D 物理系统中，如果在 Graphic Raycaster 的 `Blocking Objects` 属性上设置了相应的标志。

如果启用了 2D 或 3D 阻挡对象，则任何绘制在位于射线阻挡物理层上的 2D 或 3D 对象下方的 Raycast Target 也将从命中列表中消除。

最后返回最终的命中列表。

**射线检测优化技巧**

鉴于所有 Raycast Target 都必须由 Graphic Raycaster 测试，最佳实践是仅在必须接收指针事件的 UI 组件上启用 `Raycast Target` 设置。Raycast Target 列表越小，必须遍历的层次结构越浅，每次 Raycast 测试的速度就越快。

对于具有多个必须响应指针事件的可绘制 UI 对象的复合 UI 控件，例如希望其背景和文本都改变颜色的按钮，通常最好在复合 UI 控件的根部放置单个 Raycast Target。当该单个 Raycast Target 接收到指针事件时，它可以将事件转发给复合控件中每个感兴趣的组件。

**层次深度和射线检测过滤器**

每个 Graphic Raycast 在搜索射线投射过滤器时都会遍历 Transform 层次结构一直到根部。此操作的成本与层次结构的深度呈线性增长。必须测试在层次结构中附加到每个 Transform 的所有组件，以查看它们是否实现了 [ICanvasRaycastFilter]，因此这不是一个廉价的操作。

**子 Canvas 和 OverrideSorting 属性**

子 Canvas 上的 [overrideSorting] 属性将导致 Graphic Raycast 测试停止爬升变换层次结构。如果可以在不引起排序或射线检测问题的情况下启用它，则应使用它来减少射线检测层次遍历的成本。

## 优化 UI 控件

特定类型的 UI 控件的优化问题。虽然大多数 UI 控件在性能方面相对相似，但有两个控件是许多在接近可发布状态的游戏中遇到的性能问题的根源。

### UI 文本

Unity 的内置 Text 组件是在 UI 中显示栅格化文本字形的便捷方式。然而，有一些行为并不为人所知，但经常作为性能热点出现。向 UI 添加文本时，请始终记住文本字形实际上是作为单个四边形渲染的，每个字符一个。这些四边形周围往往有大量的空白空间，具体取决于其形状，并且很容易以一种无意中破坏其他 UI 元素批处理的方式定位文本。

**文本网格重建**

一个主要问题是 UI 文本网格的重建。每当 UI Text 组件更改时，文本组件必须重新计算用于显示实际文本的多边形。如果文本组件或其任何父 GameObject 被简单地禁用和重新启用而不更改文本，也会发生此重新计算。

此行为对于显示大量文本标签的任何 UI 都是有问题的，最常见的是排行榜或统计屏幕。由于隐藏和显示 Unity UI 的最常见方法是启用/禁用包含 UI 的 GameObject，具有大量文本组件的 UI 在显示时通常会导致不良的帧速率卡顿。

有关此问题的潜在解决方法，请参阅下一步中的 [禁用 Canvas](#禁用-canvas) 部分。

**动态字体和字体图集**

动态字体是当可显示字符集非常大或在运行时之前未知时显示文本的便捷方式。在 Unity 的实现中，这些字体根据 UI Text 组件中遇到的字符在运行时构建字形图集。

每个加载的不同 Font 对象将维护自己的纹理图集，即使它与另一个字体属于同一字体系列。例如，在一个控件上使用 Arial 加粗文本，而在另一个控件上使用 Arial Bold 将产生相同的输出，但 Unity 将维护两个不同的纹理图集 - 一个用于 Arial，一个用于 Arial Bold。

从性能角度来看，最重要的是要理解 Unity UI 的动态字体在字体的纹理图集中为每个大小、样式和字符的不同组合维护一个字形。也就是说，如果 UI 包含两个文本组件，都显示字母 `A`，那么：

* 如果两个 Text 组件共享相同的大小，字体图集将有一个字形。
* 如果两个 Text 组件不共享相同的大小（例如一个是 16 点，另一个是 24 点），则字体图集将包含两个不同大小的字母 `A`。
* 如果一个 Text 组件是粗体而另一个不是，则字体图集将包含一个粗体 `A` 和一个常规 `A`。

每当具有动态字体的 UI Text 对象遇到尚未光栅化到字体纹理图集中的字形时，字体的纹理图集必须重建。如果新字形适合当前图集，则添加它并将图集重新上传到图形设备。但是，如果当前图集太小，则系统会尝试重建图集。它分两个阶段完成此操作。

* 首先，以相同大小重建图集，仅使用当前由活动的 UI Text 组件显示的字形。这包括父 Canvas 已启用但具有禁用 Canvas Renderers 的 UI Text 组件。如果系统成功将所有当前使用的字形放入新图集中，则光栅化该图集并且不继续第二步。

* 其次，如果当前使用的字形集无法放入与当前图集相同大小的图集中，则通过将图集的较短维度加倍来创建更大的图集。例如，512x512 图集扩展为 512x1024 图集。

由于上述算法，动态字体的图集一旦创建就只会增大。考虑到重建纹理图集的成本，必须最小化重建次数。这可以通过两种方式完成。

只要可能，使用非动态字体并预先配置对所需字形集的支持。这通常适用于使用良好约束字符集（如仅拉丁/ASCII 字符）和小范围大小的 UI。

如果必须支持极大范围的字符，例如整个 Unicode 集，则必须将字体设置为 Dynamic。为避免可预测的性能问题，在启动时通过 [Font.RequestCharactersInTexture] 用一组适当的字符初始化字体的字形图集。

请注意，字体图集重建是由每个更改的 UI Text 组件单独触发的。当填充极大量的 Text 组件时，收集 Text 组件内容中的所有唯一字符并初始化字体图集可能是有利的。这将确保字形图集只需要重建一次，而不是每次遇到新字形时都重建一次。

还要注意，当触发字体图集重建时，任何当前不包含在活动 UI Text 组件中的字符都不会出现在新图集中，即使它们最初是通过调用 [Font.RequestCharactersInTexture] 添加到图集中的。要解决此限制，请订阅 `Font.textureRebuilt` 委托并查询 [Font.characterInfo] 以确保所有所需字符保持初始化状态。

`Font.textureRebuilt` 委托目前未记录。它是一个 [单参数 Unity Event]。参数是纹理被重建的字体。此事件的订阅者应遵循以下签名：

```cs
public void TextureRebuiltCallback(Font rebuiltFont) { /* ... */ }
```

**专用字形渲染器**

对于字形已知且各字形之间位置相对固定的情况，编写自定义组件来显示这些字形的精灵要有利得多。一个例子可能是分数显示。

对于分数，可显示字符来自一个已知的字形集（数字 0-9），不随地区变化，并以固定距离彼此出现。编写这种专门的数字显示系统相对简单，可以以无分配且计算、动画和显示速度明显快于 Canvas 驱动的 UI Text 组件的方式实现。

**后备字体和内存使用**

对于必须支持大字符集的应用程序，很诱人的是在字体导入器的 `Font Names` 字段中列出大量字体。`Font Names` 字段中列出的任何字体都将用作如果在主字体中找不到字形时的后备字体。后备顺序由 `Font Names` 字段中列出的字体顺序决定。

然而，为了支持此行为，Unity 将保持 `Font Names` 字段中列出的所有字体加载到内存中。如果字体的字符集非常大，则后备字体消耗的内存量可能变得过多。这在包含象形字体（如日本汉字或中文字符）时最常见。

**Best Fit 和性能**

通常，UI Text 组件的 Best Fit 设置永远不应使用。

`Best Fit` 动态调整字体大小到可以在 Text 组件的边界框内显示而不溢出的最大整数点大小，限制在可配置的最小/最大点大小范围内。然而，由于 Unity 为显示的每个不同大小的字符渲染不同的字形到字体图集中，使用 Best Fit 会迅速用许多不同大小的字形淹没图集。

截至 Unity 2017.3，`Best Fit` 使用的大小检测不是最优的。它为测试的每个大小增量在图集中生成字形，这进一步增加了生成字体图集所需的时间。它还经常导致图集溢出，这会导致旧字形被踢出图集。由于 `Best Fit` 计算需要大量测试，这通常会强制字体图集在计算出适当的字体大小后至少再重建一次。此特定问题已在 Unity 5.4 中纠正，`Best Fit` 不会不必要地扩展字体的纹理图集，但仍然比静态大小的文本慢得多。

频繁的字体图集重建会迅速降低运行时性能并导致内存碎片。设置为 `Best Fit` 的文本组件数量越多，这个问题变得越严重。

### TextMeshPro 文本

TextMesh Pro (TMP)是 Unity 现有文本组件（如 Text Mesh 和 UI Text）的替代品。TextMesh Pro 使用有符号距离场(SDF)作为其主要文本渲染管道，使得可以在任何点大小和分辨率下清晰地渲染文本。使用一组旨在利用 SDF 文本渲染能力的自定义着色器，TextMesh Pro 可以通过简单地更改材质属性来动态改变文本的视觉外观，以添加视觉样式，如膨胀、轮廓、软阴影、斜角、纹理、发光等，并通过创建/使用材质预设来保存和调用这些视觉样式。

在 2018.1 发布之前，TextMesh Pro 作为 Asset Store 包包含在项目中。从 2018.1 开始，TextMesh Pro 将作为 [Package Manager] 包提供。

**文本网格重建**

与 Unity 内置的 UIText 组件非常相似，更改组件显示的文本将触发对 `Canvas.SendWillRendererCanvases` 和 `Canvas.BuildBatch` 的调用，这可能很昂贵。最小化对 TextMeshProUGUI 组件的文本字段的更改，并确保将文本经常变化的 TextMeshProUGUI 组件父级到具有自己的 Canvas 组件的父 GameObject，以确保 Canvas 重建调用尽可能高效。

请注意，对于在世界空间中显示的文本，我们建议用户使用普通的 `TextMeshPro` 组件而不是 `TextMeshProUGUI`，因为在 Worldspace 中使用 Canvas 可能效率低下。直接使用 TextMeshPro 会更高效，因为它不会产生 canvas 系统开销。

**字体和内存使用**

鉴于 TMP 中没有动态字体功能，必须依赖后备字体。了解如何加载和使用后备字体对于在使用 TMP 时优化内存至关重要。

TMP 中的字形发现是递归完成的 - 也就是说，当字形从 TMP 字体资源中缺失时，TMP 会遍历当前分配或活动的后备字体资源列表，从列表中的第一个后备字体开始，并通过它们自己的后备字体。如果仍然找不到所需的字形，TMP 将搜索可能分配给文本对象的任何 Sprite 资源以及分配给此 Sprite 资源的任何后备资源。如果仍然找不到所需的字形，TMP 将递归搜索 TMP 设置文件中分配的一般后备字体，然后是默认 Sprite 资源。如果仍然无法定位此字形，它将使用 TMP 设置文件中定义的 Missing Glyph Replacement 字符。

TextMesh Pro 的字体资源在场景或项目中引用时加载。它们主要由 TextMeshPro 文本组件、TMP 设置以及字体资源本身作为后备字体引用。如果在 TMP 设置资源中引用了字体资源，则这些字体资源及其所有后备字体资源将在激活第一个包含 TMP 文本组件的场景时递归加载。如果引用了默认精灵表资源，它也将被加载。

此外，当字体资源由给定场景中的 TextMeshPro 组件引用且尚未通过 TMP 设置加载时，则引用的字体资源及其所有后备字体资源将在组件激活后递归加载。在处理具有许多字体的项目时，特别是当可用内存是一个问题时，记住这个过程很重要。

由于上述原因，在使用 TMP 时本地化项目成为一个问题，因为通过 TMP 设置预先加载所有本地化语言字体资源将对内存压力有害。如果需要本地化，我们建议仅在必要时（加载各种场景时）分配这些字体资源或后备字体，或使用 Asset Bundles 以模块化方式加载字体资源的潜在策略。

当应用程序启动时，应包括一个引导步骤来验证用户的区域设置并为每个字体资源设置字体资源后备：

1. 为基础 TMP 字体资源创建 Asset Bundle（例如，每种字体的最小拉丁字形）
2. 为每种语言所需的后备 TMP 字体资源创建 Asset Bundle（例如，日语每种字体所需的 TMP 字体资源一个 Asset Bundle）
3. 在引导步骤中加载基础 Asset Bundle
4. 根据区域设置，加载具有后备字体的所需 Asset Bundle
5. 对于基础 Asset Bundle 中的每种字体，从本地化字体 Asset Bundle 分配后备字体资源
6. 继续引导游戏

如果未使用图像，也可以从 TMP 设置中删除默认 Sprite 资源引用，以获得适度的额外内存节省。

**Best Fit 和性能**

再次强调，鉴于 TextMesh Pro 没有动态字体功能，上述 UGUI UIText 部分中关于 Best Fit 的问题不会发生。在 TextMesh Pro 组件上使用 Best Fit 时唯一要考虑的是使用二分搜索来找到正确的大小。使用文本自动调整大小时，最好测试最长/最大文本块的最佳点大小。一旦确定此最佳大小，在给定文本对象上禁用自动调整大小，然后手动在其他文本对象上设置此最佳点大小。这具有提高性能的优势，并避免一组文本对象使用不同的点大小，这被认为是糟糕的视觉/排版实践。

### Scroll Views

在填充率问题之后，Unity UI 的 Scroll Views 是运行时性能问题的第二大常见来源。Scroll Views 通常需要大量 UI 元素来表示其内容。有两种基本方法来填充滚动视图：

* 用表示所有滚动视图内容所需的所有元素填充它
* 池化元素，根据需要重新定位它们以表示可见内容

这两种解决方案都有问题。

第一种解决方案随着要表示的项目数量增加，实例化所有 UI 元素所需的时间也越来越长，并且还增加了重建 Scroll View 所需的时间。如果 Scroll View 中只需要少量元素，例如仅需要显示少量 Text 组件的 Scroll View，则这种方法因其简单性而受到青睐。

第二种解决方案在当前 UI 和布局系统下需要大量代码才能正确实现。下面将讨论两种可能的方法。对于任何显著复杂的滚动 UI，通常需要某种池化方法来避免性能问题。

尽管存在这些问题，所有方法都可以通过向 Scroll View 添加 `RectMask2D` 组件来改进。此组件确保位于 Scroll View 视口之外的 Scroll View 元素不包含在必须生成、排序和分析其几何形状的可绘制元素列表中。

**简单的 Scroll View 元素池化**

在保留使用 Unity 内置 Scroll View 组件的大部分便利性的同时实现对象池化的最简单方法是采用混合方法：

要在 UI 中布局元素（允许布局系统正确计算 Scroll View 内容的大小并使滚动条正常工作），使用带有 [Layout Element] 组件的 GameObject 作为可见 UI 元素的 **占位符**。

然后，实例化足以填充 Scroll View 可见部分的可见 UI 元素池，并将这些元素父级到定位占位符。随着 Scroll View 滚动，重用 UI 元素以显示滚动到视图中的内容。

这将大大减少必须批处理的 UI 元素数量，因为批处理的成本仅基于 Canvas 内的 Canvas Renderers 数量增加，而不是 Rect Transforms 数量。

**简单方法的问题**

目前，每当任何 UI 元素被重新父级或其兄弟顺序更改时，该元素及其所有子元素都被标记为 "脏" 并强制重建其 Canvas。

原因是 Unity 没有分离重新父级变换和更改其兄弟顺序的回调。这两个事件都会触发 [OnTransformParentChanged] 回调。在 Unity UI 的 [Graphic] 类源代码中（参见 Graphic.cs），实现了该回调并调用方法 [SetAllDirty]。通过将 Graphic 标记为脏，系统确保 Graphic 将在下一帧渲染之前重建其布局和顶点。

可以将 Canvas 分配给 Scroll View 内每个元素的根 RectTransform，这将把重建限制在仅重新父级的元素，而不是 Scroll View 的整个内容。然而，这往往会增加渲染 Scroll View 所需的绘制调用数量。此外，如果 Scroll View 中的各个元素很复杂，由超过一打 Graphic 组件组成，特别是如果每个元素上有大量 Layout 组件，则重建它们的成本通常足够高，以至于在低端设备上会明显降低帧率。

如果 Scroll View UI 元素没有可变大小，则这种完整的布局和顶点重新计算是不必要的。然而，避免此行为需要实现基于位置变化而不是父级或兄弟顺序变化的对象池化解决方案。

**基于位置的 Scroll View 池**

为了避免上述问题，可以创建一个通过简单地移动其包含的 UI 元素的 RectTransforms 来池化其对象的 Scroll View。如果它们的尺寸没有改变，这避免了需要重建移动的 RectTransforms 的内容，显著提高了 Scroll View 的性能。

要实现这一点，通常最好编写 Scroll View 的自定义子类或编写自定义 Layout Group 组件。后者通常是更简单的解决方案，可以通过实现 Unity UI 的 [LayoutGroup] 抽象基类的子类来完成。

自定义 Layout Group 可以分析底层源数据以检查必须显示多少数据元素，并适当调整 Scroll View 的 Content RectTransform 大小。然后它可以订阅 [Scroll View change events] 并使用这些事件相应地重新定位其可见元素。

## 其他 UI 优化技术和技巧

有时就是没有干净的方法来优化 UI。本节包含一些可能有助于提高 UI 性能的建议，但有些在结构上"不干净"，可能难以维护，或者可能有丑陋的副作用。其他可能是 UI 中旨在简化初始开发的行为的解决方法，但也使得相对简单地创建性能问题。

### 基于 RectTransform 的布局

Layout 组件相对昂贵，因为它们必须在每次被标记为脏时重新计算其子元素的大小和位置。（有关详细信息，请参阅 [基础步骤中的 Graphic 重建](#graphic-重建) 部分。）如果给定 Layout 中有相对少量且固定数量的元素，并且 Layout 具有相对简单的结构，则可能可以用基于 RectTransform 的布局替换 Layout。

通过分配 RectTransform 的锚点，可以使 RectTransform 的位置和大小基于其父级缩放。例如，一个简单的两列布局可以通过两个 RectTransforms 实现：

* 左列的锚点应为 X: (0, 0.5) 和 Y: (0, 1)
* 右列的锚点应为 X: (0.5, 1) 和 Y: (0, 1)

RectTransform 的大小和位置计算将由 Transform 系统本身在本机代码中驱动。这通常比依赖 Layout 系统更高效。也可以编写设置基于 RectTransform 的布局的 MonoBehaviours。然而，这是一个相对复杂的任务，超出了本指南的范围。

### 禁用 Canvas

在显示或隐藏 UI 的离散部分时，通常启用或禁用 UI 根部的 GameObject。这确保禁用 UI 中的任何组件不会接收输入或 Unity 回调。

然而，这也会导致 Canvas 丢弃其 VBO 数据。重新启用 Canvas 将要求 Canvas（和任何子 Canvas）运行重建和重新批处理过程。如果这种情况频繁发生，增加的 CPU 使用率可能导致应用程序的帧率卡顿。

一个可能但有点 hacky 的解决方法是将要显示/隐藏的 UI 放在自己的 Canvas 或子 Canvas 上，然后仅启用/禁用此对象上的 Canvas 组件。

这将导致 UI 的网格不被绘制，但它们将保留在内存中，并且它们的原始批处理将被保留。此外，UI 层次结构中不会调用任何 [OnEnable] 或 [OnDisable] 回调。

但是请注意，这不会禁用隐藏 UI 中的任何 MonoBehaviours，因此这些 MonoBehaviours 仍将接收 Unity 生命周期回调，如 Update。

为避免此问题，将以此方式禁用的 UI 上的 MonoBehaviours 不应直接实现 Unity 的生命周期回调，而应从 UI 根 GameObject 上的 `Callback Manager` MonoBehaviour 接收它们的回调。这个 `Callback Manager` 可以在 UI 显示/隐藏时得到通知，并可以确保根据需要传播或不传播生命周期事件。关于此 `Callback Manager` 模式的进一步解释超出了本指南的范围。

### 分配事件相机

如果将 Canvas 设置为 `World Space` 或 `Screen Space - Camera` 模式并使用 Unity 的内置 Input Managers，则务必始终设置 Event Camera 或 Render Camera 属性。从脚本中，这始终作为 [worldCamera] 属性公开。

如果未设置此属性，则 Unity UI 将通过查找带有 Main Camera 标签的 GameObject 上的 Camera 组件来搜索主相机。此查找将针对每个 `World Space` 或 Camera Space Canvas 至少发生一次。由于 [GameObject.FindWithTag] 已知很慢，强烈建议所有 World Space 和 Camera Space Canvas 在设计时或初始化时分配其 Camera 属性。

此问题不会发生在 Overlay Canvas 上。

### UI 源代码定制

UI 系统旨在支持大量用例。这种灵活性非常棒，但也意味着一些优化无法在不破坏其他功能的情况下轻松完成。如果您最终遇到可以通过更改 C# UI 源代码来获得一些 CPU 周期的情境，则可以重新编译 UI DLL 并覆盖 Unity 附带的 DLL。

但这应该只作为最后的手段，因为存在一些重要的缺点。首先，您必须找到一种方法将此新 DLL 分发给您的开发人员和构建机器。然后，每次升级 Unity 时，都必须将您的更改与新的 UI 源代码合并。在没有办法通过现有类或者编写自己的组件版本达成目的的情况下，再考虑更改源代码。

### 其他优化建议

[其他优化建议](./Unity%20UI%20优化建议.md)
<!-- [](Unity%20UI%20优化建议.md) -->

[Font.characterInfo]: http://docs.unity3d.com/ScriptReference/Font-characterInfo.html
[Font.RequestCharactersInTexture]: http://docs.unity3d.com/ScriptReference/Font.RequestCharactersInTexture.html
[GameObject.FindWithTag]: http://docs.unity3d.com/ScriptReference/GameObject.FindWithTag.html
[Graphic Raycaster]: https://docs.unity3d.com/Packages/com.unity.ugui@2.0/api/UnityEngine.UI.GraphicRaycaster.html
[Graphic]: https://docs.unity3d.com/Packages/com.unity.ugui@2.0/api/UnityEngine.UI.Graphic.html
[ICanvasElement.Rebuild]: https://docs.unity3d.com/Packages/com.unity.ugui@2.0/api/UnityEngine.UI.ICanvasElement.html
[ICanvasElement]: https://docs.unity3d.com/Packages/com.unity.ugui@2.0/api/UnityEngine.UI.ICanvasElement.html
[ICanvasRaycastFilter]: http://docs.unity3d.com/ScriptReference/ICanvasRaycastFilter.html
[Layout Element]: https://docs.unity3d.com/Packages/com.unity.ugui@2.0/manual/script-LayoutElement.html
[LayoutGroup]: https://docs.unity3d.com/Packages/com.unity.ugui@2.0/api/UnityEngine.UI.LayoutGroup.html
[OnDisable]: http://docs.unity3d.com/ScriptReference/MonoBehaviour.OnDisable.html
[OnEnable]: http://docs.unity3d.com/ScriptReference/MonoBehaviour.OnEnable.html
[OnTransformParentChanged]: http://docs.unity3d.com/ScriptReference/MonoBehaviour.OnTransformParentChanged.html
[overrideSorting]: http://docs.unity3d.com/ScriptReference/Canvas-overrideSorting.html
[Package Manager]: https://docs.unity3d.com/Packages/com.unity.package-manager-ui@latest/index.html
[Rebuild]: https://docs.unity3d.com/Packages/com.unity.ugui@2.0/api/UnityEngine.UI.ICanvasElement.html
[RectMask2D]: https://docs.unity3d.com/Packages/com.unity.ugui@2.0/api/UnityEngine.UI.RectMask2D.html
[Scroll View change events]: https://docs.unity3d.com/Packages/com.unity.ugui@2.0/api/UnityEngine.UI.ScrollRect.html
[SetAllDirty]: https://docs.unity3d.com/Packages/com.unity.ugui@2.0/api/UnityEngine.UI.Graphic.html#UnityEngine_UI_Graphic_SetAllDirty
[单参数 Unity Event]: http://docs.unity3d.com/ScriptReference/Events.UnityEvent_1.html
[sprite atlases]: https://docs.unity3d.com/Manual/class-SpriteAtlas.html
[UI Auto Layout]: https://docs.unity3d.com/Packages/com.unity.ugui@2.0/manual/UIAutoLayout.html
[UI Profiler]: https://docs.unity3d.com/2021.3/Documentation/Manual/ProfilerUI.html
[Unity-Technologies uGUI]: https://github.com/Unity-Technologies/uGUI
[WillRenderCanvases]: http://docs.unity3d.com/ScriptReference/Canvas-willRenderCanvases.html
[worldCamera]: http://docs.unity3d.com/ScriptReference/Canvas-worldCamera.html