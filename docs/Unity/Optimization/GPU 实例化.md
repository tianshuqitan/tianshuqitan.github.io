---
source: https://docs.unity3d.com/2021.3/Documentation/Manual/GPUInstancing.html
article: false
index: false
---

# GPU 实例化

[原文地址 = UnityManual](https://docs.unity3d.com/2021.3/Documentation/Manual/GPUInstancing.html)

GPU instancing 是一种 DrawCall 优化方法，它使用相同的材质在单个绘制调用中渲染网格的多个副本。网格的每个副本称为一个实例。这对于绘制在场景中多次出现的内容很有用，例如树木或灌木。

GPU 实例化在同一个绘制调用中渲染相同的网格。为了增加变化并减少重复感，每个实例可以有不同的属性，例如 **Color** 或 **Scale**。渲染多个实例的绘制调用在 [Frame Debugger](https://docs.unity3d.com/cn/current/Manual/FrameDebugger.html) 中显示为 **Draw Mesh (instanced)**。

## 要求和兼容性

本节包含有关 GPU 实例化的平台、渲染管线和 SRP Batcher 兼容性信息。

**平台兼容性**

GPU 实例化在所有平台上都可用，除了 WebGL 1.0。

**渲染管线兼容性**

| **功能** | **内置渲染管线** | **通用渲染管线 (URP)** | **高清渲染管线 (HDRP)** | **自定义可编程渲染管线(SRP)** |
| :--- | :--- | :--- | :--- | :--- |
| **GPU instancing** | 是 | 是 (1) | 是 (1) | 是 (1) |

> (1) 仅当着色器与 [SRP Batcher](https://docs.unity3d.com/cn/current/Manual/SRPBatcher.html) 不兼容时。

GPU 实例化与 [SRP Batcher](https://docs.unity3d.com/cn/current/Manual/SRPBatcher.html) 不兼容。**SRP Batcher 优先于 GPU 实例化**。如果 GameObject 与 SRP Batcher 兼容，Unity 会使用 SRP Batcher 来渲染它，而不是 GPU 实例化。有关优化方法优先级的更多信息，请参阅 [Optimization priority](https://docs.unity3d.com/cn/current/Manual/optimizing-draw-calls.html#optimization-priority)。

如果您的项目使用 SRP Batcher 并且您想对 GameObject 使用 GPU 实例化，您可以执行以下操作之一：

* 使用 [Graphics.DrawMeshInstanced](https://docs.unity3d.com/cn/current/ScriptReference/Graphics.DrawMeshInstanced.html)。此 API 绕过 GameObject 的使用，并使用指定的参数直接在屏幕上绘制网格。
* 手动移除 SRP Batcher 兼容性。有关如何执行此操作的信息，请参阅 [Intentionally removing compatibility](https://docs.unity3d.com/cn/current/Manual/SRPBatcher.html#intentionally-removing-compatibility)。

## 使用 GPU 实例化

Unity 对共享相同网格和材质的 GameObject 使用 GPU 实例化。要对网格和材质进行实例化：

* 首先，材质的 [Shader](https://docs.unity3d.com/cn/current/Manual/Shaders.html) 必须支持 GPU 实例化。
  * Unity 的 [Standard Shader](https://docs.unity3d.com/cn/current/Manual/shader-StandardShader.html) 支持 GPU 实例化。
  * 所有 [Surface Shaders](https://docs.unity3d.com/cn/current/Manual/SL-SurfaceShaders.html) 也支持。
  * 要为任何其他着色器添加 GPU 实例化支持，请参阅 [创建支持 GPU instancing 的着色器](https://docs.unity3d.com/cn/current/Manual/gpu-instancing-shader.html)。
* 其次，网格必须来自以下来源(之一)，按行为分组：
    * [MeshRenderer](https://docs.unity3d.com/cn/current/Manual/class-MeshRenderer.html) 组件或 [Graphics.RenderMesh](https://docs.unity3d.com/cn/current/ScriptReference/Graphics.RenderMesh.html) 调用。Unity 将这些网格添加到列表中，然后检查哪些网格可以实例化。Unity 不支持 [SkinnedMeshRenderers](https://docs.unity3d.com/cn/current/Manual/class-SkinnedMeshRenderer.html) 或附加到与 SRP Batcher 兼容的 GameObject 的 MeshRenderer 组件的 GPU 实例化。
    * [Graphics.RenderMeshInstanced](https://docs.unity3d.com/cn/current/ScriptReference/Graphics.RenderMeshInstanced.html) 或 [Graphics.RenderMeshIndirect](https://docs.unity3d.com/cn/current/ScriptReference/Graphics.RenderMeshIndirect.html) 调用。这些方法使用相同的着色器多次渲染相同的网格。对这些方法的每次调用都会发出一个单独的绘制调用。Unity 不会合并这些绘制调用。

要对材质使用 GPU 实例化，请在 Inspector 中选择 **Enable GPU Instancing** 选项。

![](https://docs.unity3d.com/cn/current/uploads/Main/enable-gpu-instancing-inspector.png)
> 材质 Inspector 中显示的 Enable GPU Instancing 选项。

### 光照

GPU 实例化支持 Unity 的 [Baked Global Illumination system](https://docs.unity3d.com/cn/current/Manual/GI-Enlighten.html)。`Unity Standard Shaders` 和 `Surface Shaders` 默认支持 GPU 实例化和 Unity 的 Baked Global Illumination 系统。

每个 GPU 实例支持以下来源(之一)的全局光照：

* 任意数量的 [Light Probes](https://docs.unity3d.com/cn/current/Manual/LightProbes.html)。
* 一个 [Lightmap](https://docs.unity3d.com/cn/current/Manual/Lightmapping.html)。实例可以在 Lightmap 中使用多个图集区域。
* 一个 [Light Probe Proxy Volume](https://docs.unity3d.com/cn/current/Manual/class-LightProbeProxyVolume.html)(LPPV) 组件。您必须为包含所有实例的空间体积烘焙 LPPV。

GPU 实例化自动适用于：

* 受 Light Probes 影响的动态 [Mesh Renderers](https://docs.unity3d.com/cn/current/Manual/class-MeshRenderer.html)。
* 烘焙到相同 Lightmap 纹理的静态 Mesh Renderers。在此上下文中，如果 Mesh Renderer 在其 [Static Editor Flags](https://docs.unity3d.com/cn/current/Manual/StaticObjects.html) 中包含 **Contribute GI**，则它是静态的。

要为 `Graphics.DrawMeshInstanced` 启用 Light Probe 渲染，请将 [LightProbeUsage](https://docs.unity3d.com/cn/current/ScriptReference/Rendering.LightProbeUsage.html) 参数设置为 [CustomProvided](https://docs.unity3d.com/cn/current/ScriptReference/Rendering.LightProbeUsage.CustomProvided.html) 并提供包含 Probe 数据的 [MaterialPropertyBlock](https://docs.unity3d.com/cn/current/ScriptReference/MaterialPropertyBlock.html)。
> 有关更多信息和代码示例，请参阅 [LightProbes.CalculateInterpolatedLightAndOcclusionProbes](https://docs.unity3d.com/cn/current/ScriptReference/LightProbes.CalculateInterpolatedLightAndOcclusionProbes.html)。

或者，您可以将 LPPV 组件引用和 [LightProbeUsage.UseProxyVolume](https://docs.unity3d.com/cn/current/ScriptReference/Rendering.LightProbeUsage.UseProxyVolume.html) 传递给 `Graphics.DrawMeshInstanced`。当您这样做时，所有实例都会对 [L0 和 L1 bands](https://docs.unity3d.com/cn/current/Manual/LightProbes-TechnicalInformation.html) 的 Light Probe 数据进行采样。如果要补充 L2 数据和遮挡数据，请使用 `MaterialPropertyBlock`。
> 有关更多信息，请参阅 [Light Probes: Technical Information](https://docs.unity3d.com/cn/current/Manual/LightProbes-TechnicalInformation.html)。

## 性能影响

顶点数量较少的网格无法使用 GPU 实例化高效处理，因为 GPU 无法以充分利用 GPU 资源的方式分配工作。这种处理效率低下会对性能产生不利影响。开始出现效率低下的阈值取决于 GPU，但作为一般规则，**不要对顶点少于 `256` 个的网格使用 GPU 实例化**。

如果您想多次渲染顶点数量较少的网格，最佳实践是创建一个包含所有网格信息的单一缓冲区，并使用它来绘制网格。

## 创建支持 GPU 实例化的着色器

本页包含如何向自定义 Unity 着色器添加 GPU 实例化支持的信息。它首先解释自定义 Unity 着色器支持 GPU 实例化所需的着色器关键字、变量和函数。然后包括如何向 Surface shaders 和 vertex/fragment shaders 添加每实例数据的示例。

**渲染管线兼容性**

| **功能** | **内置渲染管线** | **通用渲染管线 (URP)** | **高清渲染管线 (HDRP)** | **自定义可编程渲染管线(SRP)** |
| :------- | :--- | :--- | :--- | :--- |
| **Custom GPU instanced shaders** | 是 | 否 | 否 | 否 |

**着色器修改**

| 添加 | 描述|
| :----- | :------- |
| `#pragma multi_compile_instancing` | 生成实例化变体。这对于 fragment 和 vertex shaders 是必需的。对于 Surface Shaders 是可选的。 |
| `#pragma instancing_options` | 指定 Unity 用于实例的选项。有关可用选项开关的信息，请参阅 [Instancing_options 开关]。|
| `UNITY_VERTEX_INPUT_INSTANCE_ID` | 在 vertex shader 输入/输出结构中定义实例 ID。要使用此宏，请启用 `INSTANCING_ON` 着色器关键字。否则，Unity 不会设置实例 ID。 <br> 要访问实例 ID，在 `#ifdef INSTANCING_ON` 块中使用 `vertexInput.instanceID`。如果不使用此块，变体将无法编译。 |
| `UNITY_INSTANCING_BUFFER_START(bufferName)` | 声明名为 `bufferName` 的每实例常量缓冲区的开始。将此宏与 `UNITY_INSTANCING_BUFFER_END` 一起使用，以包装您希望每个实例唯一的属性的声明。使用 `UNITY_DEFINE_INSTANCED_PROP` 在缓冲区中声明属性。 |
| `UNITY_INSTANCING_BUFFER_END(bufferName)` | 声明名为 `bufferName` 的每实例常量缓冲区的结束。将此宏与 `UNITY_INSTANCING_BUFFER_START` 一起使用，以包装您希望每个实例唯一的属性的声明。使用 `UNITY_DEFINE_INSTANCED_PROP` 在缓冲区中声明属性。 |
| `UNITY_DEFINE_INSTANCED_PROP(type, propertyName)` | 定义具有指定类型和名称的每实例着色器属性。在下面的示例中，`_Color` 属性是唯一的。 |
| `UNITY_SETUP_INSTANCE_ID(v);` | 允许着色器函数访问实例 ID。对于 vertex shaders，此宏在开头是必需的。对于 fragment shaders，此添加是可选的。有关示例，请参阅 [Vertex Fragment Shader 示例](#vertex-fragment-shader-示例)。 |
| `UNITY_TRANSFER_INSTANCE_ID(v, o);` | 将实例 ID 从输入结构复制到 vertex shader 中的输出结构。如果您需要在 fragment shader 中访问每实例数据，请使用此宏。 |
| `UNITY_ACCESS_INSTANCED_PROP(bufferName, propertyName)` | 访问实例化常量缓冲区中的每实例着色器属性。Unity 使用实例 ID 索引到实例数据数组。`bufferName` 必须与包含指定属性的常量缓冲区的名称匹配。此宏为 `INSTANCING_ON` 和非实例化变体编译不同。 |

当您使用多个每实例属性时，不需要在 `MaterialPropertyBlock` 对象中填充所有属性。此外，如果一个实例缺少属性，Unity 会从引用的材质中获取默认值。如果材质没有该属性的默认值，Unity 会将值设置为 0。不要将非实例化属性放在 `MaterialPropertyBlock` 中，因为这会禁用实例化。相反，为它们创建不同的材质。

**Instancing_options**

`#pragma instancing_options` 指令可以使用以下开关：

| **开关** | **描述** | 
| :---- | :--- |
| `forcemaxcount:batchSize` 和 `maxcount:batchSize` | 在大多数平台上，Unity 会自动计算实例化数据数组大小。它将目标设备上的最大常量缓冲区大小除以包含所有每实例属性的结构的大小。通常，您不需要担心批处理大小。但是，某些平台需要固定数组大小。要为这些平台指定批处理大小，请使用 `maxcount` 选项。其他平台忽略此选项。如果要强制所有平台的批处理大小，请使用 `forcemaxcount`。例如，当您的项目使用 `DrawMeshInstanced` 发出带有 `256` 个实例化精灵的绘制调用时，这很有用。这两个选项的默认值为 `500`。 |
| `assumeuniformscaling` | 指示 Unity 假设所有实例都具有统一缩放（X、Y 和 Z 轴的缩放相同）。|
| `nolodfade` | 使 Unity 不将 GPU 实例化应用于 [LOD](https://docs.unity3d.com/cn/current/Manual/LevelOfDetail.html) 淡出值。 |
| `nolightprobe` | 阻止 Unity 将 GPU 实例化应用于 [Light Probe](https://docs.unity3d.com/cn/current/Manual/LightProbes.html) 值及其遮挡数据。如果您的项目不包含同时使用 GPU 实例化和 Light Probes 的 GameObject，将此选项设置为 `ON` 可以提高性能。 |
| `nolightmap` | 阻止 Unity 将 GPU 实例化应用于 lightmap 图集信息值。如果您的项目不包含同时使用 GPU 实例化和 lightmaps 的 GameObject，将此选项设置为 `ON` 可以提高性能。 |
| `procedural:FunctionName` | 生成一个额外的变体以与 [Graphics.DrawMeshInstancedIndirect](https://docs.unity3d.com/cn/current/Manual/Graphics.DrawMeshInstancedIndirect) 一起使用。在 vertex shader 阶段开始时，Unity 调用冒号后指定的函数。要手动设置实例数据，请以与通常向着色器添加每实例数据相同的方式向此函数添加每实例数据。如果任何获取的实例属性包含在 fragment shader 中，Unity 也会在 fragment shader 开始时调用此函数。 |

### 使用带有 GPU 实例化的着色器变体

默认情况下，Unity 会生成带有实例化 [variants](https://docs.unity3d.com/cn/current/Manual/SL-MultipleProgramVariants.html) 的 Surface shaders，除非您在 `#pragma` 指令中指定 `noinstancing`。Unity 忽略在 Surface shader 中使用 `#pragma multi_compile_instancing`。

Unity 的 Standard 和 StandardSpecular shaders 默认支持实例化，但除了变换之外没有其他每实例属性。

如果您的场景中没有启用 GPU 实例化的 GameObject，则 Unity 会剥离实例化着色器变体。要覆盖剥离行为：

1. 打开 Project Settings（菜单：**Edit** > **Project Settings**）。
2. 转到 **Graphics**。
3. 在 **Shader Stripping** 部分，将 **Instancing Variants** 设置为 **Keep All**。

### 向 GPU 实例化着色器添加每实例属性

默认情况下，Unity 在每个实例化绘制调用中 GPU 实例化具有不同 [Transforms](https://docs.unity3d.com/cn/current/Manual/class-Transform.html) 的 GameObject。要向实例添加更多变化，修改着色器以添加每实例属性，例如颜色。您可以在 Surface shaders 和 vertex/fragment shaders 中执行此操作。

自定义着色器不需要每实例数据，但它们确实需要一个实例 ID，因为世界矩阵需要一个才能正常工作。Surface shaders 会自动设置实例 ID，但自定义 vertex 和 fragment shaders 不会。要为自定义 vertex 和 fragment shaders 设置 ID，请在着色器开头使用 `UNITY_SETUP_INSTANCE_ID`。有关如何执行此操作的示例，请参阅 [Vertex Fragment Shader 示例](#vertex-fragment-shader-示例)。

当您声明实例化属性时，Unity 会从 GameObject 上设置的 `MaterialPropertyBlock` 对象中收集所有属性值到一个绘制调用中。有关如何使用 `MaterialPropertyBlock` 对象在运行时设置每实例数据的示例，请参阅 [Changing per-instance data at runtime](#changing-per-instanced-data-at-runtime)。

向多通道着色器添加每实例数据时，请记住以下几点：

* 如果多通道着色器有两个以上的通道，Unity 仅实例化第一个通道。这是因为 Unity 会为每个对象一起渲染后面的通道，这会强制材质更改。
* 如果您在 Built-in Render Pipeline 中使用 Forward 渲染路径，Unity 无法高效实例化受多个灯光影响的对象。Unity 只能有效地对基础通道使用实例化，而不能对附加通道使用。有关光照通道的更多信息，请参阅有关 [Forward Rendering and Pass Tags](https://docs.unity3d.com/cn/current/Manual/RenderTech-ForwardRendering.html) 的文档。

### Surface shader 示例

以下示例演示如何创建具有每个实例不同颜色值的实例化 Surface Shader。

```cpp
Shader "Custom/InstancedColorSurfaceShader" 
{
    Properties 
    {
        _Color ("Color", Color) = (1,1,1,1)
        _MainTex ("Albedo (RGB)", 2D) = "white" {}
        _Glossiness ("Smoothness", Range(0,1)) = 0.5
        _Metallic ("Metallic", Range(0,1)) = 0.0
    }

    SubShader
    {
        Tags { "RenderType"="Opaque" }
        LOD 200
        CGPROGRAM
        // Uses the physically based standard lighting model with shadows enabled for all light types.
        #pragma surface surf Standard fullforwardshadows
        // Use Shader model 3.0 target
        #pragma target 3.0
        sampler2D _MainTex;
        struct Input 
        {
            float2 uv_MainTex;
        };
        half _Glossiness;
        half _Metallic;
        UNITY_INSTANCING_BUFFER_START(Props)
           UNITY_DEFINE_INSTANCED_PROP(fixed4, _Color)
        UNITY_INSTANCING_BUFFER_END(Props)
        void surf (Input IN, inout SurfaceOutputStandard o) {
            fixed4 c = tex2D (_MainTex, IN.uv_MainTex) * UNITY_ACCESS_INSTANCED_PROP(Props, _Color);
            o.Albedo = c.rgb;
            o.Metallic = _Metallic;
            o.Smoothness = _Glossiness;
            o.Alpha = c.a;
        }
        ENDCG
    }
    FallBack "Diffuse"
}
```

### Vertex Fragment Shader 示例

以下示例演示如何创建具有每个实例不同颜色值的实例化 Vertex 和 Fragment shader。与 Surface shader 不同，创建 Vertex 和 Fragment shader 时必须使用 `UNITY_SETUP_INSTANCE_ID` 手动设置实例 ID。

```cpp
Shader "Custom/SimplestInstancedShader"
{
    Properties
    {
        _Color ("Color", Color) = (1, 1, 1, 1)
    }

    SubShader
    {
        Tags { "RenderType"="Opaque" }
        LOD 100

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma multi_compile_instancing
            #include "UnityCG.cginc"

            struct appdata
            {
                float4 vertex : POSITION;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            struct v2f
            {
                float4 vertex : SV_POSITION;
                UNITY_VERTEX_INPUT_INSTANCE_ID // 使用这个在 fragment shader 中访问实例属性
            };

            UNITY_INSTANCING_BUFFER_START(Props)
                UNITY_DEFINE_INSTANCED_PROP(float4, _Color)
            UNITY_INSTANCING_BUFFER_END(Props)

            v2f vert(appdata v)
            {
                v2f o;

                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_TRANSFER_INSTANCE_ID(v, o);
                o.vertex = UnityObjectToClipPos(v.vertex);
                return o;
            }

            fixed4 frag(v2f i) : SV_Target
            {
                UNITY_SETUP_INSTANCE_ID(i);
                return UNITY_ACCESS_INSTANCED_PROP(Props, _Color);
            }
            ENDCG
        }
    }
}
```

### 运行时更改每实例数据示例

以下示例演示如何使用 `MaterialPropertyBlock` 对象在运行时为一组 GameObject 设置每实例数据。它将上述着色器示例中的 `_Color` 属性设置为随机颜色。

**重要**：`MaterialPropertyBlocks` 会破坏 SRP Batcher 兼容性。

```cs
using UnityEngine;

public class MaterialPropertyBlockExample : MonoBehaviour
{
    public GameObject[] objects;

    void Start()
    {
        MaterialPropertyBlock props = new MaterialPropertyBlock();
        MeshRenderer renderer;

        foreach (GameObject obj in objects)
        {
            float r = Random.Range(0.0f, 1.0f);
            float g = Random.Range(0.0f, 1.0f);
            float b = Random.Range(0.0f, 1.0f);
            props.SetColor("_Color", new Color(r, g, b));

            renderer = obj.GetComponent<MeshRenderer>();
            renderer.SetPropertyBlock(props);
        }
    }
}
```
