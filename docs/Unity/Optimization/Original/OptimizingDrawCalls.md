---
created: 2025-04-18T 00:08:22
tags: []
source: https://docs.unity3d.com/cn/current/Manual/optimizing-draw-calls.html
author: Unity Technologies
---

# Optimizing draw calls

To draw geometry on the screen, Unity issues draw calls to the graphics API. A draw call tells the graphics API what to draw and how to draw it. Each draw call contains all the information the graphics API needs to draw on the screen, such as information about textures, shaders, and buffers. Draw calls can be resource intensive, but often the preparation for a draw call is more resource intensive than the draw call itself.

To prepare for a draw call, the CPU sets up resources and changes internal settings on the GPU. These settings are collectively called the render state. Changes to the render state, such as switching to a different material, are the most resource-intensive operations the graphics API performs.

Because render-state changes are resource intensive, it is important to optimize them. The main way to optimize render-state changes is to reduce the number of them. There are two ways to do this:

* Reduce the total number of draw calls. When you decrease the number of draw calls, you also decrease the number of render-state changes between them.
* Organize draw calls in a way that reduces the number of changes to the render state. If the graphics API can use the same render state to perform multiple draw calls, it can group draw calls together and not need to perform as many render-state changes.

Optimizing draw calls and render-state changes has a number of benefits for your application. Mainly, it improves frame times, but it also:

* Reduces the amount of electricity your application requires. For battery-powered devices, this reduces the rate at which batteries run out. It also reduces the amount of heat a device produces when running your application.
* Improves maintainability of future development on your application. When you optimize draw calls and render-state changes earlier and maintain them at an optimized level, you can add more GameObjects to your scene without producing large performance overheads.

There are several methods you can use in Unity to optimize and reduce draw calls and render-state changes. Some methods are more suited for certain scenes than others. The following methods are available in Unity:

* [GPU instancing]: Render multiple copies of the same mesh at the same time. GPU instancing is useful for drawing geometry that appears multiple times in a scene, for example, trees or bushes.
* [Draw call batching]: Combine meshes to reduce draw calls. Unity provides the following types of built-in draw call batching:
    * [Static batching]: Combine meshes of [static] GameObjects in advance. Unity sends the combined data to the GPU, but renders each mesh in the combination individually. Unity can still cull the meshes individually but each draw call is less resource-intensive since the state of the data never changes.
    * [Dynamic batching]: Transforms mesh vertices on the CPU, groups vertices that share the same configuration, and renders them in one draw call. Vertices share the same configuration if they store the same number and type of attributes. For example, `position` and `normal`.
* [Manually combining meshes]: Manually combine multiple meshes into a single mesh, using the [Mesh.CombineMeshes] function. Unity renders the combined mesh in a single draw call instead of one draw call per mesh.
* [SRP Batcher]: If your Project uses a Scriptable Render Pipeline (SRP), use the SRP Batcher to reduce the CPU time Unity requires to prepare and dispatch draw calls for materials that use the same shader variant.

**Optimization priority**

You can use multiple draw call optimization methods in the same scene but be aware that Unity prioritizes draw call optimization methods in a particular order. If you mark a GameObject to use more than one draw call optimization method, Unity uses the highest priority method. The only exception to this is the [SRP Batcher]. When you use the SRP Batcher, Unity also supports static batching for [GameObjects that are SRP Batcher compatible]. Unity prioritizes draw call optimizations in the following order:

1. SRP Batcher and static batching
2. GPU instancing
3. Dynamic batching

If you mark a GameObject for static batching and Unity successfully batches it, Unity disables GPU instancing for that GameObject, even if the renderer uses an instancing shader. When this happens, the Inspector window displays a warning message that suggests that you disable static batching. Similarly, if Unity can use GPU instancing for a mesh, Unity disables dynamic batching for that mesh.

## Draw call batching

Draw call batching is a [draw call optimization] method that combines meshes so that Unity can render them in fewer draw calls. Unity provides two built-in draw call batching methods:

* [Static batching]: For [static] GameObjects, Unity combines them and renders them together.
* [Dynamic batching]: For small enough meshes, this transforms their vertices on the CPU, groups similar vertices together, and renders them in one draw call.

Unity’s built-in draw call batching has several advantages over manually merging meshes; most notably, Unity can still cull meshes individually. However, it also has some downsides; static batching incurs memory and storage overhead, and dynamic batching incurs some CPU overhead.

