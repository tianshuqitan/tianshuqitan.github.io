---
title: List
article: false
---

# List

[源码](https://referencesource.microsoft.com/#mscorlib/system/collections/generic/list.cs)

```cs
private T[] _items;

public int Capacity {
    get {
        Contract.Ensures(Contract.Result<int>() >= 0);
        return _items.Length;
    }
    set {
        if (value < _size) {
            ThrowHelper.ThrowArgumentOutOfRangeException(ExceptionArgument.value, ExceptionResource.ArgumentOutOfRange_SmallCapacity);
        }
        Contract.EndContractBlock();

        if (value != _items.Length) {
            if (value > 0) {
                T[] newItems = new T[value];
                if (_size > 0) {
                    Array.Copy(_items, 0, newItems, 0, _size);
                }
                _items = newItems;
            }
            else {
                _items = _emptyArray;
            }
        }
    }
}

public void Add(T item) {
    if (_size == _items.Length) EnsureCapacity(_size + 1);
    _items[_size++] = item;
    _version++;
}

private void EnsureCapacity(int min) {
    if (_items.Length < min) {
        int newCapacity = _items.Length == 0? _defaultCapacity : _items.Length * 2;
        // Allow the list to grow to maximum possible capacity (~2G elements) before encountering overflow.
        // Note that this check works even when _items.Length overflowed thanks to the (uint) cast
        if ((uint)newCapacity > Array.MaxArrayLength) newCapacity = Array.MaxArrayLength;
        if (newCapacity < min) newCapacity = min;
        Capacity = newCapacity;
    }
}

public void RemoveAt(int index) {
    if ((uint)index >= (uint)_size) {
        ThrowHelper.ThrowArgumentOutOfRangeException();
    }
    Contract.EndContractBlock();
    _size--;
    if (index < _size) {
        Array.Copy(_items, index + 1, _items, index, _size - index);
    }
    _items[_size] = default(T);
    _version++;
}
```

* List 内部是用数组实现的，而非链表。
* List 扩容是以指数级提升的(4,8,16,32,64)，每次扩容的时候都会使用创建一个新的数组，然后使用 `Array.Copy` 复制数据。
* Remove 的时候也是同理，会使用 `Array.Copy` 对数组进行覆盖。
* List的 Add、Insert、IndexOf、Remove 接口都是没有做过任何形式优化的，使用的都是顺序迭代的方式，如果过于频繁使用，效率就会降低，也会造成不少内存的冗余，使得垃圾回收(GC)时要承担更多的压力。
* List 代码是线程不安全的，它并没有对多线程做任何加锁或其他同步操作。由于并发情况下无法判断 `_size++` 的执行顺序，因此当我们在多线程间使用 List 时应加上安全机制。最后，List 并不是高效的组件，真实情况是，它比数组的效率还要差，它只是一个兼容性比较强的组件而已，好用但效率并不高。