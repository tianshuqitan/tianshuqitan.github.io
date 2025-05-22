---
article: false
index: false
---

# 浅谈 Unity 内存管理(2019) - 高川

* [浅谈 Unity 内存管理 - Bilibili](https://www.bilibili.com/video/BV1aJ411t7N6)


## 1. 什么是内存

内存分为物理内存、虚拟内存。

**关于物理内存**

CPU 访问内存是一个慢速过程。

CPU 在需要访问内存时，先是访问自己的缓存(L1Cache、L2Cache……)，当全部 Miss 之后，CPU 会去主内存拿一段完整的指令到 CPU 的缓存中。因此，我们需要尽可能保证 CPU 的指令是连续的，防止 CPU 过多地与主内存之间的内存交换产生 IO。

Unity 为了处理上述问题，减少 Cache Miss ，推出了 ECS 和 DOTS，把分散的内存数据变成整块、连续的数据。

**关于虚拟内存**

电脑在物理内存不够的时候，操作系统会把一些不用的数据(DeadMemory)交换到硬盘上，称之为内存交换。

但是手机是不做内存交换的，一是因为移动设备的硬盘 IO 速度比 PC 慢很多，二是因为移动设备的硬盘可擦写次数更少；因此手机如果做内存交换一是慢，而是减少设备寿命看，所以 Android 机上没有做内存交换。IOS 可以把不活跃的内存进行压缩，使得实际可用的内存更多，而安卓没有这个能力。

:::tip
在 Android 上，存储器(Storage)不像在其他 Linux 实现上那样用于交换空间，因为频繁写入可能导致这种内存出现损耗，并缩短存储媒介的使用寿命。但是在 RAM 上有一小块 zRAM，zRAM 是用于交换空间的 RAM 分区。所有数据在放入 zRAM 时都会进行压缩，然后在从 zRAM 向外复制时进行解压缩。这部分 RAM 会随着页面进出 zRAM 而增大或缩小。设备制造商可以设置 zRAM 大小上限。[参考文章 - Android 进程间的内存分配](https://developer.android.com/topic/performance/memory-management?hl=zh-cn)。
:::

**关于移动设备和 PC**

移动设备(手机)与 PC 的区别在于，手机没有独立显卡、独立显存。手机上无论是 CPU 还是 GPU 都是共用一个缓存，而且手机的内存更小、缓存级数更少、大小更小。台式机的三级缓存大约 8~16M，而手机只有 2M。

综上，手机上的内存，不论从哪个角度看，都是比 PC 要小很多的。所以，手机上更容易出现内存不够的问题。

## 2. Android 内存管理

Android 是基于 Linux 开发的，所以 Android 的内存管理和 Linux 很相似。

Android 的内存管理基本单位是 Page(页)，一般是 4k 一个 Page。内存的回收和分配都是以 Page 为单位进行操作，也就是 4k。Android 内存分用户态和内核态两个部分，内核态的内存是用户严格不能访问的。

**低内存终止守护程序(Low Memory Killer(LMK))**

Android 有两种处理内存不足情况的主要机制：内核交换守护程序和低内存终止守护程序。

LMK 使用一个名为 oom_adj_score 的“内存不足”分值来确定正在运行的进程的优先级，以此决定要终止的进程。最高得分的进程最先被终止。后台应用最先被终止，系统进程最后被终止。下表列出了从高到低的 LMK 评分类别。评分最高的类别，即第一行中的项目将最先被终止：

![](./../Assets/lmk-process-order.svg)

:::caution 参考
* [低内存终止守护程序(Low Memory Killer(LMK)) - AndroidDevelopers](https://developer.android.com/topic/performance/vitals/lmk)
* [低内存终止守护程序 - AndroidSource](https://source.android.com/docs/core/perf/lmkd?hl=zh-cn)
:::

**内存指标**

常驻内存大小(Resident Set Size(Rss))：应用使用的共享和非共享页面(Page)的数量。
> 你当前的 APP 所应用到的所有内存。除了你自己的 APP 所使用的内存之外，你调用的各种服务、共用库所产生的内存都会统计到 RSS 之中。

按比例分摊的内存大小(Proportional Set Size(PSS))：应用使用的非共享页面的数量加上共享页面的均匀分摊数量(例如，如果三个进程共享 3 MB，每个进程的 PSS 为 1 MB)。
> 与 RSS 不同的是，PSS 会把公共库所使用的内存平摊到所有调用这个库的 APP 上。(可能你自己的应用没有申请很多内存，但是你的调用的某个公共库已经有了很大的内存分配，平摊下来就会导致你自己的 APP 的 PSS 虚高。)

独占内存大小(Unique Set Size(USS))：应用使用的非共享页面数量(不包括共享页面)
> 只有此 APP 所使用的内存，剔除掉公共库的内存分配。我们在实际工作中更多要做的是对 USS 的优化，有时也会注意一下 PSS。

:::caution 参考
* [Unity 中的内存管理之 Android 内存管理 - UnityLearn](./../Optimization/Unity%20 中的内存管理.md#android-内存管理-android-memory-management)
:::

## 3. Unity 内存

Unity 是一个 C++ 引擎，底层代码完全由 C++ 写成，通过 Wrapper 提供给用户 API。用户代码会转换为 CPP 代码(IL2CPP)。VM 仍然存在(IL2CPP VM)，VM 主要为了跨平台。

Unity 内存分为 Native Memory 和 Managed Memory (托管内存)。值得注意的是，在 Editor 下和在 Runtime 下 Unity 的内存分配是完全不同的。不但分配内存的大小会有不同，统计看到的内存大小不同，甚至是内存分配时机和方式也不同。

比如一个 AssetBundle，在编辑器下是你一打开 Unity 就开始加载进内存，而在 Runtime 下则是你使用时才会加载，如果不读取，是不会进内存的。(Unity2019 之后做了一些 Asset 导入优化，不使用的资源就不会导入)。因为 Editor 不注重 Runtime 的表现，更注重编辑器中编辑时的流畅。

但如果游戏庞大到几十个 G，如果第一次打开项目，会消耗很多时间，有的大的会几天，甚至到一周。

Unity 的内存还可以分为引擎管理的内存和用户管理器的内存两类。引擎管理的内存一般开发者是访问不到的，而用户管理的内存才是使用者需要关系和优先考虑的。

还有一个 Unity 监测不到的内存：用户分配的 Native 内存是 Unity 的 Profile 工具监测不到。例如:

* 自己写的 Native 插件(C++ 插件)， Unity 无法分析已经编译过的 C++ 是如何去分配和使用内存的。
* Lua 完全由自己管理内存，Unity 无法统计到内部的使用情况。

## 4. Native 内存

Unity 重载了所有分配内存的操作符(C++ alloc、new)，使用这些重载的时候，会需要一个额外的 Memory Label (Profiler-shaderlab-object-memory-detail-snapshot，里面的名字就是 label：指当前内存要分配到哪一个类型池里面)。

* 使用重载过的分配符去分配内存时，Allocator 会根据你的 memory label 分配到不同 Allocator 池里面，每个 Allocator 池 单独做自己的跟踪。因此当我们去 Runtime get memory label 下面的池时就可以问 Allocator，里面有多少东西 多少兆。
* Allocator 在 NewAsRoot (Memory  “island”(没听清)) 中生成。在这个 Memory Root 下面会有很多子内存：shader：当我们加载一个 Shader 进内存的时候，会生成一个 Shader 的 root。Shader 底下有很多数据：sub shader、Pass 等会作为 memory “island” (root) 的成员去依次分配。因此当我们最后统计 Runtime 的时候，我们会统计 Root，而不会统计成员，因为太多了没法统计。
* 因为是 C++ 的，因此当我们 delete、free 一个内存的时候会立刻返回内存给系统，与托管内存堆不一样。

### Scene

* Unity 是一个 C++ 引擎，所有实体最终都会反映在 C++ 上，而不是托管堆里面。因此当我们实例化一个 GameObject 的时候，在 Unity 底层会构建一个或多个 Object 来存储这个 GameObject 的信息，例如很多 Components。因此当 Scene 有过多 GameObject 的时候，Native 内存就会显著上升。
* 当我们看 Profiler，发现 Native 内存大量上升的时候，应先去检查 Scene。

### Audio

**DSP Buffer** ：相当于音频的缓冲。

* 当一个声音要播放的时候，它需要向 CPU 去发送指令——我要播放声音。但如果声音的数据量非常小，就会造成频繁地向 CPU 发送指令，会造成 I\O。
* 当 Unity 用到 FMOD 声音引擎时(Unity 底层也用到 FMOD)，会有一个 Buffer，当 Buffer 填充满了，才会向 CPU 发送“我要播放声音”的指令。
* DSP buffer 会导致两种问题：
  * 如果(设置的) buffer 过大，会导致声音的延迟。要填充满 buffer 是要很多声音数据的，但声音数据又没这么大，因此会导致一定的声音延迟。
  * 如果 DSP buffer 太小，会导致 CPU 负担上升，满了就发，消耗增加。

**Foce to Mono** : 强制单声道

当两个声道完全相同时可以 Force To Mono，可以节省一半的内存。

在导入声音的时候有一个设置，很多音效师为了声音质量，会把声音设为双声道。但 95% 的声音，左右声道放的是完全一样的数据。这导致了 1M 的声音会变成 2M，体现在包体里和内存里。因此一般对于声音不是很敏感的游戏，会建议改成 Force to mono，强制单声道。

**Format**

例如 IOS 对 MP3 有硬解支持的，所以 MP3 的解析会快很多(Android 没有)。

**Compressiont Format**

声音文件在内存的存在形态(解压的、压缩的等)。

### Code Size

代码也是需要加载进内存的，使用时要注意减少模板泛型的滥用。因为模板泛型在编译成 C++时，会把同样的代码排列组合都编译一边，导致 Code Size 大幅上升。
可以参考 Memory Management in Unity：https://learn.unity.com/tutorial/memory-management-in-unity 3.IL2CPP & Mono 的 Generic Sharing 部分。

:::caution 参考
[Unity 中的内存管理中的泛型共享部分](./../Optimization/Unity%20 中的内存管理.md#泛型共享-generic-sharing)
:::

### AssetBundle

**TypeTree**

* Unity 的每一种类型都有很多数据结构的改变，为了对此做兼容，Unity 会在生成数据类型序列化的时候，顺便会生成 TypeTree：当前我这一个版本里用到了哪些变量，对应的数据类型是什么。在反序列化的时候，会根据 TypeTree 来进行反序列化。
* 如果上一个版本的类型在这个版本中没有，TypeTree 就没有它，因此不会碰到它。
* 如果要用一个新的类型，但在这个版本中不存在，会用一个默认值来序列化，从而保证了不会在不同的版本序列化中出错，这个就是 TypeTree 的作用。
* Build AssetBundle 中有开关可以关掉 TypeTree。当你确认当前 AssetBundle 的使用和 Build Unity 的版本一模一样，这时候可以把 TypeTree 关掉。例如如果用同样的 Unity 打出来的 AssetBundle 和 APP，TypeTree 则完全可以关掉。
* TypeTree 好处：
  * 内存减少。TypeTree 本身是数据，也要占内存。
  * 包大小会减少，因为 TypeTree 会序列化到 AssetBundle 包中，以便读取。
  * Build 和运行时会变快。源代码中可以看到，因为每一次 Serialize 东西的时候，如果发现需要 Serialize TypeTree，则会 Serialize 两次：
    * 第一次先把 TypeTree Serialize 出来
    * 第二次把实际的东西 Serialize 出来
    * 反序列化也会做同样的事情，1. TypeTree 反序列化，2. 实际的东西反序列化。
  * 当你确定你当前的 AssetBundle 和你的 Unity 是同一个版本的时候，就可以关掉 TypeTree。关掉 TypeTree 之后可以减少内存大小、包大小、加快运行速度。

**压缩方式：使用 Lz4，而不是 Lzma**

* Lz4 (https://docs.unity3d.com/Documentation/ScriptReference/BuildCompression.LZ4.html)
  * LZ4HC "Chunk Based" Compression. 非常快
  * 和 Lzma 相比，平均压缩比率差 30%。也就是说会导致包体大一点，但是(作者说)速度能快 10 倍以上。
* Lzma (https://docs.unity3d.com/2019.3/Documentation/ScriptReference/BuildCompression.LZMA.html)
  * Lzma 基本上就不要用了，因为解压和读取速度上都会比较慢。还会占大量内存。
    * 因为是 Steam based 而不是 Chunk Based 的，因此需要一次全解压
    * Chunk Based 可以一块一块解压，如果发现一个文件在第 5-10 块，那么 LZ4 会依次将 第 5 6 7 8 9 10 块分别解压出来，每次(chunk 的)解压会重用之前的内存，来减少内存的峰值。
* 中国版 Unity 中有基于 LZ4 的 Addressables( AssetBundle) 加密，只支持 LZ4。https://mp.weixin.qq.com/s/s9lQyunpRPJZnnaLSb9qOQ

**Size & Count**

* AssetBundle 包打多大是很玄学的问题，但每一个 Asset 打一个 Bundle 这样不太好。
* 有一种减图片大小的方式，把 png 的头都剔除出来。因为头的色板是通用的，而数据不通用。AssetBundle 也一样，一部分是它的头，一部分是实际打包的部分。因此如果每个 Asset 都打 Bundle 会导致 AssetBundle 的头比数据还要大。
* 官方的建议是每个 AssetBundle 包大概 1M~2M 左右大小，考虑的是网络带宽。但现在 5G 的时候，可以考虑适当把包体加大。还是要看实际用户的情况。

### Resources 文件夹

不要使用，除非在 debug 的时候

* Resource 和 AssetBundle 一样，也有头来索引。Resource  在打进包的时候会做一个红黑树，来帮助 Resource 来检索资源在什么位置，
* 如果 Resource 非常大，那么红黑树也会非常大。
* 红黑树是不可卸载的。在刚开始游戏的时候就会加载进内存中，会持续对游戏造成内存压力。
* 会极大拖慢游戏的启动时间。因为红黑树没加载完，游戏不能启动。

### Texture

**Upload Buffer**：和声音的 DSP Buffer 很像，设置填充满多大之后再推向 CPU/GPU。

**Read/Write** : 不使用就关闭它。

* Texture 没必要就不要开 read and write。正常 Texture 读进内存，解析完了，放到 upload buffer 里后，内存里的就会 delete 掉。
* 但如果检测到你开了 r/w 就不会 delete 了，就会在显存和内存中各一份。

**Mip Map** : 像 UI 这些不需要的就关闭它，可以省大量内存。。

### Mesh

**Read/Write** :同上 Texture

**Compression**:虽然写的是压缩，但实际效果并不一定有用，有些版本 Compression 开了不如不开，内存占用可能更严重，具体需要自己试。

## 5. Managed(托管)内存

### VM 内存池

Mono 虚拟机的内存池，实际上 VM 是会返回给操作系统。返还条件是什么？

* GC 不会把内存直接返还给系统
* 内存也是以 Block 来管理的。当一个 Block 连续六次 GC 没有被访问到，这块内存才会被返还到系统。(mono runtime 基本看不到，IL2cpp runtime 可能会看到多一点)
* 不会频繁地分配内存，而是一次分配一大块。

### GC 机制

Unity 的 GC 机制是 Boehm 内存回收，是不分代的，非压缩式的。(之所以是使用 Boehm 是因为 Unity 和 Mono 的一些历史原因，以及目前 Unity 主要精力放在 IL2CPP 上面)

**GC 机制考量**

* Throughput(回收能力)：一次回收，会回收多少内存
* Pause times(暂停时长)：进行回收的时候，对主线程的影响有多大
* Fragmentation(碎片化)：回收内存后，会对整体回收内存池的贡献有多少
* Mutator overhead(额外消耗)：回收本身有 overhead，要做很多统计、标记的工作
* Scalability(可扩展性)：扩展到多核、多线程会不会有 bug
* Protability(可移植性)：不同平台是否可以使用

### BOEHM

* Non-generational(不分代的)
  * 分代是指：大块内存、小内存、超小内存是分在不同内存区域来进行管理的。还有长久内存，当有一个内存很久没动的时候会移到长久内存区域中，从而省出内存给更频繁分配的内存。
* Non-compacting(非压缩式)
  * 当有内存被回收的时候，如果会压缩内存会把上图空的地方重新排布。Unity 的 BOEHM 不会！它是非压缩式的。空着就空着，下次要用了再填进去。
  * 历史原因：Unity 和 Mono 合作上，Mono 并不是一直开源免费的，因此 Unity 选择不升级 Mono，与实际 Mono 版本有差距。
* 下一代 GC
  * Incremental GC(渐进式 GC)
    * 如果我们要进行一次 GC，主线程被迫要停下来，遍历所有 GC Memory “island”(没听清)，来决定哪些 GC 可以回收。
    * Incremental GC 把暂停主线程的事分帧做了。一点一点分析，主线程不会有峰值。总体 GC 时间不变，但会改善 GC 对主线程的卡顿影响。
  * SGen 或者升级 Boehm？
    * SGen 是分代的，能避免内存碎片化问题，调动策略，速度较快
  * IL2CPP
    * 现在 IL2CPP 的 GC 机制是 Unity 自己重新写的，是升级版的 Boehm

### Memory fragmentation 内存碎片化

为了防止内存碎片化(Memory Fragmentation)，在做加载的时候，应先加载大内存的资源，再加载小内存的资源(因为 Bohem 没有内存压缩)，这样可以保证最大限度地利用内存。

* 为什么内存下降了，但总体内存池还是上升了？
  * 因为内存太大了，内存池没地方放它，虽然有很多内存可用。(内存已被严重碎片化)
* 当开发者大量加载小内存，使用释放*N，例如配置表、巨大数组，GC 会涨一大截。
* 建议先操作大内存，再操作小内存，以保证内存以最大效率被重复利用。

### Zombie Memory(僵尸内存)

内存泄露说法是不对的，内存只是没有任何人能够管理到，但实际上内存没有被泄露，一直在内存池中，被 zombie 掉了，这种叫 Zombie 内存。

* 无用内容
  * Coding 时候或者团队配合的时候有问题，加载了一个东西进来，结果从头到尾只用了一次。
  * 有些开发者写了队列调度策略，但是策略写的不好，导致一些他觉得会被释放的东西，没有被释放掉。
  * 找是否有活跃度实际上并不高的内存。
* 没有释放
* 通过代码管理和性能工具分析，查看各个资源的引用

### 最佳实践

* Don't Null it, but Destroy it(显式用 Destory，别用 Null)
* Class VS Struct
* Pool In Pool(池中池)
  * VM 本身有内存池，但建议开发者对高频使用的小部件，自己建一个内存池。例如 UI、粒子系统、子弹等。
* Closures and anonymous methods(闭包和匿名函数)
  * 如果看 IL，所有匿名函数和闭包会 new 成一个 class，因此所有变量和要 new 的东西都是要占内存的。这样会导致协程。
    * 有些开发者会在游戏开始启用一个协程，直到游戏结束才释放，这是错误的。
    * 只要协程不被释放掉，所有内存都会在内存里。
* Coroutines(协程)
  * 可看做闭包和匿名函数的一个特例，只要不被释放，里面所有引用的所有内存都会存在。
  * 最佳实践：用的时候生产一个，不用的时候 Destroy 掉。
* Configurations(配置表)
  * 不要把整个配置表都扔进去，是否能通过啥来切分下配置表。
* Singleton：慎用，游戏一开始到游戏死掉，一直在内存中。
* 内存及性能工具
  * [中国增强版功能介绍(之)性能测试工具 UPR - BiliBili](https://www.bilibili.com/video/BV1B741157Nr/?spm_id_from=333.788.comment.all.click&vd_source=b73254b2f0c5aed974ec59d497bc3cf6)

:::caution 参考
* [Boehm-Demers-Weiser 垃圾回收器](https://www.hboehm.info/gc/)
:::

