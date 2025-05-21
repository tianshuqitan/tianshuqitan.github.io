---
article: false
index: false
---

# 内存

* [Unity 中的内存](./../Manual/Unity%20中的内存.md)
* [Unity 中的内存管理](./../Optimization/Unity%20中的内存管理.md)
* [Unity 中的垃圾回收](./../Optimization/垃圾回收.md)
* [浅谈 Unity 内存管理 - 高川(Bilibili)](https://www.bilibili.com/video/BV1aJ411t7N6/?spm_id_from=333.1387.favlist.content.click&vd_source=b73254b2f0c5aed974ec59d497bc3cf6)

https://www.bilibili.com/video/BV1B741157Nr/?spm_id_from=333.788.comment.all.click

https://www.bilibili.com/video/BV1r44y1z7X3?p=2&spm_id_from=333.788.comment.all.click&vd_source=f1614581a2fa16a9962190e8160fa953

## 浅谈 Unity 内存管理 - 高川

**什么是内存**

* 物理内存
  * CPU 访问物理内存比较慢，通过内存多级缓存加快访问速度，存在一个 Cache Miss/命中的问题
  * ECS DOTS
  * 设备差异：移动设备没有独立显卡，没有独立显存，内存缓存级数少，内存缓存小。
* 虚拟内存
  * 台式支持内存交换，移动设备不支持内存交换。
  * IOS 可以进行内存压缩，Android 不可以内存压缩。
* 内存寻址范围
  * 32位CPU 和 64 位CPU

**Android内存管理**

* 内存基本单位 * Page
  * 4k per page
  * 回收和分配以 page 为单位
  * 用户态和内核态
* 内存杀手 * [Low Memory Killer(AKA lmk)](https://developer.android.com/topic/performance/vitals/lmk)
* [内存指标](https://developer.android.com/topic/performance/memory-management?_gl=1*nya3rb*_up*MQ..*_ga*MTczMTcxMDgzOC4xNzQ3ODQxMTYx*_ga_6HH9YJMN9M*czE3NDc4NDExNjAkbzEkZzAkdDE3NDc4NDEyNzQkajAkbDAkaDEyNjYyMzQxODAkZG1XV0ZUUkNVSXl2OTUtUDhORDc5SENTclJYUGUtVUN1c3c.)
  * Resident Set Size
  * Proportional Set Size
  * Unique Set Size
  * `procrank`

**Unity内存管理**

* Unity 是一个 C++ 引擎
  * 底层代码完全由 C++ 写成
  * 通过 Wrapper 提供给用户 API
  * 用户代码会转换为 CPP 代码(IL2CPP)
  * VM 仍然存在(IL2CPP VM) * VM 主要为了跨平台
* Unity 内存按照分配方式分为：
  * Native Memory
  * Managed Memory
  * Editor & Runtime 是不同的
    * 不止是统计看到的内存大小不同，甚至是内存分配时机和方式也不同
    * Asset 在 Runtime 中如果不读取，是不会进内存的，但 Editor 打开就占内存。因为 Editor 不注重 Runtime 的表现，更注重编辑器中编辑时的流畅。
    * 但如果游戏庞大到几十个 G，如果第一次打开项目，会消耗很多时间，有的大的会几天，甚至到一周。
* Unity 内存按照管理者分为：
  * 引擎管理内存
  * 用户管理内存(应优先考虑)
* Unity 检测不到的内存
  * 用户分配的 Native 内存
    * 自己写的 Native 插件(C++ 插件)，Unity 无法分析已经编译过的 C++ 是如何去分配和使用内存的。
    * Lua 完全由自己管理内存，Unity 无法统计到内部的使用情况。
* Unity Native Memory 管理
  * Allocator 与 Memory Label
    * Unity 重载了所有分配内存的操作符(alloc、new)，使用这些重载的时候，会需要一个额外的 Memory Label，根据 Memory Label 决定要分配到哪一个类型的内存池。
  * NewAsRoot，所有的内存都分配到 Root 下，统计的时候也只会统计 Root。
  * GetRuntimeMemory。
  * 会及时返还给系统。因为是 C++ 的，因此当我们 Delete、Free 一个内存的时候会立刻返回内存给系统，与托管内存堆不一样。

**Native 内存最佳实践**

* Scene
  * Unity 是一个 C++ 引擎，所有实体最终都会反映在 C++ 上，而不是托管堆里面。因此当我们实例化一个 GameObject 的时候，在 Unity 底层会构建一个或多个 Object 来存储这个 GameObject 的信息，例如很多 Components。因此当 Scene 有过多 GameObject 的时候，Native 内存就会显著上升。
  * 当我们看 Profiler，发现 Native 内存大量上升的时候，应先去检查 Scene。
* Audio
  * DSP buffer(声音的缓冲)
    * 当一个声音要播放的时候，它需要向 CPU 去发送指令——我要播放声音。但如果声音的数据量非常小，就会造成频繁地向 CPU 发送指令，会造成 I/O。
    * 当 Unity 用到 FMOD 声音引擎时(Unity 底层也用到 FMOD)，会有一个 Buffer，当 Buffer 填充满了，才会向 CPU 发送“我要播放声音”的指令。
    * DSP buffer 会导致两种问题：
      * 如果(设置的) buffer 过大，会导致声音的延迟。要填充满 buffer 是要很多声音数据的，但声音数据又没这么大，因此会导致一定的**声音延迟**。
      * 如果 DSP buffer 太小，会导致 CPU 负担上升，满了就发，消耗增加。
  * Force to mono
      * 在导入声音的时候有一个设置，很多音效师为了声音质量，会把声音设为双声道。但 95% 的声音，左右声道放的是完全一样的数据。这导致了 1M 的声音会变成 2M，体现在包体里和内存里。因此一般对于声音不是很敏感的游戏，会建议改成 Force to mono，强制单声道。
  * Format
  * Compression Format
* Code Size
  * C++ 模板泛型的滥用会影响到 Code Size、打包的速度。
* AssetBundle
  * TypeTree
    * Unity 的每一种类型都有很多数据结构的改变，为了对此做兼容，Unity 会在生成数据类型序列化的时候，顺便会生成 TypeTree：当前我这一个版本里用到了哪些变量，对应的数据类型是什么。在反序列化的时候，会根据 TypeTree 来进行反序列化。
      * 如果上一个版本的类型在这个版本中没有，TypeTree 就没有它，因此不会碰到它。
      * 如果要用一个新的类型，但在这个版本中不存在，会用一个默认值来序列化，从而保证了不会在不同的版本序列化中出错，这个就是 TypeTree 的作用。
    * Build AssetBundle 中有开关可以关掉 TypeTree。当你确认当前 AssetBundle 的使用和 Build Unity 的版本一模一样，这时候可以把 TypeTree 关掉。
      * 例如如果用同样的 Unity 打出来的 AssetBundle 和 APP，TypeTree 则完全可以关掉。
    * TypeTree 好处：
      * 内存减少。TypeTree 本身是数据，也要占内存。
      * 包大小会减少，因为 TypeTree 会序列化到 AssetBundle 包中，以便读取。
      * Build 和运行时会变快。源代码中可以看到，因为每一次 Serialize 东西的时候，如果发现需要 Serialize TypeTree，则会 Serialize 两次：
        * 第一次先把 TypeTree Serialize 出来
        * 第二次把实际的东西 Serialize 出来
        * 反序列化也会做同样的事情，1. TypeTree 反序列化，2. 实际的东西反序列化。
      * 因此如果确定 TypeTree 不会对兼容性造成影响，可以把它关掉。这样对 Size 大小和 Build Runtime 都会获得收益。
  * 压缩方式：
    * Lz4
      * LZ4HC "Chunk Based" Compression. 非常快
      * 和 Lzma 相比，平均压缩比率差 30%。也就是说会导致包体大一点，但是(作者说)速度能快 10 倍以上。
    * Lzma
      * Lzma 基本上就不要用了，因为解压和读取速度上都会比较慢。
      * 还会占大量内存
        * 因为是 Steam based 而不是 Chunk Based 的，因此需要一次全解压
        * Chunk Based 可以一块一块解压
            * 如果发现一个文件在第 5-10 块，那么 LZ4 会依次将 第 5 6 7 8 9 10 块分别解压出来，每次(chunk 的)解压会重用之前的内存，来减少内存的峰值。
    * 预告：中国版 Unity 会在下个版本(1月5号或2月份)推出新的功能：基于 LZ4 的 AssetBundle 加密，只支持 LZ4。
  * Size & count
    * AssetBundle 包打多大是很玄学的问题，但每一个 Asset 打一个 Bundle 这样不太好。
      * 有一种减图片大小的方式，把 png 的头都提出来。因为头的色板是通用的，而数据不通用。AssetBundle 也一样，一部分是它的头，一部分是实际打包的部分。因此如果每个 Asset 都打 Bundle 会导致 AssetBundle 的头比数据还要大。
    * 官方的建议是每个 AssetBundle 包大概 1M~2M 左右大小，考虑的是网络带宽。但现在 5G 的时候，可以考虑适当把包体加大。还是要看实际用户的情况。
* Resource 文件夹(**Do not use it**. 除非在 debug 的时候)
  * Resource 和 AssetBundle 一样，也有头来索引。Resource 在打进包的时候会做一个红黑树，来帮助 Resource 来检索资源在什么位置，
  * 如果 Resource 非常大，那么红黑树也会非常大。
  * 红黑树是不可卸载的。在刚开始游戏的时候就会加载进内存中，会持续对游戏造成内存压力。
  * 会极大拖慢游戏的启动时间。因为红黑树没加载完，游戏不能启动。
* Texture
  * upload buffer，和声音的很像：填满多大，就向 CPU push 一次。
  * r/w
    * Texture 没必要就不要开 read and write。正常 Texture 读进内存，解析完了，放到 upload buffer 里后，内存里的就会 delete 掉。
    * 但如果检测到你开了 r/w 就不会 delete 了，就会在显存和内存中各一份。
  * Mip Maps
    * UI 没必要开，可以省大量内存。
  * Mesh
    * r/w
    * compression
      * 有些版本 Compression 开了不如不开，内存占用可能更严重，具体需要自己试。
  * Assets
      * Assets 的数量实际上和 asset 整个的纹理是有关系的。(？)

**Unity Managed Memory(托管内存)**

* VM 内存池
  * Mono 虚拟机的内存池
  * VM 会返还内存给 OS 吗？
    * **会**，返还条件
      * GC 不会把内存返还给系统
      * 内存也是以 Block 来管理的。当一个 Block 连续六次 GC 没有被访问到，这块内存才会被返还到系统。(mono runtime 基本看不到，IL2cpp runtime 可能会看到多一点)
  * 不会频繁地分配内存，而是一次分配一大块。
* GC 机制(BOEHM Non-generational 不分代的)
  * GC 机制考量
    * Throughput(回收能力) 一次回收，会回收多少内存
    * Pause times(暂停时长) 进行回收的时候，对主线程的影响有多大
    * Fragmentation(碎片化) 回收内存后，会对整体回收内存池的贡献有多少
    * Mutator overhead(额外消耗) 回收本身有 overhead，要做很多统计、标记的工作
    * Scalability(可扩展性) 扩展到多核、多线程会不会有 bug
    * Protability(可移植性) 不同平台是否可以使用
* BOEHM
  * Non-generational(不分代的)
    * 分代是指：大块内存、小内存、超小内存是分在不同内存区域来进行管理的。还有长久内存，当有一个内存很久没动的时候会移到长久内存区域中，从而省出内存给更频繁分配的内存。
  * Non-compacting(非压缩式)
    * 当有内存被回收的时候，压缩内存会把上图空的地方重新排布。
    * 但 Unity 的 BOEHM 不会！它是非压缩式的。空着就空着，下次要用了再填进去。
  * 下一代 GC
    * Incremental GC(渐进式 GC)
      * 现在如果我们要进行一次 GC，主线程被迫要停下来，遍历所有 GC Memory，来决定哪些 GC 可以回收。
      * Incremental GC 把暂停主线程的事分帧做了。一点一点分析，主线程不会有峰值。总体 GC 时间不变，但会改善 GC 对主线程的卡顿影响。
    * SGen 或者升级 Boehm?
      * SGen 是分代的，能避免内存碎片化问题，调动策略，速度较快。
    * IL2CPP
      * 现在 IL2CPP 的 GC 机制是 Unity 自己重新写的，是升级版的 Boehm。
* Memory fragmentation 内存碎片化
  * 为什么内存下降了，但总体内存池还是上升了？
    * 因为内存太大了，内存池没地方放它，虽然有很多内存可用。(内存已被严重碎片化)
  * 当开发者大量加载小内存，使用释放*N，例如配置表、巨大数组，GC 会涨一大截。
    * 建议先操作大内存，再操作小内存，以保证内存以最大效率被重复利用。
* Zombie Memory(僵尸内存)
  * 内存泄露说法是不对的，内存只是没有任何人能够管理到，但实际上内存没有被泄露，一直在内存池中，被 zombie 掉了，这种叫 Zombie 内存。
  * 无用内容
    * Coding 时候或者团队配合的时候有问题，加载了一个东西进来，结果从头到尾只用了一次。
    * 有些开发者写了队列调度策略，但是策略写的不好，导致一些他觉得会被释放的东西，没有被释放掉。
    * 找是否有活跃度实际上并不高的内存。
  * 没有释放
  * 通过代码管理和性能工具分析
* 最佳实践
  * Don't Null it, but Destroy it(显式用 Destory，别用 Null)
  * Class VS Struct
  * Pool In Pool(池中池)
    * VM 本身有内存池，但建议开发者对高频使用的小部件，自己建一个内存池。例如子弹等。
  * Closures and anonymous methods(闭包和匿名函数)
    * 如果看 IL，所有匿名函数和闭包会 new 成一个 class，因此所有变量和要 new 的东西都是要占内存的。这样会导致协程。
      * 有些开发者会在游戏开始启用一个协程，直到游戏结束才释放，这是错误的。
      * 只要协程不被释放掉，所有内存都会在内存里。
  * Coroutines(协程)
    * 可看做闭包和匿名函数的一个特例
    * 最佳实践：用的时候生产一个，不用的时候 Destroy 掉。
  * Configurations(配置表)
    * 不要把整个配置表都扔进去，是否能通过啥来切分下配置表。
  * Singleton
    * 慎用
    * 游戏一开始到游戏死掉，一直在内存中。
* 内存及性能工具 - UPR
  * 中国增强版里