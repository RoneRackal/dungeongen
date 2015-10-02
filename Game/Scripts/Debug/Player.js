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
    this.sprite = new Phaser.Sprite(game, 300, 300, 'player_base');
    game.physics.arcade.enable(this.sprite);
    groupActors.add(this.sprite);

    this.sprite.anchor.setTo(0.5, 0.75);
    this.sprite.object = this;
    this.sprite.body.setSize(24, 24, 0, 8);

    this.sprite.animations.add('up', [0, 1, 2, 3, 4, 5, 6, 7, 8], 20, true);
    this.sprite.animations.add('left', [9, 10, 11, 12, 13, 14, 15, 16, 17], 20, true);
    this.sprite.animations.add('down', [18, 19, 20, 21, 22, 23, 24, 25, 26], 20, true);
    this.sprite.animations.add('right', [27, 28, 29, 30, 31, 32, 33, 34, 35], 20, true);

    this.sprite.animations.add('slashup', [36, 37, 38, 39, 40, 41], 20, false);
    this.sprite.animations.add('slashleft', [42, 43, 44, 45, 46, 47], 20, false);
    this.sprite.animations.add('slashdown', [48, 49, 50, 51, 52, 53], 20, false);
    this.sprite.animations.add('slashright', [54, 55, 56, 57, 58, 59], 20, false);

    this.sprite.animations.add('castup', [60, 61, 62, 63, 64, 65, 66], 14, false);
    this.sprite.animations.add('castleft', [67, 68, 69, 70, 71, 72, 73], 14, false);
    this.sprite.animations.add('castdown', [74, 75, 76, 77, 78, 79, 80], 14, false);
    this.sprite.animations.add('castright', [81, 82, 83, 84, 85, 86, 87], 14, false);
    
    this.instantTransition = true; // When player spawns, camera transition should be instant
    
    this.speed = 200;//200;

    this.health = 12;
    this.maxHealth = 12;

    this.coins = 0;
    
    this.inventory = [];
    
    this.melee = true;

    // set up shooting
    this.shootTimerNext = game.time.now;
    this.shootTimerInterval = 500; // milliseconds between attacks
    this.bullets = groupActors.add(new Phaser.Group(game, groupActors));
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(50, 'fireball');

    // set up melee
    this.slashTimerNext = game.time.now;
    this.slashTimerInterval = 500; // milliseconds between attacks
    this.playerMeleeAttack = new PlayerMeleeAttack(0, 0, 'swordattack')
    

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
        var bullet = this.bullets.getFirstDead();
        bullet.reset(this.sprite.x, this.sprite.y);
        bullet.anchor.setTo(0.5, 0.5);
        game.physics.arcade.moveToPointer(bullet, 750);

        var pointer = game.input.activePointer;
        var angleToMouse = (new Vector(pointer.worldX - player.sprite.x, pointer.worldY - player.sprite.y)).Angle(true);
        var anim = 'right';
        if (angleToMouse > 45)
            anim = 'down';
        if (angleToMouse > 135)
            anim = 'left';
        if (angleToMouse > 225)
            anim = 'up';
        if (angleToMouse > 315)
            anim = 'right';

        player.sprite.animations.play('cast' + anim);
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

function PlayerMeleeAttack(x, y, image, projsize)
{
    this.image = image; // Image to show for the attack, can be blank for no image
    this.projectiles = []; // Storage for projectiles which are used in this attack
    this.projectileSize = projsize || 8;

    this.active = false;

    this.position = new Vector(x, y);

    this.alreadyHitMonsters = [];

    this.attackStartTime = game.time.now;
    this.attackEndTime = game.time.now;
    this.startAngle = 0;

    // Properties - Alter these in base class
    this.attackTime = 200;
    this.amountOfProjectiles = 6;
    this.slashLength = 45;
    this.startLength = 10;
    this.arcAngle = Math.PI / 1.5;
    this.damage = 4;

    if (this.image)
    {
        this.InitSprite(x, y);
    }
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

PlayerMeleeAttack.prototype.InitSprite = function (x, y)
{
    this.sprite = groupActors.create(x, y, this.image);
    this.sprite.anchor.setTo(0.5, 0.5);
    this.sprite.object = this;
}

PlayerMeleeAttack.prototype.Update = function (x, y)
{
    if (game.time.now > this.attackEndTime)
    {
        this.ResetProjectiles(false, 0, 0)
        return;
    }

    var percentAttack = (game.time.now - this.attackStartTime) / this.attackTime;
    var swordAngle = this.startAngle + (this.arcAngle * percentAttack); // Do minus for other direction

    this.sprite.angle = swordAngle * 180 / Math.PI;
    this.sprite.x = x;
    this.sprite.y = y;

    for (var i = 0; i < this.amountOfProjectiles; i++)
    {
        var l = i / (this.amountOfProjectiles - 1) * this.slashLength + this.startLength;
        this.projectiles[i].x = x + l * Math.cos(swordAngle);
        this.projectiles[i].y = y + l * Math.sin(swordAngle);
    }
}

PlayerMeleeAttack.prototype.ResetProjectiles = function (alive, x, y)
{
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
        this.attackStartTime = game.time.now;
        this.attackEndTime = this.attackStartTime + this.attackTime;
        this.startAngle = angleToMouse - (this.arcAngle / 2); // Do plus for other direction

        for (var i = 0; i < this.amountOfProjectiles; i++)
        {
            this.projectiles[i].exists = true;
            var l = i / (this.amountOfProjectiles - 1) * this.slashLength + this.startLength;
            this.projectiles[i].x = x + l * Math.cos(this.startAngle);
            this.projectiles[i].y = y + l * Math.sin(this.startAngle);
        }

        this.sprite.angle = this.startAngle * 180 / Math.PI;
        this.sprite.visible = true;
        this.sprite.x = x;
        this.sprite.y = y;

        var angleDegrees = angleToMouse / Math.PI * 180;
        var anim = 'right';
        if (angleDegrees > 45)
            anim = 'down';
        if (angleDegrees > 135)
            anim = 'left';
        if (angleDegrees > 225)
            anim = 'up';
        if (angleDegrees > 315)
            anim = 'right';

        player.sprite.animations.play('slash' + anim);
    }
    else
    {
        for (var i = 0; i < this.amountOfProjectiles; i++)
        {
            this.projectiles[i].exists = false;
        }

        this.sprite.visible = false;
    }
}
