---
created: 2025-05-05T 21:21:05
tags: []
source: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html
author: Unity Technologies
---

# Assembly definitions

Assembly Definitions and Assembly References are assets that you can create to organize your **scripts** into assemblies.

An assembly is a C# code library that contains the compiled classes and structs that are defined by your scripts and which also define references to other assemblies. See [Assemblies in .NET] for general information about assemblies in C#.

By default, Unity compiles almost all of your game scripts into the _predefined_ assembly, _Assembly-CSharp.dll_. (Unity also creates a [few smaller, specialized predefined assemblies].)

This arrangement works acceptably for small projects, but has some drawbacks as you add more code to your project:

* Every time you change one script, Unity has to recompile all the other scripts, increasing overall compilation time for iterative code changes.
* Any script can directly access types defined in any other script, which can make it more difficult to refactor and improve your code.
* All scripts are compiled for all platforms.

By defining assemblies, you can organize your code to promote modularity and reusability. Scripts in the assemblies you define for your project are no longer added to the default assemblies and can only access scripts in those other assemblies that you designate.

![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/ScriptCompilation.png)

The above diagram illustrates how you might split up the code in your project into multiple assemblies. Because _Main_ references _Stuff_ and not the other way around, you know that any changes to the code in _Main_ cannot affect the code in _Stuff_. Similarly, because _Library_ doesn’t depend on any other assemblies, you can more easily reuse the code in _Library_ in another project.

This section discusses how to create and set up Assembly Definition and Assembly Reference assets to define assemblies for your project:

* [Defining assemblies]
* [References and dependencies]
* [Creating an Assembly Definition asset]
* [Creating an Assembly Definition Reference asset]
* [Creating a platform-specific assembly]
* [Creating an assembly for Editor code]
* [Creating a test assembly]
* [Referencing another assembly]
* [Referencing a precompiled, plugin assembly]
* [Conditionally building an assembly]
* [Defining symbols based on project packages]
* [Finding which assembly a script belongs to]
* [Special folders]
* [Getting assembly information in build scripts]

See also:

* [Assembly Definition properties]
* [Assembly Definition Reference properties]
* [Assembly Definition File Format]

## Defining assemblies

To organize your project code into assemblies, create a folder for each desired assembly and move the scripts that should belong to each assembly into the relevant folder. Then [create Assembly Definition assets] to specify the assembly properties.

Unity takes all of the scripts in a folder that contains an Assembly Definition asset and compiles them into an assembly, using the name and other settings defined by the asset. Unity also includes scripts in any child folders in the same assembly, unless the child folder has its own Assembly Definition or Assembly Reference asset.

To include scripts from a non-child folder in an existing assembly, create an Assembly Reference asset in the non-child folder and set it to reference the Assembly Definition asset that defines the target assembly. For example, you can combine the scripts from all the Editor folders in your project in their own assembly, no matter where those folders are located.

Unity compiles assemblies in an order determined by their dependencies; you cannot specify the order in which compilation takes place.

## References and dependencies

When one type (such as a class or struct) uses another type, the first type is _dependent_ on the second. When Unity compiles a script, it must also have access to any types or other code the script depends upon. Likewise, when the compiled code runs, it must have access to the compiled versions of its dependencies. If two types are in different assemblies, an assembly containing a dependent type must declare a _reference_ to the assembly containing the type upon which it depends.

You can control the references between assemblies used in your project using the options of an Assembly Definition. The Assembly Definition settings include:

* [Auto Referenced] – Whether the predefined assemblies reference the assembly
* [Assembly Definition References] – References to other project assemblies created with Assembly Definitions
* [Override References] + [Assembly References] – References to precompiled (plugin) assemblies
* [No Engine References] – References to UnityEngine assemblies

**Note:** Classes in assemblies created with an Assembly Definition cannot use types defined in the predefined assemblies.

### Default references

By default, the predefined assemblies reference all other assemblies, including those created with Assembly Definitions (1) and precompiled assemblies added to the project as plugins (2). In addition, assemblies you create with an Assembly Definition asset automatically reference all precompiled assemblies (3):

![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/AssemblyDependencies.png)

In the default setup, classes in the predefined assemblies can use all types defined by any other assemblies in the project. Likewise, assemblies you create with an Assembly Definition asset can use all types defined in any precompiled (plug-in) assemblies.

You can prevent an assembly from being referenced by the predefined assemblies by turning off the [Auto Referenced option] in the Inspector for an Assembly Definition asset. Turning off auto-referenced means that the predefined assemblies are not recompiled when you change code in the assembly, but also means that the predefined assemblies cannot use code in this assembly directly. See [Assembly Definition properties].

