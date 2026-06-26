# IL2CPP 代码转换示例

`GameMain.cs`
```cs
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GameMain : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        TestLoop();
    }

    // Update is called once per frame
    void Update()
    {
    }

    void TestLoop()
    {
        for (var i = 0; i < 10; i++)
        {
            Debug.Log($"GameMain {i}");
        }
    }
}
```

构建项目后，可以在 `Library\Bee\artifacts\WinPlayerBuildProgram\il2cppOutput` 中找到生成的 C++ 文件和 global-metadata.dat。自定义脚本 `GameMain.cs` 相关函数默认在 Assembly-CSharp_CodeGen.c

**Assembly-CSharp_CodeGen.c** 方法指针表(注册入口)

```c
extern void GameMain_Start_m128EADA89BF74187CCBEC757AEC0B6AC29B7C197 (void);
extern void GameMain_Update_m7ED81796ECF2C8909D38F1800CD6AFCD391C737A (void);
extern void GameMain_TestLoop_mC7B58CEC3D6B2812BA138F4CCFADDDDFA4A89243 (void);
extern void GameMain__ctor_mE0880533CA5CFBF10929FEB37D0BDEBD9AFB8416 (void);
static Il2CppMethodPointer s_methodPointers[6] = 
{
	GameMain_Start_m128EADA89BF74187CCBEC757AEC0B6AC29B7C197,
	GameMain_Update_m7ED81796ECF2C8909D38F1800CD6AFCD391C737A,
	GameMain_TestLoop_mC7B58CEC3D6B2812BA138F4CCFADDDDFA4A89243,
	GameMain__ctor_mE0880533CA5CFBF10929FEB37D0BDEBD9AFB8416,
};

extern const Il2CppDebuggerMetadataRegistration g_DebuggerMetadataRegistrationAssemblyU2DCSharp;
IL2CPP_EXTERN_C const Il2CppCodeGenModule g_AssemblyU2DCSharp_CodeGenModule;
const Il2CppCodeGenModule g_AssemblyU2DCSharp_CodeGenModule = 
{
	"Assembly-CSharp.dll",
	6,
	s_methodPointers,
	0,
	NULL,
	s_InvokerIndices,
	0,
	NULL,
	0,
	NULL,
	0,
	NULL,
	&g_DebuggerMetadataRegistrationAssemblyU2DCSharp,
	NULL,
	NULL,
	NULL,
	NULL,
};
```

**Assembly-CSharp.cpp** 类型结构体定义 + 方法体实现

