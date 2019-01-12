---
title: "Stop using switch statment"
layout: post
date: 2019-01-05 15:00
image: https://github.com/PaoloCattaneo92/paolocattaneo92.github.io/blob/master/assets/images/switch_nevermore.jpg
headerImage: false
project: true
tag:
- personal
- development tip
- design
- c#
category: blog
author: paolocattaneo
description: Switch statement is bad, learn how to avoid it
# jemoji: '<img class="emoji" title=":ramen:" alt=":ramen:" src="https://assets.github.com/images/icons/emoji/unicode/1f35c.png" height="20" width="20" align="absmiddle">'
---

# Stop using switch statment
Every developer has written, probably multiple times in his/her life a _switch_ statement. Perhaps, the first time we used it
we were even happy to have found something cleaner that a block of _if-elseif-elseif-elseif..._, but now it's the time to take
a step further.

**DOWNLOAD** all the code examples that are written in this post checking out my [Github repository](https://github.com/PaoloCattaneo92/NeverMoreSwitch)

<img src="{{ page.image }}" />

Today in facts I will show you 2 ways to get rid of that confusing, inelegant and unoptimized construct that is the _switch_ statement.

> You will read examples written in C# in this post, but the purpose of my idea is purely theoric, that means you can apply it to your favorite Object oriented language.

Down here there is a simple example of a block of code that splits the behaviour of a _Move_ method of an _Animal_ based on the value of its (enum) _AnimalType_

```csharp
namespace NeverMoreSwitch.WithSwitch
{
    public class Animal
    {
        public AnimalType Type { get; set; }
        public string Name { get; set; }

        public void Move()
        {
            switch (Type)
            {
                case AnimalType.FISH:
                    Console.WriteLine($"A {Name} is swimming");
                    break;
                case AnimalType.CAT:
                    Console.WriteLine($"A {Name} is walking");
                    break;
                case AnimalType.BIRD:
                    Console.WriteLine($"A {Name} is flying");
                    break;
            }
        }
    }
}
```

In the main Program:

```csharp
namespace NeverMoreSwitch.WithSwitch
{
    class Program
    {
        static void Main(string[] args)
        {
            Animal fish = new Animal()  { Name = "Fish", Type = AnimalType.FISH };
            Animal cat = new Animal()   { Name = "Cat", Type = AnimalType.CAT };
            Animal bird = new Animal()  { Name = "Bird", Type = AnimalType.BIRD };

            fish.Move();
            cat.Move();
            bird.Move();

            Console.ReadLine();

            //OUTPUT:
            /*
            A Fish is swimming
            A Cat is walking
            A Bird is flying
            */
        }
    }
}
```

Now, let's see how we can get the same behaviour, but in a more elegant (and simpler to manage) way.

# Polymorphism
Using the Object Oriented concept of _polymorphism_ you can easily get this behaviour using _overloads_ or _overrides_. 

## Override

Our example above does not use hierarchical properties that are a lot valuable in a situation like this. Now we will be fixing it, creating a **specific subclass** for each _Animal_ and _overriding_ that _Move()_ method.
Now there is no need to switch the behaviour, because each instance of our specific _Animal_ will call the correct version of the _Move()_ method

```csharp
namespace NeverMoreSwitch.WithPolymorphismOvveride
{
    //WARNING: put several classes in a single file is another bad habit
    //It's done here just to get the concept in a sight
    public abstract class Animal
    {
        public string Name { get; set; }
        public abstract void Move();
    }

    public class Fish : Animal
    {
        public override void Move()
        {
            Console.WriteLine($"A {Name} is swimming");
        }
    }

    public class Cat : Animal
    {
        public override void Move()
        {
            Console.WriteLine($"A {Name} is walking");
        }
    }

    public class Bird : Animal
    {
        public override void Move()
        {
            Console.WriteLine($"A {Name} is flying");
        }
    }
}
```

In the main Program:

```csharp
namespace NeverMoreSwitch.WithPolymorphismOvveride
{
    class Program
    {
        static void Main(string[] args)
        {
            Animal fish = new Fish()  { Name = "Fish"};
            Animal cat = new Cat()   { Name = "Cat"};
            Animal bird = new Bird()  { Name = "Bird"};

            fish.Move();
            cat.Move();
            bird.Move();

            Console.ReadLine();

            //OUTPUT:
            /*
            A Fish is swimming
            A Cat is walking
            A Bird is flying
            */
        }
    }
}
```

In this case, the trick was creating a specific subclass for each of our implementation

## Overload
Sometimes your business logic is not inside the object itself, but it's done by some other class that takes your object as input and do something to it (or something different based on the state of your object).

An example with a _switch_ case, always with our _Animal_ example could be like this, where a _ZooWorker_ must decrement a counter of different meals (one for each animal) depending on the animal is feeding.

```csharp
namespace NeverMoreSwitch.WithSwitch
{
    public class ZooWorker
    {
        public int FishMeals { get; set; } = 10;
        public int CatMeals { get; set; } = 5;
        public int BirdMeals { get; set; } = 7;

        public void Feed(Animal animal)
        {
            Console.WriteLine($"Feeding a {animal.Name}");
            switch (animal.Type)
            {
                case AnimalType.FISH:
                    FishMeals--;
                    break;
                case AnimalType.CAT:
                    CatMeals--;
                    break;
                case AnimalType.BIRD:
                    BirdMeals--;
                    break;
            }
        }
    }
}
```

In the main Program:

```csharp
ZooWorker zooWorker = new ZooWorker();
Console.WriteLine($"Fish meals are: {zooWorker.FishMeals}");
zooWorker.Feed(fish);
Console.WriteLine($"Fish meals are: {zooWorker.FishMeals}");

//OUTPUT:
/*
Fish meals are: 10
Feeding a Fish
Fish meals are: 9
*/

```

We can use the _overload_ mechanic of Object Oriented Programming with ease in this specific situation. After we have added the subclasses, as we have done with the _override_ version, we can create
_overloads_ of the _Feed_ method, each one accepting the correct _Animal_.

```csharp
namespace NeverMoreSwitch.WithPolymorphism
{
    public class ZooWorker
    {
        public int FishMeals { get; set; } = 10;
        public int CatMeals { get; set; } = 5;
        public int BirdMeals { get; set; } = 7;

        private void FeedingWhat(Animal animal)
        {
            Console.WriteLine($"Feeding a {animal.Name}");
        }

        public void Feed(Fish animal)
        {
            FeedingWhat(animal);
            FishMeals--;
        }

        public void Feed(Cat animal)
        {
            FeedingWhat(animal);
            CatMeals--;
        }

        public void Feed(Bird animal)
        {
            FeedingWhat(animal);
            BirdMeals--;
        }


    }
}
```

In the main Program:

```csharp
Fish realFish = new Fish() { Name = "Fish" };
Cat realCat = new Cat() { Name = "Cat" };
Bird realBird = new Bird() { Name = "Bird" };
ZooWorker zooWorker = new ZooWorker();
Console.WriteLine($"Fish meals are: {zooWorker.FishMeals}");
zooWorker.Feed(realFish);
Console.WriteLine($"Fish meals are: {zooWorker.FishMeals}");

//OUTPUT:
/*
Fish meals are: 10
Feeding a Fish
Fish meals are: 9
*/
```

This is much cleaner, elegant and uses the useful _polymorphism_ of OOP.

# Dictionaries
Sometimes we just cannot avoid enums and use them to identify types of Objects. This could be true when creating more subclasses lead to even more confusion than the switch case, maybe
because there are simply too many cases to handle.

You know, there is not an answer that is always right, not even in Software Development.

However, if you must keep the enum version of your data Object, you can avoid using a switch
to handle different behaviours adding a _Dictionary_ (a _Map_, if you are more into Java) that
links your enum values to the specific behaviour (or a value).

Also, _incapsulating_ your _Dictionary_ into another dedicated class could help you to keep
your code more organised (and you will use _incapsulation_, another _magic word_ of the OOP, just like the _polymorphism_ you have seen before).

```csharp
namespace NeverMoreSwitch.WithDictionaries
{
    public static class AnimalMovementMap
    {
        public static Dictionary<AnimalType, string> GetMove = new Dictionary<AnimalType, string>()
        {
            { AnimalType.FISH, "swimming"},
            { AnimalType.CAT, "walking"},
            { AnimalType.BIRD, "flying"}
        };
    }
}

namespace NeverMoreSwitch.WithDictionaries
{
    public class Animal
    {
        public AnimalType Type { get; set; }
        public string Name { get; set; }

        public void Move()
        {
            Console.WriteLine($"A {Name} is {AnimalMovementMap.GetMove[Type]}");
        }
    }
}
```

In the main Program:

```csharp
namespace NeverMoreSwitch.WithDictionaries
{
    class Program
    {
        static void Main(string[] args)
        {
            Animal fish = new Animal() { Name = "Fish", Type = AnimalType.FISH };
            Animal cat = new Animal() { Name = "Cat", Type = AnimalType.CAT };
            Animal bird = new Animal() { Name = "Bird", Type = AnimalType.BIRD };

            fish.Move();
            cat.Move();
            bird.Move();

            Console.ReadLine();
        }
    }
}
```

# Conclusion
These were just two easy methods to get rid of those _switch_ cases. Hope this post help you, feel free to share your thoughts contacting me on my [Linkedin profile](https://www.linkedin.com/in/paolo-cattaneo-eng/).

