# pugblock

Advantages of using pugblock.

With pugblock, a long pug source lines can be divided into a small compartments.

Dynamic inclusion.
With pugblock, 
For instance, blocks for menus can be saved separately, and combined to the layout.

2 ways of creating a block.

1. from String, ie source code of pug.
new PugBlock('h1= 'test');

2. Make a empty block, and edit it line by line.



methods.

include(blockName, target)

A pugblock instance have their own block storage container inside,
and include() method adds another pugblock instance into that container with the given name(blockName).
target auguments can be another pug block instance, or a string(pug source code),
In case of string inclusion, another pugblock instance is created and inserted into the container.

Each blocks inside a pugblock instance is not 


combine(basedepth)

line starts with *

Unused blocks in the container are dropped.

Not found blocks remains as the block element.




user information holds the pugblock for menu compartment.
view instance holds the pugblock for layouts.

Upon request, 