Likewise, you can prevent a plugin assembly from being automatically referenced by turning off the [Auto Referenced property] in the [Plugin Inspector] for a plugin asset. This affects both predefined assemblies and those you create with an Assembly Definition. For more information, see [Plugin Inspector].

When you turn off **Auto Referenced** for a **plug-in**, you can explicitly reference it in the Inspector for an Assembly Definition asset. Enable the asset’s [Override References] option and add a reference to the **plug-in**. See [Assembly Definition properties].

**Note:** You cannot declare explicit references for the precompiled assemblies. The predefined assemblies can only use code in auto-referenced assemblies.

### Cyclical references

A cyclical assembly reference exists when one assembly references a second assembly that, in turn, references the first assembly. Such cyclical references between assemblies are not allowed and are reported as an error with the message, “Assembly with cyclic references detected.”

Typically, such cyclical references between assemblies occur because of cyclical references within the classes defined in the assemblies. While there is nothing technically invalid about cyclical references between classes in the same assembly, cyclical references between classes in different assemblies are not allowed. If you encounter a cyclical reference error, you must refactor your code to remove the cyclical reference or to put the mutually referencing classes in the same assembly.

## Creating an Assembly Definition asset

To create an Assembly Definition asset:

1. In the **Project** window, locate the folder containing the scripts you want to include in the assembly.
2. Create an Assembly Definition asset in the folder (menu: **Assets** > **Create** > **Assembly Definition**).
3. Assign a name to the asset. By default, the assembly file uses the name you assign to the asset, but you can change the name in the **Inspector** window.

Unity recompiles the scripts in the project to create the new assembly. Once it has finished, you can change the settings for the new Assembly Definition.

The scripts in the folder containing the Assembly Definition, including scripts in any child folders (unless those folders contain their own Assembly Definition or Reference assets), are compiled into the new assembly and removed from their previous assembly.

## Creating an Assembly Definition Reference asset

To create an Assembly Definition Reference asset:

1. In the **Project** window, locate the folder containing the scripts you want to include in the referenced assembly.

2. Create an Assembly Reference asset in the folder (menu: **Assets** > **Create** > **Assembly Definition Reference**).

3. Assign a name to the asset.

    Unity recompiles the scripts in the project to create the new assembly. Once it has finished, you can change the settings for the new Assembly Definition Reference.

4. Select the new Assembly Definition Reference asset to view its properties in the **Inspector**.

    ![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/asmdef-2.png)

5. Set the Assembly Definition property to reference the target Assembly Definition asset.

6. Click **Apply**.


The scripts in the folder containing the Assembly Definition Reference asset, including scripts in any child folders (unless those folders contain their own Assembly Definition or Reference assets) are compiled into the referenced assembly and removed from their previous assembly.

## Creating a platform-specific assembly

To create an assembly for a specific platform:

1. [Create an Assembly Definition asset].

2. Select the new Assembly Definition Reference asset to view its properties in the **Inspector**.

    ![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/asmdef-3.png)

3. Check the **Any Platform** option and choose specific platforms to exclude. Alternately, you can uncheck Any Platform and choose specific platforms to include.

4. Click **Apply**.

The assembly will be included (or excluded) according to the selected platforms when you build your project for a platform.

## Creating an assembly for Editor code

Editor assemblies allow you to put your Editor scripts anywhere in the project, not just in top-level folders named, _Editor_.

To create an assembly that contains the Editor code in your project:

1. [Create a platform-specific assembly] in a folder containing your Editor scripts.
2. Include ONLY the Editor platform.
3. If you have additional folders containing Editor scripts, [create Assembly Definition Reference assets] in those folders and set them to reference this Assembly Definition.

## Creating a test assembly

Test assemblies allow you to write tests and run them with the Unity TestRunner, while also keeping your test code separate from the code you ship with your application. Unity provides the TestRunner as part of the [Test Framework package]. See the [Test Framework documentation] for instructions on installing the Test Framework package and creating test assemblies.

## Referencing another assembly

To use the C# types and functions that are part of another assembly, you must create a reference to that assembly in the Assembly Definition asset.

To create an assembly reference:

1. Select the Assembly Definition for the assembly that requires the reference to view its properties in the **Inspector**.

2. In the **Assembly Definition References** section, click the **+** button to add a new reference.

    ![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/asmdef-4.png)