**Render pipeline compatibility**

| **功能**             | **内置渲染管线** | **通用渲染管线 (URP)** | **高清渲染管线 (HDRP)** | **Custom Scriptable Render Pipeline (SRP)** |
| -------------------- | ---------------- | ---------------------- | ----------------------- | ------------------------------------------- |
| **Static Batching**  | 是               | 是                     | 是                      | 是                                          |
| **Dynamic Batching** | 是               | 是                     | 否                      | 是                                          |

**Using draw call batching**

The following usage information is relevant for both static and dynamic batching. For information specific to each draw call batching method, such as how to enable and use each method, see [Static batching] and [Dynamic batching].

[Mesh Renderers], [Trail Renderers], [Line Renderers], [Particle Systems], and [Sprite Renderers] are supported for draw call batching. Other types of rendering components, including Skinned Mesh Renderers Cloth, are not supported. Unity only batches Renderers with other Renderers of the same type; for example, Mesh Renderers with Mesh Renderers.

Unity batches draw calls of GameObjects that use the same material. This means to get the best results from draw call batching, share materials among as many GameObjects as possible. If you have two material assets that are identical apart from their textures, you can combine the textures into a single, larger texture. This process is called texture atlasing. For more information, see the [Wikipedia article] on texture atlasing. When textures are in the same atlas, you can use a single material asset instead.

In the Built-in Render Pipeline, you can use a [MaterialPropertyBlock] to change material properties without breaking draw call batching. The CPU still needs to make some render-state changes, but using a `MaterialPropertyBlock` is faster than using multiple materials. If your project uses a Scriptable Render Pipeline, don’t use a `MaterialPropertyBlock` because they remove SRP Batcher compatibility for the material.

Transparent shaders often require Unity to render meshes in back-to-front order. To batch transparent meshes, Unity first orders them from back to front and then tries to batch them. Since Unity must render the meshes back-to-front, it often can’t batch as many transparent meshes as opaque meshes.

Unity can’t apply dynamic batching to GameObjects that contain mirroring in their Transform component. For example, if one GameObject has a scale of **1** and another GameObject has a scale of **–1**, Unity can’t batch them together.

If you are not able to use draw call batching, manually combining meshes that are close to each other can be a good alternative. For more information on combining meshes, see [Combining meshes].

**Warning**: When you access shared material properties from a C# script, make sure to use [Renderer.sharedMaterial] and not [Renderer.material]. `Renderer.material` creates a copy of the material and assigns the copy back to the Renderer. This stops Unity from batching the draw calls for that Renderer.

### Static batching

Static batching is a [draw call batching] method that combines meshes that don’t move to reduce [draw calls]. It transforms the combined meshes into world space and builds one shared vertex and index buffer for them. Then, for visible meshes, Unity performs a series of simple draw calls, with almost no state changes between each one. Static batching doesn’t reduce the number of draw calls, but instead reduces the number of render state changes between them.

Static batching is more efficient than [dynamic batching] because static batching doesn’t transform vertices on the CPU. For more information about the performance implications for static batching, see [Performance implications].

**Render pipeline compatibility**

| **功能**            | **内置渲染管线** | **通用渲染管线 (URP)** | **高清渲染管线 (HDRP)** | **Custom Scriptable Render Pipeline (SRP)** |
| ------------------- | ---------------- | ---------------------- | ----------------------- | ------------------------------------------- |
| **Static Batching** | 是               | 是                     | 是                      | 是                                          |

**Using static batching**

Unity can perform static batching at build time and at runtime. As a general rule, if the GameObjects exist in a scene before you build your application, use the [Editor] to batch your GameObjects at build time. If you create the GameObjects and their meshes at runtime, use the [runtime API].

When you use the runtime API, you can change the transform properties of the root of a static batch. This means that you can move, rotate, or scale the entire combination of meshes that make up a static batch. You can’t change the transform properties of the individual meshes.

To use static batching for a set of GameObjects, the GameObjects must be eligible for static batching. In addition to the criteria described in the [common usage information], make sure that:

