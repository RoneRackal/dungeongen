////
//  CLASS: Monster
//  Used as a base class for monsters
////

function Monster(x, y, room, image, attackimage)
{
    this.image = image;
    this.room = room;
    this.active = false;
    this.dead = false;
    this.knockedBack = false;
    this.room.RegisterMonster(this);

    this.monsterAttack = new MonsterAttack(x, y, attackimage);
    this.monsterAttack.ResetProjectiles(false, x, y);
    this.readyToAttack = true;
    this.attackTimerNext = game.time.now;
    this.attackTimerEnd = game.time.now;

    this.InitSprite(x, y);
    this.InitProperties();
}

Monster.prototype.InitProperties = function ()
{
    this.attackTimerInterval = 1000; // milliseconds between attacks
    this.attackTimeDuration = 300; // milliseconds an attack will last for
    this.attackRange = 48; // Range the monster can attack from
    this.astar = true; // whether to use A* pathfinding
    this.health = 10; // health of the monster
    this.monsterLevel = 1; // monster level, used for determining loot
    this.speed = 150; // movement speed of the monster
}

Monster.prototype.InitSprite = function (x, y)
{
    this.sprite = groupActors.create(x, y, this.image);
    this.sprite.anchor.setTo(0.5, 0.5);
    this.sprite.object = this;
}

Monster.prototype.TakeDamage = function (damage)
{
    this.health -= damage;
    console.log("HP: " + this.health)
}

Monster.prototype.OnDeath = function ()
{
    
}

Monster.prototype.DropLoot = function ()
{
    lootManager.DropLoot(this.sprite.x, this.sprite.y, this.monsterLevel)
}

Monster.prototype.Activate = function ()
{
    this.active = true;
}

Monster.prototype.KnockBack = function (knockbackSpeed)
{
    knockbackSpeed = knockbackSpeed || 1000;
    
    this.knockedBack = true;

    var v = new Vector(this.sprite.x - player.sprite.x, this.sprite.y - player.sprite.y);
    v = v.UnitVector();
    
    this.sprite.body.velocity.x = v.x * knockbackSpeed;
    this.sprite.body.velocity.y = v.y * knockbackSpeed;

    this.sprite.body.drag.x = Math.abs(v.x * 10000);
    this.sprite.body.drag.y = Math.abs(v.y * 10000);
}

Monster.prototype.Update = function ()
{
    if (this.dead)
    {
        return;
    }

    if (this.health <= 0)
    {
        this.dead = true;
        this.OnDeath();
        this.DropLoot();
        this.sprite.destroy();
        this.room.CheckWinConditions();
        this.sprite = null; // Detach so we can free memory
        return;
    }

    if (this.knockedBack && this.sprite.body.velocity.x === 0 && this.sprite.body.velocity.y === 0) // If we've stopped, no longer knockedback
    {
        this.knockedBack = false;
        this.sprite.body.drag.x = 0;
        this.sprite.body.drag.y = 0;
    }

    if (this.knockedBack)
    {
        return;
    }

    if (game.time.now > this.attackTimerNext)
    {
        this.readyToAttack = true;
    }

    if (game.time.now > this.attackTimerEnd)
    {
        this.monsterAttack.ResetProjectiles(false, this.sprite.x, this.sprite.y);
    }

    if (this.active)
    {
        var monsterPos = new Vector(this.sprite.body.x, this.sprite.body.y);

        if (monsterPos.DistanceTo(new Vector(player.sprite.body.x, player.sprite.body.y)) < this.attackRange && this.readyToAttack)
        {
            this.sprite.body.velocity.x = 0;
            this.sprite.body.velocity.y = 0;
            this.Attack();
        }
        else if (this.readyToAttack)
        {
            this.Move();
        }
        else
        {
            this.sprite.body.velocity.x = 0;
            this.sprite.body.velocity.y = 0;
        }
    }
}

