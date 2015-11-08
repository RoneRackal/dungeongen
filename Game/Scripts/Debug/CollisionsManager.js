
function CollisionsManager()
{
    
}

CollisionsManager.prototype.CheckCollisions = function ()
{
    game.physics.arcade.collide(player.sprite, groupDungeonWalls);

    // Player
    game.physics.arcade.collide(player.sprite, groupUnderBlockLayer, this.Player_x_Door, null, this);
    game.physics.arcade.overlap(player.sprite, groupPickupItems, this.Player_x_Item, null, this);
    game.physics.arcade.overlap(player.sprite, groupLevelEntities, this.Player_x_LevelEntity, null, this);
    game.physics.arcade.overlap(player.sprite, groupMonsterProjectiles, this.Player_x_MonsterProjectile, null, this);

    // Player attacks
    game.physics.arcade.overlap(player.bullets, groupDungeonWalls, this.PlayerBullet_x_Wall, null, this);
    game.physics.arcade.overlap(player.bullets, groupActors, this.PlayerBullet_x_Actor, null, this);
    game.physics.arcade.overlap(groupPlayerProjectiles, groupActors, this.PlayerMelee_x_Actor, null, this);
}


// Player collides with a door
CollisionsManager.prototype.Player_x_Door = function (player, door)
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

// Player collides with a pickup item
CollisionsManager.prototype.Player_x_Item = function (player, pickupItem)
{
    pickupItem.object.PickUp();
}

// Player collides with a level entity
CollisionsManager.prototype.Player_x_LevelEntity = function (player, levelEntity)
{
    // If the level entity is the 'next level' trigger
    if (levelEntity.object && levelEntity.object instanceof LevelExit)
    {
        gameManager.AdvanceLevel();
    }
}

// Player collides with a monster's projectile
CollisionsManager.prototype.Player_x_MonsterProjectile = function (player, monsterProj)
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

// Player bullet colliding with a wall or terrain piece
CollisionsManager.prototype.PlayerBullet_x_Wall = function (bullet, terrain)
{
    bullet.kill();
}

// Player bullet colliding with another actor
CollisionsManager.prototype.PlayerBullet_x_Actor = function (bullet, actor)
{
    if (actor.object && actor.object instanceof Monster)
    {
        actor.object.TakeDamage(2);
        bullet.kill();
    }
}

// Player melee attack colliding with another actor
CollisionsManager.prototype.PlayerMelee_x_Actor = function (playerProj, actor)
{
    // Make sure other actor is a Monster
    if (actor.object && actor.object instanceof Monster && playerProj.object && playerProj.object instanceof PlayerMeleeAttack)
    {
        var playerMeleeAttack = playerProj.object;

        if (playerMeleeAttack.active)
        {
            playerMeleeAttack.HitMonster(actor.object);
        }
    }
}