```cpp
struct GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948;

IL2CPP_EXTERN_C const RuntimeMethod* GameMain_Start_m128EADA89BF74187CCBEC757AEC0B6AC29B7C197_RuntimeMethod_var;
IL2CPP_EXTERN_C const RuntimeMethod* GameMain_TestLoop_mC7B58CEC3D6B2812BA138F4CCFADDDDFA4A89243_RuntimeMethod_var;
IL2CPP_EXTERN_C const RuntimeMethod* GameMain_Update_m7ED81796ECF2C8909D38F1800CD6AFCD391C737A_RuntimeMethod_var;
IL2CPP_EXTERN_C const RuntimeMethod* GameMain__ctor_mE0880533CA5CFBF10929FEB37D0BDEBD9AFB8416_RuntimeMethod_var;

IL2CPP_EXTERN_C const RuntimeType* GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948_0_0_0_var;

// GameMain 的 C++ 结构体
struct GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948  : public MonoBehaviour_t532A11E69716D348D8AA7F854AFCBFCB8AD17F71
{
};

IL2CPP_EXTERN_C IL2CPP_METHOD_ATTR void GameMain_TestLoop_mC7B58CEC3D6B2812BA138F4CCFADDDDFA4A89243 (GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948* __this, const RuntimeMethod* method) ;

// GameMain 类的方法都翻译为 void, 第一个参数为类型实例 __this, 第二个参数为方法元数据
IL2CPP_EXTERN_C IL2CPP_METHOD_ATTR void GameMain_Start_m128EADA89BF74187CCBEC757AEC0B6AC29B7C197 (GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948* __this, const RuntimeMethod* method) 
{
  // 懒加载, 元数据初始化
	static bool s_Il2CppMethodInitialized;
	if (!s_Il2CppMethodInitialized)
	{
    // 把占位索引解析为真正的方法或者类型对象, IL2CPP 延迟绑定
		il2cpp_codegen_initialize_runtime_metadata((uintptr_t*)&GameMain_Start_m128EADA89BF74187CCBEC757AEC0B6AC29B7C197_RuntimeMethod_var);
		il2cpp_codegen_initialize_runtime_metadata((uintptr_t*)&GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948_0_0_0_var);
		s_Il2CppMethodInitialized = true;
	}

  // DECLARE_METHOD_THIS/DECLARE_METHOD_EXEC_CTX/CHECK_METHOD_ENTRY_SEQ_POINT/CHECK_METHOD_EXIT_SEQ_POINT
  // 调试支持宏, 对应 C# 源码可断点位置
	DECLARE_METHOD_THIS(methodExecutionContextThis, (&__this));
	DECLARE_METHOD_EXEC_CTX(methodExecutionContext, GameMain_Start_m128EADA89BF74187CCBEC757AEC0B6AC29B7C197_RuntimeMethod_var, methodExecutionContextThis, NULL, NULL);
	CHECK_METHOD_ENTRY_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 0));
	CHECK_METHOD_EXIT_SEQ_POINT(methodExitChecker, methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 1));
	{
    // CHECK_SEQ_POINT/STORE_SEQ_POINT
    // 调试支持宏, 对应 C# 源码可断点位置
		CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 2));
		CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 3));
		STORE_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 4));
		GameMain_TestLoop_mC7B58CEC3D6B2812BA138F4CCFADDDDFA4A89243(__this, NULL);
		CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 4));
		CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 5));
		return;
	}
}

IL2CPP_EXTERN_C IL2CPP_METHOD_ATTR void GameMain_Update_m7ED81796ECF2C8909D38F1800CD6AFCD391C737A (GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948* __this, const RuntimeMethod* method) 
{
	static bool s_Il2CppMethodInitialized;
	if (!s_Il2CppMethodInitialized)
	{
		il2cpp_codegen_initialize_runtime_metadata((uintptr_t*)&GameMain_Update_m7ED81796ECF2C8909D38F1800CD6AFCD391C737A_RuntimeMethod_var);
		il2cpp_codegen_initialize_runtime_metadata((uintptr_t*)&GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948_0_0_0_var);
		s_Il2CppMethodInitialized = true;
	}
	DECLARE_METHOD_THIS(methodExecutionContextThis, (&__this));
	DECLARE_METHOD_EXEC_CTX(methodExecutionContext, GameMain_Update_m7ED81796ECF2C8909D38F1800CD6AFCD391C737A_RuntimeMethod_var, methodExecutionContextThis, NULL, NULL);
	CHECK_METHOD_ENTRY_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 6));
	CHECK_METHOD_EXIT_SEQ_POINT(methodExitChecker, methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 7));
	{
		CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 8));
		CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 9));
		return;
	}
}

/*
  TestLoop 函数的 IL 代码
  .method private hidebysig instance void
    TestLoop() cil managed
  {
    .maxstack 2
    .locals init (
      [0] int32 i,
      [1] bool V_1
    )

    // [19 5 - 19 6]
    IL_0000: nop

    // [20 14 - 20 23]
    IL_0001: ldc.i4.0
    IL_0002: stloc.0      // i

    IL_0003: br.s         IL_0021
    // start of loop, entry point: IL_0021

      // [21 9 - 21 10]
      IL_0005: nop

      // [22 13 - 22 40]
      IL_0006: ldstr        "GameMain {0}"
      IL_000b: ldloc.0      // i
      IL_000c: box          [mscorlib]System.Int32
      IL_0011: call         string [mscorlib]System.String::Format(string, object)
      IL_0016: call         void [UnityEngine.CoreModule]UnityEngine.Debug::Log(object)
      IL_001b: nop

      // [23 9 - 23 10]
      IL_001c: nop

      // [20 33 - 20 36]
      IL_001d: ldloc.0      // i
      IL_001e: ldc.i4.1
      IL_001f: add
      IL_0020: stloc.0      // i

      // [20 25 - 20 31]
      IL_0021: ldloc.0      // i
      IL_0022: ldc.i4.s     10 // 0x0a
      IL_0024: clt
      IL_0026: stloc.1      // V_1

      IL_0027: ldloc.1      // V_1
      IL_0028: brtrue.s     IL_0005
    // end of loop

    // [24 5 - 24 6]
    IL_002a: ret

  } // end of method GameMain::TestLoop
*/

IL2CPP_EXTERN_C IL2CPP_METHOD_ATTR void GameMain_TestLoop_mC7B58CEC3D6B2812BA138F4CCFADDDDFA4A89243 (GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948* __this, const RuntimeMethod* method) 
{
	static bool s_Il2CppMethodInitialized;
	if (!s_Il2CppMethodInitialized)
	{
		il2cpp_codegen_initialize_runtime_metadata((uintptr_t*)&Boolean_t09A6377A54BE2F9E6985A8149F19234FD7DDFE22_0_0_0_var);
		il2cpp_codegen_initialize_runtime_metadata((uintptr_t*)&Debug_t8394C7EEAECA3689C2C9B9DE9C7166D73596276F_il2cpp_TypeInfo_var);
		il2cpp_codegen_initialize_runtime_metadata((uintptr_t*)&GameMain_TestLoop_mC7B58CEC3D6B2812BA138F4CCFADDDDFA4A89243_RuntimeMethod_var);
		il2cpp_codegen_initialize_runtime_metadata((uintptr_t*)&GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948_0_0_0_var);
		il2cpp_codegen_initialize_runtime_metadata((uintptr_t*)&Int32_t680FF22E76F6EFAD4375103CBBFFA0421349384C_0_0_0_var);
		il2cpp_codegen_initialize_runtime_metadata((uintptr_t*)&Int32_t680FF22E76F6EFAD4375103CBBFFA0421349384C_il2cpp_TypeInfo_var);
		il2cpp_codegen_initialize_runtime_metadata((uintptr_t*)&_stringLiteral1A64263A456255453F477150F8F39E715F878FB9);
		s_Il2CppMethodInitialized = true;
	}
	int32_t V_0 = 0; // i
	bool V_1 = false; // 循环条件

  // 循环使用 goto + 标签实现
	DECLARE_METHOD_THIS(methodExecutionContextThis, (&__this));
	DECLARE_METHOD_LOCALS(methodExecutionContextLocals, (&V_0));
	DECLARE_METHOD_EXEC_CTX(methodExecutionContext, GameMain_TestLoop_mC7B58CEC3D6B2812BA138F4CCFADDDDFA4A89243_RuntimeMethod_var, methodExecutionContextThis, NULL, methodExecutionContextLocals);
	CHECK_METHOD_ENTRY_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 10));
	CHECK_METHOD_EXIT_SEQ_POINT(methodExitChecker, methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 11));
	{
		CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 12));
		CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 13));
		V_0 = 0;
		CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 14));
		goto IL_0021;
	}

// 循环体
IL_0005:
	{
		CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 15));
		CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 16));
		int32_t L_0 = V_0;
		int32_t L_1 = L_0;
    // i 装箱
		RuntimeObject* L_2 = Box(Int32_t680FF22E76F6EFAD4375103CBBFFA0421349384C_il2cpp_TypeInfo_var, &L_1);
		STORE_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 17));
		String_t* L_3;
    // string.Format
		L_3 = String_Format_mA8DBB4C2516B9723C5A41E6CB1E2FAF4BBE96DD8(_stringLiteral1A64263A456255453F477150F8F39E715F878FB9, L_2, NULL);
		CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 17));
		STORE_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 18));
    // Debug 类初始化
		il2cpp_codegen_runtime_class_init_inline(Debug_t8394C7EEAECA3689C2C9B9DE9C7166D73596276F_il2cpp_TypeInfo_var);
    // Debug.Log 方法
		Debug_Log_m87A9A3C761FF5C43ED8A53B16190A53D08F818BB(L_3, NULL);
		CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 18));
		CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 19));
		CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 20));
		int32_t L_4 = V_0;
		V_0 = ((int32_t)il2cpp_codegen_add(L_4, 1)); // i++
	}

// 条件判断
IL_0021:
	{
		CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 21));
		int32_t L_5 = V_0;
		V_1 = (bool)((((int32_t)L_5) < ((int32_t)((int32_t)10)))? 1 : 0);
		CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 22));
		bool L_6 = V_1;
		if (L_6)
		{
			goto IL_0005;
		}
	}
	{
		CHECK_SEQ_POINT(methodExecutionContext, (g_sequencePointsAssemblyU2DCSharp + 23));
		return;
	}
}

IL2CPP_EXTERN_C IL2CPP_METHOD_ATTR void GameMain__ctor_mE0880533CA5CFBF10929FEB37D0BDEBD9AFB8416 (GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948* __this, const RuntimeMethod* method) 
{
	static bool s_Il2CppMethodInitialized;
	if (!s_Il2CppMethodInitialized)
	{
		il2cpp_codegen_initialize_runtime_metadata((uintptr_t*)&GameMain__ctor_mE0880533CA5CFBF10929FEB37D0BDEBD9AFB8416_RuntimeMethod_var);
		s_Il2CppMethodInitialized = true;
	}
	DECLARE_METHOD_EXEC_CTX(methodExecutionContext, GameMain__ctor_mE0880533CA5CFBF10929FEB37D0BDEBD9AFB8416_RuntimeMethod_var, NULL, NULL, NULL);
	CHECK_PAUSE_POINT;
	{
    // 调用基类 MonoBehaviour 构造函数
		MonoBehaviour__ctor_m592DB0105CA0BC97AA1C5F4AD27B12D68A3B7C1E(__this, NULL);
		return;
	}
}
```

