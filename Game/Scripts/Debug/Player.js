////
//  CLASS: Player
//  Player class, controlled by user input
////

function Player()
{
    this.Init();
}

Player.prototype.Init = function ()
{
    this.sprite = new Phaser.Sprite(game, 300, 300, 'player_large');
    game.physics.arcade.enable(this.sprite);
    groupActors.add(this.sprite);

    this.sprite.anchor.setTo(0.5, 0.6);
    this.sprite.object = this;
    this.sprite.body.setSize(24, 24, 0, 8);

    // shooting
    this.shootTimerInterval = 500; // milliseconds between attacks
    this.shootTimerFramerate = Math.floor(13 / (this.shootTimerInterval / 1000));
    this.shootDelayPercentage = 0.75;

    this.sprite.animations.add('up', [0, 1, 2, 3, 4, 5, 6, 7, 8], 20, true);
    this.sprite.animations.add('left', [9, 10, 11, 12, 13, 14, 15, 16, 17], 20, true);
    this.sprite.animations.add('down', [18, 19, 20, 21, 22, 23, 24, 25, 26], 20, true);
    this.sprite.animations.add('right', [27, 28, 29, 30, 31, 32, 33, 34, 35], 20, true);

    this.sprite.animations.add('shootup', [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48], this.shootTimerFramerate, false);
    this.sprite.animations.add('shootleft', [49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61], this.shootTimerFramerate, false);
    this.sprite.animations.add('shootdown', [62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74], this.shootTimerFramerate, false);
    this.sprite.animations.add('shootright', [75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87], this.shootTimerFramerate, false);

    this.sprite.animations.add('death', [88, 89, 90, 91, 92, 93], 2, false);

    this.sprite.animations.add('slashup', [94, 95, 96, 97, 98, 99], 20, false);
    this.sprite.animations.add('slashleft', [100, 101, 102, 103, 104, 105], 20, false);
    this.sprite.animations.add('slashdown', [106, 107, 108, 109, 110, 111], 20, false);
    this.sprite.animations.add('slashright', [112, 113, 114, 115, 116, 117], 20, false);
    
    this.instantTransition = true; // When player spawns, camera transition should be instant
    
    this.speed = 200;

    this.health = 12;
    this.maxHealth = 12;

    this.coins = 0;
    
    this.inventory = [];
    
    this.melee = true;

    // set up shooting
    this.shootTimerNext = game.time.now;
    this.bullets = groupActors.add(new Phaser.Group(game, groupActors));
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(50, 'arrow');
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);

    // set up melee
    this.slashTimerNext = game.time.now;
    this.slashTimerInterval = 500; // milliseconds between attacks
    this.playerMeleeAttack = new PlayerMeleeAttack(0, 0)
    

    this.lastQ = false;

    this.currentRoom = new Vector();
    this.previousRoom = new Vector();
}

Player.prototype.TakeDamage = function (damage)
{
    this.health -= damage;

    hud.Update();

    if (this.health <= 0)
    {

    }
}

Player.prototype.Heal = function (amount)
{
    this.health += amount;
    
    if (this.health > this.maxHealth)
    {
        this.health = this.maxHealth;
    }

    hud.Update();
}

Player.prototype.AddCoins = function (amount)
{
    this.coins += amount;
    hud.Update();
}

Player.prototype.Update = function ()
{
    game.physics.arcade.collide(this.sprite, groupDungeonWalls);
    game.physics.arcade.collide(this.sprite, groupUnderBlockLayer, this.TouchDoor, null, this);
    game.physics.arcade.overlap(this.sprite, groupPickupItems, this.PickUpItem, null, this);
    game.physics.arcade.overlap(this.sprite, groupLevelEntities, this.HandleLevelEntities, null, this);
    game.physics.arcade.overlap(this.bullets, groupActors, this.PlayerHitActor, null, this);
    game.physics.arcade.overlap(this.sprite, groupMonsterProjectiles, this.MonsterProjHitPlayer, null, this);
    game.physics.arcade.overlap(groupActors, groupPlayerProjectiles, this.PlayerProjHitMonster, null, this);
    game.physics.arcade.overlap(this.bullets, groupDungeonWalls, this.BulletHitTerrain, null, this);
    // TODO: Chuck all this out somewhere else?

    var v = new Vector(0, 0);

    if (gameManager.movementEnabled)
    {
        this.CheckRoom();
    
        if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT) || game.input.keyboard.isDown(Phaser.Keyboard.A))
        {
            v.x = -1;
        }
        else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) || game.input.keyboard.isDown(Phaser.Keyboard.D))
        {
            v.x = 1;
        }

        if (game.input.keyboard.isDown(Phaser.Keyboard.UP) || game.input.keyboard.isDown(Phaser.Keyboard.W))
        {
            v.y = -1;
        }
        else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN) || game.input.keyboard.isDown(Phaser.Keyboard.S))
        {
            v.y = 1;
        }

        // Choose animation
        if (this.IsNotAttacking())
        {
            if (v.y == 0 && v.x == 0)
            {
                this.sprite.animations.stop(null, true);
            }
            else if (v.y > 0)
            {
                this.sprite.animations.play('down');
            }
            else if (v.y < 0)
            {
                this.sprite.animations.play('up');
            }
            else if (v.x > 0)
            {
                this.sprite.animations.play('right');
            }
            else if (v.x < 0)
            {
                this.sprite.animations.play('left');
            }
        }
    
        if (game.input.activePointer.isDown)
        {
            if (this.melee)
            {
                this.Slash();
            }
            else
            {
                this.Shoot();
            }
        }

        if (game.input.keyboard.isDown(Phaser.Keyboard.Q) && !this.lastQ)
        {
            this.SwitchWeapon();
        }
    }

    this.lastQ = game.input.keyboard.isDown(Phaser.Keyboard.Q);

    v = v.UnitVector();

    this.sprite.body.velocity.x = v.x * this.speed;
    this.sprite.body.velocity.y = v.y * this.speed;


    this.playerMeleeAttack.Update(this.sprite.x, this.sprite.y);
}

