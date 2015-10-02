////
//  CLASS: PickUpItem
//  Used as a base class for items that can be picked up
////

function PickUpItem(x, y, image)
{
    this.image = image;
    this.InitSprite(x, y);

    this.Knock();
}

PickUpItem.prototype.InitSprite = function (x, y)
{
    this.sprite = groupPickupItems.create(x, y, this.image);
    this.sprite.object = this;
}

PickUpItem.prototype.PickUp = function ()
{
    player.AddToInventory(this);
    this.sprite.kill();
}

PickUpItem.prototype.Knock = function ()
{
    var angle = Utility.Random(2 * Math.PI);
    var length = Utility.Random(1, 2);
    var x1 = Math.cos(angle);
    var y1 = Math.sin(angle);

    this.sprite.body.velocity.x = x1 * 100;
    this.sprite.body.velocity.y = y1 * 100;

    this.sprite.body.drag.x = Math.abs(x1 * 100 * length);
    this.sprite.body.drag.y = Math.abs(y1 * 100 * length);
}


////
//  CLASS: Key
//  Key pickupable item. Used to open doors
////

function Key(x, y, colour) // extends PickUpItem
{
    PickUpItem.call(this, x, y, 'key');
    this.colour = colour;
    this.keyType = colour;
    this.Init();
}
Key.prototype = Object.create(PickUpItem.prototype);
Key.prototype.constructor = Key;

Key.prototype.Init = function ()
{
    this.sprite.tint = this.colour;
}


////
//  CLASS: PickupHeart
//  Heart pickupable item. Used regain player HP
////

function PickupHeart(x, y) // extends PickUpItem
{
    PickUpItem.call(this, x, y, 'pickupheart');
    this.healAmount = 4;
}
PickupHeart.prototype = Object.create(PickUpItem.prototype);
PickupHeart.prototype.constructor = PickupHeart;

PickupHeart.prototype.PickUp = function ()
{
    player.Heal(this.healAmount);
    this.sprite.kill();
}



////
//  CLASS: Coins
//  Base class for coins pickup items.
////

function Coins(x, y, image)
{
    PickUpItem.call(this, x, y, image);
    this.coinAmount = 1;
}
Coins.prototype = Object.create(PickUpItem.prototype);
Coins.prototype.constructor = Coins;

Coins.prototype.PickUp = function ()
{
    player.AddCoins(this.coinAmount);
    this.sprite.kill();
}

////
//  CLASS: Coins1
//  1 coin currency pickup item
////

function Coins1(x, y)
{
    Coins.call(this, x, y, 'coin1');
    this.coinAmount = 1;
}
Coins1.prototype = Object.create(Coins.prototype);
Coins1.prototype.constructor = Coins1;

////
//  CLASS: Coins5
//  5 coin currency pickup item
////

function Coins5(x, y)
{
    Coins.call(this, x, y, 'coin5');
    this.coinAmount = 5;
}
Coins5.prototype = Object.create(Coins.prototype);
Coins5.prototype.constructor = Coins5;

////
//  CLASS: Coins10
//  10 coin currency pickup item
////

function Coins10(x, y)
{
    Coins.call(this, x, y, 'coin10');
    this.coinAmount = 10;
}
Coins10.prototype = Object.create(Coins.prototype);
Coins10.prototype.constructor = Coins10;