3. Assign the Assembly Definition asset to the newly created slot in the list of references.

Enabling the **Use GUIDs** option allows you to change the filename of the referenced Assembly Definition asset without updating references in other Assembly Definitions to reflect the new name. (Note that GUIDs must be reset if the metadata files for the asset files are deleted or you move the files outside the Unity Editor without also moving the metadata files along with them.)

## Referencing a precompiled, plugin assembly

By default, all assemblies in your project created with Assembly Definitions automatically reference all precompiled assemblies. These automatic references mean that Unity must recompile all your assemblies when you update any one of the precompiled assemblies, even if the code in the assembly is not used. To avoid this extra overhead, you can override the automatic references and specify references to only those precompiled libraries the assembly actually uses:

1. Select the Assembly Definition for the assembly that requires the reference to view its properties in the **Inspector**.

2. In the **General** section, enable the **Override References** option.

    ![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/asmdef-5.png)

    The **Assembly References** section of the **Inspector** becomes available when **Override References** is checked.

3. In the **Assembly References** section, click the **+** button to add a new reference.

4. Use the drop-down list in the empty slot to assign a reference to a precompiled assembly. The list shows all the precompiled assemblies in the project for the platform currently set in the project [Build Settings]. (Set the platform compatibility for a precompiled assembly in the [Plugin Inspector].)

    ![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/asmdef-6.png)

5. Click **Apply**.

6. Repeat for each platform for which you build your project.

## Conditionally including an assembly

You can use preprocessor symbols to control whether an assembly is compiled and included in builds of your game or application (including play mode in the Editor). You can specify which symbols must be defined for an assembly to be used with the **Define Constraints** list in the Assembly Definition options:

1. Select the Assembly Definition for the assembly to view its properties in the **Inspector**.

2. In the **Define Constraints** section, click the **+** button to add a new symbol to the list of constraints.

    ![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/asmdef-7.png)

3. Enter the symbol name.

    You can “negate” the symbol by putting an exclamation point in front of the name. For example, the constraint, `!UNITY_WEBGL` would include the assembly when UNITY\_WEBGL was NOT defined.

4. Click **Apply**.


You can use the following symbols as constraints:

* Symbols defined in the [Scripting Define Symbols] setting, which you can find in the **Player** section of your **Project Settings**. Note that the **Scripting Define Symbols** apply to the platform currently set in your project [Build Settings]. To define a symbol for multiple platforms, you must switch to each platform and modify the **Scripting Define Symbols** field individually.
* Symbols defined by Unity. See [Platform dependent compilation].
* Symbols defined using the [Version Defines] section of the Assembly Definition asset.

Symbols defined in scripts are not considered when determining if a constraint has been satisfied.

See [Define Constraints] for additional information.

## Defining symbols based on Unity and project package versions

If you need to compile different code in an assembly according to whether a project uses specific versions of Unity or of a package, you can add entries to the **Version Defines** list. This list specifies rules for when a symbol should be defined. For version numbers, you can specify a logical expression that evaluates to a specific version or a range of versions.

To conditionally define a symbol:

1. Select the Assembly Definition asset for the assembly to view its properties in the **Inspector**.

2. In the **Version Defines** section, click the **+** button to add an entry to the list.

3. Set the properties:

    * **Resource**: choose **Unity** or the package or module that must be installed in order for this symbol to be defined
    * **Define**: the symbol name
    * **Expression**: an expression that evaluates to a specific version or a range of versions. See [Version Define Expressions] for the rules.

    The **Expression outcome** shows which versions the expression evaluates to. If the outcome displays, **Invalid**, then expression syntax is incorrect.

    The following example defines the symbol, USE\_TIMELINE\_1\_3, if the project uses Timeline 1.3 and defines, USE\_NEW\_APIS, if the project is opened in Unity 2021.2.0a7, or later:

    ![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/asmdef-8.png)

4. Click **Apply**.

Symbols defined in the Assembly Definition are only in scope for the scripts in the assembly created for that definition.

Note that you can use the symbols defined using the **Version Defines** list as **Define Constraints**. Thus you could specify that an assembly should only be used when specific versions of a given package are also installed in the project.

### Version Define expressions

You can use expressions to specify an exact version or a range of versions. A **Version Define** expression uses mathematical range notation.

A square bracket, “\[\]” designates that the range includes the endpoint:

> `[1.3,3.4.1]` evaluates to `1.3.0 <= x <= 3.4.1`

A parenthesis “()” designates that the range excludes the endpoint:

> `(1.3.0,3.4)` evaluates to `1.3.0 < x < 3.4.0`