Player.prototype.IsNotAttacking = function ()
{
    return (this.slashTimerNext < game.time.now && this.shootTimerNext < game.time.now);
}

Player.prototype.SwitchWeapon = function ()
{
    if (this.IsNotAttacking())
    {
        this.melee = !this.melee;
        hud.Update();
    }
}

Player.prototype.CheckRoom = function ()
{
    var roomSize = gameManager.tileSize * gameManager.roomSize;
    
    this.previousRoom.x = this.currentRoom.x;
    this.previousRoom.y = this.currentRoom.y;
    
    this.currentRoom.x = Math.floor(this.sprite.x / roomSize);
    this.currentRoom.y = Math.floor(this.sprite.y / roomSize);
    
    if (!this.currentRoom.Equals(this.previousRoom))
    {
        gameManager.RoomChanged(this.currentRoom, this.instantTransition);
        this.instantTransition = false;
    }
}

Player.prototype.SetStartPosition = function (x, y)
{
    this.sprite.x = x;
    this.sprite.y = y;
}

Player.prototype.Slash = function ()
{
    if (game.time.now > this.slashTimerNext)
    {
        this.slashTimerNext = game.time.now + this.slashTimerInterval;
        this.playerMeleeAttack.ResetProjectiles(true, this.sprite.x, this.sprite.y);
    }
}

Player.prototype.Shoot = function ()
{
    if (game.time.now > this.shootTimerNext)
    {
        this.shootTimerNext = game.time.now + this.shootTimerInterval;

        var that = this;

        var pointer = game.input.activePointer;
        var pX = pointer.worldX;
        var pY = pointer.worldY;
        var angleToMouse = (new Vector(pX - player.sprite.x, pY - player.sprite.y)).Angle(true);
        var anim = 'right';
        if (angleToMouse > 45)
            anim = 'down';
        if (angleToMouse > 135)
            anim = 'left';
        if (angleToMouse > 225)
            anim = 'up';
        if (angleToMouse > 315)
            anim = 'right';

        setTimeout(function ()
        {
            var bullet = that.bullets.getFirstDead();
            bullet.reset(that.sprite.x, that.sprite.y - 10);
            bullet.body.setSize(4, 4, 0, 0);
            bullet.angle = angleToMouse;
            game.physics.arcade.moveToXY(bullet, pX, pY, 750);
        }, this.shootTimerInterval * this.shootDelayPercentage);

        player.sprite.animations.play('shoot' + anim);
    }
}

Player.prototype.AddToInventory = function (item)
{
    this.inventory.push(item);
    hud.Update();
}

Player.prototype.RemoveFromInventory = function (i)
{
    this.inventory.removeAt(i);
    hud.Update();
}


// Player collisions

Player.prototype.PickUpItem = function (player, pickupItem)
{
    pickupItem.object.PickUp();
}

Player.prototype.TouchDoor = function (player, door)
{
    for (var i = 0; i < player.object.inventory.length; i++)
    {
        var item = player.object.inventory[i];

        if (item instanceof Key && door.object && door.object instanceof Door && item.keyType == door.object.lock)
        {
            door.object.Unlock();
            player.object.RemoveFromInventory(i);
            return;
        }
    }
}

Player.prototype.HandleLevelEntities = function (player, levelEntity)
{
    if (levelEntity.object && levelEntity.object instanceof LevelExit)
    {
        gameManager.AdvanceLevel();
    }
}

// Bullet collisions

Player.prototype.PlayerHitActor = function (bullet, actor)
{
    if (actor.object && actor.object instanceof Monster)
    {
        actor.object.TakeDamage(2);
        bullet.kill();
    }
}

Player.prototype.BulletHitTerrain = function (bullet, terrain)
{
    bullet.kill();
}

// Enemy hits player

Player.prototype.MonsterProjHitPlayer = function (player, monsterProj)
{
    if (monsterProj.object && monsterProj.object instanceof MonsterAttack)
    {
        var monsterAttack = monsterProj.object;

        if (monsterAttack.active)
        {
            monsterAttack.ResetProjectiles(false, 0, 0);
            player.object.TakeDamage(monsterAttack.damage);
        }
    }
}

