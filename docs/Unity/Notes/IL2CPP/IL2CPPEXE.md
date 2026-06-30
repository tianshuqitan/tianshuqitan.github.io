# il2cpp.exe

**IL2CPP 的 AOT 编译器**，完全用 C# 编写而成，位于 `Unity安装目录/Editor/Data/il2cpp/build/deploy` 下。`il2cpp.exe` 工具接收由 Unity 附带的 Mono 编译器编译的托管程序集，并生成 C++ 代码，随后我们将这些代码交由特定平台的 C++ 编译器处理。

![xxx](https://unity.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2Ffuvbjjlp%2Fproduction%2Fded15e6b264038ede83d176ec6c982c84d19652c-800x300.png&w=828&q=75)

```
PS .\il2cpp.exe -help

Options:
  --convert-to-cpp                                Convert the provided assemblies to C++
  --compile-cpp                                   Compile generated C++ code
  --convert-in-graph                              Use this to run the conversion in a bee graph for fast 0 change builds
  --assembly=<path,path,..>                       One or more paths to assemblies to convert
  --directory=<path,path,..>                      One or more directories containing assemblies to convert
  --extra-types-file=<path,path,..>               One or more files containing a list of additonal generic instance types that should be included in the generated code
  --generatedcppdir=<path>                        The directory where generated C++ code is written
  --symbols-folder=<path>                         The directory where symbol information will be written
  --debug-assembly-name=<value,value,..>          The name of an assembly (including .dll) to emit debug information for.  If this is provided, debug information from all others will be ignored.
  --additional-cpp=<path,path,..>                 Additional C++ files to include
  --enable-analytics                              Enables collection of analytics
  --emit-null-checks                              Enables generation of null checks
  --enable-stacktrace                             Enables generation of stacktrace sentries in C++ code at the start of every managed method. This enables support for stacktraces for platforms that do not have system APIs to walk the stack (for example, one such platform is WebGL)
  --enable-stats                                  Enables conversion statistics
  --enable-array-bounds-check                     Enables generation of array bounds checks
  --enable-divide-by-zero-check                   Enables generation of divide by zero checks
  --emit-comments                                 Annotations to the generated code will be emitted as comments
  --assembly-method=<value>                       String to match the name of method(s) to show the assembly output for
  --disable-generic-sharing                       Disables generic sharing
  --maximum-recursive-generic-depth=<value>       Set the maximum depth to implement recursive generic methods. The default value is 7.
  --generic-virtual-method-iterations=<value>     Set the maximum number of times to iterate looking for generic virtual methods. The default value is 1.
  --code-generation-option=<value>                Specify an option related to code generation
  --file-generation-option=<value>                Specify an option related to file output
  --generics-option=<value>                       Specify an option related to generics
  --feature=<value>                               Enable a feature of il2cpp
  --diagnostic-option=<value>                     Enable a diagnostic ability
  --stats-output-dir=<path>                       The directory where statistics information will be written
  --outputpath=<value>                            Path to output the compiled binary
  --dont-deploy-baselib                           il2cpp will not use it's own baselib
  --verbose                                       Enables verbose output from tools involved in building
  --forcerebuild                                  Forces a rebuild
  --disable-bee-builder                           Disable bee builder and use old buildcode
  --libil2cpp-static                              Links il2cpp as library to the executable
  --disable-runtime-lumping                       Disable lumping for the runtime library
  --libil2cpp-cache-directory=<value>             Cache directory to use when building libil2cpp as dynamic link library
  --assembly-output                               Enables assembly code output from the C++ compiler
  --additional-defines=<value,value,..>           Defines for generated C++ code compilation
  --additional-libraries=<value,value,..>         One or more additional libraries to link to generated code
  --additional-include-directories=<path,path,..> One or more additional include directories
  --additional-link-directories=<path,path,..>    One or more additional link directories
  --plugin=<value,value,..>                       Path to an il2cpp plugin assembly
  --target-is-simulator                           Flag denoting if the compilation target is a simulator.
  --incremental-g-c-time-slice=<value>            Enable incremental GC if n > 0, with a maximum time slice of n ms.
  --relative-data-path=<value>                    Optional. Specifies path of IL2CPP data directory relative to deployed application working directory.
  --configuration=<value>                         The build configuration.  Debug|Release
  --treat-warnings-as-errors                      Enables warnings as errors for compiling generated C++ code
  --compiler-flags=<value,value,..>               Additional flags to pass to the C++ compiler
  --linker-flags=<value,value,..>                 Additional flags to pass to the linker
  --linker-flags-file=<value>                     Additional file that contains flags to pass to the linker
  --build-package-for-testing                     Instruct to build an application package that can be used for testing
  --generate-usym-file                            Generate a symbol file for stacktrace line numbers
  --enable-tiny-diagnostics                       Adds features for helping to debug dots-runtime generated code, such as type IDs
  --tiny-explain-static-constructors              Enables additional comments in StaticConstructors.cpp with extra information about dependencies. Tiny only
  --enable-reload                                 Enable code to allow the runtime to be shutdown and reloaded (this has code size and runtime performance impact).
  --cachedirectory=<path>                         A directory to use for caching compilation related files
  --profiler-report                               Enable generation of a profiler report
  --profiler-output-file=<value>                  The location where to write the profiler output
  --data-folder=<path>                            The directory where non-source code data will be written
  --jobs=<value>                                  The number of cores to use during conversion and compilation.  Defaults to processor count
```

## 示例

新建项目(Unity2022.3.62f2)，更改后端为 IL2CPP(`Project Settings > Other Settings > Scripting Backend > IL2CPP`)，新建自定义脚本，构建项目。

[IL2CPP 代码转换示例](./IL2CPP_Sample.md)

## 手动执行

使用 `il2cpp.exe` 手动将托管程序集(DLL)转换为 `C++` 代码。

查看 Unity 构建日志(`%USER%\AppData\Local\Unity\Editor\Editor.log`)，搜索 `il2cpp.exe` 相关内容进行参考和学习。

```
D:\XXX\Unity\Editor\2022.3.62f2\Editor\Data\il2cpp\build\deploy\il2cpp.exe
--convert-to-cpp
--assembly=Library/Bee/artifacts/WinPlayerBuildProgram/ManagedStripped/Assembly-CSharp.dll
--assembly=Library/Bee/artifacts/WinPlayerBuildProgram/ManagedStripped/Mono.Security.dll
--assembly=Library/Bee/artifacts/WinPlayerBuildProgram/ManagedStripped/mscorlib.dll
--assembly=Library/Bee/artifacts/WinPlayerBuildProgram/ManagedStripped/System.Core.dll
--assembly=Library/Bee/artifacts/WinPlayerBuildProgram/ManagedStripped/System.dll
--assembly=Library/Bee/artifacts/WinPlayerBuildProgram/ManagedStripped/UnityEngine.dll
// 省略其他 --assembly=
--generatedcppdir=D:/XXX/HybridCLR_Learning/Library/Bee/artifacts/WinPlayerBuildProgram/il2cppOutput/cpp
--symbols-folder=D:/XXX/HybridCLR_Learning/Library/Bee/artifacts/WinPlayerBuildProgram/il2cppOutput/cpp/Symbols
--enable-analytics
--emit-null-checks
--enable-array-bounds-check
--dotnetprofile=unityaot-win32
--profiler-report
--profiler-output-file=D:/XXX/HybridCLR_Learning/Library/Bee/artifacts/il2cpp_conv_35dz.traceevents
--print-command-line
--data-folder=D:/XXX/HybridCLR_Learning/Library/Bee/artifacts/WinPlayerBuildProgram/il2cppOutput/data
```

在项目执行构建后，在 `构建目录\Il2CppOutputProject\IL2CPP\build\deploy` 目录下，执行 `il2cpp.exe`
> dotnetprofile 可选项: `net45`, `net6.0`, `unityaot-linux`, `unityaot-macos`, `unityaot-win32`, `unityjit`, `unitytiny`

```
.\il2cpp.exe --convert-to-cpp --generatedcppdir="F:/Projects/IL2CPP_Output" --emit-null-checks --enable-array-bounds-check --dotnetprofile=unityaot-win32 --enable-debugger --directory="F:/Projects/HybridCLR_Learning/Build/HybridCLR_Learning/Managed"
```

**参数说明**

`--emit-null-checks`

如果启用此选项，则 IL2CPP 生成的 C++ 代码将包含 null 检查，并根据需要抛出托管的 `NullReferenceException` 异常。如果禁用此选项，则 IL2CPP 不会将 null 检查放入生成的 C++ 代码中。对于某些项目，禁用此选项可能会提高运行时性能。

```cpp
RaycastResultU5BU5D_tEAF6B3C3088179304676571328CBB001D8CECBC7* L_4 = V_0;
// 如果启用，则 IL2CPP 生成的 C++ 代码会插入该代码
NullCheck(L_4);
```

禁用此设置后，Unity 不会阻止尝试访问生成的代码中的 null 值，这可能会导致出现不正确的行为。应用程序在取消引用 null 值后不久可能会崩溃。Unity 建议不要禁用此选项。

`--enable-array-bounds-check`

如果启用此选项，则 IL2CPP 生成的 C++ 代码将包含数组边界检查，并根据需要抛出托管的 `IndexOutOfRangeException` 异常。如果禁用此选项，则 IL2CPP 不会将数组边界检查放入生成的 C++ 代码中。

```cpp
// 不启用
BaseRaycaster_t7DC8158FD3CA0193455344379DD5FF7CD5F1F832* L_9 = (L_6)->GetAtUnchecked(static_cast<il2cpp_array_size_t>(L_8));
// 启用
BaseRaycaster_t7DC8158FD3CA0193455344379DD5FF7CD5F1F832* L_9 = (L_6)->GetAt(static_cast<il2cpp_array_size_t>(L_8));
```

对于某些项目，禁用此选项可能会提高运行时性能。但是，当禁用此选项时，Unity 不会阻止在生成的代码中对具有无效索引的数组的任何访问，这并可能导致不正确的行为，包括读取或写入任意内存位置。在大多数情况下，这些内存访问在发生时不会表现出任何直接副作用，可能会悄无声息破坏应用程序状态。这可能会使调试这些错误变得极为困难。Unity 建议保持启用此选项。

`--enable-divide-by-zero-check`

如果启用此选项，则 IL2CPP 生成的 C++ 代码将包含整数除法的除以零检查，并根据需要抛出托管的 `DivideByZeroException` 异常。如果禁用此选项，则 IL2CPP 不会将整数除法的除以零检查放入生成的 C++ 代码中。

```cpp
int32_t L_170 = V_29;
int32_t L_171 = V_7;
// 开启选项后多出
DivideByZeroCheck(L_171);
V_30 = ((int32_t)(L_170/L_171));
int32_t L_172 = V_29;
int32_t L_173 = V_7;
// 开启选项后多出
DivideByZeroCheck(L_173);
V_31 = ((int32_t)(L_172%L_173));
```

这些检查会影响运行时的性能。仅当需要运行除以零检查时，才应启用此选项；否则，应禁用此选项。

`--enable-debugger`

```cpp
// 开启
IL2CPP_EXTERN_C IL2CPP_METHOD_ATTR void GameMain_Start_m128EADA89BF74187CCBEC757AEC0B6AC29B7C197 (GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948* __this, const RuntimeMethod* method) 
{
  static bool s_Il2CppMethodInitialized;
  if (!s_Il2CppMethodInitialized)
  {
    il2cpp_codegen_initialize_runtime_metadata((uintptr_t*)&GameMain_Start_m128EADA89BF74187CCBEC757AEC0B6AC29B7C197_RuntimeMethod_var);
    il2cpp_codegen_initialize_runtime_metadata((uintptr_t*)&GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948_0_0_0_var);
    s_Il2CppMethodInitialized = true;
  }
  DECLARE_METHOD_THIS(methodExecutionContextThis, (&__this));
  DECLARE_METHOD_EXEC_CTX(methodExecutionContext, GameMain_Start_m128EADA89BF74187CCBEC757AEC0B6AC29B7C197_RuntimeMethod_var, methodExecutionContextThis, NULL, NULL);
  CHECK_METHOD_ENTRY_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 0));
  CHECK_METHOD_EXIT_SEQ_POINT(methodExitChecker, methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 1));
  {
    CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 2));
    CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 3));
    STORE_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 4));
    GameMain_TestLoop_mC7B58CEC3D6B2812BA138F4CCFADDDDFA4A89243(__this, NULL);
    CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 4));
    CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 5));
    return;
  }
}

// 关闭
IL2CPP_EXTERN_C IL2CPP_METHOD_ATTR void GameMain_Start_m128EADA89BF74187CCBEC757AEC0B6AC29B7C197 (GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948* __this, const RuntimeMethod* method) 
{
  {
    GameMain_TestLoop_mC7B58CEC3D6B2812BA138F4CCFADDDDFA4A89243(__this, NULL);
    return;
  }
}
```

**其他参数**

* `--print-command-line` 打印命令
* `--profiler-report` 生成 `profile.json`
* `--enable-analytics` 生成 `analytics.json`

## 托管代码映射 C++ 代码

对于托管代码中的每个类型，il2cpp.exe 都会为该类型生成一个结构体。如：

```cpp UnityEngine.CoreModule__1.cpp
struct Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2 
{
  float ___x;
  float ___y;
  float ___z;
};
```

> 类型(Types) 以 `_t` + 一串数字命名。

**对于静态变量**

```cpp UnityEngine.CoreModule__1.cpp
struct Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2_StaticFields
{
  Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2 ___zeroVector;
  Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2 ___oneVector;
  Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2 ___upVector;
  Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2 ___downVector;
  Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2 ___leftVector;
  Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2 ___rightVector;
  Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2 ___forwardVector;
  Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2 ___backVector;
  Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2 ___positiveInfinityVector;
  Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2 ___negativeInfinityVector;
};

// 静态变量获取
IL2CPP_EXTERN_C IL2CPP_METHOD_ATTR Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2 Vector3_get_zero_m0C1249C3F25B1C70EAD3CC8B31259975A457AE39 (const RuntimeMethod* method) 
{
	static bool s_Il2CppMethodInitialized;
	if (!s_Il2CppMethodInitialized)
	{
		il2cpp_codegen_initialize_runtime_metadata((uintptr_t*)&Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2_il2cpp_TypeInfo_var);
		s_Il2CppMethodInitialized = true;
	}
	Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2 V_0;
	memset((&V_0), 0, sizeof(V_0));
	{
    // il2cpp_codegen_static_fields_for 是 libil2cpp 中的函数, 其实就是返回 Il2CppClass 的 static_fields
		Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2 L_0 = ((Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2_StaticFields*)il2cpp_codegen_static_fields_for(Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2_il2cpp_TypeInfo_var))->___zeroVector;
		V_0 = L_0;
		goto IL_0009;
	}

IL_0009:
	{
		Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2 L_1 = V_0;
		return L_1;
	}
}
```

**对于方法**

> 所有方法都是 free functions，第一个参数是 __this。每一个方法都有一个额外的 `RuntimeMethod* method` 参数，该参数包含方法的元数据(metadata)，可用于 virtual 方法调用。

```cpp UnityEngine.CoreModule__1.cpp
IL2CPP_EXTERN_C IL2CPP_METHOD_ATTR float Vector3_get_sqrMagnitude_m43C27DEC47C4811FB30AB474FF2131A963B66FC8 (Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2* __this, const RuntimeMethod* method) 
{
  float V_0 = 0.0f;
  {
    float L_0 = __this->___x;
    float L_1 = __this->___x;
    float L_2 = __this->___y;
    float L_3 = __this->___y;
    float L_4 = __this->___z;
    float L_5 = __this->___z;
    V_0 = ((float)il2cpp_codegen_add(((float)il2cpp_codegen_add(((float)il2cpp_codegen_multiply(L_0, L_1)), ((float)il2cpp_codegen_multiply(L_2, L_3)))), ((float)il2cpp_codegen_multiply(L_4, L_5))));
    goto IL_002d;
  }

IL_002d:
  {
    float L_6 = V_0;
    return L_6;
  }
}

IL2CPP_EXTERN_C  float Vector3_get_sqrMagnitude_m43C27DEC47C4811FB30AB474FF2131A963B66FC8_AdjustorThunk (RuntimeObject* __this, const RuntimeMethod* method)
{
  Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2* _thisAdjusted;
  int32_t _offset = 1;
  _thisAdjusted = reinterpret_cast<Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2*>(__this + _offset);
  float _returnValue;
  _returnValue = Vector3_get_sqrMagnitude_m43C27DEC47C4811FB30AB474FF2131A963B66FC8_inline(_thisAdjusted, method);
  return _returnValue;
}

IL2CPP_MANAGED_FORCE_INLINE IL2CPP_METHOD_ATTR float Vector3_get_sqrMagnitude_m43C27DEC47C4811FB30AB474FF2131A963B66FC8_inline (Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2* __this, const RuntimeMethod* method) 
{
  float V_0 = 0.0f;
  {
    float L_0 = __this->___x;
    float L_1 = __this->___x;
    float L_2 = __this->___y;
    float L_3 = __this->___y;
    float L_4 = __this->___z;
    float L_5 = __this->___z;
    V_0 = ((float)il2cpp_codegen_add(((float)il2cpp_codegen_add(((float)il2cpp_codegen_multiply(L_0, L_1)), ((float)il2cpp_codegen_multiply(L_2, L_3)))), ((float)il2cpp_codegen_multiply(L_4, L_5))));
    goto IL_002d;
  }

IL_002d:
  {
    float L_6 = V_0;
    return L_6;
  }
}
```

实例方法 `ToString`

```cpp
IL2CPP_EXTERN_C IL2CPP_METHOD_ATTR String_t* Vector3_ToString_m6C24B9F0382D25D75B05C606E127CD14660574EE (Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2* __this, const RuntimeMethod* method) 
{
  String_t* V_0 = NULL;
  {
    String_t* L_0;
    L_0 = Vector3_ToString_mA8DA39B6324392BB93203A4D4CB85AF87231CB62_inline(__this, (String_t*)NULL, (RuntimeObject*)NULL, NULL);
    V_0 = L_0;
    goto IL_000c;
  }

IL_000c:
  {
    String_t* L_1 = V_0;
    return L_1;
  }
}

IL2CPP_MANAGED_FORCE_INLINE IL2CPP_METHOD_ATTR String_t* Vector3_ToString_mA8DA39B6324392BB93203A4D4CB85AF87231CB62_inline (Vector3_t24C512C7B96BBABAD472002D0BA2BDA40A5A80B2* __this, String_t* ___0_format, RuntimeObject* ___1_formatProvider, const RuntimeMethod* method) 
{
  static bool s_Il2CppMethodInitialized;
  if (!s_Il2CppMethodInitialized)
  {
    il2cpp_codegen_initialize_runtime_metadata((uintptr_t*)&CultureInfo_t9BA817D41AD55AC8BD07480DD8AC22F8FFA378E0_il2cpp_TypeInfo_var);
    il2cpp_codegen_initialize_runtime_metadata((uintptr_t*)&ObjectU5BU5D_t8061030B0A12A55D5AD8652A20C922FE99450918_il2cpp_TypeInfo_var);
    il2cpp_codegen_initialize_runtime_metadata((uintptr_t*)&_stringLiteral2409165FB90CD4A8B916FCA75790766B82C91748);
    il2cpp_codegen_initialize_runtime_metadata((uintptr_t*)&_stringLiteral3F3FD3EFA55E39E450A9A4CE66CD7B259403D44E);
    s_Il2CppMethodInitialized = true;
  }
  bool V_0 = false;
  bool V_1 = false;
  String_t* V_2 = NULL;
  {
    String_t* L_0 = ___0_format;
    bool L_1;
    L_1 = String_IsNullOrEmpty_mEA9E3FB005AC28FE02E69FCF95A7B8456192B478(L_0, NULL);
    V_0 = L_1;
    bool L_2 = V_0;
    if (!L_2)
    {
      goto IL_0012;
    }
  }
  {
    ___0_format = _stringLiteral2409165FB90CD4A8B916FCA75790766B82C91748;
  }

IL_0012:
  {
    RuntimeObject* L_3 = ___1_formatProvider;
    V_1 = (bool)((((RuntimeObject*)(RuntimeObject*)L_3) == ((RuntimeObject*)(RuntimeObject*)NULL))? 1 : 0);
    bool L_4 = V_1;
    if (!L_4)
    {
      goto IL_0026;
    }
  }
  {
    il2cpp_codegen_runtime_class_init_inline(CultureInfo_t9BA817D41AD55AC8BD07480DD8AC22F8FFA378E0_il2cpp_TypeInfo_var);
    CultureInfo_t9BA817D41AD55AC8BD07480DD8AC22F8FFA378E0* L_5;
    L_5 = CultureInfo_get_InvariantCulture_mD1E96DC845E34B10F78CB744B0CB5D7D63CEB1E6(NULL);
    NullCheck(L_5);
    NumberFormatInfo_t8E26808B202927FEBF9064FCFEEA4D6E076E6472* L_6;
    L_6 = VirtualFuncInvoker0< NumberFormatInfo_t8E26808B202927FEBF9064FCFEEA4D6E076E6472* >::Invoke(14, L_5);
    ___1_formatProvider = L_6;
  }

IL_0026:
  {
    // 创建一个 System.Object[] 数组, 大小为 3
    ObjectU5BU5D_t8061030B0A12A55D5AD8652A20C922FE99450918* L_7 = (ObjectU5BU5D_t8061030B0A12A55D5AD8652A20C922FE99450918*)(ObjectU5BU5D_t8061030B0A12A55D5AD8652A20C922FE99450918*)SZArrayNew(ObjectU5BU5D_t8061030B0A12A55D5AD8652A20C922FE99450918_il2cpp_TypeInfo_var, (uint32_t)3);

    // ============处理 X============
    ObjectU5BU5D_t8061030B0A12A55D5AD8652A20C922FE99450918* L_8 = L_7;
    float* L_9 = (float*)(&__this->___x);
    String_t* L_10 = ___0_format;
    RuntimeObject* L_11 = ___1_formatProvider;
    String_t* L_12;
    // X 转为字符串
    L_12 = Single_ToString_mF468A56B3A746EFD805E0604EE7A2873DA157ADE(L_9, L_10, L_11, NULL);
    // 空值检查(--emit-null-checks)
    NullCheck(L_8);
    // 元素类型检查
    ArrayElementTypeCheck (L_8, L_12);
    // X 字符串加入数组
    (L_8)->SetAt(static_cast<il2cpp_array_size_t>(0), (RuntimeObject*)L_12);
    // ============处理 Y============
    ObjectU5BU5D_t8061030B0A12A55D5AD8652A20C922FE99450918* L_13 = L_8;
    float* L_14 = (float*)(&__this->___y);
    String_t* L_15 = ___0_format;
    RuntimeObject* L_16 = ___1_formatProvider;
    String_t* L_17;
    L_17 = Single_ToString_mF468A56B3A746EFD805E0604EE7A2873DA157ADE(L_14, L_15, L_16, NULL);
    NullCheck(L_13);
    ArrayElementTypeCheck (L_13, L_17);
    (L_13)->SetAt(static_cast<il2cpp_array_size_t>(1), (RuntimeObject*)L_17);
    // ============处理 Z============
    ObjectU5BU5D_t8061030B0A12A55D5AD8652A20C922FE99450918* L_18 = L_13;
    float* L_19 = (float*)(&__this->___z);
    String_t* L_20 = ___0_format;
    RuntimeObject* L_21 = ___1_formatProvider;
    String_t* L_22;
    L_22 = Single_ToString_mF468A56B3A746EFD805E0604EE7A2873DA157ADE(L_19, L_20, L_21, NULL);
    NullCheck(L_18);
    ArrayElementTypeCheck (L_18, L_22);
    (L_18)->SetAt(static_cast<il2cpp_array_size_t>(2), (RuntimeObject*)L_22);
    // UnityString_Format
    String_t* L_23;
    L_23 = UnityString_Format_m98A0629641086A1BE20BBF7F4EADDE3FE3877D85(_stringLiteral3F3FD3EFA55E39E450A9A4CE66CD7B259403D44E, L_18, NULL);
    V_2 = L_23;
    goto IL_0069;
  }

IL_0069:
  {
    String_t* L_24 = V_2;
    return L_24;
  }
}
```

> 方法(Methods) 以 `_m` + 一串数字命名。

## 异常

托管异常会被转为 C++ 异常，当 il2cpp.exe 需要生成代码来引发托管异常时，它会调用 `IL2CPP_RAISE_MANAGED_EXCEPTION` 抛出异常。

```cpp
IL2CPP_EXTERN_C IL2CPP_METHOD_ATTR void ManagedStreamHelpers_ValidateLoadFromStream_mF6E14BAD1BC52711F99076381E5A57DA650B4C1A (Stream_tF844051B786E8F7F4244DBD218D74E8617B9A2DE* ___0_stream, const RuntimeMethod* method) 
{
	bool V_0 = false;
	bool V_1 = false;
	bool V_2 = false;
	{
		Stream_tF844051B786E8F7F4244DBD218D74E8617B9A2DE* L_0 = ___0_stream;
		V_0 = (bool)((((RuntimeObject*)(Stream_tF844051B786E8F7F4244DBD218D74E8617B9A2DE*)L_0) == ((RuntimeObject*)(RuntimeObject*)NULL))? 1 : 0);
		bool L_1 = V_0;
		if (!L_1)
		{
			goto IL_0019;
		}
	}
	{
    // 异常分支
		ArgumentNullException_t327031E412FAB2351B0022DD5DAD47E67E597129* L_2 = (ArgumentNullException_t327031E412FAB2351B0022DD5DAD47E67E597129*)il2cpp_codegen_object_new(((RuntimeClass*)il2cpp_codegen_initialize_runtime_metadata_inline((uintptr_t*)&ArgumentNullException_t327031E412FAB2351B0022DD5DAD47E67E597129_il2cpp_TypeInfo_var)));
		ArgumentNullException__ctor_m6D9C7B47EA708382838B264BA02EBB7576DFA155(L_2, ((String_t*)il2cpp_codegen_initialize_runtime_metadata_inline((uintptr_t*)&_stringLiteral7C527C571BCCF5DF8ADCF7BF9EED0FE0DC9AF069)), ((String_t*)il2cpp_codegen_initialize_runtime_metadata_inline((uintptr_t*)&_stringLiteralF7E6C53D86D8ADC0DB8EFC0A2CD9877CC8BC9914)), NULL);
		IL2CPP_RAISE_MANAGED_EXCEPTION(L_2, ((RuntimeMethod*)il2cpp_codegen_initialize_runtime_metadata_inline((uintptr_t*)&ManagedStreamHelpers_ValidateLoadFromStream_mF6E14BAD1BC52711F99076381E5A57DA650B4C1A_RuntimeMethod_var)));
	}

IL_0019:
	{
		Stream_tF844051B786E8F7F4244DBD218D74E8617B9A2DE* L_3 = ___0_stream;
		NullCheck(L_3);
		bool L_4;
		L_4 = VirtualFuncInvoker0< bool >::Invoke(7, L_3);
		V_1 = (bool)((((int32_t)L_4) == ((int32_t)0))? 1 : 0);
		bool L_5 = V_1;
		if (!L_5)
		{
			goto IL_0036;
		}
	}
	{
		ArgumentException_tAD90411542A20A9C72D5CDA3A84181D8B947A263* L_6 = (ArgumentException_tAD90411542A20A9C72D5CDA3A84181D8B947A263*)il2cpp_codegen_object_new(((RuntimeClass*)il2cpp_codegen_initialize_runtime_metadata_inline((uintptr_t*)&ArgumentException_tAD90411542A20A9C72D5CDA3A84181D8B947A263_il2cpp_TypeInfo_var)));
		ArgumentException__ctor_m8F9D40CE19D19B698A70F9A258640EB52DB39B62(L_6, ((String_t*)il2cpp_codegen_initialize_runtime_metadata_inline((uintptr_t*)&_stringLiteralD6B4B2A0E6284497D6C035D6CC8503F491C92098)), ((String_t*)il2cpp_codegen_initialize_runtime_metadata_inline((uintptr_t*)&_stringLiteralF7E6C53D86D8ADC0DB8EFC0A2CD9877CC8BC9914)), NULL);
		IL2CPP_RAISE_MANAGED_EXCEPTION(L_6, ((RuntimeMethod*)il2cpp_codegen_initialize_runtime_metadata_inline((uintptr_t*)&ManagedStreamHelpers_ValidateLoadFromStream_mF6E14BAD1BC52711F99076381E5A57DA650B4C1A_RuntimeMethod_var)));
	}

IL_0036:
	{
		Stream_tF844051B786E8F7F4244DBD218D74E8617B9A2DE* L_7 = ___0_stream;
		NullCheck(L_7);
		bool L_8;
		L_8 = VirtualFuncInvoker0< bool >::Invoke(8, L_7);
		V_2 = (bool)((((int32_t)L_8) == ((int32_t)0))? 1 : 0);
		bool L_9 = V_2;
		if (!L_9)
		{
			goto IL_0053;
		}
	}
	{
		ArgumentException_tAD90411542A20A9C72D5CDA3A84181D8B947A263* L_10 = (ArgumentException_tAD90411542A20A9C72D5CDA3A84181D8B947A263*)il2cpp_codegen_object_new(((RuntimeClass*)il2cpp_codegen_initialize_runtime_metadata_inline((uintptr_t*)&ArgumentException_tAD90411542A20A9C72D5CDA3A84181D8B947A263_il2cpp_TypeInfo_var)));
		ArgumentException__ctor_m8F9D40CE19D19B698A70F9A258640EB52DB39B62(L_10, ((String_t*)il2cpp_codegen_initialize_runtime_metadata_inline((uintptr_t*)&_stringLiteralAD3DDCBBB6118D9DAC3520876EC8EA0BCBCD6C23)), ((String_t*)il2cpp_codegen_initialize_runtime_metadata_inline((uintptr_t*)&_stringLiteralF7E6C53D86D8ADC0DB8EFC0A2CD9877CC8BC9914)), NULL);
		IL2CPP_RAISE_MANAGED_EXCEPTION(L_10, ((RuntimeMethod*)il2cpp_codegen_initialize_runtime_metadata_inline((uintptr_t*)&ManagedStreamHelpers_ValidateLoadFromStream_mF6E14BAD1BC52711F99076381E5A57DA650B4C1A_RuntimeMethod_var)));
	}

IL_0053:
	{
		return;
	}
}
```

## 一些其他问题

il2cpp 是根据 IL 代码生成的 C++ 代码，并没使用中间抽象语法树(AST)，导致部分生成代码(一段for循环的代码)是没有必要的。

```cpp
int32_t L_5 = V_0;
V_1 = (bool)((((int32_t)L_5) < ((int32_t)((int32_t)10)))? 1 : 0);
// L_6 是必要的
bool L_6 = V_1;
if (L_6)
{
  goto IL_0005;
}
```

## 其他

* [微软-Sysinternals实用工具](https://learn.microsoft.com/zh-cn/sysinternals/downloads/)