You can mix both range types in a single expression:

> `[1.1,3.4)` evaluates to `1.1.0 <= x < 3.4.0`
>
> `(0.2.4,5.6.2-preview.2]` evaluates to `0.2.4 < x <= 5.6.2.-preview.2`

You can use a single version designator in square brackets to designate an exact version:

> `[2.4.5]` evaluates to `x = 2.4.5`

As a shortcut, you can enter a single version without range brackets to indicate that the expression includes that version or later:

> `2.1.0-preview.7` evaluates to `x >= 2.1.0-preview.7`

**Note:** No spaces are allowed in an expression. No wildcard characters are supported.

### Unity version numbers

Current versions of Unity (and all versions that support Assembly Definitions) use a version designator with three parts: MAJOR.MINOR.REVISION, for example, `2017.4.25f1`, `2018.4.29f1`, and `2019.4.7f1`.

* The MAJOR version is the target release year, such as 2017 or 2021.
* The MINOR version is the target release quarter, such as 1, 2, 3, or 4.
* The REVISION designator has three parts of its own, with the format: RRzNN, where:
    * RR is a one or two digit revision number
    * z is a letter designating the release type:
        * a = alpha release
        * b = beta release
        * f = a normal public release
        * c = China release version (equivalent to f)
        * p = patch release
        * x = experimental release
    * NN is one or two digit incremental number

Release type designators are compared as follows:

> `a < b < f = c < p < x`

In other words, an alpha release is considered earlier than a beta, which is earlier than a normal (f) or China (c) release. A patch release is always later than a normal or China release with the same revision number and an experimental release is later than any other release type. Note that experimental releases do not use an incremental number at the end.

Unity version numbers are allowed to have a suffix after the REVISION component, such as `2019.3.0f11-Sunflower`. Any suffixes are ignored for the purpose of comparing versions.

As an example, the following expression includes any 2017 or 2018 version of Unity, but not any version in 2019 or later:

```
[2017,2019)
```

### Package and module version numbers

Package and module version designators have four parts, following the [Semantic Versioning] format: MAJOR.MINOR.PATCH-LABEL. The first three parts are always numbers, but the label is a string. Unity packages in preview use the string, `preview` or `preview.n`, where `n > 0`. See [Package Versioning] for more information about package version numbers.

For example, the following expression includes all versions of a package with MAJOR.MINOR versions between 3.2 and 6.1 (inclusive):

```
[3.2,6.1]
```

## Finding which assembly a script belongs to

To identify which assembly one of your C# scripts is compiled into:

1. Select the C# script file in the Unity **Project** window to view its properties in the **Inspector** window.

