# GPU 实例化

GPU instancing is a [draw call optimization](https://docs.unity3d.com/cn/current/Manual/optimizing-draw-calls.html) method that renders multiple copies of a mesh with the same material in a single draw call. Each copy of the mesh is called an instance. This is useful for drawing things that appear multiple times in a scene, for example, trees or bushes.

GPU instancing renders identical meshes in the same draw call. To add variation and reduce the appearance of repetition, each instance can have different properties, such as **Color** or **Scale**. Draw calls that render multiple instances appear in the [Frame Debugger](https://docs.unity3d.com/cn/current/Manual/FrameDebugger.html) as **Draw Mesh (instanced)**.

## Requirements and compatibility

This section includes information about the platform, render pipeline, and SRP Batcher compatibility of GPU instancing.

**Platform compatibility**

GPU instancing is available on every platform except WebGL 1.0.

**Render pipeline compatibility**

| **功能**           | **内置渲染管线** | **通用渲染管线 (URP)** | **高清渲染管线 (HDRP)** | **Custom Scriptable Render Pipeline (SRP)** |
| :----------------- | :--------------- | :--------------------- | :---------------------- | :------------------------------------------ |
| **GPU instancing** | 是               | 是 (1)                 | 是 (1)                  | 是 (1)                                      |

> (1) Only if the shader isn’t compatible with the [SRP Batcher](https://docs.unity3d.com/cn/current/Manual/SRPBatcher.html).

**SRP Batcher**

GPU instancing isn’t compatible with the [SRP Batcher](https://docs.unity3d.com/cn/current/Manual/SRPBatcher.html). The SRP Batcher takes priority over GPU instancing. If a GameObject is compatible with the SRP Batcher, Unity uses the SRP Batcher to render it, not GPU instancing. For more information about optimization method priority, see [Optimization priority](https://docs.unity3d.com/cn/current/Manual/optimizing-draw-calls.html#optimization-priority).

If your project uses the SRP Batcher and you want to use GPU instancing for a GameObject, you can do one of the following:

* Use [Graphics.DrawMeshInstanced](https://docs.unity3d.com/cn/current/ScriptReference/Graphics.DrawMeshInstanced.html). This API bypasses the use of GameObjects and uses the specified parameters to directly draw a mesh on screen.
* Manually remove SRP Batcher compatibility. For information on how to do this, see [Intentionally removing compatibility](https://docs.unity3d.com/cn/current/Manual/SRPBatcher.html#intentionally-removing-compatibility).

## Using GPU instancing

Unity uses GPU instancing for GameObjects that share the same mesh and material. To instance a mesh and material:

* The material’s [shader](https://docs.unity3d.com/cn/current/Manual/Shaders.html) must support GPU instancing. Unity’s [Standard Shader](https://docs.unity3d.com/cn/current/Manual/shader-StandardShader.html) supports GPU instancing, as do all [surface shaders](https://docs.unity3d.com/cn/current/Manual/SL-SurfaceShaders.html). To add GPU instancing support to any other shader, see [Creating shaders that support GPU instancing](https://docs.unity3d.com/cn/current/Manual/gpu-instancing-shader.html).
* The mesh must come from one of the following sources, grouped by behavior:
    * A [MeshRenderer](https://docs.unity3d.com/cn/current/Manual/class-MeshRenderer.html) component or a [Graphics.RenderMesh](https://docs.unity3d.com/cn/current/ScriptReference/Graphics.RenderMesh.html) call.  
        Behavior: Unity adds these meshes to a list and then checks to see which meshes it can instance.  
        Unity does not support GPU instancing for [SkinnedMeshRenderers](https://docs.unity3d.com/cn/current/Manual/class-SkinnedMeshRenderer.html) or MeshRenderer components attached to GameObjects that are SRP Batcher compatible. For more information, see [SRP Batcher compatibility](#srp-batcher).
    * A [Graphics.RenderMeshInstanced](https://docs.unity3d.com/cn/current/ScriptReference/Graphics.RenderMeshInstanced.html) or [Graphics.RenderMeshIndirect](https://docs.unity3d.com/cn/current/ScriptReference/Graphics.RenderMeshIndirect.html) call. hese methods render the same mesh multiple times using the same shader. Each call to these methods issues a separate draw call. Unity does not merge these draw calls.

To use GPU instancing for a material, select the **Enable GPU Instancing** option in the Inspector.

![](https:/docs.unity3d.com/cn/current/uploads/Main/enable-gpu-instancing-inspector.png)
> The Enable GPU Instancing option as it appears in the material Inspector.

### Lighting

GPU instancing supports Unity’s [Baked Global Illumination system](https://docs.unity3d.com/cn/current/Manual/GI-Enlighten.html). Unity Standard Shaders and surface shaders support GPU instancing and Unity’s Baked Global Illumination system by default.

Each GPU instance supports global illumination from one of the following sources:

* Any number of [Light Probes](https://docs.unity3d.com/cn/current/Manual/LightProbes.html).
* One [lightmap](https://docs.unity3d.com/cn/current/Manual/Lightmapping.html).  
    **Note**: An instance can use multiple atlas regions in the lightmap.
* One [Light Probe Proxy Volume](https://docs.unity3d.com/cn/current/Manual/class-LightProbeProxyVolume.html)(LPPV) component.  
    **Note**: You must bake the LPPV for the space volume that contains all the instances.

GPU instancing automatically works with:

* Dynamic [Mesh Renderers](https://docs.unity3d.com/cn/current/Manual/class-MeshRenderer.html) affected by Light Probes.
* Static Mesh Renderers you bake to the same lightmap texture. A Mesh Renderer is static in this context if it includes **Contribute GI** in its [Static Editor Flags](https://docs.unity3d.com/cn/current/Manual/StaticObjects.html).

To enable Light Probe rendering for `Graphics.DrawMeshInstanced`, set the [LightProbeUsage](https://docs.unity3d.com/cn/current/ScriptReference/Rendering.LightProbeUsage.html) parameter to [CustomProvided](https://docs.unity3d.com/cn/current/ScriptReference/Rendering.LightProbeUsage.CustomProvided.html) and provide a [MaterialPropertyBlock](https://docs.unity3d.com/cn/current/ScriptReference/MaterialPropertyBlock.html) that includes the Probe data. For more information and code examples, see [LightProbes.CalculateInterpolatedLightAndOcclusionProbes](https://docs.unity3d.com/cn/current/ScriptReference/LightProbes.CalculateInterpolatedLightAndOcclusionProbes.html).

Alternatively, you can pass an LPPV component reference and [LightProbeUsage.UseProxyVolume](https://docs.unity3d.com/cn/current/ScriptReference/Rendering.LightProbeUsage.UseProxyVolume.html) to `Graphics.DrawMeshInstanced`. When you do this, all instances sample the volume for the [L0 and L1 bands](https://docs.unity3d.com/cn/current/Manual/LightProbes-TechnicalInformation.html) of the Light Probe data. If you want to supplement L2 data and occlusion data, use a `MaterialPropertyBlock`. For more information, see [Light Probes: Technical Information](https://docs.unity3d.com/cn/current/Manual/LightProbes-TechnicalInformation.html).

## Performance implications

Meshes that have a low number of vertices can’t be processed efficiently using GPU instancing because the GPU can’t distribute the work in a way that fully uses the GPU’s resources. This processing inefficiency can have a detrimental effect on performance. The threshold at which inefficiencies begin depends on the GPU, but as a general rule, don’t use GPU instancing for meshes that have fewer than 256 vertices.

If you want to render a mesh with a low number of vertices many times, best practice is to create a single buffer that contains all the mesh information and use that to draw the meshes.

## Creating shaders that support GPU instancing

This page contains information on how to add GPU instancing support to a custom Unity shader. It first explains the shader keywords, variables, and functions custom Unity shaders require to support GPU instancing. Then it includes examples of how to add per-instance data to both surface shaders and vertex/fragment shaders.

**Render pipeline compatibility**

| **功能** | **内置渲染管线** | **通用渲染管线 (URP)** | **高清渲染管线 (HDRP)** | **自定义可编程渲染管线(SRP)** |
| :------- | :--- | :--- | :--- | :--- |
| **Custom GPU instanced shaders** | 是 | 否 | 否 | 否 |

**Shader modifications**

This section contains information about shader additions that relate to GPU instancing.

| 添加 | 描述|
| :----- | :------- |
| `#pragma multi_compile_instancing` | Generates instancing variants. This is required for fragment and vertex shaders. It is optional for Surface Shaders. |
| `#pragma instancing_options` | Specifies options that Unity uses for instances. For information on the option switches available, see [`#pragma instancing_options`](#instancing_options-switches).|
| `UNITY_VERTEX_INPUT_INSTANCE_ID` | Defines an instance ID in the vertex shader input/output structure. To use this macro, enable the INSTANCING_ON shader keyword. Otherwise, Unity doesn’t set up the instance ID. <br> To access the instance ID, use `vertexInput.instanceID` inside an #ifdef INSTANCING_ON block. If you don’t use this block, variants fail to compile. |
| `UNITY_INSTANCING_BUFFER_START(bufferName)` | Declares the start of a per-instance constant buffer named `bufferName`. Use this macro with `UNITY_INSTANCING_BUFFER_END` to wrap declarations of the properties that you want to be unique to each instance. Declare properties inside the buffer using `UNITY_DEFINE_INSTANCED_PROP`. |
| `UNITY_INSTANCING_BUFFER_END(bufferName)` | Declares the end of a per-instance constant buffer named `bufferName`. Use this macro with `UNITY_INSTANCING_BUFFER_START` to wrap declarations of the properties that you want to be unique to each instance. Declare properties inside the buffer using `UNITY_DEFINE_INSTANCED_PROP`. |
| `UNITY_DEFINE_INSTANCED_PROP(type, propertyName)` | Defines a per-instance shader property with the specified type and name. In the examples below, the `_Color` property is unique. |
| `UNITY_SETUP_INSTANCE_ID(v);` | Allows shader functions to access the instance ID. For vertex shaders, this macro is required at the beginning. For fragment shaders, this addition is optional. For an example, see [Vertex and fragment shader](#vertex-and-fragment-shader). |
| `UNITY_TRANSFER_INSTANCE_ID(v, o);` | Copies the instance ID from the input structure to the output structure in the vertex shader. Use this macro if you need to access per-instance data in the fragment shader. |
| `UNITY_ACCESS_INSTANCED_PROP(bufferName, propertyName)` | Accesses a per-instance shader property in an instancing constant buffer. Unity uses the instance ID to index into the instance data array. `bufferName` must match the name of the constant buffer that contains the specified property. This macro compiles differently for INSTANCING_ON and non-instancing variants. |

When you use multiple per-instance properties, you don’t need to fill all of them in `MaterialPropertyBlock` objects. Also, if one instance lacks a property, Unity takes the default value from the referenced material. If the material doesn’t have a default value for the property, Unity sets the value to 0. Don’t put non-instanced properties in the `MaterialPropertyBlock`, because this disables instancing. Instead, create different materials for them.

**Instancing_options switches**

The [#pragma instancing_options](#pragma-instancing_options) directive can use the following switches:

| **开关** | **描述** |
| :---- | :--- |
| `forcemaxcount:batchSize` 和 `maxcount:batchSize` | On most platforms, Unity automatically calculates the instancing data array size. It divides the maximum constant buffer size on the target device with the size of the structure that contains all per-instance properties. Generally, you don’t need to worry about the batch size. However, some platforms require a fixed array size. To specify the batch size for those platforms, use the `maxcount` option. Other platforms ignore this option. If you want to force a batch size for all platforms, use `forcemaxcount`. This is useful when, for example, your project uses DrawMeshInstanced to issue draw calls with 256 instanced sprites. The default value for the two options is 500. |
| `assumeuniformscaling` | Instructs Unity to assume that all the instances have uniform scalings (the same scale for all X, Y, and Z axes).|
| `nolodfade` | Makes Unity not apply GPU instancing to [LOD](https://docs.unity3d.com/cn/current/Manual/LevelOfDetail.html) fade values. |
| `nolightprobe` | Prevents Unity from applying GPU instancing to [Light Probe](https://docs.unity3d.com/cn/current/Manual/LightProbes.html) values and their occlusion data. Setting this option to `ON` can improve performance if your project doesn’t contain GameObjects that use both GPU instancing and Light Probes. |
| `nolightmap` | Prevents Unity from applying GPU instancing to lightmap atlas information values. Setting this option to `ON` can improve performance if your project doesn’t contain GameObjects that use both GPU instancing and lightmaps. |
| `procedural:FunctionName` | Generates an additional variant for use with [Graphics.DrawMeshInstancedIndirect](https://docs.unity3d.com/cn/current/Manual/Graphics.DrawMeshInstancedIndirect).At the beginning of the vertex shader stage, Unity calls the function specified after the colon. To set up the instance data manually, add per-instance data to this function in the same way you would normally add per-instance data to a shader. Unity also calls this function at the beginning of a fragment shader if any of the fetched instance properties are included in the fragment shader. |

### Using shader variants with GPU instancing

Unity generates Surface shaders with instancing [variants](https://docs.unity3d.com/cn/current/Manual/SL-MultipleProgramVariants.html) by default, unless you specify `noinstancing` in the `#pragma` directive. Unity ignores uses of #pragma multi\_compile\_instancing in a surface shader.

Unity’s Standard and StandardSpecular shaders have instancing support by default, but with no per-instance properties other than the transform.

If your scene contains no GameObjects with GPU instancing enabled, then Unity strips instancing shader variants. To override the stripping behaviour:

1. Open Project Settings (menu: **Edit** > **Project Settings**).
2. Go to **Graphics**.
3. In the **Shader Stripping** section, set **Instancing Variants** to **Keep All**.

### Adding per-instance properties to GPU instancing shaders

By default, Unity GPU instances GameObjects with different [Transforms](https://docs.unity3d.com/cn/current/Manual/class-Transform.html) in each instanced draw call. To add more variation to the instances, modify the shader to add per-instance properties such as color. You can do this both in surface shaders and in vertex/fragment shaders.

Custom shaders don’t need per-instance data, but they do require an instance ID because world matrices need one to function correctly. Surface shaders automatically set up an instance ID, but custom vertex and fragment shaders don’t. To set up the ID for custom vertex and fragment shaders, use `UNITY_SETUP_INSTANCE_ID` at the beginning of the shader. For an example of how to do this, see [Vertex and fragment shader](#vertex-and-fragment-shader).

When you declare an instanced property, Unity gathers all the property values from the MaterialPropertyBlock objects set on GameObjects into a single draw call. For an example of how to use MaterialPropertyBlock objects to set per-instance data at runtime, see [Changing per-instance data at runtime](#changing-per-instanced-data-at-runtime).

When adding per-instance data to multi-pass shaders, keep the following in mind:

* If a multi-pass shader has more than two passes, Unity only instances the first pass. This is because Unity renders later passes together for each object, which forces material changes.
* If you use the Forward rendering path in the Built-in Render Pipeline, Unity can’t efficiently instance objects that are affected by multiple lights. Unity can only use instancing effectively for the base pass, not for additional passes. For more information about lighting passes, see documentation on [Forward Rendering and Pass Tags](https://docs.unity3d.com/cn/current/Manual/RenderTech-ForwardRendering.html).

### Surface shader example

The following example demonstrates how to create an instanced Surface Shader with different color values for each instance.

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

### Vertex and fragment shader example

The following example demonstrates how to create an instanced vertex and fragment shader with different color values for each instance. Unlike the surface shader, when you create the vertex and fragment shader you must use UNITY\_SETUP\_INSTANCE\_ID to manually set up an instance ID.

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
                UNITY_VERTEX_INPUT_INSTANCE_ID // use this to access instanced properties in the fragment shader.
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

### Changing per-instance data at runtime example

The following example demonstrates how to use MaterialPropertyBlock objects to set per-instance data for a group of GameObjects at runtime. It sets the `_Color` property from the above shader examples to a random color.

**Important**: MaterialPropertyBlocks break SRP Batcher compatibility. For more information, see [GPU instancing: Requirements and Compatibility](https://docs.unity3d.com/cn/current/Manual/GPUInstancing.html#requirements-and-compatibility).

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