**Il2CppCCalculateTypeValues1.cpp** 类型大小计算

```cpp
struct GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948  : public MonoBehaviour_t532A11E69716D348D8AA7F854AFCBFCB8AD17F71
{
};

extern const Il2CppTypeDefinitionSizes g_typeDefinitionSize5563;
const Il2CppTypeDefinitionSizes g_typeDefinitionSize5563 = { sizeof(GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948), -1, 0, 0 };
```

**Il2CppMetadataUsage.c** 运行时元数据引用表

```c
// 每个元数据变量的初始值都是一个整数索引，而非真正的指针(占位)
RuntimeType* GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948_0_0_0_var = (RuntimeType*)(uintptr_t)1073759595;

RuntimeMethod* GameMain__ctor_mE0880533CA5CFBF10929FEB37D0BDEBD9AFB8416_RuntimeMethod_var = (RuntimeMethod*)(uintptr_t)1610703793;
RuntimeMethod* GameMain_Start_m128EADA89BF74187CCBEC757AEC0B6AC29B7C197_RuntimeMethod_var = (RuntimeMethod*)(uintptr_t)1610703787;
RuntimeMethod* GameMain_TestLoop_mC7B58CEC3D6B2812BA138F4CCFADDDDFA4A89243_RuntimeMethod_var = (RuntimeMethod*)(uintptr_t)1610703791;
RuntimeMethod* GameMain_Update_m7ED81796ECF2C8909D38F1800CD6AFCD391C737A_RuntimeMethod_var = (RuntimeMethod*)(uintptr_t)1610703789;

IL2CPP_EXTERN_C void** const g_MetadataUsages[];
void** const g_MetadataUsages[59951] = 
{
  (void**)&GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948_0_0_0_var,
  (void**)&GameMain__ctor_mE0880533CA5CFBF10929FEB37D0BDEBD9AFB8416_RuntimeMethod_var,
	(void**)&GameMain_Start_m128EADA89BF74187CCBEC757AEC0B6AC29B7C197_RuntimeMethod_var,
	(void**)&GameMain_TestLoop_mC7B58CEC3D6B2812BA138F4CCFADDDDFA4A89243_RuntimeMethod_var,
	(void**)&GameMain_Update_m7ED81796ECF2C8909D38F1800CD6AFCD391C737A_RuntimeMethod_var,
}
```

**Il2CppTypeDefinitions.c** 类型定义表

```c
// Il2CppType 描述类型的静态信息结构:
extern Il2CppType GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948_0_0_0;
Il2CppType GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948_0_0_0 = { (void*)5563, 0, IL2CPP_TYPE_CLASS, 0, 0, 0, 0 };

IL2CPP_EXTERN_C const Il2CppType* const  g_Il2CppTypeTable[];
const Il2CppType* const  g_Il2CppTypeTable[18412] = 
{
&GameMain_t53C63FF419D1F0D0EF823CBDF3A3BD052C50C948_0_0_0,
}
```

**说明**

* IL2CPP 对类型和方法都是用 `原名_后缀哈希` 的命名方式，哈希是全局唯一的标识符。类型后缀 `t`、方法后缀 `m`。