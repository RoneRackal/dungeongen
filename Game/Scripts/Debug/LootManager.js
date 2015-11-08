

function LootManager()
{
    this.loot = [];

    this.AddLoot('PickupHeart', 1, 30, 0);
    this.AddLoot('Coins1', 1, 5, 0, 4);
    this.AddLoot('Coins5', 1, 3, 0, 2);
    this.AddLoot('Coins10', 1, 2, 0);
}

/* LootManager.AddLoot
 * Adds loot to the loot manager, making it available to be dropped
 * pickupItem: The class name for the pickup item to be dropped
 * minLevel: The minimum monster level required for this item to be dropped
 * chance: The base chance (0-100) for this item to be dropped
 * chancePerLevel: The added amount of chance percentage per monster level (default 0)
 * rollAmount: The amount of times this item is rolled for, so multiple of this can drop from 1 monster (default 1)
 */
LootManager.prototype.AddLoot = function (pickupItem, minLevel, chance, chancePerLevel, rollAmount)
{
    chancePerLevel = chancePerLevel || 0;
    rollAmount = rollAmount || 1;

    this.loot.push({
        itemname: pickupItem,
        minLevel: minLevel,
        chance: chance,
        chancePerLevel: chancePerLevel,
        rollAmount: rollAmount
    });
}

LootManager.prototype.DropLoot = function (x, y, monsterLevel)
{
    for (var i = 0; i < this.loot.length; i++)
    {
        if (this.loot[i].minLevel <= monsterLevel)
        {
            for (var roll = 0; roll < this.loot[i].rollAmount; roll++)
            {
                if (Utility.Random(100) <= this.loot[i].chance + this.loot[i].chancePerLevel * monsterLevel) // Roll the drop
                {
                    var classToSpawn = Utility.StringToFunction(this.loot[i].itemname);
                    new classToSpawn(x, y);
                }
            }
        }
    }
}