* The GameObject is active.
* The GameObject has a [Mesh Filter] component, and that component is enabled.
* The Mesh Filter component has a reference to a [Mesh].
* The mesh is read/write enabled.
* The mesh has a vertex count greater than 0.
* The mesh has not already been combined with another Mesh.
* The GameObject has a [Mesh Renderer] component, and that component is enabled.
* The Mesh Renderer component does not use any Material with a shader that has the `DisableBatching` tag set to true.
* Meshes you want to batch together use the same vertex attributes. For example Unity can batch meshes that use vertex position, vertex normal, and one UV with one another, but not with meshes that use vertex position, vertex normal, UV0, UV1, and vertex tangent.

For information about the performance implications for static batching, see [Performance implications].

**Static batching at build time**

You can enable static batching at build time in the Editor.

To perform static batching at build time:

1. Go to **Edit** > **Project Settings** > **Player**.
2. In **Other Settings**, enable **Static Batching**.
3. In the Scene view or Hierarchy, select the GameObject that you want to batch and view it in the Inspector.
    **Tip**: You can select multiple GameObjects at the same time to enable static batching for all of them.
4. In the GameObject’s [Static Editor Flags], enable **Batching Static**.

Unity automatically batches the specified static meshes into the same draw call if they fulfill the criteria described in the [common usage information].