2. The assembly filename and the Assembly Definition, if one exists, are shown in the **Assembly Information** section of the **Inspector**.

    ![](https://docs.unity3d.com/2021.3/Documentation/uploads/Main/asmdef-9.png)


In this example, the selected script is compiled into the library file, Unity.Timeline.Editor.dll, which is defined by the Unity.Timeline.Editor Assembly Definition asset.

## Special folders

Unity treats scripts in folders with certain, special names differently than scripts in other folders. However, one of these folders loses its special treatment when you create an Assembly Definition asset inside it or in a folder above it. You might notice this change when you use Editor folders, which might be scattered throughout your Project (depending on how you organize your code and on the [Asset Store packages] you use).

Unity normally compiles any scripts in folders named Editor into the predefined Assembly-CSharp-Editor assembly no matter where those scripts are located. However, if you create an Assembly Definition asset in a folder that has an Editor folder underneath it, Unity no longer puts those Editor scripts into the predefined Editor assembly. Instead, they go into the new assembly created by your Assembly Definition — where they might not belong. To manage Editor folders, you can create Assembly Definition or Reference assets in each Editor folder to place those scripts in one or more Editor assemblies. See [Creating an assembly for Editor code].

## Setting assembly attributes

You can use assembly attributes to set metadata properties for your assemblies. By convention, assembly attribute statements are typically put in a file named AssemblyInfo.cs.

For example, the following assembly attributes specify a few [.NET assembly metadata values], an [InternalsVisibleTo] attribute, which can be useful for testing, and the Unity-defined [Preserve attribute] that affects how unused code is removed from an assembly when you build your project:

```cs
[assembly: System.Reflection.AssemblyCompany("Bee Corp.")]
[assembly: System.Reflection.AssemblyTitle("Bee's Assembly")]
[assembly: System.Reflection.AssemblyCopyright("Copyright 2020.")]
[assembly: System.Runtime.CompilerServices.InternalsVisibleTo("UnitTestAssembly")]
[assembly: UnityEngine.Scripting.Preserve]
```

## Getting assembly information in build scripts

Use the CompilationPipeline class, in the UnityEditor.Compilation namespace, to retrieve information about all assemblies built by Unity for a project, including those created based on Assembly Definition assets.

For example, the following script uses the CompilationPipeline class to list all the current Player assemblies in a project:

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
[Assembly Definition File Format]: https://docs.unity3d.com/2021.3/Documentation/Manual/AssemblyDefinitionFileFormat.html
[Assembly Definition properties]: https://docs.unity3d.com/2021.3/Documentation/Manual/class-AssemblyDefinitionImporter.html
[Assembly Definition Reference properties]: https://docs.unity3d.com/2021.3/Documentation/Manual/class-AssemblyDefinitionImporter.html#assembly-definition-reference-properties
[Assembly Definition References]: https://docs.unity3d.com/2021.3/Documentation/Manual/class-AssemblyDefinitionReferenceImporter.html
[Assembly References]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#reference-another-assembly
[Asset Store packages]: https://docs.unity3d.com/2021.3/Documentation/Manual/AssetStorePackages.html
[Auto Referenced option]: https://docs.unity3d.com/2021.3/Documentation/Manual/class-AssemblyDefinitionImporter.html#general
[Auto Referenced property]: https://docs.unity3d.com/2021.3/Documentation/Manual/PluginInspector.html
[Auto Referenced]: https://docs.unity3d.com/2021.3/Documentation/Manual/class-AssemblyDefinitionImporter.html#general
[Build Settings]: https://docs.unity3d.com/2021.3/Documentation/Manual/BuildSettings.html
[Conditionally building an assembly]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#conditional-assembly
[Create a platform-specific assembly]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#create-platform-specific
[Create an Assembly Definition asset]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#create-asmdef
[create Assembly Definition assets]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#create-asmdef
[create Assembly Definition Reference assets]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#create-asmref
[Creating a platform-specific assembly]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#create-platform-specific
[Creating a test assembly]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#create-test-assembly
[Creating an Assembly Definition asset]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#create-asmdef
[Creating an Assembly Definition Reference asset]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#create-asmref
[Creating an assembly for Editor code]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#create-editor-assembly
[Define Constraints]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#define-constraints
[Defining assemblies]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#defining-assemblies
[Defining symbols based on project packages]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#define-symbols
[few smaller, specialized predefined assemblies]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompileOrderFolders.html
[Finding which assembly a script belongs to]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#find-assembly
[Getting assembly information in build scripts]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#get-assembly-info
[InternalsVisibleTo]: https://docs.microsoft.com/en-us/dotnet/api/system.runtime.compilerservices.internalsvisibletoattribute?view=netcore-2.0
[No Engine References]: https://docs.unity3d.com/2021.3/Documentation/Manual/class-AssemblyDefinitionImporter.html#general
[Override References]: https://docs.unity3d.com/2021.3/Documentation/Manual/class-AssemblyDefinitionImporter.html#general
[Package Versioning]: https://docs.unity3d.com/2021.3/Documentation/Manual/upm-semver.html
[Platform dependent compilation]: https://docs.unity3d.com/2021.3/Documentation/Manual/PlatformDependentCompilation.html
[Plugin Inspector]: https://docs.unity3d.com/2021.3/Documentation/Manual/PluginInspector.html
[Preserve attribute]: https://docs.unity3d.com/2021.3/Documentation/Manual/ManagedCodeStripping.html#PreserveAttribute
[References and dependencies]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#reference-and-assemblies
[Referencing a precompiled, plugin assembly]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#reference-precompiled-assembly
[Referencing another assembly]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#reference-another-assembly
[Scripting Define Symbols]: https://docs.unity3d.com/2021.3/Documentation/Manual/class-PlayerSettingsStandalone.html#Configuration
[Semantic Versioning]: https://semver.org/
[Special folders]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#special-folders
[Test Framework documentation]: https://docs.unity3d.com/Packages/com.unity.test-framework@latest?subfolder=/manual/workflow-create-test-assembly.html
[Test Framework package]: https://docs.unity3d.com/Manual/com.unity.test-framework.html
[Version Define Expressions]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#version-define-expressions
[Version Defines]: https://docs.unity3d.com/2021.3/Documentation/Manual/ScriptCompilationAssemblyDefinitionFiles.html#define-symbols