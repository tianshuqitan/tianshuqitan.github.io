---
source: https://learn.unity.com/tutorial/optimizing-graphics-in-unity
article: false
index: false
---

# Unity 中的图形(Graphics)优化

[原文地址 - UnityLearn](https://learn.unity.com/tutorial/optimizing-graphics-in-unity)

## 渲染(Rendering)

在 Unity 中渲染图形是一项复杂的任务。如果您需要了解其工作原理的基础知识，请在阅读本教程之前参阅 Unity 的 [渲染管线(Rendering Pipeline)文档](https://docs.unity3d.com/Manual/SL-RenderPipeline.html)。

本指南解释了与渲染相关的底层概念，以及在以下领域减少 GPU 渲染工作负载的最佳实践：

* 光照场景(Lighting Scenes)
* 相机(Camera)
* 纹理(Textures)
* 多线程渲染(Multithreaded Rendering)和图形作业(Graphics Jobs)
* 帧缓冲区(Frame Buffer)
* 着色器(Shaders)

**GPU 分析(profiling)和基准测试(benchmarks)**

为了有效地优化图形渲染，您需要了解目标硬件的限制以及如何分析 GPU。分析有助于您检查和验证所做的优化是否有效。

在进行分析时，从基准测试开始很有用。例如，基准测试可以告诉您，当光照运行时处于最佳状态时，特定 GPU 的分析结果应该是什么样的。

请参阅 [GFXBench 网站](https://gfxbench.com/result.jsp)，其中列出了许多不同的行业标准 GPU 和显卡基准测试。该网站提供了当前市场上 GPU 的良好概述，以及它们之间的比较。

## 相机(Camera)

[相机(Camera)](https://docs.unity3d.com/Manual/class-Camera.html) 是一个核心组件，每个 Unity 应用程序都严重依赖它。这意味着有许多选项如果管理不当，可能会导致性能低下，例如 [清除(clear)](https://unity3d.com/learn/tutorials/topics/best-practices/camera#Clear)、[剔除(culling)](https://unity3d.com/learn/tutorials/topics/best-practices/camera#Culling)和 [天空盒(skybox)](https://unity3d.com/learn/tutorials/topics/best-practices/camera#Clear%20flags) 选项。

### 清除(Clear)

在移动设备基于瓦片(tile-based)的渲染器上，清除命令尤为重要。Unity 会处理细节，因此您只需在相机上设置 [清除标志(clear flags)](https://docs.unity3d.com/ScriptReference/CameraClearFlags.html)，并在针对移动设备时避免使用 `不清除(Don’t Clear)` 标志。清除命令的底层行为取决于平台和图形驱动程序，但根据您选择的清除标志，它可能会显著影响性能，因为 Unity 必须清除先前的内容、设置标志以忽略先前的内容，或者从缓冲区中读回先前的内容。但是，请勿在流式传输 GPU(即通常在台式机和游戏机中找到的类型)上执行不必要的清除。

**清除标志(Clear flags)**

在移动设备上，避免使用 Unity 的默认天空盒(恰当地命名为 Default-Skybox)，它计算成本高昂，并且在所有新场景中默认启用。要完全禁用天空盒渲染，请将 Camera.clearFlags 设置为 SolidColor。然后转到光照设置(Lighting Settings)窗口(菜单：Window > Rendering > Lighting)中的环境(Environment)选项卡，移除天空盒材质(Skybox Material)，并将环境光照(Environment Lighting)中的源(Source)设置为颜色(Color)。

**丢弃(Discard)和恢复缓冲区(Restore buffer)**

在 Adreno GPU 上使用 OpenGLES 时，Unity 只会丢弃帧缓冲区(framebuffer)以避免帧缓冲区恢复。在 PVR 和 Mali GPU 上，Unity 会清除以防止帧缓冲区恢复。

在移动设备上，将内容移入或移出图形内存是资源密集型的，因为这些设备使用 [共享内存(shared memory)](https://developer.apple.com/library/content/documentation/3DDrawing/Conceptual/MTLBestPracticesGuide/ResourceOptions.html) 架构，这意味着 CPU 和 GPU 共享相同的物理内存。在基于瓦片的 GPU(如 Adreno、PowerVR 或 Apple A 系列)上，在逻辑缓冲区中加载或存储数据会占用大量的系统时间和电池电量。将内容从 [共享内存(shared memory)](https://developer.apple.com/library/content/documentation/3DDrawing/Conceptual/MTLBestPracticesGuide/ResourceOptions.html) 传输到每个瓦片的帧缓冲区部分(或从帧缓冲区传输到共享内存)是资源密集型活动的主要来源。

**基于瓦片的渲染(Tile-based Rendering)**

[基于瓦片的渲染(Tile-based rendering)](https://www.realworldtech.com/tile-based-rasterization-nvidia-gpus/) 将视口(viewport)分割成更小的瓦片，典型大小为 32x32px，并将这些瓦片保存在更靠近 GPU 的更快内存中。这种较小内存和真实帧缓冲区之间的复制操作可能需要一些时间，因为内存操作比算术操作慢得多。

这些缓慢的内存操作是您应该避免在基于瓦片的 GPU 上每一新帧都使用 `glClear(OpenGLES)` 调用加载先前帧缓冲区的主要原因。通过发出 glClear 命令，您是在告诉硬件您不需要先前的缓冲区内容，因此它不需要将颜色缓冲区(color buffer)、深度缓冲区(depth buffer)和模板缓冲区(stencil buffer)从帧缓冲区复制到较小的瓦片内存中。

注意：由于芯片获取信息的方式，小于 16 像素的视口在某些芯片组上可能非常慢；例如，将视口设置为 2x2 像素实际上可能比设置为 16x16 像素慢。这种减速是设备特定的，Unity 无法控制，因此对其进行分析至关重要。

**RenderTexture 切换(RenderTexture Switching)**

当您切换渲染目标时，图形驱动程序会在帧缓冲区上执行加载和存储操作。例如，如果您在连续两帧中渲染到视图的颜色缓冲区和纹理，系统会重复在共享内存和 GPU 之间传输(加载和存储)纹理的内容。

**帧缓冲区压缩(Framebuffer Compression)**

清除命令还会影响帧缓冲区的压缩，包括颜色、深度和模板缓冲区。清除整个缓冲区可以使其更紧密地压缩，从而减少驱动程序需要在 GPU 和内存之间传输的数据量，因此通过提高吞吐量可以实现更高的帧速率。在基于瓦片的架构上，清除瓦片是一项小任务，涉及在每个瓦片中设置一些位。完成后，这使得从内存中获取瓦片变得非常便宜。注意：这些优化适用于基于瓦片延迟渲染(tile-based deferred rendering)的 GPU 和流式传输 GPU。

### 剔除(Culling)

[剔除(Culling)](https://docs.unity3d.com/Manual/OcclusionCulling.html) 是按相机进行的，并且可能对性能产生严重影响，尤其是在同时启用多个相机时。剔除有两种类型：视锥体剔除(frustum culling)和遮挡剔除(occlusion culling)：

* [视锥体剔除(Frustum Culling)](https://unity3d.com/learn/tutorials/topics/best-practices/camera#Frustum%20Culling) 在每个 Unity 相机上自动执行。
* [遮挡剔除(Occlusion culling)](https://unity3d.com/learn/tutorials/topics/best-practices/camera#Occlusion%20Culling) 由开发者控制。

**视锥体剔除(Frustum Culling)**

视锥体剔除确保相机视锥体(Camera frustum)之外的 GameObject 不被渲染，以节省渲染性能。

![](./Assets/An_example_of_Frustum_Culling.png)

> 视锥体剔除的示例。

注意：视锥体剔除在 2017.1 及更高版本中已作业化(jobified)，并且 Unity 现在也首先按层(layer)进行剔除。按层剔除意味着 Unity 只剔除相机使用的层上的 GameObject，并忽略其他层上的 GameObject。之后，Unity 使用线程上的作业根据相机视锥体剔除 GameObject。

**遮挡剔除(Occlusion Culling)**

当您启用 [遮挡剔除(Occlusion Culling)](http://docs.unity3d.com/Manual/OcclusionCulling.html) 时，如果相机看不到 GameObject，Unity 不会渲染它们。例如，如果门关闭且相机看不到房间，则无需渲染另一个房间。

![](./Assets/An_example_of_Occlusion_Culling.png)

> 遮挡剔除的示例。

如果您启用遮挡剔除，它可以显著提高性能，但会占用更多的磁盘空间和 RAM，因为 Unity Umbra 集成在构建期间烘焙遮挡数据，并且 Unity 在加载场景时需要将其从磁盘加载到 RAM。

**多个相机(Multiple Cameras)**

当您在场景中使用许多活动相机时，每个相机都有显著的固定剔除和渲染开销。由于层剔除，Unity 在 Unity 2017.1 中减少了剔除开销，但如果相机不使用 [不同的层(different layer)](https://docs.unity3d.com/ScriptReference/Camera-cullingMask.html) 来组织要渲染的内容，则这不会产生任何影响。

![](./Assets/sceneculling.jpg)

Unity CPU Profiler 在时间轴视图中显示主线程。它表明存在多个相机，并且您可以看到 Unity 为每个相机执行剔除。

**每层剔除距离(Per-Layer culling distances)**

您可以通过脚本在相机上手动设置 [每层剔除距离(per-layer culling distances)](https://docs.unity3d.com/Documentation/ScriptReference/Camera-layerCullDistances.html)。设置剔除距离对于剔除相机从给定距离查看时对场景没有贡献的小型 GameObject 非常有用。

### 运动矢量(Motion Vectors)

[后处理效果(Post-processing effects)](https://github.com/Unity-Technologies/PostProcessing)，例如时间抗锯齿(Temporal Anti-aliasing)(TAA)，需要并自动启用运动矢量(Motion Vectors)。

启用运动矢量会影响性能。如果不需要它们，可以通过禁用运动矢量来避免对性能的影响。

当它们未自动启用时，可以使用相机组件启用或禁用运动矢量 - 通过脚本使用 [Camera.depthTextureMode](https://docs.unity3d.com/Manual/SL-CameraDepthTexture.html) 或通过检查器更改相机的深度纹理模式(Depth Texture Mode)下拉菜单。

您还可以在任何蒙皮网格渲染器(Skinned Mesh Renderer)组件上启用或禁用附加功能 - [蒙皮运动矢量(Skinned Motion Vectors)](https://docs.unity3d.com/ScriptReference/SkinnedMeshRenderer-skinnedMotionVectors.html)。

### 填充率(Fillrate)

像素填充率(pixel fillrate)降低是过度绘制(overdraw)和片段着色器(fragment shader)复杂性的结果。Unity 通常将着色器实现为多个通道(pass)(绘制漫反射(diffuse)、绘制镜面反射(specular)等)。使用多个通道会导致过度绘制，其中不同的着色器多次触碰(读取/写入)相同的像素。有关更多信息，请阅读 [在 Unity 游戏中优化图形渲染](https://unity3d.com/learn/tutorials/temas/performance-optimization/optimizing-graphics-rendering-unity-games) 教程中的填充率部分。

**过度绘制(Overdraw)**

Unity 的 [帧调试器(Frame Debugger)](https://unity3d.com/learn/tutorials/topics/best-practices/unity-profiler#Unity%20Frame%20Debugger) 对于了解 Unity 如何绘制场景非常有用。注意那些用 GameObject 覆盖屏幕大面积区域的情况，因为即使 GameObject 被隐藏，Unity 也会继续绘制其后面的所有内容。这种情况的一个常见示例是在活动 3D 屏幕(例如设置或玩家库存)上调用菜单屏幕，但将其后面的 3D 场景保持活动状态。您还应该注意 Unity 多次绘制的 GameObject；例如，当多个光源触碰单个 GameObject 时，就会发生这种情况，因为 Unity 会为每个通道绘制它(请参阅 [前向渲染路径(Forward Rendering Path)](https://docs.unity3d.com/Manual/RenderTech-ForwardRendering.html)文档)。

如上所述，UI 通常是过度绘制和填充率问题的原因。通过遵循 [优化 Unity UI](https://unity3d.com/learn/tutorials/topics/best-practices/fill-rate-canvases-and-input?playlist=30089) 指南中的提示来避免这些问题。

**过度绘制视图(Overdraw view)**

过度绘制视图允许您查看 Unity 相互绘制的对象。您可以使用 [场景视图控制栏(Scene View Control Bar)](http://docs.unity3d.com/Manual/ViewModes.html) 在场景视图中查看过度绘制。
> 内置渲染管线中可以看到 Overdraw 模式，但是 SRP(URP/HDRP) 管线下，看不到 Miscellaneous(杂项) 分组(Overdraw 就在其中)。
>
> SRP 下，可以通过 `Analysis > Rendering Debugger > Rendering` 下的 Overdraw Mode 查看。

![](./Assets/Overdraw_in_the_Scene_View_Control_Bar.png)

> 场景视图控制栏中的过度绘制。

![](./Assets/A_Scene_in_standard_Shaded_view.png)

> 标准着色视图中的场景。

![](./Assets/The_same_Scene_in_Overdraw_view.png)

> 过度绘制视图中的同一场景。

当您将场景视图调整到目标分辨率时，过度绘制视图效果最佳。Unity 将对象渲染为透明轮廓。随着透明度的累积，更容易发现 GameObject 相互绘制的地方。白色是最不理想的，因为一个像素被多次过度绘制，而黑色表示没有发生过度绘制。

**透明度(Transparency)**

透明度也会增加过度绘制。在最佳情况下，屏幕上的每个像素每帧只被触碰一次。

**Alpha 混合(Alpha Blending)**

您应该避免重叠的 Alpha 混合几何体(例如密集的粒子效果和全屏后处理效果)，以保持填充率较低。

**绘制顺序(Draw Order)**

Unity 不透明队列中的对象使用边界框(bounding box)(AABB 中心坐标)和深度测试(depth testing)以从前到后的顺序渲染，以最大程度地减少过度绘制。但是，Unity 以从后到前的顺序渲染透明队列中的对象，并且不执行深度测试，这使得透明队列中的对象容易受到过度绘制的影响。Unity 还根据其边界框的中心位置对透明 GameObject 进行排序。

**Z-测试(Z-testing)**

Z-测试比绘制像素更快。Unity 通过 [边界框(bounding box)](https://unity3d.com/learn/tutorials/topics/best-practices/camera#Draw%20Order) 执行剔除和不透明排序。因此，Unity 可能会首先绘制大型背景对象，例如天空盒或地面平面，因为边界框很大并且填充了大量像素，这些像素在被其他对象过度绘制后最终不可见。如果您看到这种情况发生，请手动将这些对象移到队列的末尾。有关更多信息，请参阅脚本 API 参考中的 [Material.renderQueue](http://docs.unity3d.com/ScriptReference/Material-renderQueue.html)。

### 绘制调用批处理(Draw Call Batching)

PC 硬件可以推送大量绘制调用(draw calls)，但每个调用的开销仍然很高，足以值得尝试减少它们。然而，在移动设备上，绘制调用优化至关重要，您可以通过 [绘制调用批处理(draw call batching)](https://docs.unity3d.com/Manual/DrawCallBatching.html) 来实现。

您可以通过遵循以下简单规则来最大化批处理：

* 在场景中尽可能少地使用纹理。纹理越少，所需的唯一材质(Materials)就越少，从而更容易进行批处理。此外，尽可能使用纹理图集(Texture atlases)。
* 在检查器(Inspector)中将所有从不移动的网格(Meshes)标记为静态(Static)。Unity 在构建时将所有标记为静态的网格组合成一个大型网格。您也可以在运行时(例如，在生成由静态部分组成的程序化关卡后)使用 StaticBatchingUtility 自己生成静态批处理。
* 始终以尽可能大的图集大小烘焙光照贴图(lightmaps)。光照贴图越少，所需的材质状态更改就越少。例如，Samsung S6/S8 可以轻松推送 4096k 光照贴图，但要注意内存占用。注意：您不需要将每个 GameObject 都包含在光照贴图中(当将 GameObject 设置为 lightmap-static 时会发生这种情况)。虽然上述建议通常是正确的 - 您应该将所有不移动的 GameObject 标记为静态 - 但您应该省略小型对象(碎石、杯子、书籍)，因为添加它们会迫使 Unity 在空间不足时创建另一个光照贴图。当您使用光照探针(Light Probes)照亮小型对象时，它们看起来会很棒。
* 小心不要意外地实例化材质。访问 Renderer.material 会自动创建一个实例，并使该对象退出批处理。尽可能使用 [Renderer.sharedMaterial](https://docs.unity3d.com/ScriptReference/Renderer-sharedMaterial.html)代替。
* 注意多通道着色器。尽可能在着色器中添加 noforwardadd，以防止 Unity 应用多个定向光，因为多个定向光会破坏批处理(有关更多详细信息，请参阅 [编写表面着色器(Writing Surface Shaders)](https://docs.unity3d.com/Manual/SL-SurfaceShaders.html) 文档)。
* 在优化期间，通过使用 Profiler、内部 profiler 日志或 stats gizmo 来关注静态和动态批处理计数与总绘制调用计数。

有关更多信息和提示，请阅读 Unity 文档中关于 [绘制调用批处理(draw call batching)](https://docs.unity3d.com/Manual/DrawCallBatching.html) 的部分。

**实例化(Instancing)**

[实例化(Instancing)](https://docs.unity3d.com/Manual/GPUInstancing.html) 强制 Unity 使用常量缓冲区(constant buffers)，这在桌面 GPU 上效果很好，但在移动设备上速度较慢。实例化只有在大约 50-100 个网格时才开始变得有用，具体取决于底层硬件。

### 几何体(Geometry)

将场景中 GameObject 的几何复杂性保持在最低限度至关重要，否则 Unity 必须向显卡推送大量顶点数据(vertex data)。200k 静态三角形是低端移动设备的保守目标。但是，这也取决于您的 GameObject 是动画的还是静态的。

| **平台(Platform)** | **静态几何体(Static Geometry)** \[百万三角形\] | **动画蒙皮网格(Animated Skinned Meshes)** \[百万三角形\] |
| :--- | :--- | :--- |
| 低端移动设备(Low-end mobile)| 0.2 | 0.05 |
| 高端移动设备(High-end mobile)| 1-5 | 0.5-1 |

在 Unity 中，通过拥有少量高多边形数的 GameObject 而不是大量低多边形数的 GameObject，可以获得更好的渲染性能。

移除您看不到的几何体面，并且不要渲染玩家永远看不到的东西。例如，如果您永远看不到靠墙的橱柜背面，则橱柜模型不应在其背面有任何面。

尽可能简化网格。根据目标平台(尤其是在移动设备上)，考虑通过高分辨率纹理添加细节以弥补低多边形几何体，可能还有视差映射(parallax mapping)和曲面细分(tessellation)。请注意并记住定期进行分析，因为这可能会影响性能，并且可能不适合或不适用于目标平台。

通过将尽可能多的细节烘焙到纹理中来降低像素复杂性(每像素计算)。例如，将镜面高光烘焙到纹理中，以避免在片段着色器中计算高光。

### 细节级别(Level of Detail)(LOD)

[细节级别(Level Of Detail)(LOD)](http://docs.unity3d.com/Manual/LevelOfDetail.html)渲染允许您随着对象与相机的距离增加而减少渲染的三角形数量。只要对象不同时靠近相机，LOD 通过添加 LOD 组件来减轻硬件负载并提高渲染性能。它还为距离相机更远的距离组提供较低细节的网格。总共有 8 个 LOD 级别。像 [Simplygon](https://www.assetstore.unity3d.com/en/?_ga=1.12773172.2001961110.1480026812#!/content/10144) 这样的工具可以自动化 LOD 的大部分资源准备过程。

![](./Assets/lod0.png)

![](./Assets/lod1.png)

**静态场景(Static Scenes)**

当您使用用户无法移动的静态相机设置(例如在某些 VR 体验中)时，最好使用根据距离建模具有正确细节的网格，而不是为每个对象存储多个 LOD。您可以通过使用纹理的适当分辨率而不是在运行时进行 mipmapping 来对纹理应用类似的概念。应用正确的细节可以节省大量磁盘空间和一些运行时内存。

**高质量 LOD(High-Quality LODs)**

如果内存允许，您可以使用网格组合(Mesh combination)然后对结果进行 LOD。例如，一个书柜近距离由独特的部件组成，但在远处将它们合并成一个网格并进行 LOD。维护和生成高质量 LOD 需要时间和精力，即使您已经拥有最佳的几何体、材质和着色器。

**运行时网格组合(Runtime Mesh Combination)**

请注意，通常不建议在运行时组合网格，因为在网格组合时帧率可能会降低。

通过编写使用 [Mesh.CombineMeshes](https://docs.unity3d.com/ScriptReference/Mesh.CombineMeshes.html) 的脚本，可以在运行时将多个网格组合成一个网格。这样做会生成一个静态网格，但可以提高性能。在最佳情况下，这将导致更少的绘制调用(可以使用 [帧调试器窗口(Frame Debugger window)](https://docs.unity3d.com/Manual/FrameDebugger.html)进行验证)。

一个最佳情况的示例 - 可能获得性能提升 - 是组合使用相同非实例化材质的多个静态对象的网格。

更多信息可以在 [这个 Unity 手册页面](https://docs.unity3d.com/Manual/combining-meshes.html) 中找到。

**动画 LOD(Animation LODs)**

当您想要动画的 LOD 时，必须通过遮罩手动设置它们。

这是一个示例：您有一个人类角色模型，它在较低 LOD 中不动画手指，并且不需要骨骼(rig)。

1. 只将手指放在一个遮罩中，不包括手或身体的其余部分
2. 创建另一个没有手指的遮罩，并添加身体的其余部分(包括手)
3. 在动画器(Animator)中设置两个层。基础层使用较低的 LOD(没有手指的动画)。接下来，创建一个新层，并在其设置中启用 Sync 复选框，并选择 Base Layer 作为源层。这个第二层只包含带有手指的遮罩。

![](./Assets/animation_window.png)

此设置不会读取所有动画曲线，但它确保 Unity 只加载所需的遮罩。使用同步层可以实现 LOD，尽管您需要手动设置它们。在动画层中使用 LOD 还可以节省 CPU 时间，因为动画不会以零权重评估动画剪辑。

## 纹理(Textures)

纹理是 Unity 项目的重要组成部分，您需要了解纹理大小和压缩。在移动设备和游戏机上，由于运行时内存和磁盘空间有限，保持大小较低更为关键。选择正确的压缩对于将纹理缩小到合适的大小以节省内存带宽至关重要。

### 资源审计(Asset Auditing)

通过自动化资源审计过程，您可以避免意外或无意中更改资源设置。[AssetAuditor](https://github.com/MarkUnity/AssetAuditor) 在 Github 上的包涵盖了审计过程的许多方面。资源审计不仅有助于恢复纹理的性能，还可以应用于 Unity 中的多种资源类型。在 [理解 Unity 中的优化](https://docs.unity3d.com/Manual/analysis.html) 最佳实践指南中阅读更多关于 [资源审计(Asset Auditing)](https://docs.unity3d.com/Manual/assets-optimizing.html) 的信息。

### 纹理压缩(Texture Compression)

正确应用 [纹理压缩(Texture compression)](https://docs.unity3d.com/Manual/class-TextureImporterOverride.html) 可以带来显著的性能优势。在较新的移动设备上，您应该优先选择 ASTC 压缩纹理格式。如果您的目标设备上没有 ASTC，请在 Android 上使用 ETC2，在 iOS 上使用 PVRTC。

**ASTC**

Unity 4.3 及更高版本提供了对 [ARM](http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.100140_0100_00_en/Chunk533423422.html) 添加的 ASTC 压缩的支持。这在构建时非常有益，因为它允许 Unity 比 ETC2 或 PVRTC 更快地压缩 ASTC。在 iOS 上，ASTC 在 A8 芯片及更高版本上可用；在 Android 上，ASTC 在大多数现代芯片组上可用。

Mali GPU(Mali T-760 MP8 及更高版本)需要 ASTC 压缩而不是 ETC2。

如果硬件不支持 ASTC(例如，在 Adreno GPU 上)，您必须选择一个回退，例如 ETC2。有关 ASTC 的更多信息，请参阅 NVidia 文章 [使用 ASTC 纹理压缩优化游戏资源](https://developer.nvidia.com/astc-texture-compression-for-game-assets)。

**PVRTC**

PVRTC 是 iOS 上主要的纹理压缩格式，直到 Apple 添加了 ASTC。如果您在 Android 上使用 PVRTC，如果可能，应该将其替换为 ETC2。

注意：iOS 上的 PVRTC 纹理格式和 ETC 格式(Android 4.x 设备)需要方形纹理。压缩非方形纹理时，可能会发生两种情况：

* 如果没有 Sprite 使用该纹理，并且压缩后的内存占用小于未压缩时的内存占用，Unity 会根据 [非二次幂(non-power-of-two)](https://www.khronos.org/registry/OpenGL/extensions/ARB/ARB_texture_non_power_of_two.txt)(NPOT)纹理缩放因子调整纹理大小。
* 否则，Unity 不会调整纹理大小，并将其标记为未压缩。

### GPU 上传(GPU Upload)

Unity 在纹理加载完成后立即将其直接上传到 GPU，并且不会等到纹理在相机视锥体中可见。

当加载线程完成加载场景或资源时，Unity 需要唤醒它们。加载发生的位置和方式取决于 Unity 版本和用于初始化加载的调用。

**加载行为(Load Behavior)**

如果您从 AssetBundles、Resources 或 Scenes 加载资源，Unity 会从预加载线程(磁盘 I/O)转到图形线程(GPU 上传)。如果您使用 Unity 5.5 或更高版本，并且启用了 [图形作业(Graphics Jobs)](https://unity3d.com/learn/tutorials/topics/best-practices/multithreaded-rendering-graphics-jobs#Graphics%20Jobs)，Unity 会直接从预加载作业转到 GPU。

**唤醒行为(Awake Behavior)**

Unity 在唤醒所有场景 GameObject 后立即在主线程上唤醒资源。如果您使用 [AssetBundle.LoadAsset](https://docs.unity3d.com/ScriptReference/AssetBundle.LoadAsset.html)、[Resources.Load](https://docs.unity3d.com/ScriptReference/Resources.Load.html) 或 [SceneManager.LoadScene](https://docs.unity3d.com/ScriptReference/SceneManagement.SceneManager.LoadScene.html) 加载资源和场景，Unity 会阻塞主线程并唤醒所有资源。如果您使用这些调用的非阻塞版本(例如，[AssetBundle.LoadAssetAsync](https://docs.unity3d.com/ScriptReference/AssetBundle.LoadAssetAsync.html))，Unity 会使用时间切片(time-slicing)来唤醒资源。

**内存行为(Memory Behavior)**

在同时加载多个纹理时，如果上传速率不够快或主线程停滞，您可以调整纹理 [缓冲区(buffers)](https://docs.unity3d.com/ScriptReference/QualitySettings-asyncUploadBufferSize.html)。但是，更改默认值可能会导致高内存压力。您可以在 [Unity 中的内存管理](https://learn.unity.com/tutorial/memory-management-in-unity) 指南的 [环形缓冲区(RingBuffer)](https://learn.unity.com/tutorial/memory-management-in-unity#Ringbuffer) 部分阅读更多关于使用时间切片唤醒时纹理缓冲区中的内存限制的信息。

注意：如果 GPU 内存过载，GPU 会卸载最近最少使用的纹理，并在下次进入相机视锥体时强制 CPU 重新上传。

## 多线程渲染(Multithreaded Rendering)和图形作业(Graphics Jobs)

Unity 支持多种渲染模式，具体取决于平台可用性和图形 API：

* 单线程渲染(Singlethreaded Rendering)
* 多线程渲染(Multithreaded Rendering)
* 作业化渲染(Jobified Rendering)
* 图形作业(Graphics Jobs)

如果您未在 Player Settings 中选择其中一种模式，Unity 将使用单线程渲染。

### 单线程渲染(Singlethreaded Rendering)(单客户端，无工作线程)

如果未启用其他模式，Unity 默认使用单线程渲染。

这会导致单个客户端在执行高级渲染命令时占用主线程。

单个客户端在主线程上执行所有渲染命令(RCMD)。客户端还拥有真实的图形设备 GfxDevice，并在主线程上通过底层图形 API(GCMD)执行实际渲染。这是次优的，因为您在主线程上执行的所有命令都会占用重要的帧时间，而这些时间可以用于在主线程上运行的其他子系统。

![](./Assets/singlethreaded_rendering_0.png)

### 多线程渲染(Multithreaded Rendering)(单客户端，单工作线程)

如果图形 API 允许，Unity 默认启用 [多线程渲染(Multithreaded Rendering)](https://docs.unity3d.com/Manual/class-PlayerSettingsiOS.html)。要禁用多线程渲染(通常用于分析目的)，请转到 Player Settings(菜单：Edit > Project Settings > Player)窗口，向下滚动并取消选中 Multithreaded Rendering 复选框。

Unity 中的多线程渲染实现为单客户端、单工作线程。这通过利用 Unity 中的抽象 GfxDevice 接口来实现。不同的图形 API 实现(例如 Vulkan、Metal 和 GLES)继承自 GfxDevice。

**渲染线程(Renderthread)**

当您启用多线程渲染时，可以在本机平台分析器(例如 XCode)上的调用堆栈中找到 GfxDeviceClient 类函数。在 Unity 时间轴分析器中，它被称为 Renderthread。

![](./Assets/mt_rendering.png)

客户端的高级渲染代码在主线程上执行，使用渲染线程。

单个客户端将所有渲染命令(RCMD)转发到渲染线程 - 一个专门用于渲染的工作线程 - 它拥有真实的图形设备 GfxDevice，并通过底层图形 API(GCMD)执行实际渲染。

![](./Assets/multithreaded_rendering_0.png)

**可用性(Availability)**

Unity 根据图形 API 和目标平台有条件地启用或禁用多线程渲染。下表概述了可以在哪些平台和图形 API 上启用或禁用多线程渲染。

| **图形 API(Graphics API)** | **iOS** | **Android** | **桌面(Desktop)** |
| :--- | :--- | :--- | :--- |
| **OpenGLES 2/3** | 不支持(Not Supported)| 不支持(Not Supported)| 不适用(N/A)|
| **Metal** | 不适用(N/A)| 不适用(N/A)| 不适用(N/A)|
| **Vulkan** | 不适用(N/A)| 可配置(Configurable)| 可配置(Configurable)|

**性能注意事项(Performance Considerations)**

您应该尽可能启用多线程渲染，因为它通常会极大地提高性能。提示：您还应该分析多线程渲染的使用情况，并注意在非常低端的设备上可能几乎没有好处。

### 分析多线程渲染(Profiling Multithreaded Rendering)

通常，您需要分析多线程渲染以提高渲染性能，并且需要禁用多线程渲染设置才能获得正确的结果(请参阅后面关于分析渲染的部分)。您还可以使用仅脚本的播放器设置 [PlayerSettings.MTRendering](https://docs.unity3d.com/ScriptReference/PlayerSettings.MTRendering.html) 来更改多线程渲染。或者，在相关平台的 Player Settings 中禁用此设置(请参阅前面关于可用性的部分)。要在编辑器中禁用多线程渲染，请使用以下命令行选项：`-force-gfx-direct`。如果您需要启用客户端设备(例如，使用显示列表)，请改用 `-force-gfx-st`。

### 作业化渲染(Jobified Rendering)(多客户端，单工作线程)

此渲染模式在 Unity 5.4、5.5 和 5.6 中可用，但此后已被图形作业取代。

多个作业，每个作业都在自己的线程上运行，生成中间图形命令(IGCMD)。之后，类似于多线程渲染(单客户端，单工作线程)，一个工作线程处理缓冲的中间图形命令，并将图形命令(GCMD)提交给真实的图形设备 GfxDevice。

这些作业具有明确定义的输入(RCMD)，因为它们可以与用户脚本代码同时运行，这可能会改变世界中任何对象的状态。作业将命令(RCMD)输出到每个线程不同的 GfxDeviceClient，并将它们写入自己的块分配缓冲区，然后由工作线程执行。

![](./Assets/jobified_rendering_0.png)

注意：工作线程不会等到作业完成才开始执行其命令(IGCMD)，但它始终按照调度顺序执行它们。

### 图形作业(Graphics Jobs)(多客户端，无工作线程)

Unity 默认禁用图形作业，但您可以在 Player Settings 中启用它们。多个本机命令生成线程利用支持在多个线程上以本机格式记录图形命令(GCMD)的图形 API。这消除了在将命令提交到 API 之前以自定义格式写入和读取命令的性能影响。与其他模式类似，图形作业通过调用 GfxDevice 函数生成命令。但是，由于设备现在是平台特定的，图形作业将命令直接转换为例如 DirectX 12 或 Vulkan 命令缓冲区。

![](./Assets/graphics_jobs.png)

注意：目前，图形作业没有渲染线程来调度作业，这会在主线程上造成少量调度开销。

注意：启用图形作业时，GPU 分析会自动禁用。

**可用性(Availability)**

图形作业的可用性取决于图形 API 和目标平台。下表概述了图形作业在每个平台和图形 API 上的可用性。

| **图形 API(Graphics API)** | **iOS** | **Android** | **桌面(Desktop)** |
| :--- | :--- | :--- | :--- |
| **OpenGLES 2/3** | 不支持(Not Supported)| 不支持(Not Supported)| 不适用(N/A)|
| **Metal** | 不适用(N/A)| 不适用(N/A)| 不适用(N/A)|
| **Vulkan** | 不适用(N/A)| 可配置(Configurable)| 可配置(Configurable)|

**分析渲染(Profiling Rendering)**

在分析时调查渲染系统时，禁用多线程渲染、作业化作业和图形作业，以在单线程渲染模式下查看在主线程上执行的整个渲染队列。这使得测量时间并更容易查看命令队列。

注意：当您在单线程渲染模式下运行以在主线程上执行所有内容时，您会获得不同的时间，因为管理其他模式的开销不会出现在分析器中。

**GfxThreadableDevice 函数(GfxThreadableDevice Functions)**

在分析时查看本机调用堆栈中的 GfxDeviceClient 函数时，它通常会添加来自 GfxThreadableDevices 类的额外虚函数。

这些额外函数是 GfxDevice 函数的变体，它们接受非线程安全的数据(例如 ShaderLab::PropertySheet)，并将其转换为线程安全的数据。当您在多线程渲染中调用 SetShaders()时，主线程会获取一个 ShaderLab::PropertySheet，并将其转换为纯序列化数据，GfxDevice 将其馈送到渲染线程上的 SetShadersThreadable()。当您调查着色器性能时，测量 SetShadersThreadable()方法的时间，以获取有关设置实际着色器所需时间的信息，并将其与非线程等效项进行比较。

## 帧缓冲区(Framebuffer)

帧缓冲区包含深度、模板和颜色缓冲区。颜色缓冲区是必不可少的部分，并且始终存在，而其他缓冲区可能存在或不存在，具体取决于您使用的图形功能。

### 双缓冲(Double Buffering)和 三缓冲(Triple Buffering)

如果设备支持双缓冲或三缓冲，则图形驱动程序分别需要两个或三个帧缓冲区。

使用双缓冲(并启用 VSync 时)，您的应用程序必须等到下一次垂直回扫(vertical retrace)才能开始渲染下一帧。垂直回扫以垂直刷新率发生，通常在 60-100 Hz 范围内。如果图形驱动程序支持，[关闭 VSync](https://docs.unity3d.com/ScriptReference/QualitySettings-vSyncCount.html) 可以消除此延迟并提供最高的帧率。但是，它可能会导致称为撕裂(tearing)的视觉伪影。

使用三缓冲时，您的应用程序在一个后备缓冲区(常规帧缓冲区)中渲染一帧。在等待翻转时，它开始在另一个后备缓冲区中渲染。结果是帧率通常高于双缓冲(并启用 VSync)且没有任何撕裂。

使用多个帧缓冲区会带来图形内存影响，尤其是在高分辨率显示器上，当您的应用程序以本机分辨率(Native Resolution)运行时。

### 颜色缓冲区(Color Buffer)

使用的帧缓冲区数量主要取决于图形驱动程序，每个帧缓冲区有一个颜色缓冲区。例如，当您在 Android 上使用 OpenGL ES 时，Unity 使用一个带有颜色缓冲区的 EGLWindowSurface，但 Unity 无法控制它使用多少颜色缓冲区和帧缓冲区。通常，Unity 使用三个帧缓冲区进行三缓冲，但如果设备不支持，它会回退到双缓冲并使用两个帧缓冲区，包括两个颜色缓冲区。

### 模板缓冲区(Stencil Buffer)和深度缓冲区(Depth Buffer)

模板缓冲区和深度缓冲区仅在图形功能使用它们时才绑定到帧缓冲区。如果您知道您的应用程序不需要它们，则应该禁用它们，因为帧缓冲区会占用大量图形内存，具体取决于分辨率，并且创建起来资源密集。

要禁用深度缓冲区和模板缓冲区，请转到 Player Settings(菜单：Edit > Project Settings > Player)窗口，选择 iOS 或 Android 选项卡，向下滚动到 Resolution and Presentation 部分，并选中 `Disable Depth and Stencil*` 复选框。

在移动 GPU 上，深度缓冲区和模板缓冲区是两个独立的缓冲区，深度缓冲区为 24 位，模板缓冲区为 8 位。与桌面平台不同，它们没有组合在一个缓冲区中，桌面平台将缓冲区组合成一个 32 位缓冲区，其中深度缓冲区使用 24 位，模板缓冲区使用 8 位。

### 本机分辨率(Native Resolution)

现代手机的显示屏分辨率非常高。本机分辨率通常远高于 1080p。即使对于现代游戏机，在不降低性能的情况下支持 1080p 也很困难。

提示：控制应用程序的分辨率，甚至将其公开，以便您的用户如果想节省电池寿命可以降低分辨率。

使用 [Screen.SetResolution](https://docs.unity3d.com/ScriptReference/Screen.SetResolution.html) 命令降低默认分辨率并在不损失质量的情况下恢复性能。

注意：将分辨率设置为本机分辨率的一半可能并不总是对视觉保真度产生积极影响。

**缓冲区大小(Buffer Size)**

计算帧缓冲区大小并比较从本机分析器获得的结果。例如，全高清屏幕的分辨率为 1920 x 1080，即 2073600 像素：

* 将此乘以颜色通道分辨率使用的位数，得到 66355200，这是所需的内存(以位为单位)。
* 现在将其除以 8、1024 和 1024，以获得以字节(Bytes)、千字节(Kilobytes)和兆字节(Megabytes)为单位的结果。

下表提供了按分辨率和位/通道计算的内存。

| **分辨率(Resolution)** | **像素(Pixel)** | **位/通道(Bits/Channel)** | **内存 \[位\](Memory \[Bits\])** | **内存 \[MB\](Memory \[MB\])** |
| :--- | :--- | :--- | :--- | :--- |
| 1920 x 1080 | 2073600 | 32  | 66355200 | 7.91 |
|     |     | 24  | 49766400 | 5.93 |
|     |     | 16  | 33177600 | 3.96 |
|     |     | 8   | 16588800 | 1.98 |
| 1440\*2960 | 4262400 | 32  | 136396800 | 16.3 |
|     |     | 24  | 102297600 | 12.19 |
|     |     | 16  | 68198400 | 8.13 |
|     |     | 8   | 34099200 | 4.07 |

在分辨率为 `1440*2960` 的 Samsung Galaxy S8 上运行的应用程序，在使用 32 位颜色缓冲区、24 位深度缓冲区和 8 位模板缓冲区进行三缓冲操作时，将使用 `*97.68MB` 的图形内存用于帧缓冲区。这些数字有助于您在 iOS(Instruments 中的 IOKit 分配)和 Android([dumpsys meminfo](https://unity3d.com/learn/tutorials/topics/best-practices/android-memory-management#dumpsys%20meminfo) 中的 EGL mtrack 分配)上使用本机分析器分析内存时比较内存统计信息。

### 最终 Blit(Final Blit)

在 Android 和 OpenGLES 上，Unity 创建一个带有颜色缓冲区和深度缓冲区附件的帧缓冲区对象，Unity 将其用于所有渲染。在帧结束时，Unity 将此帧缓冲区 blit 到 EGLSurface 中。从 Unity 2017.2 开始，您可以更改 [Blit 类型(Blit Type)](https://docs.unity3d.com/ScriptReference/AndroidBlitType.html)。转到 Player Settings(菜单：Edit > Project Settings > Player)窗口，选择 iOS 或 Android 选项卡，向下滚动到 `Resolution and Presentation` 部分，并在下拉菜单中选择 Blit 类型。

在 Android 上使用 Vulkan 时，Unity 不执行最终 blit，因为这样做会通过现有的 ANativeWindow 接口与现有的 BufferQueue 组件交互，并使用 Gralloc HAL 获取数据。有关更多详细信息，请参阅官方 [Android 文档](https://source.android.com/devices/graphics/arch-bq-gralloc)。

## 着色器(Shaders)

### 移动着色器(Mobile Shaders)

在移动设备上，验证所有片段着色器是否对移动设备友好至关重要。当您使用内置着色器时，应该使用着色器的 Mobile 或 Unlit 版本。避免过度使用多通道着色器(例如，旧版镜面反射)和过度着色器通道(即，超过 2 个通道)。

| **通道(Pass)** | **高端移动设备 \[ms\](High-End Mobile \[ms\])** | **低端移动设备 \[ms\](Low-End Mobile \[ms\])** |
| :--- | :--- | :--- | 
| 空(Empty)| 1.5 | 3   |
| 多通道*(Multipass*)| -  | -  |

多通道着色器(例如，泛光(bloom))的时间很大程度上取决于屏幕分辨率。将它们组合成更少的通道可以带来更好的性能。

**光照贴图(Lightmaps)**

在适当的情况下，您应该使用最基本的着色器。利用廉价的 Mobile > Unlit(Supports Lightmap)着色器来对场景进行光照贴图。

### 项目导入(Project Imports)

您可以从 Graphics Settings(Edit > ProjectSettings > Graphics)中的 Always included 着色器列表中移除所有未使用的着色器。此外，您可以将着色器添加到列表中，这些着色器将在应用程序的整个生命周期中始终包含在内。提示：如果您想更精细地控制加载时间，请改用着色器变体集合(shader variant collections)；这允许您在运行时选择加载时间对性能的影响，而不是增加初始加载时间。有关更多详细信息，请参阅着色器预加载(Shader Preloading)部分。

**默认着色器(Default Shaders)**

一些 Unity 着色器默认始终包含在构建中，例如 Splash Screen、粉色错误着色器和清除屏幕。这些着色器总共占用几十千字节，而不是兆字节。要查看 Unity 在构建中包含哪些着色器，请阅读构建日志。

### 着色器构建报告(Shader Build Report)

构建后，您可以在 `Editor.log` 中找到大型着色器的数据，其中包括着色器时间和大小，看起来类似于以下日志：

```
Compiled shader 'TEST Standard(Specular setup)' **in** 31.23s
    d3d9(total **internal** programs: 482, unique: 474)
    d3d11(total **internal** programs: 482, unique: 466)
    metal(total **internal** programs: 482, unique: 480)
    glcore(total **internal** programs: 482, unique: 454)
Compressed shader 'TEST Standard(Specular setup)' on d3d9 from 1.04MB to 0.14MB
Compressed shader 'TEST Standard(Specular setup)' on d3d11 from 1.39MB to 0.12MB
Compressed shader 'TEST Standard(Specular setup)' on metal from 2.56MB to 0.20MB
Compressed shader 'TEST Standard(Specular setup)' on glcore from 2.04MB to 0.15MB
```

此报告告诉您关于 Test 着色器的几件事：

* 由于 `#pragma multi_compile` 和 `shader_feature`，着色器扩展为 482 个变体。
* Unity 将包含在游戏数据中的着色器压缩到大约压缩大小的总和：`0.14 + 0.12 + 0.20 + 0.15 = 0.61MB`
* 在运行时，Unity 将压缩数据保留在内存中(0.61MB)，而当前使用的图形 API(例如 Metal)的数据是未压缩的，在上面的示例中将占用 2.56MB。

### 着色器内存(Shader Memory)

检查日志文件显示了单个着色器的压缩磁盘大小。要确定着色器在运行时的大小，您可以使用 Unity Profiler 执行详细的内存捕获。如果您完成深度内存分析，可以检查 Shaderlab，它包括 Shaderlab 根目录下与着色器相关的所有内容，包括缓冲区、源代码和与着色器编译相关的其他分配。着色器本身有自己的对象根，Profiler 将它们列在 Shaders 下。

### 着色器关键字(Shader Keywords)

着色器 [关键字(keywords)](https://docs.unity3d.com/Manual/SL-MultipleProgramVariants.html) 是全局的。目前，您只能使用 196 个关键字，因为 Unity 本身内部使用了 60 个。

构建着色器时，可以使用下划线 `_` 来禁用/启用功能，以避免占用全局关键字(例如，使用 `#pragma multi_compile SUPER_FEATURE` 时)。

提示：使用 `shader_feature` 而不是 `multi_compile`，因为它通过剥离不需要的关键字来节省内存。

### 着色器变体(Shader Variants)

着色器通常包含大量变体，这会增加构建大小，并且可能不是必需的。

如果您在着色器中使用以下定义，Unity 将生成同时定义 A 和 C 的变体：

```hlsl
#if 1
    #pragma multi_compile A B
#else
    #pragma multi_compile C D
#endif
```

Unity 在预处理步骤之前运行解析 `#pragmas` 以获取变体的代码。避免在着色器代码中使用 `#defines`。要阅读更多关于着色器变体的信息，请参阅 [制作多个着色器程序变体](https://docs.unity3d.com/Manual/SL-MultipleProgramVariants.html) 文档。

提示：如果您不需要着色器设置(例如线性雾)，请在 Graphics Settings 中禁用它们。这会在构建时从所有着色器中移除处理这些设置的变体。

### 着色器变体集合(Shader Variant Collections)

Unity 可以在应用程序加载时预加载着色器变体集合，或者您可以通过脚本加载它们。如果您通过脚本加载它们，您可以控制加载过程。有关更多信息，请参阅 [优化着色器加载时间](https://docs.unity3d.com/Manual/OptimizingShaderLoadTime.html) 文档。

注意：如果您添加一个着色器和一个引用它的变体集合，当您预热变体集合时，Unity 会加载着色器的所有子着色器(LOD)。

### 着色器预加载(Shader Preloading)

Unity 可以预加载着色器并将其保留在内存中，以便应用程序的整个生命周期使用，这使您可以控制着色器占用的内存量。此外，预加载着色器可以减少场景加载时间问题，因为您可以控制 Unity 加载着色器的时间。

### 内置着色器(Built-in shaders)

移动设备上的 [内置着色器(Built-in Shaders)](https://docs.unity3d.com/Manual/SL-BuiltinIncludes.html) 是针对特定用例进行泛化的。您应该从 `Always Included Shader`(Project Settings > Graphics) 列表中移除所有未使用的着色器。

注意：当您移除图形 API 时，Unity 可以从构建中剥离着色器。转到 Player Settings(菜单：Edit > Project Settings > Player)窗口，向下滚动到 Other Settings 部分，并移除所有不需要的图形 API。Unity 仍然附带与之前相同的二进制文件，但不再使用该图形 API。这样做的好处是，禁用未使用的图形 API 会从内置资源中剥离所有特定于它的着色器，从而节省磁盘空间。