![The Static Editor Flags checkbox in the Inspector for a GameObject.](https://docs.unity3d.com/cn/current/uploads/Main/StaticTagInspector.png)
> The Static Editor Flags checkbox in the Inspector for a GameObject.

**Note**: If you perform static batching at build time, Unity doesn’t use any CPU resources at runtime to generate the mesh data for the static batch.

**Static batching at runtime**

To batch static meshes at runtime, Unity provides the [StaticBatchingUtility] class. The static [StaticBatchingUtility.Combine] method combines the GameObjects you pass in and prepares them for static batching. This is especially useful for meshes that you procedurally generate at runtime.

Unlike static batching at build time, batching at runtime doesn’t require you to enable the **Static Batching** Player Setting. For information on how to use this API, see [StaticBatchingUtility].

**Performance implications**

Using static batching requires additional CPU memory to store the combined geometry. If multiple GameObjects use the same mesh, Unity creates a copy of the mesh for each GameObject, and inserts each copy into the combined mesh. This means that the same geometry appears in the combined mesh multiple times. Unity does this regardless of whether you use the [editor] or [runtime API] to prepare the GameObjects for static batching. If you want to keep a smaller memory footprint, you might have to sacrifice rendering performance and avoid static batching for some GameObjects. For example, marking trees as static in a dense forest environment can have a serious memory impact.

**Note**: There are limits to the number of vertices a static batch can include. Each static batch can include up to 64000 vertices. If there are more, Unity creates another batch.

### Dynamic batching

Dynamic batching is a [draw call batching] method that batches moving GameObjects to reduce [draw calls]. Dynamic batching works differently between meshes and geometries that Unity generates dynamically at runtime, such as [particle systems]. For information about the internal differences between meshes and dynamic geometries, see [Dynamic batching for meshes] and [Dynamic batching for dynamically generated geometries].

**Note**: Dynamic batching for meshes was designed to optimize performance on old low-end devices. On modern consumer hardware, the work dynamic batching does on the CPU can be greater than the overhead of a draw call. This negatively affects performance. For more information, see [Dynamic batching for meshes].

**Render pipeline compatibility**

| **功能**             | **内置渲染管线** | **通用渲染管线 (URP)** | **高清渲染管线 (HDRP)** | **Custom Scriptable Render Pipeline (SRP)** |
| :------------------- | :--------------- | :--------------------- | :---------------------- | :------------------------------------------ |
| **Dynamic Batching** | 是               | 是                     | 否                      | 是                                          |

**Using dynamic batching**

Unity always uses dynamic batching for dynamic geometry such as Particle Systems

To use dynamic batching for meshes:

1. Go to **Edit** > **Project Settings** > **Player**.
2. In **Other Settings**, enable **Dynamic Batching**.

Unity automatically batches moving meshes into the same draw call if they fulfill the criteria described in the [common usage information].

**Dynamic batching for meshes**

Dynamic batching for meshes works by transforming all vertices into world space. on the CPU, rather than on the GPU. This means dynamic batching is only an optimization if the transformation work is less resource intensive than doing a draw call.

The resource requirements of a draw call depend on many factors, primarily the graphics API. For example, on consoles or modern APIs like Apple Metal, the draw call overhead is generally much lower, and often dynamic batching doesn’t produce a gain in performance. To determine whether it’s beneficial to use dynamic batching in your application, [profile] your application with and without dynamic batching.

Unity can use dynamic batching for shadows casters, even if their materials are different, as long as the material values Unity needs for the shadow pass are the same. For example, multiple crates can use materials that have different textures. Although the material assets are different, the difference is irrelevant for the shadow caster pass and Unity can batch shadows for the crate GameObjects in the shadow render step.

**限制**

In the following scenarios, Unity either can’t use dynamic batching at all or can only apply dynamic batching to a limited extent:

* Unity can’t apply dynamic batching to meshes that contain more than 900 vertex attributes and 225 vertices. This is because dynamic batching for meshes has an overhead per vertex. For example, if your shader uses vertex position, vertex normal, and a single UV, then Unity can batch up to 225 vertices. However, if your shader uses vertex position, vertex normal, UV0, UV1, and vertex tangent, then Unity can only batch 180 vertices.
* If GameObjects use different material instances, Unity can’t batch them together, even if they are essentially the same. The only exception to this is shadow caster rendering.
* GameObjects with lightmaps have additional renderer parameters. This means that, if you want to batch lightmapped GameObjects, they must point to the same lightmap location.
* Unity can’t fully apply dynamic batching to GameObjects that use multi-pass shaders.
    * Almost all Unity shaders support several lights in forward rendering. To achieve this, they process an additional render pass for each light. Unity only batches the first render pass. It can’t batch the draw calls for the additional per-pixel lights.
    * The [Legacy Deferred rendering path] doesn’t support dynamic batching because it draws GameObjects in two render passes. The first pass is a light pre-pass and the second pass renders the GameObjects.

**Dynamic batching for dynamically generated geometries**

The following renderers dynamically generate geometries, such as particles and lines, that you can optimize using dynamic batching:

* [Built-in Particle Systems]
* [Line Renderers]
* [Trail Renderers]

Dynamic batching for dynamically generated geometries works differently than it does for meshes:

1. For each renderer, Unity builds all dynamically batchable content into one large vertex buffer.
2. The renderer sets up the material state for the batch.
3. Unity then binds the vertex buffer to the GPU.
4. For each Renderer in the batch, Unity updates the offset in the vertex buffer and submits a new draw call.

This approach is similar to how Unity submits draw calls for [static batching].

## Manually combining meshes

Scriptable Render Pipeline Batcher

You can manually combine multiple meshes into a single mesh as a [draw call optimization] technique. Unity renders the combined mesh in a single draw call instead of one draw call per mesh. This technique can be a good alternative to [draw call batching] in cases where the meshes are close together and don’t move relative to one another. For example, for a static cupboard with lots of drawers, it makes sense to combine everything into a single mesh.

**Warning**: Unity can’t individually cull meshes you combine. This means that if one part of a combined mesh is onscreen, Unity draws the entire combined mesh. If the meshes are static and you want Unity to individually cull them, use [static batching] instead.

There are two main ways to combine meshes:

* In your asset generation tool while authoring the mesh.
* In Unity using [Mesh.CombineMeshes].

## Scriptable Render Pipeline Batcher

The Scriptable Render Pipeline (SRP) Batcher is a [draw call optimization] that significantly improves performance for applications that use an SRP. The SRP Batcher reduces the CPU time Unity requires to prepare and dispatch draw calls for materials that use the same shader variant.

The Scriptable Render Pipeline (SRP) Batcher reduces the CPU time Unity requires to render scenes with many materials that use the same shader variant.

**Render pipeline compatibility**

| **功能**        | **内置渲染管线** | **通用渲染管线 (URP)** | **高清渲染管线 (HDRP)** | **Custom Scriptable Render Pipeline (SRP)** |
| :-------------- | :--------------- | :--------------------- | :---------------------- | :------------------------------------------ |
| **SRP Batcher** | 否               | 是                     | 是                      | 是                                          |

### GameObject compatibility

In any given scene, some GameObjects are compatible with the SRP Batcher, and some aren’t. Compatible GameObjects use the SRP Batcher code path, and non-compatible GameObjects use the standard SRP code path. For more information, see [How the SRP Batcher works].

A GameObject must meet the following requirements to be compatible with the SRP Batcher code path:

* The GameObject must contain either a mesh or a skinned mesh. It can’t be a particle.
* The GameObject mustn’t use [MaterialPropertyBlocks].
* The shader that the GameObject uses must be compatible with the SRP Batcher. For more information, see [Shader compatibility].

### Shader compatibility

All lit and unlit shaders in the High Definition Render Pipeline (HDRP) and the Universal Render Pipeline (URP) fit this requirement (except for the particle versions of these shaders).

For a custom shader to be compatible with the SRP Batcher it must meet the following requirements:

* The shader must declare all built-in engine properties in a single constant buffer named `UnityPerDraw`. For example, `unity_ObjectToWorld`, or `unity_SHAr`.
* The shader must declare all material properties in a single constant buffer named `UnityPerMaterial`.

You can check the compatibility status of a shader in the Inspector panel.

![](https://docs.unity3d.com/cn/current/uploads/Main/SRP_batcher_shader_compatibility.png)
> You can check the compatibility of your shaders in the Inspector panel for the specific shader.

### 使用 SRP Batcher

This section contains information on how to use the SRP Batcher in Unity’s pre-built Scriptable Render Pipelines.

#### Using the SRP Batcher in URP

要在 URP 中激活 SRP Batcher，请执行以下操作：

1. In the Project window, select the [URP Asset].
2. In the Inspector for the URP asset, enable **SRP Batcher**. If this option is not visible, follow the instructions below on [How to show Additional Properties for the URP Asset].

**How to show Additional Properties for the URP Asset**

Unity does not show certain advanced properties in the URP Asset by default. To see all available properties:

* In the URP Asset, in any section, click the vertical ellipsis icon (⋮) and select **Show Additional Properties**

    ![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/show-additional-properties.png)
    > Show Additional Properties

    Unity shows all available properties in the current section.

To show all additional properties in all sections:

1. Click the vertical ellipsis icon and select **Show All Additional Properties**. Unity opens the **Core Render Pipeline** section in the **Preferences** window.

2. In the property **Additional Properties > Visibility**, select **All Visible**.

    ![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/show-all-additional-properties.png)
    > Additional Properties > Visibility > All Visible

#### Using the SRP Batcher in HDRP

When you use HDRP, Unity enables the SRP Batcher by default. Disabling the SRP Batcher is not recommended. However, you can temporarily disable the SRP Batcher for debugging purposes.

To enable and disable the SRP Batcher at build time using the Editor:

1. 在 Project 窗口中选择 [HDRP 资源]。
2. In the Inspector for the asset, enter [Debug mode]. In Debug mode, you can see the properties of the HDRP Asset, including the SRP Batcher property.
3. Select **Enable** **SRP Batcher** to enable or disable the SRP Batcher.

To enable or disable the SRP Batcher at runtime, toggle the following global variable in your C# code:

```cs
GraphicsSettings.useScriptableRenderPipelineBatching = true;
```

### SRP Batcher 的工作原理

The traditional way to optimize draw calls is to reduce the number of them. Instead, the SRP Batcher reduces render-state changes between draw calls. To do this, the SRP Batcher combines a sequence of `bind` and `draw` GPU commands. Each sequence of commands is called an SRP batch.

![](https://docs.unity3d.com/cn/current/uploads/Main/SROShaderPass.png)
> The batching of bind and draw commands reduces the GPU setup between draw calls.

To achieve optimal performance for your rendering, each SRP batch should contain as many `bind` and `draw` commands as possible. To achieve this, use as few shader variants as possible. You can still use as many different materials with the same shader as you want.

When Unity detects a new material during the render loop, the CPU collects all properties and binds them to the GPU in constant buffers. The number of GPU buffers depends on how the shader declares its constant buffers.

The SRP Batcher is a low-level render loop that makes material data persist in GPU memory. If the material content doesn’t change, theSRP Batcher doesn’t make any render-state changes. Instead, the SRP Batcher uses a dedicated code path to update the Unity Engine properties in a large GPU buffer, like this:

![](https://docs.unity3d.com/cn/current/uploads/Main/SRP_Batcher_loop.png)
> The SRP Batcher rendering workflow. The SRP Batcher uses a dedicated code path to update the Unity Engine properties in a large GPU buffer.

Here, the CPU only handles the Unity Engine properties, labeled **Per Object large buffer** in the above diagram. All materials have persistent constant buffers located in GPU memory, which are ready to use. This speeds up rendering because:

* All material content now persists in GPU memory.
* Dedicated code manages a large per-object GPU constant buffer for all per-object properties.

### Intentionally removing SRP Batcher compatibility for GameObjects

In some rare cases, you might want to intentionally make particular GameObjects incompatible with the SRP Batcher. For example, if you want to use [GPU instancing], which isn’t compatible with the SRP Batcher. If you want to render many identical meshes with the exact same material, GPU instancing can be more efficient than the SRP Batcher. To use GPU instancing, you must either:

* Use [Graphics.DrawMeshInstanced].
* Manually remove SRP Batcher compatibility and enable GPU instancing for the material.

There are two ways to remove compatibility with the SRP Batcher from a GameObject:

* Make the shader incompatible.
* Make the renderer incompatible.

**Tip**: If you use GPU instancing instead of the SRP Batcher, use the [Profiler] to make sure that GPU instancing is more efficient for your application than the SRP Batcher.

#### Removing shader compatibility

You can make both hand-written and Shader Graph shaders incompatible with the SRP Batcher. However, for Shader Graph shaders, if you change and recompile the Shader Graph often, it’s simpler to make the [renderer incompatible] instead.

To make a Unity shader incompatible with the SRP Batcher, you need to make changes to the shader source file:

1. For hand-written shaders, open the shader source file. For Shader Graph shaders, copy the Shader Graph’s compiled shader source code into a new shader source file. Use the new shader source file in your application instead of the Shader Graph.
2. Add a new [material property] declaration into the shader’s `Properties` block. Don’t declare the new material property in the `UnityPerMaterial` constant buffer.

The material property doesn’t need to do anything; just having a material property that doesn’t exist in the `UnityPerMaterial` constant buffer makes the shader incompatible with the SRP Batcher.

**Warning**: If you use a Shader Graph, be aware that every time you edit and recompile the Shader Graph, you must repeat this process.

#### Removing renderer compatibility

You can make individual renderers incompatible with the SRP Batcher. To do this, add a `MaterialPropertyBlock` to the renderer.

### Profiling the SRP Batcher in the Unity Frame Debugger

You can check the status of SRP batches in the [Frame Debugger] window. Each SRP Batch displays how many draw calls Unity used, which keywords Unity attached to the shader, and the reason why Unity didn’t batch that draw call with the previous one.

要检查 SRP Batcher 批次的状态，请执行以下操作：

1. In the Editor, open the Frame Debugger (menu: **Window** > **Analysis** > **Frame Debugger**).
2. In the Frame Debugger, go to **Render Camera** > **Render Opaques**.
3. Expand the **RenderLoopNewBatcher.Draw** list.
4. Select on the **SRP Batch** you want to inspect.

In the example below, the reason is: **Nodes have different shaders**. This means that the shader for that SRP batch os different to the one in the previous SRP batch. Because the SRP Batcher used a different shader, the SRP Batcher created a new batch. If several SRP batches have a low number of draw calls, it often means the project uses too many shader variants.

![](https://docs.unity3d.com/cn/current/uploads/Main/SRP_Batcher_batch_information.png)
> In the Frame Debugger window, you can find details about individual SRP batches, including why the SRP Batcher created a new SRP batch instead of continuing the existing one.

If you write your own Scriptable Render Pipeline, instead of using either the Universal Render Pipeline or the High Definition Render Pipeline, try to write a generic multi-purpose shader with a minimal number of keywords. This is optimal because you can use as many material properties as you want.

[Built-in Particle Systems]: https://docs.unity3d.com/cn/current/Manual/Built-inParticleSystem.html
[Combining meshes]: https://docs.unity3d.com/cn/current/Manual/combining-meshes.html
[common usage information]: https://docs.unity3d.com/cn/current/Manual/DrawCallBatching.html#using-draw-call-batching
[Debug mode]: https://docs.unity3d.com/cn/current/Manual/InspectorOptions.html
[draw call batching]: https://docs.unity3d.com/cn/current/Manual/DrawCallBatching.html
[draw call optimization]: https://docs.unity3d.com/cn/current/Manual/optimizing-draw-calls.html
[draw calls]: https://docs.unity3d.com/cn/current/Manual/optimizing-draw-calls.html
[Dynamic batching for dynamically generated geometries]: https://docs.unity3d.com/cn/current/Manual/dynamic-batching.html#dynamic-batching-dynamic-geometry
[Dynamic batching for meshes]: https://docs.unity3d.com/cn/current/Manual/dynamic-batching.html#dynamic-batching-meshes
[Dynamic batching]: https://docs.unity3d.com/cn/current/Manual/dynamic-batching.html
[Editor]: https://docs.unity3d.com/cn/current/Manual/static-batching.html#editor
[Frame Debugger]: https://docs.unity3d.com/cn/current/Manual/FrameDebugger.html
[GameObjects that are SRP Batcher compatible]: https://docs.unity3d.com/cn/current/Manual/SRPBatcher.html#gameobject-compatibility
[GPU instancing]: https://docs.unity3d.com/cn/current/Manual/GPUInstancing.html
[Graphics.DrawMeshInstanced]: https://docs.unity3d.com/cn/current/ScriptReference/Graphics.DrawMeshInstanced.html
[HDRP 资源]: https://docs.unity3d.com/Packages/com.unity.render-pipelines.high-definition@latest/index.html?subfolder=/manual/HDRP-Asset.html
[How the SRP Batcher works]: https://docs.unity3d.com/cn/current/Manual/SRPBatcher.html#how-the-srp-batcher-works
[How to show Additional Properties for the URP Asset]: https://docs.unity3d.com/cn/current/Manual/SRPBatcher.html#how-to-show-additional-properties-for-the-urp-asset
[Legacy Deferred rendering path]: https://docs.unity3d.com/cn/current/Manual/RenderingPaths.html
[Line Renderers]: https://docs.unity3d.com/cn/current/Manual/class-LineRenderer.html
[Manually combining meshes]: https://docs.unity3d.com/cn/current/Manual/combining-meshes.html
[material property]: https://docs.unity3d.com/cn/current/Manual/SL-Properties.html
[MaterialPropertyBlock]: https://docs.unity3d.com/cn/current/ScriptReference/MaterialPropertyBlock.html
[Mesh Filter]: https://docs.unity3d.com/cn/current/Manual/class-MeshFilter.html
[Mesh Renderer]: https://docs.unity3d.com/cn/current/Manual/class-MeshRenderer.html
[Mesh.CombineMeshes]: https://docs.unity3d.com/cn/current/ScriptReference/Mesh.CombineMeshes.html
[Mesh]: https://docs.unity3d.com/cn/current/Manual/class-Mesh.html
[Particle Systems]: https://docs.unity3d.com/cn/current/Manual/class-ParticleSystem.html
[Performance implications]: https://docs.unity3d.com/cn/current/Manual/static-batching.html#performance-implications
[profile]: https://docs.unity3d.com/cn/current/Manual/Profiler.html
[Profiler]: https://docs.unity3d.com/cn/current/Manual/SRPBatcher.html#Profiler
[renderer incompatible]: https://docs.unity3d.com/cn/current/Manual/SRPBatcher.html#removing-renderer-compatibility
[Renderer.material]: https://docs.unity3d.com/cn/current/ScriptReference/Renderer-material.html
[Renderer.sharedMaterial]: https://docs.unity3d.com/cn/current/ScriptReference/Renderer-sharedMaterial.html
[runtime API]: https://docs.unity3d.com/cn/current/Manual/static-batching.html#runtime
[Shader compatibility]: https://docs.unity3d.com/cn/current/Manual/SRPBatcher.html#shader-compatibility
[Sprite Renderers]: https://docs.unity3d.com/cn/current/Manual/class-SpriteRenderer.html
[SRP Batcher]: https://docs.unity3d.com/cn/current/Manual/SRPBatcher.html
[static batching]: https://docs.unity3d.com/cn/current/Manual/static-batching.html
[Static Editor Flags]: https://docs.unity3d.com/cn/current/Manual/StaticObjects.html
[static]: https://docs.unity3d.com/cn/current/Manual/StaticObjects.html
[StaticBatchingUtility.Combine]: https://docs.unity3d.com/cn/current/ScriptReference/StaticBatchingUtility.Combine.html
[StaticBatchingUtility]: https://docs.unity3d.com/cn/current/ScriptReference/StaticBatchingUtility.html
[Trail Renderers]: https://docs.unity3d.com/cn/current/Manual/class-TrailRenderer.html
[URP Asset]: https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@12.1/manual/universalrp-asset.html
[Wikipedia article]: http://en.wikipedia.org/wiki/Texture_atlas