// Player hits enemy with melee

Player.prototype.PlayerProjHitMonster = function (actor, playerProj)
{
    if (actor.object && actor.object instanceof Monster && playerProj.object && playerProj.object instanceof PlayerMeleeAttack)
    {
        var playerMeleeAttack = playerProj.object;

        if (playerMeleeAttack.active)
        {
            playerMeleeAttack.HitMonster(actor.object);
        }
    }
}

function PlayerMeleeAttack(x, y, projsize)
{
    this.projectiles = []; // Storage for projectiles which are used in this attack
    this.projectileSize = projsize || 8;

    this.active = false;

    this.alreadyHitMonsters = [];

    this.attackStartTime = game.time.now;
    this.attackEndTime = game.time.now;
    this.startAngle = 0;
    this.attacking = false;
    this.clockwise = false;

    // Properties - Alter these in base class
    this.attackTime = 200;
    this.amountOfProjectiles = 6;
    this.slashLength = 45;
    this.startLength = 10;
    this.arcAngle = Math.PI / 1.5;
    this.damage = 4;
    this.height = 15;
}

PlayerMeleeAttack.prototype.HitMonster = function (monster)
{
    var alreadyHit = false;

    for (var i = 0; i < this.alreadyHitMonsters.length; i++)
    {
        if (this.alreadyHitMonsters[i] === monster)
        {
            alreadyHit = true;
            break;
        }
    }

    if (!alreadyHit)
    {
        this.alreadyHitMonsters.push(monster);
        monster.KnockBack(1000);
        monster.TakeDamage(this.damage);
    }
}

PlayerMeleeAttack.prototype.Update = function (x, y)
{
    y -= this.height;
    
    if (game.time.now > this.attackEndTime)
    {
        if (this.attacking)
        {
            this.attacking = false;
            this.ResetProjectiles(false, 0, 0)
        }
        return;
    }

    var percentAttack = (game.time.now - this.attackStartTime) / this.attackTime;

    var swordAngle;
    if (this.clockwise)
    {
        swordAngle = this.startAngle + (this.arcAngle * percentAttack); // Do minus for other direction
    }
    else
    {
        swordAngle = this.startAngle - (this.arcAngle * percentAttack);
    }

    for (var i = 0; i < this.amountOfProjectiles; i++)
    {
        var l = i / (this.amountOfProjectiles - 1) * this.slashLength + this.startLength;
        this.projectiles[i].x = x + l * Math.cos(swordAngle);
        this.projectiles[i].y = y + l * Math.sin(swordAngle);
    }
}

PlayerMeleeAttack.prototype.ResetProjectiles = function (alive, x, y)
{
    y -= this.height;
    this.active = alive;
    this.alreadyHitMonsters.empty();

    // If projectiles do not exist, make them exist
    if (this.projectiles.length < this.amountOfProjectiles)
    {
        for (var i = 0; i < this.amountOfProjectiles; i++)
        {
            var projectile = groupPlayerProjectiles.create(x, y, 'block' + this.projectileSize);
            projectile.object = this;
            projectile.anchor.setTo(0.5, 0.5);
            this.projectiles.push(projectile);
        }
    }

    var pointer = game.input.activePointer;
    var angleToMouse = (new Vector(pointer.worldX - player.sprite.x, pointer.worldY - player.sprite.y)).Angle();

    if (alive)
    {
        // Snap angle and figure out which animation to use
        var angleDegrees = angleToMouse / Math.PI * 180;

        var anim = 'right';
        angleToMouse = 0;
        if (angleDegrees > 45)
        {
            anim = 'down';
            angleToMouse = Math.PI / 2;
            this.clockwise = false;
        }
        if (angleDegrees > 135)
        {
            anim = 'left';
            angleToMouse = Math.PI;
            this.clockwise = true;
        }
        if (angleDegrees > 225)
        {
            anim = 'up';
            angleToMouse = Math.PI * 1.5;
            this.clockwise = true;
        }
        if (angleDegrees > 315)
        {
            anim = 'right';
            angleToMouse = 0;
            this.clockwise = false;
        }

        this.attackStartTime = game.time.now;
        this.attackEndTime = this.attackStartTime + this.attackTime;

        if (this.clockwise)
        {
            this.startAngle = angleToMouse - (this.arcAngle / 2); // Do plus for other direction
        }
        else
        {
            this.startAngle = angleToMouse + (this.arcAngle / 2);
        }

        for (var i = 0; i < this.amountOfProjectiles; i++)
        {
            this.projectiles[i].exists = true;
            var l = i / (this.amountOfProjectiles - 1) * this.slashLength + this.startLength;
            this.projectiles[i].x = x + l * Math.cos(this.startAngle);
            this.projectiles[i].y = y + l * Math.sin(this.startAngle);
        }

        player.sprite.animations.play('slash' + anim);

        this.attacking = true;
    }
    else
    {
        for (var i = 0; i < this.amountOfProjectiles; i++)
        {
            this.projectiles[i].exists = false;
        }
    }
}
