////
//  CLASS: MonsterAttack
//  Used as a base class for monsters attack abilities
////

function MonsterAttack(x, y, image, projsize)
{
    this.image = image; // Image to show for the attack, can be blank for no image
    this.projectiles = []; // Storage for projectiles which are used in this attack
    this.projectileSize = projsize || 8;

    this.active = false;

    this.position = new Vector(x, y);

    this.InitProperties();

    if (this.image)
    {
        this.InitSprite(x, y);
    }
}

MonsterAttack.prototype.InitProperties = function ()
{
    this.amountOfProjectiles = 9;
    this.coneAngle = Math.PI / 2;
    this.projectileSpeed = 125;
    this.projectileStartDistance = 16;
    this.damage = 1;
}

MonsterAttack.prototype.InitSprite = function (x, y)
{
    this.sprite = groupActors.create(x, y, this.image);
    this.sprite.anchor.setTo(0.5, 0.5);
    this.sprite.object = this;

    this.sprite.animations.add('attack');
}

MonsterAttack.prototype.ResetProjectiles = function (alive, x, y)
{
    this.active = alive;
    // If projectiles do not exist, make them exist
    if (this.projectiles.length < this.amountOfProjectiles)
    {
        for (var i = 0; i < this.amountOfProjectiles; i++)
        {
            var projectile = groupMonsterProjectiles.create(x, y, 'block' + this.projectileSize);
            projectile.object = this;
            projectile.anchor.setTo(0.5, 0.5);
            this.projectiles.push(projectile);
        }
    }

    var angleToTarget = (new Vector(player.sprite.x - x, player.sprite.y - y)).Angle();

    if (alive)
    {
        for (var i = 0; i < this.amountOfProjectiles; i++)
        {
            this.projectiles[i].exists = true;
            this.projectiles[i].x = x + this.projectileStartDistance * Math.cos(angleOfProjectile);
            this.projectiles[i].y = y + this.projectileStartDistance * Math.sin(angleOfProjectile);

            var angleOfProjectile = angleToTarget + ((((i + 0.5) / this.amountOfProjectiles) - 0.5) * this.coneAngle);

            this.projectiles[i].body.velocity.x = this.projectileSpeed * Math.cos(angleOfProjectile);
            this.projectiles[i].body.velocity.y = this.projectileSpeed * Math.sin(angleOfProjectile);
        }

        this.sprite.visible = true;
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.animations.play('attack', 20);
        this.sprite.angle = angleToTarget * 180 / Math.PI;
    }
    else
    {
        for (var i = 0; i < this.amountOfProjectiles; i++)
        {
            this.projectiles[i].body.velocity.x = 0;
            this.projectiles[i].body.velocity.y = 0;
            this.projectiles[i].exists = false;
        }

        this.sprite.animations.stop('attack', true); // reset attack animation back to 0

        this.sprite.visible = false;
    }
}