Monster.prototype.Move = function ()
{
    var monster = this;

    if (this.astar)
    {
        var currentTileX = Math.floor((monster.sprite.body.x - monster.room.roomX) / (gameManager.tileSize / 2));
        var currentTileY = Math.floor((monster.sprite.body.y - monster.room.roomY) / (gameManager.tileSize / 2));
        var playerTileX = Math.floor((player.sprite.body.x - monster.room.roomX) / (gameManager.tileSize / 2));
        var playerTileY = Math.floor((player.sprite.body.y - monster.room.roomY) / (gameManager.tileSize / 2));

        easystar.findPath(currentTileX, currentTileY, playerTileX, playerTileY, function (path)
        {
            if (path != null && path.length > 1)
            {
                monster.sprite.body.MoveTowardsPosition(monster.room.roomX + (path[1].x * gameManager.tileSize / 2) + 16, monster.room.roomY + (path[1].y * gameManager.tileSize / 2) + 16, monster.speed);

                /*for (var i = 0; i < path.length - 1; i++)
                {
                    game.debug.geom(new Phaser.Line(
                        monster.room.roomX + (path[i].x * 32 + 16),
                        monster.room.roomY + (path[i].y * 32 + 16),
                        monster.room.roomX + (path[i + 1].x * 32 + 16),
                        monster.room.roomY + (path[i + 1].y * 32 + 16)
                    ));
                }*/
            }
        });

        easystar.calculate();
    }
    else
    {
        monster.sprite.body.MoveTowardsPosition(player.sprite.body.x, player.sprite.body.y, monster.speed);
    }
}

Monster.prototype.Attack = function ()
{
    if (this.readyToAttack)
    {
        this.monsterAttack.ResetProjectiles(true, this.sprite.x, this.sprite.y);
        this.readyToAttack = false;
        this.attackTimerNext = game.time.now + this.attackTimerInterval;
        this.attackTimerEnd = game.time.now + this.attackTimeDuration;
    }
}


////
//  CLASS: AnimatedMonster
//  Animated Monster
////

function AnimatedMonster(x, y, room, image, attackimage) // extends Monster
{
    Monster.call(this, x, y, room, image, attackimage);
}
AnimatedMonster.prototype = Object.create(Monster.prototype);
AnimatedMonster.prototype.constructor = AnimatedMonster;

AnimatedMonster.prototype.InitSprite = function (x, y)
{
    Monster.prototype.InitSprite.call(this, x, y);

    this.sprite.animations.add('up', [0, 1, 2, 1], 10, true);
    this.sprite.animations.add('left', [3, 4, 5, 4], 10, true);
    this.sprite.animations.add('down', [6, 7, 8, 7], 10, true);
    this.sprite.animations.add('right', [9, 10, 11, 10], 10, true);
}

AnimatedMonster.prototype.Update = function ()
{
    Monster.prototype.Update.call(this);

    if (this.dead)
    {
        return;
    }

    var v = new Vector(this.sprite.body.velocity.x, this.sprite.body.velocity.y);
    var angle = v.Angle(true);

    var anim = 'right';
    if (angle > 50)
        anim = 'down';
    if (angle > 130)
        anim = 'left';
    if (angle > 230)
        anim = 'up';
    if (angle > 310)
        anim = 'right';

    this.sprite.animations.play(anim);
}


////
//  CLASS: Slime
//  Slime enemy, splits into two mini-slimes on death
////

function Slime(x, y, room) // extends AnimatedMonster
{
    AnimatedMonster.call(this, x, y, room, 'slime', 'slimeattack');

    this.monsterAttack.damage = 2;
}
Slime.prototype = Object.create(AnimatedMonster.prototype);
Slime.prototype.constructor = Slime;

Slime.prototype.InitProperties = function ()
{
    AnimatedMonster.prototype.InitProperties.call(this);

    this.monsterLevel = 2;
    this.health = 10;
    this.speed = 150;
}

Slime.prototype.OnDeath = function ()
{
    //var miniSlime1 = new MiniSlime(this.sprite.body.x + 12, this.sprite.body.y, this.room);
    //var miniSlime2 = new MiniSlime(this.sprite.body.x - 12, this.sprite.body.y, this.room);
}



////
//  CLASS: Bat
//  Bat enemy, fast and plentiful but very low defence
////

function Bat(x, y, room) // extends AnimatedMonster
{
    AnimatedMonster.call(this, x, y, room, 'bat', 'batattack');
}
Bat.prototype = Object.create(AnimatedMonster.prototype);
Bat.prototype.constructor = Bat;

Bat.prototype.InitProperties = function ()
{
    AnimatedMonster.prototype.InitProperties.call(this);

    this.monsterLevel = 1;
    this.health = 1;
    this.speed = 300
    this.astar = false;
}

